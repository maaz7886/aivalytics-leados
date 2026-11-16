// src/utils/offeringTemplates.ts

export interface OfferingDefinition {
  id: 'workshop-3day' | 'ai-pm';
  name: string;
  shortName: string;
  badge: string;
  duration: string;
  schedule: string;
  price: number;
  regularPrice: number;
  description: string;
  keyHighlights: string[];
  certifications?: string[];
  targetAudience: string;
}

export const CORE_OFFERINGS: Record<'workshop-3day' | 'ai-pm', OfferingDefinition> = {
  'workshop-3day': {
    id: 'workshop-3day',
    name: 'AI Native Builder Program',
    shortName: 'AI Builder',
    badge: 'Hands-on Sprint',
    duration: 'Weekend Sprint',
    schedule: 'Friday Evening (7:00 PM – 10:00 PM IST) • Saturday (10:00 AM – 6:00 PM IST) • Sunday (10:00 AM – 6:00 PM IST)',
    price: 6999,
    regularPrice: 9999,
    description: 'An intensive, hands-on sprint where professionals build production-ready autonomous AI agents from scratch.',
    keyHighlights: [
      'Build 3 live production AI agents (Research, Workflow Automation, Multi-Modal)',
      'Hands-on orchestration with n8n, Claude 3.5 Sonnet & OpenAI API',
      'Live code reviews & troubleshooting by senior AI engineers',
      'Community access & production agent templates repository'
    ],
    targetAudience: 'Working Professionals, Tech Enthusiasts, PMs, Engineers, Founders looking to build immediately.'
  },
  'ai-pm': {
    id: 'ai-pm',
    name: 'AI Native PM Program',
    shortName: 'AI-Native PM',
    badge: 'Flagship 3-Month Master Program',
    duration: '3 Months',
    schedule: 'Every Saturday & Sunday (10:00 AM – 1:00 PM IST) + Midweek Strategy Office Hours',
    price: 49999,
    regularPrice: 75000,
    description: 'The premier industry-accredited program designed to transform Product & Project Managers into elite AI-Native PMs through 4 recognized industry certifications.',
    certifications: [
      'Certification 1: AI-Native Product Ideation & PRD Engineering',
      'Certification 2: Multi-Agent Workflows & Autonomous PM Systems',
      'Certification 3: Data-Driven AI Product Metrics & Continuous Evaluation',
      'Certification 4: Production AI Agent Capstone & Executive Defense'
    ],
    keyHighlights: [
      '4 Industry-recognized certifications across 12 intensive weeks',
      '1-on-1 strategy sessions with Maaz & Senior AI Product Leaders',
      'Comprehensive Capstone Project deployed to production portfolio',
      'Executive career positioning, resume overhaul, and hiring partner referrals'
    ],
    targetAudience: 'Product Managers, Project Managers, Engineering Managers, Consultants, and Senior Leaders.'
  }
};

/**
 * 1. AI Builder Program (₹6,999): In-Call Direct Sale & WhatsApp
 */
export const WORKSHOP_DIRECT_SALE_SCRIPT = {
  hook: "Hi [Name], I noticed you recently registered interest in learning hands-on AI building. I'm calling directly because our upcoming cohort is capping seats soon!",
  valuePitch: "In our AI Native Builder Program, you will build 3 real autonomous AI agents from scratch with live guidance from our senior AI architects.",
  inCallClose: "The regular enrollment fee is ₹9,999, but while I have you on the call right now, I can lock in your seat at ₹6,999. Can I drop the official seat confirmation link to your WhatsApp?",
  objectionNoTime: "That's exactly why we designed it for weekend delivery—zero disruption to your weekday job. Plus, all recordings and builder repositories are yours with lifetime access.",
  objectionBudget: "At ₹6,999 for complete hands-on agent building with live mentors, you gain practical proficiency that immediately elevates your earning power."
};

export function getWorkshopDirectSaleWhatsApp(leadName: string, batchDate?: string): string {
  const firstName = leadName.split(' ')[0] || leadName;
  const timing = batchDate || 'Upcoming Weekend Cohort';
  return `Hi ${firstName}! Great speaking with you on the call just now.

Here are the confirmed details for your seat in the *AI Native Builder Program*:

📅 *Schedule (${timing})*:
• Friday Evening: 7:00 PM – 10:00 PM IST
• Saturday Full Day: 10:00 AM – 6:00 PM IST
• Sunday Full Day: 10:00 AM – 6:00 PM IST

🚀 *What You Will Build*:
1. Autonomous Research & Data Synthesis Agent
2. Multi-Step Workflow Automation Engine (n8n & LLMs)
3. Production Multi-Modal AI Assistant

💳 *Enrollment Fee*: ₹6,999 (Regular ₹9,999)
⚡ *Official Secure Seat Checkout*: https://pages.razorpay.com/aiv-ai-builder

Once your enrollment is completed, your onboarding checklist and community lounge access will be activated immediately. Let me know once done!`;
}

/**
 * 2. AI Builder: Webinar Flow & Replay (No-Show 2nd Chance)
 */
export const WEBINAR_INVITATION_SCRIPT = {
  transition: "Let me invite you to our upcoming Live AI Masterclass where you can see our live demos and curriculum first.",
  pitch: "In this 75-minute live masterclass, our Lead AI Architect walks through how modern AI agents work and demonstrates live workflows.",
  close: "Let me lock in your complimentary pass right now and send the joining link to your WhatsApp."
};

export function getWebinarInviteWhatsApp(leadName: string, webinarDate?: string, webinarLink?: string): string {
  const firstName = leadName.split(' ')[0] || leadName;
  const dateStr = webinarDate || 'Upcoming Wednesday • 8:00 PM IST';
  const linkStr = webinarLink || 'https://meet.google.com/aiv-free-masterclass';
  return `Hi ${firstName}! As agreed on our call, here is your confirmed guest pass for our upcoming *Free AI Masterclass*:

📅 *Date & Time*: ${dateStr}
⏱️ *Duration*: 75 Minutes (Live Interactive Masterclass)
🔗 *Joining Link*: ${linkStr}

Add this to your calendar. Looking forward to having you join us live!`;
}

// Backward compatibility aliases
export const FREE_WEBINAR_FALLBACK_SCRIPT = WEBINAR_INVITATION_SCRIPT;
export const getFreeWebinarWhatsApp = getWebinarInviteWhatsApp;

export function getWebinarNoShowReplayWhatsApp(leadName: string, nextWebinarDate?: string): string {
  const firstName = leadName.split(' ')[0] || leadName;
  const nextDate = nextWebinarDate || 'Next Sunday at 11:00 AM IST';
  return `Hi ${firstName}! Noticed you couldn't make it to the Live Masterclass earlier today.

No worries—here is the session replay access so you don't miss out:
▶️ *Replay*: https://aivalytics.io/replay/ai-masterclass

Also, I have reserved a 2nd chance seat for you in our next live session on *${nextDate}*. Reply *CONFIRM* if you want me to lock in this pass!`;
}

/**
 * 3. AI-Native PM Program (₹49,999): The 4 Attempts
 */
export const AI_PM_PROGRAM_SCRIPT = {
  hook: "Hi [Name], reaching out regarding your profile and career transition into AI Product Management.",
  valuePitch: "Our flagship AI-Native PM program spans 3 months and covers 4 comprehensive industry certifications: from AI PRD Engineering, to Multi-Agent Autonomous Architectures, Data-Driven Evaluation, up to an Executive Production Capstone defense.",
  mentorPitch: "Because this is an intensive cohort with limited seats, we recommend scheduling a 15-minute 1-on-1 strategy call with our founder & Lead Mentor, Maaz, to review your transition roadmap.",
  attempt1Hook: "Hi [Name], reaching out regarding your interest in AI Product Management. Our flagship 3-month AI Native PM program transforms PMs into elite AI product leaders with 4 industry certifications.",
  attempt1Close: "Tuition is ₹49,999 with 3-month or 6-month no-cost EMI available (starting ₹8,333/mo). Can I share the enrollment link on your WhatsApp?",
  attempt2Mentor: "Because this program has high selective standards, let's set up a 15-minute 1-on-1 strategy call with our founder & Lead Mentor, Maaz, to review your transition roadmap.",
  attempt3Webinar: "If you'd like to see the complete curriculum defense and agent architectures first, join our 90-minute Zoom Masterclass this weekend.",
  attempt4Fallback: "If ₹49,999 or 3 months is too large a commitment right now, you can start with our weekend AI Native Builder Program for ₹6,999. It gives you immediate hands-on agent building skills and counts as credit toward AI-PM later."
};

export function getMentorMeetingWithMaazWhatsApp(leadName: string, meetingTime?: string): string {
  const firstName = leadName.split(' ')[0] || leadName;
  const timeStr = meetingTime || 'Tomorrow at 6:30 PM IST';
  return `Hi ${firstName}! As discussed, I've tentatively scheduled your 1-on-1 AI-PM strategy session with *Maaz* (Founder & Lead Mentor):

📅 *Date & Time*: ${timeStr}
⏱️ *Duration*: 15 Minutes
📍 *Google Meet Link*: https://meet.google.com/aiv-mentor-maaz

Agenda: Review your background, PM experience, and customized roadmap for transition into AI Product Leadership. See you then!`;
}

export function getAiPmFallbackToBuilderWhatsApp(leadName: string): string {
  const firstName = leadName.split(' ')[0] || leadName;
  return `Hi ${firstName}! Completely understand that the 3-month AI-PM Master Program (₹49,999) might be a larger commitment than you're looking for right now.

As discussed, you can start with our *AI Native Builder Weekend Program* for just *₹6,999*:
• Friday 7 PM – Sunday 6 PM IST
• Build 3 production AI agents in 1 weekend
• 100% of your ₹6,999 fee gets credited toward AI-PM if you choose to upgrade later!

👉 *Lock Your Seat (₹6,999)*: https://pages.razorpay.com/aiv-ai-builder

Let me know once enrolled and I'll confirm your seat!`;
}

export function getAiPmProgramWhatsApp(leadName: string): string {
  const firstName = leadName.split(' ')[0] || leadName;
  return `Hi ${firstName}! Thank you for your interest in our flagship *AI-Native Product Management (AI PM) Program*.

Here is the structural overview of the 3-Month curriculum and 4 Industry Certifications:

📜 *The 4 Industry Certifications*:
1. *AI-Native Product Ideation & PRD Engineering* (Custom GPTs, Claude 3.5, Context Windows)
2. *Multi-Agent Workflows & Autonomous PM Systems* (n8n, Multi-Agent Orchestration, Automation)
3. *Data-Driven AI Product Metrics & Continuous Evaluation* (Eval benchmarks, RAG metrics, latency/cost)
4. *Production AI Agent Capstone & Executive Defense* (Live deployed portfolio agent defense)

⏱️ *Duration*: 3 Months (Weekend Interactive Masterclasses + Midweek Strategy Office Hours)
🎓 *Mentorship*: Weekly 1-on-1 coaching with Maaz & Senior AI Product Leaders
💳 *Tuition*: ₹49,999 (No-cost EMI starting ₹4,500/month available)

⚡ *Curriculum Brochure & Enrollment*: https://aivalytics.io/ai-pm-program
Or reply to this message to schedule your 1-on-1 mentor qualification session!`;
}

/**
 * 4. Post-Webinar Dual Proposal Follow-up
 */
export function getPostWebinarDualProposalWhatsApp(leadName: string): string {
  const firstName = leadName.split(' ')[0] || leadName;
  return `Hi ${firstName}! Thank you for attending our Live AI Masterclass yesterday!

As proposed in the session, you can take your next step with either of our two career tracks:

Option A: *3-Day AI Builder Workshop* (Weekend Sprint)
• Friday 7 PM – Sunday 6 PM IST
• Hands-on build of 3 production AI agents in 1 weekend
• Special Webinar Fee: ₹2,999 (Regular ₹5,999)
👉 *Enroll 3-Day*: https://pages.razorpay.com/aiv-3day-builder

Option B: *AI-Native PM Master Program* (3 Months / 4 Certifications)
• 4 comprehensive certifications in 12 weeks
• 1-on-1 executive mentorship + production capstone portfolio
• Comprehensive career transition to Senior AI PM roles
👉 *Apply AI-PM*: https://pages.razorpay.com/aiv-ai-pm-enroll

Which option aligns best with your current goals? Let me know and I'll confirm your seat!`;
}
