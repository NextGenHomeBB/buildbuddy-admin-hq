import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Seo from "@/components/seo/Seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";

interface Org { id: string; name: string }

const OrgSwitch = () => {
  const navigate = useNavigate();
  const { setActiveOrgId } = useAuth();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    const run = async () => {
      // Organizations RLS allows members to see their orgs
      const { data } = await supabase.from('organizations').select('id, name').order('name');
      setOrgs((data as Org[]) || []);
    };
    run();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return orgs;
    return orgs.filter(o => o.name.toLowerCase().includes(s));
  }, [q, orgs]);

  const choose = (id: string) => {
    setActiveOrgId(id);
    navigate('/projects', { replace: true });
  };

  return (
    <AppLayout>
      <Seo title="BuildBuddy — Choose organization" description="Select the company to work in." canonical="/org/switch" />
      <main className="mx-auto max-w-2xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Choose your company</h1>
          <p className="text-sm text-muted-foreground">Pick where you want to work.</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Your companies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Search companies…" value={q} onChange={(e)=>setQ(e.target.value)} />
            <ul className="divide-y rounded-md border">
              {filtered.map((o) => (
                <li key={o.id} className="flex items-center justify-between p-3">
                  <div className="text-sm">{o.name}</div>
                  <Button size="sm" onClick={() => choose(o.id)}>Select</Button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="p-3 text-sm text-muted-foreground">No matches.</li>
              )}
            </ul>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button variant="outline" onClick={() => navigate('/onboarding')}>Create your company</Button>
        </div>
      </main>
    </AppLayout>
  );
};

export default OrgSwitch;
