create table if not exists public.content_audit_events (
  id uuid primary key default gen_random_uuid(),
  product_slug public.product_slug not null default 'the-user-manual',
  actor_source text not null default 'system',
  actor_id text,
  action text not null,
  entity_table text not null,
  entity_id text,
  entity_label text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists content_audit_events_product_created_idx
on public.content_audit_events (product_slug, created_at desc);

create index if not exists content_audit_events_entity_idx
on public.content_audit_events (entity_table, entity_id, created_at desc);

alter table public.content_audit_events enable row level security;

grant select, insert on public.content_audit_events to service_role;
grant usage, select on all sequences in schema public to service_role;
