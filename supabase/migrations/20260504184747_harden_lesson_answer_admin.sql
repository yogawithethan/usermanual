drop policy if exists "Users can insert own lesson answers" on public.lesson_answers;

alter table public.lesson_answers
alter column user_id drop not null;

grant select, update on table
  public.lesson_questions
to service_role;

grant select, insert, update on table
  public.lesson_answers
to service_role;
