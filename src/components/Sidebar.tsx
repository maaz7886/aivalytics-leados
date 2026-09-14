// src/components/Sidebar.tsx
import { Link, useLocation } from "react-router-dom";

const navigation = [
  { name: "Dashboard", to: "/dashboard" },
  { name: "Leads", to: "/leads" },
  { name: "⚡ Guided Sales Call", to: "/sales-wizard", badge: "24-Phase" },
  { name: "Pipeline", to: "/pipeline" },
  { name: "Tasks", to: "/tasks" },
  { name: "AI Intelligence", to: "/ai" },
  { name: "Conversations", to: "/conversations" },
  { name: "All Programs", to: "/programs" },
  { name: "• AI Project Mgmt", to: "/programs/ai-pm", isSubItem: true },
  { name: "• AI-Native GTM", to: "/programs/ai-gtm", isSubItem: true },
  { name: "• AI Fellowship", to: "/programs/ai-fellowship", isSubItem: true },
  { name: "Analytics", to: "/analytics" },
  { name: "Integrations", to: "/integrations" },
  { name: "Settings", to: "/settings" },
];



export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white font-black text-lg shadow-md">
            A
          </div>
          <div>
            <h1 className="text-base font-extrabold text-gray-900 dark:text-gray-100 leading-tight">
              Aivalytics
            </h1>
            <span className="text-[11px] font-bold text-primary-600 dark:text-primary-400 tracking-wider">
              LeadOS Revenue AI
            </span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.name}
              to={item.to}
              className={`flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                isActive
                  ? "bg-primary-600 text-white shadow-md"
                  : "text-gray-700 dark:text-gray-300 hover:bg-primary-50 hover:text-primary-700 dark:hover:bg-gray-800"
              }`}
            >
              <span>{item.name}</span>
              {item.badge && (
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  isActive ? "bg-white/20 text-white" : "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Footer */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs space-y-1">
          <span className="font-bold text-gray-800 dark:text-gray-200 block">AI Preparation Active</span>
          <span className="text-gray-500 block">Meta Ads Webhook Connected</span>
        </div>
      </div>
    </aside>
  );
}
