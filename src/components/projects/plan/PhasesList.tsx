
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjectOwnerOrg, useProjectPhases } from "@/hooks/projects";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface PhasesListProps {
  projectId: string;
  selectedPhaseId: string | null;
  onSelect: (phaseId: string | null) => void;
}

const PhasesList = ({ projectId, selectedPhaseId, onSelect }: PhasesListProps) => {
  const { data: phases } = useProjectPhases(projectId);
  const { data: ownerOrgId } = useProjectOwnerOrg(projectId);
  const { toast } = useToast();
  const qc = useQueryClient();

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    // Default select first phase if none
    if (!selectedPhaseId && (phases?.length || 0) > 0) {
      onSelect(phases![0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phases]);

  const addPhase = async () => {
    const name = newName.trim();
    if (!name || !ownerOrgId) return;
    const { error } = await supabase
      .from("project_phases")
      .insert({ project_id: projectId, org_id: ownerOrgId, name });
    if (error) {
      toast({ title: "Failed to add phase", description: error.message, variant: "destructive" });
      return;
    }
    setNewName("");
    qc.invalidateQueries({ queryKey: ["project-phases", projectId] });
  };

  const renamePhase = async (id: string) => {
    const name = editingName.trim();
    if (!name) return;
    const { error } = await supabase.from("project_phases").update({ name }).eq("id", id);
    if (error) {
      toast({ title: "Failed to rename", description: error.message, variant: "destructive" });
      return;
    }
    setEditingId(null);
    qc.invalidateQueries({ queryKey: ["project-phases", projectId] });
  };

  const deletePhase = async (id: string) => {
    const ok = confirm("Delete phase? Tasks will become unassigned.");
    if (!ok) return;
    const { error } = await supabase.from("project_phases").delete().eq("id", id);
    if (error) {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
      return;
    }
    if (selectedPhaseId === id) onSelect(null);
    qc.invalidateQueries({ queryKey: ["project-phases", projectId] });
    qc.invalidateQueries({ queryKey: ["tasks", projectId] });
  };

  const movePhase = async (id: string, direction: "up" | "down") => {
    if (!phases) return;
    const idx = phases.findIndex((p) => p.id === id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= phases.length) return;
    const a = phases[idx];
    const b = phases[swapIdx];
    // swap seq
    const tmp = a.seq;
    // temp set to avoid unique conflicts
    await supabase.from("project_phases").update({ seq: -1 }).eq("id", a.id);
    await supabase.from("project_phases").update({ seq: tmp }).eq("id", b.id);
    await supabase.from("project_phases").update({ seq: b.seq }).eq("id", a.id);
    qc.invalidateQueries({ queryKey: ["project-phases", projectId] });
  };

  const unassignedSelected = selectedPhaseId === null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phases</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="New phase name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button onClick={addPhase} disabled={!newName.trim()}>Add</Button>
        </div>

        <div className="space-y-1">
          <button
            className={`w-full text-left px-2 py-1.5 rounded hover:bg-muted ${unassignedSelected ? "bg-muted" : ""}`}
            onClick={() => onSelect(null)}
          >
            Unassigned tasks
          </button>
          {phases?.map((p, i) => (
            <div key={p.id} className={`flex items-center gap-2 px-2 py-1.5 rounded ${selectedPhaseId === p.id ? "bg-muted" : "hover:bg-muted"}`}>
              {editingId === p.id ? (
                <>
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="h-8"
                  />
                  <Button size="sm" onClick={() => renamePhase(p.id)} disabled={!editingName.trim()}>Save</Button>
                  <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                </>
              ) : (
                <>
                  <button className="flex-1 text-left" onClick={() => onSelect(p.id)}>{p.name}</button>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" onClick={() => movePhase(p.id, "up")} disabled={i === 0}>↑</Button>
                    <Button size="icon" variant="ghost" onClick={() => movePhase(p.id, "down")} disabled={i === (phases.length - 1)}>↓</Button>
                    <Button size="icon" variant="ghost" onClick={() => { setEditingId(p.id); setEditingName(p.name); }}>✎</Button>
                    <Button size="icon" variant="ghost" onClick={() => deletePhase(p.id)}>🗑</Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PhasesList;
