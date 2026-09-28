import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { useApp, adminUser } from "../context/AppContext";

export default function Header() {
  const {
    todayCallsCount,
    dailyCallGoal,
    currentUser,
    setCurrentUser,
    salespeople,
    setSalespersonFilter,
    adminWitnessRep,
    setAdminWitnessRep
  } = useApp();
  const [user, setUser] = useState<any>(null);
  const [dbConnected, setDbConnected] = useState<boolean>(true);
  const [isDark, setIsDark] = useState<boolean>(() => {
    return document.documentElement.classList.contains("dark");
  });
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check Supabase connection health on boot
    const checkDbHealth = async () => {
      try {
        const { error } = await supabase.from('leads').select('id', { count: 'exact', head: true });
        setDbConnected(!error);
      } catch {
        setDbConnected(false);
      }
    };
    checkDbHealth();

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
          className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border transition-all ${
            dbConnected 
              ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' 
              : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300'
          }`}
          title={dbConnected ? 'Live Supabase Cloud Database Connected • Real-time Sync Active' : 'Connecting to Supabase...'}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${dbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
          {dbConnected ? 'Database Connected' : 'Syncing...'}
        </span>
        <span 
          className="hidden 2xl:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80" 
          title="Turn Brave shields down if cloud sync is blocked"
        >
          <span>🛡️ Brave User? Turn Shields DOWN</span>
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
        {/* Role & Salesperson Switcher */}
        {currentUser?.role === 'Salesperson' ? (
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50/90 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 rounded-full text-xs shadow-2xs">
            <span className="text-emerald-800 dark:text-emerald-300 font-extrabold flex items-center gap-1.5">
              <span>👤</span>
              <span>{currentUser.name}</span>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">({currentUser.title?.split(' ')[0] || 'Sales Rep'})</span>
            </span>
            <button
              onClick={() => {
                setCurrentUser(adminUser);
                setAdminWitnessRep(null);
                setSalespersonFilter('All');
                localStorage.setItem("aivalytics_demo_user", JSON.stringify({ email: adminUser.email, role: "Admin" }));
                localStorage.setItem("aivalytics_active_user", JSON.stringify(adminUser));
              }}
              className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 dark:hover:text-emerald-100 underline ml-1 cursor-pointer"
              title="Switch to Admin Manager"
            >
              Switch to Admin
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs shadow-2xs">
            <span className="text-[11px] font-bold text-gray-400 hidden xl:inline">Portal View:</span>
            <select
              value={adminWitnessRep ? `witness-${adminWitnessRep}` : 'admin-master'}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'admin-master') {
                  setAdminWitnessRep(null);
                  setSalespersonFilter('All');
                } else if (val.startsWith('witness-')) {
                  const repName = val.replace('witness-', '');
                  setAdminWitnessRep(repName);
                } else if (val.startsWith('login-')) {
                  const repId = val.replace('login-', '');
                  const rep = salespeople.find((s) => s.id === repId);
                  if (rep) {
                    setAdminWitnessRep(null);
                    setCurrentUser(rep);
                    localStorage.setItem("aivalytics_demo_user", JSON.stringify({ email: rep.email, role: "Salesperson" }));
                    localStorage.setItem("aivalytics_active_user", JSON.stringify(rep));
                  }
                }
              }}
              className="bg-transparent font-black text-gray-800 dark:text-gray-200 text-xs focus:outline-hidden cursor-pointer"
            >
              <option value="admin-master">👑 Master Admin (All 362 Leads)</option>
              <optgroup label="👁️ Witness Salesperson Portal:">
                {salespeople.map((s) => (
                  <option key={`witness-${s.id}`} value={`witness-${s.name}`}>
                    👁️ Witness {s.name}'s Portal
                  </option>
                ))}
              </optgroup>
              <optgroup label="Direct Account Sign-In:">
                {salespeople.map((s) => (
                  <option key={`login-${s.id}`} value={`login-${s.id}`}>
                    👤 Sign in as {s.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        )}

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
          <div className={`w-8 h-8 rounded-full ${currentUser?.avatarColor || 'bg-[#133926]'} text-white font-black text-xs flex items-center justify-center shadow-xs`}>
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'A')}
          </div>
          <div className="hidden lg:block text-left">
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block leading-tight max-w-[140px] truncate">
              {currentUser?.name || user?.email || 'Alex Rivera'}
            </span>
            <span className="text-[10px] text-gray-400 font-semibold block leading-none">
              {currentUser?.role || 'Admin'}
            </span>
          </div>
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
