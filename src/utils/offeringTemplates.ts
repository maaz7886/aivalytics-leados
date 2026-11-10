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
    name: '3-Day AI Builder Workshop',
    shortName: '3-Day Workshop',
    badge: 'Weekend Intensive',
    duration: '3 Days (Weekend)',
    schedule: 'Friday Evening (7:00 PM – 10:00 PM IST) • Saturday Full Day (10:00 AM – 6:00 PM IST) • Sunday Full Day (10:00 AM – 6:00 PM IST)',
    price: 2999,
    regularPrice: 5999,
    description: 'An intensive, hands-on 3-day sprint where professionals learn and build production-ready autonomous AI agents from scratch in one weekend.',
    keyHighlights: [
      'Build 3 live production AI agents (Research Agent, Workflow Automation Agent, Multi-Modal Assistant)',
      'Hands-on orchestration with n8n, Flowise, Claude 3.5 Sonnet & OpenAI API',
      'Live code reviews & troubleshooting by senior AI engineers',
      'Lifetime community access & agent templates repository'
    ],
    targetAudience: 'Working Professionals, Tech Enthusiasts, PMs, Engineers, Founders looking to build immediately.'
  },
  'ai-pm': {
    id: 'ai-pm',
    name: 'AI-Native Product Management (AI PM) Program',
    shortName: 'AI-Native PM',
    badge: 'Flagship 3-Month Master Program',
    duration: '3 Months',
    schedule: 'Every Saturday & Sunday (10:00 AM – 1:00 PM IST) + Midweek Mentor Strategy Office Hours',
    price: 49999,
    regularPrice: 75000,
    description: 'The premier industry-accredited program designed to transform Product & Project Managers into elite AI-Native PMs through 4 recognized industry certifications.',
    certifications: [
      'Certification 1: AI-Native Product Ideation & PRD Engineering',
      'Certification 2: Multi-Agent Workflows & Autonomous PM Systems',
      'Certification 3: Data-Driven AI Product Metrics & Continuous Evaluation',
      'Certification 4: Production AI Agent Capstone & Executive Boardroom Defense'
    ],
    keyHighlights: [
      '4 Industry-recognized certifications across 12 intensive weeks',
      'Weekly 1-on-1 strategy sessions with Senior AI Product Leaders & Scientists',
      'Comprehensive Capstone Project built and deployed to production portfolio',
      'Executive career positioning, resume overhaul, and hiring partner referrals'
    ],
    targetAudience: 'Product Managers, Project Managers, Engineering Managers, Consultants, and Senior Leaders.'
  }
};

/**
 * 1. 3-Day Workshop: Direct In-Call Selling Script & WhatsApp Checkout
 */
export const WORKSHOP_DIRECT_SALE_SCRIPT = {
  hook: "Hi [Name], I noticed you recently registered interest in learning hands-on AI building. I'm calling directly because our upcoming weekend cohort kicks off this Friday evening!",
  valuePitch: "This is our intensive 3-Day AI Builder Workshop. We meet Friday evening from 7 to 10 PM, then full days Saturday and Sunday from 10 AM to 6 PM. In just 3 days, you will build 3 real autonomous AI agents from scratch with live support from our AI architects.",
  inCallClose: "The regular fee is ₹5,999, but while I have you on the call right now, I can authorize our direct-call enrollment benefit of ₹2,999. Can I drop the official seat confirmation link to your WhatsApp so we can confirm your cohort seat before it caps?",
  objectionNoTime: "That's exactly why we designed it for Friday evening and the weekend—no disruption to your workday. Plus, all recordings and builder repositories are yours with lifetime access.",
  objectionBudget: "At ₹2,999 for 3 full days with live senior mentors building 3 working agents, it's less than ₹1,000 per day for complete hands-on AI proficiency."
};

export function getWorkshopDirectSaleWhatsApp(leadName: string, batchDate?: string): string {
  const firstName = leadName.split(' ')[0] || leadName;
  const timing = batchDate || 'Upcoming Weekend (Friday 7 PM - Sunday 6 PM IST)';
  return `Hi ${firstName}! Great speaking with you on the call just now.

Here are the confirmed details for your seat in the *3-Day AI Builder Workshop*:

📅 *Schedule (${timing})*:
• Friday Evening: 7:00 PM – 10:00 PM IST
• Saturday Full Day: 10:00 AM – 6:00 PM IST
• Sunday Full Day: 10:00 AM – 6:00 PM IST

🚀 *What You Will Build*:
1. Autonomous Research & Data Synthesis Agent
2. Multi-Step Workflow Automation Engine (n8n & LLMs)
3. Production Multi-Modal AI Assistant

💳 *Special In-Call Enrollment Fee*: ₹2,999 (Regular ₹5,999)
⚡ *Official Secure Seat Checkout*: https://pages.razorpay.com/aiv-3day-builder

Once your enrollment is completed, your builder onboarding checklist and Discord lounge access will be activated immediately. Let me know once done!`;
}

/**
 * 2. Fallback: Free Webinar Invitation (If candidate does not buy on direct call)
 */
export const FREE_WEBINAR_FALLBACK_SCRIPT = {
  transition: "I completely understand if you'd like to experience our live teaching and curriculum first before committing to the paid workshop. Let's do this: I have a few guest passes for our upcoming Free Live AI Masterclass.",
  pitch: "In this 75-minute live masterclass, our Lead AI Architect walks through how modern AI agents work, and we break down both our 3-Day Builder Workshop and our flagship 3-Month AI-Native PM Program. You can see the live demos and decide which path fits your career best.",
  close: "Let me lock in your complimentary pass right now and send the joining link to your WhatsApp. Does that work for you?"
};

export function getFreeWebinarWhatsApp(leadName: string, webinarDate?: string, webinarLink?: string): string {
  const firstName = leadName.split(' ')[0] || leadName;
  const dateStr = webinarDate || 'Upcoming Wednesday • 8:00 PM IST';
  const linkStr = webinarLink || 'https://meet.google.com/aiv-free-masterclass';
  return `Hi ${firstName}! As agreed on our call, here is your confirmed guest pass for our upcoming *Free AI Masterclass & Curriculum Walkthrough*:

📅 *Date & Time*: ${dateStr}
⏱️ *Duration*: 75 Minutes (Live Interactive Masterclass)
🔗 *Joining Link*: ${linkStr}

🎯 *Masterclass Agenda*:
1. Live Demo: How AI Agents automate complex PM & tech workflows
2. Overview of the *3-Day AI Builder Weekend Workshop* (Hands-on building Fri-Sun)
3. Overview of the *AI-Native PM Flagship Program* (4 Certifications in 3 Months)
4. Live Q&A with Senior Mentors & Industry Leaders

Add this to your calendar. Looking forward to having you join us live!`;
}

/**
 * 3. AI-Native PM Program (3 Months / 4 Certifications)
 */
export const AI_PM_PROGRAM_SCRIPT = {
  hook: "Hi [Name], I'm reaching out regarding your profile and career transition into AI Product Management.",
  valuePitch: "Our flagship AI-Native PM program spans 3 months and covers 4 comprehensive industry certifications: from AI PRD Engineering, to Multi-Agent Autonomous Architectures, Data-Driven Evaluation, up to an Executive Production Capstone defense.",
  mentorPitch: "Because this is an intensive cohort with limited seats, we recommend scheduling a 15-minute 1-on-1 strategy call with our Lead Mentor to review your current experience and align on your transition goals."
};

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
🎓 *Mentorship*: Weekly 1-on-1 coaching with Ex-FAANG & Senior AI Product Leaders
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
