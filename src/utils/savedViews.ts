// src/utils/savedViews.ts
import type { Lead } from '../types';

export interface SavedViewDefinition {
  id: string;
  name: string;
  iconName: string;
  filterFn: (lead: Lead, currentUserId?: string, repName?: string) => boolean;
}

export function getSavedViewCounts(leads: Lead[], _currentUserId?: string, _repName?: string) {
  const now = new Date();
  const todayStr = now.toISOString().substring(0, 10);

  return {
    all: leads.length,
    unassigned: leads.filter(
      (l) => !l.assignedSalesperson || l.assignedSalesperson === 'Unassigned' || l.assignedSalesperson.trim() === ''
    ).length,
    todayFollowups: leads.filter((l) => {
      const due = l.nextTask?.dueDateTime || l.nextFollowUp || '';
      return due.startsWith(todayStr);
    }).length,
    overdue: leads.filter((l) => {
      const due = l.nextTask?.dueDateTime || l.nextFollowUp || '';
      if (!due) return false;
      const isClosed = l.crmStage === 'Lost' || l.crmStage === 'Unqualified' || l.crmStage === 'Converted' || l.enrollmentStatus === 'Enrolled';
      if (isClosed) return false;
      return new Date(due).getTime() < now.getTime() && !due.startsWith(todayStr);
    }).length,
    hot: leads.filter((l) => {
      const temp = (l as any).temperature || (l as any).leadTemperature || 'Warm';
      return temp === 'Hot' || l.crmStage === 'Interested' || l.crmStage === 'Qualified';
    }).length,
    paymentPending: leads.filter((l) => {
      return (
        l.crmStage === 'Payment Pending' ||
        l.crmStage === 'Payment Discussion' ||
        l.paymentState === 'Payment link sent' ||
        l.paymentState === 'Deposit pending'
      );
    }).length,
    enrolled: leads.filter((l) => {
      return l.crmStage === 'Converted' || l.enrollmentStatus === 'Enrolled' || l.paymentStatus === 'Paid';
    }).length,
    lost: leads.filter((l) => {
      return (
        l.crmStage === 'Lost' ||
        l.crmStage === 'Unqualified' ||
        l.crmStage === 'Not Interested'
      );
    }).length
  };
}
