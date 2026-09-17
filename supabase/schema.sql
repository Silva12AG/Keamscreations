-- Keams Creations dashboard schema
-- 1. Run this file in Supabase SQL Editor.
-- 2. Create keamscreations@gmail.com in Authentication > Users.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  email text primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  verification_contact text not null check (char_length(verification_contact) between 3 and 180),
  service text not null check (char_length(service) between 2 and 120),
  rating integer not null check (rating between 1 and 5),
  review_text text not null check (char_length(review_text) between 20 and 700),
  publication_consent boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_at timestamptz not null default now(),
  published_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  contact text not null check (char_length(contact) between 3 and 180),
  service text not null check (char_length(service) between 2 and 120),
  deadline date not null,
  details text not null check (char_length(details) between 10 and 1200),
  status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'booked', 'completed', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text unique not null,
  description text not null,
  primary_price text not null,
  secondary_price text not null default '',
  sort_order integer not null default 0,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reviews_set_updated_at on public.reviews;
create trigger reviews_set_updated_at before update on public.reviews
for each row execute function public.set_updated_at();

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at before update on public.bookings
for each row execute function public.set_updated_at();

drop trigger if exists services_set_updated_at on public.services;
create trigger services_set_updated_at before update on public.services
for each row execute function public.set_updated_at();

create or replace function public.is_kc_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_kc_admin() from public;
grant execute on function public.is_kc_admin() to authenticated;

alter table public.admin_users enable row level security;
alter table public.reviews enable row level security;
alter table public.bookings enable row level security;
alter table public.services enable row level security;

drop policy if exists "admin users are owner-only" on public.admin_users;
create policy "admin users are owner-only" on public.admin_users
for all to authenticated using (public.is_kc_admin()) with check (public.is_kc_admin());

drop policy if exists "anyone can submit a pending review" on public.reviews;
create policy "anyone can submit a pending review" on public.reviews
for insert to anon, authenticated
with check (status = 'pending' and publication_consent = true);

drop policy if exists "owner manages every review" on public.reviews;
create policy "owner manages every review" on public.reviews
for all to authenticated using (public.is_kc_admin()) with check (public.is_kc_admin());

drop policy if exists "anyone can submit a booking" on public.bookings;
create policy "anyone can submit a booking" on public.bookings
for insert to anon, authenticated with check (status = 'new');

drop policy if exists "owner manages every booking" on public.bookings;
create policy "owner manages every booking" on public.bookings
for all to authenticated using (public.is_kc_admin()) with check (public.is_kc_admin());

drop policy if exists "public reads active services" on public.services;
create policy "public reads active services" on public.services
for select to anon, authenticated using (active = true or public.is_kc_admin());

drop policy if exists "owner manages services" on public.services;
create policy "owner manages services" on public.services
for all to authenticated using (public.is_kc_admin()) with check (public.is_kc_admin());

create or replace view public.public_reviews as
select id, name, service, rating, review_text, published_at
from public.reviews
where status = 'approved' and publication_consent = true;

revoke all on public.reviews from anon;
grant insert on public.reviews to anon;
grant select, insert, update, delete on public.reviews to authenticated;
revoke all on public.bookings from anon;
grant insert on public.bookings to anon;
grant select, insert, update, delete on public.bookings to authenticated;
grant select on public.services to anon;
grant select, insert, update, delete on public.services to authenticated;
grant select on public.public_reviews to anon, authenticated;

insert into public.admin_users (email)
values ('keamscreations@gmail.com')
on conflict (email) do nothing;

insert into public.services (slug, name, description, primary_price, secondary_price, sort_order)
values
  ('brand-identity', 'Brand identity', 'Distinct logos, colour systems and brand assets that make the right first impression.', 'From P200', 'Full branding P300', 1),
  ('social-event-design', 'Social & event design', 'Flyers, posters and campaign graphics built to stop the scroll and drive action.', 'Flyers P150', 'Event posters P200', 2),
  ('print-merchandise', 'Print & merchandise', 'Wearable branding and print pieces made to look as good in hand as they do online.', 'Custom quote', 'Based on item & quantity', 3),
  ('website-design', 'Website design', 'Fast, responsive sites that turn curious visitors into confident customers.', 'From P650', 'Growth P950 • Pro P1,200', 4)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  primary_price = excluded.primary_price,
  secondary_price = excluded.secondary_price,
  sort_order = excluded.sort_order;

-- Seed the first verified review already published on the website.
insert into public.reviews (
  name, verification_contact, service, rating, review_text,
  publication_consent, status, submitted_at, published_at
)
select
  'Neo', 'verified-offline', 'Print & merchandise', 5,
  'Looking for quality designs? I highly recommend KC. I got a T-shirt design from them and it was amazing.',
  true, 'approved', '2026-09-17T00:00:00+02:00', '2026-09-17T00:00:00+02:00'
where not exists (
  select 1 from public.reviews where name = 'Neo' and review_text like 'Looking for quality designs%'
);
