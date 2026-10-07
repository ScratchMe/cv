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
// suivant. Vérifiée au 7 oct. 2026 :
// - gemini-3.8-flash / 3.7 / 3.6 / 3.5 : versions figées, comportement prévisible.
// - gemini-flash-latest : alias officiel maintenu par Google, "hot-swappé"
//   automatiquement vers le modèle Flash recommandé du moment (voir
//   https://ai.google.dev/gemini-api/docs/models). Sert de filet de sécurité
//   ultime : même si les 4 noms fixes ci-dessus deviennent tous obsolètes un
//   jour, cette dernière entrée continuera de fonctionner sans qu'on ait à
//   toucher au code.
const GEMINI_MODEL_CANDIDATES = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-flash-latest"];

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
      limiter: Ratelimit.slidingWindow(3, "60 s"), // 3 analyses / minute / IP
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

// Forme attendue de la réponse (JSON Schema, format de l'API Interactions).
// À garder alignée avec le schéma décrit dans buildPrompt() et avec ce que
// js/gemini.js affiche.
const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    score: { type: "integer" },
    explanation: { type: "string" },
    strengths: { type: "array", items: { type: "string" } },
    gaps: { type: "array", items: { type: "string" } },
    interviewQuestion: { type: "string" },
  },
  required: ["score", "explanation", "strengths", "gaps", "interviewQuestion"],
};

function extractJson(text: string) {
  // Gemini répond parfois avec des ```json ... ``` malgré la consigne : on nettoie.
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

// Erreur volontairement non-retriable (ex: 400 mauvaise requête) — voir plus
// bas. Un type dédié permet au `catch` de la distinguer d'une vraie erreur
// réseau (fetch qui échoue) et de la relancer immédiatement au lieu de
// continuer la boucle sur le modèle suivant.
class NonRetriableError extends Error {}

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
      // API Interactions (GA depuis 2026, generateContent est l'API legacy).
      // La clé passe dans un en-tête, plus dans l'URL.
      const res = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY! },
        body: JSON.stringify({
          model,
          input: prompt,
          // Par défaut Google conserve chaque échange (55 jours en payant)
          // pour enchaîner les conversations. Une analyse est sans suite, et
          // l'offre collée par le recruteur n'a pas à rester chez Google.
          store: false,
          // Schéma imposé à Gemini : la forme de la réponse est garantie
          // structurellement, plus seulement par la consigne du prompt
          // (on a vu des listes renvoyées en chaîne). Le front vérifie
          // encore le contenu avant affichage, mais ne devrait plus
          // jamais recevoir une forme inattendue.
          response_format: { type: "text", mime_type: "application/json", schema: RESPONSE_SCHEMA },
          // Pas de generation_config : ni temperature/top_p/top_k ni
          // thinking_budget (avis Google d'oct. 2026, erreur 400 sur les
          // prochains modèles), et thinking_level est omis pour garder le
          // défaut de chaque modèle — les niveaux acceptés varient, et un 400
          // arrête toute la liste de repli.
        }),
      });

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
      throw new NonRetriableError(`Erreur API Gemini (${res.status}) : ${errText}`);
    } catch (err) {
      if (err instanceof NonRetriableError) throw err;
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

    const { data: interaction } = await callGeminiWithFallback(prompt);
    // Le texte est dans les étapes "model_output" de l'interaction (les
    // étapes de réflexion du modèle sont d'un autre type et ignorées).
    const rawText = (interaction.steps ?? [])
      .filter((step: any) => step.type === "model_output")
      .flatMap((step: any) => step.content ?? [])
      .filter((part: any) => part.type === "text")
      .map((part: any) => part.text)
      .join("");
    if (!rawText) {
      // Réponse sans texte (filtre de sécurité, sortie tronquée...) : on
      // renvoie une vraie erreur plutôt qu'un "{}" que le site affichait
      // comme un score 0/100. Le détail va dans les logs de la fonction.
      console.error(
        "gemini-fit: réponse Gemini vide",
        JSON.stringify({ status: interaction.status, errors: interaction.errors })
      );
      throw new Error("Réponse Gemini vide");
    }
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
