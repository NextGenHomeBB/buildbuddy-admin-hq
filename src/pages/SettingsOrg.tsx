import AppLayout from "@/components/layout/AppLayout";
import Seo from "@/components/seo/Seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const SettingsOrg = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const link = phone ? `https://wa.me/${phone}?text=${encodeURIComponent("Hello from BuildBuddy")}` : "";

  return (
    <AppLayout>
      <Seo title="BuildBuddy — Org Settings" description="Organization profile and WhatsApp configuration." />
      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Organization Settings</h1>
          <p className="text-muted-foreground mt-1">Profile and WhatsApp phone.</p>
        </div>
        <Card>
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Organization name</Label>
              <Input value={name} onChange={(e)=>setName(e.target.value)} placeholder="ACME Builders" />
            </div>
            <div className="space-y-1">
              <Label>WhatsApp phone</Label>
              <Input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="31612345678" />
            </div>
            {link && (
              <div className="md:col-span-2 text-sm">
                Deep link: <a className="underline" href={link} target="_blank" rel="noreferrer">{link}</a>
              </div>
            )}
            <div className="md:col-span-2">
              <Button>Save</Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </AppLayout>
  );
};

export default SettingsOrg;
