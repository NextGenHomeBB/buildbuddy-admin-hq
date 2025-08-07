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
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const Login = () => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [sent, setSent] = useState(false);
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [signInMethod, setSignInMethod] = useState<"magic" | "password">("magic");
  const [signUpWithPassword, setSignUpWithPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = window.setInterval(() => {
      setResendCooldown((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [resendCooldown]);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/onboarding', { replace: true });
    });
  }, [navigate]);

  const sendMagicLink = async (targetEmail: string) => {
    cleanupAuthState();
    try { await supabase.auth.signOut({ scope: 'global' }); } catch {}
  const redirectUrl = `${window.location.origin}/auth/callback`;
  const { error } = await supabase.auth.signInWithOtp({
      email: targetEmail,
      options: { emailRedirectTo: redirectUrl },
    });
    if (error) throw error;
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;
    try {
      setLoading(true);
      await sendMagicLink(email);
      setResendCooldown(60);
      toast({ title: "Magic link resent", description: "Check your inbox again." });
    } catch (err: any) {
      toast({ title: "Could not resend", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === "signin") {
        if (signInMethod === "password") {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          toast({ title: "Signed in", description: "Welcome back!" });
          navigate("/onboarding", { replace: true });
        } else {
          await sendMagicLink(email);
          setSent(true);
          setResendCooldown(30);
          toast({ title: "Check your email", description: "We sent you a magic link and one-time code." });
        }
      } else {
        if (!fullName || !orgName) {
          toast({ title: "Missing info", description: "Please enter your name and organization.", variant: "destructive" });
          return;
        }
        localStorage.setItem('signup_full_name', fullName);
        localStorage.setItem('signup_org_name', orgName);

        if (signUpWithPassword) {
          if (!password || password.length < 6) {
            toast({ title: "Weak password", description: "Use at least 6 characters.", variant: "destructive" });
            return;
          }
          if (password !== confirmPassword) {
            toast({ title: "Passwords do not match", description: "Please re-enter them.", variant: "destructive" });
            return;
          }
          const redirectUrl = `${window.location.origin}/auth/callback`;
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: redirectUrl, data: { full_name: fullName, org_name: orgName } }
          });
          if (error) throw error;
          if (data.session) {
            toast({ title: "Account created", description: "You're all set!" });
            navigate("/onboarding", { replace: true });
          } else {
            setSent(true);
            setResendCooldown(30);
            toast({ title: "Confirm your email", description: "We sent you a confirmation link and code." });
          }
        } else {
          await sendMagicLink(email);
          setSent(true);
          setResendCooldown(30);
          toast({ title: "Check your email", description: "We sent you a magic link and one-time code." });
        }
      }
    } catch (err: any) {
      const msg = String(err?.message || '').toLowerCase();
      const code = (err && (err.code || err.error || err.name)) || '';
      if (tab === 'signin' && signInMethod === 'password' && (code === 'invalid_credentials' || msg.includes('invalid login credentials'))) {
        try {
          await sendMagicLink(email);
          setSent(true);
          setResendCooldown(30);
          toast({ title: 'Use magic link or code', description: 'No password found or incorrect. We emailed a link and code.' });
        } catch (e: any) {
          toast({ title: 'Sign-in failed', description: e.message || 'Please try again.', variant: 'destructive' });
        }
      } else {
        toast({ title: 'Request failed', description: err.message, variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!email || !otp || otp.length < 6) return;
    try {
      setVerifying(true);
      // Try magiclink type first, then fallback to email type
      const r1 = await supabase.auth.verifyOtp({ email, token: otp, type: 'magiclink' });
      if (r1?.data?.session) {
        toast({ title: 'Signed in', description: 'Verification successful.' });
        navigate('/onboarding', { replace: true });
        return;
      }
      const r2 = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
      if (r2?.data?.session) {
        toast({ title: 'Signed in', description: 'Verification successful.' });
        navigate('/onboarding', { replace: true });
        return;
      }
      toast({ title: 'Invalid or expired code', description: 'Please request a new code.', variant: 'destructive' });
    } catch (e: any) {
      const m = String(e?.message || '').toLowerCase();
      if (m.includes('expired') || m.includes('invalid')) {
        toast({ title: 'Invalid or expired code', description: 'Please request a new code.', variant: 'destructive' });
      } else {
        toast({ title: 'Verification failed', description: e.message || 'Try again.', variant: 'destructive' });
      }
    } finally {
      setVerifying(false);
    }
  };
  return (
    <AppLayout>
      <Seo title="BuildBuddy — Login" description="Sign in passwordlessly via magic link or a one-time code." canonical="/auth/login" />
      <main className="mx-auto max-w-md space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in to BuildBuddy</h1>
          <p className="text-sm text-muted-foreground">Magic link, one-time code, or password.</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>{sent ? "Check your email" : (tab === 'signin' ? "Sign in" : "Create your account")}</CardTitle>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">We sent a magic link and code to {email}. Open the link or enter the 6-digit code below.</p>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" type="button" onClick={handleVerify} disabled={verifying || otp.length < 6}>
                    {verifying ? 'Verifying…' : 'Verify code'}
                  </Button>
                  <Button variant="outline" type="button" className="flex-1" onClick={handleResend} disabled={resendCooldown > 0 || loading}>
                    {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend"}
                  </Button>
                  <Button variant="ghost" type="button" onClick={() => setSent(false)}>
                    Back
                  </Button>
                </div>
              </div>
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
                    {signInMethod === "password" && (
                      <div>
                        <label className="text-sm">Password</label>
                        <Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Your password" required />
                      </div>
                    )}
                    <Button type="submit" className="w-full" disabled={loading}>
                      {signInMethod === "password" ? "Sign in" : "Send magic link"}
                    </Button>
                    {signInMethod === "magic" && (
                      <p className="text-xs text-muted-foreground text-center mt-1">We’ll email you a secure magic link.</p>
                    )}
                  </form>
                  <div className="flex flex-col gap-2 mt-2">
                    <Button variant="outline" type="button" className="w-full" onClick={() => setTab('signup')}>
                      Sign up
                    </Button>
                    <Button variant="ghost" type="button" className="w-full text-sm text-muted-foreground" onClick={() => setSignInMethod(signInMethod === "magic" ? "password" : "magic")}>
                      {signInMethod === "magic" ? "Use password instead" : "Use magic link instead"}
                    </Button>
                  </div>
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

                    {signUpWithPassword && (
                      <>
                        <div>
                          <label className="text-sm">Password</label>
                          <Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Create a password" required />
                        </div>
                        <div>
                          <label className="text-sm">Confirm password</label>
                          <Input type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} placeholder="Re-enter password" required />
                        </div>
                      </>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>Sign up</Button>
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      {signUpWithPassword ? "You may need to confirm your email after signup." : "We’ll email you a secure magic link."}
                    </p>
                  </form>
                  <div className="flex flex-col gap-2 mt-2">
                    <Button variant="outline" type="button" className="w-full" onClick={() => setTab('signin')}>
                      Sign in
                    </Button>
                    <Button variant="ghost" type="button" className="w-full text-sm text-muted-foreground" onClick={() => setSignUpWithPassword(!signUpWithPassword)}>
                      {signUpWithPassword ? "Use magic link instead" : "Or, set a password now"}
                    </Button>
                  </div>
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
