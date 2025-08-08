
-- 1) PROJECT PHASES
create table if not exists public.project_phases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  org_id uuid not null,
  name text not null,
  seq integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_project_phases_project_seq
  on public.project_phases(project_id, seq);

create or replace function public.trg_project_phases_set_defaults()
returns trigger
language plpgsql
as $$
begin
  -- scope to project's org
  if new.org_id is null then
    select p.org_id into new.org_id from public.projects p where p.id = new.project_id;
  end if;

  -- auto sequence within project
  if new.seq is null or new.seq = 0 then
    select coalesce(max(seq),0)+1 into new.seq
    from public.project_phases
    where project_id = new.project_id;
  end if;

  return new;
end
$$;

drop trigger if exists project_phases_set_defaults on public.project_phases;
create trigger project_phases_set_defaults
before insert or update on public.project_phases
for each row execute function public.trg_project_phases_set_defaults();

alter table public.project_phases enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='project_phases' and policyname='members read phases'
  ) then
    create policy "members read phases"
      on public.project_phases
      for select
      using (is_org_member(org_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='project_phases' and policyname='managers ins phases'
  ) then
    create policy "managers ins phases"
      on public.project_phases
      for insert
      with check (has_org_role(org_id, ARRAY['org_admin','manager']));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='project_phases' and policyname='managers upd phases'
  ) then
    create policy "managers upd phases"
      on public.project_phases
      for update
      using (has_org_role(org_id, ARRAY['org_admin','manager']));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='project_phases' and policyname='managers del phases'
  ) then
    create policy "managers del phases"
      on public.project_phases
      for delete
      using (has_org_role(org_id, ARRAY['org_admin','manager']));
  end if;
end $$;

-- 2) TASKS: add phase_id, seq, org_id
alter table public.tasks add column if not exists phase_id uuid null;
alter table public.tasks add column if not exists seq integer not null default 0;
alter table public.tasks add column if not exists org_id uuid null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'tasks_phase_fk'
  ) then
    alter table public.tasks
      add constraint tasks_phase_fk
      foreign key (phase_id) references public.project_phases(id) on delete set null;
  end if;
end $$;

create index if not exists idx_tasks_project_phase_seq
  on public.tasks(project_id, phase_id, seq);

create index if not exists idx_tasks_project
  on public.tasks(project_id);

create or replace function public.trg_tasks_set_defaults()
returns trigger
language plpgsql
as $$
declare
  v_phase_project uuid;
begin
  -- set org from project
  if new.org_id is null then
    select p.org_id into new.org_id from public.projects p where p.id = new.project_id;
  end if;

  -- ensure phase belongs to same project
  if new.phase_id is not null then
    select ph.project_id into v_phase_project from public.project_phases ph where ph.id = new.phase_id;
    if v_phase_project is null then
      raise exception 'phase_id % does not exist', new.phase_id;
    end if;
    if v_phase_project <> new.project_id then
      raise exception 'phase % belongs to a different project', new.phase_id;
    end if;
  end if;

  -- auto sequence per project + phase bucket
  if new.seq is null or new.seq = 0 then
    if new.phase_id is null then
      select coalesce(max(seq),0)+1 into new.seq
      from public.tasks
      where project_id = new.project_id and phase_id is null;
    else
      select coalesce(max(seq),0)+1 into new.seq
      from public.tasks
      where project_id = new.project_id and phase_id = new.phase_id;
    end if;
  end if;

  return new;
end
$$;

drop trigger if exists tasks_set_defaults on public.tasks;
create trigger tasks_set_defaults
before insert or update on public.tasks
for each row execute function public.trg_tasks_set_defaults();

-- backfill org_id and seq for existing rows
update public.tasks t
set org_id = p.org_id
from public.projects p
where t.org_id is null and t.project_id = p.id;

with numbered as (
  select id, row_number() over (partition by project_id, phase_id order by created_at asc) as rn
  from public.tasks
)
update public.tasks t
set seq = n.rn
from numbered n
where t.id = n.id and coalesce(t.seq,0)=0;

-- 3) CHECKLISTS
create table if not exists public.checklists (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  org_id uuid not null,
  title text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_checklists_project_task
  on public.checklists(project_id, task_id);

create or replace function public.trg_checklists_set_defaults()
returns trigger
language plpgsql
as $$
declare
  v_task_project uuid;
begin
  -- scope to project's org
  if new.org_id is null then
    select p.org_id into new.org_id from public.projects p where p.id = new.project_id;
  end if;

  -- ensure task belongs to project
  select t.project_id into v_task_project from public.tasks t where t.id = new.task_id;
  if v_task_project is null then
    raise exception 'task_id % does not exist', new.task_id;
  end if;
  if v_task_project <> new.project_id then
    raise exception 'task % does not belong to project %', new.task_id, new.project_id;
  end if;

  return new;
end
$$;

drop trigger if exists checklists_set_defaults on public.checklists;
create trigger checklists_set_defaults
before insert or update on public.checklists
for each row execute function public.trg_checklists_set_defaults();

alter table public.checklists enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='checklists' and policyname='members read checklists') then
    create policy "members read checklists"
      on public.checklists
      for select
      using (is_org_member(org_id));
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='checklists' and policyname='managers ins checklists') then
    create policy "managers ins checklists"
      on public.checklists
      for insert
      with check (has_org_role(org_id, ARRAY['org_admin','manager']));
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='checklists' and policyname='managers upd checklists') then
    create policy "managers upd checklists"
      on public.checklists
      for update
      using (has_org_role(org_id, ARRAY['org_admin','manager']));
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='checklists' and policyname='managers del checklists') then
    create policy "managers del checklists"
      on public.checklists
      for delete
      using (has_org_role(org_id, ARRAY['org_admin','manager']));
  end if;
end $$;

-- 4) CHECKLIST ITEMS
create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid not null references public.checklists(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  org_id uuid not null,
  title text not null,
  done boolean not null default false,
  seq integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_checklist_items_checklist_seq
  on public.checklist_items(checklist_id, seq);

create index if not exists idx_checklist_items_project_task
  on public.checklist_items(project_id, task_id);

create or replace function public.trg_checklist_items_set_defaults()
returns trigger
language plpgsql
as $$
declare
  v_check_task uuid;
  v_check_project uuid;
begin
  -- set org based on project
  if new.org_id is null then
    select p.org_id into new.org_id from public.projects p where p.id = new.project_id;
  end if;

  -- pull task/project from checklist when not provided, and enforce consistency
  select c.task_id, c.project_id into v_check_task, v_check_project
  from public.checklists c
  where c.id = new.checklist_id;

  if v_check_task is null then
    raise exception 'checklist_id % does not exist', new.checklist_id;
  end if;

  if new.task_id is null then
    new.task_id := v_check_task;
  end if;
  if new.project_id is null then
    new.project_id := v_check_project;
  end if;

  if new.task_id <> v_check_task then
    raise exception 'item.task_id must match checklist.task_id';
  end if;
  if new.project_id <> v_check_project then
    raise exception 'item.project_id must match checklist.project_id';
  end if;

  -- auto sequence per checklist
  if new.seq is null or new.seq = 0 then
    select coalesce(max(seq),0)+1 into new.seq
    from public.checklist_items
    where checklist_id = new.checklist_id;
  end if;

  return new;
end
$$;

drop trigger if exists checklist_items_set_defaults on public.checklist_items;
create trigger checklist_items_set_defaults
before insert or update on public.checklist_items
for each row execute function public.trg_checklist_items_set_defaults();

alter table public.checklist_items enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='checklist_items' and policyname='members read checklist_items') then
    create policy "members read checklist_items"
      on public.checklist_items
      for select
      using (is_org_member(org_id));
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='checklist_items' and policyname='managers ins checklist_items') then
    create policy "managers ins checklist_items"
      on public.checklist_items
      for insert
      with check (has_org_role(org_id, ARRAY['org_admin','manager']));
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='checklist_items' and policyname='managers upd checklist_items') then
    create policy "managers upd checklist_items"
      on public.checklist_items
      for update
      using (has_org_role(org_id, ARRAY['org_admin','manager']));
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='checklist_items' and policyname='managers del checklist_items') then
    create policy "managers del checklist_items"
      on public.checklist_items
      for delete
      using (has_org_role(org_id, ARRAY['org_admin','manager']));
  end if;
end $$;

-- 5) PROJECT BUDGET LINES
create table if not exists public.project_budget_lines (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  org_id uuid not null,
  category text not null,
  name text not null,
  planned_amount numeric,
  currency text not null default 'EUR',
  created_at timestamptz not null default now()
);

create index if not exists idx_budget_lines_project
  on public.project_budget_lines(project_id);

create or replace function public.trg_budget_lines_set_defaults()
returns trigger
language plpgsql
as $$
begin
  if new.org_id is null then
    select p.org_id into new.org_id from public.projects p where p.id = new.project_id;
  end if;
  return new;
end
$$;

drop trigger if exists budget_lines_set_defaults on public.project_budget_lines;
create trigger budget_lines_set_defaults
before insert or update on public.project_budget_lines
for each row execute function public.trg_budget_lines_set_defaults();

alter table public.project_budget_lines enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='project_budget_lines' and policyname='members read budget') then
    create policy "members read budget"
      on public.project_budget_lines
      for select
      using (is_org_member(org_id));
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='project_budget_lines' and policyname='managers ins budget') then
    create policy "managers ins budget"
      on public.project_budget_lines
      for insert
      with check (has_org_role(org_id, ARRAY['org_admin','manager']));
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='project_budget_lines' and policyname='managers upd budget') then
    create policy "managers upd budget"
      on public.project_budget_lines
      for update
      using (has_org_role(org_id, ARRAY['org_admin','manager']));
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='project_budget_lines' and policyname='managers del budget') then
    create policy "managers del budget"
      on public.project_budget_lines
      for delete
      using (has_org_role(org_id, ARRAY['org_admin','manager']));
  end if;
end $$;

-- 6) BUDGET SUMMARY VIEW
create or replace view public.v_project_budget_summary as
with hours as (
  select project_id, coalesce(sum(minutes),0)::numeric / 60.0 as actual_hours
  from public.time_logs
  group by project_id
),
planned as (
  select project_id, currency, coalesce(sum(planned_amount),0) as planned_total
  from public.project_budget_lines
  group by project_id, currency
)
select
  p.project_id,
  p.currency,
  p.planned_total,
  coalesce(h.actual_hours, 0) as actual_hours
from planned p
left join hours h on h.project_id = p.project_id;

-- 7) ENSURE EXPECTED TRIGGERS EXIST
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'organizations_add_creator') then
    create trigger organizations_add_creator
    after insert on public.organizations
    for each row execute function public.add_creator_to_members();
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'projects_ensure_owner_participant') then
    create trigger projects_ensure_owner_participant
    after insert on public.projects
    for each row execute function public.ensure_owner_participant();
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'time_logs_before_insert_defaults') then
    create trigger time_logs_before_insert_defaults
    before insert on public.time_logs
    for each row execute function public.time_logs_defaults();
  end if;
end $$;

-- 8) REALTIME OPT-IN
alter table public.project_phases replica identity full;
alter table public.checklists replica identity full;
alter table public.checklist_items replica identity full;
alter table public.project_budget_lines replica identity full;
alter table public.tasks replica identity full;

do $$
begin
  begin
    alter publication supabase_realtime add table public.project_phases;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.checklists;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.checklist_items;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.project_budget_lines;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.tasks;
  exception when duplicate_object then null;
  end;
end $$;
