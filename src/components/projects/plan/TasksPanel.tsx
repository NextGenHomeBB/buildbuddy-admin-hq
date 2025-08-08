
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useChecklistCountsByTask, useProjectOwnerOrg, useProjectTasks } from "@/hooks/projects";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface TasksPanelProps {
  projectId: string;
  phaseId: string | null;
}

const statusOptions = ["todo", "in_progress", "done"];

const ChecklistCount = ({ taskId }: { taskId: string }) => {
  const { data } = useChecklistCountsByTask(taskId);
  if (!data) return <span className="text-xs text-muted-foreground">Checklist: 0/0</span>;
  return <span className="text-xs text-muted-foreground">Checklist: {data.done}/{data.total}</span>;
};

const TasksPanel = ({ projectId, phaseId }: TasksPanelProps) => {
  const { data: ownerOrgId } = useProjectOwnerOrg(projectId);
  const { data: tasks, isLoading } = useProjectTasks(projectId, phaseId ?? null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const [title, setTitle] = useState("");

  useEffect(() => {
    const channel = supabase
      .channel(`tasks-${projectId}-${phaseId ?? "null"}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `project_id=eq.${projectId}` },
        () => qc.invalidateQueries({ queryKey: ["tasks", projectId, phaseId ?? "__all__"] })
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [projectId, phaseId, qc]);

  const addTask = async () => {
    const t = title.trim();
    if (!t || !ownerOrgId) return;
    const insert = { project_id: projectId, org_id: ownerOrgId, title: t, status: "todo" as const, phase_id: phaseId };
    const { error } = await supabase.from("tasks").insert(insert);
    if (error) {
      toast({ title: "Failed to add task", description: error.message, variant: "destructive" });
      return;
    }
    setTitle("");
    qc.invalidateQueries({ queryKey: ["tasks", projectId, phaseId ?? "__all__"] });
  };

  const updateTask = async (id: string, patch: Record<string, any>) => {
    const { error } = await supabase.from("tasks").update(patch).eq("id", id);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
  };

  const deleteTask = async (id: string) => {
    const ok = confirm("Delete task?");
    if (!ok) return;
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    qc.invalidateQueries({ queryKey: ["tasks", projectId, phaseId ?? "__all__"] });
  };

  const moveTask = async (id: string, direction: "up" | "down") => {
    if (!tasks || tasks.length < 2) return;
    const idx = tasks.findIndex((t) => t.id === id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= tasks.length) return;
    const a = tasks[idx];
    const b = tasks[swapIdx];
    await supabase.from("tasks").update({ seq: -1 }).eq("id", a.id);
    await supabase.from("tasks").update({ seq: a.seq }).eq("id", b.id);
    await supabase.from("tasks").update({ seq: b.seq }).eq("id", a.id);
    qc.invalidateQueries({ queryKey: ["tasks", projectId, phaseId ?? "__all__"] });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks {phaseId ? "" : "(Unassigned)"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input placeholder="New task title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Button onClick={addTask} disabled={!title.trim()}>Add</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Checklist</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={6}>Loading…</TableCell></TableRow>}
            {tasks?.map((t, i) => (
              <TableRow key={t.id}>
                <TableCell className="min-w-[220px]">
                  <Input
                    value={t.title ?? ""}
                    onChange={(e) => updateTask(t.id, { title: e.target.value })}
                    className="h-8"
                  />
                </TableCell>
                <TableCell className="min-w-[160px]">
                  <Select value={t.status ?? "todo"} onValueChange={(v) => updateTask(t.id, { status: v })}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => <SelectItem key={s} value={s}>{s.replace("_"," ")}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="min-w-[220px]">
                  <Input
                    placeholder="assignee user_id"
                    value={t.assignee ?? ""}
                    onChange={(e) => updateTask(t.id, { assignee: e.target.value || null })}
                    className="h-8 font-mono text-xs"
                  />
                </TableCell>
                <TableCell className="min-w-[160px]">
                  <Input
                    type="date"
                    value={t.due_date ? new Date(t.due_date).toISOString().slice(0,10) : ""}
                    onChange={(e) => updateTask(t.id, { due_date: e.target.value || null })}
                    className="h-8"
                  />
                </TableCell>
                <TableCell><ChecklistCount taskId={t.id} /></TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <Button size="icon" variant="ghost" onClick={() => moveTask(t.id, "up")} disabled={i===0}>↑</Button>
                  <Button size="icon" variant="ghost" onClick={() => moveTask(t.id, "down")} disabled={i===(tasks.length-1)}>↓</Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteTask(t.id)}>🗑</Button>
                </TableCell>
              </TableRow>
            ))}
            {tasks && tasks.length === 0 && !isLoading && (
              <TableRow><TableCell colSpan={6} className="text-muted-foreground">No tasks yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TasksPanel;
