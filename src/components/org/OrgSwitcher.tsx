import { useEffect, useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
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
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name")
        .order("name");
      if (!cancelled && !error) setOrgs(data || []);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-select a single organization so admins don't need to choose
  useEffect(() => {
    if (orgs.length === 1 && activeOrgId !== orgs[0].id) {
      setActiveOrgId(orgs[0].id);
    }
  }, [orgs, activeOrgId, setActiveOrgId]);

  const value = useMemo(() => activeOrgId ?? undefined, [activeOrgId]);

  return (
    <>
      {orgs.length === 0 ? (
        needsOrgSetup ? (
          <Button size="sm" onClick={() => navigate("/onboarding")}>
            Create organization
          </Button>
        ) : (
          <div className="text-sm text-muted-foreground">No organizations</div>
        )
      ) : orgs.length === 1 ? (
        <div className="text-sm">{orgs[0].name}</div>
      ) : (
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
            <SelectValue placeholder="Select organization" />
          </SelectTrigger>
          <SelectContent>
            {orgs.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </>
  );
};

export default OrgSwitcher;
