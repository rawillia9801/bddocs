-- DogBreederDocs schema for the existing My Dog Portal Site Supabase project.
create table if not exists public.dogdocs_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  kennel_name text not null default '',
  email text,
  default_state text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dogdocs_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  product_type text not null check (product_type in ('single','packet','studio_included')),
  template_id text,
  amount_cents integer not null default 0 check (amount_cents >= 0),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','refunded','included')),
  provider_reference text,
  created_at timestamptz not null default now()
);

create table if not exists public.dogdocs_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  buyer_id uuid,
  puppy_id uuid,
  title text not null,
  template_id text not null,
  state text not null,
  header_content text not null default '',
  body_content text not null default '',
  footer_content text not null default '',
  clauses jsonb not null default '[]'::jsonb,
  logo_data text,
  status text not null default 'draft' check (status in ('draft','ready','sent','signed','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists dogdocs_profiles_org_idx on public.dogdocs_profiles(organization_id);
create index if not exists dogdocs_purchases_user_idx on public.dogdocs_purchases(user_id, created_at desc);
create index if not exists dogdocs_purchases_org_idx on public.dogdocs_purchases(organization_id, created_at desc);
create index if not exists dogdocs_documents_user_idx on public.dogdocs_documents(user_id, updated_at desc);
create index if not exists dogdocs_documents_org_idx on public.dogdocs_documents(organization_id, updated_at desc);
create index if not exists dogdocs_documents_buyer_idx on public.dogdocs_documents(buyer_id, updated_at desc);

alter table public.dogdocs_profiles enable row level security;
alter table public.dogdocs_purchases enable row level security;
alter table public.dogdocs_documents enable row level security;
grant select, insert, update, delete on public.dogdocs_profiles, public.dogdocs_documents to authenticated;
grant select on public.dogdocs_purchases to authenticated;

create policy "dogdocs_profiles_select" on public.dogdocs_profiles for select to authenticated
using ((select auth.uid()) = user_id or exists (select 1 from public.organization_users ou where ou.organization_id = dogdocs_profiles.organization_id and ou.auth_user_id = (select auth.uid()) and ou.is_active));
create policy "dogdocs_profiles_insert" on public.dogdocs_profiles for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "dogdocs_profiles_update" on public.dogdocs_profiles for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "dogdocs_purchases_select" on public.dogdocs_purchases for select to authenticated
using ((select auth.uid()) = user_id or exists (select 1 from public.organization_users ou where ou.organization_id = dogdocs_purchases.organization_id and ou.auth_user_id = (select auth.uid()) and ou.is_active));

create policy "dogdocs_documents_select" on public.dogdocs_documents for select to authenticated
using ((select auth.uid()) = user_id or exists (select 1 from public.organization_users ou where ou.organization_id = dogdocs_documents.organization_id and ou.auth_user_id = (select auth.uid()) and ou.is_active));
create policy "dogdocs_documents_insert" on public.dogdocs_documents for insert to authenticated
with check ((select auth.uid()) = user_id and (organization_id is null or exists (select 1 from public.organization_users ou where ou.organization_id = dogdocs_documents.organization_id and ou.auth_user_id = (select auth.uid()) and ou.is_active)));
create policy "dogdocs_documents_update" on public.dogdocs_documents for update to authenticated
using ((select auth.uid()) = user_id or exists (select 1 from public.organization_users ou where ou.organization_id = dogdocs_documents.organization_id and ou.auth_user_id = (select auth.uid()) and ou.is_active))
with check ((select auth.uid()) = user_id or exists (select 1 from public.organization_users ou where ou.organization_id = dogdocs_documents.organization_id and ou.auth_user_id = (select auth.uid()) and ou.is_active));
create policy "dogdocs_documents_delete" on public.dogdocs_documents for delete to authenticated
using ((select auth.uid()) = user_id or exists (select 1 from public.organization_users ou where ou.organization_id = dogdocs_documents.organization_id and ou.auth_user_id = (select auth.uid()) and ou.is_active));
