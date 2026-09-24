// @ts-nocheck
import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function ImportCenter() {
  const { leads, addLead, bulkAddLeads } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [analyzedRows, setAnalyzedRows] = useState<any[]>([]);
  const [duplicateStrategy, setDuplicateStrategy] = useState<'skip' | 'update'>('skip');

  const systemFields = [
    { key: 'full_name', label: 'Full Name', required: true },
    { key: 'email', label: 'Email', required: true },
    { key: 'phone', label: 'Phone', required: true },
    { key: 'current_role', label: 'Current Role', required: false },
    { key: 'years_of_experience', label: 'Experience', required: false },
    { key: 'ai_usage', label: 'AI Usage', required: false },
    { key: 'primary_goal', label: 'Goal', required: false },
    { key: 'main_challenge', label: 'Blocker', required: false },
    { key: 'investment', label: 'Investment', required: false },
    { key: 'education', label: 'Education', required: false },
    { key: 'city', label: 'City', required: false },
    { key: 'created_time', label: 'Date / Created Time', required: false },
    { key: 'source', label: 'Lead Source', required: false },
  ];

  const processDuplicates = (currentMappings: Record<string, string>, currentData: any[]) => {
    try {
      const analyzed = currentData.map((row, index) => {
        let rawPhone = String(row[currentMappings['phone']] ?? '');
        if (rawPhone.endsWith('.0')) rawPhone = rawPhone.slice(0, -2);
        const normPhone = rawPhone.replace(/\D/g, '').slice(-10);
        const rawEmail = String(row[currentMappings['email']] ?? '').toLowerCase().trim();
        
        const existingLead = leads.find(l => {
          let existingPhone = l.phone ? String(l.phone).replace(/\D/g, '').slice(-10) : '';
          const phoneMatch = normPhone && normPhone.length >= 7 && existingPhone && existingPhone === normPhone;
          const emailMatch = rawEmail && l.email && l.email.toLowerCase().trim() === rawEmail;
          return Boolean(phoneMatch || emailMatch);
        });

        return {
          _index: index,
          raw: row,
          status: existingLead ? 'Existing' : 'New',
          existingId: existingLead?.id
        };
      });
      
      setAnalyzedRows(analyzed);
      setStep(2);
    } catch (err: any) {
      alert('Error during duplicate detection: ' + err.message);
    }
  };

  const handleMappingChange = (key: string, value: string) => {
    const newMappings = { ...mappings, [key]: value };
    setMappings(newMappings);
    processDuplicates(newMappings, parsedData);
  };

    const [isDragging, setIsDragging] = useState(false);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    try {
      if (selectedFile.size > 50 * 1024 * 1024) {
        alert('File exceeds 50MB limit.');
        return;
      }
      
      setFile(selectedFile);
      
      const processData = (fields: string[], data: any[]) => {
        try {
          setHeaders(fields);
          setParsedData(data);
          
          const initialMapping: Record<string, string> = {};
          const csvFields = fields.map(f => String(f).toLowerCase().trim());

          systemFields.forEach(sys => {
            const sysKey = sys.label.toLowerCase();
            const match = csvFields.find(c => {
              if (c === sysKey) return true;
              if (c.includes(sysKey)) return true;
              if (sys.key === 'full_name' && (c.includes('full name') || c.includes('name') || c.includes('first name'))) return true;
              if (sys.key === 'phone' && (c.includes('phone') || c.includes('contact') || c.includes('mobile'))) return true;
              if (sys.key === 'email' && c.includes('email')) return true;
              if (sys.key === 'current_role' && (c.includes('current role') || c.includes('role') || c.includes('designation') || c.includes('job'))) return true;
              if (sys.key === 'years_of_experience' && (c.includes('experience') || c.includes('exp') || c.includes('years'))) return true;
              if (sys.key === 'ai_usage' && (c.includes('ai usage') || c.includes('usage') || c.includes('ai'))) return true;
              if (sys.key === 'primary_goal' && c.includes('goal')) return true;
              if (sys.key === 'main_challenge' && (c.includes('blocker') || c.includes('challenge'))) return true;
              if (sys.key === 'investment' && (c.includes('investment') || c.includes('budget'))) return true;
              if (sys.key === 'education' && (c.includes('education') || c.includes('degree') || c.includes('qualification'))) return true;
              if (sys.key === 'city' && (c.includes('city') || c.includes('location'))) return true;
              if (sys.key === 'created_time' && (c.includes('date') || c.includes('filling') || c.includes('created') || c.includes('time'))) return true;
              if (sys.key === 'source' && (c.includes('source') || c.includes('campaign'))) return true;
              return false;
            });

            if (match) {
              const originalHeader = fields.find(f => String(f).toLowerCase().trim() === match);
              if (originalHeader) initialMapping[sys.key] = originalHeader;
            }
          });
          
          setMappings(initialMapping);
          processDuplicates(initialMapping, data);
        } catch (err: any) {
          alert("Error during data mapping: " + err.message);
        }
      };

      const fileName = selectedFile.name.toLowerCase();
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
            if (data.length > 0) {
              const fields = data[0] as string[];
              const rows = XLSX.utils.sheet_to_json(ws);
              processData(fields, rows);
            } else {
              alert("Excel file appears to be empty.");
            }
          } catch (err: any) {
            alert("Error parsing Excel file: " + err.message);
          }
        };
        reader.onerror = () => alert("Error reading file.");
        reader.readAsBinaryString(selectedFile);
      } else {
        Papa.parse(selectedFile, {
          header: true,
          skipEmptyLines: true,
          error: (err: any) => alert("Error parsing CSV: " + err.message),
          complete: (results) => {
            try {
              processData(results.meta.fields || [], results.data);
            } catch (err: any) {
              alert("Error processing CSV data: " + err.message);
            }
          }
        });
      }
    } catch (err: any) {
      alert("Unexpected error: " + err.message);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    let imported = 0;
    let updated = 0;
    let skipped = 0;
    const leadsToInsert = [];

    analyzedRows.forEach(row => {
      if (row.status === 'Existing') {
        if (duplicateStrategy === 'skip') {
          skipped++;
          return;
        }
        if (duplicateStrategy === 'update') {
          updated++;
          return;
        }
      }
      
      const rawDate = mappings['created_time'] ? row.raw[mappings['created_time']] : null;
      const dateCaptured = rawDate ? String(rawDate) : new Date().toISOString();

      const aiUsageRaw = String(mappings['ai_usage'] ? row.raw[mappings['ai_usage']] || 'Beginner' : 'Beginner');
      let currentAiUsageLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'None' = 'Beginner';
      if (/advanced/i.test(aiUsageRaw)) currentAiUsageLevel = 'Advanced';
      else if (/intermediate/i.test(aiUsageRaw)) currentAiUsageLevel = 'Intermediate';
      else if (/none|never|no/i.test(aiUsageRaw)) currentAiUsageLevel = 'None';

      let rawPhone = String(mappings['phone'] ? row.raw[mappings['phone']] || '' : '');
      if (rawPhone.endsWith('.0')) rawPhone = rawPhone.slice(0, -2);

      const expVal = parseInt(String(mappings['years_of_experience'] ? row.raw[mappings['years_of_experience']] || '0' : '0').replace(/\D/g, '')) || 0;

      const newLead = {
        id: `lead-import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        fullName: String(mappings['full_name'] ? row.raw[mappings['full_name']] || 'Unknown' : 'Unknown'),
        email: String(mappings['email'] ? row.raw[mappings['email']] || '' : ''),
        phone: rawPhone,
        currentRole: String(mappings['current_role'] ? row.raw[mappings['current_role']] || '' : ''),
        currentCompany: '',
        industry: '',
        yearsOfExperience: expVal,
        currentResponsibilities: '',
        currentSkillSet: [],
        currentAiUsageLevel,
        primaryGoal: String(mappings['primary_goal'] ? row.raw[mappings['primary_goal']] || '' : ''),
        desiredRole: '',
        expectedTimeline: '',
        mainChallenge: String(mappings['main_challenge'] ? row.raw[mappings['main_challenge']] || '' : ''),
        whyNow: '',
        expectedOutcome: '',
        comments: '',
        investment: String(mappings['investment'] ? row.raw[mappings['investment']] || '' : ''),
        education: String(mappings['education'] ? row.raw[mappings['education']] || '' : ''),
        city: String(mappings['city'] ? row.raw[mappings['city']] || '' : ''),
        state: '',
        country: 'India',
        source: String(mappings['source'] ? row.raw[mappings['source']] || 'File Import' : 'File Import'),
        metaCampaign: '',
        metaAdSet: '',
        metaAd: '',
        campaignId: '',
        programId: 'ai-pm' as any,
        programName: 'AI-Native Product Management',
        professionalStatus: 'Working Professional' as any,
        dateCaptured,
        crmStage: 'New Lead' as any,
        leadTemperature: 'Cold',
        priority: 'P2',
        qualificationStatus: 'Unqualified',
        leadHealthScore: 50,
        leadScore: 50,
        temperature: 'Cold' as any,
        objection: '',
        preferredBatch: '',
        preferredContactTime: '',
        paymentLink: '',
        aiRecommendation: '',
        assignedSalesperson: 'Alex Rivera',
        lastContacted: 'Not Contacted',
        nextFollowUp: new Date().toISOString(),
        numberOfCalls: 0,
        numberOfFollowUps: 0,
        paymentStatus: 'Unpaid' as any,
        amountPaid: 0,
        enrollmentStatus: 'Not Enrolled' as any,
        fitScore: 82,
        intentScore: 78,
        fitScoreBreakdown: [],
        intentScoreBreakdown: [],
        likelyDesiredOutcome: '',
        recommendedPositioning: '',
        recommendedOpening: '',
        discoveryQuestions: [],
        conversionProbability: 60,
        aiSummary: 'Imported lead awaiting initial qualification outreach.',
        nextBestAction: 'Review profile and schedule introduction call via WhatsApp or phone.',
        callNotesHistory: []
      };
      
      leadsToInsert.push(newLead as any);
      imported++;
    });

    if (bulkAddLeads && leadsToInsert.length > 0) {
      bulkAddLeads(leadsToInsert);
    } else {
      leadsToInsert.forEach(l => addLead(l));
    }
    alert(`Import Complete! Imported: ${imported}, Updated: ${updated}, Skipped: ${skipped}`);
    navigate('/pipeline');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Import Center</h1>
        <p className="text-sm text-gray-500 mt-1">Upload CSV/XLSX leads up to 50MB. We'll automatically map headers and detect duplicates.</p>
      </div>

      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        {[
          { num: 1, label: 'Upload File' },
          { num: 2, label: 'Review & Import' }
        ].map((s, idx) => (
          <div key={s.num} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s.num ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {s.num}
            </div>
            <span className={`font-semibold text-sm ${step >= s.num ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}`}>{s.label}</span>
            {idx < 1 && <div className="hidden sm:block w-32 md:w-64 h-px bg-gray-300 mx-4" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`bg-white dark:bg-gray-800 border-2 border-dashed rounded-xl text-center transition-colors ${isDragging ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-600'}`}>
          <input type="file" accept=".csv, .xlsx, .xls" onChange={handleFileUpload} className="hidden" id="file-upload" />
          <label htmlFor="file-upload" className="p-12 cursor-pointer flex flex-col items-center justify-center w-full h-full">
            <span className="text-4xl mb-4">📁</span>
            <span className="text-lg font-bold text-primary-600 hover:underline">Click to browse or drag file</span>
            <span className="text-xs text-gray-500 mt-2">Max size: 50MB (CSV, XLSX)</span>
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 space-y-6">
            <h2 className="font-bold text-lg">Map Your Columns</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {systemFields.map(sys => (
                <div key={sys.key} className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {sys.label} {sys.required && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    value={mappings[sys.key] || ''}
                    onChange={e => handleMappingChange(sys.key, e.target.value)}
                    className="p-2 border rounded-lg bg-gray-50 dark:bg-gray-900 text-sm"
                  >
                    <option value="">-- Ignore --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 space-y-6">
            <h2 className="font-bold text-lg">Import Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border">
                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Total Rows</span>
                <span className="font-black text-gray-900 dark:text-gray-100">{parsedData.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100">
                <span className="text-sm font-bold text-emerald-800 dark:text-emerald-400">New Leads</span>
                <span className="font-black text-emerald-700 dark:text-emerald-500">{analyzedRows.filter(r => r.status === 'New').length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100">
                <span className="text-sm font-bold text-amber-800 dark:text-amber-400">Duplicates</span>
                <span className="font-black text-amber-700 dark:text-amber-500">{analyzedRows.filter(r => r.status === 'Existing').length}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block">Duplicate Strategy</label>
              <select 
                value={duplicateStrategy}
                onChange={e => setDuplicateStrategy(e.target.value as any)}
                className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-900 text-sm font-bold text-primary-700"
              >
                <option value="skip">Skip Duplicates (Safe)</option>
                <option value="update">Update Empty Fields</option>
              </select>
            </div>

            <button onClick={handleImport} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition-all shadow-lg mt-4">
              1-Click Import
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
