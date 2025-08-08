import AppLayout from "@/components/layout/AppLayout";
import Seo from "@/components/seo/Seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import CreateOrgModal from "@/components/org/CreateOrgModal";
import CreateProjectModal from "@/components/projects/CreateProjectModal";
import ProjectsList from "@/components/projects/ProjectsList";


const Projects = () => {
  const { activeOrgId } = useAuth();
  
  const navigate = useNavigate();
  const [openCreateProject, setOpenCreateProject] = useState(false);
  const [openCreateOrg, setOpenCreateOrg] = useState(false);

  return (
    <AppLayout>
      <Seo title="BuildBuddy — Projects" description="Manage projects, phases, tasks and templates." />
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Projects</h1>
            <p className="text-muted-foreground mt-1">Create and track projects across sites.</p>
          </div>
          <Button variant="hero" onClick={() => { if (activeOrgId) { setOpenCreateProject(true); } else { setOpenCreateOrg(true); } }}><Plus /> Create Project</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectsList />
          </CardContent>
        </Card>
        <CreateProjectModal
          open={openCreateProject}
          orgId={activeOrgId as string}
          onClose={() => setOpenCreateProject(false)}
          onCreated={(id) => {
            setOpenCreateProject(false);
            navigate(`/projects/${id}`);
          }}
        />
        <CreateOrgModal
          open={openCreateOrg}
          forced
          onClose={() => setOpenCreateOrg(false)}
        />
      </section>
    </AppLayout>
  );
};

export default Projects;
