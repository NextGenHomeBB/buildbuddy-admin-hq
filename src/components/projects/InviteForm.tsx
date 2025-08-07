import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjectParticipants, useProjectInvites } from "@/hooks/projects";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Props { projectId: string }

const WORKER_APP_URL = "https://worker.example.com"; // Update if needed

const InviteForm = ({ projectId }: Props) => {
  const { data: participants } = useProjectParticipants(projectId);
  const { data: invites } = useProjectInvites(projectId);
  const { toast } = useToast();

  const [orgId, setOrgId] = useState<string | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("worker");
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const createInvite = async () => {
    if (!orgId || !email) {
      toast({ title: "Missing fields", description: "Select a vendor and enter an email." });
      return;
    }
    const token = crypto.randomUUID();
    const expires_at = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    try {
      const { error } = await supabase.from("project_invites").insert({
        project_id: projectId,
        employer_org_id: orgId,
        email,
        token,
        expires_at,
      });
      if (error) throw error;
      const link = `${WORKER_APP_URL}/accept-invite?token=${token}`;
      setInviteLink(link);
      toast({ title: "Invite created", description: "Share the link to the worker." });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    }
  };

  const revokeInvite = async (id: string) => {
    try {
      const { error } = await supabase.from("project_invites").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Invite revoked" });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Create Invite</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <Label>Vendor</Label>
            <Select value={orgId} onValueChange={setOrgId}>
              <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
              <SelectContent>
                {participants?.filter(p=>p.role==='vendor').map(p => (
                  <SelectItem key={p.org_id} value={p.org_id}>{p.org_id}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="worker@vendor.com" />
          </div>
          <div className="space-y-1">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="worker">worker</SelectItem>
                <SelectItem value="foreman">foreman</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-3">
            <Button onClick={createInvite}>Generate link</Button>
          </div>
          {inviteLink && (
            <div className="md:col-span-3 text-sm">
              Invite link: <a className="underline" href={inviteLink} target="_blank" rel="noreferrer">{inviteLink}</a>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Pending Invites</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {invites?.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                <div className="space-y-0.5">
                  <div><span className="font-medium">{inv.email}</span> → org {inv.employer_org_id}</div>
                  <div className="text-muted-foreground">expires {new Date(inv.expires_at).toLocaleDateString()}</div>
                </div>
                <Button size="sm" variant="outline" onClick={()=>revokeInvite(inv.id)}>Revoke</Button>
              </div>
            ))}
            {(!invites || invites.length===0) && <div className="text-muted-foreground">No pending invites.</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteForm;
