-- Create project_invites table for email-based invites without service role
create table if not exists public.project_invites (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  employer_org_id uuid not null,
  email text not null,
  token uuid not null unique,
  expires_at timestamptz not null,
  accepted_at timestamptz null,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.project_invites enable row level security;

-- Indexes
create index if not exists idx_project_invites_project on public.project_invites(project_id);
create index if not exists idx_project_invites_email on public.project_invites(email);
create index if not exists idx_project_invites_employer on public.project_invites(employer_org_id);

-- Policies
-- 1) Owner managers can create invites for their projects
create policy if not exists "owner managers create invites"
  on public.project_invites
  for insert
  to authenticated
  with check (
    has_org_role(project_owner_org(project_id), array['org_admin','manager'])
  );

-- 2) Owner org members can read invites for their projects
create policy if not exists "owner members read invites"
  on public.project_invites
  for select
  to authenticated
  using (
    is_org_member(project_owner_org(project_id))
  );

-- 3) Invited user can read their own pending invites by email
create policy if not exists "invited user reads own invites"
  on public.project_invites
  for select
  to authenticated
  using (
    (auth.jwt() ->> 'email') is not null and (auth.jwt() ->> 'email') = email
  );

-- 4) Owner managers can delete (revoke) invites
create policy if not exists "owner managers delete invites"
  on public.project_invites
  for delete
  to authenticated
  using (
    has_org_role(project_owner_org(project_id), array['org_admin','manager'])
  );

-- 5) Owner managers can update invites (e.g., mark accepted)
create policy if not exists "owner managers update invites"
  on public.project_invites
  for update
  to authenticated
  using (
    has_org_role(project_owner_org(project_id), array['org_admin','manager'])
  );

-- 6) Invited user can mark invite accepted (self-accept)
create policy if not exists "invited user accepts invite"
  on public.project_invites
  for update
  to authenticated
  using (
    accepted_at is null and (auth.jwt() ->> 'email') = email
  )
  with check (
    accepted_at is not null and (auth.jwt() ->> 'email') = email
  );