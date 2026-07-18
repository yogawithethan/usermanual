do $$
begin
  create type public.content_release_status as enum ('available', 'coming_soon');
exception
  when duplicate_object then null;
end
$$;

alter table public.practice_universes
add column if not exists release_status public.content_release_status
not null default 'available';

create table if not exists public.content_release_interests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  universe_slug text not null references public.practice_universes(slug) on delete cascade,
  email text not null,
  notify_email boolean not null default true,
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, universe_slug)
);

drop trigger if exists content_release_interests_set_updated_at
on public.content_release_interests;
create trigger content_release_interests_set_updated_at
before update on public.content_release_interests
for each row execute function public.set_updated_at();

alter table public.content_release_interests enable row level security;

create policy "Users can read own release interests"
on public.content_release_interests for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Entitled users can register release interests"
on public.content_release_interests for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.product_entitlements entitlement
    where entitlement.user_id = (select auth.uid())
      and entitlement.product_slug = 'the-user-manual'
      and entitlement.status = 'active'
      and (entitlement.ends_at is null or entitlement.ends_at > now())
  )
);

create policy "Entitled users can update own release interests"
on public.content_release_interests for update
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.product_entitlements entitlement
    where entitlement.user_id = (select auth.uid())
      and entitlement.product_slug = 'the-user-manual'
      and entitlement.status = 'active'
      and (entitlement.ends_at is null or entitlement.ends_at > now())
  )
);

grant select, insert, update on public.content_release_interests to authenticated;
grant select, insert, update, delete on public.content_release_interests to service_role;
