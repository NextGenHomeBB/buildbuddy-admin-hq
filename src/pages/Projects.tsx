import AppLayout from "@/components/layout/AppLayout";
import Seo from "@/components/seo/Seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

const Projects = () => {
  return (
    <AppLayout>
      <Seo title="BuildBuddy — Projects" description="Manage projects, phases, tasks and templates." />
      <section className="space-y-6">
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
      </section>
    </AppLayout>
  );
};

export default Projects;
