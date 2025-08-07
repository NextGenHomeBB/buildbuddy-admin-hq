import AppLayout from "@/components/layout/AppLayout";
import Seo from "@/components/seo/Seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

const KPI = ({ title, value }: { title: string; value: string }) => (
  <Card className="shadow-sm">
    <CardHeader>
      <CardTitle className="text-base text-muted-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-semibold tracking-tight">{value}</div>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  return (
    <AppLayout>
      <Seo title="BuildBuddy Admin — Dashboard" description="KPI overview: projects, hours, invoices, materials." />
      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Your organization’s activity at a glance.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">This week</Button>
            <Button variant="hero"><FileDown /> Export Report</Button>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <KPI title="Active projects" value="12" />
          <KPI title="Hours logged (wk)" value="384" />
          <KPI title="Open invoices" value="€42,300" />
          <KPI title="Material requests" value="7" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Connect Supabase to load live data.</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Time logs and material requests pending approval will appear here.</div>
            </CardContent>
          </Card>
        </div>
      </section>
    </AppLayout>
  );
};

export default Dashboard;
