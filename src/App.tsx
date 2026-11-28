// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import Today from "./pages/Today";
import Dashboard from "./pages/Dashboard";
import AllLeads from "./pages/AllLeads";
import LeadInbox from "./pages/LeadInbox";
import SalesTeam from "./pages/SalesTeam";
import SalespersonWorkspace from "./pages/SalespersonWorkspace";
import RepActivity from "./pages/RepActivity";
import Payouts from "./pages/Payouts";
import Mentors from "./pages/Mentors";
import Users from "./pages/Users";
import Integrations from "./pages/Integrations";
import Analytics from "./pages/Analytics";
import Programs from "./pages/Programs";
import AiPmProgram from "./pages/programs/AiPmProgram";
import AiGtmProgram from "./pages/programs/AiGtmProgram";
import AiFellowshipProgram from "./pages/programs/AiFellowshipProgram";
import ImportCenter from "./pages/ImportCenter";
import ImportHistory from "./pages/ImportHistory";
import Settings from "./pages/Settings";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import ProtectedRoute from "./components/ProtectedRoute";
import { useApp } from "./context/AppContext";

function PipelineRedirect() {
  const { currentUser } = useApp();
  if (currentUser?.role === 'Salesperson') {
    return <Navigate to="/today?tab=kanban" replace />;
  }
  return <Navigate to="/leads?mode=kanban" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes */}
        <Route path="/auth/signin" element={<SignIn />} />
        <Route path="/auth/signup" element={<SignUp />} />

        {/* Protected app routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* 1. Today Section */}
            <Route path="/" element={<Navigate to="/today" replace />} />
            <Route path="/today" element={<Today />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* 2. Leads Section */}
            <Route path="/inbox" element={<LeadInbox />} />
            <Route path="/leads" element={<AllLeads />} />
            <Route path="/pipeline" element={<PipelineRedirect />} />
            <Route path="/import" element={<ImportCenter />} />
            <Route path="/import-history" element={<ImportHistory />} />

            {/* 3. Team Section */}
            <Route path="/team" element={<SalesTeam />} />
            <Route path="/team/:repId" element={<SalespersonWorkspace />} />
            <Route path="/workspace/:repId" element={<SalespersonWorkspace />} />
            <Route path="/rep-activity" element={<RepActivity />} />
            <Route path="/payouts" element={<Payouts />} />
            <Route path="/reports" element={<Analytics />} />
            <Route path="/reports/revenue" element={<Analytics />} />
            <Route path="/reports/lost-reasons" element={<Analytics />} />
            <Route path="/analytics" element={<Analytics />} />

            {/* 4. Settings Section */}
            <Route path="/programs" element={<Programs />} />
            <Route path="/programs/ai-pm" element={<AiPmProgram />} />
            <Route path="/programs/ai-gtm" element={<AiGtmProgram />} />
            <Route path="/programs/ai-fellowship" element={<AiFellowshipProgram />} />
            <Route path="/settings/mentors" element={<Mentors />} />
            <Route path="/mentors" element={<Mentors />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/settings/users" element={<Users />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />

            {/* Legacy redirects */}
            <Route path="/tasks" element={<Navigate to="/today" replace />} />
            <Route path="/my-day" element={<Navigate to="/today" replace />} />
            <Route path="/nurture" element={<Navigate to="/pipeline" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
