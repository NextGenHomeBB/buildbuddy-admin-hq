import AppLayout from "@/components/layout/AppLayout";
import Seo from "@/components/seo/Seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Projects = () => {
  const { activeOrgId } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  
  return (
    <AppLayout>
      <Seo title="BuildBuddy — Projects" description="Manage projects, phases, tasks and templates." />
      <section className="space-y-6">
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
      </section>
    </AppLayout>
  );
};

export default Projects;
