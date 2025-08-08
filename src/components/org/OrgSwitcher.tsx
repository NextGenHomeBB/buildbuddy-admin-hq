import { useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useActiveOrg } from "@/hooks/useActiveOrg";

interface OrgSwitcherProps {
  onCreateNew?: () => void;
}

const OrgSwitcher = ({ onCreateNew }: OrgSwitcherProps) => {
  const navigate = useNavigate();
  const { activeOrgId, setActiveOrgId, memberships } = useActiveOrg();

  const value = useMemo(() => activeOrgId ?? undefined, [activeOrgId]);

  if (memberships.length === 0) {
    return (
      <Button size="sm" onClick={() => onCreateNew ? onCreateNew() : navigate("/onboarding")}>Create organization</Button>
    );
  }

  if (memberships.length === 1) {
    const m = memberships[0];
    return <div className="text-sm">{m.org_name} <span className="text-muted-foreground">• {m.role}</span></div>;
  }

  return (
    <Select
      value={value}
      onValueChange={(v) => {
        if (v === "__create__") {
          onCreateNew ? onCreateNew() : navigate("/onboarding");
          return;
        }
        setActiveOrgId(v);
      }}
    >
      <SelectTrigger className="h-8 w-[260px]">
        <SelectValue placeholder="Select organization" />
      </SelectTrigger>
      <SelectContent>
        {memberships.map((m) => (
          <SelectItem key={m.org_id} value={m.org_id}>
            {m.org_name} — {m.role}
          </SelectItem>
        ))}
        <SelectItem value="__create__">➕ Create organization</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default OrgSwitcher;
