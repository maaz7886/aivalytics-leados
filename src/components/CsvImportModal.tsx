// src/components/CsvImportModal.tsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Lead, Stage } from '../types';
import * as XLSX from 'xlsx';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetDate?: string;
}

interface ParsedLeadRow {
  fullName: string;
  email: string;
  phone: string;
  yearsOfExperience: number;
  currentAiUsage: string;
  desired6To12MonthOutcome: string;
  biggestObstacle: string;
  currentRole: string;
  currentCompany: string;
  programName: string;
}

export default function CsvImportModal({ isOpen, onClose, targetDate }: CsvImportModalProps) {
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

      const fullName = getVal(['fullname', 'full_name', 'name', 'leadname', 'candidate']) || `Meta Lead Candidate ${idx + 1}`;
      const email = getVal(['email', 'emailaddress', 'mail']) || `lead${Date.now()}_${idx}@metaads.com`;
      const phone = getVal(['phone', 'phonenumber', 'mobile', 'contact']) || '+91 90000 00000';
      
      const expStr = getVal([
        'howmanyyearsofprofessionalexperiencedoyouhave',
        'yearsofexperience',
        'years_of_experience',
        'experience',
        'exp',
        'years'
      ]);
      const yearsOfExperience = parseInt(expStr || '5', 10) || 5;

      const currentAiUsage = getVal([
        'howareyoucurrentlyusingaiinyourprofessionalwork',
        'currentaiusage',
        'ai_usage',
        'currentaiusagelevel',
        'aiusage',
        'ai'
      ]) || 'Uses ChatGPT for drafting documents & basic research';

      const desired6To12MonthOutcome = getVal([
        'ifthenext612monthsgowellprofessionallywhatoutcomewouldyoumostwant',
        'expectedoutcome',
        'desiredoutcome',
        'primarygoal',
        'goal',
        'objective'
      ]) || 'Transition into an AI-native leadership role with salary growth';

      const biggestObstacle = getVal([
        'whatisthebiggestthingstoppingyoufromreachingthatoutcometoday',
        'mainchallenge',
        'challenge',
        'obstacle',
        'barrier'
      ]) || 'Lack of structured hands-on multi-agent execution framework';

      const currentRole = getVal(['currentrole', 'role', 'title', 'designation']) || 'Working Professional';
      const currentCompany = getVal(['currentcompany', 'company', 'organization']) || 'Tech Organization';
      const programName = getVal(['targetprogram', 'program', 'programname']) || 'AI-Native Project Management';

      return {
        fullName,
        email,
        phone,
        yearsOfExperience,
        currentAiUsage,
        desired6To12MonthOutcome,
        biggestObstacle,
        currentRole,
        currentCompany,
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
      const progLower = row.programName.toLowerCase();

      const newLead: Lead = {
        id: `lead-excel-${Date.now()}-${index}`,
        fullName: row.fullName,
        phone: row.phone,
        email: row.email,
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        metaFormSubmission: {
          fullName: row.fullName,
          email: row.email,
          phone: row.phone,
          yearsOfExperience: row.yearsOfExperience,
          currentAiUsage: row.currentAiUsage,
          desired6To12MonthOutcome: row.desired6To12MonthOutcome,
          biggestObstacle: row.biggestObstacle
        },
        source: 'Meta Lead Ads / Excel Ingestion',
        metaCampaign: 'Meta_Ad_Lead_Campaign_Q3',
        metaAdSet: 'Target_Persona_Batch',
        metaAd: 'Ad_Form_Ingestion',
        campaignId: `cmp_xlsx_${Date.now()}`,
        dateCaptured: targetDate
          ? `${targetDate} ${new Date().toTimeString().substring(0, 5)}`
          : new Date().toISOString().replace('T', ' ').substring(0, 16),
        programId: progLower.includes('gtm') ? 'ai-gtm' : progLower.includes('fellowship') ? 'ai-fellowship' : 'ai-pm',
        programName: row.programName,
        professionalStatus: 'Working Professional',
        currentRole: row.currentRole || 'Working Professional',
        currentCompany: row.currentCompany || 'Tech Company',
        industry: 'Technology',
        yearsOfExperience: row.yearsOfExperience,
        currentResponsibilities: `Meta Lead Ad response: ${row.currentAiUsage}`,
        currentSkillSet: ['Domain Expertise', 'Execution Management', 'Team Leadership'],
        currentAiUsageLevel: row.currentAiUsage.toLowerCase().includes('advanced') ? 'Advanced' : row.currentAiUsage.toLowerCase().includes('beginner') ? 'Beginner' : 'Intermediate',
        primaryGoal: 'Upskill in Current Role',
        desiredRole: `Senior ${row.currentRole || 'Professional'} (AI-Native)`,
        expectedTimeline: '3–6 months',
        mainChallenge: row.biggestObstacle,
        whyNow: 'Submitted via Meta Ad Lead form.',
        expectedOutcome: row.desired6To12MonthOutcome,
        comments: `Imported Meta Ad payload. 6-12m Goal: "${row.desired6To12MonthOutcome}". Barrier: "${row.biggestObstacle}".`,
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
          { factor: 'Years of Experience', score: fitScore, reason: `${row.yearsOfExperience} years experience reported.` },
          { factor: 'AI Readiness', score: 85, reason: row.currentAiUsage }
        ],
        intentScoreBreakdown: [
          { factor: 'Clear Professional Goal', score: intentScore, reason: row.desired6To12MonthOutcome }
        ],
        likelyDesiredOutcome: row.desired6To12MonthOutcome,
        evidenceLeadProvided: [
          `Years of Experience: ${row.yearsOfExperience}`,
          `Current AI Usage: ${row.currentAiUsage}`,
          `6-12 Month Goal: ${row.desired6To12MonthOutcome}`,
          `Main Barrier: ${row.biggestObstacle}`
        ],
        evidenceAiInterpretation: [
          'High propensity for structured AI execution program.',
          'Main blocker identified; address directly during opening pitch.'
        ],
        recommendedPositioning: `Position ${row.programName} as the exact bridge to overcome: "${row.biggestObstacle}".`,
        recommendedOpening: `Hi ${row.fullName.split(' ')[0]}, following up on your response regarding ${row.desired6To12MonthOutcome}.`,
        discoveryQuestions: [
          `You mentioned "${row.biggestObstacle}" is your main barrier—how is that impacting your daily work today?`,
          `If we solve this over the next 12 weeks in ${row.programName}, what would success look like for you?`
        ],
        existingSkills: ['Domain Expertise', 'Execution'],
        aiSkillsToDevelop: ['AI Agent Orchestration', 'SOP Engineering', 'Automated Workflows'],
        whyProgramFits: `Designed specifically to solve "${row.biggestObstacle}" for professionals with ${row.yearsOfExperience}+ years experience.`,
        objections: [],
        recommendedNextAction: 'Review Meta Ad submission and initiate first contact call within 24 hours.',
        callNotesHistory: []
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
        'full_name': 'Anish Kapoor',
        'email': 'anish.k@techcorp.in',
        'phone': '+91 98123 45678',
        'how_many_years_of_professional_experience_do_you_have?': 8,
        'how_are_you_currently_using_ai_in_your_professional_work?': 'Using ChatGPT daily for user stories and email drafting',
        'if_the_next_6–12_months_go_well_professionally,_what_outcome_would_you_most_want?': 'Switch to a Senior AI-PM role with ₹30+ LPA salary',
        'what_is_the_biggest_thing_stopping_you_from_reaching_that_outcome_today?': 'Needs practical multi-agent orchestration and n8n pipeline experience'
      },
      {
        'full_name': 'Meera Nair',
        'email': 'meera.nair@growthscale.com',
        'phone': '+91 97654 32109',
        'how_many_years_of_professional_experience_do_you_have?': 6,
        'how_are_you_currently_using_ai_in_your_professional_work?': 'Experimenting with Midjourney and Claude for campaign copy',
        'if_the_next_6–12_months_go_well_professionally,_what_outcome_would_you_most_want?': 'Build an automated AI outbound engine to 3x acquisition pipeline',
        'what_is_the_biggest_thing_stopping_you_from_reaching_that_outcome_today?': 'Manual research and lack of Clay/n8n integration knowledge'
      },
      {
        'full_name': 'Rajesh Verma',
        'email': 'rajesh@vermaconsulting.in',
        'phone': '+91 99112 23344',
        'how_many_years_of_professional_experience_do_you_have?': 12,
        'how_are_you_currently_using_ai_in_your_professional_work?': 'Advising enterprise clients on executive AI transformation strategy',
        'if_the_next_6–12_months_go_well_professionally,_what_outcome_would_you_most_want?': 'Launch dedicated $50k AI advisory practice for consulting firm',
        'what_is_the_biggest_thing_stopping_you_from_reaching_that_outcome_today?': 'Needs validated enterprise AI architecture templates and peer mastermind'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Meta_Ads_Leads');
    XLSX.writeFile(workbook, 'Aivalytics_Meta_Ads_Leads_Template.xlsx');
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
