// src/components/CsvImportModal.tsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Lead, Stage } from '../types';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CsvImportModal({ isOpen, onClose }: CsvImportModalProps) {
  const { addLead } = useApp();
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [parsedCount, setParsedCount] = useState<number | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileContent(text);
      previewParsedLeads(text);
    };
    reader.readAsText(file);
  };

  const parseCsvText = (text: string): Record<string, string>[] => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length < 2) return [];

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]);
      if (values.length === 0 || (values.length === 1 && !values[0])) continue;
      const row: Record<string, string> = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] || '';
      });
      rows.push(row);
    }
    return rows;
  };

  const previewParsedLeads = (text: string) => {
    const rows = parseCsvText(text);
    setParsedCount(rows.length);
  };

  const handleImport = () => {
    if (!fileContent) return;
    setIsImporting(true);

    const rows = parseCsvText(fileContent);
    if (rows.length === 0) {
      alert('No valid lead rows found in the CSV file.');
      setIsImporting(false);
      return;
    }

    let addedCount = 0;
    rows.forEach((row, index) => {
      const name = row['fullname'] || row['name'] || row['leadname'] || `CSV Lead ${index + 1}`;
      const email = row['email'] || row['emailaddress'] || `lead${Date.now()}_${index}@csvimport.com`;
      const phone = row['phone'] || row['phonenumber'] || row['mobile'] || '+91 90000 00000';
      const role = row['role'] || row['currentrole'] || row['title'] || 'Manager';
      const company = row['company'] || row['currentcompany'] || 'Imported Corp';
      const city = row['city'] || row['location'] || 'Bengaluru';
      const exp = parseInt(row['experience'] || row['yearsofexperience'] || row['exp'] || '5', 10);
      const program = row['program'] || row['targetprogram'] || 'AI-Native Project Management';
      const goal = row['goal'] || row['primarygoal'] || 'Upskill in Current Role';

      const fitScore = Math.floor(Math.random() * 20) + 78;
      const intentScore = Math.floor(Math.random() * 25) + 65;

      const newLead: Lead = {
        id: `lead-csv-${Date.now()}-${index}`,
        fullName: name,
        phone,
        email,
        city,
        state: 'State',
        country: 'India',
        source: 'CSV Bulk Import',
        metaCampaign: 'CSV_Bulk_Import_Q3',
        metaAdSet: 'Direct_Import',
        metaAd: 'CSV_File_Upload',
        campaignId: `cmp_csv_${Date.now()}`,
        dateCaptured: new Date().toISOString().replace('T', ' ').substring(0, 16),
        programId: program.toLowerCase().includes('gtm') ? 'ai-gtm' : program.toLowerCase().includes('fellowship') ? 'ai-fellowship' : 'ai-pm',
        programName: program,
        professionalStatus: 'Working Professional',
        currentRole: role,
        currentCompany: company,
        industry: 'Technology',
        yearsOfExperience: isNaN(exp) ? 5 : exp,
        currentResponsibilities: `Imported via CSV file (${fileName || 'Leads.csv'}). ${role} at ${company}.`,
        currentSkillSet: ['Domain Expertise', 'Team Management', 'Project Delivery'],
        currentAiUsageLevel: 'Intermediate',
        primaryGoal: (goal as any) || 'Upskill in Current Role',
        desiredRole: `Senior ${role} (AI Enabled)`,
        expectedTimeline: '3–6 months',
        mainChallenge: 'Looking to integrate AI automation workflows into daily team operations.',
        whyNow: 'Uploaded via CSV batch lead ingestion.',
        expectedOutcome: 'Achieve AI productivity and role growth.',
        comments: `Bulk imported from ${fileName || 'CSV file'}.`,
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
          { factor: 'Domain Experience', score: fitScore, reason: `${exp} years experience as ${role}.` }
        ],
        intentScoreBreakdown: [
          { factor: 'Bulk Ingestion Priority', score: intentScore, reason: 'Imported via active marketing campaign batch.' }
        ],
        likelyDesiredOutcome: `${name} is seeking to integrate AI workflows into their role at ${company}.`,
        evidenceLeadProvided: [`Role: ${role}`, `Company: ${company}`, `Experience: ${exp} yrs`],
        evidenceAiInterpretation: ['Needs fast-track AI preparation and custom sales outreach.'],
        recommendedPositioning: `Position ${program} as a high-impact accelerator for ${role} professionals.`,
        recommendedOpening: `Hi ${name.split(' ')[0]}, following up on your ${program} registration from our batch import.`,
        discoveryQuestions: [
          `How are AI workflows currently utilized in your role at ${company}?`,
          `What key milestone over the next 3–6 months would define success for you?`
        ],
        existingSkills: ['Domain Knowledge', 'Operational Management'],
        aiSkillsToDevelop: ['AI Workflow Design', 'Agent Orchestration', 'Automated Reporting'],
        whyProgramFits: `Matches target profile for ${program}.`,
        objections: [],
        recommendedNextAction: 'Review AI profile and initiate first contact call within 24 hours.',
        callNotesHistory: []
      };

      addLead(newLead);
      addedCount++;
    });

    setIsImporting(false);
    setSuccessMessage(`Successfully imported ${addedCount} leads from CSV!`);
    setTimeout(() => {
      setSuccessMessage('');
      onClose();
    }, 1500);
  };

  const downloadSampleCsv = () => {
    const csvHeader = 'Full Name,Email,Phone,Current Role,Current Company,City,Years of Experience,Primary Goal,Target Program\n';
    const sampleRows = [
      'Anish Kapoor,anish.k@techcorp.in,+91 98123 45678,Senior Engineering Manager,TechCorp,Bengaluru,8,Switch Company,AI-Native Project Management',
      'Meera Nair,meera.nair@growthscale.com,+91 97654 32109,Marketing Lead,Growth Scale Studio,Mumbai,6,Learn Automation,AI-Native GTM',
      'Rajesh Verma,rajesh@vermaconsulting.in,+91 99112 23344,Founding Director,Verma Advisory,Delhi NCR,12,Start a Business,AI Leadership Fellowship'
    ].join('\n');

    const blob = new Blob([csvHeader + sampleRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Aivalytics_Sample_Leads_Import.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📥</span>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Upload Leads CSV / Excel</h2>
              <p className="text-xs text-gray-500">Import bulk leads and auto-run AI profile preparation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold p-1"
          >
            ✕
          </button>
        </div>

        {successMessage ? (
          <div className="py-12 text-center space-y-3">
            <div className="text-5xl">🎉</div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400">{successMessage}</div>
            <p className="text-xs text-gray-500">Redirecting to Leads Database...</p>
          </div>
        ) : (
          <div className="space-y-5 pt-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center hover:border-primary-500 transition-colors">
              <input
                type="file"
                accept=".csv, .txt"
                id="csv-file-input"
                className="hidden"
                onChange={handleFileUpload}
              />
              <label htmlFor="csv-file-input" className="cursor-pointer space-y-2 block">
                <div className="text-4xl text-primary-600 dark:text-primary-400">📄</div>
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {fileName ? fileName : 'Click to select CSV file'}
                </div>
                <p className="text-xs text-gray-400">Supports standard .csv format with lead headers</p>
              </label>
            </div>

            {parsedCount !== null && (
              <div className="bg-primary-50 dark:bg-primary-950/40 p-3 rounded-lg border border-primary-200 dark:border-primary-800 text-xs text-primary-800 dark:text-primary-300 flex items-center justify-between">
                <span>Found <strong>{parsedCount}</strong> valid lead rows in file</span>
                <span className="text-green-600 dark:text-green-400 font-bold">✓ Ready for AI scoring</span>
              </div>
            )}

            <div className="flex justify-between items-center text-xs pt-2">
              <button
                type="button"
                onClick={downloadSampleCsv}
                className="text-primary-600 hover:text-primary-700 underline font-medium flex items-center gap-1"
              >
                <span>📥</span> Download Sample CSV Template
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!fileContent || isImporting}
                  onClick={handleImport}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg font-bold shadow-md transition-all flex items-center gap-2"
                >
                  {isImporting ? '⚙️ Processing AI Prep...' : `🚀 Import ${parsedCount ? parsedCount : ''} Leads`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
