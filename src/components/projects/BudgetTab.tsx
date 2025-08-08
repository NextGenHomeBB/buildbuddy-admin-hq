
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useBudgetLines, useBudgetSummary, useProjectOwnerOrg } from "@/hooks/projects";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface Props { projectId: string }

const BudgetTab = ({ projectId }: Props) => {
  const { data: lines, isLoading } = useBudgetLines(projectId);
  const { data: summary } = useBudgetSummary(projectId);
  const { data: ownerOrgId } = useProjectOwnerOrg(projectId);
  const [newRow, setNewRow] = useState({ category: "", name: "", planned_amount: "", currency: "EUR" });
  const { toast } = useToast();
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`budget-lines-${projectId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "project_budget_lines", filter: `project_id=eq.${projectId}` },
        () => {
          qc.invalidateQueries({ queryKey: ["budget-lines", projectId] });
          qc.invalidateQueries({ queryKey: ["budget-summary", projectId] });
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [projectId, qc]);

  const addRow = async () => {
    const category = newRow.category.trim();
    const name = newRow.name.trim();
    const currency = newRow.currency.trim() || "EUR";
    const planned_amount = newRow.planned_amount.trim() ? Number(newRow.planned_amount) : null;
    if (!category || !name || !ownerOrgId) return;
    const { error } = await supabase.from("project_budget_lines").insert({
      project_id: projectId,
      org_id: ownerOrgId,
      category,
      name,
      currency,
      planned_amount,
    });
    if (error) {
      toast({ title: "Failed to add line", description: error.message, variant: "destructive" });
      return;
    }
    setNewRow({ category: "", name: "", planned_amount: "", currency: "EUR" });
    qc.invalidateQueries({ queryKey: ["budget-lines", projectId] });
    qc.invalidateQueries({ queryKey: ["budget-summary", projectId] });
  };

  const updateLine = async (id: string, patch: Record<string, any>) => {
    const { error } = await supabase.from("project_budget_lines").update(patch).eq("id", id);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
  };

  const deleteLine = async (id: string) => {
    const ok = confirm("Delete line?");
    if (!ok) return;
    const { error } = await supabase.from("project_budget_lines").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    qc.invalidateQueries({ queryKey: ["budget-lines", projectId] });
    qc.invalidateQueries({ queryKey: ["budget-summary", projectId] });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Budget Lines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <Input placeholder="Category" value={newRow.category} onChange={(e)=>setNewRow(v=>({ ...v, category: e.target.value }))} />
            <Input placeholder="Name" value={newRow.name} onChange={(e)=>setNewRow(v=>({ ...v, name: e.target.value }))} />
            <Input placeholder="Planned Amount" value={newRow.planned_amount} onChange={(e)=>setNewRow(v=>({ ...v, planned_amount: e.target.value }))} />
            <Input placeholder="Currency" value={newRow.currency} onChange={(e)=>setNewRow(v=>({ ...v, currency: e.target.value }))} />
            <Button onClick={addRow} disabled={!newRow.category.trim() || !newRow.name.trim()}>Add</Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Planned Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={5}>Loading…</TableCell></TableRow>}
              {lines?.map((l) => (
                <TableRow key={l.id}>
                  <TableCell><Input defaultValue={l.category} onBlur={(e)=>updateLine(l.id, { category: e.target.value })} className="h-8" /></TableCell>
                  <TableCell><Input defaultValue={l.name} onBlur={(e)=>updateLine(l.id, { name: e.target.value })} className="h-8" /></TableCell>
                  <TableCell><Input defaultValue={l.planned_amount ?? ""} onBlur={(e)=>updateLine(l.id, { planned_amount: e.target.value ? Number(e.target.value) : null })} className="h-8" /></TableCell>
                  <TableCell><Input defaultValue={l.currency} onBlur={(e)=>updateLine(l.id, { currency: e.target.value || "EUR" })} className="h-8" /></TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={()=>deleteLine(l.id)}>🗑</Button>
                  </TableCell>
                </TableRow>
              ))}
              {lines && lines.length === 0 && !isLoading && (
                <TableRow><TableCell colSpan={5} className="text-muted-foreground">No budget lines yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {summary?.map((s) => (
            <div key={s.currency} className="flex items-center justify-between">
              <div>{s.currency}</div>
              <div className="text-right">
                <div>Planned: {s.planned_total ?? 0}</div>
                <div className="text-muted-foreground">Hours: {s.actual_hours ?? 0}</div>
              </div>
            </div>
          ))}
          {(!summary || summary.length === 0) && <div className="text-muted-foreground">No summary available.</div>}
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetTab;
