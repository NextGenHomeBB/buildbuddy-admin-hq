import AppLayout from "@/components/layout/AppLayout";
import Seo from "@/components/seo/Seo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import ParticipantsTable from "@/components/projects/ParticipantsTable";
import AssignmentsTable from "@/components/projects/AssignmentsTable";
import InviteForm from "@/components/projects/InviteForm";
import TimeApprovalTable from "@/components/projects/TimeApprovalTable";
import { useParams } from "react-router-dom";
import { useProject } from "@/hooks/projects";

const ProjectDetail = () => {
  const { id } = useParams();
  const { data: project } = useProject(id);

  return (
    <AppLayout>
      <Seo title={`BuildBuddy — Project ${project?.name ?? ''}`} description="Manage participants, assignments, invites, and time." />
      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">{project?.name ?? "Project"}</h1>
          <p className="text-muted-foreground mt-1">Project detail</p>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="invites">Invites</TabsTrigger>
            <TabsTrigger value="time">Time</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">Overview content coming soon.</CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="participants">
            {id && <ParticipantsTable projectId={id} />}
          </TabsContent>
          <TabsContent value="assignments">
            {id && <AssignmentsTable projectId={id} />}
          </TabsContent>
          <TabsContent value="invites">
            {id && <InviteForm projectId={id} />}
          </TabsContent>
          <TabsContent value="time">
            {id && <TimeApprovalTable projectId={id} />}
          </TabsContent>
        </Tabs>
      </section>
    </AppLayout>
  );
};

export default ProjectDetail;
