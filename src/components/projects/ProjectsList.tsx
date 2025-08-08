import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useActiveOrg } from "@/hooks/useActiveOrg";

const ProjectsList = () => {
  const { activeOrgId } = useActiveOrg();
  const qc = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ["org-projects", activeOrgId],
    enabled: !!activeOrgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, status, created_at")
        .eq("org_id", activeOrgId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!activeOrgId) return;
    const channel = supabase
      .channel(`org-projects-${activeOrgId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects", filter: `org_id=eq.${activeOrgId}` },
        () => {
          qc.invalidateQueries({ queryKey: ["org-projects", activeOrgId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeOrgId, qc]);

  return (
    <>
      {!activeOrgId && (
        <div className="text-sm text-muted-foreground">Select or create an organization to see projects.</div>
      )}
      {activeOrgId && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={3}>Loading…</TableCell>
              </TableRow>
            )}
            {projects?.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <Link to={`/projects/${p.id}`} className="underline">
                    {p.name}
                  </Link>
                </TableCell>
                <TableCell className="capitalize">{p.status}</TableCell>
                <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {projects && projects.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={3} className="text-muted-foreground">
                  No projects yet. Use "Create Project" to add one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </>
  );
};

export default ProjectsList;
