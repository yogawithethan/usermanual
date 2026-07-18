alter type public.media_kind add value if not exists 'image';

create table if not exists public.tutorial_levels (
  id uuid primary key default gen_random_uuid(),
  product_slug public.product_slug not null references public.products(slug) default 'the-user-manual',
  level_number integer not null check (level_number > 0),
  title text not null,
  subtitle text,
  hero text not null,
  vimeo_id text,
  icon_path text,
  theme jsonb not null default '{}'::jsonb,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_slug, level_number)
);

create table if not exists public.tutorial_sections (
  id uuid primary key default gen_random_uuid(),
  tutorial_level_id uuid not null references public.tutorial_levels(id) on delete cascade,
  slug text not null,
  title text not null,
  paragraphs jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tutorial_level_id, slug)
);

create table if not exists public.tutorial_media_blocks (
  id uuid primary key default gen_random_uuid(),
  tutorial_level_id uuid not null references public.tutorial_levels(id) on delete cascade,
  slug text not null,
  media_kind public.media_kind not null,
  title text,
  caption_top text,
  caption_bottom text,
  asset_url text,
  storage_bucket text,
  storage_path text,
  alt_text text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tutorial_level_id, slug)
);

create table if not exists public.tutorial_footnotes (
  id uuid primary key default gen_random_uuid(),
  tutorial_level_id uuid not null references public.tutorial_levels(id) on delete cascade,
  slug text not null,
  body text not null,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tutorial_level_id, slug)
);

create table if not exists public.tutorial_checklist_items (
  id uuid primary key default gen_random_uuid(),
  tutorial_level_id uuid not null references public.tutorial_levels(id) on delete cascade,
  body text not null,
  is_complete_by_default boolean not null default false,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tutorial_faqs (
  id uuid primary key default gen_random_uuid(),
  tutorial_level_id uuid references public.tutorial_levels(id) on delete cascade,
  product_slug public.product_slug not null references public.products(slug) default 'the-user-manual',
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_downloads (
  id uuid primary key default gen_random_uuid(),
  product_slug public.product_slug not null references public.products(slug) default 'the-user-manual',
  tutorial_level_id uuid references public.tutorial_levels(id) on delete set null,
  title text not null,
  description text,
  file_url text,
  storage_bucket text,
  storage_path text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tutorial_levels_published_idx
on public.tutorial_levels (product_slug, level_number)
where is_published = true;

create index if not exists tutorial_sections_level_order_idx
on public.tutorial_sections (tutorial_level_id, sort_order)
where is_published = true;

create index if not exists tutorial_media_blocks_level_order_idx
on public.tutorial_media_blocks (tutorial_level_id, sort_order)
where is_published = true;

create index if not exists tutorial_footnotes_level_order_idx
on public.tutorial_footnotes (tutorial_level_id, sort_order)
where is_published = true;

create index if not exists tutorial_checklist_items_level_order_idx
on public.tutorial_checklist_items (tutorial_level_id, sort_order)
where is_published = true;

create index if not exists tutorial_faqs_level_order_idx
on public.tutorial_faqs (tutorial_level_id, sort_order)
where is_published = true;

create index if not exists product_downloads_product_order_idx
on public.product_downloads (product_slug, sort_order)
where is_published = true;

create trigger tutorial_levels_set_updated_at
before update on public.tutorial_levels
for each row execute function public.set_updated_at();

create trigger tutorial_sections_set_updated_at
before update on public.tutorial_sections
for each row execute function public.set_updated_at();

create trigger tutorial_media_blocks_set_updated_at
before update on public.tutorial_media_blocks
for each row execute function public.set_updated_at();

create trigger tutorial_footnotes_set_updated_at
before update on public.tutorial_footnotes
for each row execute function public.set_updated_at();

create trigger tutorial_checklist_items_set_updated_at
before update on public.tutorial_checklist_items
for each row execute function public.set_updated_at();

create trigger tutorial_faqs_set_updated_at
before update on public.tutorial_faqs
for each row execute function public.set_updated_at();

create trigger product_downloads_set_updated_at
before update on public.product_downloads
for each row execute function public.set_updated_at();

alter table public.tutorial_levels enable row level security;
alter table public.tutorial_sections enable row level security;
alter table public.tutorial_media_blocks enable row level security;
alter table public.tutorial_footnotes enable row level security;
alter table public.tutorial_checklist_items enable row level security;
alter table public.tutorial_faqs enable row level security;
alter table public.product_downloads enable row level security;

create policy "Published tutorial levels are readable"
on public.tutorial_levels for select
to anon, authenticated
using (is_published = true);

create policy "Published tutorial sections are readable"
on public.tutorial_sections for select
to anon, authenticated
using (
  is_published = true
  and exists (
    select 1
    from public.tutorial_levels level
    where level.id = tutorial_sections.tutorial_level_id
      and level.is_published = true
  )
);

create policy "Published tutorial media is readable"
on public.tutorial_media_blocks for select
to anon, authenticated
using (
  is_published = true
  and exists (
    select 1
    from public.tutorial_levels level
    where level.id = tutorial_media_blocks.tutorial_level_id
      and level.is_published = true
  )
);

create policy "Published tutorial footnotes are readable"
on public.tutorial_footnotes for select
to anon, authenticated
using (
  is_published = true
  and exists (
    select 1
    from public.tutorial_levels level
    where level.id = tutorial_footnotes.tutorial_level_id
      and level.is_published = true
  )
);

create policy "Published tutorial checklist is readable"
on public.tutorial_checklist_items for select
to anon, authenticated
using (
  is_published = true
  and exists (
    select 1
    from public.tutorial_levels level
    where level.id = tutorial_checklist_items.tutorial_level_id
      and level.is_published = true
  )
);

create policy "Published tutorial FAQs are readable"
on public.tutorial_faqs for select
to anon, authenticated
using (
  is_published = true
  and (
    tutorial_level_id is null
    or exists (
      select 1
      from public.tutorial_levels level
      where level.id = tutorial_faqs.tutorial_level_id
        and level.is_published = true
    )
  )
);

create policy "Published downloads are readable"
on public.product_downloads for select
to anon, authenticated
using (is_published = true);
