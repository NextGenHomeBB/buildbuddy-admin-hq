import AppLayout from "@/components/layout/AppLayout";
import Seo from "@/components/seo/Seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { cleanupAuthState } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/projects', { replace: true });
    });
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      cleanupAuthState();
      try { await supabase.auth.signOut({ scope: 'global' }); } catch {}
      const redirectUrl = `${window.location.origin}/projects`;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectUrl },
      });
      if (error) throw error;
      setSent(true);
      toast({ title: "Check your email", description: "We sent you a sign-in link." });
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <Seo title="BuildBuddy — Login" description="Sign in to BuildBuddy Admin." />
      <section className="mx-auto max-w-md space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
          </CardHeader>
          <CardContent>
            {sent ? (
              <p className="text-sm text-muted-foreground">Magic link sent to {email}. You can close this tab.</p>
            ) : (
              <form onSubmit={onSubmit} className="space-y-3">
                <div>
                  <label className="text-sm">Email</label>
                  <Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@company.com" required />
                </div>
                <Button type="submit" className="w-full">Send magic link</Button>
              </form>
            )}
          </CardContent>
        </Card>
      </section>
    </AppLayout>
  );
};

export default Login;
