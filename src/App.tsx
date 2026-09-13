// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Pipeline from "./pages/Pipeline";
import TasksPage from "./pages/Tasks";
import AIIntelligence from "./pages/AIIntelligence";
import Conversations from "./pages/Conversations";
import Programs from "./pages/Programs";
import AiPmProgram from "./pages/programs/AiPmProgram";
import AiGtmProgram from "./pages/programs/AiGtmProgram";
import AiFellowshipProgram from "./pages/programs/AiFellowshipProgram";
import Analytics from "./pages/Analytics";
import Integrations from "./pages/Integrations";
import Settings from "./pages/Settings";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes */}
        <Route path="/auth/signin" element={<SignIn />} />
        <Route path="/auth/signup" element={<SignUp />} />
        {/* Protected app routes */}
        <Route element={<ProtectedRoute />}> {/* wrapper that checks auth */}
          <Route element={<AppLayout />}> {/* layout with sidebar/header */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/ai" element={<AIIntelligence />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/programs/ai-pm" element={<AiPmProgram />} />
            <Route path="/programs/ai-gtm" element={<AiGtmProgram />} />
            <Route path="/programs/ai-fellowship" element={<AiFellowshipProgram />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

