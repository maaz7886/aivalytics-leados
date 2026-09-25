import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function Header() {
  const { todayCallsCount, dailyCallGoal } = useApp();
  const [user, setUser] = useState<any>(null);
  const [isDark, setIsDark] = useState<boolean>(() => {
    return document.documentElement.classList.contains("dark");
  });
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
        } else {
          const demoUser = localStorage.getItem("aivalytics_demo_user");
          if (demoUser) setUser(JSON.parse(demoUser));
          else setUser({ email: "alex.rivera@aivalytics.io" });
        }
      } catch {
        const demoUser = localStorage.getItem("aivalytics_demo_user");
        if (demoUser) setUser(JSON.parse(demoUser));
        else setUser({ email: "alex.rivera@aivalytics.io" });
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    localStorage.removeItem("aivalytics_demo_user");
    setUser(null);
    navigate("/auth/signin");
  };

  const toggleDark = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/pipeline`);
    }
  };

  return (
    <header className="flex items-center justify-between px-6 py-2.5 border-b border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xs gap-4 shrink-0">
      {/* Left: Brand & Badges */}
      <div className="flex items-center gap-2.5 shrink-0">
        <span className="font-black text-gray-900 dark:text-gray-100 text-lg tracking-tight">
          Aivalytics LeadOS
        </span>
        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          v1.0 Production MVP
        </span>
        <span 
          className="hidden xl:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80" 
          title="Turn Brave shields down if cloud sync is blocked"
        >
          <span>🛡️ Brave User? Turn Shields DOWN for Cloud Sync</span>
        </span>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md mx-auto hidden md:block">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <span className="absolute left-3.5 text-gray-400 text-xs">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads, name, email, or notes..."
            className="w-full pl-9 pr-8 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-600 focus:bg-white dark:focus:bg-gray-900 transition-all"
          />
          <kbd className="absolute right-3 px-1.5 py-0.2 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-[10px] font-bold rounded border border-gray-300 dark:border-gray-600">
            /
          </kbd>
        </form>
      </div>

      {/* Right: Actions, Theme, Notifications & User Avatar */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Today's Calls Live Counter Pill */}
        <button
          onClick={() => {
            navigate("/dashboard");
            setTimeout(() => {
              const el = document.getElementById("daily-calling-tracker");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }}
          title={`${todayCallsCount} calls logged today (Daily Target: ${dailyCallGoal}). Click to view Calling Tracker.`}
          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 rounded-full text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-all shadow-2xs cursor-pointer group"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="group-hover:scale-110 transition-transform">📞</span>
          <span>
            <strong className="font-black text-gray-900 dark:text-gray-100">{todayCallsCount}</strong>
            <span className="text-gray-500 dark:text-gray-400 font-semibold">/{dailyCallGoal}</span> Calls Today
          </span>
        </button>

        {/* Theme Toggle Icon Button */}
        <button
          onClick={toggleDark}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-all cursor-pointer text-sm"
        >
          {isDark ? "🌙" : "☀️"}
        </button>

        {/* Notifications Bell */}
        <button
          title="Notifications"
          className="relative w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-all cursor-pointer text-sm"
        >
          <span>🔔</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-gray-900"></span>
        </button>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 pl-1 border-l border-gray-200 dark:border-gray-700">
          <div className="w-8 h-8 rounded-full bg-[#133926] text-white font-black text-xs flex items-center justify-center shadow-xs">
            {user?.email ? user.email.charAt(0).toUpperCase() : 'A'}
          </div>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 hidden lg:inline max-w-[140px] truncate">
            {user?.email || 'alex.rivera@aivalytics.io'}
          </span>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="text-[11px] font-bold text-gray-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer ml-1"
          >
            ↪
          </button>
        </div>
      </div>
    </header>
  );
}
