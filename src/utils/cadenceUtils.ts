// src/utils/cadenceUtils.ts
import type { MentorMeeting, DemoSession, DirectSale } from '../types';

export const MENTOR_PRESETS = [
  {
    name: 'Dr. Varun Sharma',
    title: 'Lead AI Mentor & Ex-Meta AI Scientist',
    specialty: 'Agentic Workflows & LLM Systems'
  },
  {
    name: 'Rohan Verma',
    title: 'Principal AI Architect & GenAI Lead',
    specialty: 'System Design & Enterprise Automation'
  },
  {
    name: 'Pooja Malhotra',
    title: 'VP of AI Product Management',
    specialty: 'AI Roadmap Strategy & Transition'
  },
  {
    name: 'Maaz Alam',
    title: 'Founder & Program Director',
    specialty: 'Career Acceleration & Executive Mentorship'
  }
];

export const DEMO_SESSION_PRESETS = [
  {
    title: 'Hands-On AI Agent Architecture Masterclass',
    dayTiming: 'Upcoming Saturday • 11:00 AM IST',
    durationMinutes: 60,
    host: 'Dr. Varun Sharma',
    link: 'https://meet.google.com/aiv-demo-sat'
  },
  {
    title: 'AI-Native Project Management Live Curriculum Demo',
    dayTiming: 'Upcoming Wednesday • 8:00 PM IST',
    durationMinutes: 45,
    host: 'Pooja Malhotra',
    link: 'https://meet.google.com/aiv-demo-wed'
  },
  {
    title: 'Executive AI Leadership & GTM Interactive Preview',
    dayTiming: 'Upcoming Sunday • 6:00 PM IST',
    durationMinutes: 60,
    host: 'Maaz Alam',
    link: 'https://meet.google.com/aiv-demo-sun'
  }
];

export interface SlaCalculation {
  elapsedWorkingHours: number;
  remainingWorkingHours: number;
  remainingHours: number;
  percentElapsed: number;
  isExpired: boolean;
  isWithin48Hours: boolean;
  isWithinWorkingHoursNow: boolean;
  statusLabel: string;
}

/**
 * Calculates 48-Hour working SLA elapsed time between morning 7:00 AM and evening 8:00 PM (13 working hours/day).
 */
export function calculate48HourWorkingSla(dateCapturedStr?: string): SlaCalculation {
  const defaultRes: SlaCalculation = {
    elapsedWorkingHours: 0,
    remainingWorkingHours: 48,
    remainingHours: 48,
    percentElapsed: 0,
    isExpired: false,
    isWithin48Hours: true,
    isWithinWorkingHoursNow: true,
    statusLabel: '48h Working SLA Active'
  };

  if (!dateCapturedStr) return defaultRes;

  const capturedTime = new Date(dateCapturedStr);
  if (isNaN(capturedTime.getTime())) return defaultRes;

  const now = new Date();
  if (now.getTime() <= capturedTime.getTime()) return defaultRes;

  // Working window per day: 7 AM to 8 PM (13 hours)
  const WORK_START_HOUR = 7;
  const WORK_END_HOUR = 20;

  let totalWorkingSeconds = 0;

  // Step day-by-day
  const cur = new Date(capturedTime.getTime());
  cur.setMinutes(0, 0, 0);

  // Iterating hourly steps or day segments
  let iter = new Date(capturedTime.getTime());
  while (iter < now) {
    const nextHour = new Date(iter.getTime() + 60 * 60 * 1000);
    const hour = iter.getHours();

    // Check if this hour is inside working hours (7 AM - 8 PM)
    if (hour >= WORK_START_HOUR && hour < WORK_END_HOUR) {
      const windowStart = Math.max(iter.getTime(), capturedTime.getTime());
      const windowEnd = Math.min(nextHour.getTime(), now.getTime());
      if (windowEnd > windowStart) {
        totalWorkingSeconds += (windowEnd - windowStart) / 1000;
      }
    }
    iter = nextHour;
  }

  const elapsedWorkingHours = Math.round((totalWorkingSeconds / 3600) * 10) / 10;
  const remainingWorkingHours = Math.max(0, Math.round((48 - elapsedWorkingHours) * 10) / 10);
  const percentElapsed = Math.min(100, Math.round((elapsedWorkingHours / 48) * 100));
  const isExpired = elapsedWorkingHours >= 48;
  const isWithin48Hours = !isExpired;

  const nowHour = now.getHours();
  const isWithinWorkingHoursNow = nowHour >= WORK_START_HOUR && nowHour < WORK_END_HOUR;

  let statusLabel = `${remainingWorkingHours}h remaining in 48h SLA`;
  if (isExpired) {
    statusLabel = '48h Cycle Expired (Auto-Nurture)';
  } else if (!isWithinWorkingHoursNow) {
    statusLabel = 'Outside Working Hours (7 AM - 8 PM)';
  }

  return {
    elapsedWorkingHours,
    remainingWorkingHours,
    remainingHours: remainingWorkingHours,
    percentElapsed,
    isExpired,
    isWithin48Hours,
    isWithinWorkingHoursNow,
    statusLabel
  };
}

/**
 * Helper to generate pre-filled WhatsApp message for Mentor 1-on-1 Meeting
 */
export function generateMentorWhatsAppMessage(candidateName: string, meeting: Partial<MentorMeeting>): string {
  const firstName = candidateName.split(' ')[0] || candidateName;
  return `Hi ${firstName}! Great speaking with you today. As discussed on our call, I've confirmed your 1-on-1 Mentor Strategy Session with ${meeting.mentorName || 'Lead AI Mentor'} (${meeting.mentorTitle || 'Lead AI Mentor'}).

📅 *Scheduled Time*: ${meeting.scheduledAt || meeting.scheduledDate || 'Upcoming Session'}
⏱️ *Duration*: ${meeting.durationMinutes || 30} Minutes
🔗 *Meeting Link*: ${meeting.meetingLink || 'https://meet.google.com/aiv-mentor-session'}

Please keep your current role objectives and AI transition questions handy. Looking forward to having you connect!`;
}

/**
 * Helper to generate pre-filled WhatsApp message for Live Demo Session
 */
export function generateDemoWhatsAppMessage(candidateName: string, demo: Partial<DemoSession>): string {
  const firstName = candidateName.split(' ')[0] || candidateName;
  return `Hi ${firstName}! You're invited to our exclusive live cohort session:

🎓 *Session*: ${demo.sessionTitle || 'Live AI Cohort Masterclass'}
📅 *When*: ${demo.scheduledAt || 'Upcoming Session'}
🔗 *Live Joining Link*: ${demo.sessionLink || 'https://meet.google.com/aiv-live-demo'}

We'll be doing a hands-on live walkthrough of AI workflows and answering curriculum questions live. See you there!`;
}

/**
 * Helper to generate pre-filled WhatsApp message for Direct Sale Checkout
 */
export function generateDirectSaleWhatsAppMessage(candidateName: string, sale: Partial<DirectSale>): string {
  const firstName = candidateName.split(' ')[0] || candidateName;
  const formattedAmount = (sale.finalAmount || sale.amount || 0).toLocaleString('en-IN');
  return `Hi ${firstName}! Thank you for your decision to enroll in ${sale.programName || 'AI Cohort'}.

💳 *Tuition Fee*: ₹${formattedAmount} (${sale.paymentPlan || sale.plan || 'Direct Enrollment'})
⚡ *Official Secure Checkout Link*: ${sale.paymentLink || 'https://pages.razorpay.com/aivalytics-checkout'}

Once completed, your admission confirmation and LMS access will be activated immediately. Let me know once done!`;
}
