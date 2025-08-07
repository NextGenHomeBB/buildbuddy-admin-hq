import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  activeOrgId: string | null;
  needsOrgSetup: boolean;
  setActiveOrgId: (orgId: string | null) => void;
  createOrganization: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [needsOrgSetup, setNeedsOrgSetup] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      // Defer further calls to avoid deadlocks
      if (event === 'SIGNED_IN') {
        setTimeout(() => {
          refreshOrgScope().catch(() => {});
        }, 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) refreshOrgScope().catch(() => {});
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshOrgScope = async () => {
    if (!user) return;
    const { data, error } = await supabase.from('organization_members').select('org_id').eq('user_id', user.id);
    if (error) {
      console.warn('org scope error', error);
      return;
    }
    if (data && data.length > 0) {
      setActiveOrgId(data[0].org_id);
      setNeedsOrgSetup(false);
    } else {
      setActiveOrgId(null);
      setNeedsOrgSetup(true);
    }
  };

  const createOrganization = async (name: string) => {
    if (!user) throw new Error('Not signed in');
    // 1) Create org
    const { data: org, error: orgErr } = await supabase
      .from('organizations')
      .insert({ name, created_by: user.id })
      .select('id')
      .single();
    if (orgErr) throw orgErr;
    // 2) Add self as admin (policy: creator can add self)
    const { error: memErr } = await supabase
      .from('organization_members')
      .insert({ org_id: org.id, user_id: user.id, role: 'org_admin' });
    if (memErr) throw memErr;
    setActiveOrgId(org.id);
    setNeedsOrgSetup(false);
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    session,
    loading,
    activeOrgId,
    needsOrgSetup,
    setActiveOrgId,
    createOrganization,
  }), [user, session, loading, activeOrgId, needsOrgSetup]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
