-- Add WhatsApp phone column to organizations
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS whatsapp_phone text;

-- Update RLS to allow org admins to update organization details
DROP POLICY IF EXISTS "org admins update org" ON public.organizations;

CREATE POLICY "org admins update org"
ON public.organizations
FOR UPDATE
USING (
  has_org_role(id, ARRAY['org_admin']::text[])
);
