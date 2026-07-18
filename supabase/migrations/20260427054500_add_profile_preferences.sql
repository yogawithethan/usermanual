alter table public.profiles
add column if not exists timezone text,
add column if not exists primary_goal text,
add column if not exists onboarding_note text,
add column if not exists onboarding_completed_at timestamptz;
