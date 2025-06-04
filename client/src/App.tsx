import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Schedule from "@/pages/schedule";
import Equipment from "@/pages/equipment";
import Users from "@/pages/users";
import Maintenance from "@/pages/maintenance";
import Reports from "@/pages/reports";
import DailyInspection from "@/pages/daily-inspection-new";
import Remarks from "@/pages/remarks";
import Profile from "@/pages/profile";
import Tasks from "@/pages/tasks";
import { MobileSidebarProvider } from "@/hooks/use-mobile-sidebar";
import { AuthProvider } from "@/hooks/use-auth";
import { UserStatusProvider } from "@/hooks/use-user-status";
import { EquipmentProvider } from "@/hooks/use-equipment-data";
import { RemarksProvider } from "@/hooks/use-remarks-data";
import { MaintenanceProvider } from "@/hooks/use-maintenance-data";
import { InspectionChecklistProvider } from "@/hooks/use-inspection-checklists";
import { SidebarProvider } from "@/hooks/use-sidebar-state";
import { ProtectedRoute } from "@/components/auth/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/schedule">
        <ProtectedRoute>
          <Schedule />
        </ProtectedRoute>
      </Route>
      <Route path="/equipment">
        <ProtectedRoute>
          <Equipment />
        </ProtectedRoute>
      </Route>
      <Route path="/daily-inspection">
        <ProtectedRoute>
          <DailyInspection />
        </ProtectedRoute>
      </Route>
      <Route path="/daily-inspection-new">
        <ProtectedRoute>
          <DailyInspection />
        </ProtectedRoute>
      </Route>
      <Route path="/users">
        <ProtectedRoute>
          <Users />
        </ProtectedRoute>
      </Route>
      <Route path="/maintenance">
        <ProtectedRoute>
          <Maintenance />
        </ProtectedRoute>
      </Route>
      <Route path="/tasks">
        <ProtectedRoute>
          <Tasks />
        </ProtectedRoute>
      </Route>
      <Route path="/remarks">
        <ProtectedRoute>
          <Remarks />
        </ProtectedRoute>
      </Route>
      <Route path="/reports">
        <ProtectedRoute>
          <Reports />
        </ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <SidebarProvider>
            <EquipmentProvider>
              <RemarksProvider>
                <MaintenanceProvider>
                  <InspectionChecklistProvider>
                    <UserStatusProvider>
                      <MobileSidebarProvider>
                        <Toaster />
                        <Router />
                      </MobileSidebarProvider>
                    </UserStatusProvider>
                  </InspectionChecklistProvider>
                </MaintenanceProvider>
              </RemarksProvider>
            </EquipmentProvider>
          </SidebarProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
