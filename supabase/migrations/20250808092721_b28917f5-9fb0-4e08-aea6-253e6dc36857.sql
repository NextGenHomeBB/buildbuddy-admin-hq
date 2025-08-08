-- Create trigger to auto-add organization creator as admin member
create or replace function public.handle_new_organization_member()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Insert creator as org_admin member
  if new.created_by is not null then
    insert into public.organization_members(org_id, user_id, role)
    values (new.id, new.created_by, 'org_admin')
    on conflict do nothing;
  end if;
  return new;
end;
$$;

-- Create trigger on organizations table
create trigger organizations_add_creator_member
after insert on public.organizations
for each row execute function public.handle_new_organization_member();