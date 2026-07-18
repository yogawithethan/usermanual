create table if not exists public.practice_universe_sections (
  id uuid primary key default gen_random_uuid(),
  universe_slug text not null references public.practice_universes(slug) on delete cascade,
  slug text not null,
  title text not null,
  paragraphs jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (universe_slug, slug)
);

create index if not exists practice_universe_sections_order_idx
on public.practice_universe_sections (universe_slug, sort_order)
where is_published = true;

drop trigger if exists practice_universe_sections_set_updated_at on public.practice_universe_sections;
create trigger practice_universe_sections_set_updated_at
before update on public.practice_universe_sections
for each row execute function public.set_updated_at();

alter table public.practice_universe_sections enable row level security;

drop policy if exists "Published practice universe sections are readable" on public.practice_universe_sections;
create policy "Published practice universe sections are readable"
on public.practice_universe_sections for select
using (
  is_published = true
  and exists (
    select 1
    from public.practice_universes universe
    where universe.slug = practice_universe_sections.universe_slug
      and universe.product_slug = 'the-user-manual'
      and universe.is_published = true
  )
);

grant select on public.practice_universe_sections to anon, authenticated;
grant select, insert, update, delete on public.practice_universe_sections to service_role;
