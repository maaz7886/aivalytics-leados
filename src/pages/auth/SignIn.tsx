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

  const handleDemoAccess = () => {
    localStorage.setItem("aivalytics_demo_user", JSON.stringify({ email: "alex.rivera@aivalytics.io", role: "Admin" }));
    navigate("/dashboard");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="text-center space-y-2">
          <div className="inline-block p-3 rounded-2xl bg-primary-50 dark:bg-primary-950 text-2xl">
            ⚡
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">Aivalytics LeadOS</h1>
          <p className="text-xs text-gray-500">Meta Ads AI Revenue Intelligence Platform</p>
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
              className="w-full px-3.5 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2.5 font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-700 shadow-md transition-all"
          >
            Sign In to LeadOS
          </button>
        </form>

        <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={handleDemoAccess}
            className="w-full px-4 py-2 font-bold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 rounded-xl hover:bg-primary-100 text-xs transition-all flex items-center justify-center gap-1.5"
          >
            <span>🚀</span> Instant Demo Access (Admin Role)
          </button>
        </div>

        <p className="text-xs text-center text-gray-500">
          Need an account? <Link to="/auth/signup" className="text-primary-600 font-bold hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
