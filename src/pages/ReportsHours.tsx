import AppLayout from "@/components/layout/AppLayout";
import Seo from "@/components/seo/Seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const ReportsHours = () => {
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  // Minimal fetch of logs; in a full impl we'd paginate and join names
  const [logs, setLogs] = useState<any[]>([]);

  const fetch = async () => {
    if (!from || !to) return;
    let q = supabase
      .from("time_logs")
      .select("project_id, employer_org_id, minutes")
      .gte("started_at", new Date(from).toISOString())
      .lte("started_at", new Date(to).toISOString());
    if (projectId) q = q.eq("project_id", projectId);
    const { data } = await q;
    setLogs(data || []);
  };

  const grouped = useMemo(() => {
    const map = new Map<string, number>();
    logs.forEach((l) => {
      const key = `${l.employer_org_id}|${l.project_id}`;
      map.set(key, (map.get(key) || 0) + (l.minutes || 0));
    });
    return Array.from(map.entries()).map(([k, mins]) => {
      const [org, pid] = k.split("|");
      return { org, project: pid, minutes: mins };
    });
  }, [logs]);

  const exportCsv = () => {
    const header = "company,project,minutes,hours\n";
    const rows = grouped.map((r) => `${r.org},${r.project},${r.minutes},${(r.minutes/60).toFixed(2)}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "hours.csv"; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <Seo title="BuildBuddy — Hours Report" description="Totals by company and project, CSV export." />
      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Hours Report</h1>
          <p className="text-muted-foreground mt-1">Group totals by company and project.</p>
        </div>

        <Card>
          <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-4">
            <div>
              <label className="text-sm">Project</label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger><SelectValue placeholder="All projects" /></SelectTrigger>
                <SelectContent>
                  {/* In a full impl, list projects here */}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm">From</label>
              <input className="w-full rounded-md border bg-background p-2" type="date" value={from} onChange={(e)=>setFrom(e.target.value)} />
            </div>
            <div>
              <label className="text-sm">To</label>
              <input className="w-full rounded-md border bg-background p-2" type="date" value={to} onChange={(e)=>setTo(e.target.value)} />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={fetch}>Apply</Button>
              <Button variant="outline" onClick={exportCsv}>Export CSV</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Totals</CardTitle></CardHeader>
          <CardContent className="text-sm">
            {grouped.length === 0 && <div className="text-muted-foreground">No data.</div>}
            {grouped.map((r) => (
              <div key={`${r.org}|${r.project}`} className="flex items-center justify-between border-b py-2 last:border-0">
                <div className="font-mono text-xs">{r.org}</div>
                <div className="font-mono text-xs">{r.project}</div>
                <div>{(r.minutes/60).toFixed(2)} h</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </AppLayout>
  );
};

export default ReportsHours;
