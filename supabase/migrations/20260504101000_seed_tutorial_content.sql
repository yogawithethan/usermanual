with level_seed(level_number, title, subtitle, hero, vimeo_id, theme) as (
  values
    (1, 'level 1', 'upright & confident', 'deeper. slower. easier.', '000000000', '{"accent":"#1E68B6","accentSoft":"#EDF4FF","heroFrom":"#78A9E5","heroTo":"#1E68B6","surface":"#F7F1EA"}'::jsonb),
    (2, 'level 2', 'grounded & aware', 'grounded. aware. steady.', '000000000', '{"accent":"#3C59A6","accentSoft":"#EEF3FF","heroFrom":"#7D91D1","heroTo":"#3C59A6","surface":"#F7F1EA"}'::jsonb),
    (3, 'level 3', 'breath & stillness', 'soft. quiet. clear.', '000000000', '{"accent":"#5B4A97","accentSoft":"#F1EEFF","heroFrom":"#8C80C9","heroTo":"#5B4A97","surface":"#F7F1EA"}'::jsonb),
    (4, 'level 4', 'strength & surrender', 'strong. soft. open.', '000000000', '{"accent":"#793C87","accentSoft":"#F5ECF8","heroFrom":"#A977B2","heroTo":"#793C87","surface":"#F7F1EA"}'::jsonb),
    (5, 'level 5', 'integration', 'connected. capable. calm.', '000000000', '{"accent":"#982D78","accentSoft":"#F8EAF3","heroFrom":"#C06BA4","heroTo":"#982D78","surface":"#F7F1EA"}'::jsonb),
    (6, 'level 6', 'embodiment', 'clear. kind. alive.', '000000000', '{"accent":"#B61E68","accentSoft":"#FBE8F0","heroFrom":"#D7669C","heroTo":"#B61E68","surface":"#F7F1EA"}'::jsonb)
)
insert into public.tutorial_levels (
  product_slug,
  level_number,
  title,
  subtitle,
  hero,
  vimeo_id,
  theme,
  is_published,
  published_at
)
select
  'the-user-manual',
  level_number,
  title,
  subtitle,
  hero,
  vimeo_id,
  theme,
  true,
  now()
from level_seed
on conflict (product_slug, level_number) do update
set
  title = excluded.title,
  subtitle = excluded.subtitle,
  hero = excluded.hero,
  vimeo_id = excluded.vimeo_id,
  theme = excluded.theme,
  is_published = excluded.is_published,
  published_at = coalesce(public.tutorial_levels.published_at, excluded.published_at),
  updated_at = now();

with section_seed(level_number, sort_order, slug, title, paragraphs) as (
  values
    (1, 1, 'plunger-breathing', 'Step #1: Plunger Breathing', '["Poor posture is caused by unnecessary muscular tension, weak core habits, incorrect positioning of the hips, mental stress, and injuries.","Let''s address the first factor on that list: tension. Flex your abs super tight. Contract, contract, contract. Now try to breathe into your belly.","Impossible, right? Totally locked up. Muscular tension and breathing cannot coexist; they oppose and block one another."]'::jsonb),
    (1, 2, 'rib-breathing', 'Step #2: Rib Breathing', '["Your ribcage is not a cage in the rigid sense. It is a movable structure that can expand in multiple directions.","The goal is to feel breath spread into the front, sides, and back without lifting your shoulders or bracing your belly."]'::jsonb),
    (1, 3, 'syringe-breathing', 'Step #3: Syringe Breathing', '["Your lungs can get pretty big, between 4.5L and 6L in the average adult.","Even while completely exhaled, they still span from the bottom of your ribcage all the way up to your collarbones, then behind you into scapulae and traps.","Imagine a syringe: someone places the needle in a cup of water and pulls the handle. The pressure differential causes liquid to be sucked into the tube.","Now imagine this syringe handle overlayed onto your shoulder line. When you inhale, the syringe gets pulled and drags air into the top and backside of your lungs."]'::jsonb),
    (1, 4, 'pelvis-reset', 'Step #4: Pelvis Reset', '["Breathing changes posture most reliably when the pelvis is no longer fighting the ribcage.","Think of this as creating a steady base. The work is subtle, but once you feel it, everything above it gets easier."]'::jsonb),
    (1, 5, 'standing-integration', 'Step #5: Standing Integration', '["Practice the same breathing pattern while standing. Keep your feet soft, your jaw relaxed, and your breath unforced.","The test is whether you can maintain the expansion without becoming rigid."]'::jsonb),
    (1, 6, 'daily-practice', 'Step #6: Daily Practice', '["Use this lesson for a few minutes at a time. Short, frequent practice works better than one heroic session.","Only mark the level complete once the breathing pattern feels available without needing to think your way through every step."]'::jsonb),
    (2, 1, 'plunger-breathing', 'Step #1: Plunger Breathing', '["Poor posture is caused by unnecessary muscular tension, weak core habits, incorrect positioning of the hips, mental stress, and injuries.","Let''s address the first factor on that list: tension. Flex your abs super tight. Contract, contract, contract. Now try to breathe into your belly.","Impossible, right? Totally locked up. Muscular tension and breathing cannot coexist; they oppose and block one another."]'::jsonb),
    (2, 2, 'rib-breathing', 'Step #2: Rib Breathing', '["Your ribcage is not a cage in the rigid sense. It is a movable structure that can expand in multiple directions.","The goal is to feel breath spread into the front, sides, and back without lifting your shoulders or bracing your belly."]'::jsonb),
    (2, 3, 'syringe-breathing', 'Step #3: Syringe Breathing', '["Your lungs can get pretty big, between 4.5L and 6L in the average adult.","Even while completely exhaled, they still span from the bottom of your ribcage all the way up to your collarbones, then behind you into scapulae and traps.","Imagine a syringe: someone places the needle in a cup of water and pulls the handle. The pressure differential causes liquid to be sucked into the tube.","Now imagine this syringe handle overlayed onto your shoulder line. When you inhale, the syringe gets pulled and drags air into the top and backside of your lungs."]'::jsonb),
    (2, 4, 'pelvis-reset', 'Step #4: Pelvis Reset', '["Breathing changes posture most reliably when the pelvis is no longer fighting the ribcage.","Think of this as creating a steady base. The work is subtle, but once you feel it, everything above it gets easier."]'::jsonb),
    (2, 5, 'standing-integration', 'Step #5: Standing Integration', '["Practice the same breathing pattern while standing. Keep your feet soft, your jaw relaxed, and your breath unforced.","The test is whether you can maintain the expansion without becoming rigid."]'::jsonb),
    (3, 1, 'plunger-breathing', 'Step #1: Plunger Breathing', '["Poor posture is caused by unnecessary muscular tension, weak core habits, incorrect positioning of the hips, mental stress, and injuries.","Let''s address the first factor on that list: tension. Flex your abs super tight. Contract, contract, contract. Now try to breathe into your belly.","Impossible, right? Totally locked up. Muscular tension and breathing cannot coexist; they oppose and block one another."]'::jsonb),
    (3, 2, 'rib-breathing', 'Step #2: Rib Breathing', '["Your ribcage is not a cage in the rigid sense. It is a movable structure that can expand in multiple directions.","The goal is to feel breath spread into the front, sides, and back without lifting your shoulders or bracing your belly."]'::jsonb),
    (3, 3, 'syringe-breathing', 'Step #3: Syringe Breathing', '["Your lungs can get pretty big, between 4.5L and 6L in the average adult.","Even while completely exhaled, they still span from the bottom of your ribcage all the way up to your collarbones, then behind you into scapulae and traps.","Imagine a syringe: someone places the needle in a cup of water and pulls the handle. The pressure differential causes liquid to be sucked into the tube.","Now imagine this syringe handle overlayed onto your shoulder line. When you inhale, the syringe gets pulled and drags air into the top and backside of your lungs."]'::jsonb),
    (3, 4, 'pelvis-reset', 'Step #4: Pelvis Reset', '["Breathing changes posture most reliably when the pelvis is no longer fighting the ribcage.","Think of this as creating a steady base. The work is subtle, but once you feel it, everything above it gets easier."]'::jsonb),
    (3, 5, 'standing-integration', 'Step #5: Standing Integration', '["Practice the same breathing pattern while standing. Keep your feet soft, your jaw relaxed, and your breath unforced.","The test is whether you can maintain the expansion without becoming rigid."]'::jsonb),
    (3, 6, 'daily-practice', 'Step #6: Daily Practice', '["Use this lesson for a few minutes at a time. Short, frequent practice works better than one heroic session.","Only mark the level complete once the breathing pattern feels available without needing to think your way through every step."]'::jsonb),
    (4, 1, 'plunger-breathing', 'Step #1: Plunger Breathing', '["Poor posture is caused by unnecessary muscular tension, weak core habits, incorrect positioning of the hips, mental stress, and injuries.","Let''s address the first factor on that list: tension. Flex your abs super tight. Contract, contract, contract. Now try to breathe into your belly.","Impossible, right? Totally locked up. Muscular tension and breathing cannot coexist; they oppose and block one another."]'::jsonb),
    (4, 2, 'rib-breathing', 'Step #2: Rib Breathing', '["Your ribcage is not a cage in the rigid sense. It is a movable structure that can expand in multiple directions.","The goal is to feel breath spread into the front, sides, and back without lifting your shoulders or bracing your belly."]'::jsonb),
    (4, 3, 'syringe-breathing', 'Step #3: Syringe Breathing', '["Your lungs can get pretty big, between 4.5L and 6L in the average adult.","Even while completely exhaled, they still span from the bottom of your ribcage all the way up to your collarbones, then behind you into scapulae and traps.","Imagine a syringe: someone places the needle in a cup of water and pulls the handle. The pressure differential causes liquid to be sucked into the tube.","Now imagine this syringe handle overlayed onto your shoulder line. When you inhale, the syringe gets pulled and drags air into the top and backside of your lungs."]'::jsonb),
    (4, 4, 'pelvis-reset', 'Step #4: Pelvis Reset', '["Breathing changes posture most reliably when the pelvis is no longer fighting the ribcage.","Think of this as creating a steady base. The work is subtle, but once you feel it, everything above it gets easier."]'::jsonb),
    (5, 1, 'plunger-breathing', 'Step #1: Plunger Breathing', '["Poor posture is caused by unnecessary muscular tension, weak core habits, incorrect positioning of the hips, mental stress, and injuries.","Let''s address the first factor on that list: tension. Flex your abs super tight. Contract, contract, contract. Now try to breathe into your belly.","Impossible, right? Totally locked up. Muscular tension and breathing cannot coexist; they oppose and block one another."]'::jsonb),
    (5, 2, 'rib-breathing', 'Step #2: Rib Breathing', '["Your ribcage is not a cage in the rigid sense. It is a movable structure that can expand in multiple directions.","The goal is to feel breath spread into the front, sides, and back without lifting your shoulders or bracing your belly."]'::jsonb),
    (5, 3, 'syringe-breathing', 'Step #3: Syringe Breathing', '["Your lungs can get pretty big, between 4.5L and 6L in the average adult.","Even while completely exhaled, they still span from the bottom of your ribcage all the way up to your collarbones, then behind you into scapulae and traps.","Imagine a syringe: someone places the needle in a cup of water and pulls the handle. The pressure differential causes liquid to be sucked into the tube.","Now imagine this syringe handle overlayed onto your shoulder line. When you inhale, the syringe gets pulled and drags air into the top and backside of your lungs."]'::jsonb),
    (6, 1, 'plunger-breathing', 'Step #1: Plunger Breathing', '["Poor posture is caused by unnecessary muscular tension, weak core habits, incorrect positioning of the hips, mental stress, and injuries.","Let''s address the first factor on that list: tension. Flex your abs super tight. Contract, contract, contract. Now try to breathe into your belly.","Impossible, right? Totally locked up. Muscular tension and breathing cannot coexist; they oppose and block one another."]'::jsonb),
    (6, 2, 'rib-breathing', 'Step #2: Rib Breathing', '["Your ribcage is not a cage in the rigid sense. It is a movable structure that can expand in multiple directions.","The goal is to feel breath spread into the front, sides, and back without lifting your shoulders or bracing your belly."]'::jsonb),
    (6, 3, 'syringe-breathing', 'Step #3: Syringe Breathing', '["Your lungs can get pretty big, between 4.5L and 6L in the average adult.","Even while completely exhaled, they still span from the bottom of your ribcage all the way up to your collarbones, then behind you into scapulae and traps.","Imagine a syringe: someone places the needle in a cup of water and pulls the handle. The pressure differential causes liquid to be sucked into the tube.","Now imagine this syringe handle overlayed onto your shoulder line. When you inhale, the syringe gets pulled and drags air into the top and backside of your lungs."]'::jsonb)
)
insert into public.tutorial_sections (
  tutorial_level_id,
  slug,
  title,
  paragraphs,
  sort_order,
  is_published
)
select
  level.id,
  section_seed.slug,
  section_seed.title,
  section_seed.paragraphs,
  section_seed.sort_order,
  true
from section_seed
join public.tutorial_levels level
  on level.product_slug = 'the-user-manual'
 and level.level_number = section_seed.level_number
on conflict (tutorial_level_id, slug) do update
set
  title = excluded.title,
  paragraphs = excluded.paragraphs,
  sort_order = excluded.sort_order,
  is_published = excluded.is_published,
  updated_at = now();

insert into public.tutorial_faqs (
  tutorial_level_id,
  product_slug,
  question,
  answer,
  sort_order,
  is_published
)
select
  level.id,
  'the-user-manual',
  faq.question,
  faq.answer,
  faq.sort_order,
  true
from public.tutorial_levels level
cross join (
  values
    (1, 'How often should I practice this level?', 'Short, frequent sessions are better than one long push. A few focused minutes most days will build the pattern without turning it into another thing to force.'),
    (2, 'How do I know I am ready for the next level?', 'Move on when the main breathing pattern feels available without needing to mentally manage every step. It does not need to be perfect, just familiar enough to return to.'),
    (3, 'What should I do if something feels uncomfortable?', 'Reduce the intensity, slow down, and stay inside a range that lets you breathe normally. Sharp pain, numbness, or strain is a sign to stop and reset.')
) as faq(sort_order, question, answer)
where level.product_slug = 'the-user-manual'
on conflict do nothing;

insert into public.tutorial_media_blocks (
  tutorial_level_id,
  slug,
  media_kind,
  caption_top,
  caption_bottom,
  sort_order,
  is_published
)
select
  level.id,
  'ribcage-placement',
  'image',
  'Hand on chest',
  'Hand on sides',
  1,
  true
from public.tutorial_levels level
where level.product_slug = 'the-user-manual'
  and level.level_number = 1
on conflict (tutorial_level_id, slug) do update
set
  caption_top = excluded.caption_top,
  caption_bottom = excluded.caption_bottom,
  sort_order = excluded.sort_order,
  is_published = excluded.is_published,
  updated_at = now();

insert into public.tutorial_footnotes (
  tutorial_level_id,
  slug,
  body,
  sort_order,
  is_published
)
select
  level.id,
  'ribcage-heart',
  'Breathing with your ribcage also causes your heart to expand. When you inhale, your heart will speed up, and when you exhale, your heart will slow down. Levels 2 and 3 explore how you can use this to manually adjust your own blood pressure.',
  1,
  true
from public.tutorial_levels level
where level.product_slug = 'the-user-manual'
  and level.level_number = 1
on conflict (tutorial_level_id, slug) do update
set
  body = excluded.body,
  sort_order = excluded.sort_order,
  is_published = excluded.is_published,
  updated_at = now();

insert into public.tutorial_checklist_items (
  tutorial_level_id,
  body,
  is_complete_by_default,
  sort_order,
  is_published
)
select
  level.id,
  item.body,
  item.is_complete_by_default,
  item.sort_order,
  true
from public.tutorial_levels level
join (
  values
    (1, 'You can feel distinct movement in your ribcage during breathing', true),
    (2, 'Your ribs can expand in all directions during inhale', true),
    (3, 'You can maintain expansion without shoulder tension', true),
    (4, 'You notice your heart rate subtly changing with your breath cycle', false)
) as item(sort_order, body, is_complete_by_default)
  on level.product_slug = 'the-user-manual'
 and level.level_number = 1
where not exists (
  select 1
  from public.tutorial_checklist_items existing
  where existing.tutorial_level_id = level.id
);
