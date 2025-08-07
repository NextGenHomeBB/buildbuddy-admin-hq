import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Seo from "@/components/seo/Seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";

interface InviteRow { id: string; project_id: string; employer_org_id: string; email: string; created_at: string; }

const Onboarding = () => {
  const { toast } = useToast();
  const { user, createOrganization } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [orgName, setOrgName] = useState("");

  const userEmail = useMemo(() => user?.email ?? null, [user]);

  useEffect(() => {
    const run = async () => {
      try {
        const { data: sess } = await supabase.auth.getSession();
        if (!sess.session) {
          navigate('/auth/login', { replace: true });
          return;
        }
        const uid = sess.session.user.id;
        // 1) memberships
        const { data: mems } = await supabase.from('organization_members').select('org_id').eq('user_id', uid);
        if (mems && mems.length > 0) {
          navigate('/org/switch', { replace: true });
          return;
        }
        // 2) accepted assignments
        const { data: assigns } = await supabase
          .from('project_assignments')
          .select('id')
          .eq('user_id', uid)
          .not('accepted_at', 'is', null);
        if (assigns && assigns.length > 0) {
          navigate('/projects', { replace: true });
          return;
        }
        // 3) pending invites for my email
        if (userEmail) {
          const { data: invs } = await supabase
            .from('project_invites')
            .select('id, project_id, employer_org_id, email, created_at')
            .eq('email', userEmail)
            .is('accepted_at', null)
            .order('created_at', { ascending: false });
          if (invs && invs.length > 0) {
            setInvites(invs as InviteRow[]);
            setLoading(false);
            return;
          }
        }
        // 4) else show create company
        setLoading(false);
      } catch (e: any) {
        setLoading(false);
        toast({ title: 'Onboarding error', description: e.message || 'Please try again.', variant: 'destructive' });
      }
    };
    run();
  }, [navigate, toast, userEmail]);

  const acceptInvite = async (id: string) => {
    try {
      const { error } = await supabase.rpc('accept_project_invite' as any, { invite_id: id });
      if (error) throw error;
      toast({ title: 'Invite accepted', description: 'You have been added to the project.' });
      navigate('/projects', { replace: true });
    } catch (e: any) {
      toast({ title: 'Could not accept invite', description: e.message || 'Try again.', variant: 'destructive' });
    }
  };

  const skipInvites = () => {
    setInvites([]);
  };

  const createOrg = async () => {
    if (!orgName.trim()) return;
    try {
      await createOrganization(orgName.trim());
      toast({ title: 'Company created', description: 'Welcome to BuildBuddy!' });
      navigate('/projects', { replace: true });
    } catch (e: any) {
      toast({ title: 'Could not create company', description: e.message || 'Try again.', variant: 'destructive' });
    }
  };

  return (
    <AppLayout>
      <Seo title="BuildBuddy — Onboarding" description="Finish setting up your workspace." canonical="/onboarding" />
      <main className="mx-auto max-w-2xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome</h1>
          <p className="text-sm text-muted-foreground">Let’s get you into the right workspace.</p>
        </header>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : invites.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Project invites</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">You have pending invitations:</p>
              <ul className="space-y-2">
                {invites.map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between border rounded-md p-3">
                    <div className="text-sm">
                      <div>Invite to a project</div>
                      <div className="text-muted-foreground text-xs">Sent {new Date(inv.created_at).toLocaleString()}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => acceptInvite(inv.id)}>Accept</Button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex justify-end">
                <Button variant="ghost" onClick={skipInvites}>Skip for now</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Create your company</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">You’re not a member of any company yet. Create one to get started.</p>
              <Input placeholder="Your Company Inc." value={orgName} onChange={(e)=>setOrgName(e.target.value)} />
              <div className="flex justify-end">
                <Button onClick={createOrg} disabled={!orgName.trim()}>Create company</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </AppLayout>
  );
};

export default Onboarding;
