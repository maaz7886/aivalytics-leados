// src/layout/AppLayout.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ErrorBoundary from "../components/ErrorBoundary";
import { useApp } from "../context/AppContext";

export default function AppLayout() {
  const { adminWitnessRep, setAdminWitnessRep, currentUser, leads } = useApp();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-auto">
        <Header />
        {currentUser?.role === 'Admin' && adminWitnessRep && (
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-gray-950 text-white px-6 py-2.5 flex items-center justify-between text-xs font-semibold shadow-md border-b border-emerald-500/40 shrink-0">
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-100">
                <strong className="text-white font-extrabold uppercase tracking-wider text-[11px] bg-emerald-700/80 px-2 py-0.5 rounded mr-2 border border-emerald-400/50">
                  👁️ Admin Witness Mode
                </strong>
                Viewing portal as salesperson <span className="font-bold text-emerald-300 underline underline-offset-2">{adminWitnessRep}</span> ({leads.length} assigned leads).
              </span>
            </div>
            <button
              onClick={() => setAdminWitnessRep(null)}
              className="px-3 py-1 bg-white text-emerald-950 hover:bg-emerald-50 font-black rounded-lg transition-all text-xs cursor-pointer shadow-xs shrink-0 flex items-center gap-1.5"
            >
              <span>✕</span> Exit to Master Overview
            </button>
          </div>
        )}
        <main className="flex-1 p-6 overflow-y-auto">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
