drop policy if exists "Published downloads are readable" on public.product_downloads;

create policy "Entitled users can read published downloads"
on public.product_downloads for select
to authenticated
using (
  is_published = true
  and exists (
    select 1
    from public.product_entitlements entitlement
    where entitlement.user_id = (select auth.uid())
      and entitlement.product_slug = product_downloads.product_slug
      and entitlement.status = 'active'
      and (entitlement.ends_at is null or entitlement.ends_at > now())
  )
);

drop policy if exists "Authenticated users can read private downloads" on storage.objects;

create policy "Service role can manage private downloads"
on storage.objects for all
to service_role
using (bucket_id = 'private-downloads')
with check (bucket_id = 'private-downloads');
