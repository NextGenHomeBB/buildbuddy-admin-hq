import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProjectOwnerOrg, useProjectParticipants } from "@/hooks/projects";
import { useToast } from "@/hooks/use-toast";
import VendorPicker from "./VendorPicker";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface Props { projectId: string }

const ParticipantsTable = ({ projectId }: Props) => {
  const { data: participants, isLoading } = useProjectParticipants(projectId);
  const { data: ownerOrgId } = useProjectOwnerOrg(projectId);
  const { toast } = useToast();
  const qc = useQueryClient();

  const handleRemove = async (orgId: string) => {
    try {
      await supabase.from("project_participants").delete().match({ project_id: projectId, org_id: orgId, role: "vendor" });
      toast({ title: "Vendor removed" });
      qc.invalidateQueries({ queryKey: ["project-participants", projectId] });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Owner organization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Owner Org ID: {ownerOrgId || "..."}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Vendor organizations</CardTitle>
          <VendorPicker projectId={projectId} />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Org ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow><TableCell colSpan={3}>Loading...</TableCell></TableRow>
              )}
              {participants?.filter(p => p.role === 'vendor').map((p) => (
                <TableRow key={p.org_id}>
                  <TableCell className="font-mono text-xs">{p.org_id}</TableCell>
                  <TableCell>{p.role}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => handleRemove(p.org_id)}>Remove</Button>
                  </TableCell>
                </TableRow>
              ))}
              {participants?.filter(p => p.role === 'vendor').length === 0 && !isLoading && (
                <TableRow><TableCell colSpan={3} className="text-muted-foreground">No vendors yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParticipantsTable;
