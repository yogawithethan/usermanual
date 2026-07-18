create extension if not exists "pgcrypto";

create type public.product_slug as enum (
  'the-user-manual',
  'yoga-with-ethan',
  'yoga-immersion',
  'ignorance-is-not-bliss',
  'one-with-the-sun'
);

create type public.entitlement_source as enum (
  'stripe',
  'apple_iap',
  'manual',
  'grant',
  'migration'
);

create type public.entitlement_status as enum (
  'active',
  'expired',
  'revoked',
  'refunded'
);

create type public.progress_status as enum (
  'not_started',
  'in_progress',
  'completed'
);

create type public.media_kind as enum (
  'video',
  'audio',
  'text',
  'pdf'
);

create type public.teacher_application_status as enum (
  'draft',
  'submitted',
  'in_review',
  'approved',
  'rejected'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  timezone text,
  primary_goal text,
  onboarding_note text,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  slug public.product_slug primary key,
  name text not null,
  description text,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.product_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_slug public.product_slug not null references public.products(slug) on delete cascade,
  status public.entitlement_status not null default 'active',
  source public.entitlement_source not null,
  source_reference text,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_slug, source, source_reference)
);

create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_slug public.product_slug not null references public.products(slug),
  provider public.entitlement_source not null,
  provider_reference text not null,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'usd',
  purchased_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (provider, provider_reference)
);

create table public.tutorial_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_slug public.product_slug not null references public.products(slug) default 'the-user-manual',
  level_number integer not null check (level_number > 0),
  status public.progress_status not null default 'not_started',
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, product_slug, level_number)
);

create table public.practice_universes (
  slug text primary key,
  product_slug public.product_slug not null references public.products(slug) default 'the-user-manual',
  name text not null,
  tagline text,
  description text,
  unlock_level integer check (unlock_level is null or unlock_level > 0),
  color text,
  text_color text,
  icon_path text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.practices (
  id uuid primary key default gen_random_uuid(),
  universe_slug text not null references public.practice_universes(slug) on delete cascade,
  title text not null,
  description text,
  duration_minutes integer check (duration_minutes is null or duration_minutes > 0),
  media_kind public.media_kind not null,
  media_url text,
  pdf_url text,
  body_areas text[] not null default '{}',
  goals text[] not null default '{}',
  intensity text,
  safety_notes text,
  is_paid boolean not null default true,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.practice_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  practice_id uuid not null references public.practices(id) on delete cascade,
  status public.progress_status not null default 'not_started',
  last_completed_at timestamptz,
  completion_count integer not null default 0 check (completion_count >= 0),
  updated_at timestamptz not null default now(),
  unique (user_id, practice_id)
);

create table public.user_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_slug public.product_slug not null references public.products(slug) default 'the-user-manual',
  tutorial_level integer check (tutorial_level is null or tutorial_level > 0),
  practice_id uuid references public.practices(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_slug public.product_slug not null references public.products(slug) default 'the-user-manual',
  storage_path text not null,
  label text,
  taken_at date,
  created_at timestamptz not null default now()
);

create table public.lesson_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_slug public.product_slug not null references public.products(slug) default 'the-user-manual',
  tutorial_level integer not null check (tutorial_level > 0),
  body text not null,
  is_public boolean not null default true,
  is_resolved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lesson_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.lesson_questions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  is_teacher_answer boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.teacher_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.teacher_application_status not null default 'draft',
  motivation text,
  experience text,
  proposed_universe text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger product_entitlements_set_updated_at
before update on public.product_entitlements
for each row execute function public.set_updated_at();

create trigger tutorial_progress_set_updated_at
before update on public.tutorial_progress
for each row execute function public.set_updated_at();

create trigger practice_universes_set_updated_at
before update on public.practice_universes
for each row execute function public.set_updated_at();

create trigger practices_set_updated_at
before update on public.practices
for each row execute function public.set_updated_at();

create trigger practice_progress_set_updated_at
before update on public.practice_progress
for each row execute function public.set_updated_at();

create trigger user_notes_set_updated_at
before update on public.user_notes
for each row execute function public.set_updated_at();

create trigger lesson_questions_set_updated_at
before update on public.lesson_questions
for each row execute function public.set_updated_at();

create trigger lesson_answers_set_updated_at
before update on public.lesson_answers
for each row execute function public.set_updated_at();

create trigger teacher_applications_set_updated_at
before update on public.teacher_applications
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    display_name = coalesce(public.profiles.display_name, excluded.display_name),
    updated_at = now();

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.products (slug, name, description, is_public)
values
  ('the-user-manual', 'The User Manual', 'A free progressive tutorial and paid practice companion by Yoga with Ethan.', true),
  ('yoga-with-ethan', 'Yoga with Ethan', 'Main Yoga with Ethan web presence and account area.', true),
  ('yoga-immersion', 'Yoga Immersion', 'Future Yoga with Ethan immersion product.', false),
  ('ignorance-is-not-bliss', 'Ignorance Is Not Bliss', 'Future book and companion experience.', false),
  ('one-with-the-sun', 'One With The Sun', 'Future teacher marketplace and live class platform.', false)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  is_public = excluded.is_public;

insert into public.practice_universes (
  slug,
  name,
  tagline,
  unlock_level,
  color,
  text_color,
  icon_path,
  is_published
)
values
  ('wake-the-fck-up', 'wake the f*ck up', 'a morning''s best friend', 1, '#F4BC33', '#FFFFFF', '/tutorial-icons/wtfu-sun-icon.svg', true),
  ('prana-fusion', 'prana fusion', null, 2, '#1D1160', '#FFFFFF', '/tutorial-icons/pf-lightning-icon.svg', true),
  ('yoga-reset', 'yoga reset', null, 3, '#084A74', '#FFFFFF', '/tutorial-icons/yr-mountain-icon.svg', true),
  ('gravity-yoga', 'gravity yoga', null, 4, '#950301', '#FFFFFF', '/tutorial-icons/gy-moon-icon.svg', true),
  ('here-to-there', 'here to there', null, 5, '#FF5757', '#FFFFFF', '/tutorial-icons/h2t-atom-icon.svg', true)
on conflict (slug) do update
set
  name = excluded.name,
  tagline = excluded.tagline,
  unlock_level = excluded.unlock_level,
  color = excluded.color,
  text_color = excluded.text_color,
  icon_path = excluded.icon_path,
  is_published = excluded.is_published,
  updated_at = now();

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_entitlements enable row level security;
alter table public.purchases enable row level security;
alter table public.tutorial_progress enable row level security;
alter table public.practice_universes enable row level security;
alter table public.practices enable row level security;
alter table public.practice_progress enable row level security;
alter table public.user_notes enable row level security;
alter table public.progress_photos enable row level security;
alter table public.lesson_questions enable row level security;
alter table public.lesson_answers enable row level security;
alter table public.teacher_applications enable row level security;

create policy "Public products are readable"
on public.products for select
to anon, authenticated
using (is_public = true or auth.role() = 'authenticated');

create policy "Users can read own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can update own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Users can read own entitlements"
on public.product_entitlements for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can read own purchases"
on public.purchases for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can read own tutorial progress"
on public.tutorial_progress for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert own tutorial progress"
on public.tutorial_progress for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own tutorial progress"
on public.tutorial_progress for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Published practice universes are readable"
on public.practice_universes for select
to anon, authenticated
using (is_published = true);

create policy "Published practice metadata is readable"
on public.practices for select
to anon, authenticated
using (is_published = true);

create policy "Users can read own practice progress"
on public.practice_progress for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert own practice progress"
on public.practice_progress for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own practice progress"
on public.practice_progress for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can read own notes"
on public.user_notes for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert own notes"
on public.user_notes for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own notes"
on public.user_notes for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete own notes"
on public.user_notes for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can read own progress photos"
on public.progress_photos for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert own progress photos"
on public.progress_photos for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can delete own progress photos"
on public.progress_photos for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "Public lesson questions are readable"
on public.lesson_questions for select
to anon, authenticated
using (is_public = true);

create policy "Users can insert own lesson questions"
on public.lesson_questions for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own lesson questions"
on public.lesson_questions for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Lesson answers are readable"
on public.lesson_answers for select
to anon, authenticated
using (
  exists (
    select 1
    from public.lesson_questions q
    where q.id = lesson_answers.question_id
      and q.is_public = true
  )
);

create policy "Users can insert own lesson answers"
on public.lesson_answers for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can read own teacher application"
on public.teacher_applications for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert own teacher application"
on public.teacher_applications for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own draft teacher application"
on public.teacher_applications for update
to authenticated
using ((select auth.uid()) = user_id and status in ('draft', 'submitted'))
with check ((select auth.uid()) = user_id);
