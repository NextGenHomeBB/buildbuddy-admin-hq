import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import People from "./pages/People";
import Projects from "./pages/Projects";
import Time from "./pages/Time";
import Materials from "./pages/Materials";
import Billing from "./pages/Billing";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ProjectDetail from "./pages/ProjectDetail";
import ReportsHours from "./pages/ReportsHours";
import SettingsOrg from "./pages/SettingsOrg";
import Login from "./pages/Login";
import { AuthProvider } from "@/context/AuthContext";
import AuthGate from "@/components/auth/AuthGate";
import { BannerProvider } from "@/context/BannerContext";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (err: any) => {
      const status = (err?.status as number) || (err?.code === 'PGRST116' ? 403 : undefined);
      const msg = (err?.message || '').toLowerCase();
      if (status === 403 || (msg.includes('row') && msg.includes('security'))) {
        window.dispatchEvent(new CustomEvent('rls-403'));
      }
    }
  }),
  mutationCache: new MutationCache({
    onError: (err: any) => {
      const status = (err?.status as number) || (err?.code === 'PGRST116' ? 403 : undefined);
      const msg = (err?.message || '').toLowerCase();
      if (status === 403 || (msg.includes('row') && msg.includes('security'))) {
        window.dispatchEvent(new CustomEvent('rls-403'));
      }
    }
  }),
  defaultOptions: { queries: { retry: false } }
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BannerProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/people" element={<People />} />
              <Route path="/projects" element={<AuthGate><Projects /></AuthGate>} />
              <Route path="/projects/:id" element={<AuthGate><ProjectDetail /></AuthGate>} />
              <Route path="/time" element={<AuthGate><Time /></AuthGate>} />
              <Route path="/materials" element={<AuthGate><Materials /></AuthGate>} />
              <Route path="/billing" element={<AuthGate><Billing /></AuthGate>} />
              <Route path="/messages" element={<AuthGate><Messages /></AuthGate>} />
              <Route path="/reports/hours" element={<AuthGate><ReportsHours /></AuthGate>} />
              <Route path="/settings" element={<AuthGate><Settings /></AuthGate>} />
              <Route path="/settings/org" element={<AuthGate><SettingsOrg /></AuthGate>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </BannerProvider>
  </QueryClientProvider>
);

export default App;
