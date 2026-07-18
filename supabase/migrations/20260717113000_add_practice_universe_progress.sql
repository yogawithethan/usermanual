create table if not exists public.practice_universe_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_slug public.product_slug not null references public.products(slug) default 'the-user-manual',
  universe_slug text not null references public.practice_universes(slug) on delete cascade,
  status public.progress_status not null default 'not_started',
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, product_slug, universe_slug)
);

drop trigger if exists practice_universe_progress_set_updated_at on public.practice_universe_progress;
create trigger practice_universe_progress_set_updated_at
before update on public.practice_universe_progress
for each row execute function public.set_updated_at();

alter table public.practice_universe_progress enable row level security;

create policy "Users read own practice universe progress"
on public.practice_universe_progress for select
to authenticated
using (auth.uid() = user_id);

create policy "Users insert own practice universe progress"
on public.practice_universe_progress for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users update own practice universe progress"
on public.practice_universe_progress for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant select, insert, update on public.practice_universe_progress to authenticated;
grant select, insert, update, delete on public.practice_universe_progress to service_role;
