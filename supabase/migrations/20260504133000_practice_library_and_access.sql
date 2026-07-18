alter table public.practices
add column if not exists storage_bucket text,
add column if not exists storage_path text,
add column if not exists thumbnail_url text,
add column if not exists sort_order integer not null default 0,
add column if not exists unlock_level integer check (unlock_level is null or unlock_level > 0);

create index if not exists practices_universe_order_idx
on public.practices (universe_slug, sort_order)
where is_published = true;

drop policy if exists "Published practice metadata is readable" on public.practices;

create policy "Published free practices are readable"
on public.practices for select
to anon, authenticated
using (is_published = true and is_paid = false);

create policy "Entitled users can read paid practices"
on public.practices for select
to authenticated
using (
  is_published = true
  and (
    is_paid = false
    or exists (
      select 1
      from public.product_entitlements entitlement
      where entitlement.user_id = (select auth.uid())
        and entitlement.product_slug = 'the-user-manual'
        and entitlement.status = 'active'
        and (entitlement.ends_at is null or entitlement.ends_at > now())
    )
  )
);

with seeded_practices (
  universe_slug,
  title,
  description,
  duration_minutes,
  media_kind,
  goals,
  body_areas,
  intensity,
  safety_notes,
  sort_order,
  unlock_level
) as (
  values
    ('wake-the-fck-up', 'Morning ignition', 'A short morning practice for waking the body without forcing intensity.', 12, 'audio'::public.media_kind, array['energy', 'morning'], array['spine', 'breath'], 'gentle', 'Keep breath smooth. Skip anything that creates sharp pain or dizziness.', 1, 1),
    ('wake-the-fck-up', 'Sunrise reset', 'A compact video flow for getting upright, clear, and warm.', 18, 'video'::public.media_kind, array['energy', 'mobility'], array['hips', 'shoulders'], 'moderate', 'Move slowly when first waking. Hydrate before stronger work.', 2, 1),
    ('prana-fusion', 'Lightning spine', 'Breath-led practice for moving energy up the spine with control.', 16, 'audio'::public.media_kind, array['energy', 'focus'], array['spine', 'nervous system'], 'moderate', 'Do not hold the breath aggressively. Stop if tingling becomes uncomfortable.', 1, 2),
    ('yoga-reset', 'Downshift sequence', 'A calming practice for unwinding stress and returning to baseline.', 20, 'video'::public.media_kind, array['stress relief', 'recovery'], array['neck', 'back', 'breath'], 'gentle', 'Stay below strain. Let the exhale lengthen naturally.', 1, 3),
    ('gravity-yoga', 'Long-hold hamstrings', 'Supported flexibility work using long holds and calm breathing.', 24, 'video'::public.media_kind, array['flexibility'], array['hamstrings', 'hips'], 'deep', 'Avoid nerve-like sensations. Use props and reduce range as needed.', 1, 4),
    ('here-to-there', 'Safe transition', 'A grounding practice for changing state without overwhelming the system.', 15, 'audio'::public.media_kind, array['grounding', 'release'], array['breath', 'spine'], 'gentle', 'Keep eyes open if closing them feels too intense.', 1, 5)
)
insert into public.practices (
  universe_slug,
  title,
  description,
  duration_minutes,
  media_kind,
  goals,
  body_areas,
  intensity,
  safety_notes,
  sort_order,
  unlock_level,
  is_paid,
  is_published
)
select
  universe_slug,
  title,
  description,
  duration_minutes,
  media_kind,
  goals,
  body_areas,
  intensity,
  safety_notes,
  sort_order,
  unlock_level,
  true,
  true
from seeded_practices
where not exists (
  select 1
  from public.practices existing
  where existing.universe_slug = seeded_practices.universe_slug
    and existing.title = seeded_practices.title
);

grant select on public.practices to anon, authenticated;
grant select, insert, update, delete on public.practices to service_role;
