
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

  // Handle post sign-in bootstrap for profile and organization
  const handlePostSignIn = async (signedInUser: User) => {
    try {
      const fullName = localStorage.getItem('signup_full_name');
      const orgName = localStorage.getItem('signup_org_name');

      if (fullName) {
        await supabase.from('profiles').upsert(
          { user_id: signedInUser.id, full_name: fullName },
          { onConflict: 'user_id' }
        );
      }

      if (orgName) {
        const { data: mems } = await supabase
          .from('organization_members')
          .select('org_id')
          .eq('user_id', signedInUser.id);
        if (!mems || mems.length === 0) {
          console.log('[Auth] Creating org via RPC create_org_with_admin for user', signedInUser.id);
          const { data: newOrgId, error: rpcErr } = await supabase.rpc('create_org_with_admin' as any, {
            org_name: orgName,
          });
          if (!rpcErr && newOrgId) {
            setActiveOrgId(newOrgId as string);
            setNeedsOrgSetup(false);
          } else if (rpcErr) {
            console.warn('create_org_with_admin RPC error', rpcErr);
          }
        }
      }
    } catch (e) {
      console.warn('post sign-in bootstrap error', e);
    } finally {
      localStorage.removeItem('signup_full_name');
      localStorage.removeItem('signup_org_name');
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      // Defer further calls to avoid deadlocks
      if (event === 'SIGNED_IN') {
        setTimeout(() => {
          if (sess?.user) {
            handlePostSignIn(sess.user)
              .catch(() => {})
              .finally(() => { refreshOrgScope().catch(() => {}); });
          } else {
            refreshOrgScope().catch(() => {});
          }
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
    console.log('[Auth] Creating org via RPC create_org_with_admin for name', name);
    const { data: orgId, error } = await supabase.rpc('create_org_with_admin' as any, { org_name: name });
    if (error) throw error;
    setActiveOrgId(orgId as string);
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

