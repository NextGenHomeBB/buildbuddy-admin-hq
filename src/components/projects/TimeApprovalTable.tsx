import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProjectOwnerOrg, useTimeLogs, TimeFilters } from "@/hooks/projects";
import CompanyChip from "./CompanyChip";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CsvExportButton from "./CsvExportButton";
import FiltersBar from "./FiltersBar";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

interface Props { projectId: string }

const TimeApprovalTable = ({ projectId }: Props) => {
  const [status, setStatus] = useState<TimeFilters["status"]>(["submitted","approved"]);
  const [company, setCompany] = useState<TimeFilters["company"]>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [workerId, setWorkerId] = useState<string>("");
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: ownerOrgId } = useProjectOwnerOrg(projectId);
  const { activeOrgId } = useAuth();
  const qc = useQueryClient();
  const { data: logs, isLoading } = useTimeLogs(projectId, { status, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined, userId: workerId || undefined });
  const { toast } = useToast();

// URL sync (initialize)
useEffect(() => {
  const s = searchParams.get("status");
  if (s) setStatus(s.split(",") as any);
  const df = searchParams.get("from");
  const dt = searchParams.get("to");
  const w = searchParams.get("worker");
  const c = searchParams.get("company");
  if (df) setDateFrom(df); if (dt) setDateTo(dt);
  if (w) setWorkerId(w);
  if (c === "internal" || c === "vendors" || c === "all") setCompany(c);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

// URL sync (debounced)
useEffect(() => {
  const id = setTimeout(() => {
    const next = new URLSearchParams(searchParams);
    status?.length ? next.set("status", status.join(",")) : next.delete("status");
    dateFrom ? next.set("from", dateFrom) : next.delete("from");
    dateTo ? next.set("to", dateTo) : next.delete("to");
    workerId ? next.set("worker", workerId) : next.delete("worker");
    next.set("company", company || "all");
    setSearchParams(next, { replace: true });
  }, 300);
  return () => clearTimeout(id);
}, [status, company, dateFrom, dateTo, workerId, setSearchParams, searchParams]);

const filtered = useMemo(() => {
  if (!logs) return [] as typeof logs;
  if (company === "all" || !ownerOrgId) return logs;
  return logs.filter(l => company === "internal" ? l.employer_org_id === ownerOrgId : l.employer_org_id !== ownerOrgId);
}, [logs, company, ownerOrgId]);

  const approve = async (id: string, billTo: string | null) => {
    try {
      const { error } = await supabase.from("time_logs").update({ status: "approved" }).eq("id", id);
      if (error) throw error;
      toast({ title: "Approved" });
      qc.invalidateQueries({ queryKey: ["time-logs"] });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    }
  };
  const reject = async (id: string) => {
    try {
      const { error } = await supabase.from("time_logs").update({ status: "rejected" }).eq("id", id);
      if (error) throw error;
      toast({ title: "Rejected" });
      qc.invalidateQueries({ queryKey: ["time-logs"] });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel(`time-logs-${projectId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "time_logs", filter: `project_id=eq.${projectId}` },
        () => qc.invalidateQueries({ queryKey: ["time-logs", projectId] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, qc]);

  const totalsByCompany = useMemo(() => {
    const map = new Map<string, number>();
    filtered?.forEach(l => {
      map.set(l.employer_org_id, (map.get(l.employer_org_id) || 0) + (l.minutes || 0));
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4 flex-wrap">
          <FiltersBar
            status={status as any}
            setStatus={(s)=>setStatus(s as any)}
            company={company}
            setCompany={setCompany}
            dateFrom={dateFrom}
            dateTo={dateTo}
            setDateFrom={setDateFrom}
            setDateTo={setDateTo}
            workerId={workerId}
            setWorkerId={setWorkerId}
          />
          <CsvExportButton
            filename="time-logs.csv"
            headers={["worker","employer_org","started","ended","minutes","status","note"]}
            rows={(filtered||[]).map(l => [l.user_id||"", l.employer_org_id||"", l.started_at||"", l.ended_at||"", l.minutes||0, l.status||"", l.note||""])}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Time Logs</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Worker</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Minutes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (<TableRow><TableCell colSpan={7}>Loading...</TableCell></TableRow>)}
              {filtered?.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-mono text-xs">{l.user_id?.slice(0,8)}…</TableCell>
                  <TableCell><CompanyChip employerOrgId={l.employer_org_id} ownerOrgId={ownerOrgId} /></TableCell>
                  <TableCell>{new Date(l.started_at!).toLocaleString()}</TableCell>
                  <TableCell>{l.ended_at ? new Date(l.ended_at).toLocaleString() : "—"}</TableCell>
                  <TableCell>{l.minutes ?? 0}</TableCell>
                  <TableCell>{l.status}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => approve(l.id, l.bill_to_org_id!)} disabled={!activeOrgId || l.bill_to_org_id !== activeOrgId}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => reject(l.id)} disabled={!activeOrgId || l.bill_to_org_id !== activeOrgId}>Reject</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Totals by company</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {totalsByCompany.map(([org, mins]) => (
            <div key={org} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <CompanyChip employerOrgId={org} ownerOrgId={ownerOrgId} />
                <span className="font-mono text-xs">{org}</span>
              </div>
              <div>{Math.round((mins/60)*100)/100} h</div>
            </div>
          ))}
          {totalsByCompany.length === 0 && <div className="text-sm text-muted-foreground">No data.</div>}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeApprovalTable;
