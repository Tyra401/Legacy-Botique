-- Legacy Boutique: run this once in Supabase (SQL Editor > New query > paste > Run).
-- BEFORE running: replace both copies of  you@example.com  with the email you will log in with.

create table if not exists public.shop_data (
  id int primary key check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.shop_data enable row level security;

drop policy if exists "anyone can read the shop" on public.shop_data;
create policy "anyone can read the shop" on public.shop_data
  for select using (true);

drop policy if exists "owner can add the shop" on public.shop_data;
create policy "owner can add the shop" on public.shop_data
  for insert to authenticated
  with check ((auth.jwt() ->> 'email') = 'you@example.com');

drop policy if exists "owner can change the shop" on public.shop_data;
create policy "owner can change the shop" on public.shop_data
  for update to authenticated
  using ((auth.jwt() ->> 'email') = 'you@example.com')
  with check ((auth.jwt() ->> 'email') = 'you@example.com');

-- Public folder for photos
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "owner can upload photos" on storage.objects;
create policy "owner can upload photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'photos' and (auth.jwt() ->> 'email') = 'you@example.com');
