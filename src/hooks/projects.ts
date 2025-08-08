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
        .is("accepted_at", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
