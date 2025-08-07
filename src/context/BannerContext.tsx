import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

type Banner = { message: string } | null;

const BannerContext = createContext<{ banner: Banner; setBanner: (b: Banner) => void } | undefined>(undefined);

export const BannerProvider = ({ children }: { children: ReactNode }) => {
  const [banner, setBanner] = useState<Banner>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ message: string } | undefined>;
      setBanner(custom.detail || { message: "You don’t have access to this record (RLS). Select another org or contact an admin." });
      // auto-hide after 6s
      setTimeout(() => setBanner(null), 6000);
    };
    window.addEventListener('rls-403', handler as EventListener);
    return () => window.removeEventListener('rls-403', handler as EventListener);
  }, []);

  const value = useMemo(() => ({ banner, setBanner }), [banner]);
  return <BannerContext.Provider value={value}>{children}</BannerContext.Provider>;
};

export const useBanner = () => {
  const ctx = useContext(BannerContext);
  return ctx ?? { banner: null, setBanner: () => {} };
};
