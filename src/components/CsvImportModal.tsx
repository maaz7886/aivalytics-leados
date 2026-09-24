// @ts-nocheck
// src/components/CsvImportModal.tsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Lead, Stage } from '../types';
import * as XLSX from 'xlsx';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedLeadRow {
  fullName: string;
  email: string;
  phone: string;
  currentRole: string;
  currentCompany: string;
  city: string;
  yearsOfExperience: number;
  primaryGoal: string;
  programName: string;
}

export default function CsvImportModal({ isOpen, onClose }: CsvImportModalProps) {
  const { addLead } = useApp();
  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedLeadRow[]>([]);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  if (!isOpen) return null;

  const processRawRows = (rows: Record<string, any>[]): ParsedLeadRow[] => {
    return rows.map((row, idx) => {
      const getVal = (keys: string[]): string => {
        for (const k of keys) {
          const foundKey = Object.keys(row).find((rk) => rk.toLowerCase().replace(/[^a-z0-9]/g, '') === k);
          if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
            return String(row[foundKey]).trim();
          }
        }
        return '';
      };

      const fullName = getVal(['fullname', 'name', 'leadname', 'candidate']) || `Excel Candidate ${idx + 1}`;
      const email = getVal(['email', 'emailaddress', 'mail']) || `lead${Date.now()}_${idx}@excelimport.com`;
      const phone = getVal(['phone', 'phonenumber', 'mobile', 'contact']) || '+91 90000 00000';
      const currentRole = getVal(['currentrole', 'role', 'title', 'designation']) || 'Project Manager';
      const currentCompany = getVal(['currentcompany', 'company', 'organization']) || 'Tech Organization';
      const city = getVal(['city', 'location', 'place']) || 'Bengaluru';
      const expStr = getVal(['yearsofexperience', 'experience', 'exp', 'years']);
      const yearsOfExperience = parseInt(expStr || '5', 10) || 5;
      const primaryGoal = getVal(['primarygoal', 'goal', 'objective']) || 'Upskill in Current Role';
      const programName = getVal(['targetprogram', 'program', 'programname']) || 'AI-Native Project Management';

      return {
        fullName,
        email,
        phone,
        currentRole,
        currentCompany,
        city,
        yearsOfExperience,
        primaryGoal,
        programName
      };
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    const reader = new FileReader();

    if (isExcel) {
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const workbook = XLSX.read(bstr, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
          const parsed = processRawRows(jsonRows);
          setParsedRows(parsed);
        } catch (err) {
          console.error('Error parsing Excel file:', err);
          alert('Failed to parse Excel file. Please ensure it is a valid .xlsx or .xls worksheet.');
        }
      };
      reader.readAsBinaryString(file);
    } else {
      // CSV or TXT
      reader.onload = (evt) => {
        try {
          const text = evt.target?.result as string;
          const workbook = XLSX.read(text, { type: 'string' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
          const parsed = processRawRows(jsonRows);
          setParsedRows(parsed);
        } catch (err) {
          console.error('Error parsing CSV file:', err);
          alert('Failed to parse CSV file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleRowChange = (index: number, field: keyof ParsedLeadRow, value: any) => {
    setParsedRows((prev) =>
      prev.map((row, idx) => (idx === index ? { ...row, [field]: value } : row))
    );
  };

  const handleDeleteRow = (index: number) => {
    setParsedRows((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleCommitImport = () => {
    if (parsedRows.length === 0) {
      alert('No valid lead rows to import.');
      return;
    }

    setIsImporting(true);
    let count = 0;

    parsedRows.forEach((row, index) => {
      const fitScore = Math.floor(Math.random() * 18) + 80;
      const intentScore = Math.floor(Math.random() * 20) + 70;
      const progLower = (row.programName || '').toLowerCase();

      const newLead: Lead = {
        id: `lead-excel-${Date.now()}-${index}`,
        fullName: row.fullName,
        phone: row.phone,
        email: row.email,
        city: row.city,
        state: 'State',
        country: 'India',
        source: 'Microsoft Excel Ingestion',
        metaCampaign: 'Excel_Worksheet_Q3',
        metaAdSet: 'Direct_Import',
        metaAd: 'XLSX_File_Upload',
        campaignId: `cmp_xlsx_${Date.now()}`,
        dateCaptured: new Date().toISOString().replace('T', ' ').substring(0, 16),
        programId: progLower.includes('gtm') ? 'ai-gtm' : progLower.includes('fellowship') ? 'ai-fellowship' : 'ai-pm',
        programName: row.programName,
        professionalStatus: 'Working Professional',
        currentRole: row.currentRole,
        currentCompany: row.currentCompany,
        industry: 'Technology',
        yearsOfExperience: row.yearsOfExperience,
        currentResponsibilities: `Uploaded via Excel worksheet (${fileName || 'Leads.xlsx'}). ${row.currentRole} at ${row.currentCompany}.`,
        currentSkillSet: ['Domain Expertise', 'Execution Management', 'Team Leadership'],
        currentAiUsageLevel: 'Intermediate',
        primaryGoal: (row.primaryGoal as any) || 'Upskill in Current Role',
        desiredRole: `Senior ${row.currentRole} (AI-Native)`,
        expectedTimeline: '3–6 months',
        mainChallenge: 'Needs multi-agent workflow & SOP automation capability.',
        whyNow: 'Committed via Excel bulk lead import.',
        expectedOutcome: 'Achieve AI productivity and career progression.',
        comments: `Bulk imported from Excel file ${fileName || 'Worksheet.xlsx'}.`,
        assignedSalesperson: 'Alex Rivera',
        crmStage: 'New Lead' as Stage,
        leadTemperature: fitScore > 85 ? 'Hot' : 'Warm',
        lastContacted: 'Not Contacted',
        nextFollowUp: new Date(Date.now() + 86400000).toISOString().substring(0, 10) + ' 10:00',
        numberOfCalls: 0,
        numberOfFollowUps: 0,
        paymentStatus: 'Unpaid',
        amountPaid: 0,
        enrollmentStatus: 'Not Enrolled',
        fitScore,
        intentScore,
        fitScoreBreakdown: [
          { factor: 'Domain Experience', score: fitScore, reason: `${row.yearsOfExperience} years experience as ${row.currentRole}.` }
        ],
        intentScoreBreakdown: [
          { factor: 'Excel Batch Priority', score: intentScore, reason: 'Imported via active Excel lead ingestion batch.' }
        ],
        likelyDesiredOutcome: `${row.fullName} is seeking to integrate AI execution frameworks into their role at ${row.currentCompany}.`,
        evidenceLeadProvided: [`Role: ${row.currentRole}`, `Company: ${row.currentCompany}`, `Experience: ${row.yearsOfExperience} yrs`],
        evidenceAiInterpretation: ['Needs fast-track AI preparation and custom sales outreach.'],
        recommendedPositioning: `Position ${row.programName} as a high-impact execution multiplier.`,
        recommendedOpening: `Hi ${row.fullName.split(' ')[0]}, following up on your ${row.programName} registration.`,
        discoveryQuestions: [
          `How are AI workflows currently utilized at ${row.currentCompany}?`,
          `What milestone over the next 3–6 months defines success for you?`
        ],
        existingSkills: ['Domain Expertise', 'Operations'],
        aiSkillsToDevelop: ['AI Agent Orchestration', 'SOP Engineering', 'Automated Reporting'],
        whyProgramFits: `Matches target profile for ${row.programName}.`,
        objections: [],
        recommendedNextAction: 'Review AI profile and initiate first contact call within 24 hours.',
        callNotesHistory: [],
    investment: '',
    education: '',
    priority: 'P2',
    qualificationStatus: '',
    objection: '',
    preferredBatch: '',
    preferredContactTime: '',
    paymentLink: '',
    aiRecommendation: '',
    leadScore: 50,
    leadHealthScore: 50,
    aiSummary: '',
    nextBestAction: '',
    conversionProbability: 0,
    temperature: 'Cold',
    fitScoreBreakdown: [],
    intentScoreBreakdown: [],
    likelyDesiredOutcome: '',
    recommendedPositioning: '',
    recommendedOpening: '',
    discoveryQuestions: [],

      };

      addLead(newLead);
      count++;
    });

    setIsImporting(false);
    setSuccessMessage(`Successfully imported and committed ${count} leads from Excel!`);
    setTimeout(() => {
      setSuccessMessage('');
      onClose();
    }, 1500);
  };

  const downloadSampleExcel = () => {
    const data = [
      {
        'Full Name': 'Anish Kapoor',
        'Email': 'anish.k@techcorp.in',
        'Phone': '+91 98123 45678',
        'Current Role': 'Senior Engineering Manager',
        'Current Company': 'TechCorp',
        'City': 'Bengaluru',
        'Years of Experience': 8,
        'Primary Goal': 'Switch Company',
        'Target Program': 'AI-Native Project Management'
      },
      {
        'Full Name': 'Meera Nair',
        'Email': 'meera.nair@growthscale.com',
        'Phone': '+91 97654 32109',
        'Current Role': 'Marketing Lead',
        'Current Company': 'Growth Scale Studio',
        'City': 'Mumbai',
        'Years of Experience': 6,
        'Primary Goal': 'Learn Automation',
        'Target Program': 'AI-Native GTM'
      },
      {
        'Full Name': 'Rajesh Verma',
        'Email': 'rajesh@vermaconsulting.in',
        'Phone': '+91 99112 23344',
        'Current Role': 'Founding Director',
        'Current Company': 'Verma Advisory',
        'City': 'Delhi NCR',
        'Years of Experience': 12,
        'Primary Goal': 'Start a Business',
        'Target Program': 'AI Leadership Fellowship'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
    XLSX.writeFile(workbook, 'Aivalytics_Sample_Leads_Template.xlsx');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
                Upload & Edit Excel Worksheets (.xlsx / .xls / .csv)
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Upload Microsoft Excel spreadsheets, edit lead details inline, and commit changes directly to LeadOS.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {successMessage ? (
          <div className="py-12 text-center space-y-3">
            <div className="text-5xl">🎉</div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400">{successMessage}</div>
            <p className="text-xs text-gray-500">Committed to LeadOS CRM database...</p>
          </div>
        ) : (
          <div className="space-y-4 pt-4 flex-1 flex flex-col min-h-0">
            {/* Upload Area */}
            {parsedRows.length === 0 && (
              <div className="border-2 border-dashed border-primary-300 dark:border-gray-700 rounded-2xl p-8 text-center hover:border-primary-500 bg-gray-50/50 dark:bg-gray-800/40 transition-all cursor-pointer">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv, .txt"
                  id="excel-file-input"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <label htmlFor="excel-file-input" className="cursor-pointer space-y-3 block">
                  <div className="text-5xl">📈</div>
                  <div>
                    <div className="text-base font-extrabold text-gray-800 dark:text-gray-200">
                      {fileName ? fileName : 'Click or Drag & Drop Excel Worksheet (.xlsx, .xls, .csv)'}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Supports Microsoft Excel 2007+ Worksheets (.xlsx), Legacy Excel (.xls), and CSV files.
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Editable Preview Table */}
            {parsedRows.length > 0 && (
              <div className="flex-1 flex flex-col min-h-0 space-y-2">
                <div className="flex justify-between items-center bg-primary-50 dark:bg-primary-950/40 p-3 rounded-xl border border-primary-200 dark:border-primary-800 text-xs">
                  <span className="font-bold text-primary-900 dark:text-primary-200">
                    File: <span className="underline">{fileName}</span> ({parsedRows.length} Leads Parsed)
                  </span>
                  <label htmlFor="excel-file-input" className="text-primary-600 dark:text-primary-400 font-bold underline cursor-pointer">
                    Change File
                  </label>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv, .txt"
                    id="excel-file-input"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>

                <div className="flex-1 overflow-auto border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold border-b border-gray-200 dark:border-gray-600">
                      <tr>
                        <th className="p-2.5">Full Name</th>
                        <th className="p-2.5">Phone</th>
                        <th className="p-2.5">Email</th>
                        <th className="p-2.5">Current Role</th>
                        <th className="p-2.5">Company</th>
                        <th className="p-2.5">Exp (Yrs)</th>
                        <th className="p-2.5">Target Program</th>
                        <th className="p-2.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {parsedRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.fullName}
                              onChange={(e) => handleRowChange(idx, 'fullName', e.target.value)}
                              className="w-full p-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.phone}
                              onChange={(e) => handleRowChange(idx, 'phone', e.target.value)}
                              className="w-full p-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-[11px]"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="email"
                              value={row.email}
                              onChange={(e) => handleRowChange(idx, 'email', e.target.value)}
                              className="w-full p-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.currentRole}
                              onChange={(e) => handleRowChange(idx, 'currentRole', e.target.value)}
                              className="w-full p-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.currentCompany}
                              onChange={(e) => handleRowChange(idx, 'currentCompany', e.target.value)}
                              className="w-full p-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={row.yearsOfExperience}
                              onChange={(e) => handleRowChange(idx, 'yearsOfExperience', Number(e.target.value))}
                              className="w-16 p-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-bold"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.programName}
                              onChange={(e) => handleRowChange(idx, 'programName', e.target.value)}
                              className="w-full p-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              onClick={() => handleDeleteRow(idx)}
                              className="text-red-500 hover:text-red-700 font-bold px-2 py-0.5 cursor-pointer text-xs"
                              title="Delete Row"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex justify-between items-center text-xs pt-3 border-t border-gray-200 dark:border-gray-800 shrink-0">
              <button
                type="button"
                onClick={downloadSampleExcel}
                className="text-primary-600 dark:text-primary-400 hover:underline font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <span>📥</span> Download Sample Excel Template (.xlsx)
              </button>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-bold hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={parsedRows.length === 0 || isImporting}
                  onClick={handleCommitImport}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isImporting ? '⚙️ Ingesting to LeadOS...' : `🚀 Commit & Ingest ${parsedRows.length > 0 ? parsedRows.length : ''} Leads`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
