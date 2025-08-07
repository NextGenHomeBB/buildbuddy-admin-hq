import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  projectId: string;
}

const VendorPicker = ({ projectId }: Props) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();

  const handleCreateAndAdd = async () => {
    if (!name.trim()) {
      toast({ title: "Enter a company name" });
      return;
    }
    try {
      // 1) Create organization (allowed if created_by = auth.uid())
      const { data: org, error: orgErr } = await supabase
        .from("organizations")
        .insert({ name, created_by: (await supabase.auth.getUser()).data.user?.id })
        .select("id")
        .single();
      if (orgErr) throw orgErr;

      // 2) Add as project participant (role='vendor')
      const { error: partErr } = await supabase
        .from("project_participants")
        .insert({ project_id: projectId, org_id: org.id, role: "vendor" });
      if (partErr) throw partErr;

      toast({ title: "Vendor added" });
      qc.invalidateQueries({ queryKey: ["project-participants", projectId] });
      setOpen(false);
      setName("");
    } catch (e: any) {
      const msg = e?.message?.includes("violates row-level security")
        ? "You don’t have access to add vendors."
        : e.message;
      toast({ title: "Action failed", description: msg, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero">Add vendor</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add vendor organization</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Company name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. ACME Subcontracting" />
          </div>
          <Button onClick={handleCreateAndAdd}>Create & add</Button>
          <p className="text-sm text-muted-foreground">Note: searching existing organizations is limited by access policies.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VendorPicker;
