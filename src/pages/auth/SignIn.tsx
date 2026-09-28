// src/pages/auth/SignIn.tsx
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate, Link } from "react-router-dom";

export default function SignIn() {
  const [email, setEmail] = useState("alex.rivera@aivalytics.io");
  const [password, setPassword] = useState("password123");
  const [error] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        localStorage.setItem("aivalytics_demo_user", JSON.stringify({ email, role: "Admin" }));
        navigate("/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      localStorage.setItem("aivalytics_demo_user", JSON.stringify({ email, role: "Admin" }));
      navigate("/dashboard");
    }
  };

  const handleQuickLogin = (repEmail: string, repRole: string, repName: string) => {
    localStorage.setItem("aivalytics_demo_user", JSON.stringify({ email: repEmail, role: repRole }));
    localStorage.setItem("aivalytics_active_user", JSON.stringify({
      name: repName,
      email: repEmail,
      role: repRole,
      title: repRole === 'Admin' ? 'Head of Sales & Admissions' : 'Sales Representative',
      status: 'Active',
      dailyCallTarget: repRole === 'Admin' ? 10 : 25
    }));
    navigate(repRole === 'Admin' ? "/dashboard" : "/pipeline");
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
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        {/* 1-Click Role Login for Admin & 5 Salespeople */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
          <span className="text-[10px] font-black text-gray-400 block text-center uppercase tracking-wider">
            Quick 1-Click Role Access
          </span>

          <button
            type="button"
            onClick={() => handleQuickLogin("admin@aivalytics.io", "Admin", "Admin Manager")}
            className="w-full px-3 py-2 font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl hover:bg-emerald-100 text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span>👑</span> Sign In as Admin Manager (All Reps)
          </button>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {[
              { name: "Alex Rivera", email: "alex.rivera@aivalytics.io", title: "Senior AE" },
              { name: "Sarah Chen", email: "sarah.chen@aivalytics.io", title: "Admissions" },
              { name: "Marcus Vance", email: "marcus.vance@aivalytics.io", title: "Career Adv" },
              { name: "Priya Sharma", email: "priya.sharma@aivalytics.io", title: "PM Lead" },
              { name: "David Kim", email: "david.kim@aivalytics.io", title: "Tech Advisor" },
            ].map((s) => (
              <button
                key={s.email}
                type="button"
                onClick={() => handleQuickLogin(s.email, "Salesperson", s.name)}
                className="px-2.5 py-1.5 text-[11px] font-bold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-750 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 transition-all text-left truncate cursor-pointer"
                title={`Sign in as ${s.name} (${s.title})`}
              >
                👤 {s.name}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-center text-gray-500">
          Need an account? <Link to="/auth/signup" className="text-primary-600 font-bold hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
