-- Table « keepalive » : une seule ligne, lue chaque jour par
-- .github/workflows/keepalive.yml et par un moniteur externe (README §12).
-- Une lecture PostgREST compte comme de l'activité pour Supabase, qui met en
-- pause les projets du plan Free après 7 jours sans requête API — les appels
-- à la fonction gemini-fit, eux, ne comptent pas. Lecture seule pour la clé
-- anon : rien à écrire, rien à voler.
create table if not exists public.keepalive (
  id smallint primary key default 1,
  note text not null default 'lue chaque jour pour garder le projet Supabase actif (README §12)',
  constraint keepalive_une_seule_ligne check (id = 1)
);

insert into public.keepalive (id) values (1) on conflict (id) do nothing;

alter table public.keepalive enable row level security;

drop policy if exists "keepalive : lecture anon" on public.keepalive;
create policy "keepalive : lecture anon" on public.keepalive
  for select to anon, authenticated using (true);

revoke insert, update, delete, truncate, references, trigger on public.keepalive from anon, authenticated;
grant select on public.keepalive to anon, authenticated;
