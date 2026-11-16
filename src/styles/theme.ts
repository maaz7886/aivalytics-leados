// src/styles/theme.ts
/**
 * LeadOS Airtable / Notion-Style Design System Tokens
 * All design tokens are declared once here and consumed globally.
 */

export const colors = {
  background: '#FFFFFF',
  surface: '#F7F7F5',       // Sidebar / subtle surface
  surfaceHover: '#F3F4F6',  // Hover row
  surfaceSelected: '#EEF0FD',// Selected row
  border: '#E6E6E3',        // Thin 1px structural separator
  textPrimary: '#1F1F1D',   // High-contrast readable body text
  textSecondary: '#6B6B66', // 4.5:1 accessible muted text
  accent: '#3B4BDB',        // Primary action / active indicator
  accentHover: '#2F3CB8',   // Button active / hover
  danger: '#B42318',        // Overdue, SLA breach, warning text
  dangerBg: '#FEE4E2',
} as const;

export const stageChips = {
  'New': { bg: '#EEEEEC', text: '#3D3D3A' },
  'New Lead': { bg: '#EEEEEC', text: '#3D3D3A' },
  'Contacted': { bg: '#E3EBFF', text: '#1E3FA8' },
  'Follow-Up 1': { bg: '#E3EBFF', text: '#1E3FA8' },
  'Follow-Up 2': { bg: '#E3EBFF', text: '#1E3FA8' },
  'Follow-Up 3': { bg: '#E3EBFF', text: '#1E3FA8' },
  'Details Sent on WhatsApp': { bg: '#E3EBFF', text: '#1E3FA8' },
  'Call Later': { bg: '#E3EBFF', text: '#1E3FA8' },
  'Interested': { bg: '#FFF0D6', text: '#8A4B00' },
  'Qualified': { bg: '#FFF0D6', text: '#8A4B00' },
  'Meeting booked': { bg: '#EFE6FF', text: '#5B2BA8' },
  'Mentor Session Scheduled': { bg: '#EFE6FF', text: '#5B2BA8' },
  'Demo Session Scheduled': { bg: '#EFE6FF', text: '#5B2BA8' },
  'Joined Session': { bg: '#EFE6FF', text: '#5B2BA8' },
  'Payment pending': { bg: '#FFE6D9', text: '#9A3A0B' },
  'Enrolled': { bg: '#DDF4E4', text: '#17673A' },
  'Won': { bg: '#DDF4E4', text: '#17673A' },
  'Lost': { bg: '#F5E1E1', text: '#8E2424' },
  'Unqualified': { bg: '#F5E1E1', text: '#8E2424' },
  'Did Not Pick The Call': { bg: '#F5E1E1', text: '#8E2424' }
} as const;

export const temperatureTokens = {
  Hot: { dot: '#D92D20', text: '#1F1F1D', bg: '#FEF3F2' },
  Warm: { dot: '#DC8A00', text: '#1F1F1D', bg: '#FFFAEB' },
  Cold: { dot: '#2563A8', text: '#1F1F1D', bg: '#EFF8FF' }
} as const;

export const repAvatarColors = [
  '#2563EB', // Blue
  '#7C3AED', // Violet
  '#059669', // Emerald
  '#D97706', // Amber
  '#DC2626', // Red
  '#0891B2', // Cyan
  '#4F46E5', // Indigo
  '#BE185D'  // Pink
];

export function getRepColor(name: string): string {
  if (!name || name === 'Unassigned') return '#9CA3AF';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % repAvatarColors.length;
  return repAvatarColors[index];
}

export function getInitials(name: string): string {
  if (!name || name === 'Unassigned') return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
