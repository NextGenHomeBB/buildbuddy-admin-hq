import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

const AuthGate = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setHasSession(!!session);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      setHasSession(!!session);
      setLoading(false);
    });
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) return null;
  if (!hasSession) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

export default AuthGate;
