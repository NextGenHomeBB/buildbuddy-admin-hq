import AppLayout from "@/components/layout/AppLayout";
import Seo from "@/components/seo/Seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { cleanupAuthState } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [sent, setSent] = useState(false);
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/projects', { replace: true });
    });
  }, [navigate]);

  const sendMagicLink = async (targetEmail: string) => {
    cleanupAuthState();
    try { await supabase.auth.signOut({ scope: 'global' }); } catch {}
    const redirectUrl = `${window.location.origin}/projects`;
    const { error } = await supabase.auth.signInWithOtp({
      email: targetEmail,
      options: { emailRedirectTo: redirectUrl },
    });
    if (error) throw error;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (tab === "signup") {
        if (!fullName || !orgName) {
          toast({ title: "Missing info", description: "Please enter your name and organization.", variant: "destructive" });
          return;
        }
        localStorage.setItem('signup_full_name', fullName);
        localStorage.setItem('signup_org_name', orgName);
      }

      await sendMagicLink(email);
      setSent(true);
      toast({ title: "Check your email", description: "We sent you a magic link to continue." });
    } catch (err: any) {
      toast({ title: "Request failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <Seo title="BuildBuddy — Login & Sign up" description="Sign in or sign up to BuildBuddy with a magic link." canonical="/login" />
      <main className="mx-auto max-w-md space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">BuildBuddy Login & Sign Up</h1>
          <p className="text-sm text-muted-foreground">Passwordless access with secure magic links.</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>{sent ? "Check your email" : (tab === 'signin' ? "Sign in" : "Create your account")}</CardTitle>
          </CardHeader>
          <CardContent>
            {sent ? (
              <p className="text-sm text-muted-foreground">We sent a magic link to {email}. You can close this tab.</p>
            ) : (
              <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="signin">Sign in</TabsTrigger>
                  <TabsTrigger value="signup">Sign up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="mt-4">
                  <form onSubmit={onSubmit} className="space-y-3">
                    <div>
                      <label className="text-sm">Email</label>
                      <Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@company.com" required />
                    </div>
                    <Button type="submit" className="w-full">Send magic link</Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="mt-4">
                  <form onSubmit={onSubmit} className="space-y-3">
                    <div>
                      <label className="text-sm">Full name</label>
                      <Input value={fullName} onChange={(e)=>setFullName(e.target.value)} placeholder="Jane Doe" required />
                    </div>
                    <div>
                      <label className="text-sm">Work email</label>
                      <Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@company.com" required />
                    </div>
                    <div>
                      <label className="text-sm">Organization</label>
                      <Input value={orgName} onChange={(e)=>setOrgName(e.target.value)} placeholder="Your Company Inc." required />
                    </div>
                    <Button type="submit" className="w-full">Create account</Button>
                  </form>
                  <Button variant="outline" type="button" className="w-full mt-2" onClick={() => setTab('signin')}>
                    Sign in
                  </Button>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
};

export default Login;
