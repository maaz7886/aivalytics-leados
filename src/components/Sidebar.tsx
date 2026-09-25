// src/components/Sidebar.tsx
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

interface NavItem {
  name: string;
  to: string;
  icon?: string;
  isSubItem?: boolean;
  hasChevron?: boolean;
}

const navigation: NavItem[] = [
  { name: "Dashboard", to: "/dashboard", icon: "🏠", hasChevron: true },
  { name: "Pipeline", to: "/pipeline", icon: "⚡" },
  { name: "AI Intelligence", to: "/ai", icon: "✨" },
  { name: "Conversations", to: "/conversations", icon: "💬" },
  { name: "All Programs", to: "/programs", icon: "🏛️", hasChevron: true },
  { name: "AI Project Mgmt", to: "/programs/ai-pm", isSubItem: true },
  { name: "AI-Native GTM", to: "/programs/ai-gtm", isSubItem: true },
  { name: "AI Fellowship", to: "/programs/ai-fellowship", isSubItem: true },
  { name: "Analytics", to: "/analytics", icon: "📊" },
  { name: "Import Center", to: "/import", icon: "📥" },
  { name: "Import History", to: "/import-history", icon: "🕒" },
  { name: "Settings", to: "/settings", icon: "⚙️" },
];

export default function Sidebar() {
  const location = useLocation();
  const [programsExpanded, setProgramsExpanded] = useState(true);

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200/80 dark:border-gray-800 flex flex-col h-full shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-800">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#133926] text-white flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L3 22h4.5l2-5h5l2 5H21L12 2zm-1.2 12L12 8.5 13.2 14h-2.4z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight leading-none">
              Aivalytics
            </h1>
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 tracking-wide mt-0.5 block">
              LeadOS Revenue AI
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1">
        {navigation.map((item) => {
          if (item.isSubItem && !programsExpanded) return null;

          const isActive = location.pathname === item.to || (item.to === "/dashboard" && location.pathname === "/");

          if (item.isSubItem) {
            return (
              <Link
                key={item.name}
                to={item.to}
                className={`flex items-center gap-2 pl-9 pr-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? "text-[#133926] dark:text-emerald-300 font-bold bg-emerald-50/70 dark:bg-emerald-950/40"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <span className="text-[10px] text-gray-400">•</span>
                <span>{item.name}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              to={item.to}
              onClick={() => {
                if (item.name === "All Programs") {
                  setProgramsExpanded(!programsExpanded);
                }
              }}
              className={`flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all ${
                isActive
                  ? "bg-[#133926] text-white shadow-sm shadow-emerald-950/20"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm shrink-0">{item.icon}</span>
                <span>{item.name}</span>
              </div>
              {item.hasChevron && (
                <span className={`text-[10px] transition-transform ${isActive ? "text-white/80" : "text-gray-400"} ${item.name === "All Programs" && !programsExpanded ? "-rotate-90" : ""}`}>
                  ▼
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Live Preparation Status Card */}
      <div className="p-3.5 border-t border-gray-100 dark:border-gray-800">
        <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/60 dark:border-emerald-800/50 space-y-1.5 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-extrabold text-xs text-emerald-950 dark:text-emerald-200">
                AI Preparation Active
              </span>
            </div>
            <Link to="/settings" className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 text-xs" title="Settings">
              ⚙️
            </Link>
          </div>
          <p className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300 leading-tight">
            Meta Ads Webhook Connected
          </p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">
            Last sync: 2 min ago
          </p>
        </div>
      </div>
    </aside>
  );
}
