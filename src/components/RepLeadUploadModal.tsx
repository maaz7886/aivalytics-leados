// @ts-nocheck
// src/components/RepLeadUploadModal.tsx
import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useApp } from '../context/AppContext';
import type { Lead, Salesperson, Stage, LeadLifecycleStage } from '../types';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Button } from './ui/Button';

interface RepLeadUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRep: Salesperson | null;
  onSuccess?: (count: number, repName: string) => void;
}

interface ParsedRow {
  fullName: string;
  phone: string;
  email: string;
  currentRole: string;
  currentCompany: string;
  city: string;
  yearsOfExperience: number;
  primaryGoal: string;
  programName?: string;
  crmStage?: string;
}

export const RepLeadUploadModal: React.FC<RepLeadUploadModalProps> = ({
  isOpen,
  onClose,
  targetRep,
  onSuccess
}) => {
  const { bulkAddLeads } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Target program defaults to rep's allowed programs
  const repPrograms = targetRep?.allowedPrograms || (targetRep?.name === 'Yameen' ? ['ai-pm'] : ['ai-builder']);
  const defaultProgram = repPrograms.includes('ai-builder') && !repPrograms.includes('ai-pm')
    ? 'ai-builder'
    : 'ai-pm';

  const [selectedProgramId, setSelectedProgramId] = useState<string>(defaultProgram);
  const [selectedStage, setSelectedStage] = useState<Stage>('New Lead');

  if (!isOpen || !targetRep) return null;

  const normalizePhone = (raw: string): string => {
    if (!raw) return '+91 98000 00000';
    const digits = String(raw).replace(/\D/g, '');
    if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    if (digits.length === 12 && digits.startsWith('91')) {
      return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
    }
    return String(raw).trim();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    parseFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    parseFile(file);
  };

  const parseFile = (file: File) => {
    setError(null);
    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          setError('The uploaded spreadsheet contains no data rows.');
          setIsProcessing(false);
          return;
        }

        const rows: ParsedRow[] = rawJson.map((row, idx) => {
          const findVal = (keys: string[]): string => {
            for (const k of keys) {
              const match = Object.keys(row).find(
                (rk) => rk.toLowerCase().replace(/[^a-z0-9]/g, '') === k
              );
              if (match && row[match] !== undefined && row[match] !== null && String(row[match]).trim() !== '') {
                return String(row[match]).trim();
              }
            }
            return '';
          };

          const fullName =
            findVal(['fullname', 'name', 'leadname', 'candidate', 'candidatename', 'student']) ||
            `Candidate ${idx + 1}`;
          const phone = normalizePhone(
            findVal(['phone', 'phonenumber', 'mobile', 'mobilenumber', 'contact', 'whatsapp'])
          );
          const email =
            findVal(['email', 'emailaddress', 'mail']) ||
            `lead_${Date.now()}_${idx}@aivalytics.io`;
          const currentRole =
            findVal(['currentrole', 'role', 'title', 'designation', 'occupation']) ||
            'Professional';
          const currentCompany =
            findVal(['currentcompany', 'company', 'organization', 'employer']) ||
            'Corporate';
          const city =
            findVal(['city', 'location', 'place', 'state']) ||
            'Bengaluru';
          const expVal = findVal(['yearsofexperience', 'experience', 'exp', 'years']);
          const yearsOfExperience = expVal ? parseInt(expVal.replace(/\D/g, ''), 10) || 3 : 3;
          const primaryGoal =
            findVal(['primarygoal', 'goal', 'objective', 'learninggoal']) ||
            'AI Career Transition';

          return {
            fullName,
            phone,
            email,
            currentRole,
            currentCompany,
            city,
            yearsOfExperience,
            primaryGoal
          };
        });

        setParsedRows(rows);
      } catch (err: any) {
        setError(`Failed to parse file: ${err.message || 'Invalid Excel or CSV format'}`);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setError('Error reading file from disk.');
      setIsProcessing(false);
    };

    reader.readAsBinaryString(file);
  };

  const handleConfirmUpload = () => {
    if (!parsedRows || parsedRows.length === 0) {
      setError('Please select an Excel or CSV file with valid lead records.');
      return;
    }

    setIsUploading(true);

    const isPm = selectedProgramId === 'ai-pm';
    const programName = isPm
      ? 'AI-Native Project Management'
      : '3-Day AI Builder Workshop (Free Webinar)';

    const now = new Date().toISOString();
    const todayStr = now.replace('T', ' ').substring(0, 16);
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().substring(0, 10) + ' 10:00';

    const leadsToInsert: Lead[] = parsedRows.map((row, idx) => {
      const fitScore = Math.floor(Math.random() * 25) + 75; // 75-99
      const intentScore = Math.floor(Math.random() * 25) + 75;
      const leadId = `lead-upload-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`;

      const leadStage: LeadLifecycleStage = selectedStage === 'New Lead' ? 'New' : 'Contacting';

      return {
        id: leadId,
        fullName: row.fullName,
        phone: row.phone,
        email: row.email,
        city: row.city,
        state: 'State',
        country: 'India',
        source: 'Admin Direct Upload',
        metaCampaign: `Assigned_Upload_${targetRep.name}_${new Date().toISOString().substring(0, 10)}`,
        metaAdSet: fileName || 'Direct_Excel_Ingestion',
        metaAd: 'Admin_Roster_Assignment',
        campaignId: `cmp_upload_${Date.now()}`,
        dateCaptured: todayStr,
        programId: selectedProgramId,
        programName,
        professionalStatus: 'Working Professional',
        currentRole: row.currentRole,
        currentCompany: row.currentCompany,
        industry: 'Technology',
        yearsOfExperience: row.yearsOfExperience,
        currentResponsibilities: `Directly assigned to ${targetRep.name} via Excel sheet "${fileName}".`,
        currentSkillSet: ['Domain Expertise', 'Execution Management'],
        currentAiUsageLevel: 'Intermediate',
        primaryGoal: row.primaryGoal as any,
        desiredRole: `Senior ${row.currentRole} (AI-Native)`,
        expectedTimeline: 'Immediately',
        mainChallenge: 'Wants structured hands-on agentic workflows.',
        whyNow: `Uploaded directly by Admin for ${targetRep.name}.`,
        expectedOutcome: 'Admissions enrollment and curriculum completion.',
        comments: `Direct lead upload from ${fileName}. Assigned to ${targetRep.name}.`,
        assignedSalesperson: targetRep.name,
        assignedAt: now,
        crmStage: selectedStage,
        leadStage,
        paymentState: 'Unpaid',
        lastActivityOutcome: 'No answer',
        leadTemperature: fitScore >= 80 ? 'Hot' : 'Warm',
        lastContacted: 'Not Contacted',
        nextFollowUp: tomorrowStr,
        nextTask: {
          id: `task-${leadId}`,
          leadId,
          owner: targetRep.name,
          taskType: selectedStage === 'New Lead' ? 'Call' : 'Follow-up Call',
          dueDateTime: tomorrowStr,
          priority: fitScore >= 80 ? 'Critical' : 'High',
          completionStatus: 'Pending',
          notes: `First outreach assigned to ${targetRep.name} from ${fileName}`
        },
        numberOfCalls: 0,
        numberOfFollowUps: 0,
        paymentStatus: 'Unpaid',
        amountPaid: 0,
        enrollmentStatus: 'Not Enrolled',
        fitScore,
        intentScore,
        priority: fitScore >= 80 ? 'P1' : 'P2',
        qualificationStatus: 'Unqualified',
        activities: [
          {
            id: `act-${leadId}-init`,
            leadId,
            timestamp: now,
            type: 'System Note',
            description: `Lead uploaded by Admin and assigned directly to ${targetRep.name}`,
            author: 'Admin Maaz'
          }
        ]
      };
    });

    // Commit to state and cloud database
    bulkAddLeads(leadsToInsert);

    setIsUploading(false);
    if (onSuccess) {
      onSuccess(leadsToInsert.length, targetRep.name);
    }
    onClose();
  };

  const handleDownloadSample = () => {
    const sampleData = [
      {
        'Full Name': 'Kunal Singhania',
        'Phone': '+91 98765 12345',
        'Email': 'kunal.singhania@techcorp.com',
        'Current Role': 'Senior Project Lead',
        'Current Company': 'Infosys Limited',
        'City': 'Bengaluru',
        'Years of Experience': 7,
        'Primary Goal': 'AI-Native Workflow Transition'
      },
      {
        'Full Name': 'Aarti Deshmukh',
        'Phone': '+91 99887 54321',
        'Email': 'aarti.deshmukh@startup.io',
        'Current Role': 'Product Manager',
        'Current Company': 'Growth Labs',
        'City': 'Mumbai',
        'Years of Experience': 5,
        'Primary Goal': 'Move to AI-First Product Strategy'
      },
      {
        'Full Name': 'Rohan Kulkarni',
        'Phone': '+91 91234 98765',
        'Email': 'rohan.kulkarni@enterprise.org',
        'Current Role': 'Program Manager',
        'Current Company': 'TCS',
        'City': 'Pune',
        'Years of Experience': 9,
        'Primary Goal': 'Automate PM SOPs with LLMs'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sample_Leads');
    XLSX.writeFile(wb, `LeadOS_Sample_Import_Template.xlsx`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl border border-[#E6E6E3] shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E6E6E3] flex items-center justify-between shrink-0 bg-[#FAFAF9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EEF0FD] text-[#3B4BDB] font-semibold text-sm flex items-center justify-center border border-[#C7D0FA]">
              {targetRep.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] font-semibold text-[#1F1F1D]">
                  Upload Leads for {targetRep.name}
                </h2>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#DDF4E4] text-[#17673A] border border-[#C3ECD0]">
                  Direct Assignment
                </span>
              </div>
              <p className="text-[12px] text-[#6B6B66] mt-0.5">
                Uploaded leads will immediately appear on {targetRep.name}'s My Day queues (`/today`) and Admin dashboard.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-[#6B6B66] hover:text-[#1F1F1D] rounded-md hover:bg-[#F3F4F6] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Target Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#F7F7F5] rounded-lg border border-[#E6E6E3]">
            <div>
              <label className="text-[11px] font-semibold text-[#6B6B66] uppercase tracking-wider block mb-1">
                Program Offering
              </label>
              <select
                value={selectedProgramId}
                onChange={(e) => setSelectedProgramId(e.target.value)}
                className="w-full h-8 text-[12px] bg-white border border-[#E6E6E3] rounded-md px-2 font-medium text-[#1F1F1D] outline-none focus:border-[#3B4BDB]"
              >
                <option value="ai-pm">AI-Native Project Management (₹49,999)</option>
                <option value="ai-builder">3-Day AI Builder Workshop / Free Webinar (₹6,999)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#6B6B66] uppercase tracking-wider block mb-1">
                Initial Pipeline Stage
              </label>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value as Stage)}
                className="w-full h-8 text-[12px] bg-white border border-[#E6E6E3] rounded-md px-2 font-medium text-[#1F1F1D] outline-none focus:border-[#3B4BDB]"
              >
                <option value="New Lead">New Lead (SLA &lt;15m)</option>
                <option value="Attempted Contact">Attempted Contact (1st Call)</option>
                <option value="Connected">Connected</option>
                <option value="Demo Session Scheduled">Webinar / Demo Scheduled</option>
              </select>
            </div>
          </div>

          {/* Drag & Drop File Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#C7D0FA] hover:border-[#3B4BDB] bg-[#FAFAF9] hover:bg-[#EEF0FD]/30 rounded-xl p-6 text-center cursor-pointer transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-[#EEF0FD] text-[#3B4BDB] flex items-center justify-center mx-auto mb-2.5">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="text-[14px] font-semibold text-[#1F1F1D]">
              {fileName ? fileName : 'Click or drag Excel / CSV file here'}
            </div>
            <p className="text-[12px] text-[#6B6B66] mt-1 max-w-sm mx-auto">
              Supports .xlsx, .xls, and .csv files. Headers like Name, Phone, Email, Role, Company are automatically recognized.
            </p>

            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="text-[11px] font-medium text-[#3B4BDB] bg-white border border-[#C7D0FA] px-2.5 py-1 rounded-md">
                Browse file
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadSample();
                }}
                className="text-[11px] text-[#6B6B66] hover:text-[#1F1F1D] underline ml-2 cursor-pointer"
              >
                Download sample template
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-[#FEF3F2] border border-[#FECDCA] rounded-lg text-xs text-[#B42318] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Parsed Rows Preview */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-semibold text-[#1F1F1D]">
                  Preview ({parsedRows.length} leads detected)
                </span>
                <span className="text-[#17673A] bg-[#DDF4E4] font-medium px-2 py-0.5 rounded-full text-[11px]">
                  Ready to assign to {targetRep.name}
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto rounded-lg border border-[#E6E6E3] text-[12px]">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#F7F7F5] text-[#6B6B66] border-b border-[#E6E6E3] sticky top-0">
                    <tr>
                      <th className="py-1.5 px-2.5 font-medium">#</th>
                      <th className="py-1.5 px-2.5 font-medium">Candidate</th>
                      <th className="py-1.5 px-2.5 font-medium">Phone</th>
                      <th className="py-1.5 px-2.5 font-medium">Role & Company</th>
                      <th className="py-1.5 px-2.5 font-medium">City</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E6E3]">
                    {parsedRows.slice(0, 10).map((r, idx) => (
                      <tr key={idx} className="hover:bg-[#F3F4F6]">
                        <td className="py-1.5 px-2.5 text-[#6B6B66] tabular-nums font-mono">
                          {idx + 1}
                        </td>
                        <td className="py-1.5 px-2.5 font-medium text-[#1F1F1D]">
                          {r.fullName}
                        </td>
                        <td className="py-1.5 px-2.5 text-[#6B6B66] tabular-nums font-mono text-[11px]">
                          {r.phone}
                        </td>
                        <td className="py-1.5 px-2.5 text-[#6B6B66] truncate max-w-[150px]">
                          {r.currentRole} · {r.currentCompany}
                        </td>
                        <td className="py-1.5 px-2.5 text-[#6B6B66]">
                          {r.city}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 10 && (
                <div className="text-[11px] text-[#6B6B66] text-center italic">
                  + {parsedRows.length - 10} more leads will be imported and assigned
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-[#E6E6E3] bg-[#FAFAF9] flex items-center justify-between shrink-0">
          <div className="text-[12px] text-[#6B6B66]">
            {parsedRows.length > 0 ? (
              <span>Target: <strong>{targetRep.name}</strong> ({parsedRows.length} leads)</span>
            ) : (
              <span>No file selected yet</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmUpload}
              disabled={parsedRows.length === 0 || isUploading}
              className="flex items-center gap-1.5"
            >
              {isUploading ? (
                <span>Assigning Leads...</span>
              ) : (
                <>
                  <span>Confirm & Assign {parsedRows.length > 0 ? `(${parsedRows.length})` : ''}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
