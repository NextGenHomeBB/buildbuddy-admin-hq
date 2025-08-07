import { useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Seo from "@/components/seo/Seo";
import { supabase } from "@/lib/supabaseClient";
import { cleanupAuthState } from "@/lib/auth";

const AuthLogout = () => {
  useEffect(() => {
    const run = async () => {
      try {
        cleanupAuthState();
        try { await supabase.auth.signOut({ scope: 'global' }); } catch {}
      } finally {
        window.location.href = '/auth/login';
      }
    };
    run();
  }, []);

  return (
    <AppLayout>
      <Seo title="BuildBuddy — Logging out" description="Signing you out securely." canonical="/auth/logout" />
      <main className="mx-auto max-w-md">
        <p className="text-sm text-muted-foreground">Signing you out…</p>
      </main>
    </AppLayout>
  );
};

export default AuthLogout;
