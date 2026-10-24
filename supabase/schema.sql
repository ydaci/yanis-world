-- Run this in Supabase SQL Editor. AFTER adding your auth user, insert their UUID into admin_users.
create extension if not exists pgcrypto;
create table if not exists public.admin_users (user_id uuid primary key references auth.users(id) on delete cascade);
create table if not exists public.posts (
 id uuid primary key default gen_random_uuid(), language text not null check(language in('japan','china','korea')),
 slug text not null check(slug ~ '^[a-z0-9-]{3,100}$'),title text not null,body text not null,
 excerpt text,cover_url text,published boolean not null default false,created_at timestamptz not null default now(),
 unique(language,slug));
create table if not exists public.comments (
 id uuid primary key default gen_random_uuid(),post_id uuid not null references public.posts(id) on delete cascade,
 nickname text not null check(char_length(nickname) between 2 and 48),body text not null check(char_length(body) between 2 and 2000),
 status text not null default 'pending' check(status in('pending','approved','rejected')),
 created_at timestamptz not null default now());
create index if not exists posts_by_lang on public.posts(language,published,created_at desc);
create index if not exists comments_by_post on public.comments(post_id,status,created_at desc);
alter table public.admin_users enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
create policy "Admins read own role" on public.admin_users for select to authenticated using (user_id=(select auth.uid()));
create policy "Anyone reads published posts" on public.posts for select to anon,authenticated using (published or exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
create policy "Only admins insert posts" on public.posts for insert to authenticated with check(exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
create policy "Only admins update posts" on public.posts for update to authenticated using(exists(select 1 from public.admin_users a where a.user_id=(select auth.uid()))) with check(exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
create policy "Only admins delete posts" on public.posts for delete to authenticated using(exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
create policy "Read approved comments or admin" on public.comments for select to anon,authenticated using(status='approved' or exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
create policy "Anonymous comments pending only" on public.comments for insert to anon,authenticated with check(status='pending' and exists(select 1 from public.posts p where p.id=post_id and p.published));
create policy "Only admins moderate" on public.comments for update to authenticated using(exists(select 1 from public.admin_users a where a.user_id=(select auth.uid()))) with check(exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
create policy "Only admins delete comments" on public.comments for delete to authenticated using(exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
-- To enable your account as admin, replace UUID below with its value from Authentication > Users:
-- insert into public.admin_users(user_id) values ('YOUR-AUTH-USER-UUID');
-- IMPORTANT: Before public launch, add CAPTCHA, rate limiting, and anti-spam protection on comment submission.
