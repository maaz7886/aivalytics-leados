// src/pages/Users.tsx
import { useState } from 'react';
import { useApp, adminUser } from '../context/AppContext';
import { Shield, Mail, Phone, Plus, Check } from 'lucide-react';

export default function Users() {
  const { salespeople, updateSalesperson, addSalesperson } = useApp();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'Salesperson' | 'Admin'>('Salesperson');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const allUsers = [adminUser, ...salespeople];

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    addSalesperson({
      name: inviteName.trim(),
      email: inviteEmail.trim().toLowerCase(),
      phone: '+91 98765 00000',
      role: inviteRole,
      title: inviteRole === 'Admin' ? 'Admissions Manager' : 'Sales Representative',
      status: 'Active',
      dailyCallTarget: 25,
      dailyLeadCapacity: 30,
      avatarColor: 'bg-[#133926]',
      joinedDate: new Date().toISOString().substring(0, 10),
      bio: 'Authorized sales team member.'
    });

    setIsInviteModalOpen(false);
    setInviteName('');
    setInviteEmail('');
    setToastMsg(`✓ Access invitation registered for ${inviteEmail}!`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 p-4 bg-emerald-900 text-white rounded-xl shadow-xl flex items-center gap-3 border border-emerald-700 animate-in fade-in text-xs font-bold">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
              User Access & Permission Controls
            </h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              {allUsers.length} Authorized Accounts
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Manage authenticated team accounts. Only emails listed here are permitted to access LeadOS via Google Sign-In and email login.
          </p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="px-4 py-2 bg-[#133926] hover:bg-[#1a4a33] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Invite Team Member</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-750/50 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-3">Role & Access</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3 text-center">Google Sign-In Status</th>
                <th className="py-3 px-3 text-center">Account State</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {allUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-750/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${u.avatarColor || 'bg-gray-900'}`}>
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-gray-100">{u.name}</div>
                        <div className="text-[10px] text-gray-400">{u.title}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                      u.role === 'Admin'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-950 dark:text-purple-300'
                        : 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      <Shield className="w-2.5 h-2.5" />
                      {u.role}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-1 text-[11px]">
                      <Mail className="w-3 h-3 text-gray-400" />
                      <span>{u.email}</span>
                    </div>
                    {u.phone && (
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                        <Phone className="w-2.5 h-2.5" />
                        <span>{u.phone}</span>
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 inline-flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" />
                      Whitelisted (Google Auth)
                    </span>
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      u.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}>
                      {u.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    {u.id !== 'rep-admin' && (
                      <button
                        onClick={() => {
                          const nextStatus = u.status === 'Active' ? 'Inactive' : 'Active';
                          updateSalesperson(u.id, { status: nextStatus });
                        }}
                        className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 cursor-pointer"
                      >
                        {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleInvite} className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="font-black text-sm text-gray-900 dark:text-gray-100">
                Invite New Team Member
              </h3>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Patel"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Google Work Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. maya.patel@aivalytics.io"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Only this email will be allowed to Sign in with Google.</span>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Role *</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 font-semibold"
                >
                  <option value="Salesperson">Sales Representative (Restricted to assigned leads)</option>
                  <option value="Admin">Admin (Full management access)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-[#133926] hover:bg-[#1a4a33] text-white rounded-lg shadow-sm cursor-pointer"
              >
                Whitelist & Invite
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
