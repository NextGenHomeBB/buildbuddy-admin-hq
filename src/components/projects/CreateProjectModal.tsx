import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CreateProjectModalProps {
  open: boolean;
  orgId: string;
  onClose: () => void;
  onCreated?: (projectId: string) => void;
}

const CreateProjectModal = ({ open, orgId, onClose, onCreated }: CreateProjectModalProps) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = name.trim().length > 1 && !!orgId;

  const onCreate = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert({ name: name.trim(), org_id: orgId })
        .select("id")
        .single();

      if (error) throw error;

      toast({ title: "Project created" });
      onCreated?.(data.id);
      onClose();
      setName("");
    } catch (e: any) {
      toast({ title: "Failed to create project", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>Name your project to get started.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-sm">Project name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Downtown Renovation"
              autoFocus
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button onClick={onCreate} disabled={!canSubmit || loading}>
              {loading ? "Creating…" : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectModal;
