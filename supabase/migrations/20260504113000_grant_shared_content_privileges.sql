grant usage on schema public to anon, authenticated, service_role;

grant select on table
  public.tutorial_levels,
  public.tutorial_sections,
  public.tutorial_media_blocks,
  public.tutorial_footnotes,
  public.tutorial_checklist_items,
  public.tutorial_faqs,
  public.product_downloads
to anon, authenticated;

grant select, insert, update, delete on table
  public.tutorial_levels,
  public.tutorial_sections,
  public.tutorial_media_blocks,
  public.tutorial_footnotes,
  public.tutorial_checklist_items,
  public.tutorial_faqs,
  public.product_downloads
to service_role;

grant usage, select on all sequences in schema public to service_role;
