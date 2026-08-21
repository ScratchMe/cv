// supabase/functions/gemini-fit/index.ts
//
// ⚠️  CE FICHIER SE DÉPLOIE SUR SUPABASE (Deno Edge Function) — ce n'est PAS
//     un fichier du site. Ne colle jamais le contenu de js/gemini.js ici (ni
//     l'inverse) : js/gemini.js tourne dans le navigateur et utilise `window`,
//     qui n'existe pas dans l'environnement Deno de Supabase — ça fait
//     planter la fonction avec une erreur du type
//     "Cannot destructure property 't' of 'window.i18n' as it is undefined."
//
// Reçoit { cvContext, jobPosting, lang } depuis le site, appelle l'API Gemini
// avec la clé stockée en secret côté serveur, et renvoie un JSON structuré au
// front-end. La clé Gemini n'est JAMAIS exposée au navigateur.
//
// Déploiement : voir README.md, section "Sécuriser l'appel à Gemini".

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { Ratelimit } from "npm:@upstash/ratelimit@^2";
import { Redis } from "npm:@upstash/redis@^1";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

// Liste de modèles essayés dans l'ordre — si un modèle est surchargé,
// indisponible, ou n'existe plus (déprécié), on passe automatiquement au
// suivant. Vérifiée au 21 août 2026 :
// - gemini-3.7-flash / 3.6 / 3.5 : versions figées, comportement prévisible.
// - gemini-flash-latest : alias officiel maintenu par Google, "hot-swappé"
//   automatiquement vers le modèle Flash recommandé du moment (voir
//   https://ai.google.dev/gemini-api/docs/models). Sert de filet de sécurité
//   ultime : même si les 3 noms fixes ci-dessus deviennent tous obsolètes un
//   jour, cette dernière entrée continuera de fonctionner sans qu'on ait à
//   toucher au code.
const GEMINI_MODEL_CANDIDATES = ["gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-flash-latest"];

// Autorise uniquement ton site à appeler cette fonction (CORS).
const ALLOWED_ORIGIN = "https://cv.antoine.berthaud.me";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// --- Rate limiting (Upstash Redis) --------------------------------------
// Protège contre le spam de ta fonction (et donc de ton quota Gemini) par
// une seule adresse IP. Basé sur l'exemple officiel Supabase :
// https://supabase.com/docs/guides/functions/examples/rate-limiting
//
// Entièrement OPTIONNEL et sans danger si tu ne configures rien : si les
// secrets UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN ne sont pas
// définis (ou si l'initialisation échoue pour une autre raison), le rate
// limiting est simplement désactivé — la fonction continue de marcher
// normalement. C'est volontaire : après le bug de déploiement précédent, on
// évite à tout prix qu'une dépendance optionnelle mal configurée puisse
// faire planter la fonction entière au démarrage.
let ratelimit: Ratelimit | null = null;
try {
  const url = Deno.env.get("UPSTASH_REDIS_REST_URL");
  const token = Deno.env.get("UPSTASH_REDIS_REST_TOKEN");
  if (url && token) {
    ratelimit = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(5, "60 s"), // 5 analyses / minute / IP
      analytics: true,
      prefix: "cv-gemini-fit",
    });
  }
} catch (_err) {
  ratelimit = null;
}

function buildPrompt(cvContext: string, jobPosting: string, lang: string): string {
  const languageInstruction =
    lang === "en"
      ? "Answer entirely in English (explanation, strengths, gaps, interview question)."
      : "Réponds entièrement en français (explication, points forts, points de vigilance, question d'entretien).";

  return `Tu es un expert senior en recrutement Product Management, avec quinze ans d'expérience à évaluer des candidatures PM. Analyse la compatibilité entre le profil ci-dessous et l'offre d'emploi fournie par l'utilisateur. Sois rigoureux, factuel, et évite la complaisance : si le fit est moyen ou faible, dis-le clairement. ${languageInstruction}

Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ou après, sans balises markdown, respectant exactement ce schéma (les clés restent en anglais, seul le CONTENU des valeurs textuelles doit être dans la langue demandée ci-dessus) :
{
  "score": <nombre entier entre 0 et 100>,
  "explanation": "<2 phrases maximum résumant le fit global>",
  "strengths": ["<point 1>", "<point 2>", "<point 3>"],
  "gaps": ["<point 1>", "<point 2>"],
  "interviewQuestion": "<une question d'entretien pertinente que le recruteur pourrait poser>"
}

--- PROFIL DU CANDIDAT ---
${cvContext}

--- OFFRE D'EMPLOI FOURNIE PAR LE RECRUTEUR ---
${jobPosting}`;
}

function extractJson(text: string) {
  // Gemini répond parfois avec des ```json ... ``` malgré la consigne : on nettoie.
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

// Essaie chaque modèle de GEMINI_MODEL_CANDIDATES dans l'ordre. Ne passe au
// suivant que pour des erreurs qui justifient de réessayer avec un autre
// modèle (surcharge, indisponibilité temporaire, modèle introuvable/déprécié) :
// une erreur de requête (400, prompt malformé) est la même quel que soit le
// modèle, donc on ne boucle pas inutilement dans ce cas-là.
async function callGeminiWithFallback(prompt: string): Promise<{ data: any; modelUsed: string }> {
  const RETRIABLE_STATUSES = [404, 429, 500, 503];
  let lastError = "";

  for (const model of GEMINI_MODEL_CANDIDATES) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, responseMimeType: "application/json" },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        console.log(`gemini-fit: succès avec le modèle ${model}`);
        return { data, modelUsed: model };
      }

      if (RETRIABLE_STATUSES.includes(res.status)) {
        lastError = `${model} → HTTP ${res.status}`;
        console.log(`gemini-fit: ${lastError}, tentative avec le modèle suivant`);
        continue;
      }

      // Erreur non-retriable (ex: 400 mauvaise requête) : inutile d'essayer
      // un autre modèle, le problème vient de la requête elle-même.
      const errText = await res.text();
      throw new Error(`Erreur API Gemini (${res.status}) : ${errText}`);
    } catch (err) {
      lastError = `${model} → ${err.message}`;
      continue;
    }
  }

  throw new Error(`Tous les modèles Gemini disponibles ont échoué. Dernière erreur : ${lastError}`);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (ratelimit) {
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      const { success, limit, remaining, reset } = await ratelimit.limit(ip);
      if (!success) {
        return new Response(
          JSON.stringify({
            error: "Trop de requêtes depuis cette adresse IP. Réessaie dans quelques instants.",
            limit,
            remaining,
            reset,
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY n'est pas configurée côté serveur (supabase secrets set).");
    }

    const { cvContext, jobPosting, lang } = await req.json();
    if (!cvContext || !jobPosting) {
      return new Response(JSON.stringify({ error: "cvContext et jobPosting sont requis." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = buildPrompt(cvContext, jobPosting, lang === "en" ? "en" : "fr");

    const { data: geminiData } = await callGeminiWithFallback(prompt);
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const parsed = extractJson(rawText);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
