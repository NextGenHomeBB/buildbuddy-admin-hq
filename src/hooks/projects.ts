import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProject = (projectId?: string) =>
  useQuery({
    queryKey: ["project", projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const useProjectOwnerOrg = (projectId?: string) =>
  useQuery({
    queryKey: ["project-owner-org", projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("project_owner_org", { p_id: projectId });
      if (error) throw error;
      return data as string;
    },
  });

export const useProjectParticipants = (projectId?: string) =>
  useQuery({
    queryKey: ["project-participants", projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_participants")
        .select("project_id, org_id, role, created_at")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

export const useProjectAssignments = (projectId?: string) =>
  useQuery({
    queryKey: ["project-assignments", projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_assignments")
        .select("id, project_id, user_id, employer_org_id, role, is_external, accepted_at, created_at")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export type TimeFilters = {
  status?: ("submitted" | "approved" | "rejected")[];
  company?: "all" | "internal" | "vendors";
  dateFrom?: string; // ISO string or YYYY-MM-DD
  dateTo?: string;   // ISO string or YYYY-MM-DD
  userId?: string;   // exact match
};

export const useTimeLogs = (projectId?: string, filters?: TimeFilters) =>
  useQuery({
    queryKey: ["time-logs", projectId, filters],
    enabled: !!projectId,
    queryFn: async () => {
      let query = supabase
        .from("time_logs")
        .select("id, project_id, user_id, assignment_id, employer_org_id, bill_to_org_id, started_at, ended_at, minutes, status, note, created_at")
        .eq("project_id", projectId);

      if (filters?.status && filters.status.length > 0) {
        query = query.in("status", filters.status);
      }
      if (filters?.dateFrom) {
        const fromIso = filters.dateFrom.length === 10 ? new Date(filters.dateFrom + "T00:00:00Z").toISOString() : filters.dateFrom;
        query = query.gte("started_at", fromIso);
      }
      if (filters?.dateTo) {
        const toIso = filters.dateTo.length === 10 ? new Date(filters.dateTo + "T23:59:59Z").toISOString() : filters.dateTo;
        query = query.lte("started_at", toIso);
      }
      if (filters?.userId) {
        query = query.eq("user_id", filters.userId);
      }

      const { data, error } = await query.order("started_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useProjectInvites = (projectId?: string) =>
  useQuery({
    queryKey: ["project-invites", projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_invites")
        .select("id, project_id, employer_org_id, email, token, expires_at, accepted_at, created_at")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

/**
 * Project phases
 */
export const useProjectPhases = (projectId?: string) =>
  useQuery({
    queryKey: ["project-phases", projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_phases")
        .select("id, project_id, org_id, name, seq, created_at")
        .eq("project_id", projectId)
        .order("seq", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

/**
 * Tasks for a project (optional filter by phase)
 */
export const useProjectTasks = (projectId?: string, phaseId?: string | null) =>
  useQuery({
    queryKey: ["tasks", projectId, phaseId ?? "__all__"],
    enabled: !!projectId,
    queryFn: async () => {
      let q = supabase
        .from("tasks")
        .select("id, project_id, org_id, phase_id, seq, title, status, assignee, due_date, created_at")
        .eq("project_id", projectId)
        .order("seq", { ascending: true });
      if (typeof phaseId !== "undefined") {
        if (phaseId === null) {
          q = q.is("phase_id", null);
        } else {
          q = q.eq("phase_id", phaseId);
        }
      }
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

/**
 * Checklists for a task
 */
export const useTaskChecklists = (projectId?: string, taskId?: string) =>
  useQuery({
    queryKey: ["checklists", projectId, taskId],
    enabled: !!projectId && !!taskId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("checklists")
        .select("id, project_id, task_id, org_id, title, created_at")
        .eq("project_id", projectId)
        .eq("task_id", taskId);
      if (error) throw error;
      return data;
    },
  });

/**
 * Checklist items for a checklist
 */
export const useChecklistItems = (checklistId?: string) =>
  useQuery({
    queryKey: ["checklist-items", checklistId],
    enabled: !!checklistId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("checklist_items")
        .select("id, checklist_id, project_id, task_id, org_id, title, done, seq, created_at")
        .eq("checklist_id", checklistId)
        .order("seq", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

/**
 * Checklist counts for a task (done/total)
 */
export const useChecklistCountsByTask = (taskId?: string) =>
  useQuery({
    queryKey: ["checklist-counts", taskId],
    enabled: !!taskId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("checklist_items")
        .select("done")
        .eq("task_id", taskId);
      if (error) throw error;
      const total = data?.length ?? 0;
      const done = (data || []).filter((d) => d.done).length;
      return { done, total };
    },
  });

/**
 * Budget lines for project
 */
export const useBudgetLines = (projectId?: string) =>
  useQuery({
    queryKey: ["budget-lines", projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_budget_lines")
        .select("id, project_id, org_id, category, name, planned_amount, currency, created_at")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

/**
 * Budget summary view
 */
export const useBudgetSummary = (projectId?: string) =>
  useQuery({
    queryKey: ["budget-summary", projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_project_budget_summary")
        .select("project_id, currency, planned_total, actual_hours")
        .eq("project_id", projectId);
      if (error) throw error;
      return data;
    },
  });
