import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export type OrganizationMember = {
  user_id: string;
  role: string;
  created_at: string;
  user_email?: string;
  user_name?: string;
};

export const useOrganizationMembers = (orgId: string | null) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId || !user) {
      setMembers([]);
      setLoading(false);
      return;
    }

    const fetchMembers = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from("organization_members")
          .select(`
            user_id,
            role,
            created_at
          `)
          .eq("org_id", orgId)
          .order("created_at", { ascending: true });

        if (fetchError) throw fetchError;

        setMembers(data || []);
      } catch (err) {
        console.error("Error fetching organization members:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch members");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [orgId, user]);

  return { members, loading, error };
};