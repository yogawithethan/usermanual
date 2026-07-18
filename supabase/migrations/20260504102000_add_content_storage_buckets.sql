insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values
  (
    'content-assets',
    'content-assets',
    true,
    52428800,
    array[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
      'video/mp4',
      'audio/mpeg',
      'audio/mp4',
      'application/pdf'
    ]
  ),
  (
    'private-downloads',
    'private-downloads',
    false,
    104857600,
    array[
      'application/pdf',
      'audio/mpeg',
      'audio/mp4',
      'video/mp4',
      'image/jpeg',
      'image/png',
      'image/webp'
    ]
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Published content assets are publicly readable"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'content-assets');

create policy "Authenticated users can read private downloads"
on storage.objects for select
to authenticated
using (bucket_id = 'private-downloads');
