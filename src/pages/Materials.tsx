import AppLayout from "@/components/layout/AppLayout";
import Seo from "@/components/seo/Seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, AlertTriangle } from "lucide-react";

const Materials = () => {
  return (
    <AppLayout>
      <Seo title="BuildBuddy — Materials" description="Catalog items, track stock per site, and handle requests." />
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Materials</h1>
            <p className="text-muted-foreground mt-1">Items catalog, site stock levels, and requests.</p>
          </div>
          <Button variant="hero"><Plus /> New Item</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Items Catalog</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Add suppliers via external_link fields. Integrations scaffolded for later.</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-accent" /> Low Stock Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Low-stock items per site will be listed here.</div>
            </CardContent>
          </Card>
        </div>
      </section>
    </AppLayout>
  );
};

export default Materials;
