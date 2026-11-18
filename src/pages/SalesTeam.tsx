// src/pages/SalesTeam.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Salesperson, Stage } from '../types';
import { SidePanel } from '../components/ui/SidePanel';
import { LeadPanel } from '../components/LeadPanel';
import { StageChip } from '../components/ui/StageChip';
import { Button } from '../components/ui/Button';
import { RepLeadUploadModal } from '../components/RepLeadUploadModal';
import { formatPhoneNumber } from '../utils/tableFormatters';
import {
  Users,
  UserPlus,
  CheckCircle2,
  Shuffle,
  Search,
  Edit2,
  ShieldCheck,
  UploadCloud,
  X
} from 'lucide-react';

export default function SalesTeam() {
  const {
    salespeople,
    leads,
    allLeads,
    callActivities,
    roundRobinEnabled,
    setRoundRobinEnabled,
    autoDistributeRoundRobin,
    assignLead,
    bulkAssignLeads,
    addSalesperson,
    updateSalesperson
  } = useApp();

  const navigate = useNavigate();
  const teamLeadsPool = allLeads && allLeads.length > 0 ? allLeads : leads;

  // View state
  const [activeTab, setActiveTab] = useState<'roster' | 'assignment'>('roster');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals & Panels
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRep, setEditingRep] = useState<Salesperson | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [uploadRep, setUploadRep] = useState<Salesperson | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleOpenUploadModal = (rep: Salesperson) => {
    setUploadRep(rep);
    setIsUploadModalOpen(true);
  };

  // Bulk Reassignment state
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [bulkTargetRep, setBulkTargetRep] = useState<string>('');
  const [assignmentFilter, setAssignmentFilter] = useState<string>('Unassigned');

  // Add/Edit Rep Form State
  const [repName, setRepName] = useState('');
  const [repEmail, setRepEmail] = useState('');
  const [repPhone, setRepPhone] = useState('');
  const [repTitle, setRepTitle] = useState('Senior Admissions Specialist');
  const [repDailyTarget, setRepDailyTarget] = useState(30);
  const [repCapacity, setRepCapacity] = useState(35);
  const [repStatus, setRepStatus] = useState<'Active' | 'Inactive'>('Active');
  const [repAllowedPrograms, setRepAllowedPrograms] = useState<string[]>(['ai-builder']);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleProgramAccess = (rep: Salesperson, programKey: string) => {
    const current = rep.allowedPrograms || (rep.name === 'Yameen' ? ['ai-pm'] : ['ai-builder']);
    const hasAccess = current.includes(programKey);
    const updated = hasAccess
      ? current.filter((p) => p !== programKey)
      : [...current, programKey];

    if (updated.length === 0) {
      showToast(`${rep.name} must have access to at least one program ecosystem.`);
      return;
    }

    updateSalesperson(rep.id, { allowedPrograms: updated });
    const progLabel = programKey === 'ai-pm' ? 'AI Native PM' : 'AI Native Builder (Webinar)';
    showToast(
      !hasAccess
        ? `Granted ${progLabel} ecosystem access to ${rep.name}.`
        : `Revoked ${progLabel} access from ${rep.name}.`
    );
  };

  const todayStr = new Date().toISOString().substring(0, 10);

  // Team-wide metrics
  const totalReps = salespeople.length;
  const activeReps = salespeople.filter((s) => s.status === 'Active');
  const teamTodayCalls = callActivities.filter((c) => c.timestamp.startsWith(todayStr)).length;
  const teamTotalEnrolled = teamLeadsPool.filter(
    (l) => l.crmStage === 'Converted' || l.paymentStatus === 'Paid'
  ).length;

  const handleOpenAddModal = () => {
    setRepName('');
    setRepEmail('');
    setRepPhone('');
    setRepTitle('Senior Admissions Specialist');
    setRepDailyTarget(30);
    setRepCapacity(35);
    setRepStatus('Active');
    setRepAllowedPrograms(['ai-builder']);
    setEditingRep(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (rep: Salesperson) => {
    setEditingRep(rep);
    setRepName(rep.name);
    setRepEmail(rep.email);
    setRepPhone(rep.phone);
    setRepTitle(rep.title || 'Senior Admissions Specialist');
    setRepDailyTarget(rep.dailyCallTarget || 30);
    setRepCapacity(rep.dailyLeadCapacity || 35);
    setRepStatus(rep.status || 'Active');
    setRepAllowedPrograms(rep.allowedPrograms || (rep.name === 'Yameen' ? ['ai-pm'] : ['ai-builder']));
    setIsAddModalOpen(true);
  };

  const handleSaveRep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repName || !repEmail) return;

    if (editingRep) {
      updateSalesperson(editingRep.id, {
        name: repName,
        email: repEmail,
        phone: repPhone,
        title: repTitle,
        dailyCallTarget: Number(repDailyTarget),
        dailyLeadCapacity: Number(repCapacity),
        status: repStatus,
        allowedPrograms: repAllowedPrograms
      });
      showToast(`Updated details for ${repName}`);
    } else {
      addSalesperson({
        name: repName,
        email: repEmail,
        phone: repPhone,
        title: repTitle,
        dailyCallTarget: Number(repDailyTarget),
        dailyLeadCapacity: Number(repCapacity),
        status: repStatus,
        role: 'Salesperson',
        joinedDate: todayStr,
        avatarColor: 'bg-[#3B4BDB]',
        allowedPrograms: repAllowedPrograms
      });
      showToast(`Added ${repName} to sales team roster`);
    }

    setIsAddModalOpen(false);
  };

  const handleExecuteBulkAssign = () => {
    if (!bulkTargetRep || selectedLeadIds.length === 0) return;
    bulkAssignLeads(selectedLeadIds, bulkTargetRep);
    showToast(`Reassigned ${selectedLeadIds.length} leads to ${bulkTargetRep}`);
    setSelectedLeadIds([]);
    setBulkTargetRep('');
  };

  // Filtered reps
  const filteredReps = salespeople.filter((s) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.title || '').toLowerCase().includes(q)
    );
  });

  // Filtered leads for assignment tab
  const assignmentLeads = teamLeadsPool.filter((l) => {
    if (assignmentFilter === 'Unassigned') {
      return !l.assignedSalesperson || l.assignedSalesperson === 'Unassigned';
    }
    return l.assignedSalesperson === assignmentFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 bg-[#1F1F1D] text-white rounded-lg shadow-lg flex items-center gap-2 text-[13px] font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[20px] font-semibold text-[#1F1F1D] tracking-tight">
              Sales Team
            </h1>
            <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-[#F7F7F5] border border-[#E6E6E3] text-[#6B6B66] tabular-nums font-mono">
              {activeReps.length} Active Reps
            </span>
          </div>
          <p className="text-[13px] text-[#6B6B66] mt-0.5">
            Representative roster, daily call quotas, round-robin auto-routing, and lead pool management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Round-Robin Toggle Pill */}
          <button
            type="button"
            onClick={() => {
              setRoundRobinEnabled(!roundRobinEnabled);
              showToast(
                `Round-robin lead routing ${!roundRobinEnabled ? 'ENABLED' : 'DISABLED'}`
              );
            }}
            className={`px-3 py-1.5 rounded-md border text-[12px] font-medium flex items-center gap-2 cursor-pointer transition-colors ${
              roundRobinEnabled
                ? 'bg-[#EEF0FD] border-[#3B4BDB] text-[#3B4BDB]'
                : 'bg-white border-[#E6E6E3] text-[#6B6B66] hover:bg-[#F3F4F6]'
            }`}
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Round-Robin Routing: {roundRobinEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <Button
            variant="primary"
            size="md"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 text-[13px]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Sales Rep</span>
          </Button>
        </div>
      </div>

      {/* 4 Team Scorecards (Notion style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#6B6B66] text-[12px]">
            <span className="font-medium">Active Sales Team</span>
            <span className="text-[11px] font-medium text-[#17673A] bg-[#DDF4E4] px-1.5 py-0.2 rounded">
              100% capacity
            </span>
          </div>
          <div className="text-[24px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
            {activeReps.length}
            <span className="text-[14px] text-[#6B6B66] ml-1">/ {totalReps} total</span>
          </div>
          <div className="text-[12px] text-[#6B6B66]">
            Admissions specialists handling lead queues
          </div>
        </div>

        <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#6B6B66] text-[12px]">
            <span className="font-medium">Calls Logged Today</span>
            <span className="tabular-nums font-mono text-[11px]">Today's dials</span>
          </div>
          <div className="text-[24px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
            {teamTodayCalls}
          </div>
          <div className="text-[12px] text-[#6B6B66]">
            Across AI-PM & AI Builder candidate outreach
          </div>
        </div>

        <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#6B6B66] text-[12px]">
            <span className="font-medium">Total Assigned Leads</span>
            <span className="tabular-nums font-mono text-[11px]">Pool size</span>
          </div>
          <div className="text-[24px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
            {teamLeadsPool.length}
          </div>
          <div className="text-[12px] text-[#6B6B66]">
            Distributed across active representatives
          </div>
        </div>

        <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#6B6B66] text-[12px]">
            <span className="font-medium">Paid Enrollments</span>
            <span className="text-[11px] font-medium text-[#17673A] bg-[#DDF4E4] px-1.5 py-0.2 rounded">
              Converted
            </span>
          </div>
          <div className="text-[24px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
            {teamTotalEnrolled}
          </div>
          <div className="text-[12px] text-[#6B6B66]">
            Total candidates enrolled into cohorts
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E6E6E3] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('roster')}
          className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'roster'
              ? 'bg-[#EEF0FD] text-[#3B4BDB]'
              : 'text-[#6B6B66] hover:bg-[#F3F4F6]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team Roster ({salespeople.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('assignment')}
          className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'assignment'
              ? 'bg-[#EEF0FD] text-[#3B4BDB]'
              : 'text-[#6B6B66] hover:bg-[#F3F4F6]'
          }`}
        >
          <Shuffle className="w-4 h-4" />
          <span>Lead Routing & Reassignment</span>
        </button>
      </div>

      {/* TAB 1: TEAM ROSTER */}
      {activeTab === 'roster' && (
        <div className="bg-white border border-[#E6E6E3] rounded-lg p-4 space-y-4">
          {/* Admin Program Ecosystem Access Banner */}
          <div className="p-3 bg-[#EEF0FD] border border-[#C7D0FA] rounded-md flex items-start gap-2.5 text-xs text-[#1F1F1D]">
            <ShieldCheck className="w-4 h-4 text-[#3B4BDB] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-[#3B4BDB]">Admin Program Ecosystem Access:</strong> Currently, only <strong>Yamin</strong> and <strong>Admin Maaz</strong> have access to <strong>AI Native PM</strong> leads, while <strong>Hari</strong>, <strong>Jay</strong>, and <strong>Khurram</strong> handle <strong>AI Native Builder (Free Webinar)</strong> leads. Click either badge in the <em>Program Access</em> column below to instantly grant or revoke access to either ecosystem for any salesperson.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#6B6B66] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reps by name, title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#F7F7F5] border border-[#E6E6E3] rounded-md text-[13px] text-[#1F1F1D] focus:outline-hidden"
              />
            </div>

            <span className="text-[12px] text-[#6B6B66] tabular-nums font-mono">
              Showing {filteredReps.length} of {salespeople.length} reps
            </span>
          </div>

          <div className="overflow-x-auto rounded-md border border-[#E6E6E3]">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#F7F7F5] text-[#6B6B66] font-medium text-[12px] border-b border-[#E6E6E3]">
                  <th className="py-2.5 px-3">Salesperson</th>
                  <th className="py-2.5 px-3">Program Access</th>
                  <th className="py-2.5 px-3">Phone & Email</th>
                  <th className="py-2.5 px-3">Daily Target</th>
                  <th className="py-2.5 px-3">Today's Dials</th>
                  <th className="py-2.5 px-3">Assigned Leads</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E6E3]">
                {filteredReps.map((rep) => {
                  const repLeads = teamLeadsPool.filter((l) => l.assignedSalesperson === rep.name);
                  const repCallsToday = callActivities.filter(
                    (c) => c.salesperson === rep.name && c.timestamp.startsWith(todayStr)
                  ).length;
                  const target = rep.dailyCallTarget || 30;
                  const progressPct = Math.min(100, Math.round((repCallsToday / target) * 100));
                  const repPrograms = rep.allowedPrograms || (rep.name === 'Yameen' ? ['ai-pm'] : ['ai-builder']);

                  return (
                    <tr key={rep.id} className="hover:bg-[#F3F4F6] transition-colors h-11">
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#EEF0FD] text-[#3B4BDB] font-semibold text-[12px] flex items-center justify-center shrink-0">
                            {rep.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <div>
                            <div className="font-medium text-[#1F1F1D]">{rep.name}</div>
                            <div className="text-[11px] text-[#6B6B66]">{rep.title}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* AI Native PM Pill */}
                          <button
                            type="button"
                            onClick={() => handleToggleProgramAccess(rep, 'ai-pm')}
                            title="Click to toggle AI Native PM access for this rep"
                            className={`px-2 py-0.5 rounded-[4px] text-[11px] font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                              repPrograms.includes('ai-pm')
                                ? 'bg-[#EEF0FD] border-[#C7D0FA] text-[#3B4BDB] hover:bg-[#dfe4fb]'
                                : 'bg-[#F7F7F5] border-[#E6E6E3] text-[#9CA3AF] hover:bg-[#E6E6E3] hover:text-[#1F1F1D]'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                repPrograms.includes('ai-pm') ? 'bg-[#3B4BDB]' : 'bg-[#D1D5DB]'
                              }`}
                            />
                            <span>AI Native PM</span>
                          </button>

                          {/* AI Native Builder Pill */}
                          <button
                            type="button"
                            onClick={() => handleToggleProgramAccess(rep, 'ai-builder')}
                            title="Click to toggle AI Native Builder / Webinar access for this rep"
                            className={`px-2 py-0.5 rounded-[4px] text-[11px] font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                              repPrograms.includes('ai-builder')
                                ? 'bg-[#DDF4E4] border-[#C3ECD0] text-[#17673A] hover:bg-[#c9e8d3]'
                                : 'bg-[#F7F7F5] border-[#E6E6E3] text-[#9CA3AF] hover:bg-[#E6E6E3] hover:text-[#1F1F1D]'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                repPrograms.includes('ai-builder') ? 'bg-[#17673A]' : 'bg-[#D1D5DB]'
                              }`}
                            />
                            <span>AI Builder (Webinar)</span>
                          </button>
                        </div>
                      </td>

                      <td className="py-2 px-3 text-[12px]">
                        <div className="text-[#1F1F1D] tabular-nums font-mono">{formatPhoneNumber(rep.phone)}</div>
                        <div className="text-[11px] text-[#6B6B66]">{rep.email}</div>
                      </td>

                      <td className="py-2 px-3 tabular-nums font-mono text-[12px]">
                        {target} calls/day
                      </td>

                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2 text-[12px] tabular-nums font-mono">
                          <span className="font-semibold text-[#1F1F1D]">{repCallsToday}</span>
                          <span className="text-[#6B6B66]">/ {target}</span>
                          <span className="text-[11px] text-[#3B4BDB] font-medium">({progressPct}%)</span>
                        </div>
                      </td>

                      <td className="py-2 px-3 tabular-nums font-mono text-[12px]">
                        <span className="font-medium text-[#1F1F1D]">{repLeads.length}</span>
                        <span className="text-[#6B6B66] text-[11px] ml-1">leads</span>
                      </td>

                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                            rep.status === 'Active'
                              ? 'bg-[#DDF4E4] text-[#17673A] border-[#C3ECD0]'
                              : 'bg-[#F7F7F5] text-[#6B6B66] border-[#E6E6E3]'
                          }`}
                        >
                          {rep.status || 'Active'}
                        </span>
                      </td>

                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Dedicated Upload Leads for this specific Salesperson */}
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenUploadModal(rep)}
                            className="h-7 text-[12px] px-2.5 flex items-center gap-1.5 bg-[#EEF0FD] text-[#3B4BDB] border-[#C7D0FA] hover:bg-[#dfe4fb] font-semibold cursor-pointer"
                            title={`Upload Excel or CSV leads directly for ${rep.name}`}
                          >
                            <UploadCloud className="w-3.5 h-3.5 text-[#3B4BDB]" />
                            <span>Upload Leads</span>
                          </Button>

                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate(`/workspace/${rep.id}`)}
                            className="h-7 text-[12px] px-2.5 cursor-pointer"
                          >
                            Workspace
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditModal(rep)}
                            className="h-7 text-[12px] px-2 text-[#6B6B66] hover:text-[#1F1F1D] cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: LEAD ROUTING & REASSIGNMENT */}
      {activeTab === 'assignment' && (
        <div className="bg-white border border-[#E6E6E3] rounded-lg p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#E6E6E3] pb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[12px] font-medium text-[#6B6B66]">Filter Leads:</span>
              <button
                type="button"
                onClick={() => setAssignmentFilter('Unassigned')}
                className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors cursor-pointer ${
                  assignmentFilter === 'Unassigned'
                    ? 'bg-[#EEF0FD] text-[#3B4BDB] font-semibold'
                    : 'bg-[#F7F7F5] text-[#6B6B66] hover:bg-[#F3F4F6]'
                }`}
              >
                Unassigned (
                {
                  teamLeadsPool.filter(
                    (l) => !l.assignedSalesperson || l.assignedSalesperson === 'Unassigned'
                  ).length
                }
                )
              </button>
              {salespeople.map((rep) => (
                <button
                  key={rep.id}
                  type="button"
                  onClick={() => setAssignmentFilter(rep.name)}
                  className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors cursor-pointer ${
                    assignmentFilter === rep.name
                      ? 'bg-[#EEF0FD] text-[#3B4BDB] font-semibold'
                      : 'bg-[#F7F7F5] text-[#6B6B66] hover:bg-[#F3F4F6]'
                  }`}
                >
                  {rep.name}
                </button>
              ))}
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (autoDistributeRoundRobin) {
                  autoDistributeRoundRobin();
                  showToast('Distributed all unassigned leads across active sales reps');
                }
              }}
              className="flex items-center gap-1.5 text-[12px] h-8"
            >
              <Shuffle className="w-3.5 h-3.5 text-[#3B4BDB]" />
              <span>Auto-Distribute Round-Robin</span>
            </Button>
          </div>

          {/* Bulk Action Bar (Visible when rows selected) */}
          {selectedLeadIds.length > 0 && (
            <div className="p-3 bg-[#EEF0FD] border border-[#3B4BDB]/30 rounded-md flex items-center justify-between gap-3">
              <span className="text-[13px] font-medium text-[#3B4BDB]">
                {selectedLeadIds.length} leads selected
              </span>

              <div className="flex items-center gap-2">
                <select
                  value={bulkTargetRep}
                  onChange={(e) => setBulkTargetRep(e.target.value)}
                  className="px-2.5 py-1 bg-white border border-[#E6E6E3] rounded-md text-[12px] text-[#1F1F1D]"
                >
                  <option value="">-- Assign to Rep --</option>
                  {salespeople.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleExecuteBulkAssign}
                  disabled={!bulkTargetRep}
                  className="h-7 text-[12px] px-3"
                >
                  Reassign
                </Button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto rounded-md border border-[#E6E6E3]">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#F7F7F5] text-[#6B6B66] font-medium text-[12px] border-b border-[#E6E6E3]">
                  <th className="py-2.5 px-3 w-10">
                    <input
                      type="checkbox"
                      checked={
                        assignmentLeads.length > 0 &&
                        selectedLeadIds.length === assignmentLeads.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLeadIds(assignmentLeads.map((l) => l.id));
                        } else {
                          setSelectedLeadIds([]);
                        }
                      }}
                      className="rounded border-[#E6E6E3] text-[#3B4BDB]"
                    />
                  </th>
                  <th className="py-2.5 px-3">Candidate</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Program</th>
                  <th className="py-2.5 px-3">Assigned Salesperson</th>
                  <th className="py-2.5 px-3">Stage</th>
                  <th className="py-2.5 px-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E6E3]">
                {assignmentLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#6B6B66] text-[12px]">
                      No leads matching this filter.
                    </td>
                  </tr>
                ) : (
                  assignmentLeads.map((lead) => {
                    const isSelected = selectedLeadIds.includes(lead.id);
                    return (
                      <tr
                        key={lead.id}
                        className={`transition-colors h-10 ${
                          isSelected ? 'bg-[#EEF0FD]' : 'hover:bg-[#F3F4F6]'
                        }`}
                      >
                        <td className="py-2 px-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLeadIds([...selectedLeadIds, lead.id]);
                              } else {
                                setSelectedLeadIds(selectedLeadIds.filter((id) => id !== lead.id));
                              }
                            }}
                            className="rounded border-[#E6E6E3] text-[#3B4BDB]"
                          />
                        </td>

                        <td className="py-2 px-3">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLeadId(lead.id);
                              setIsSidePanelOpen(true);
                            }}
                            className="font-medium text-[#1F1F1D] hover:text-[#3B4BDB] text-left cursor-pointer"
                          >
                            {lead.fullName}
                          </button>
                        </td>

                        <td className="py-2 px-3 tabular-nums font-mono text-[12px]">
                          {formatPhoneNumber(lead.phone)}
                        </td>

                        <td className="py-2 px-3 text-[#1F1F1D]">
                          {lead.programName || 'AI Cohort'}
                        </td>

                        <td className="py-2 px-3">
                          <select
                            value={lead.assignedSalesperson || 'Unassigned'}
                            onChange={(e) => {
                              assignLead(lead.id, e.target.value);
                              showToast(`Assigned ${lead.fullName} to ${e.target.value}`);
                            }}
                            className="px-2 py-0.5 border border-[#E6E6E3] rounded-md text-[12px] bg-white text-[#1F1F1D] cursor-pointer"
                          >
                            <option value="Unassigned">Unassigned</option>
                            {salespeople.map((s) => (
                              <option key={s.id} value={s.name}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="py-2 px-3">
                          <StageChip stage={lead.crmStage as Stage} />
                        </td>

                        <td className="py-2 px-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedLeadId(lead.id);
                              setIsSidePanelOpen(true);
                            }}
                            className="h-7 text-[12px] px-2 text-[#3B4BDB]"
                          >
                            Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Rep Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveRep}
            className="bg-white rounded-lg max-w-md w-full p-5 shadow-xl border border-[#E6E6E3] space-y-4 animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-[#E6E6E3] pb-3">
              <h3 className="font-semibold text-[14px] text-[#1F1F1D]">
                {editingRep ? `Edit ${editingRep.name}` : 'Add Sales Representative'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
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
                  value={repName}
                  onChange={(e) => setRepName(e.target.value)}
                  placeholder="e.g. Rahul Verma"
                  className="w-full px-3 py-1.5 border border-[#E6E6E3] rounded-md text-[13px] bg-white text-[#1F1F1D] focus:outline-hidden focus:border-[#3B4BDB]"
                />
              </div>

              <div>
                <label className="font-medium text-[#1F1F1D] block mb-1 text-[12px]">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={repEmail}
                  onChange={(e) => setRepEmail(e.target.value)}
                  placeholder="rahul@aivalytics.com"
                  className="w-full px-3 py-1.5 border border-[#E6E6E3] rounded-md text-[13px] bg-white text-[#1F1F1D] focus:outline-hidden focus:border-[#3B4BDB]"
                />
              </div>

              <div>
                <label className="font-medium text-[#1F1F1D] block mb-1 text-[12px]">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={repPhone}
                  onChange={(e) => setRepPhone(e.target.value)}
                  placeholder="+91 98220 12345"
                  className="w-full px-3 py-1.5 border border-[#E6E6E3] rounded-md text-[13px] bg-white text-[#1F1F1D] focus:outline-hidden focus:border-[#3B4BDB]"
                />
              </div>

              <div>
                <label className="font-medium text-[#1F1F1D] block mb-1 text-[12px]">
                  Role / Title
                </label>
                <input
                  type="text"
                  value={repTitle}
                  onChange={(e) => setRepTitle(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#E6E6E3] rounded-md text-[13px] bg-white text-[#1F1F1D] focus:outline-hidden focus:border-[#3B4BDB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-[#1F1F1D] block mb-1 text-[12px]">
                    Daily Call Target
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={repDailyTarget}
                    onChange={(e) => setRepDailyTarget(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-[#E6E6E3] rounded-md text-[13px] bg-white text-[#1F1F1D] focus:outline-hidden focus:border-[#3B4BDB]"
                  />
                </div>

                <div>
                  <label className="font-medium text-[#1F1F1D] block mb-1 text-[12px]">
                    Status
                  </label>
                  <select
                    value={repStatus}
                    onChange={(e) => setRepStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-[#E6E6E3] rounded-md text-[13px] bg-white text-[#1F1F1D] focus:outline-hidden focus:border-[#3B4BDB]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-medium text-[#1F1F1D] block mb-1 text-[12px]">
                  Program Ecosystem Access (Admin Controlled)
                </label>
                <div className="p-3 bg-[#F7F7F5] border border-[#E6E6E3] rounded-md space-y-2">
                  <label className="flex items-center gap-2 text-[12px] text-[#1F1F1D] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={repAllowedPrograms.includes('ai-pm')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setRepAllowedPrograms([...repAllowedPrograms, 'ai-pm']);
                        } else {
                          setRepAllowedPrograms(repAllowedPrograms.filter((p) => p !== 'ai-pm'));
                        }
                      }}
                      className="rounded text-[#3B4BDB] focus:ring-[#3B4BDB]"
                    />
                    <span><strong>AI Native PM</strong> (AI-Native Project Management)</span>
                  </label>
                  <label className="flex items-center gap-2 text-[12px] text-[#1F1F1D] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={repAllowedPrograms.includes('ai-builder')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setRepAllowedPrograms([...repAllowedPrograms, 'ai-builder']);
                        } else {
                          setRepAllowedPrograms(repAllowedPrograms.filter((p) => p !== 'ai-builder'));
                        }
                      }}
                      className="rounded text-[#3B4BDB] focus:ring-[#3B4BDB]"
                    />
                    <span><strong>AI Native Builder</strong> (Free Webinar & 3-Day Workshop)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E6E6E3]">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                {editingRep ? 'Save Changes' : 'Add Representative'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Slide-over Side Panel (480px) */}
      <SidePanel
        isOpen={isSidePanelOpen}
        onClose={() => {
          setIsSidePanelOpen(false);
          setSelectedLeadId(null);
        }}
      >
        <LeadPanel
          leadId={selectedLeadId}
          onClose={() => {
            setIsSidePanelOpen(false);
            setSelectedLeadId(null);
          }}
        />
      </SidePanel>

      {/* Direct Rep Lead Upload Modal (Excel / CSV) */}
      <RepLeadUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setUploadRep(null);
        }}
        targetRep={uploadRep}
        onSuccess={(count, repName) => {
          showToast(`Successfully assigned ${count} leads directly to ${repName}! Now live in their workspace.`);
        }}
      />
    </div>
  );
}
