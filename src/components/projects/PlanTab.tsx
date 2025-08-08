
import { useEffect, useState } from "react";
import PhasesList from "./plan/PhasesList";
import TasksPanel from "./plan/TasksPanel";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface Props { projectId: string }

const PlanTab = ({ projectId }: Props) => {
  const [phaseId, setPhaseId] = useState<string | null>(null);
  const qc = useQueryClient();

  // Realtime for phases (invalidate on any changes)
  useEffect(() => {
    const channel = supabase
      .channel(`phases-${projectId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "project_phases", filter: `project_id=eq.${projectId}` },
        () => qc.invalidateQueries({ queryKey: ["project-phases", projectId] })
      )
      .subscribe();

    // Ensure cleanup is synchronous (do not return a Promise)
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [projectId, qc]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-1">
        <PhasesList projectId={projectId} selectedPhaseId={phaseId} onSelect={setPhaseId} />
      </div>
      <div className="lg:col-span-2">
        <TasksPanel projectId={projectId} phaseId={phaseId} />
      </div>
    </div>
  );
};

export default PlanTab;

