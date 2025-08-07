import { ReactNode } from "react";
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

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
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
            {/* Placeholder for org selector and user menu */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Organization</span>
            </div>
          </div>
        </header>
        <GlobalRlsBanner />
        <main className="p-6">
          <div className="relative">
            <div className="pointer-events-none absolute -top-8 left-1/2 h-24 w-72 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary/30 to-accent/30 blur-2xl" />
          </div>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
