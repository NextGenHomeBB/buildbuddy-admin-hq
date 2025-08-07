-- Allow org creator to bootstrap membership as org_admin
create policy if not exists "creator can add self as admin"
  on public.organization_members
  for insert
  to authenticated
  with check (
    user_id = auth.uid() and role = 'org_admin' and exists (
      select 1 from public.organizations o where o.id = org_id and o.created_by = auth.uid()
    )
  );