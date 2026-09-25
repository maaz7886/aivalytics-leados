// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Pipeline from "./pages/Pipeline";
import AIIntelligence from "./pages/AIIntelligence";
import LeadProfile from "./pages/LeadProfile";
import Conversations from "./pages/Conversations";
import Programs from "./pages/Programs";
import AiPmProgram from "./pages/programs/AiPmProgram";
import AiGtmProgram from "./pages/programs/AiGtmProgram";
import AiFellowshipProgram from "./pages/programs/AiFellowshipProgram";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import ImportCenter from "./pages/ImportCenter";
import ImportHistory from "./pages/ImportHistory";
import MyDay from "./pages/MyDay";
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
            <Route path="/leads" element={<Navigate to="/pipeline" replace />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/tasks" element={<Navigate to="/pipeline" replace />} />
            <Route path="/ai" element={<AIIntelligence />} />
            <Route path="/profile" element={<LeadProfile />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/programs/ai-pm" element={<AiPmProgram />} />
            <Route path="/programs/ai-gtm" element={<AiGtmProgram />} />
            <Route path="/programs/ai-fellowship" element={<AiFellowshipProgram />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/integrations" element={<Navigate to="/dashboard" replace />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/import" element={<ImportCenter />} />
            <Route path="/import-history" element={<ImportHistory />} />
            <Route path="/nurture" element={<Navigate to="/pipeline" replace />} />
            <Route path="/my-day" element={<MyDay />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

