
-- 1) Add WhatsApp phone column to organizations
alter table public.organizations
  add column if not exists whatsapp_phone text;

-- 2) Ensure RLS is enabled (safe if already enabled)
alter table public.organizations enable row level security;

-- 3) Allow org admins to update org details (in addition to any existing policy)
create policy if not exists "admins update org details"
on public.organizations
for update
using (has_org_role(id, array['org_admin'::text]))
with check (has_org_role(id, array['org_admin'::text]));
