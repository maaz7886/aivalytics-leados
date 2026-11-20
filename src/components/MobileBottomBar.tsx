// src/components/MobileBottomBar.tsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  CalendarCheck,
  Compass,
  LayoutGrid,
  Search,
  Menu,
  X,
  Users,
  Activity,
  DollarSign,
  BarChart2,
  BookOpen,
  GraduationCap,
  Zap,
  UserCheck,
  Upload,
  LogOut
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Avatar } from './ui/Avatar';

interface MobileBottomBarProps {
  onOpenSearch: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({ onOpenSearch }) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useApp();

  const isSalesperson = currentUser?.role === 'Salesperson';

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    localStorage.removeItem('aivalytics_demo_user');
    localStorage.removeItem('aivalytics_active_user');
    setCurrentUser(null);
    navigate('/auth/signin');
  };

  const isTodayActive = location.pathname === '/today' || location.pathname === '/dashboard' || location.pathname === '/';
  const isLeadsActive = location.pathname.startsWith('/leads') || location.pathname === '/pipeline';

  return (
    <>
      {/* Slide-up "More" Drawer for Mobile */}
      {isMoreOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] flex flex-col justify-end md:hidden animate-in fade-in"
          onClick={() => setIsMoreOpen(false)}
        >
          <div
            className="bg-white border-t border-[#E6E6E3] rounded-t-[12px] p-4 max-h-[75vh] overflow-y-auto space-y-3 shadow-xl animate-in slide-in-from-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E6E6E3] pb-3">
              <div className="flex items-center gap-2">
                <Avatar name={currentUser?.name || 'Admin'} size={28} />
                <div>
                  <div className="text-[13px] font-semibold text-[#1F1F1D]">
                    {currentUser?.name || 'User'}
                  </div>
                  <div className="text-[11px] text-[#6B6B66]">
                    {currentUser?.role || 'Admin'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="text-[#6B6B66] p-1.5 rounded-[6px] hover:bg-[#F3F4F6]"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Links inside drawer */}
            <div className="space-y-1 text-sm font-medium">
              <Link
                to="/programs"
                onClick={() => setIsMoreOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-[6px] hover:bg-[#F3F4F6] text-[#1F1F1D]"
              >
                <BookOpen className="w-4 h-4 text-[#3B4BDB]" /> Programs & Scripts
              </Link>

              {!isSalesperson && (
                <>
                  <div className="pt-2 text-[11px] uppercase tracking-wider text-[#6B6B66] font-semibold px-3">
                    Team & Analytics
                  </div>
                  <Link
                    to="/team"
                    onClick={() => setIsMoreOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-[6px] hover:bg-[#F3F4F6] text-[#1F1F1D]"
                  >
                    <Users className="w-4 h-4 text-[#6B6B66]" /> Sales Team
                  </Link>
                  <Link
                    to="/rep-activity"
                    onClick={() => setIsMoreOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-[6px] hover:bg-[#F3F4F6] text-[#1F1F1D]"
                  >
                    <Activity className="w-4 h-4 text-[#6B6B66]" /> Rep Activity
                  </Link>
                  <Link
                    to="/payouts"
                    onClick={() => setIsMoreOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-[6px] hover:bg-[#F3F4F6] text-[#1F1F1D]"
                  >
                    <DollarSign className="w-4 h-4 text-[#6B6B66]" /> Payouts & Commission
                  </Link>
                  <Link
                    to="/reports"
                    onClick={() => setIsMoreOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-[6px] hover:bg-[#F3F4F6] text-[#1F1F1D]"
                  >
                    <BarChart2 className="w-4 h-4 text-[#6B6B66]" /> Reports & Analytics
                  </Link>

                  <div className="pt-2 text-[11px] uppercase tracking-wider text-[#6B6B66] font-semibold px-3">
                    Configuration
                  </div>
                  <Link
                    to="/settings/mentors"
                    onClick={() => setIsMoreOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-[6px] hover:bg-[#F3F4F6] text-[#1F1F1D]"
                  >
                    <GraduationCap className="w-4 h-4 text-[#6B6B66]" /> Faculty Mentors
                  </Link>
                  <Link
                    to="/integrations"
                    onClick={() => setIsMoreOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-[6px] hover:bg-[#F3F4F6] text-[#1F1F1D]"
                  >
                    <Zap className="w-4 h-4 text-[#6B6B66]" /> Integrations & Sync
                  </Link>
                  <Link
                    to="/settings/users"
                    onClick={() => setIsMoreOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-[6px] hover:bg-[#F3F4F6] text-[#1F1F1D]"
                  >
                    <UserCheck className="w-4 h-4 text-[#6B6B66]" /> Users & Access
                  </Link>
                  <Link
                    to="/import"
                    onClick={() => setIsMoreOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-[6px] hover:bg-[#F3F4F6] text-[#1F1F1D]"
                  >
                    <Upload className="w-4 h-4 text-[#6B6B66]" /> CSV Import Center
                  </Link>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-[#E6E6E3]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#FEE4E2] text-[#B42318] rounded-[6px] font-semibold text-xs cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Tab Bar (Height 52px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-[#E6E6E3] z-40 flex items-center justify-around px-2">
        <Link
          to={isSalesperson ? '/today' : '/dashboard'}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            isTodayActive ? 'text-[#3B4BDB]' : 'text-[#6B6B66]'
          }`}
        >
          {isSalesperson ? <CalendarCheck className="w-5 h-5" /> : <Compass className="w-5 h-5" />}
          <span className="text-[10px] font-medium mt-0.5">Today</span>
        </Link>

        {!isSalesperson ? (
          <Link
            to="/leads"
            className={`flex flex-col items-center justify-center flex-1 py-1 ${
              isLeadsActive ? 'text-[#3B4BDB]' : 'text-[#6B6B66]'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">Leads</span>
          </Link>
        ) : (
          <Link
            to="/programs"
            className={`flex flex-col items-center justify-center flex-1 py-1 ${
              location.pathname === '/programs' ? 'text-[#3B4BDB]' : 'text-[#6B6B66]'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">Programs</span>
          </Link>
        )}

        <button
          onClick={onOpenSearch}
          className="flex flex-col items-center justify-center flex-1 py-1 text-[#6B6B66] hover:text-[#1F1F1D] cursor-pointer"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Search</span>
        </button>

        <button
          onClick={() => setIsMoreOpen(true)}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            isMoreOpen ? 'text-[#3B4BDB]' : 'text-[#6B6B66]'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">More</span>
        </button>
      </div>
    </>
  );
};
