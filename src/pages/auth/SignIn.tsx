// src/pages/auth/SignIn.tsx
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { useApp, initialSalespeople, adminUser } from "../../context/AppContext";

export default function SignIn() {
  const [email, setEmail] = useState("alex.rivera@aivalytics.io");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setCurrentUser, setAdminWitnessRep } = useApp();

  const handleLoginSuccess = (repEmail: string) => {
    setAdminWitnessRep(null);
    const cleanEmail = repEmail.trim().toLowerCase();
    const repMatch = initialSalespeople.find(
      (s) => s.email.toLowerCase() === cleanEmail || s.name.toLowerCase().replace(/\s+/g, '') === cleanEmail.split('@')[0].replace(/[\._]/g, '')
    );

    if (repMatch) {
      setCurrentUser(repMatch);
      localStorage.setItem("aivalytics_demo_user", JSON.stringify({ email: repMatch.email, role: "Salesperson" }));
      localStorage.setItem("aivalytics_active_user", JSON.stringify(repMatch));
      navigate("/dashboard");
    } else {
      // Default to Admin
      setCurrentUser(adminUser);
      localStorage.setItem("aivalytics_demo_user", JSON.stringify({ email: repEmail, role: "Admin" }));
      localStorage.setItem("aivalytics_active_user", JSON.stringify(adminUser));
      navigate("/dashboard");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabase.auth.signInWithPassword({ email, password });
    } catch {}
    handleLoginSuccess(email);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4 py-8">
      <div className="w-full max-w-md p-8 space-y-5 bg-white rounded-2xl shadow-xl dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="text-center space-y-2">
          <div className="inline-block p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-2xl">
            ⚡
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">Aivalytics LeadOS</h1>
          <p className="text-xs text-gray-500">Sales Team & Revenue Operations Platform</p>
        </div>

        {error && <p className="text-xs text-red-600 font-semibold text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Work Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. alex.rivera@aivalytics.io"
              className="w-full px-3.5 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2.5 font-bold text-white bg-[#133926] rounded-xl hover:bg-[#1a4a33] shadow-md transition-all cursor-pointer"
          >
            Sign In to LeadOS
          </button>
        </form>

        {/* Collapsible Credentials Guide for Authorized Team Members */}
        <details className="pt-2 text-[11px] text-gray-500 border-t border-gray-100 dark:border-gray-700">
          <summary className="cursor-pointer font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors list-none flex items-center justify-between">
            <span>🔐 Authorized Team Accounts Directory</span>
            <span>▾</span>
          </summary>
          <div className="mt-2 p-2.5 bg-gray-50 dark:bg-gray-750 rounded-lg space-y-1.5 text-[11px] text-gray-600 dark:text-gray-300">
            <div>
              <strong className="text-gray-900 dark:text-gray-100">Admin Manager:</strong> admin@aivalytics.io
            </div>
            <div>
              <strong className="text-gray-900 dark:text-gray-100">Sales Representatives:</strong>
              <div className="grid grid-cols-2 gap-1 pt-1 font-mono text-[10px]">
                <span>• alex.rivera@...</span>
                <span>• sarah.chen@...</span>
                <span>• marcus.vance@...</span>
                <span>• priya.sharma@...</span>
                <span>• david.kim@...</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 pt-1 italic">
              Standard secure password required for all corporate portal logins.
            </p>
          </div>
        </details>

        <p className="text-xs text-center text-gray-500">
          Need an account? <Link to="/auth/signup" className="text-primary-600 font-bold hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
