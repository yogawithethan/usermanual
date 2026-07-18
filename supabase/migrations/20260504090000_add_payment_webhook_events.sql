create table if not exists public.payment_webhook_events (
  id text primary key,
  provider public.entitlement_source not null,
  event_type text not null,
  source_reference text,
  processed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.payment_webhook_events enable row level security;
