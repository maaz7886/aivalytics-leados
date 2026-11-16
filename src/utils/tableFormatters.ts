// src/utils/tableFormatters.ts

/**
 * Format Indian phone numbers nicely, e.g. "+91 98220 12345"
 */
export function formatPhoneNumber(phone?: string): string {
  if (!phone) return '—';
  const clean = phone.replace(/[^\d+]/g, '');
  const digits = clean.replace(/\D/g, '');

  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return phone;
}

/**
 * Format relative due dates:
 * - Empty: { text: 'No next action', isOverdue: false, isMissing: true }
 * - Overdue: { text: 'Overdue 2h', isOverdue: true, isMissing: false }
 * - Today: 'Today 4:30 PM'
 * - Tomorrow: 'Tomorrow 11:00 AM'
 * - Future: '24 Nov 3:00 PM'
 */
export function formatRelativeDue(dueStr?: string): {
  text: string;
  isOverdue: boolean;
  isMissing: boolean;
} {
  if (!dueStr || dueStr.trim() === '') {
    return { text: 'No next action', isOverdue: false, isMissing: true };
  }

  const dueDate = new Date(dueStr);
  if (isNaN(dueDate.getTime())) {
    return { text: dueStr, isOverdue: false, isMissing: false };
  }

  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();

  // If overdue
  if (diffMs < -60000) {
    const overdueMins = Math.floor(Math.abs(diffMs) / 60000);
    if (overdueMins < 60) {
      return { text: `Overdue ${overdueMins}m`, isOverdue: true, isMissing: false };
    }
    const overdueHours = Math.floor(overdueMins / 60);
    if (overdueHours < 24) {
      return { text: `Overdue ${overdueHours}h`, isOverdue: true, isMissing: false };
    }
    const overdueDays = Math.floor(overdueHours / 24);
    return { text: `Overdue ${overdueDays}d`, isOverdue: true, isMissing: false };
  }

  // Not overdue, format relative day
  const isToday =
    dueDate.getDate() === now.getDate() &&
    dueDate.getMonth() === now.getMonth() &&
    dueDate.getFullYear() === now.getFullYear();

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow =
    dueDate.getDate() === tomorrow.getDate() &&
    dueDate.getMonth() === tomorrow.getMonth() &&
    dueDate.getFullYear() === tomorrow.getFullYear();

  const timeFormatted = dueDate.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  if (isToday) {
    return { text: `Today ${timeFormatted}`, isOverdue: false, isMissing: false };
  }
  if (isTomorrow) {
    return { text: `Tomorrow ${timeFormatted}`, isOverdue: false, isMissing: false };
  }

  const dateFormatted = dueDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short'
  });

  return { text: `${dateFormatted} ${timeFormatted}`, isOverdue: false, isMissing: false };
}

/**
 * Format last touch time, e.g. "12 min ago", "2h ago", "Yesterday"
 */
export function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/**
 * Clean display for Program (Workshop / AI-PM)
 */
export function formatProgramName(programIdOrName?: string): string {
  if (!programIdOrName) return 'Workshop';
  const lower = programIdOrName.toLowerCase();
  if (lower.includes('pm') || lower.includes('product')) return 'AI-PM';
  if (lower.includes('workshop') || lower.includes('builder')) return 'Workshop';
  return programIdOrName;
}

/**
 * View preferences persistence in localStorage
 */
export interface UserViewPreferences {
  visibleColumns: string[];
  columnOrder: string[];
  columnWidths: Record<string, number>;
  sortBy: { field: string; direction: 'asc' | 'desc' }[];
  groupBy: 'stage' | 'owner' | 'program' | 'temperature' | 'source' | 'none';
  rowHeight: 'compact' | 'default' | 'tall';
}

export function getUserViewPrefs(viewKey: string, userId: string = 'global'): UserViewPreferences | null {
  try {
    const raw = localStorage.getItem(`leados_view_prefs_${viewKey}_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read view prefs:', e);
  }
  return null;
}

export function setUserViewPrefs(
  viewKey: string,
  userId: string = 'global',
  prefs: Partial<UserViewPreferences>
): void {
  try {
    const current = getUserViewPrefs(viewKey, userId) || {
      visibleColumns: [
        'select',
        'name',
        'phone',
        'program',
        'stage',
        'owner',
        'temperature',
        'nextAction',
        'due',
        'source',
        'lastTouch',
        'created'
      ],
      columnOrder: [
        'select',
        'name',
        'phone',
        'program',
        'stage',
        'owner',
        'temperature',
        'nextAction',
        'due',
        'source',
        'lastTouch',
        'created'
      ],
      columnWidths: {},
      sortBy: [{ field: 'created', direction: 'desc' }],
      groupBy: 'stage',
      rowHeight: 'default'
    };
    const updated = { ...current, ...prefs };
    localStorage.setItem(`leados_view_prefs_${viewKey}_${userId}`, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save view prefs:', e);
  }
}
