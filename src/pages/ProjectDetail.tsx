
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
import PlanTab from "@/components/projects/PlanTab";
import ChecklistsTab from "@/components/projects/ChecklistsTab";
import BudgetTab from "@/components/projects/BudgetTab";

const ProjectDetail = () => {
  const { id } = useParams();
  const { data: project } = useProject(id);

  return (
    <AppLayout>
      <Seo title={`BuildBuddy — Project ${project?.name ?? ''}`} description="Manage phases, tasks, checklists, team, budget, and time." />
      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">{project?.name ?? "Project"}</h1>
          <p className="text-muted-foreground mt-1">Project detail</p>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-2 overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="plan">Plan</TabsTrigger>
            <TabsTrigger value="checklists">Checklists</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="time">Time</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">Overview content coming soon.</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plan">
            {id && <PlanTab projectId={id} />}
          </TabsContent>

          <TabsContent value="checklists">
            {id && <ChecklistsTab projectId={id} />}
          </TabsContent>

          <TabsContent value="team">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {id && (
                <>
                  <Card>
                    <CardContent className="p-6">
                      <ParticipantsTable projectId={id} />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <InviteForm projectId={id} />
                      <AssignmentsTable projectId={id} />
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="budget">
            {id && <BudgetTab projectId={id} />}
          </TabsContent>

          <TabsContent value="time">
            {id && <TimeApprovalTable projectId={id} />}
          </TabsContent>

          <TabsContent value="files">
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">Files tab coming soon.</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">Messages tab coming soon.</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">Settings tab coming soon.</CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </AppLayout>
  );
};

export default ProjectDetail;
