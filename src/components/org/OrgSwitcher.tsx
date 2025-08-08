import { useEffect, useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const OrgSwitcher = () => {
  const { activeOrgId, setActiveOrgId } = useAuth();
  const [orgs, setOrgs] = useState<{ id: string; name: string }[]>([]);

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
    <Select value={value} onValueChange={(v) => setActiveOrgId(v)}>
      <SelectTrigger className="h-8 w-[220px]">
        <SelectValue placeholder="Select organization" />
      </SelectTrigger>
      <SelectContent>
        {orgs.map((o) => (
          <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default OrgSwitcher;
