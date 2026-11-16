// src/services/leadIngestionService.ts
import type {
  Lead,
  Submission,
  QuestionAnswer,
  CustomField,
  ContactFieldValue,
  MappingTemplate,
  ImportBatchConflict,
  ScoringRule,
  Salesperson,
  TimelineEvent,
  SubmissionSource
} from '../types';

/**
 * Normalizes phone numbers to standard 10-digit format for dedup checks
 */
export function normalizePhoneForDedup(raw: any): string {
  if (!raw) return '';
  let str = String(raw).trim();
  if (str.endsWith('.0')) str = str.slice(0, -2);
  const digits = str.replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

/**
 * Formats a 10-digit number into official +91 Indian format: +91 98220 12345
 */
export function formatIndianPhoneNumber(raw: any): string {
  const digits = normalizePhoneForDedup(raw);
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return raw ? String(raw).trim() : '';
}

/**
 * Cleans and humanizes Meta form question keys:
 * "what's_your_current_role?" -> "What's your current role?"
 */
export function humanizeQuestionLabel(key: string): string {
  if (!key) return '';
  let cleaned = key.trim().replace(/[_]+/g, ' ');
  // Capitalize first letter
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  // Ensure ending question mark if it started as question
  if (key.endsWith('?') && !cleaned.endsWith('?')) {
    cleaned += '?';
  }
  return cleaned;
}

/**
 * Cleans and humanizes answer values:
 * "working_professional" -> "Working professional"
 */
export function humanizeAnswerLabel(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  let str = String(val).trim();
  if (str.includes('_')) {
    str = str.replace(/[_]+/g, ' ');
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  return str;
}

export interface IngestionOptions {
  source: SubmissionSource;
  sourceName: string;
  importBatchId?: string;
  programChoice?: 'AI Builder' | 'AI-PM' | 'decide_by_column';
  programColumn?: string;
  assignedOwner?: 'round-robin' | 'unassigned' | string;
  tag?: string;
  template?: MappingTemplate;
  importedBy?: string;
}

export interface IngestionResult {
  updatedLeads: Lead[];
  createdLeads: Lead[];
  modifiedLeads: Lead[];
  submissions: Submission[];
  answers: QuestionAnswer[];
  fieldValues: ContactFieldValue[];
  conflicts: ImportBatchConflict[];
  timelineEvents: TimelineEvent[];
  counts: {
    total: number;
    new: number;
    updated: number;
    duplicate: number;
    invalid: number;
    skipped: number;
  };
  errors: { row: number; reason: string; raw: any }[];
  previousLeadSnapshots: Record<string, Partial<Lead>>;
}

/**
 * Shared ingestion service for ALL lead sources (CSV, XLSX, Google Sheet, Paste, Meta Webhook, Call Qualification)
 */
export function ingestLeadRows(
  rows: Record<string, any>[],
  existingLeads: Lead[],
  customFields: CustomField[],
  scoringRules: ScoringRule[],
  salespeople: Salesperson[],
  options: IngestionOptions
): IngestionResult {
  const nowStr = new Date().toISOString();
  const nowDisplay = nowStr.substring(0, 16).replace('T', ' ');

  const activeReps = salespeople.filter((s) => s.status === 'Active');
  let roundRobinIdx = 0;

  const createdLeads: Lead[] = [];
  const modifiedLeads: Lead[] = [];
  const newSubmissions: Submission[] = [];
  const newAnswers: QuestionAnswer[] = [];
  const newFieldValues: ContactFieldValue[] = [];
  const conflicts: ImportBatchConflict[] = [];
  const timelineEvents: TimelineEvent[] = [];
  const errors: { row: number; reason: string; raw: any }[] = [];
  const previousLeadSnapshots: Record<string, Partial<Lead>> = {};

  let duplicateCount = 0;
  let invalidCount = 0;
  let skippedCount = 0;

  // Working copy of leads
  const leadsMap = new Map<string, Lead>();
  existingLeads.forEach((l) => leadsMap.set(l.id, { ...l }));

  // Index existing leads by phone, email, and metaLeadId for fast dedup
  const phoneIndex = new Map<string, string>(); // normPhone -> leadId
  const emailIndex = new Map<string, string>(); // email -> leadId
  const metaIdIndex = new Map<string, string>(); // metaLeadId -> leadId

  existingLeads.forEach((l) => {
    const p = normalizePhoneForDedup(l.phone);
    if (p && p.length >= 7) phoneIndex.set(p, l.id);
    if (l.email) emailIndex.set(l.email.toLowerCase().trim(), l.id);
    if (l.metaLeadId) metaIdIndex.set(l.metaLeadId, l.id);
  });

  const processedInThisBatchPhones = new Set<string>();

  rows.forEach((row, rowIndex) => {
    const rowNum = rowIndex + 1;

    // 1. Extract values using template or auto-detection
    const extracted: Record<string, any> = {};
    const unmappedQuestions: Record<string, any> = {};

    if (options.template?.mappings) {
      Object.entries(options.template.mappings).forEach(([header, cfg]) => {
        const val = row[header];
        if (val === undefined || val === null || val === '') return;

        if (cfg.targetType === 'core') {
          extracted[cfg.targetKey] = val;
        } else if (cfg.targetType === 'custom') {
          extracted[`custom:${cfg.targetKey}`] = { value: val, fieldId: cfg.customFieldId };
        } else if (cfg.targetType === 'answer') {
          unmappedQuestions[header] = val;
        }
      });
    } else {
      // Auto-detect standard columns
      Object.entries(row).forEach(([colHeader, val]) => {
        if (val === undefined || val === null || val === '') return;
        const normHeader = colHeader.toLowerCase().trim();

        if (['full name', 'fullname', 'name', 'candidate', 'student name', 'lead name'].includes(normHeader)) {
          extracted['fullName'] = String(val).trim();
        } else if (['first name', 'firstname'].includes(normHeader)) {
          extracted['firstName'] = String(val).trim();
        } else if (['last name', 'lastname'].includes(normHeader)) {
          extracted['lastName'] = String(val).trim();
        } else if (['phone', 'phone number', 'mobile', 'mobile number', 'contact no', 'contact number', 'whatsapp', 'whatsapp number'].includes(normHeader)) {
          extracted['phone'] = String(val).trim();
        } else if (['email', 'email address', 'email id'].includes(normHeader)) {
          extracted['email'] = String(val).trim().toLowerCase();
        } else if (['city', 'location', 'town'].includes(normHeader)) {
          extracted['city'] = String(val).trim();
        } else if (['program', 'course', 'cohort', 'track'].includes(normHeader)) {
          extracted['programName'] = String(val).trim();
        } else if (['current role', 'role', 'designation', 'job title', "what's your current role?", "what's_your_current_role?"].includes(normHeader)) {
          extracted['currentRole'] = String(val).trim();
        } else if (['experience', 'years of experience', 'work experience', 'total experience'].includes(normHeader)) {
          extracted['yearsOfExperience'] = val;
        } else if (['company', 'current company', 'organization'].includes(normHeader)) {
          extracted['currentCompany'] = String(val).trim();
        } else {
          // Check if matches an existing custom field key
          const matchedCustomField = customFields.find(
            (cf) => cf.key.toLowerCase() === normHeader || cf.label.toLowerCase() === normHeader
          );
          if (matchedCustomField) {
            extracted[`custom:${matchedCustomField.key}`] = { value: val, fieldId: matchedCustomField.id };
          } else {
            // Keep as question and answer
            unmappedQuestions[colHeader] = val;
          }
        }
      });
    }

    // Merge first name + last name if fullName not already set
    if (!extracted['fullName'] && (extracted['firstName'] || extracted['lastName'])) {
      extracted['fullName'] = `${extracted['firstName'] || ''} ${extracted['lastName'] || ''}`.trim();
    }

    const fullName = extracted['fullName'] || row['fullName'] || row['name'] || '';
    const rawPhone = extracted['phone'] || row['phone'] || row['mobile'] || '';
    const email = (extracted['email'] || row['email'] || '').toLowerCase().trim();
    const city = extracted['city'] || row['city'] || 'Bengaluru';
    const normPhone = normalizePhoneForDedup(rawPhone);

    // Validation
    if (!fullName && !rawPhone && !email) {
      invalidCount++;
      errors.push({ row: rowNum, reason: 'Empty row (missing name, phone, and email)', raw: row });
      return;
    }

    if (!normPhone || normPhone.length < 8) {
      invalidCount++;
      errors.push({ row: rowNum, reason: `Invalid phone number: "${rawPhone}"`, raw: row });
      return;
    }

    // Check duplicate inside the same incoming file
    if (processedInThisBatchPhones.has(normPhone)) {
      duplicateCount++;
      errors.push({ row: rowNum, reason: `Duplicate phone within the file: ${normPhone}`, raw: row });
      return;
    }
    processedInThisBatchPhones.add(normPhone);

    // Determine target program
    let programId: 'workshop-3day' | 'ai-pm' = 'ai-pm';
    let programName = 'AI-Native Project Management';

    if (options.programChoice === 'AI Builder') {
      programId = 'workshop-3day';
      programName = '3-Day AI Builder Workshop';
    } else if (options.programChoice === 'decide_by_column' && options.programColumn) {
      const colVal = String(row[options.programColumn] || '').toLowerCase();
      if (colVal.includes('builder') || colVal.includes('workshop')) {
        programId = 'workshop-3day';
        programName = '3-Day AI Builder Workshop';
      }
    } else if (extracted['programName']) {
      const p = extracted['programName'].toLowerCase();
      if (p.includes('builder') || p.includes('workshop')) {
        programId = 'workshop-3day';
        programName = '3-Day AI Builder Workshop';
      }
    }

    // Dedup check: 1. Phone -> 2. Email -> 3. MetaLeadId
    const existingLeadId = phoneIndex.get(normPhone) || emailIndex.get(email) || metaIdIndex.get(row['metaLeadId'] || '');
    const submissionId = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    if (existingLeadId && leadsMap.has(existingLeadId)) {
      // ==========================================
      // EXISTING LEAD: APPLY MERGE RULES
      // ==========================================
      const existingLead = leadsMap.get(existingLeadId)!;

      // Save previous snapshot for 24h Undo
      if (!previousLeadSnapshots[existingLeadId]) {
        previousLeadSnapshots[existingLeadId] = { ...existingLead };
      }

      // Check core fields protection
      const coreFieldsToCheck: { key: keyof Lead; label: string }[] = [
        { key: 'fullName', label: 'Full Name' },
        { key: 'email', label: 'Email' },
        { key: 'city', label: 'City' },
        { key: 'currentRole', label: 'Current Role' },
        { key: 'currentCompany', label: 'Current Company' }
      ];

      coreFieldsToCheck.forEach(({ key, label }) => {
        const incomingVal = extracted[key as string];
        const currentVal = existingLead[key];

        if (incomingVal && currentVal) {
          // If both exist and differ -> conflict!
          if (String(incomingVal).trim().toLowerCase() !== String(currentVal).trim().toLowerCase()) {
            conflicts.push({
              id: `cnf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              contactId: existingLeadId,
              contactName: existingLead.fullName,
              fieldKey: key as string,
              fieldLabel: label,
              existingValue: currentVal,
              newValue: incomingVal
            });
            // Keep existing value
          }
        } else if (incomingVal && !currentVal) {
          // Empty core field filled with new value
          (existingLead as any)[key] = incomingVal;
        }
      });

      // Custom fields: update only if empty or alwaysOverwrite
      Object.entries(extracted).forEach(([k, item]) => {
        if (k.startsWith('custom:')) {
          const customKey = k.replace('custom:', '');
          existingLead.customFields = existingLead.customFields || {};
          if (!existingLead.customFields[customKey]) {
            existingLead.customFields[customKey] = item.value;
          }
        }
      });

      // Answers & Submissions always ADDED
      existingLead.submissionsCount = (existingLead.submissionsCount || 1) + 1;

      // Re-submission timeline event
      const formName = options.sourceName || 'Meta Form';
      const isOpen = !['Converted', 'Lost', 'Closed Lost'].includes(existingLead.crmStage);

      // Bump temperature to Hot if deal is open
      if (isOpen && !existingLead.temperatureLocked) {
        existingLead.temperature = 'Hot';
      }

      const timelineItem: TimelineEvent = {
        id: `tl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        leadId: existingLead.id,
        eventType: 'synced_from_sheet',
        title: `Re-submitted form: ${formName}`,
        description: `Lead submitted new information from ${options.source}. ${isOpen ? 'Temperature set to Hot.' : ''}`,
        performedByName: options.importedBy || 'System Ingestion',
        createdAt: nowStr,
        metadata: { source: options.source, rowData: row }
      };
      existingLead.timeline = existingLead.timeline || [];
      existingLead.timeline.unshift(timelineItem);

      // Run Scoring Rules
      if (!existingLead.temperatureLocked) {
        const scoredTemp = evaluateScoringRules(existingLead, scoringRules);
        if (scoredTemp) existingLead.temperature = scoredTemp;
      }

      leadsMap.set(existingLeadId, existingLead);
      modifiedLeads.push(existingLead);

      // Record Submission
      const sub: Submission = {
        id: submissionId,
        contactId: existingLeadId,
        source: options.source,
        sourceName: options.sourceName,
        submittedAt: nowStr,
        rawPayload: row,
        importBatchId: options.importBatchId
      };
      newSubmissions.push(sub);

      // Record Question & Answers
      Object.entries(unmappedQuestions).forEach(([qKey, aVal]) => {
        newAnswers.push({
          id: `ans-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          contactId: existingLeadId,
          submissionId: submissionId,
          questionKey: qKey.toLowerCase().replace(/\s+/g, '_'),
          questionLabel: humanizeQuestionLabel(qKey),
          answerValue: aVal,
          answerLabel: humanizeAnswerLabel(aVal)
        });
      });

    } else {
      // ==========================================
      // NEW LEAD CREATION
      // ==========================================
      const newLeadId = `lead-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      // Assignment
      let assignedOwner = 'Unassigned';
      if (options.assignedOwner === 'round-robin') {
        if (activeReps.length > 0) {
          assignedOwner = activeReps[roundRobinIdx % activeReps.length].name;
          roundRobinIdx++;
        }
      } else if (options.assignedOwner && options.assignedOwner !== 'unassigned') {
        assignedOwner = options.assignedOwner;
      }

      // Initial custom fields
      const leadCustomFields: Record<string, any> = {};
      Object.entries(extracted).forEach(([k, item]) => {
        if (k.startsWith('custom:')) {
          const customKey = k.replace('custom:', '');
          leadCustomFields[customKey] = item.value;
        }
      });

      const formattedPhone = formatIndianPhoneNumber(rawPhone);

      const newLead: Lead = {
        id: newLeadId,
        fullName: fullName || 'New Candidate',
        phone: formattedPhone,
        email: email || '',
        city: city,
        state: 'Karnataka',
        country: 'India',
        source: options.source,
        metaCampaign: options.tag || options.sourceName || 'CSV Import Batch',
        metaAdSet: 'Direct Import',
        metaAd: options.sourceName,
        campaignId: `cmp_${Date.now()}`,
        programId: programId,
        programName: programName,
        professionalStatus: 'Working Professional',
        currentRole: extracted['currentRole'] || 'Candidate',
        currentCompany: extracted['currentCompany'] || 'Industry',
        industry: extracted['industry'] || 'Technology',
        yearsOfExperience: Number(extracted['yearsOfExperience']) || 3,
        primaryGoal: 'increase_my_earning_potential',
        desiredRole: 'AI-Native Professional',
        expectedTimeline: 'immediately',
        mainChallenge: "i_don't_know_what_ai_skills_are_actually_relevant",
        whyNow: 'Imported prospective applicant.',
        expectedOutcome: 'Cohort enrollment.',
        comments: `Imported via ${options.source}: ${options.sourceName}`,
        qualificationStatus: 'Qualified Prospect',
        crmStage: 'New Lead',
        leadStage: 'New',
        temperature: 'Warm',
        assignedSalesperson: assignedOwner,
        assignedAt: assignedOwner !== 'Unassigned' ? nowStr : undefined,
        dateCaptured: nowDisplay,
        createdTime: nowDisplay,
        paymentStatus: 'Unpaid',
        paymentState: 'No payment request',
        submissionsCount: 1,
        customFields: leadCustomFields,
        nextTask: {
          id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          leadId: newLeadId,
          owner: assignedOwner !== 'Unassigned' ? assignedOwner : 'Unassigned',
          taskType: 'Call',
          dueDateTime: nowDisplay,
          priority: 'High',
          completionStatus: 'Pending',
          notes: 'Initial outreach call for imported lead'
        },
        timeline: [
          {
            id: `tl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            leadId: newLeadId,
            eventType: 'created',
            title: `Lead imported from ${options.source}`,
            description: `Batch: ${options.sourceName}. Assigned to: ${assignedOwner}`,
            performedByName: options.importedBy || 'System Ingestion',
            createdAt: nowStr
          }
        ]
      } as Lead;

      // Auto temperature scoring rules
      const scoredTemp = evaluateScoringRules(newLead, scoringRules);
      if (scoredTemp) newLead.temperature = scoredTemp;

      leadsMap.set(newLeadId, newLead);
      createdLeads.push(newLead);

      // Register in index
      if (normPhone) phoneIndex.set(normPhone, newLeadId);
      if (email) emailIndex.set(email, newLeadId);

      // Record Submission
      const sub: Submission = {
        id: submissionId,
        contactId: newLeadId,
        source: options.source,
        sourceName: options.sourceName,
        submittedAt: nowStr,
        rawPayload: row,
        importBatchId: options.importBatchId
      };
      newSubmissions.push(sub);

      // Record Question & Answers
      Object.entries(unmappedQuestions).forEach(([qKey, aVal]) => {
        newAnswers.push({
          id: `ans-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          contactId: newLeadId,
          submissionId: submissionId,
          questionKey: qKey.toLowerCase().replace(/\s+/g, '_'),
          questionLabel: humanizeQuestionLabel(qKey),
          answerValue: aVal,
          answerLabel: humanizeAnswerLabel(aVal)
        });
      });
    }
  });

  return {
    updatedLeads: Array.from(leadsMap.values()),
    createdLeads,
    modifiedLeads,
    submissions: newSubmissions,
    answers: newAnswers,
    fieldValues: newFieldValues,
    conflicts,
    timelineEvents,
    counts: {
      total: rows.length,
      new: createdLeads.length,
      updated: modifiedLeads.length,
      duplicate: duplicateCount,
      invalid: invalidCount,
      skipped: skippedCount
    },
    errors,
    previousLeadSnapshots
  };
}

/**
 * Evaluates configured Scoring Rules against a lead to determine temperature
 */
export function evaluateScoringRules(lead: Lead, rules: ScoringRule[]): 'Hot' | 'Warm' | 'Cold' | null {
  if (lead.temperatureLocked) return null;

  for (const rule of rules) {
    if (!rule.active) continue;

    // Check program scope
    if (rule.programScope && rule.programScope !== 'All') {
      const isBuilder = lead.programId === 'workshop-3day' || lead.programName?.toLowerCase().includes('builder');
      if (rule.programScope === 'AI Builder' && !isBuilder) continue;
      if (rule.programScope === 'AI-PM' && isBuilder) continue;
    }

    // Evaluate all conditions with AND
    let allMatch = true;
    for (const cond of rule.conditions) {
      const leadVal = (lead as any)[cond.fieldKey] || lead.customFields?.[cond.fieldKey];
      if (!checkCondition(leadVal, cond.operator, cond.value)) {
        allMatch = false;
        break;
      }
    }

    if (allMatch) {
      return rule.resultingTemperature;
    }
  }

  return null;
}

function checkCondition(actualVal: any, operator: string, targetVal: any): boolean {
  if (actualVal === undefined || actualVal === null) return false;

  const actualStr = String(actualVal).toLowerCase().trim();
  const targetStr = String(targetVal).toLowerCase().trim();

  switch (operator) {
    case 'equals':
      return actualStr === targetStr;
    case 'contains':
      return actualStr.includes(targetStr);
    case 'gte':
      return Number(actualVal) >= Number(targetVal);
    case 'lte':
      return Number(actualVal) <= Number(targetVal);
    case 'in':
      if (Array.isArray(targetVal)) {
        return targetVal.map(String).includes(String(actualVal));
      }
      return targetStr.includes(actualStr);
    default:
      return actualStr === targetStr;
  }
}
