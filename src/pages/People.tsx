import AppLayout from "@/components/layout/AppLayout";
import Seo from "@/components/seo/Seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MailPlus } from "lucide-react";

const People = () => {
  return (
    <AppLayout>
      <Seo title="BuildBuddy — People & Roles" description="Invite and manage users, roles and access." />
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-semibold">People & Roles</h1>
            <p className="text-muted-foreground mt-1">Invite users and assign roles per organization or site.</p>
          </div>
          <Button variant="hero"><MailPlus /> Invite User</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">After connecting Supabase, you’ll see members with role controls. Actions: resend invite, deactivate.</div>
          </CardContent>
        </Card>
      </section>
    </AppLayout>
  );
};

export default People;
