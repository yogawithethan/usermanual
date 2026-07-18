create index if not exists tutorial_progress_user_product_updated_idx
on public.tutorial_progress (user_id, product_slug, updated_at desc);

create index if not exists practice_progress_user_updated_idx
on public.practice_progress (user_id, updated_at desc);

create index if not exists user_notes_user_product_updated_idx
on public.user_notes (user_id, product_slug, updated_at desc);

create index if not exists progress_photos_user_product_created_idx
on public.progress_photos (user_id, product_slug, created_at desc);

create index if not exists lesson_questions_user_product_updated_idx
on public.lesson_questions (user_id, product_slug, updated_at desc);

create index if not exists lesson_questions_level_public_created_idx
on public.lesson_questions (product_slug, tutorial_level, created_at desc)
where is_public = true;

create index if not exists lesson_answers_question_created_idx
on public.lesson_answers (question_id, created_at asc);
