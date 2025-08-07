import AppLayout from "@/components/layout/AppLayout";
import Seo from "@/components/seo/Seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, Send } from "lucide-react";

const Billing = () => {
  return (
    <AppLayout>
      <Seo title="BuildBuddy — Quotes & Invoices" description="Create quotes, convert to projects, manage invoices and payments." />
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Quotes & Invoices</h1>
            <p className="text-muted-foreground mt-1">Draft, send and track billing documents.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline"><FileDown /> Export</Button>
            <Button variant="hero"><Send /> New Quote</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Quotes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Sections, line items and VAT supported. Convert to project.</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Draft/Sent/Paid states with due dates and PDF generation.</div>
            </CardContent>
          </Card>
        </div>
      </section>
    </AppLayout>
  );
};

export default Billing;
