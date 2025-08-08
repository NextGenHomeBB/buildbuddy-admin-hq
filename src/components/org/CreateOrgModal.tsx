import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateOrgModalProps {
  open: boolean;
  forced?: boolean; // first-run, cannot dismiss
  onClose?: () => void;
}

const CreateOrgModal = ({ open, forced = false, onClose }: CreateOrgModalProps) => {
  const { user, setActiveOrgId } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = name.trim().length > 1 && !!user;

  const onCreate = async () => {
    if (!canSubmit || !user) return;
    setLoading(true);
    try {
      // Create via RPC to ensure admin membership and avoid RLS issues
      const { data: orgId, error: createError } = await supabase.rpc('create_org_with_admin', { org_name: name.trim() });
      if (createError) throw createError;
      if (!orgId) throw new Error('No organization id returned');
      // Optional WhatsApp phone update
      const phoneVal = phone.trim();
      if (phoneVal) {
        const { error: phoneError } = await supabase
          .from('organizations')
          .update({ whatsapp_phone: phoneVal })
          .eq('id', orgId as string);
        if (phoneError) throw phoneError;
      }
      setActiveOrgId(orgId as string);
      toast({ title: "Organization created", description: "Welcome to BuildBuddy!" });
      onClose?.();
      setName("");
      setPhone("");
    } catch (e: any) {
      toast({ title: "Could not create organization", description: e.message || "Try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v)=>{ if (!forced && !v) onClose?.(); }}>
      <DialogContent aria-describedby={undefined} onInteractOutside={(e)=>{ if (forced) e.preventDefault(); }}>
        <DialogHeader>
          <DialogTitle>Create your organization</DialogTitle>
          <DialogDescription>Set up your first organization to get started.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm">Organization name</label>
            <Input value={name} onChange={(e)=>setName(e.target.value)} placeholder="ACME Builders" />
          </div>
          <div className="space-y-2">
            <label className="text-sm">WhatsApp phone (optional)</label>
            <Input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="+1 555 123 4567" />
          </div>
          <Button onClick={onCreate} disabled={!canSubmit || loading} className="w-full">
            {loading ? "Creating…" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOrgModal;
