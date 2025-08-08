
import AppLayout from "@/components/layout/AppLayout";
import Seo from "@/components/seo/Seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";

const SettingsOrg = () => {
  const { activeOrgId } = useAuth();

  const [initialName, setInitialName] = useState("");
  const [initialPhone, setInitialPhone] = useState<string>("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [loadingOrg, setLoadingOrg] = useState(false);

  const link = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent("Hello from BuildBuddy")}`
    : "";

  const isDirty = useMemo(() => {
    return name.trim() !== initialName.trim() || (phone || "").trim() !== (initialPhone || "").trim();
  }, [name, phone, initialName, initialPhone]);

  useEffect(() => {
    // Load current organization details
    if (!activeOrgId) {
      setInitialName("");
      setInitialPhone("");
      setName("");
      setPhone("");
      return;
    }

    setLoadingOrg(true);
    console.log("[SettingsOrg] Loading organization", activeOrgId);
    // Cast payloads to any where needed to avoid type mismatch if generated types lag behind
    supabase
      .from("organizations")
      .select("name, whatsapp_phone")
      .eq("id", activeOrgId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.warn("[SettingsOrg] load error", error);
          toast({
            title: "Couldn’t load organization",
            description: error.message || "Please try again.",
            variant: "destructive",
          } as any);
          return;
        }
        const orgName = data?.name ?? "";
        const wapp = (data as any)?.whatsapp_phone ?? "";
        setInitialName(orgName);
        setInitialPhone(wapp || "");
        setName(orgName);
        setPhone(wapp || "");
      })
      .finally(() => setLoadingOrg(false));
  }, [activeOrgId]);

  const onSave = async () => {
    if (!activeOrgId) {
      toast({
        title: "No organization selected",
        description: "Please select an organization and try again.",
        variant: "destructive",
      } as any);
      return;
    }
    if (!isDirty) return;

    setLoading(true);
    console.log("[SettingsOrg] Updating organization", activeOrgId, { name, phone });

    const payload: any = {
      name: name.trim(),
      whatsapp_phone: phone?.trim() || null,
    };

    const { error } = await supabase
      .from("organizations")
      .update(payload as any)
      .eq("id", activeOrgId)
      .select("id")
      .single();

    setLoading(false);

    if (error) {
      console.warn("[SettingsOrg] update error", error);
      const msg = (error as any)?.message || "Update failed. Please try again.";
      toast({
        title: "Couldn’t save",
        description: msg,
        variant: "destructive",
      } as any);
      return;
    }

    setInitialName(name.trim());
    setInitialPhone(phone?.trim() || "");
    toast({
      title: "Saved",
      description: "Organization settings have been updated.",
    } as any);
  };

  return (
    <AppLayout>
      <Seo title="BuildBuddy — Org Settings" description="Organization profile and WhatsApp configuration." />
      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Organization Settings</h1>
          <p className="text-muted-foreground mt-1">Profile and WhatsApp phone.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Organization name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ACME Builders"
                disabled={loadingOrg}
              />
            </div>

            <div className="space-y-1">
              <Label>WhatsApp phone</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="31612345678"
                disabled={loadingOrg}
              />
            </div>

            {link && (
              <div className="md:col-span-2 text-sm">
                Deep link:{" "}
                <a className="underline" href={link} target="_blank" rel="noreferrer">
                  {link}
                </a>
              </div>
            )}

            <div className="md:col-span-2">
              <Button onClick={onSave} disabled={loading || loadingOrg || !isDirty}>
                {loading ? "Saving…" : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {!activeOrgId && (
          <p className="text-sm text-muted-foreground">
            No active organization. Please select one from the organization switcher.
          </p>
        )}
      </section>
    </AppLayout>
  );
};

export default SettingsOrg;
