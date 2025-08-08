import AppLayout from "@/components/layout/AppLayout";
import Seo from "@/components/seo/Seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmNotice, setConfirmNotice] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/projects", { replace: true });
    });
  }, [navigate]);

  const isPasswordValid = useMemo(() => password.length >= 8, [password]);

  const ensureProfile = async () => {
    const { data: existing } = await supabase
      .from("profiles")
      .select("user_id")
      .maybeSingle();
    if (!existing) {
      await supabase.from("profiles").insert({ user_id: (await supabase.auth.getUser()).data.user?.id, full_name: null });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setConfirmNotice(null);
    setLoading(true);
    try {
      if (tab === "signin") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
          if (data.session) {
            await ensureProfile();
            navigate("/projects", { replace: true });
          }
      } else {
        if (!isPasswordValid) {
          setError("Password must be at least 8 characters");
          return;
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          return;
        }
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
          if (data.session) {
            await ensureProfile();
            navigate("/projects", { replace: true });
          } else {
          setConfirmNotice("Check your email to confirm your account.");
        }
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!email) {
      setError("Enter your email first");
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) throw error;
      toast({ title: "Password reset sent", description: "Check your email for the reset link." });
    } catch (e: any) {
      setError(e?.message || "Could not send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <Seo title="BuildBuddy — Auth" description="Sign in or create an account using email and password." canonical="/auth" />
      <main className="mx-auto max-w-md space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Access BuildBuddy</h1>
          <p className="text-sm text-muted-foreground">Email and password authentication</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>{tab === "signin" ? "Sign in" : "Create account"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Create Account</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-4">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="text-sm">Email</label>
                    <Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@company.com" required />
                  </div>
                  <div>
                    <label className="text-sm">Password</label>
                    <Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Your password" required />
                  </div>
                  {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
                  <Button type="submit" className="w-full" disabled={loading}>{loading ? "Please wait…" : "Sign in"}</Button>
                </form>
                <div className="flex justify-between mt-2">
                  <button type="button" className="text-sm text-muted-foreground underline" onClick={handleForgot} disabled={loading}>
                    Forgot password?
                  </button>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="mt-4">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="text-sm">Email</label>
                    <Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@company.com" required />
                  </div>
                  <div>
                    <label className="text-sm">Password</label>
                    <Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Create a password" required />
                    <p className="text-xs text-muted-foreground mt-1">Minimum 8 characters.</p>
                  </div>
                  <div>
                    <label className="text-sm">Confirm password</label>
                    <Input type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} placeholder="Re-enter password" required />
                  </div>
                  {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
                  {confirmNotice && <p className="text-sm" role="status">{confirmNotice}</p>}
                  <Button type="submit" className="w-full" disabled={loading}>{loading ? "Please wait…" : "Create account"}</Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
};

export default Auth;
