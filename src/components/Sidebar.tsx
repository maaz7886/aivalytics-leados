// src/components/Sidebar.tsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getSavedViewCounts } from '../utils/savedViews';
import { Avatar } from './ui/Avatar';
import {
  CalendarCheck,
  Compass,
  LayoutGrid,
  Inbox,
  Clock,
  AlertCircle,
  Flame,
  CreditCard,
  CheckCircle2,
  XCircle,
  Users,
  Activity,
  DollarSign,
  BarChart2,
  TrendingUp,
  UserX,
  BookOpen,
  GraduationCap,
  Zap,
  UserCheck,
  Upload,
  LogOut,
  Search,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenSearch?: () => void;
}

export default function Sidebar({
  collapsed = false,
  onToggleCollapse,
  onOpenSearch
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, allLeads, leads } = useApp();

  const isSalesperson = currentUser?.role === 'Salesperson';
  const leadsPool = allLeads || leads || [];
  const viewCounts = getSavedViewCounts(leadsPool, currentUser?.id, currentUser?.name);

  const searchParams = new URLSearchParams(location.search);
  const currentView = searchParams.get('view');

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    localStorage.removeItem('aivalytics_demo_user');
    localStorage.removeItem('aivalytics_active_user');
    navigate('/auth/signin');
  };

  const isActive = (path: string, view?: string) => {
    if (view) {
      return location.pathname === '/leads' && currentView === view;
    }
    if (path === '/leads' && location.pathname === '/leads' && !currentView) {
      return true;
    }
    if (path === '/today') {
      return location.pathname === '/today' || (isSalesperson && location.pathname === '/');
    }
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || (!isSalesperson && location.pathname === '/');
    }
    return location.pathname === path;
  };

  return (
    <aside
      className={`hidden md:flex flex-col bg-[#F7F7F5] border-r border-[#E6E6E3] transition-all duration-200 select-none shrink-0 ${
        collapsed ? 'w-16' : 'w-60'
      } h-screen sticky top-0`}
    >
      {/* 1. Header Wordmark */}
      <div className="h-14 px-3.5 flex items-center justify-between border-b border-[#E6E6E3]">
        {!collapsed && (
          <Link to={isSalesperson ? '/today' : '/dashboard'} className="flex flex-col min-w-0">
            <span className="text-[13px] font-semibold text-[#1F1F1D] tracking-tight truncate leading-none">
              AIValytics LeadOS
            </span>
            <span className="text-[9px] font-semibold tracking-wider text-[#6B6B66] uppercase mt-1 leading-none">
              BUILD · LEARN · DEPLOY
            </span>
          </Link>
        )}
        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`text-[#6B6B66] hover:text-[#1F1F1D] p-1.5 rounded-[6px] hover:bg-[#EEF0FD]/60 cursor-pointer ${
            collapsed ? 'mx-auto' : ''
          }`}
        >
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* 2. Global Search Pill */}
      <div className="p-2 border-b border-[#E6E6E3]">
        <button
          onClick={onOpenSearch}
          className={`w-full flex items-center gap-2 px-2.5 py-1.5 bg-white border border-[#E6E6E3] rounded-[6px] text-[#6B6B66] hover:text-[#1F1F1D] hover:border-[#D4D4D0] transition-colors cursor-pointer text-xs ${
            collapsed ? 'justify-center px-0' : 'justify-between'
          }`}
          title="Search leads (Ctrl K)"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 shrink-0" />
            {!collapsed && <span className="text-[12px] truncate">Search leads...</span>}
          </div>
          {!collapsed && (
            <kbd className="text-[10px] text-[#6B6B66] bg-[#F7F7F5] border border-[#E6E6E3] px-1 rounded">
              Ctrl K
            </kbd>
          )}
        </button>
      </div>

      {/* 3. Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {/* SECTION 1: TODAY */}
        <div>
          {!collapsed && (
            <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-[#6B6B66] mb-1">
              Today
            </div>
          )}
          {isSalesperson ? (
            <Link
              to="/today"
              title="My Day"
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors ${
                isActive('/today')
                  ? 'bg-[#EEF0FD] text-[#3B4BDB] font-semibold'
                  : 'text-[#1F1F1D] hover:bg-[#F3F4F6]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <CalendarCheck className={`w-4 h-4 shrink-0 ${isActive('/today') ? 'text-[#3B4BDB]' : 'text-[#6B6B66]'}`} />
                {!collapsed && <span className="truncate">My Day</span>}
              </div>
            </Link>
          ) : (
            <Link
              to="/dashboard"
              title="Control Room"
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors ${
                isActive('/dashboard')
                  ? 'bg-[#EEF0FD] text-[#3B4BDB] font-semibold'
                  : 'text-[#1F1F1D] hover:bg-[#F3F4F6]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Compass className={`w-4 h-4 shrink-0 ${isActive('/dashboard') ? 'text-[#3B4BDB]' : 'text-[#6B6B66]'}`} />
                {!collapsed && <span className="truncate">Control Room</span>}
              </div>
            </Link>
          )}
        </div>

        {/* SECTION 2: LEADS & SAVED VIEWS */}
        <div className="space-y-0.5">
          {!collapsed && (
            <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-[#6B6B66] mb-1">
              Leads
            </div>
          )}

          {/* All Leads primary link */}
          <Link
            to="/leads"
            title="All Leads"
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors ${
              isActive('/leads')
                ? 'bg-[#EEF0FD] text-[#3B4BDB] font-semibold'
                : 'text-[#1F1F1D] hover:bg-[#F3F4F6]'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <LayoutGrid className={`w-4 h-4 shrink-0 ${isActive('/leads') ? 'text-[#3B4BDB]' : 'text-[#6B6B66]'}`} />
              {!collapsed && <span className="truncate">All leads</span>}
            </div>
            {!collapsed && (
              <span className="text-[11px] tabular-nums text-[#6B6B66] font-medium">
                {viewCounts.all}
              </span>
            )}
          </Link>

          {/* Saved Views (Airtable-style nested items) */}
          {!collapsed && (
            <div className="pl-4 pt-1 space-y-0.5 border-l border-[#E6E6E3] ml-3 mt-1">
              {[
                { id: 'unassigned', label: 'Unassigned', icon: Inbox, count: viewCounts.unassigned },
                { id: 'today', label: 'My follow-ups today', icon: Clock, count: viewCounts.todayFollowups },
                { id: 'overdue', label: 'Overdue', icon: AlertCircle, count: viewCounts.overdue, isAlert: viewCounts.overdue > 0 },
                { id: 'hot', label: 'Hot leads', icon: Flame, count: viewCounts.hot },
                { id: 'payment_pending', label: 'Payment pending', icon: CreditCard, count: viewCounts.paymentPending },
                { id: 'enrolled', label: 'Enrolled', icon: CheckCircle2, count: viewCounts.enrolled },
                { id: 'lost', label: 'Lost', icon: XCircle, count: viewCounts.lost }
              ].map((view) => {
                const isViewActive = isActive('/leads', view.id);
                const Icon = view.icon;
                return (
                  <Link
                    key={view.id}
                    to={`/leads?view=${view.id}`}
                    className={`flex items-center justify-between px-2 py-1 rounded-[4px] text-[12px] transition-colors ${
                      isViewActive
                        ? 'bg-[#EEF0FD] text-[#3B4BDB] font-semibold'
                        : 'text-[#6B6B66] hover:text-[#1F1F1D] hover:bg-[#F3F4F6]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${view.isAlert ? 'text-[#B42318]' : ''}`} />
                      <span className="truncate">{view.label}</span>
                    </div>
                    <span
                      className={`text-[10px] tabular-nums font-medium ${
                        view.isAlert ? 'text-[#B42318] font-bold' : 'text-[#6B6B66]'
                      }`}
                    >
                      {view.count}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 3: TEAM (Admin Only) */}
        {!isSalesperson && (
          <div className="space-y-0.5">
            {!collapsed && (
              <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-[#6B6B66] mb-1">
                Team
              </div>
            )}
            <Link
              to="/team"
              title="Team"
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors ${
                isActive('/team')
                  ? 'bg-[#EEF0FD] text-[#3B4BDB] font-semibold'
                  : 'text-[#1F1F1D] hover:bg-[#F3F4F6]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Users className={`w-4 h-4 shrink-0 ${isActive('/team') ? 'text-[#3B4BDB]' : 'text-[#6B6B66]'}`} />
                {!collapsed && <span className="truncate">Team</span>}
              </div>
            </Link>

            <Link
              to="/rep-activity"
              title="Rep Activity"
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors ${
                isActive('/rep-activity')
                  ? 'bg-[#EEF0FD] text-[#3B4BDB] font-semibold'
                  : 'text-[#1F1F1D] hover:bg-[#F3F4F6]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Activity className={`w-4 h-4 shrink-0 ${isActive('/rep-activity') ? 'text-[#3B4BDB]' : 'text-[#6B6B66]'}`} />
                {!collapsed && <span className="truncate">Rep activity</span>}
              </div>
            </Link>

            <Link
              to="/payouts"
              title="Payouts"
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors ${
                isActive('/payouts')
                  ? 'bg-[#EEF0FD] text-[#3B4BDB] font-semibold'
                  : 'text-[#1F1F1D] hover:bg-[#F3F4F6]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <DollarSign className={`w-4 h-4 shrink-0 ${isActive('/payouts') ? 'text-[#3B4BDB]' : 'text-[#6B6B66]'}`} />
                {!collapsed && <span className="truncate">Payouts</span>}
              </div>
            </Link>
          </div>
        )}

        {/* SECTION 4: REPORTS (Admin Only) */}
        {!isSalesperson && (
          <div className="space-y-0.5">
            {!collapsed && (
              <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-[#6B6B66] mb-1">
                Reports
              </div>
            )}
            <Link
              to="/reports"
              title="Sources & Ads"
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors ${
                isActive('/reports') && !location.pathname.includes('revenue') && !location.pathname.includes('lost')
                  ? 'bg-[#EEF0FD] text-[#3B4BDB] font-semibold'
                  : 'text-[#1F1F1D] hover:bg-[#F3F4F6]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <BarChart2 className={`w-4 h-4 shrink-0 ${isActive('/reports') ? 'text-[#3B4BDB]' : 'text-[#6B6B66]'}`} />
                {!collapsed && <span className="truncate">Sources & ads</span>}
              </div>
            </Link>

            <Link
              to="/reports/revenue"
              title="Revenue"
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors ${
                location.pathname === '/reports/revenue'
                  ? 'bg-[#EEF0FD] text-[#3B4BDB] font-semibold'
                  : 'text-[#1F1F1D] hover:bg-[#F3F4F6]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <TrendingUp className={`w-4 h-4 shrink-0 ${location.pathname === '/reports/revenue' ? 'text-[#3B4BDB]' : 'text-[#6B6B66]'}`} />
                {!collapsed && <span className="truncate">Revenue</span>}
              </div>
            </Link>

            <Link
              to="/reports/lost-reasons"
              title="Lost Reasons"
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors ${
                location.pathname === '/reports/lost-reasons'
                  ? 'bg-[#EEF0FD] text-[#3B4BDB] font-semibold'
                  : 'text-[#1F1F1D] hover:bg-[#F3F4F6]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <UserX className={`w-4 h-4 shrink-0 ${location.pathname === '/reports/lost-reasons' ? 'text-[#3B4BDB]' : 'text-[#6B6B66]'}`} />
                {!collapsed && <span className="truncate">Lost reasons</span>}
              </div>
            </Link>
          </div>
        )}

        {/* SECTION 5: SETTINGS & PROGRAMS */}
        <div className="space-y-0.5">
          {!collapsed && (
            <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-[#6B6B66] mb-1">
              {isSalesperson ? 'Enablement' : 'Settings'}
            </div>
          )}
          <Link
            to="/programs"
            title="Programs & Scripts"
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors ${
              isActive('/programs')
                ? 'bg-[#EEF0FD] text-[#3B4BDB] font-semibold'
                : 'text-[#1F1F1D] hover:bg-[#F3F4F6]'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <BookOpen className={`w-4 h-4 shrink-0 ${isActive('/programs') ? 'text-[#3B4BDB]' : 'text-[#6B6B66]'}`} />
              {!collapsed && <span className="truncate">Programs & scripts</span>}
            </div>
          </Link>

          {!isSalesperson && (
            <>
              <Link
                to="/settings/mentors"
                title="Mentors"
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors ${
                  isActive('/settings/mentors')
                    ? 'bg-[#EEF0FD] text-[#3B4BDB] font-semibold'
                    : 'text-[#1F1F1D] hover:bg-[#F3F4F6]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <GraduationCap className={`w-4 h-4 shrink-0 ${isActive('/settings/mentors') ? 'text-[#3B4BDB]' : 'text-[#6B6B66]'}`} />
                  {!collapsed && <span className="truncate">Mentors</span>}
                </div>
              </Link>

              <Link
                to="/integrations"
                title="Integrations"
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors ${
                  isActive('/integrations')
                    ? 'bg-[#EEF0FD] text-[#3B4BDB] font-semibold'
                    : 'text-[#1F1F1D] hover:bg-[#F3F4F6]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Zap className={`w-4 h-4 shrink-0 ${isActive('/integrations') ? 'text-[#3B4BDB]' : 'text-[#6B6B66]'}`} />
                  {!collapsed && <span className="truncate">Integrations</span>}
                </div>
              </Link>

              <Link
                to="/settings/users"
                title="Users"
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors ${
                  isActive('/settings/users')
                    ? 'bg-[#EEF0FD] text-[#3B4BDB] font-semibold'
                    : 'text-[#1F1F1D] hover:bg-[#F3F4F6]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <UserCheck className={`w-4 h-4 shrink-0 ${isActive('/settings/users') ? 'text-[#3B4BDB]' : 'text-[#6B6B66]'}`} />
                  {!collapsed && <span className="truncate">Users</span>}
                </div>
              </Link>

              <Link
                to="/import"
                title="Import"
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors ${
                  isActive('/import')
                    ? 'bg-[#EEF0FD] text-[#3B4BDB] font-semibold'
                    : 'text-[#1F1F1D] hover:bg-[#F3F4F6]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Upload className={`w-4 h-4 shrink-0 ${isActive('/import') ? 'text-[#3B4BDB]' : 'text-[#6B6B66]'}`} />
                  {!collapsed && <span className="truncate">Import</span>}
                </div>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* 4. Bottom User Profile & Logout */}
      <div className="p-2 border-t border-[#E6E6E3] bg-[#F7F7F5] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar name={currentUser?.name || 'Admin'} size={24} />
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-[12px] font-medium text-[#1F1F1D] truncate leading-none">
                {currentUser?.name || 'Administrator'}
              </div>
              <div className="text-[10px] text-[#6B6B66] truncate mt-0.5 leading-none">
                {currentUser?.role || 'Admin'}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          aria-label="Sign out"
          title="Sign out"
          className="text-[#6B6B66] hover:text-[#B42318] p-1.5 rounded-[4px] hover:bg-white cursor-pointer transition-colors shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
