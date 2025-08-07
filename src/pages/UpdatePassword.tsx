import AppLayout from "@/components/layout/AppLayout";
import Seo from "@/components/seo/Seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const UpdatePassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({ title: "Password updated", description: "You can now continue." });
      navigate("/projects", { replace: true });
    } catch (e: any) {
      setError(e?.message || "Could not update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <Seo title="BuildBuddy — Update Password" description="Set a new password to access your account." canonical="/auth/update-password" />
      <main className="mx-auto max-w-md space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Update your password</h1>
          <p className="text-sm text-muted-foreground">Enter a new password to continue</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Set new password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-3">
              <div>
                <label className="text-sm">New password</label>
                <Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Minimum 8 characters" required />
              </div>
              <div>
                <label className="text-sm">Confirm new password</label>
                <Input type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} placeholder="Re-enter password" required />
              </div>
              {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>{loading ? "Updating…" : "Update password"}</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
};

export default UpdatePassword;
