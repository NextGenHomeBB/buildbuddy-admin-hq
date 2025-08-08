
-- 1) Make RLS helper functions run as SECURITY DEFINER to avoid recursion and RLS loops

CREATE OR REPLACE FUNCTION public.is_org_member(check_org uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members m
    WHERE m.org_id = check_org
      AND m.user_id = auth.uid()
  );
$function$;

CREATE OR REPLACE FUNCTION public.has_org_role(check_org uuid, roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members m
    WHERE m.org_id = check_org
      AND m.user_id = auth.uid()
      AND m.role = ANY(roles)
  );
$function$;

-- 2) Ensure the trigger that auto-adds the creator as org_admin exists
-- The function public.handle_new_organization_member() already exists.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'organizations_add_creator_member'
  ) THEN
    CREATE TRIGGER organizations_add_creator_member
    AFTER INSERT ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_organization_member();
  END IF;
END$$;
