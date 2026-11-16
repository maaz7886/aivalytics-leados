// src/pages/Users.tsx
import { useState } from 'react';
import { useApp, adminUser } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import {
  Plus,
  CheckCircle2,
  X
} from 'lucide-react';

export default function Users() {
  const { salespeople, updateSalesperson, addSalesperson } = useApp();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'Salesperson' | 'Admin'>('Salesperson');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const allUsers = [adminUser, ...salespeople];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    addSalesperson({
      name: inviteName.trim(),
      email: inviteEmail.trim().toLowerCase(),
      phone: '+91 98765 00000',
      role: inviteRole,
      title: inviteRole === 'Admin' ? 'Admissions Manager' : 'Senior Admissions Specialist',
      status: 'Active',
      dailyCallTarget: 30,
      dailyLeadCapacity: 35,
      avatarColor: 'bg-[#3B4BDB]',
      joinedDate: new Date().toISOString().substring(0, 10),
      bio: 'Authorized sales team member.'
    });

    setIsInviteModalOpen(false);
    setInviteName('');
    setInviteEmail('');
    showToast(`Access invitation registered for ${inviteEmail}`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 bg-[#1F1F1D] text-white rounded-lg shadow-lg flex items-center gap-2 text-[13px] font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[20px] font-semibold text-[#1F1F1D] tracking-tight">
              User Access & Permissions
            </h1>
            <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-[#F7F7F5] border border-[#E6E6E3] text-[#6B6B66] tabular-nums font-mono">
              {allUsers.length} Authorized Accounts
            </span>
          </div>
          <p className="text-[13px] text-[#6B6B66] mt-0.5">
            Role-based access control (Admin vs Salesperson). Only invited email addresses are permitted to log in via Google Sign-In or password.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-1.5 text-[13px]"
        >
          <Plus className="w-4 h-4" />
          <span>Invite Team Member</span>
        </Button>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-[#E6E6E3] rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-semibold text-[#1F1F1D]">
            Authorized LeadOS Team Accounts
          </h3>
          <span className="text-[12px] text-[#6B6B66]">
            Strict Google Workspace domain restriction enabled
          </span>
        </div>

        <div className="overflow-x-auto rounded-md border border-[#E6E6E3]">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[#F7F7F5] text-[#6B6B66] font-medium text-[12px] border-b border-[#E6E6E3]">
                <th className="py-2.5 px-3">Team Member</th>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Permissions Scope</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E6E3]">
              {allUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[#F3F4F6] transition-colors h-11">
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#EEF0FD] text-[#3B4BDB] font-semibold text-[12px] flex items-center justify-center shrink-0">
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <div className="font-medium text-[#1F1F1D]">{user.name}</div>
                        <div className="text-[11px] text-[#6B6B66]">{user.title}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-2 px-3 text-[#1F1F1D] text-[12px]">
                    {user.email}
                  </td>

                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                        user.role === 'Admin'
                          ? 'bg-[#EEF0FD] text-[#3B4BDB] border-[#C5CDFA]'
                          : 'bg-[#F7F7F5] text-[#1F1F1D] border-[#E6E6E3]'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="py-2 px-3 text-[12px] text-[#6B6B66]">
                    {user.role === 'Admin'
                      ? 'Full Control Room, Reassignment & Integrations'
                      : 'Scoped to My Day, Assigned Leads & Scripts'}
                  </td>

                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#DDF4E4] text-[#17673A] border border-[#C3ECD0]">
                      Authorized
                    </span>
                  </td>

                  <td className="py-2 px-3 text-right">
                    {user.role !== 'Admin' && (
                      <select
                        value={user.role}
                        onChange={(e) => {
                          updateSalesperson(user.id, { role: e.target.value as any });
                          showToast(`Updated role for ${user.name} to ${e.target.value}`);
                        }}
                        className="px-2 py-0.5 border border-[#E6E6E3] rounded-md text-[11px] bg-white text-[#1F1F1D] cursor-pointer"
                      >
                        <option value="Salesperson">Salesperson</option>
                        <option value="Admin">Admin</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleInvite}
            className="bg-white rounded-lg max-w-md w-full p-5 shadow-xl border border-[#E6E6E3] space-y-4 animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-[#E6E6E3] pb-3">
              <h3 className="font-semibold text-[14px] text-[#1F1F1D]">
                Invite Team Member
              </h3>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="text-[#6B6B66] hover:text-[#1F1F1D] p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-[13px]">
              <div>
                <label className="font-medium text-[#1F1F1D] block mb-1 text-[12px]">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Priyanshu Roy"
                  className="w-full px-3 py-1.5 border border-[#E6E6E3] rounded-md text-[13px] bg-white text-[#1F1F1D] focus:outline-hidden focus:border-[#3B4BDB]"
                />
              </div>

              <div>
                <label className="font-medium text-[#1F1F1D] block mb-1 text-[12px]">
                  Email Address * (must match login)
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@aivalytics.com"
                  className="w-full px-3 py-1.5 border border-[#E6E6E3] rounded-md text-[13px] bg-white text-[#1F1F1D] focus:outline-hidden focus:border-[#3B4BDB]"
                />
              </div>

              <div>
                <label className="font-medium text-[#1F1F1D] block mb-1 text-[12px]">
                  Role & Access Level
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-[#E6E6E3] rounded-md text-[13px] bg-white text-[#1F1F1D] focus:outline-hidden focus:border-[#3B4BDB]"
                >
                  <option value="Salesperson">Salesperson (My Day, Calling Mode & Leads)</option>
                  <option value="Admin">Admin (Full Control Room, Reassignment & Settings)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E6E6E3]">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Authorize Account
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
