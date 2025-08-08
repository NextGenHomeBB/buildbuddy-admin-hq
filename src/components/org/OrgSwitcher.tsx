import { useEffect, useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";


const OrgSwitcher = () => {
  const { activeOrgId, setActiveOrgId, needsOrgSetup } = useAuth();
  const [orgs, setOrgs] = useState<{ id: string; name: string }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data, error } = await supabase.from("organizations").select("id, name").order("name");
      if (!cancelled && !error) setOrgs(data || []);
    };
    load();
    // Optionally subscribe for updates in future
    return () => { cancelled = true; };
  }, []);

  const value = useMemo(() => activeOrgId ?? undefined, [activeOrgId]);

  return (
    <Select
      value={value}
      onValueChange={(v) => {
        if (v === "__create__") {
          navigate("/onboarding");
          return;
        }
        setActiveOrgId(v);
      }}
    >
      <SelectTrigger className="h-8 w-[220px]">
        <SelectValue placeholder={orgs.length ? "Select organization" : "No organizations"} />
      </SelectTrigger>
      <SelectContent>
        {orgs.length > 0 ? (
          orgs.map((o) => (
            <SelectItem key={o.id} value={o.id}>
              {o.name}
            </SelectItem>
          ))
        ) : (
          <>
            <SelectItem value="__no_orgs__" disabled>
              You’re not a member of any organization.
            </SelectItem>
            {needsOrgSetup ? (
              <SelectItem value="__create__">Create organization</SelectItem>
            ) : (
              <SelectItem value="__ask_admin__" disabled>
                Ask an admin to add you
              </SelectItem>
            )}
          </>
        )}
      </SelectContent>
    </Select>
  );
};

export default OrgSwitcher;
