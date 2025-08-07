import AppLayout from "@/components/layout/AppLayout";
import Seo from "@/components/seo/Seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Settings = () => {
  return (
    <AppLayout>
      <Seo title="BuildBuddy — Settings" description="Organization profile, billing placeholders, WhatsApp config." />
      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage organization profile and integrations.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Name, logo, address and WhatsApp business phone configuration.</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Billing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Placeholders for future billing and subscription settings.</div>
            </CardContent>
          </Card>
        </div>
      </section>
    </AppLayout>
  );
};

export default Settings;
