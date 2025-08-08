import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export type Membership = {
  org_id: string;
  role: string;
  org_name: string;
};

export const useActiveOrg = () => {
  const { user, loading: authLoading, activeOrgId, setActiveOrgId } = useAuth();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (authLoading) return; // wait for auth
      if (!user) {
        setMemberships([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from("organization_members")
        .select("org_id, role, organizations(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      if (cancelled) return;
      if (!error) {
        const mapped: Membership[] = (data || []).map((m: any) => ({
          org_id: m.org_id,
          role: m.role,
          org_name: m.organizations?.name ?? "Untitled",
        }));
        setMemberships(mapped);
        // If user has orgs but no active selected, pick first and persist
        if (mapped.length > 0 && !localStorage.getItem("active_org_id")) {
          setActiveOrgId(mapped[0].org_id);
        }
      }
      setLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, setActiveOrgId]);

  const value = useMemo(
    () => ({
      activeOrgId,
      setActiveOrgId,
      memberships,
      loading,
      hasAnyOrg: memberships.length > 0,
    }),
    [activeOrgId, memberships, loading, setActiveOrgId]
  );

  return value;
};
