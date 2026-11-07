-- VYRO cloud foundation. Apply only after creating/authorizing the Supabase project.
-- Client access is owner-scoped; billing entitlements are server-managed only.

create table if not exists public.vyro_projects (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid not null references auth.users(id) on delete cascade,
    title text not null default 'Untitled project',
    canvas_width integer not null default 1080 check (canvas_width between 1 and 8192),
    canvas_height integer not null default 1920 check (canvas_height between 1 and 8192),
    frame_rate numeric(5,2) not null default 30 check (frame_rate > 0 and frame_rate <= 240),
    project_state jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists vyro_projects_owner_updated_idx
    on public.vyro_projects(owner_id, updated_at desc);

alter table public.vyro_projects enable row level security;

create policy "Owners can read their VYRO projects"
    on public.vyro_projects for select to authenticated
    using ((select auth.uid()) = owner_id);

create policy "Owners can create their VYRO projects"
    on public.vyro_projects for insert to authenticated
    with check ((select auth.uid()) = owner_id);

create policy "Owners can update their VYRO projects"
    on public.vyro_projects for update to authenticated
    using ((select auth.uid()) = owner_id)
    with check ((select auth.uid()) = owner_id);

create policy "Owners can delete their VYRO projects"
    on public.vyro_projects for delete to authenticated
    using ((select auth.uid()) = owner_id);

create table if not exists public.vyro_assets (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references public.vyro_projects(id) on delete cascade,
    owner_id uuid not null references auth.users(id) on delete cascade,
    storage_path text not null,
    media_kind text not null check (media_kind in ('video','audio','image','font','thumbnail','other')),
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    unique (owner_id, storage_path)
);

create index if not exists vyro_assets_project_idx on public.vyro_assets(project_id);
alter table public.vyro_assets enable row level security;

create policy "Owners can read their VYRO assets"
    on public.vyro_assets for select to authenticated
    using (
      (select auth.uid()) = owner_id
      and exists (
        select 1 from public.vyro_projects p
        where p.id = project_id and p.owner_id = (select auth.uid())
      )
    );

create policy "Owners can add assets to their projects"
    on public.vyro_assets for insert to authenticated
    with check (
      (select auth.uid()) = owner_id
      and exists (
        select 1 from public.vyro_projects p
        where p.id = project_id and p.owner_id = (select auth.uid())
      )
    );

create policy "Owners can remove their VYRO assets"
    on public.vyro_assets for delete to authenticated
    using ((select auth.uid()) = owner_id);

-- Entitlements are intentionally read-only to app users.
-- A trusted server/webhook must write these rows after verifying store purchases.
create table if not exists public.vyro_entitlements (
    user_id uuid primary key references auth.users(id) on delete cascade,
    plan_code text not null default 'free' check (plan_code in ('free','pro')),
    status text not null default 'inactive' check (status in ('active','inactive','grace','expired')),
    valid_until timestamptz,
    source text not null default 'none',
    updated_at timestamptz not null default now()
);
alter table public.vyro_entitlements enable row level security;

create policy "Users can read their own VYRO entitlement"
    on public.vyro_entitlements for select to authenticated
    using ((select auth.uid()) = user_id);

-- No INSERT/UPDATE/DELETE policies for authenticated users on entitlements.
-- Never ship a Supabase service-role key in the Android app.
