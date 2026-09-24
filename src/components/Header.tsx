// src/components/Header.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [isDark, setIsDark] = useState<boolean>(() => {
    return document.documentElement.classList.contains("dark");
  });
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
        }
      } catch (e) {
        const demoUser = localStorage.getItem("aivalytics_demo_user");
        if (demoUser) setUser(JSON.parse(demoUser));
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore errors
    }
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


  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xs">
      <div className="flex items-center gap-2">
        <span className="font-extrabold text-gray-900 dark:text-gray-100 text-lg">Aivalytics LeadOS</span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
          v1.0 Production MVP
        </span>
        <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800" title="If using Brave Browser, click the Lion icon 🦁 in address bar and turn Shields DOWN to allow Cloud DB sync.">
          <span>🦁 Brave User? Turn Shields DOWN for Cloud Sync</span>
        </span>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={toggleDark}
          title="Toggle Theme Mode"
          className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-xs font-bold text-gray-800 dark:text-gray-100 transition-all border border-gray-300 dark:border-gray-600 cursor-pointer"
        >
          <span>{isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}</span>
        </button>

        {user && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              {user.email || 'Alex Rivera'}
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 text-xs font-bold text-gray-700 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 transition-all"
            >
              Sign Out
            </button>
          </div>
        )}

      </div>
    </header>
  );
}
