// src/components/Sidebar.tsx
import { Link, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  Calendar,
  Inbox,
  Layers,
  Kanban,
  UploadCloud,
  Users as UsersIcon,
  TrendingUp,
  DollarSign,
  BarChart3,
  BookOpen,
  GraduationCap,
  Zap,
  UserCheck,
  ChevronRight
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const { currentUser, allLeads, leads } = useApp();
  const isSalesperson = currentUser?.role === 'Salesperson';

  const leadsPool = allLeads || leads;
  const unassignedCount = leadsPool.filter(
    (l) => !l.assignedSalesperson || l.assignedSalesperson === 'Unassigned'
  ).length;

  // 4 Grouped Sections for Admin
  const adminSections = [
    {
      title: "Today",
      items: [
        { name: "Today's Exceptions", to: "/today", icon: Calendar }
      ]
    },
    {
      title: "Leads",
      items: [
        { name: "Lead Inbox", to: "/inbox", icon: Inbox, badge: unassignedCount > 0 ? String(unassignedCount) : undefined },
        { name: "All Leads", to: "/leads", icon: Layers },
        { name: "Pipeline Kanban", to: "/pipeline", icon: Kanban },
        { name: "Import Center", to: "/import", icon: UploadCloud }
      ]
    },
    {
      title: "Team",
      items: [
        { name: "Sales Team", to: "/team", icon: UsersIcon },
        { name: "Rep Activity", to: "/rep-activity", icon: TrendingUp },
        { name: "Payouts & Commissions", to: "/payouts", icon: DollarSign },
        { name: "Reports & Analytics", to: "/analytics", icon: BarChart3 }
      ]
    },
    {
      title: "Settings",
      items: [
        { name: "Programs", to: "/programs", icon: BookOpen },
        { name: "Faculty Mentors", to: "/settings/mentors", icon: GraduationCap },
        { name: "Integrations & Sync", to: "/integrations", icon: Zap },
        { name: "Users & Permissions", to: "/settings/users", icon: UserCheck }
      ]
    }
  ];

  // Restricted 3 Sections for Sales Reps:
  // "Reps see only Today, My Leads and Programs (scripts/FAQs)."
  const repSections = [
    {
      title: "Today",
      items: [
        { name: "Calling Mode", to: "/today", icon: Calendar }
      ]
    },
    {
      title: "My Leads",
      items: [
        { name: "My Pipeline", to: "/pipeline", icon: Kanban }
      ]
    },
    {
      title: "Offerings & Enablement",
      items: [
        { name: "Programs & Scripts", to: "/programs", icon: BookOpen }
      ]
    }
  ];

  const sections = isSalesperson ? repSections : adminSections;

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200/80 dark:border-gray-800 flex flex-col h-full shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-800">
        <Link to="/today" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#133926] text-white flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition-transform shrink-0">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L3 22h4.5l2-5h5l2 5H21L12 2zm-1.2 12L12 8.5 13.2 14h-2.4z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-base font-black text-gray-900 dark:text-gray-100 tracking-tight leading-none">
              AIValytics LeadOS
            </h1>
            <span className="text-[9px] font-extrabold tracking-widest text-emerald-800 dark:text-emerald-400 uppercase mt-1 block">
              BUILD · LEARN · DEPLOY
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Grouped Sections */}
      <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            <h3 className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
              {section.title}
            </h3>

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.to ||
                  (item.to === "/today" && (location.pathname === "/" || location.pathname === "/dashboard"));

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                      isActive
                        ? "bg-[#133926] text-white shadow-xs font-bold"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-300' : 'text-gray-400'}`} />
                      <span className="truncate">{item.name}</span>
                    </div>

                    {(item as any).badge ? (
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-amber-400 text-gray-950 shadow-2xs">
                        {(item as any).badge}
                      </span>
                    ) : isActive ? (
                      <ChevronRight className="w-3.5 h-3.5 opacity-80" />
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Status Tag */}
      <div className="p-3.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-gray-400 font-medium">Logged in as:</span>
          <span className="font-bold text-gray-800 dark:text-gray-200 truncate max-w-[120px]">
            {currentUser?.name || 'Admin'}
          </span>
        </div>
        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
          {isSalesperson ? '● Calling Mode Active' : '👑 Master Admin Mode'}
        </div>
      </div>
    </aside>
  );
}
