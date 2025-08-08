
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjectOwnerOrg, useProjectTasks, useTaskChecklists, useChecklistItems } from "@/hooks/projects";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface Props { projectId: string }

const ChecklistItems = ({ checklistId }: { checklistId: string }) => {
  const { data: items, isLoading } = useChecklistItems(checklistId);
  const { toast } = useToast();
  const qc = useQueryClient();

  const addItem = async (title: string) => {
    const t = title.trim();
    if (!t) return;
    const { data: check } = await supabase.from("checklists").select("project_id, task_id, org_id").eq("id", checklistId).single();
    const { error } = await supabase.from("checklist_items").insert({
      checklist_id: checklistId,
      project_id: check?.project_id,
      task_id: check?.task_id,
      org_id: check?.org_id,
      title: t,
    });
    if (error) {
      toast({ title: "Failed to add item", description: error.message, variant: "destructive" });
      return;
    }
    qc.invalidateQueries({ queryKey: ["checklist-items", checklistId] });
  };

  const updateItem = async (id: string, patch: Record<string, any>) => {
    const { error } = await supabase.from("checklist_items").update(patch).eq("id", id);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
  };

  const deleteItem = async (id: string) => {
    const ok = confirm("Delete item?");
    if (!ok) return;
    const { error } = await supabase.from("checklist_items").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    qc.invalidateQueries({ queryKey: ["checklist-items", checklistId] });
  };

  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    const channel = supabase
      .channel(`checklist-items-${checklistId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "checklist_items", filter: `checklist_id=eq.${checklistId}` },
        () => qc.invalidateQueries({ queryKey: ["checklist-items", checklistId] })
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [checklistId, qc]);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input placeholder="New item" value={newItem} onChange={(e)=>setNewItem(e.target.value)} />
        <Button onClick={()=>{ addItem(newItem); setNewItem(""); }} disabled={!newItem.trim()}>Add</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Done</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && <TableRow><TableCell colSpan={3}>Loading…</TableCell></TableRow>}
          {items?.map((it) => (
            <TableRow key={it.id}>
              <TableCell>
                <input type="checkbox" checked={!!it.done} onChange={(e)=>updateItem(it.id, { done: e.target.checked })} />
              </TableCell>
              <TableCell>
                <Input value={it.title ?? ""} onChange={(e)=>updateItem(it.id, { title: e.target.value })} className="h-8" />
              </TableCell>
              <TableCell className="text-right">
                <Button size="icon" variant="ghost" onClick={()=>deleteItem(it.id)}>🗑</Button>
              </TableCell>
            </TableRow>
          ))}
          {items && items.length === 0 && !isLoading && (
            <TableRow><TableCell colSpan={3} className="text-muted-foreground">No items yet.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

const ChecklistsTab = ({ projectId }: Props) => {
  const { data: tasks } = useProjectTasks(projectId);
  const [taskId, setTaskId] = useState<string | undefined>(undefined);
  const { data: ownerOrgId } = useProjectOwnerOrg(projectId);
  const { data: checklists, isLoading } = useTaskChecklists(projectId, taskId);
  const { toast } = useToast();
  const qc = useQueryClient();

  useEffect(() => {
    if (!taskId && tasks && tasks.length > 0) {
      setTaskId(tasks[0].id);
    }
  }, [tasks, taskId]);

  useEffect(() => {
    const channel = supabase
      .channel(`checklists-${projectId}-${taskId ?? "x"}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "checklists", filter: `project_id=eq.${projectId}` },
        () => qc.invalidateQueries({ queryKey: ["checklists", projectId, taskId] })
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [projectId, taskId, qc]);

  const addChecklist = async (title: string) => {
    if (!title.trim() || !taskId || !ownerOrgId) return;
    const { error } = await supabase.from("checklists").insert({
      project_id: projectId,
      task_id: taskId,
      org_id: ownerOrgId,
      title: title.trim(),
    });
    if (error) {
      toast({ title: "Failed to add checklist", description: error.message, variant: "destructive" });
      return;
    }
    qc.invalidateQueries({ queryKey: ["checklists", projectId, taskId] });
  };

  const renameChecklist = async (id: string, title: string) => {
    const { error } = await supabase.from("checklists").update({ title }).eq("id", id);
    if (error) toast({ title: "Failed to rename", description: error.message, variant: "destructive" });
  };

  const deleteChecklist = async (id: string) => {
    const ok = confirm("Delete checklist?");
    if (!ok) return;
    const { error } = await supabase.from("checklists").delete().eq("id", id);
    if (error) {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
      return;
    }
    qc.invalidateQueries({ queryKey: ["checklists", projectId, taskId] });
  };

  const duplicateChecklist = async (id: string) => {
    // Load source checklist + items
    const { data: src, error: e1 } = await supabase.from("checklists").select("title, project_id, task_id, org_id").eq("id", id).single();
    if (e1 || !src) {
      toast({ title: "Failed to load source", description: e1?.message, variant: "destructive" });
      return;
    }
    const { data: newList, error: e2 } = await supabase.from("checklists").insert({
      project_id: src.project_id,
      task_id: src.task_id,
      org_id: src.org_id,
      title: `Copy of ${src.title}`,
    }).select("id").single();
    if (e2 || !newList) {
      toast({ title: "Failed to create copy", description: e2?.message, variant: "destructive" });
      return;
    }
    const { data: items, error: e3 } = await supabase.from("checklist_items").select("title, project_id, task_id, org_id, done").eq("checklist_id", id);
    if (e3) {
      toast({ title: "Failed to load items", description: e3.message, variant: "destructive" });
      return;
    }
    if (items && items.length > 0) {
      const payload = items.map((it) => ({
        checklist_id: newList.id,
        project_id: it.project_id,
        task_id: it.task_id,
        org_id: it.org_id,
        title: it.title,
        done: it.done,
      }));
      const { error: e4 } = await supabase.from("checklist_items").insert(payload);
      if (e4) {
        toast({ title: "Failed to copy items", description: e4.message, variant: "destructive" });
        return;
      }
    }
    qc.invalidateQueries({ queryKey: ["checklists", projectId, taskId] });
  };

  const [newChecklist, setNewChecklist] = useState("");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Select Task</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Select value={taskId} onValueChange={(v)=>setTaskId(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Choose task" />
            </SelectTrigger>
            <SelectContent>
              {tasks?.map((t) => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
            </SelectContent>
          </Select>
          {!tasks || tasks.length === 0 ? (
            <div className="text-sm text-muted-foreground">Create a task in Plan tab first.</div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Checklists</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="New checklist title" value={newChecklist} onChange={(e)=>setNewChecklist(e.target.value)} />
            <Button onClick={()=>{ addChecklist(newChecklist); setNewChecklist(""); }} disabled={!newChecklist.trim() || !taskId}>Add</Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={2}>Loading…</TableCell></TableRow>}
              {checklists?.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Input defaultValue={c.title} onBlur={(e)=>renameChecklist(c.id, e.target.value)} className="h-8" />
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="sm" variant="outline" onClick={()=>duplicateChecklist(c.id)}>Duplicate</Button>
                    <Button size="sm" variant="outline" onClick={()=>deleteChecklist(c.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
              {checklists && checklists.length === 0 && !isLoading && (
                <TableRow><TableCell colSpan={2} className="text-muted-foreground">No checklists yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>

          {checklists?.map((c) => (
            <div key={c.id} className="pt-4 border-t">
              <div className="font-medium mb-2">{c.title}</div>
              <ChecklistItems checklistId={c.id} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChecklistsTab;
