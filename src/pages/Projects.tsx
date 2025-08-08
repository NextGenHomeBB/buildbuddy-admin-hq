import AppLayout from "@/components/layout/AppLayout";
import Seo from "@/components/seo/Seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Projects = () => {
  const { needsOrgSetup, createOrganization, activeOrgId } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [orgName, setOrgName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateOrg = async () => {
    try {
      await createOrganization(orgName);
      toast({ title: "Organization created" });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <Seo title="BuildBuddy — Projects" description="Manage projects, phases, tasks and templates." />
      <section className="space-y-6">
        {needsOrgSetup ? (
          <Card>
            <CardHeader>
              <CardTitle>Create Organization</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1 md:col-span-2">
                <Label>Organization name</Label>
                <Input value={orgName} onChange={(e)=>setOrgName(e.target.value)} placeholder="ACME Builders" />
              </div>
              <div className="flex items-end">
                <Button onClick={handleCreateOrg} disabled={!orgName.trim()}>Create</Button>
              </div>
              <p className="md:col-span-3 text-sm text-muted-foreground">You need an organization to manage projects. You’ll be added as org admin.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-3xl font-semibold">Projects</h1>
                <p className="text-muted-foreground mt-1">Create and track projects across sites.</p>
              </div>
              <Button variant="hero" disabled={isCreating} onClick={async () => { let orgId = activeOrgId; try { if (!orgId) { const newOrgName = window.prompt("You need an organization first. Enter organization name:"); if (!newOrgName || !newOrgName.trim()) { toast({ title: "No organization", description: "Please provide an organization name to continue.", variant: "destructive" }); return; } setIsCreating(true); const { data: createdOrgId, error: orgErr } = await supabase.rpc('create_org_with_admin' as any, { org_name: newOrgName.trim() }); if (orgErr) { toast({ title: "Failed to create organization", description: orgErr.message, variant: "destructive" }); setIsCreating(false); return; } orgId = createdOrgId as string; toast({ title: "Organization created" }); } const name = window.prompt("Project name"); if (!name || !name.trim()) { setIsCreating(false); return; } setIsCreating(true); const { data, error } = await supabase.from("projects").insert({ name: name.trim(), org_id: orgId }).select("id").single(); if (error) { toast({ title: "Failed to create project", description: error.message, variant: "destructive" }); } else { toast({ title: "Project created" }); navigate(`/projects/${data.id}`); } } catch (e: any) { toast({ title: "Action failed", description: e.message, variant: "destructive" }); } finally { setIsCreating(false); } }}><Plus /> Create Project</Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">Connect Supabase to populate this table. Filters and export will appear here.</div>
              </CardContent>
            </Card>
          </>
        )}
      </section>
    </AppLayout>
  );
};

export default Projects;
