import { NavLink } from "react-router-dom";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Home, Users, FolderOpen, Clock, Boxes, Receipt, MessageSquare, Settings, BarChart3 } from "lucide-react";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/people", label: "People & Roles", icon: Users },
  { to: "/projects", label: "Projects", icon: FolderOpen },
  { to: "/time", label: "Time & Scheduling", icon: Clock },
  { to: "/materials", label: "Materials", icon: Boxes },
  { to: "/billing", label: "Quotes & Invoices", icon: Receipt },
  { to: "/reports/hours", label: "Hours Report", icon: BarChart3 },
  { to: "/messages", label: "Messaging", icon: MessageSquare },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/settings/org", label: "Org Settings", icon: Settings },
];

const SidebarNav = () => {
  return (
    <>
      {items.map((item) => (
        <SidebarMenuItem key={item.to}>
          <NavLink to={item.to} end className="block">
            {({ isActive }) => (
              <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                <span className="flex items-center gap-2">
                  <item.icon />
                  <span>{item.label}</span>
                </span>
              </SidebarMenuButton>
            )}
          </NavLink>
        </SidebarMenuItem>
      ))}
    </>
  );
};

export default SidebarNav;
