import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type StatusOption = "submitted" | "approved" | "rejected";

interface FiltersBarProps {
  status: StatusOption[];
  setStatus: (s: StatusOption[]) => void;
  company: "all" | "internal" | "vendors";
  setCompany: (c: "all" | "internal" | "vendors") => void;
  dateFrom: string;
  dateTo: string;
  setDateFrom: (v: string) => void;
  setDateTo: (v: string) => void;
  workerId: string;
  setWorkerId: (v: string) => void;
}

const FiltersBar = ({ status, setStatus, company, setCompany, dateFrom, dateTo, setDateFrom, setDateTo, workerId, setWorkerId }: FiltersBarProps) => {
  const toggleStatus = (val: StatusOption) => {
    setStatus(status.includes(val) ? status.filter(s => s !== val) : [...status, val]);
  };

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="flex items-center gap-2">
        <Button size="sm" variant={status.includes("submitted") ? "default" : "outline"} onClick={()=>toggleStatus("submitted")}>Submitted</Button>
        <Button size="sm" variant={status.includes("approved") ? "default" : "outline"} onClick={()=>toggleStatus("approved")}>Approved</Button>
        <Button size="sm" variant={status.includes("rejected") ? "default" : "outline"} onClick={()=>toggleStatus("rejected")}>Rejected</Button>
      </div>
      <div className="flex items-center gap-2 ml-2">
        <Button size="sm" variant={company === "all" ? "default" : "outline"} onClick={()=>setCompany("all")}>All</Button>
        <Button size="sm" variant={company === "internal" ? "default" : "outline"} onClick={()=>setCompany("internal")}>Internal</Button>
        <Button size="sm" variant={company === "vendors" ? "default" : "outline"} onClick={()=>setCompany("vendors")}>Vendors</Button>
      </div>
      <div className="flex items-center gap-2 ml-2">
        <div>
          <label className="text-xs">From</label>
          <Input type="date" value={dateFrom} onChange={(e)=>setDateFrom(e.target.value)} className="h-8" />
        </div>
        <div>
          <label className="text-xs">To</label>
          <Input type="date" value={dateTo} onChange={(e)=>setDateTo(e.target.value)} className="h-8" />
        </div>
      </div>
      <div className="flex items-center gap-2 ml-2">
        <div>
          <label className="text-xs">Worker</label>
          <Input placeholder="User ID" value={workerId} onChange={(e)=>setWorkerId(e.target.value)} className="h-8" />
        </div>
      </div>
    </div>
  );
};

export default FiltersBar;
