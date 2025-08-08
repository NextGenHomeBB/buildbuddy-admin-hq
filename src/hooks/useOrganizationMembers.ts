import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useActiveOrg } from "./useActiveOrg";

export const useOrganizationMembers = () => {
  const { activeOrgId } = useActiveOrg();

  return useQuery({
    queryKey: ["organization-members", activeOrgId],
    queryFn: async () => {
      if (!activeOrgId) throw new Error("No active organization");

      const { data, error } = await supabase
        .from("organization_members")
        .select(`
          user_id,
          role,
          created_at
        `)
        .eq("org_id", activeOrgId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!activeOrgId,
  });
};