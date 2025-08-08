import { useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useProjectAssignments, useProjectOwnerOrg } from "@/hooks/projects";
import CompanyChip from "./CompanyChip";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface Props { projectId: string }

const AssignmentsTable = ({ projectId }: Props) => {
  const { data: assignments, isLoading } = useProjectAssignments(projectId);
  const { data: ownerOrgId } = useProjectOwnerOrg(projectId);
  const { toast } = useToast();
  const qc = useQueryClient();

  const handleRemove = async (id: string) => {
    try {
      const { error } = await supabase.from("project_assignments").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Assignment removed" });
      qc.invalidateQueries({ queryKey: ["project-assignments", projectId] });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel(`assignments-${projectId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "project_assignments", filter: `project_id=eq.${projectId}` },
        () => qc.invalidateQueries({ queryKey: ["project-assignments", projectId] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, qc]);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Accepted</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading && (<TableRow><TableCell colSpan={6}>Loading...</TableCell></TableRow>)}
        {assignments?.map(a => (
          <TableRow key={a.id}>
            <TableCell className="font-mono text-xs">{a.user_id?.slice(0,8)}…</TableCell>
            <TableCell><CompanyChip employerOrgId={a.employer_org_id} ownerOrgId={ownerOrgId} /></TableCell>
            <TableCell>{a.role}</TableCell>
            <TableCell>{a.accepted_at ? new Date(a.accepted_at).toLocaleDateString() : "—"}</TableCell>
            <TableCell>{new Date(a.created_at).toLocaleDateString()}</TableCell>
            <TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => handleRemove(a.id)}>Remove</Button></TableCell>
          </TableRow>
        ))}
        {assignments?.length === 0 && !isLoading && (
          <TableRow><TableCell colSpan={6} className="text-muted-foreground">No assignments yet.</TableCell></TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default AssignmentsTable;
