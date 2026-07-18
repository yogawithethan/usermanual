alter table public.profiles
add column if not exists welcome_completed_at timestamptz;

revoke select on public.lesson_questions from anon;
revoke select on public.lesson_answers from anon;

drop policy if exists "Public lesson questions are readable" on public.lesson_questions;
drop policy if exists "Users can insert own lesson questions" on public.lesson_questions;
drop policy if exists "Users can update own lesson questions" on public.lesson_questions;
drop policy if exists "Lesson answers are readable" on public.lesson_answers;

create policy "Entitled users can read public lesson questions"
on public.lesson_questions for select
to authenticated
using (
  is_public = true
  and exists (
    select 1
    from public.product_entitlements entitlement
    where entitlement.user_id = (select auth.uid())
      and entitlement.product_slug = lesson_questions.product_slug
      and entitlement.status = 'active'
      and (entitlement.ends_at is null or entitlement.ends_at > now())
  )
);

create policy "Entitled users can insert own lesson questions"
on public.lesson_questions for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.product_entitlements entitlement
    where entitlement.user_id = (select auth.uid())
      and entitlement.product_slug = lesson_questions.product_slug
      and entitlement.status = 'active'
      and (entitlement.ends_at is null or entitlement.ends_at > now())
  )
);

create policy "Entitled users can update own lesson questions"
on public.lesson_questions for update
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.product_entitlements entitlement
    where entitlement.user_id = (select auth.uid())
      and entitlement.product_slug = lesson_questions.product_slug
      and entitlement.status = 'active'
      and (entitlement.ends_at is null or entitlement.ends_at > now())
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.product_entitlements entitlement
    where entitlement.user_id = (select auth.uid())
      and entitlement.product_slug = lesson_questions.product_slug
      and entitlement.status = 'active'
      and (entitlement.ends_at is null or entitlement.ends_at > now())
  )
);

create policy "Entitled users can read lesson answers"
on public.lesson_answers for select
to authenticated
using (
  exists (
    select 1
    from public.lesson_questions question
    join public.product_entitlements entitlement
      on entitlement.user_id = (select auth.uid())
     and entitlement.product_slug = question.product_slug
     and entitlement.status = 'active'
     and (entitlement.ends_at is null or entitlement.ends_at > now())
    where question.id = lesson_answers.question_id
      and question.is_public = true
  )
);
