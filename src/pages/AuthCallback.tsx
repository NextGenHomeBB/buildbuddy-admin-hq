import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Seo from "@/components/seo/Seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) throw error;
        if (data?.session) {
          setStatus("success");
          // Small delay for UX before redirect
          setTimeout(() => navigate("/onboarding", { replace: true }), 200);
        } else {
          setStatus("error");
        }
      } catch (e: any) {
        setStatus("error");
        const msg = e?.message || "Could not complete sign in.";
        toast({ title: "Invalid or expired link", description: msg, variant: "destructive" });
      }
    };
    run();
  }, [navigate, toast]);

  return (
    <AppLayout>
      <Seo title="BuildBuddy — Signing you in" description="Completing your secure sign-in." canonical="/auth/callback" />
      <main className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Sign-in callback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {status === "pending" && <p className="text-sm text-muted-foreground">Verifying your link…</p>}
            {status === "success" && <p className="text-sm">Success! Redirecting…</p>}
            {status === "error" && (
              <div className="space-y-3">
                <p className="text-sm text-destructive">The link is invalid or expired.</p>
                <Button onClick={() => navigate("/auth/login", { replace: true })}>Go to login</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
};

export default AuthCallback;
