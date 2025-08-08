BEGIN;

-- Add helpful columns to existing tables
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS planned_hours numeric;
ALTER TABLE public.project_phases ADD COLUMN IF NOT EXISTS start_date date;
ALTER TABLE public.project_phases ADD COLUMN IF NOT EXISTS end_date date;

-- Clients
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read clients" ON public.clients FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "managers ins clients" ON public.clients FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['org_admin','manager']));
CREATE POLICY "managers upd clients" ON public.clients FOR UPDATE USING (has_org_role(org_id, ARRAY['org_admin','manager']));
CREATE POLICY "managers del clients" ON public.clients FOR DELETE USING (has_org_role(org_id, ARRAY['org_admin','manager']));

-- Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  client_id uuid,
  status text NOT NULL DEFAULT 'draft',
  total numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read invoices" ON public.invoices FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "managers ins invoices" ON public.invoices FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['org_admin','manager']));
CREATE POLICY "managers upd invoices" ON public.invoices FOR UPDATE USING (has_org_role(org_id, ARRAY['org_admin','manager']));
CREATE POLICY "managers del invoices" ON public.invoices FOR DELETE USING (has_org_role(org_id, ARRAY['org_admin','manager']));

-- Invoice lines
CREATE TABLE IF NOT EXISTS public.invoice_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL,
  org_id uuid,
  description text NOT NULL,
  amount numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.invoice_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read invoice_lines" ON public.invoice_lines FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "managers ins invoice_lines" ON public.invoice_lines FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['org_admin','manager']));
CREATE POLICY "managers upd invoice_lines" ON public.invoice_lines FOR UPDATE USING (has_org_role(org_id, ARRAY['org_admin','manager']));
CREATE POLICY "managers del invoice_lines" ON public.invoice_lines FOR DELETE USING (has_org_role(org_id, ARRAY['org_admin','manager']));

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL,
  org_id uuid NOT NULL,
  amount numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read payments" ON public.payments FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "managers ins payments" ON public.payments FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['org_admin','manager']));
CREATE POLICY "managers upd payments" ON public.payments FOR UPDATE USING (has_org_role(org_id, ARRAY['org_admin','manager']));
CREATE POLICY "managers del payments" ON public.payments FOR DELETE USING (has_org_role(org_id, ARRAY['org_admin','manager']));

-- Materials
CREATE TABLE IF NOT EXISTS public.materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  sku text,
  name text NOT NULL,
  unit text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read materials" ON public.materials FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "managers ins materials" ON public.materials FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['org_admin','manager']));
CREATE POLICY "managers upd materials" ON public.materials FOR UPDATE USING (has_org_role(org_id, ARRAY['org_admin','manager']));
CREATE POLICY "managers del materials" ON public.materials FOR DELETE USING (has_org_role(org_id, ARRAY['org_admin','manager']));

-- Purchase orders
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  vendor text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  total numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read po" ON public.purchase_orders FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "managers ins po" ON public.purchase_orders FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['org_admin','manager']));
CREATE POLICY "managers upd po" ON public.purchase_orders FOR UPDATE USING (has_org_role(org_id, ARRAY['org_admin','manager']));
CREATE POLICY "managers del po" ON public.purchase_orders FOR DELETE USING (has_org_role(org_id, ARRAY['org_admin','manager']));

-- Budgets
CREATE TABLE IF NOT EXISTS public.budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  project_id uuid NOT NULL,
  total_amount numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read budgets" ON public.budgets FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "managers ins budgets" ON public.budgets FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['org_admin','manager']));
CREATE POLICY "managers upd budgets" ON public.budgets FOR UPDATE USING (has_org_role(org_id, ARRAY['org_admin','manager']));
CREATE POLICY "managers del budgets" ON public.budgets FOR DELETE USING (has_org_role(org_id, ARRAY['org_admin','manager']));

-- Budget lines
CREATE TABLE IF NOT EXISTS public.budget_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id uuid NOT NULL,
  org_id uuid,
  name text NOT NULL,
  amount numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.budget_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read budget_lines" ON public.budget_lines FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "managers ins budget_lines" ON public.budget_lines FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['org_admin','manager']));
CREATE POLICY "managers upd budget_lines" ON public.budget_lines FOR UPDATE USING (has_org_role(org_id, ARRAY['org_admin','manager']));
CREATE POLICY "managers del budget_lines" ON public.budget_lines FOR DELETE USING (has_org_role(org_id, ARRAY['org_admin','manager']));

-- Phase templates
CREATE TABLE IF NOT EXISTS public.phase_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.phase_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read phase_templates" ON public.phase_templates FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "managers ins phase_templates" ON public.phase_templates FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['org_admin','manager']));
CREATE POLICY "managers upd phase_templates" ON public.phase_templates FOR UPDATE USING (has_org_role(org_id, ARRAY['org_admin','manager']));
CREATE POLICY "managers del phase_templates" ON public.phase_templates FOR DELETE USING (has_org_role(org_id, ARRAY['org_admin','manager']));

-- Task assignments
CREATE TABLE IF NOT EXISTS public.task_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL,
  assignee_user_id uuid NOT NULL,
  org_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read task_assignments" ON public.task_assignments FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "managers ins task_assignments" ON public.task_assignments FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['org_admin','manager']));
CREATE POLICY "managers upd task_assignments" ON public.task_assignments FOR UPDATE USING (has_org_role(org_id, ARRAY['org_admin','manager']));
CREATE POLICY "managers del task_assignments" ON public.task_assignments FOR DELETE USING (has_org_role(org_id, ARRAY['org_admin','manager']));

-- Attachments
CREATE TABLE IF NOT EXISTS public.attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid,
  project_id uuid NOT NULL,
  task_id uuid,
  file_name text NOT NULL,
  url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read attachments" ON public.attachments FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "members ins attachments" ON public.attachments FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY "members upd attachments" ON public.attachments FOR UPDATE USING (has_org_role(org_id, ARRAY['org_admin','manager']));
CREATE POLICY "members del attachments" ON public.attachments FOR DELETE USING (has_org_role(org_id, ARRAY['org_admin','manager']));

-- Shifts
CREATE TABLE IF NOT EXISTS public.shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  project_id uuid,
  user_id uuid NOT NULL,
  start_at timestamptz NOT NULL,
  end_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read shifts" ON public.shifts FOR SELECT USING (is_org_member(org_id) OR user_id = auth.uid());
CREATE POLICY "members ins shifts" ON public.shifts FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['org_admin','manager']));
CREATE POLICY "members upd shifts" ON public.shifts FOR UPDATE USING (has_org_role(org_id, ARRAY['org_admin','manager']));
CREATE POLICY "members del shifts" ON public.shifts FOR DELETE USING (has_org_role(org_id, ARRAY['org_admin','manager']));

-- Worker locations
CREATE TABLE IF NOT EXISTS public.worker_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  user_id uuid NOT NULL,
  project_id uuid,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.worker_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read worker_locations" ON public.worker_locations FOR SELECT USING (is_org_member(org_id) OR user_id = auth.uid());
CREATE POLICY "members ins worker_locations" ON public.worker_locations FOR INSERT WITH CHECK (is_org_member(org_id) AND user_id = auth.uid());
CREATE POLICY "members del worker_locations" ON public.worker_locations FOR DELETE USING (has_org_role(org_id, ARRAY['org_admin','manager']));

-- Worker Exchange tables
CREATE TABLE IF NOT EXISTS public.labor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  user_id uuid NOT NULL,
  skills jsonb,
  certs jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.labor_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read labor_profiles" ON public.labor_profiles FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "managers ins labor_profiles" ON public.labor_profiles FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['org_admin','manager']));
CREATE POLICY "managers upd labor_profiles" ON public.labor_profiles FOR UPDATE USING (has_org_role(org_id, ARRAY['org_admin','manager']));
CREATE POLICY "managers del labor_profiles" ON public.labor_profiles FOR DELETE USING (has_org_role(org_id, ARRAY['org_admin','manager']));

CREATE TABLE IF NOT EXISTS public.rate_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  profile_id uuid NOT NULL,
  hourly_eur numeric NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.rate_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read rate_cards" ON public.rate_cards FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "managers ins rate_cards" ON public.rate_cards FOR INSERT WITH CHECK (has_org_role(org_id, ARRAY['org_admin','manager']));
CREATE POLICY "managers upd rate_cards" ON public.rate_cards FOR UPDATE USING (has_org_role(org_id, ARRAY['org_admin','manager']));
CREATE POLICY "managers del rate_cards" ON public.rate_cards FOR DELETE USING (has_org_role(org_id, ARRAY['org_admin','manager']));

CREATE TABLE IF NOT EXISTS public.labor_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id_client uuid NOT NULL,
  project_id uuid,
  role text NOT NULL,
  needed_from date,
  needed_to date,
  qty integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.labor_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "client members read requests" ON public.labor_requests FOR SELECT USING (is_org_member(org_id_client));
CREATE POLICY "client managers ins requests" ON public.labor_requests FOR INSERT WITH CHECK (has_org_role(org_id_client, ARRAY['org_admin','manager']));
CREATE POLICY "client managers upd requests" ON public.labor_requests FOR UPDATE USING (has_org_role(org_id_client, ARRAY['org_admin','manager']));
CREATE POLICY "client managers del requests" ON public.labor_requests FOR DELETE USING (has_org_role(org_id_client, ARRAY['org_admin','manager']));

CREATE TABLE IF NOT EXISTS public.labor_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id_vendor uuid NOT NULL,
  profile_id uuid NOT NULL,
  available_from date,
  available_to date,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.labor_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vendor members read offers" ON public.labor_offers FOR SELECT USING (is_org_member(org_id_vendor));
CREATE POLICY "vendor managers ins offers" ON public.labor_offers FOR INSERT WITH CHECK (has_org_role(org_id_vendor, ARRAY['org_admin','manager']));
CREATE POLICY "vendor managers upd offers" ON public.labor_offers FOR UPDATE USING (has_org_role(org_id_vendor, ARRAY['org_admin','manager']));
CREATE POLICY "vendor managers del offers" ON public.labor_offers FOR DELETE USING (has_org_role(org_id_vendor, ARRAY['org_admin','manager']));

CREATE TABLE IF NOT EXISTS public.labor_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  offer_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'proposed',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.labor_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "participants read matches" ON public.labor_matches FOR SELECT USING (
  is_org_member((SELECT lr.org_id_client FROM public.labor_requests lr WHERE lr.id = labor_matches.request_id))
  OR is_org_member((SELECT lo.org_id_vendor FROM public.labor_offers lo WHERE lo.id = labor_matches.offer_id))
);
CREATE POLICY "participants ins matches" ON public.labor_matches FOR INSERT WITH CHECK (
  has_org_role((SELECT lr.org_id_client FROM public.labor_requests lr WHERE lr.id = labor_matches.request_id), ARRAY['org_admin','manager'])
  OR has_org_role((SELECT lo.org_id_vendor FROM public.labor_offers lo WHERE lo.id = labor_matches.offer_id), ARRAY['org_admin','manager'])
);
CREATE POLICY "participants upd matches" ON public.labor_matches FOR UPDATE USING (
  is_org_member((SELECT lr.org_id_client FROM public.labor_requests lr WHERE lr.id = labor_matches.request_id))
  OR is_org_member((SELECT lo.org_id_vendor FROM public.labor_offers lo WHERE lo.id = labor_matches.offer_id))
);
CREATE POLICY "participants del matches" ON public.labor_matches FOR DELETE USING (
  has_org_role((SELECT lr.org_id_client FROM public.labor_requests lr WHERE lr.id = labor_matches.request_id), ARRAY['org_admin','manager'])
  OR has_org_role((SELECT lo.org_id_vendor FROM public.labor_offers lo WHERE lo.id = labor_matches.offer_id), ARRAY['org_admin','manager'])
);

CREATE TABLE IF NOT EXISTS public.intercompany_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_org_id uuid NOT NULL,
  vendor_org_id uuid NOT NULL,
  terms jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.intercompany_contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "participants read contracts" ON public.intercompany_contracts FOR SELECT USING (
  is_org_member(client_org_id) OR is_org_member(vendor_org_id)
);
CREATE POLICY "participants ins contracts" ON public.intercompany_contracts FOR INSERT WITH CHECK (
  has_org_role(client_org_id, ARRAY['org_admin','manager']) OR has_org_role(vendor_org_id, ARRAY['org_admin','manager'])
);
CREATE POLICY "participants upd contracts" ON public.intercompany_contracts FOR UPDATE USING (
  has_org_role(client_org_id, ARRAY['org_admin','manager']) OR has_org_role(vendor_org_id, ARRAY['org_admin','manager'])
);
CREATE POLICY "participants del contracts" ON public.intercompany_contracts FOR DELETE USING (
  has_org_role(client_org_id, ARRAY['org_admin','manager']) OR has_org_role(vendor_org_id, ARRAY['org_admin','manager'])
);

CREATE TABLE IF NOT EXISTS public.cross_org_timesheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL,
  worker_user_id uuid NOT NULL,
  date date NOT NULL,
  minutes integer NOT NULL,
  approved_by_client boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cross_org_timesheets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "participants read cross_org_timesheets" ON public.cross_org_timesheets FOR SELECT USING (
  is_org_member((SELECT lr.org_id_client FROM public.labor_requests lr WHERE lr.id = (SELECT m.request_id FROM public.labor_matches m WHERE m.id = cross_org_timesheets.match_id)))
  OR is_org_member((SELECT lo.org_id_vendor FROM public.labor_offers lo WHERE lo.id = (SELECT m.offer_id FROM public.labor_matches m WHERE m.id = cross_org_timesheets.match_id)))
  OR worker_user_id = auth.uid()
);
CREATE POLICY "vendor managers ins cross_org_timesheets" ON public.cross_org_timesheets FOR INSERT WITH CHECK (
  has_org_role((SELECT lo.org_id_vendor FROM public.labor_offers lo WHERE lo.id = (SELECT m.offer_id FROM public.labor_matches m WHERE m.id = cross_org_timesheets.match_id)), ARRAY['org_admin','manager'])
);
CREATE POLICY "client managers approve cross_org_timesheets" ON public.cross_org_timesheets FOR UPDATE USING (
  has_org_role((SELECT lr.org_id_client FROM public.labor_requests lr WHERE lr.id = (SELECT m.request_id FROM public.labor_matches m WHERE m.id = cross_org_timesheets.match_id)), ARRAY['org_admin','manager'])
);
CREATE POLICY "participants del cross_org_timesheets" ON public.cross_org_timesheets FOR DELETE USING (
  has_org_role((SELECT lr.org_id_client FROM public.labor_requests lr WHERE lr.id = (SELECT m.request_id FROM public.labor_matches m WHERE m.id = cross_org_timesheets.match_id)), ARRAY['org_admin','manager'])
  OR has_org_role((SELECT lo.org_id_vendor FROM public.labor_offers lo WHERE lo.id = (SELECT m.offer_id FROM public.labor_matches m WHERE m.id = cross_org_timesheets.match_id)), ARRAY['org_admin','manager'])
);

CREATE TABLE IF NOT EXISTS public.settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  subtotal numeric,
  vat numeric,
  total numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "participants read settlements" ON public.settlements FOR SELECT USING (
  is_org_member((SELECT client_org_id FROM public.intercompany_contracts c WHERE c.id = settlements.contract_id))
  OR is_org_member((SELECT vendor_org_id FROM public.intercompany_contracts c WHERE c.id = settlements.contract_id))
);
CREATE POLICY "participants ins settlements" ON public.settlements FOR INSERT WITH CHECK (
  has_org_role((SELECT client_org_id FROM public.intercompany_contracts c WHERE c.id = settlements.contract_id), ARRAY['org_admin','manager'])
  OR has_org_role((SELECT vendor_org_id FROM public.intercompany_contracts c WHERE c.id = settlements.contract_id), ARRAY['org_admin','manager'])
);
CREATE POLICY "participants upd settlements" ON public.settlements FOR UPDATE USING (
  has_org_role((SELECT client_org_id FROM public.intercompany_contracts c WHERE c.id = settlements.contract_id), ARRAY['org_admin','manager'])
  OR has_org_role((SELECT vendor_org_id FROM public.intercompany_contracts c WHERE c.id = settlements.contract_id), ARRAY['org_admin','manager'])
);
CREATE POLICY "participants del settlements" ON public.settlements FOR DELETE USING (
  has_org_role((SELECT client_org_id FROM public.intercompany_contracts c WHERE c.id = settlements.contract_id), ARRAY['org_admin','manager'])
  OR has_org_role((SELECT vendor_org_id FROM public.intercompany_contracts c WHERE c.id = settlements.contract_id), ARRAY['org_admin','manager'])
);

-- Triggers to set org_id defaults where appropriate
CREATE OR REPLACE FUNCTION public.trg_invoice_lines_set_defaults()
RETURNS trigger AS $$
BEGIN
  IF NEW.org_id IS NULL THEN
    SELECT i.org_id INTO NEW.org_id FROM public.invoices i WHERE i.id = NEW.invoice_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_invoice_lines_defaults ON public.invoice_lines;
CREATE TRIGGER trg_invoice_lines_defaults
BEFORE INSERT ON public.invoice_lines
FOR EACH ROW EXECUTE FUNCTION public.trg_invoice_lines_set_defaults();

CREATE OR REPLACE FUNCTION public.trg_budget_lines_set_defaults2()
RETURNS trigger AS $$
BEGIN
  IF NEW.org_id IS NULL THEN
    SELECT b.org_id INTO NEW.org_id FROM public.budgets b WHERE b.id = NEW.budget_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_budget_lines_defaults2 ON public.budget_lines;
CREATE TRIGGER trg_budget_lines_defaults2
BEFORE INSERT ON public.budget_lines
FOR EACH ROW EXECUTE FUNCTION public.trg_budget_lines_set_defaults2();

CREATE OR REPLACE FUNCTION public.trg_task_assignments_set_defaults()
RETURNS trigger AS $$
DECLARE v_project uuid;
BEGIN
  IF NEW.org_id IS NULL THEN
    SELECT t.org_id INTO NEW.org_id FROM public.tasks t WHERE t.id = NEW.task_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_task_assignments_defaults ON public.task_assignments;
CREATE TRIGGER trg_task_assignments_defaults
BEFORE INSERT ON public.task_assignments
FOR EACH ROW EXECUTE FUNCTION public.trg_task_assignments_set_defaults();

CREATE OR REPLACE FUNCTION public.trg_attachments_set_defaults()
RETURNS trigger AS $$
BEGIN
  IF NEW.org_id IS NULL THEN
    SELECT p.org_id INTO NEW.org_id FROM public.projects p WHERE p.id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_attachments_defaults ON public.attachments;
CREATE TRIGGER trg_attachments_defaults
BEFORE INSERT ON public.attachments
FOR EACH ROW EXECUTE FUNCTION public.trg_attachments_set_defaults();

COMMIT;