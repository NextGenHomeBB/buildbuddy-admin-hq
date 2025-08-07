import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProjectOwnerOrg, useTimeLogs, TimeFilters } from "@/hooks/projects";
import CompanyChip from "./CompanyChip";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props { projectId: string }

const TimeApprovalTable = ({ projectId }: Props) => {
  const [status, setStatus] = useState<TimeFilters["status"]>(["submitted","approved"]);
  const [company, setCompany] = useState<TimeFilters["company"]>("all");
  const { data: ownerOrgId } = useProjectOwnerOrg(projectId);
  const { data: logs, isLoading, refetch } = useTimeLogs(projectId, { status, company });
  const { toast } = useToast();

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
      refetch();
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    }
  };
  const reject = async (id: string) => {
    try {
      const { error } = await supabase.from("time_logs").update({ status: "rejected" }).eq("id", id);
      if (error) throw error;
      toast({ title: "Rejected" });
      refetch();
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    }
  };

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
        <CardContent className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Button size="sm" variant={status?.includes("submitted")?"default":"outline"} onClick={()=>setStatus(["submitted"])}>Submitted</Button>
            <Button size="sm" variant={status?.includes("approved")?"default":"outline"} onClick={()=>setStatus(["approved"])}>Approved</Button>
            <Button size="sm" variant={status?.includes("rejected")?"default":"outline"} onClick={()=>setStatus(["rejected"])}>Rejected</Button>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Button size="sm" variant={company==="all"?"default":"outline"} onClick={()=>setCompany("all")}>All</Button>
            <Button size="sm" variant={company==="internal"?"default":"outline"} onClick={()=>setCompany("internal")}>Internal</Button>
            <Button size="sm" variant={company==="vendors"?"default":"outline"} onClick={()=>setCompany("vendors")}>Vendors</Button>
          </div>
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
                    <Button size="sm" variant="outline" onClick={() => approve(l.id, l.bill_to_org_id!)} disabled={!ownerOrgId || l.bill_to_org_id !== ownerOrgId}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => reject(l.id)} disabled={!ownerOrgId || l.bill_to_org_id !== ownerOrgId}>Reject</Button>
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
