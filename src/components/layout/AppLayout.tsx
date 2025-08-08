import { ReactNode, useMemo, useState } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SidebarNav from "./SidebarNav";
import { Link } from "react-router-dom";
import GlobalRlsBanner from "@/components/GlobalRlsBanner";
import OrgSwitcher from "@/components/org/OrgSwitcher";
import CreateOrgModal from "@/components/org/CreateOrgModal";
import { useActiveOrg } from "@/hooks/useActiveOrg";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { hasAnyOrg, loading: orgLoading, activeOrgId } = useActiveOrg();
  const [createOpen, setCreateOpen] = useState(false);
  const forcedOpen = useMemo(() => !orgLoading && !hasAnyOrg && !activeOrgId, [orgLoading, hasAnyOrg, activeOrgId]);

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Link to="/dashboard" className={cn(buttonVariants({ variant: "link" }), "px-2 text-base font-semibold")}>BuildBuddy Admin</Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarNav />
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
          <div className="text-xs text-muted-foreground px-2">v0.1.0</div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b">
          <div className="h-14 px-4 flex items-center gap-3">
            <SidebarTrigger />
            <div className="flex-1" />
            {/* Org switcher and user menu */}
            <div className="flex items-center gap-2">
              <OrgSwitcher onCreateNew={() => setCreateOpen(true)} />
              <Link to="/auth/logout" className={cn(buttonVariants({ variant: "outline" }), "h-8")}>Sign out</Link>
            </div>
          </div>
        </header>
        <GlobalRlsBanner />
        <main className="p-6">
          <div className="relative">
            <div className="pointer-events-none absolute -top-8 left-1/2 h-24 w-72 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary/30 to-accent/30 blur-2xl" />
          </div>
          {/* Block content when first-run org creation is required */}
          {forcedOpen ? null : children}
        </main>
        <CreateOrgModal open={forcedOpen || createOpen} forced={forcedOpen} onClose={() => setCreateOpen(false)} />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
