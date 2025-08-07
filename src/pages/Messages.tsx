import AppLayout from "@/components/layout/AppLayout";
import Seo from "@/components/seo/Seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Messages = () => {
  return (
    <AppLayout>
      <Seo title="BuildBuddy — Messaging" description="Per-project chat and file attachments." />
      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Messaging</h1>
          <p className="text-muted-foreground mt-1">Project-based chat will appear here with upload support.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Connect Supabase to load threads. Messages table is included in migrations.</div>
          </CardContent>
        </Card>
      </section>
    </AppLayout>
  );
};

export default Messages;
