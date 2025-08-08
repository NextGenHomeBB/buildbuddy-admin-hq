import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Seo from "@/components/seo/Seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, CalendarPlus } from "lucide-react";
import NewShiftModal from "@/components/time/NewShiftModal";
import { useActiveOrg } from "@/hooks/useActiveOrg";

const Time = () => {
  const [isNewShiftOpen, setIsNewShiftOpen] = useState(false);
  const { activeOrgId } = useActiveOrg();
  return (
    <AppLayout>
      <Seo title="BuildBuddy — Time & Scheduling" description="Create shifts, approve time logs, and export hours." />
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Time & Scheduling</h1>
            <p className="text-muted-foreground mt-1">Plan shifts and manage approvals for submitted hours.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline"><FileDown /> Export CSV</Button>
            <Button variant="hero" onClick={() => setIsNewShiftOpen(true)} disabled={!activeOrgId}><CalendarPlus /> New Shift</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Shifts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Shifts will display here by project and date.</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Time Logs (Awaiting Approval)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Submitted logs pending approval will appear here.</div>
            </CardContent>
          </Card>
        </div>
      </section>
      <NewShiftModal
        isOpen={isNewShiftOpen}
        onClose={() => setIsNewShiftOpen(false)}
        orgId={activeOrgId || ""}
      />
    </AppLayout>
  );
};

export default Time;
