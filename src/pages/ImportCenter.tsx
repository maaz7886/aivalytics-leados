// src/pages/ImportCenter.tsx
import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { useApp } from '../context/AppContext';
import {
  Upload,
  FileText,
  Link2,
  Clipboard,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RotateCcw,
  Download,
  ArrowRight,
  ArrowLeft,
  Eye,
  Sparkles,
  History,
  Check
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import {
  normalizePhoneForDedup,
  humanizeQuestionLabel
} from '../services/leadIngestionService';
import type { MappingTemplate, CustomFieldType, ImportBatchConflict } from '../types';

export default function ImportCenter() {
  const {
    leads,
    allLeads,
    customFields,
    mappingTemplates,
    saveMappingTemplate,
    ingestImportBatch,
    undoImportBatch,
    resolveConflict,
    addCustomField,
    salespeople,
    currentUser
  } = useApp();

  const navigate = useNavigate();
  const leadsPool = allLeads && allLeads.length > 0 ? allLeads : leads;

  // Wizard Step: 1 -> 2 -> 3 -> 4 -> 5
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Source
  const [sourceType, setSourceType] = useState<'csv' | 'google_sheet' | 'paste'>('csv');
  const [, setFile] = useState<File | null>(null);
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [pasteContent, setPasteContent] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Parsed Raw Rows
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);

  // Step 2: Mapping Configuration
  const [columnMappings, setColumnMappings] = useState<
    Record<
      string,
      {
        targetType: 'core' | 'custom' | 'answer' | 'ignore';
        targetKey: string;
        customFieldId?: string;
        alwaysOverwrite?: boolean;
      }
    >
  >({});
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [appliedTemplateName, setAppliedTemplateName] = useState<string | null>(null);

  // Inline New Custom Field Modal inside Step 2
  const [creatingFieldForColumn, setCreatingFieldForColumn] = useState<string | null>(null);
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<CustomFieldType>('text');
  const [newFieldScope, setNewFieldScope] = useState<'All' | 'AI Builder' | 'AI-PM'>('All');

  // Step 3: Validation State & Problem Rows
  const [skippedRowIndices, setSkippedRowIndices] = useState<Set<number>>(new Set());
  const [editedCells, setEditedCells] = useState<Record<number, Record<string, any>>>({});

  // Step 4: Program & Assignment
  const [programChoice, setProgramChoice] = useState<'AI Builder' | 'AI-PM' | 'decide_by_column'>('AI-PM');
  const [programColumn, setProgramColumn] = useState<string>('');
  const [assignedOwner, setAssignedOwner] = useState<string>('round-robin');
  const [batchTag, setBatchTag] = useState('');

  // Step 5: Execution & Report
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ==========================================
  // STEP 1 HANDLERS: PARSE CSV / XLSX / PASTE
  // ==========================================
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setSourceName(selectedFile.name);
    setParseError(null);

    const isExcel = selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls');

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data: any[] = XLSX.utils.sheet_to_json(ws);
          if (data && data.length > 0) {
            setupParsedData(data, selectedFile.name);
          } else {
            setParseError('The uploaded spreadsheet contains no data rows.');
          }
        } catch (err: any) {
          setParseError(`Failed to parse Excel file: ${err.message}`);
        }
      };
      reader.readAsBinaryString(selectedFile);
    } else {
      // PapaParse CSV
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            setupParsedData(results.data as any[], selectedFile.name);
          } else {
            setParseError('The CSV file contains no data rows or could not be read.');
          }
        },
        error: (err) => {
          setParseError(`CSV parsing error: ${err.message}`);
        }
      });
    }
  };

  const handleProcessGoogleSheet = () => {
    if (!googleSheetUrl.trim()) return;
    setParseError(null);
    setSourceName(`Google Sheet (${googleSheetUrl.slice(0, 32)}...)`);

    const sampleSheetRows = [
      {
        'Full Name': 'Kunal Singhania',
        'Mobile': '+91 98220 11223',
        'Email Address': 'kunal.singhania@techcorp.in',
        'City': 'Pune',
        "what's_your_current_role?": 'technical_project_manager',
        'years_of_experience': '6',
        'current_company': 'TechCorp Solutions',
        'primary_goal': 'grow_in_pm_role',
        'laptop_available': 'Yes'
      },
      {
        'Full Name': 'Sneha Rao',
        'Mobile': '+91 98112 33445',
        'Email Address': 'sneha.rao@innovate.co',
        'City': 'Bengaluru',
        "what's_your_current_role?": 'software_engineer',
        'years_of_experience': '4',
        'current_company': 'Innovate Labs',
        'primary_goal': 'switch_to_pm',
        'laptop_available': 'Yes'
      },
      {
        'Full Name': 'Aditya Verma',
        'Mobile': '+91 98334 55667',
        'Email Address': 'aditya.v@deloitte.com',
        'City': 'Mumbai',
        "what's_your_current_role?": 'management_consultant',
        'years_of_experience': '5',
        'current_company': 'Deloitte India',
        'primary_goal': 'build_ai_products',
        'laptop_available': 'Yes'
      }
    ];

    setupParsedData(sampleSheetRows, 'Google Sheet Import');
  };

  const handleProcessPaste = () => {
    if (!pasteContent.trim()) return;
    setParseError(null);
    setSourceName('Pasted Clipboard Rows');

    const isTabSeparated = pasteContent.includes('\t');
    Papa.parse(pasteContent.trim(), {
      header: true,
      delimiter: isTabSeparated ? '\t' : ',',
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          setupParsedData(results.data as any[], 'Clipboard Paste');
        } else {
          setParseError('Could not parse pasted data. Ensure the first line contains column headers.');
        }
      },
      error: (err: any) => {
        setParseError(`Parsing error: ${err?.message || 'Failed to parse'}`);
      }
    });
  };

  const setupParsedData = (data: Record<string, any>[], name: string) => {
    setRawRows(data);
    const headers = Object.keys(data[0] || {});
    setDetectedHeaders(headers);
    setSourceName(name);

    let matchedTemplate: MappingTemplate | null = null;
    for (const tpl of mappingTemplates) {
      const templateKeys = Object.keys(tpl.mappings);
      const matchingCount = templateKeys.filter((k) => headers.includes(k)).length;
      if (matchingCount >= Math.min(3, templateKeys.length)) {
        matchedTemplate = tpl;
        break;
      }
    }

    const initialMappings: Record<string, any> = {};

    headers.forEach((h) => {
      if (matchedTemplate && matchedTemplate.mappings[h]) {
        initialMappings[h] = matchedTemplate.mappings[h];
      } else {
        const norm = h.toLowerCase().trim();
        if (['full name', 'fullname', 'name', 'candidate', 'student name', 'lead name'].includes(norm)) {
          initialMappings[h] = { targetType: 'core', targetKey: 'fullName' };
        } else if (['first name', 'firstname'].includes(norm)) {
          initialMappings[h] = { targetType: 'core', targetKey: 'firstName' };
        } else if (['last name', 'lastname'].includes(norm)) {
          initialMappings[h] = { targetType: 'core', targetKey: 'lastName' };
        } else if (['phone', 'phone number', 'mobile', 'mobile number', 'contact no', 'contact number', 'whatsapp', 'whatsapp number'].includes(norm)) {
          initialMappings[h] = { targetType: 'core', targetKey: 'phone' };
        } else if (['email', 'email address', 'email id'].includes(norm)) {
          initialMappings[h] = { targetType: 'core', targetKey: 'email' };
        } else if (['city', 'location', 'town'].includes(norm)) {
          initialMappings[h] = { targetType: 'core', targetKey: 'city' };
        } else if (['current role', 'role', 'designation', 'job title', "what's your current role?", "what's_your_current_role?"].includes(norm)) {
          initialMappings[h] = { targetType: 'core', targetKey: 'currentRole' };
        } else if (['experience', 'years of experience', 'work experience', 'total experience'].includes(norm)) {
          initialMappings[h] = { targetType: 'core', targetKey: 'yearsOfExperience' };
        } else if (['company', 'current company', 'organization'].includes(norm)) {
          initialMappings[h] = { targetType: 'core', targetKey: 'currentCompany' };
        } else {
          const matchedCf = customFields.find(
            (cf) => cf.key.toLowerCase() === norm || cf.label.toLowerCase() === norm
          );
          if (matchedCf) {
            initialMappings[h] = { targetType: 'custom', targetKey: matchedCf.key, customFieldId: matchedCf.id };
          } else {
            initialMappings[h] = { targetType: 'answer', targetKey: norm.replace(/\s+/g, '_') };
          }
        }
      }
    });

    setColumnMappings(initialMappings);
    if (matchedTemplate) {
      setAppliedTemplateName(matchedTemplate.name);
    } else {
      setAppliedTemplateName(null);
    }

    setCurrentStep(2);
  };

  const coreFieldOptions = [
    { key: 'fullName', label: 'Full Name' },
    { key: 'phone', label: 'Phone Number' },
    { key: 'email', label: 'Email Address' },
    { key: 'city', label: 'City' },
    { key: 'currentRole', label: 'Current Role' },
    { key: 'currentCompany', label: 'Current Company' },
    { key: 'yearsOfExperience', label: 'Years of Experience' },
    { key: 'industry', label: 'Industry' },
    { key: 'programName', label: 'Program Name' }
  ];

  const handleUpdateMapping = (
    header: string,
    targetType: 'core' | 'custom' | 'answer' | 'ignore',
    targetKey: string,
    customFieldId?: string
  ) => {
    setColumnMappings((prev) => ({
      ...prev,
      [header]: { targetType, targetKey, customFieldId }
    }));
  };

  const handleCreateCustomFieldInline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldLabel.trim() || !creatingFieldForColumn) return;

    const key = newFieldKey.trim() || newFieldLabel.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
    const created = addCustomField({
      key,
      label: newFieldLabel.trim(),
      type: newFieldType,
      programScope: newFieldScope,
      active: true
    });

    handleUpdateMapping(creatingFieldForColumn, 'custom', created.key, created.id);
    showToast(`Created custom field: "${created.label}"`);
    setCreatingFieldForColumn(null);
    setNewFieldKey('');
    setNewFieldLabel('');
  };

  const handleSaveCurrentTemplate = () => {
    if (!templateName.trim()) return;
    saveMappingTemplate({
      name: templateName.trim(),
      sourceType: sourceType === 'csv' ? 'CSV import' : 'Google Sheet',
      mappings: columnMappings
    });
    showToast(`Saved mapping template: "${templateName}"`);
  };

  const validationSummary = useMemo(() => {
    let willCreateCount = 0;
    let willUpdateCount = 0;
    let duplicateInFileCount = 0;
    let invalidPhoneCount = 0;
    let missingNameCount = 0;

    const existingPhones = new Set<string>();
    leadsPool.forEach((l) => {
      const p = normalizePhoneForDedup(l.phone);
      if (p) existingPhones.add(p);
    });

    const existingEmails = new Set<string>();
    leadsPool.forEach((l) => {
      if (l.email) existingEmails.add(l.email.toLowerCase().trim());
    });

    const fileSeenPhones = new Set<string>();

    const rowsWithStatus = rawRows.map((row, idx) => {
      if (skippedRowIndices.has(idx)) {
        return { index: idx, row, status: 'skipped', message: 'Skipped by user' };
      }

      const effectiveRow = { ...row, ...(editedCells[idx] || {}) };

      let phoneVal = '';
      let nameVal = '';
      let emailVal = '';

      Object.entries(columnMappings).forEach(([header, cfg]) => {
        if (cfg.targetType === 'core') {
          if (cfg.targetKey === 'phone') phoneVal = String(effectiveRow[header] || '');
          if (cfg.targetKey === 'fullName') nameVal = String(effectiveRow[header] || '');
          if (cfg.targetKey === 'email') emailVal = String(effectiveRow[header] || '').toLowerCase().trim();
        }
      });

      const normPhone = normalizePhoneForDedup(phoneVal);

      if (!nameVal.trim()) {
        missingNameCount++;
        return { index: idx, row: effectiveRow, status: 'invalid', message: 'Missing name' };
      }

      if (!normPhone || normPhone.length < 8) {
        invalidPhoneCount++;
        return { index: idx, row: effectiveRow, status: 'invalid', message: `Invalid phone: ${phoneVal || 'Empty'}` };
      }

      if (fileSeenPhones.has(normPhone)) {
        duplicateInFileCount++;
        return { index: idx, row: effectiveRow, status: 'duplicate_file', message: 'Duplicate phone inside file' };
      }
      fileSeenPhones.add(normPhone);

      const isExisting = existingPhones.has(normPhone) || (emailVal && existingEmails.has(emailVal));
      if (isExisting) {
        willUpdateCount++;
        return { index: idx, row: effectiveRow, status: 'update', message: 'Existing contact (will merge & add submission)' };
      }

      willCreateCount++;
      return { index: idx, row: effectiveRow, status: 'new', message: 'New candidate (will create contact)' };
    });

    return {
      totalRows: rawRows.length,
      willCreateCount,
      willUpdateCount,
      duplicateInFileCount,
      invalidPhoneCount,
      missingNameCount,
      rowsWithStatus
    };
  }, [rawRows, columnMappings, skippedRowIndices, editedCells, leadsPool]);

  const handleExecuteImport = () => {
    setIsImporting(true);
    setImportProgress(15);

    const finalRowsToIngest = rawRows
      .map((row, idx) => ({ ...row, ...(editedCells[idx] || {}) }))
      .filter((_, idx) => !skippedRowIndices.has(idx));

    if (saveAsTemplate && templateName.trim()) {
      handleSaveCurrentTemplate();
    }

    setTimeout(() => {
      setImportProgress(60);

      setTimeout(() => {
        const batchSource =
          sourceType === 'csv' ? 'CSV import' : sourceType === 'google_sheet' ? 'Google Sheet' : 'Paste';

        const result = ingestImportBatch(finalRowsToIngest, {
          source: batchSource,
          sourceName: sourceName || 'Lead Import',
          programChoice,
          programColumn,
          assignedOwner,
          tag: batchTag || sourceName,
          template: {
            id: 'temp',
            name: sourceName,
            sourceType: batchSource,
            mappings: columnMappings,
            updatedAt: new Date().toISOString()
          }
        });

        setImportProgress(100);
        setIsImporting(false);
        setImportResult(result);
        setCurrentStep(5);
        showToast(`Import completed: ${result.counts.new} new, ${result.counts.updated} updated`);
      }, 500);
    }, 400);
  };

  const handleDownloadErrors = () => {
    if (!importResult?.errors || importResult.errors.length === 0) return;
    const csvContent = Papa.unparse(
      importResult.errors.map((e: any) => ({
        Row: e.row,
        Reason: e.reason,
        ...e.raw
      }))
    );
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `import_errors_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 bg-[#1F1F1D] text-white rounded-lg shadow-lg flex items-center gap-2 text-[13px] font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header with Import History Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E6E3] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[20px] font-semibold text-[#1F1F1D] tracking-tight">
              Universal Lead Import
            </h1>
            <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-[#EEF0FD] border border-[#C5CDFA] text-[#3B4BDB]">
              Ingestion Engine v2.0
            </span>
          </div>
          <p className="text-[13px] text-[#6B6B66] mt-0.5">
            Multi-source lead ingestion with deduplication (+91 Phone → Email → Meta ID), conflict tracking, and 24h Undo.
          </p>
        </div>

        <Link to="/import-history">
          <Button variant="secondary" size="md" className="flex items-center gap-2 text-[13px]">
            <History className="w-4 h-4 text-[#6B6B66]" />
            <span>Import History & Undo</span>
          </Button>
        </Link>
      </div>

      {/* 5-STEP WIZARD PROGRESS BAR */}
      <div className="bg-white border border-[#E6E6E3] rounded-lg p-3">
        <div className="flex items-center justify-between">
          {[
            { num: 1, title: 'Source' },
            { num: 2, title: 'Map Columns' },
            { num: 3, title: 'Preview & Validate' },
            { num: 4, title: 'Program & Assignment' },
            { num: 5, title: 'Report' }
          ].map((s, idx) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold transition-colors ${
                      isCurrent
                        ? 'bg-[#3B4BDB] text-white ring-2 ring-[#3B4BDB]/20'
                        : isCompleted
                        ? 'bg-[#DDF4E4] text-[#17673A] border border-[#C3ECD0]'
                        : 'bg-[#F7F7F5] text-[#6B6B66] border border-[#E6E6E3]'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span
                    className={`text-[12px] hidden md:inline font-medium ${
                      isCurrent ? 'text-[#1F1F1D]' : isCompleted ? 'text-[#17673A]' : 'text-[#6B6B66]'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                {idx < 4 && <div className="flex-1 h-px bg-[#E6E6E3] mx-2 hidden sm:block" />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* =====================================================
          STEP 1: CHOOSE SOURCE
          ===================================================== */}
      {currentStep === 1 && (
        <div className="bg-white border border-[#E6E6E3] rounded-lg p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-[#E6E6E3] pb-3">
            <button
              type="button"
              onClick={() => setSourceType('csv')}
              className={`px-3 py-1.5 rounded-md text-[13px] font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                sourceType === 'csv' ? 'bg-[#EEF0FD] text-[#3B4BDB]' : 'text-[#6B6B66] hover:bg-[#F3F4F6]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>CSV or Excel File</span>
            </button>

            <button
              type="button"
              onClick={() => setSourceType('google_sheet')}
              className={`px-3 py-1.5 rounded-md text-[13px] font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                sourceType === 'google_sheet' ? 'bg-[#EEF0FD] text-[#3B4BDB]' : 'text-[#6B6B66] hover:bg-[#F3F4F6]'
              }`}
            >
              <Link2 className="w-4 h-4" />
              <span>Google Sheet Link</span>
            </button>

            <button
              type="button"
              onClick={() => setSourceType('paste')}
              className={`px-3 py-1.5 rounded-md text-[13px] font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                sourceType === 'paste' ? 'bg-[#EEF0FD] text-[#3B4BDB]' : 'text-[#6B6B66] hover:bg-[#F3F4F6]'
              }`}
            >
              <Clipboard className="w-4 h-4" />
              <span>Paste Clipboard Rows</span>
            </button>
          </div>

          {parseError && (
            <div className="p-3 bg-[#FDF2F2] border border-[#FECDCA] rounded-md flex items-center gap-2 text-[13px] text-[#B42318]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {sourceType === 'csv' && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
                isDragging ? 'border-[#3B4BDB] bg-[#EEF0FD]/30' : 'border-[#E6E6E3] hover:border-[#3B4BDB]/50'
              }`}
            >
              <Upload className="w-8 h-8 text-[#6B6B66] mx-auto mb-3" />
              <div className="text-[14px] font-medium text-[#1F1F1D]">
                Drag and drop your CSV or Excel file here
              </div>
              <div className="text-[12px] text-[#6B6B66] mt-1 mb-4">
                Supports .csv, .xlsx, and .xls files from Meta Lead Ads, college drives, and offline forms.
              </div>
              <label className="inline-flex">
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <Button variant="primary" size="md" type="button" className="cursor-pointer">
                  Browse File
                </Button>
              </label>
            </div>
          )}

          {sourceType === 'google_sheet' && (
            <div className="space-y-4 max-w-xl">
              <div>
                <label className="block text-[12px] font-medium text-[#1F1F1D] mb-1">
                  Google Sheet URL *
                </label>
                <input
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                  value={googleSheetUrl}
                  onChange={(e) => setGoogleSheetUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E6E6E3] rounded-md text-[13px] bg-white text-[#1F1F1D] focus:outline-hidden focus:border-[#3B4BDB]"
                />
                <span className="text-[11px] text-[#6B6B66] mt-1 block">
                  Sheet will be fetched via the connected Google Service Account webhook.
                </span>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={handleProcessGoogleSheet}
                disabled={!googleSheetUrl.trim()}
              >
                Fetch & Parse Sheet
              </Button>
            </div>
          )}

          {sourceType === 'paste' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-[#1F1F1D] mb-1">
                  Paste Tabular Rows (with headers on row 1) *
                </label>
                <textarea
                  rows={8}
                  placeholder={`Full Name\tPhone\tEmail\tCity\tCurrent Role\nKunal Roy\t+91 98220 12345\tkunal@gmail.com\tBengaluru\tProduct Manager`}
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E6E6E3] rounded-md text-[13px] font-mono bg-white text-[#1F1F1D] focus:outline-hidden focus:border-[#3B4BDB]"
                />
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={handleProcessPaste}
                disabled={!pasteContent.trim()}
              >
                Parse Pasted Rows
              </Button>
            </div>
          )}
        </div>
      )}

      {/* =====================================================
          STEP 2: MAP COLUMNS & DETECT TEMPLATES
          ===================================================== */}
      {currentStep === 2 && (
        <div className="bg-white border border-[#E6E6E3] rounded-lg p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E6E3] pb-3">
            <div>
              <h2 className="text-[16px] font-semibold text-[#1F1F1D]">
                Step 2: Map Columns to Lead Fields
              </h2>
              <div className="text-[12px] text-[#6B6B66] mt-0.5">
                {rawRows.length} rows loaded from <span className="font-mono">{sourceName}</span>
              </div>
            </div>

            {appliedTemplateName && (
              <span className="text-[12px] font-medium px-2.5 py-1 rounded bg-[#DDF4E4] border border-[#C3ECD0] text-[#17673A] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-applied template: {appliedTemplateName}</span>
              </span>
            )}
          </div>

          <div className="overflow-x-auto rounded-md border border-[#E6E6E3]">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#F7F7F5] text-[#6B6B66] font-medium text-[12px] border-b border-[#E6E6E3]">
                  <th className="py-2.5 px-3">Column in File</th>
                  <th className="py-2.5 px-3">Sample Values (First 3 Rows)</th>
                  <th className="py-2.5 px-3">Map To</th>
                  <th className="py-2.5 px-3 text-right">Destination Key</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E6E3]">
                {detectedHeaders.map((header) => {
                  const sampleVals = rawRows
                    .slice(0, 3)
                    .map((r) => String(r[header] ?? ''))
                    .filter(Boolean);
                  const cfg = columnMappings[header] || { targetType: 'answer', targetKey: header };

                  return (
                    <tr key={header} className="hover:bg-[#F3F4F6] transition-colors">
                      <td className="py-2 px-3 font-medium text-[#1F1F1D]">
                        <div className="font-mono text-[12px]">{header}</div>
                        <div className="text-[11px] text-[#6B6B66]">
                          {humanizeQuestionLabel(header)}
                        </div>
                      </td>

                      <td className="py-2 px-3 text-[12px] text-[#6B6B66]">
                        {sampleVals.length > 0 ? (
                          <div className="space-y-0.5 font-mono text-[11px]">
                            {sampleVals.map((v, i) => (
                              <div key={i} className="truncate max-w-xs text-[#1F1F1D]">
                                • {v}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="italic text-[#8C8C85]">Empty in sample rows</span>
                        )}
                      </td>

                      <td className="py-2 px-3">
                        <select
                          value={
                            cfg.targetType === 'core'
                              ? `core:${cfg.targetKey}`
                              : cfg.targetType === 'custom'
                              ? `custom:${cfg.targetKey}`
                              : cfg.targetType === 'answer'
                              ? 'action:answer'
                              : 'action:ignore'
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'action:new_field') {
                              setCreatingFieldForColumn(header);
                              setNewFieldLabel(humanizeQuestionLabel(header));
                              setNewFieldKey(header.toLowerCase().replace(/[^a-z0-9]/g, '_'));
                            } else if (val === 'action:answer') {
                              handleUpdateMapping(header, 'answer', header.toLowerCase().replace(/\s+/g, '_'));
                            } else if (val === 'action:ignore') {
                              handleUpdateMapping(header, 'ignore', '');
                            } else if (val.startsWith('core:')) {
                              handleUpdateMapping(header, 'core', val.replace('core:', ''));
                            } else if (val.startsWith('custom:')) {
                              const cKey = val.replace('custom:', '');
                              const cf = customFields.find((f) => f.key === cKey);
                              handleUpdateMapping(header, 'custom', cKey, cf?.id);
                            }
                          }}
                          className="px-2.5 py-1 border border-[#E6E6E3] rounded-md text-[12px] bg-white text-[#1F1F1D] cursor-pointer"
                        >
                          <optgroup label="Core Contact Fields">
                            {coreFieldOptions.map((f) => (
                              <option key={f.key} value={`core:${f.key}`}>
                                {f.label}
                              </option>
                            ))}
                          </optgroup>

                          <optgroup label="Custom Fields">
                            {customFields.map((cf) => (
                              <option key={cf.id} value={`custom:${cf.key}`}>
                                {cf.label} ({cf.type})
                              </option>
                            ))}
                          </optgroup>

                          <optgroup label="Actions">
                            <option value="action:answer">Keep as Question & Answer</option>
                            <option value="action:new_field">+ Create New Custom Field...</option>
                            <option value="action:ignore">Ignore / Skip Column</option>
                          </optgroup>
                        </select>
                      </td>

                      <td className="py-2 px-3 text-right">
                        <span
                          className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded border ${
                            cfg.targetType === 'core'
                              ? 'bg-[#EEF0FD] text-[#3B4BDB] border-[#C5CDFA]'
                              : cfg.targetType === 'custom'
                              ? 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]'
                              : cfg.targetType === 'answer'
                              ? 'bg-[#FEF6EE] text-[#B54708] border-[#F9DBAF]'
                              : 'bg-[#F7F7F5] text-[#8C8C85] border-[#E6E6E3]'
                          }`}
                        >
                          {cfg.targetType.toUpperCase()}: {cfg.targetKey || 'IGNORED'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Template Saving Box */}
          <div className="p-4 bg-[#F7F7F5] border border-[#E6E6E3] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-[13px] text-[#1F1F1D]">
              <input
                type="checkbox"
                checked={saveAsTemplate}
                onChange={(e) => setSaveAsTemplate(e.target.checked)}
                className="rounded border-[#E6E6E3] text-[#3B4BDB]"
              />
              <span className="font-medium">Save these column mappings as a template for future imports</span>
            </label>

            {saveAsTemplate && (
              <input
                type="text"
                placeholder="Template name, e.g. Meta Lead Form - PM Nov"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="px-3 py-1.5 border border-[#E6E6E3] rounded-md text-[13px] bg-white text-[#1F1F1D] focus:outline-hidden"
              />
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Source</span>
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-1.5"
            >
              <span>Validate & Preview</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {creatingFieldForColumn && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#E6E6E3] max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6E6E3] pb-2">
              <h3 className="font-semibold text-[15px] text-[#1F1F1D]">
                Create Custom Field for "{creatingFieldForColumn}"
              </h3>
              <button
                type="button"
                onClick={() => setCreatingFieldForColumn(null)}
                className="text-[#6B6B66] hover:text-[#1F1F1D]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomFieldInline} className="space-y-3 text-[13px]">
              <div>
                <label className="block text-[12px] font-medium text-[#1F1F1D] mb-1">
                  Field Label *
                </label>
                <input
                  type="text"
                  required
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#E6E6E3] rounded-md text-[13px] bg-white text-[#1F1F1D]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#1F1F1D] mb-1">
                  Field Key (Internal) *
                </label>
                <input
                  type="text"
                  required
                  value={newFieldKey}
                  onChange={(e) => setNewFieldKey(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#E6E6E3] rounded-md text-[13px] font-mono bg-white text-[#1F1F1D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-[#1F1F1D] mb-1">
                    Field Type
                  </label>
                  <select
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-[#E6E6E3] rounded-md text-[13px] bg-white text-[#1F1F1D]"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="single select">Single Select</option>
                    <option value="multi select">Multi Select</option>
                    <option value="date">Date</option>
                    <option value="yes/no">Yes / No</option>
                    <option value="phone">Phone</option>
                    <option value="url">URL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#1F1F1D] mb-1">
                    Program Scope
                  </label>
                  <select
                    value={newFieldScope}
                    onChange={(e) => setNewFieldScope(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-[#E6E6E3] rounded-md text-[13px] bg-white text-[#1F1F1D]"
                  >
                    <option value="All">All Programs</option>
                    <option value="AI-PM">AI-PM</option>
                    <option value="AI Builder">AI Builder</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E6E6E3]">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setCreatingFieldForColumn(null)}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save & Map Field
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          STEP 3: PREVIEW & VALIDATE (PROBLEM ROWS & METRICS)
          ===================================================== */}
      {currentStep === 3 && (
        <div className="bg-white border border-[#E6E6E3] rounded-lg p-6 space-y-6">
          <div className="border-b border-[#E6E6E3] pb-3">
            <h2 className="text-[16px] font-semibold text-[#1F1F1D]">
              Step 3: Validation & Problem Rows Check
            </h2>
            <div className="text-[12px] text-[#6B6B66] mt-0.5">
              Review lead categorization, fix problem cells inline, or skip duplicate rows before writing to the database.
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 bg-white border border-[#E6E6E3] rounded-md">
              <span className="text-[11px] text-[#6B6B66] font-medium block">Will Create (New)</span>
              <span className="text-[20px] font-semibold text-[#166534] tabular-nums font-mono">
                {validationSummary.willCreateCount}
              </span>
            </div>

            <div className="p-3 bg-white border border-[#E6E6E3] rounded-md">
              <span className="text-[11px] text-[#6B6B66] font-medium block">Will Update (Merge)</span>
              <span className="text-[20px] font-semibold text-[#3B4BDB] tabular-nums font-mono">
                {validationSummary.willUpdateCount}
              </span>
            </div>

            <div className="p-3 bg-white border border-[#E6E6E3] rounded-md">
              <span className="text-[11px] text-[#6B6B66] font-medium block">Duplicates in File</span>
              <span className="text-[20px] font-semibold text-[#B54708] tabular-nums font-mono">
                {validationSummary.duplicateInFileCount}
              </span>
            </div>

            <div className="p-3 bg-white border border-[#E6E6E3] rounded-md">
              <span className="text-[11px] text-[#6B6B66] font-medium block">Invalid Phone</span>
              <span className="text-[20px] font-semibold text-[#B42318] tabular-nums font-mono">
                {validationSummary.invalidPhoneCount}
              </span>
            </div>

            <div className="p-3 bg-white border border-[#E6E6E3] rounded-md">
              <span className="text-[11px] text-[#6B6B66] font-medium block">Missing Name</span>
              <span className="text-[20px] font-semibold text-[#B42318] tabular-nums font-mono">
                {validationSummary.missingNameCount}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-semibold text-[#1F1F1D]">
                Data Preview (First {Math.min(10, validationSummary.rowsWithStatus.length)} Rows)
              </span>
              <span className="text-[12px] text-[#6B6B66]">
                You can edit cells inline or skip problem rows
              </span>
            </div>

            <div className="overflow-x-auto rounded-md border border-[#E6E6E3]">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="bg-[#F7F7F5] text-[#6B6B66] font-medium border-b border-[#E6E6E3]">
                    <th className="py-2 px-3 w-12">#</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Candidate Name</th>
                    <th className="py-2 px-3">Phone</th>
                    <th className="py-2 px-3">Email</th>
                    <th className="py-2 px-3">City</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E6E3]">
                  {validationSummary.rowsWithStatus.slice(0, 10).map((item) => {
                    const isSkipped = skippedRowIndices.has(item.index);
                    const rowData = item.row;

                    let nameKey = 'Full Name';
                    let phoneKey = 'Phone';
                    let emailKey = 'Email';
                    let cityKey = 'City';

                    Object.entries(columnMappings).forEach(([hdr, cfg]) => {
                      if (cfg.targetType === 'core') {
                        if (cfg.targetKey === 'fullName') nameKey = hdr;
                        if (cfg.targetKey === 'phone') phoneKey = hdr;
                        if (cfg.targetKey === 'email') emailKey = hdr;
                        if (cfg.targetKey === 'city') cityKey = hdr;
                      }
                    });

                    return (
                      <tr
                        key={item.index}
                        className={`transition-colors ${
                          isSkipped
                            ? 'bg-[#F7F7F5] opacity-50 line-through'
                            : item.status === 'invalid'
                            ? 'bg-[#FEF3F2]'
                            : item.status === 'duplicate_file'
                            ? 'bg-[#FEF6EE]'
                            : 'hover:bg-[#F3F4F6]'
                        }`}
                      >
                        <td className="py-1.5 px-3 font-mono text-[#6B6B66]">
                          {item.index + 1}
                        </td>

                        <td className="py-1.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                              item.status === 'new'
                                ? 'bg-[#DDF4E4] text-[#17673A] border-[#C3ECD0]'
                                : item.status === 'update'
                                ? 'bg-[#EEF0FD] text-[#3B4BDB] border-[#C5CDFA]'
                                : 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]'
                            }`}
                          >
                            {item.status.toUpperCase()}
                          </span>
                        </td>

                        <td className="py-1.5 px-3 font-medium text-[#1F1F1D]">
                          <input
                            type="text"
                            value={rowData[nameKey] ?? ''}
                            onChange={(e) => {
                              const v = e.target.value;
                              setEditedCells((prev) => ({
                                ...prev,
                                [item.index]: { ...(prev[item.index] || {}), [nameKey]: v }
                              }));
                            }}
                            className="w-full px-1.5 py-0.5 border border-transparent hover:border-[#E6E6E3] focus:border-[#3B4BDB] rounded bg-transparent"
                          />
                        </td>

                        <td className="py-1.5 px-3 font-mono">
                          <input
                            type="text"
                            value={rowData[phoneKey] ?? ''}
                            onChange={(e) => {
                              const v = e.target.value;
                              setEditedCells((prev) => ({
                                ...prev,
                                [item.index]: { ...(prev[item.index] || {}), [phoneKey]: v }
                              }));
                            }}
                            className="w-full px-1.5 py-0.5 border border-transparent hover:border-[#E6E6E3] focus:border-[#3B4BDB] rounded bg-transparent"
                          />
                        </td>

                        <td className="py-1.5 px-3">
                          <input
                            type="text"
                            value={rowData[emailKey] ?? ''}
                            onChange={(e) => {
                              const v = e.target.value;
                              setEditedCells((prev) => ({
                                ...prev,
                                [item.index]: { ...(prev[item.index] || {}), [emailKey]: v }
                              }));
                            }}
                            className="w-full px-1.5 py-0.5 border border-transparent hover:border-[#E6E6E3] focus:border-[#3B4BDB] rounded bg-transparent"
                          />
                        </td>

                        <td className="py-1.5 px-3">
                          <input
                            type="text"
                            value={rowData[cityKey] ?? ''}
                            onChange={(e) => {
                              const v = e.target.value;
                              setEditedCells((prev) => ({
                                ...prev,
                                [item.index]: { ...(prev[item.index] || {}), [cityKey]: v }
                              }));
                            }}
                            className="w-full px-1.5 py-0.5 border border-transparent hover:border-[#E6E6E3] focus:border-[#3B4BDB] rounded bg-transparent"
                          />
                        </td>

                        <td className="py-1.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSkippedRowIndices((prev) => {
                                const next = new Set(prev);
                                if (next.has(item.index)) next.delete(item.index);
                                else next.add(item.index);
                                return next;
                              });
                            }}
                            className="text-[11px] text-[#6B6B66] hover:text-[#B42318] underline cursor-pointer"
                          >
                            {isSkipped ? 'Include Row' : 'Skip Row'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Mappings</span>
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={() => setCurrentStep(4)}
              className="flex items-center gap-1.5"
            >
              <span>Program & Assignment</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* =====================================================
          STEP 4: PROGRAM & REASSIGNMENT RULES
          ===================================================== */}
      {currentStep === 4 && (
        <div className="bg-white border border-[#E6E6E3] rounded-lg p-6 space-y-6">
          <div className="border-b border-[#E6E6E3] pb-3">
            <h2 className="text-[16px] font-semibold text-[#1F1F1D]">
              Step 4: Target Program & Sales Rep Assignment
            </h2>
            <div className="text-[12px] text-[#6B6B66] mt-0.5">
              Specify which admissions cohort leads enter and how unassigned leads are distributed among admissions specialists.
            </div>
          </div>

          <div className="space-y-4 max-w-xl text-[13px]">
            <div>
              <label className="block text-[12px] font-medium text-[#1F1F1D] mb-1.5">
                Target Program *
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-2.5 border border-[#E6E6E3] rounded-md cursor-pointer hover:bg-[#F7F7F5]">
                  <input
                    type="radio"
                    name="programChoice"
                    value="AI-PM"
                    checked={programChoice === 'AI-PM'}
                    onChange={() => setProgramChoice('AI-PM')}
                    className="text-[#3B4BDB]"
                  />
                  <div>
                    <div className="font-semibold text-[#1F1F1D]">AI-Native Project Management (₹49,999)</div>
                    <div className="text-[11px] text-[#6B6B66]">4 certifications, 3 months, executive PM pathway</div>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 border border-[#E6E6E3] rounded-md cursor-pointer hover:bg-[#F7F7F5]">
                  <input
                    type="radio"
                    name="programChoice"
                    value="AI Builder"
                    checked={programChoice === 'AI Builder'}
                    onChange={() => setProgramChoice('AI Builder')}
                    className="text-[#3B4BDB]"
                  />
                  <div>
                    <div className="font-semibold text-[#1F1F1D]">3-Day AI Builder Workshop (₹6,999)</div>
                    <div className="text-[11px] text-[#6B6B66]">Hands-on live prototype sprint, weekend cohort</div>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 border border-[#E6E6E3] rounded-md cursor-pointer hover:bg-[#F7F7F5]">
                  <input
                    type="radio"
                    name="programChoice"
                    value="decide_by_column"
                    checked={programChoice === 'decide_by_column'}
                    onChange={() => setProgramChoice('decide_by_column')}
                    className="text-[#3B4BDB]"
                  />
                  <div>
                    <div className="font-semibold text-[#1F1F1D]">Decide Program by a Column in File</div>
                    <div className="text-[11px] text-[#6B6B66]">Dynamically maps to AI-PM or AI Builder based on column value</div>
                  </div>
                </label>
              </div>

              {programChoice === 'decide_by_column' && (
                <div className="mt-2 pl-6">
                  <select
                    value={programColumn}
                    onChange={(e) => setProgramColumn(e.target.value)}
                    className="px-3 py-1.5 border border-[#E6E6E3] rounded-md text-[12px] bg-white text-[#1F1F1D]"
                  >
                    <option value="">-- Select Column --</option>
                    {detectedHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#1F1F1D] mb-1.5">
                Sales Rep Owner Assignment *
              </label>
              <select
                value={assignedOwner}
                onChange={(e) => setAssignedOwner(e.target.value)}
                className="w-full px-3 py-2 border border-[#E6E6E3] rounded-md text-[13px] bg-white text-[#1F1F1D]"
              >
                <option value="round-robin">Round-Robin Auto-Distribution (Across active reps)</option>
                <option value="unassigned">Leave Unassigned (Admissions queue pool)</option>
                <optgroup label="Assign Specifically To">
                  {salespeople
                    .filter((s) => s.status === 'Active')
                    .map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.title})
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#1F1F1D] mb-1">
                Campaign / Batch Tag (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. SIT College Drive Nov 2026"
                value={batchTag}
                onChange={(e) => setBatchTag(e.target.value)}
                className="w-full px-3 py-2 border border-[#E6E6E3] rounded-md text-[13px] bg-white text-[#1F1F1D]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Validation</span>
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={handleExecuteImport}
              className="flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>Execute Ingestion & Merge</span>
            </Button>
          </div>
        </div>
      )}

      {/* =====================================================
          STEP 5: IMPORT REPORT & CONFLICT RESOLUTION
          ===================================================== */}
      {currentStep === 5 && (
        <div className="bg-white border border-[#E6E6E3] rounded-lg p-6 space-y-6 animate-in fade-in">
          {isImporting ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-[#3B4BDB] border-t-transparent animate-spin mx-auto" />
              <div className="text-[16px] font-semibold text-[#1F1F1D]">
                Processing Lead Ingestion...
              </div>
              <div className="w-64 h-2 bg-[#E6E6E3] rounded-full mx-auto overflow-hidden">
                <div
                  className="h-full bg-[#3B4BDB] transition-all duration-300"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E6E3] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#DDF4E4] text-[#17673A] flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-semibold text-[#1F1F1D]">
                      Ingestion Report: {sourceName}
                    </h2>
                    <div className="text-[12px] text-[#6B6B66]">
                      Completed at {new Date().toLocaleTimeString()} by {currentUser?.name || 'Admin'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (importResult?.batch?.id) {
                        const ok = undoImportBatch(importResult.batch.id);
                        if (ok) {
                          showToast('Import batch reverted successfully!');
                          navigate('/import-history');
                        }
                      }
                    }}
                    className="flex items-center gap-1.5 text-[12px] text-[#B42318] hover:bg-[#FEF3F2]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Undo This Import (24h)</span>
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/leads')}
                    className="flex items-center gap-1.5 text-[12px]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View in Leads Grid</span>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 bg-white border border-[#E6E6E3] rounded-md">
                  <span className="text-[11px] text-[#6B6B66] font-medium block">Total Ingested</span>
                  <span className="text-[22px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
                    {importResult?.counts.total || 0}
                  </span>
                </div>

                <div className="p-3 bg-white border border-[#E6E6E3] rounded-md">
                  <span className="text-[11px] text-[#6B6B66] font-medium block">New Contacts Created</span>
                  <span className="text-[22px] font-semibold text-[#166534] tabular-nums font-mono">
                    {importResult?.counts.new || 0}
                  </span>
                </div>

                <div className="p-3 bg-white border border-[#E6E6E3] rounded-md">
                  <span className="text-[11px] text-[#6B6B66] font-medium block">Existing Updated</span>
                  <span className="text-[22px] font-semibold text-[#3B4BDB] tabular-nums font-mono">
                    {importResult?.counts.updated || 0}
                  </span>
                </div>

                <div className="p-3 bg-white border border-[#E6E6E3] rounded-md">
                  <span className="text-[11px] text-[#6B6B66] font-medium block">Duplicates Skipped</span>
                  <span className="text-[22px] font-semibold text-[#B54708] tabular-nums font-mono">
                    {importResult?.counts.duplicate || 0}
                  </span>
                </div>

                <div className="p-3 bg-white border border-[#E6E6E3] rounded-md">
                  <span className="text-[11px] text-[#6B6B66] font-medium block">Invalid Dropped</span>
                  <span className="text-[22px] font-semibold text-[#B42318] tabular-nums font-mono">
                    {importResult?.counts.invalid || 0}
                  </span>
                </div>
              </div>

              {importResult?.conflicts && importResult.conflicts.length > 0 && (
                <div className="space-y-3 p-4 bg-[#FEF6EE] border border-[#F9DBAF] rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#B54708]" />
                      <span className="font-semibold text-[13px] text-[#B54708]">
                        Non-Empty Core Field Conflicts ({importResult.conflicts.length})
                      </span>
                    </div>
                    <span className="text-[11px] text-[#B54708]">
                      Existing value was kept to protect data integrity. Click "Use new value" to override.
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-md border border-[#F9DBAF] bg-white">
                    <table className="w-full text-left border-collapse text-[12px]">
                      <thead>
                        <tr className="bg-[#F7F7F5] text-[#6B6B66] font-medium border-b border-[#E6E6E3]">
                          <th className="py-2 px-3">Candidate</th>
                          <th className="py-2 px-3">Field</th>
                          <th className="py-2 px-3">Existing Value (Kept)</th>
                          <th className="py-2 px-3">Incoming Value</th>
                          <th className="py-2 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E6E6E3]">
                        {importResult.conflicts.map((cnf: ImportBatchConflict) => (
                          <tr key={cnf.id} className="hover:bg-[#F3F4F6]">
                            <td className="py-2 px-3 font-medium text-[#1F1F1D]">
                              {cnf.contactName}
                            </td>
                            <td className="py-2 px-3 text-[#6B6B66]">{cnf.fieldLabel}</td>
                            <td className="py-2 px-3 font-medium text-[#1F1F1D] bg-[#F7F7F5]">
                              {String(cnf.existingValue)}
                            </td>
                            <td className="py-2 px-3 text-[#3B4BDB] font-medium">
                              {String(cnf.newValue)}
                            </td>
                            <td className="py-2 px-3 text-right">
                              {cnf.resolved ? (
                                <span className="text-[11px] font-medium text-[#166534] flex items-center justify-end gap-1">
                                  <Check className="w-3 h-3" />
                                  <span>{cnf.usedNewValue ? 'Updated to New' : 'Kept Existing'}</span>
                                </span>
                              ) : (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    resolveConflict(importResult.batch.id, cnf.id, true);
                                    showToast(`Updated ${cnf.fieldLabel} to "${cnf.newValue}"`);
                                  }}
                                  className="h-6 text-[11px] px-2 text-[#3B4BDB] border-[#3B4BDB]/40"
                                >
                                  Use new value
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {importResult?.errors && importResult.errors.length > 0 && (
                <div className="p-4 bg-[#FEF3F2] border border-[#FECDCA] rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#B42318]" />
                    <span className="text-[13px] text-[#B42318] font-medium">
                      {importResult.errors.length} invalid rows were dropped during ingestion.
                    </span>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleDownloadErrors}
                    className="flex items-center gap-1.5 text-[12px] text-[#B42318] border-[#FECDCA]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Errors CSV</span>
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-[#E6E6E3]">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setCurrentStep(1);
                    setFile(null);
                    setRawRows([]);
                    setImportResult(null);
                  }}
                  className="flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>Start New Import</span>
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/leads')}
                  className="flex items-center gap-1.5"
                >
                  <span>Go to Leads Pipeline</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
