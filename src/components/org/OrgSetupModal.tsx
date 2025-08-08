import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const OrgSetupModal = () => {
  const { needsOrgSetup, createOrganization } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const canSubmit = name.trim().length > 1;

  const onCreate = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await createOrganization(name.trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={needsOrgSetup}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Create your company</DialogTitle>
          <DialogDescription>Set up your first organization to get started.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-sm">Organization name</label>
            <Input value={name} onChange={(e)=>setName(e.target.value)} placeholder="ACME Builders" />
          </div>
          <Button onClick={onCreate} disabled={!canSubmit || loading} className="w-full">
            {loading ? "Creating…" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrgSetupModal;
