// src/components/Header.tsx
import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Search, Eye, X, Database } from 'lucide-react';
import { Avatar } from './ui/Avatar';
import { checkDatabaseConnection } from '../lib/supabase';

interface HeaderProps {
  onOpenSearch?: () => void;
}

export default function Header({ onOpenSearch }: HeaderProps) {
  const location = useLocation();
  const {
    currentUser,
    salespeople,
    adminWitnessRep,
    setAdminWitnessRep
  } = useApp();

  const [dbStatus, setDbStatus] = useState<{ connected: boolean; latencyMs?: number; checking: boolean }>({
    connected: false,
    checking: true
  });

  useEffect(() => {
    let isMounted = true;
    const testConnection = async () => {
      const res = await checkDatabaseConnection();
      if (isMounted) {
        setDbStatus({
          connected: res.connected,
          latencyMs: res.latencyMs,
          checking: false
        });
      }
    };
    testConnection();

    // Periodic health check every 45 seconds
    const interval = setInterval(testConnection, 45000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Simple breadcrumb generator
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/today') return currentUser?.role === 'Salesperson' ? 'My Day' : "Today's Exceptions";
    if (path === '/dashboard') return 'Control Room';
    if (path.startsWith('/leads')) {
      const searchParams = new URLSearchParams(location.search);
      const view = searchParams.get('view');
      if (view) {
        const viewNames: Record<string, string> = {
          unassigned: 'Unassigned Leads',
          today: 'Follow-ups Due Today',
          overdue: 'Overdue Follow-ups',
          hot: 'Hot Leads',
          payment_pending: 'Payment Pending',
          enrolled: 'Enrolled Students',
          lost: 'Lost / Closed Leads'
        };
        return `Leads / ${viewNames[view] || view}`;
      }
      return 'Leads / All Leads';
    }
    if (path === '/pipeline') return 'Leads / Pipeline';
    if (path === '/inbox') return 'Leads / Inbox';
    if (path === '/team') return 'Team / Sales Representatives';
    if (path === '/rep-activity') return 'Team / Rep Activity';
    if (path === '/payouts') return 'Team / Payouts';
    if (path === '/reports' || path === '/analytics') return 'Reports / Source & Performance';
    if (path === '/programs') return 'Offerings / Curriculum & Scripts';
    if (path === '/settings/mentors') return 'Settings / Mentors';
    if (path === '/settings/users') return 'Settings / Users';
    if (path === '/integrations') return 'Settings / Google Sheet Sync';
    if (path === '/import') return 'Settings / CSV Import';
    return 'LeadOS';
  };

  return (
    <header className="h-11 px-4 bg-white border-b border-[#E6E6E3] flex items-center justify-between gap-3 shrink-0 select-none z-10">
      {/* Left: Breadcrumb / Section Name */}
      <div className="flex items-center gap-2 min-w-0">
        <h1 className="text-[13px] font-semibold text-[#1F1F1D] truncate">
          {getBreadcrumb()}
        </h1>
      </div>

      {/* Center: Admin Witness Mode Banner (if active) */}
      {currentUser?.role === 'Admin' && adminWitnessRep && (
        <div className="flex items-center gap-2 px-2.5 py-1 bg-[#FFF0D6] border border-[#FEE4E2] rounded-[4px] text-xs text-[#8A4B00]">
          <Eye className="w-3.5 h-3.5 text-[#8A4B00]" />
          <span>Viewing as rep: <strong>{adminWitnessRep}</strong></span>
          <button
            onClick={() => setAdminWitnessRep(null)}
            className="text-[#8A4B00] hover:text-[#1F1F1D] ml-1 p-0.5"
            title="Exit witness mode"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Right: DB Status Pill, Search Pill & Rep Switcher */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Real-time DB Connection Badge */}
        <Link
          to="/integrations"
          title={
            dbStatus.checking
              ? "Checking database connection..."
              : dbStatus.connected
              ? `Cloud Database Connected (${dbStatus.latencyMs ?? 0}ms). Realtime sync active.`
              : "Cloud Database Disconnected. Click to configure Supabase."
          }
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[11px] font-medium border transition-colors ${
            dbStatus.checking
              ? 'bg-[#F7F7F5] border-[#E6E6E3] text-[#6B6B66]'
              : dbStatus.connected
              ? 'bg-[#DDF4E4] border-[#C3ECD0] text-[#17673A] hover:bg-[#c8e6d2]'
              : 'bg-[#FEE4E2] border-[#FDA29B] text-[#B42318] hover:bg-[#fed3cf]'
          }`}
        >
          <Database className="w-3 h-3 shrink-0" />
          <span className="hidden sm:inline">
            {dbStatus.checking
              ? 'Checking DB...'
              : dbStatus.connected
              ? `DB Live (${dbStatus.latencyMs ?? 0}ms)`
              : 'DB Offline'}
          </span>
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              dbStatus.checking
                ? 'bg-amber-400'
                : dbStatus.connected
                ? 'bg-emerald-600'
                : 'bg-red-500'
            }`}
          />
        </Link>

        <button
          onClick={onOpenSearch}
          className="hidden sm:flex items-center gap-2 px-2.5 py-1 h-7 bg-[#F7F7F5] hover:bg-[#F3F4F6] border border-[#E6E6E3] rounded-[6px] text-xs text-[#6B6B66] cursor-pointer"
        >
          <Search className="w-3 h-3" />
          <span>Quick find</span>
          <kbd className="text-[10px] text-[#6B6B66] bg-white border border-[#E6E6E3] px-1 rounded">
            Ctrl K
          </kbd>
        </button>

        {/* Admin preview persona switcher - Strictly Admin Only */}
        {currentUser?.role === 'Admin' && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-[#E6E6E3]">
            <span className="text-[11px] text-[#6B6B66] hidden md:inline">View as:</span>
            <select
              aria-label="View as salesperson (Admin only)"
              value={adminWitnessRep ? (salespeople.find(s => s.name === adminWitnessRep)?.id || 'admin-1') : 'admin-1'}
              onChange={(e) => {
                if (currentUser?.role !== 'Admin') {
                  console.error('Unauthorized persona switch blocked: user is not an Admin');
                  return;
                }
                const selected = e.target.value;
                if (selected === 'admin-1') {
                  setAdminWitnessRep(null);
                } else {
                  const rep = salespeople.find((s) => s.id === selected);
                  setAdminWitnessRep(rep ? rep.name : null);
                }
              }}
              className="text-xs bg-transparent border border-[#E6E6E3] rounded-[4px] px-2 py-0.5 text-[#1F1F1D] cursor-pointer outline-none hover:bg-[#F7F7F5]"
            >
              <option value="admin-1">Admin (Me)</option>
              {salespeople.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.role})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Current user avatar pill */}
        <div className="flex items-center gap-1.5 pl-1">
          <Avatar name={currentUser?.name || 'Admin'} size={24} />
        </div>
      </div>
    </header>
  );
}
