
-- Create organization and add the current user as org_admin in one atomic call
create or replace function public.create_org_with_admin(org_name text)
returns uuid
language plpgsql
security definer
set search_path to public
as $$
declare
  v_org_id uuid;
begin
  -- Must be authenticated
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  -- Create the organization with the current user as creator
  insert into public.organizations (name, created_by)
  values (trim(org_name), auth.uid())
  returning id into v_org_id;

  -- Make the creator an admin member of the org
  insert into public.organization_members (org_id, user_id, role)
  values (v_org_id, auth.uid(), 'org_admin')
  on conflict do nothing;

  return v_org_id;
end;
$$;

-- Allow the API roles to call it
grant execute on function public.create_org_with_admin(text) to anon, authenticated;
