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

const Projects = () => {
  const { needsOrgSetup, createOrganization } = useAuth();
  const { toast } = useToast();
  const [orgName, setOrgName] = useState("");

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
              <Button variant="hero"><Plus /> Create Project</Button>
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
