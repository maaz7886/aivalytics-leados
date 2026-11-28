# LeadOS — Sales Representative User Guide & Standard Operating Procedure (SOP)

> **Platform URL:** [https://aivalytics-leados.vercel.app](https://aivalytics-leados.vercel.app)  
> **Direct Workspace Link:** [https://aivalytics-leados.vercel.app/today](https://aivalytics-leados.vercel.app/today)  
> **Target Audience:** Admissions & Growth Representatives  
> **Version:** 2.5 (Personal Workspace, Kanban Pipeline & Power Calling Mode)

---

## 1. Quick Start & Login

Every sales representative has a dedicated, secure account. Authentication is required whenever you open LeadOS in a new tab or browser session.

```mermaid
flowchart LR
    A["Open Platform URL"] --> B["Enter Work Email & Password"]
    B --> C["Automatic Redirect to Personal Workspace (/today)"]
    C --> D["Assigned Calling Queue & Kanban Loaded"]
```

### Sign-In Steps
1. Navigate to [https://aivalytics-leados.vercel.app/auth/signin](https://aivalytics-leados.vercel.app/auth/signin).
2. Enter your registered work email and your assigned password.
3. Click **Sign in to LeadOS**.
4. You will land directly on your personal **My Day** workspace (`/today`).

> [!IMPORTANT]
> **Data Privacy**: Your workspace displays only the leads assigned to you within your program focus, keeping your calling queue clean and distraction-free.

---

## 2. Navigating Your Workspace

Your workspace is built for fast, focused admissions outreach:

```
┌─────────────────────────┬───────────────────────────────────────────────────────────────────────┐
│  AIValytics LeadOS      │ Top Metrics: Today's Calls | Connected Calls | Revenue | Overdue      │
├─────────────────────────┼───────────────────────────────────────────────────────────────────────┤
│  TODAY                  │ [Priority Queue]  [All Assigned Leads]  [Kanban Pipeline]  [Call Log] │
│  📅 My Day (/today)     │                                                                       │
│                         │  1. Overdue Follow-ups                                                │
│  ENABLEMENT             │  2. Hot Leads (High Fit Score ≥ 80)                                   │
│  📖 Programs & scripts  │  3. New Leads (<15m Response SLA)                                     │
│                         │  4. Today's Callbacks                                                 │
│  [👤 Rep Name] [Logout] │  5. Payment Pending                                                   │
└─────────────────────────┴───────────────────────────────────────────────────────────────────────┘
```

* **My Day (`/today`)**: Your primary cockpit containing daily target metrics, 5 priority queues, your assigned leads table, your drag-and-drop Kanban Pipeline, and your call activity log.
* **Programs & scripts (`/programs`)**: Pitch scripts, curriculum syllabus links, objection handling playbooks, and webinar replays.
* **Kanban Pipeline**: Top-right button (or tab) to switch between your Priority Queue and visual Kanban board.
* **Start Calling Mode**: Top-right blue button to launch the distraction-free **Power Dialer**.

---

## 3. The 5 Priority Action Queues

On `/today`, your leads are automatically sorted into five prioritized queues. Work through them **from top to bottom**:

```mermaid
flowchart TD
    Q1["1. Overdue Follow-ups<br/>(Immediate Attention — SLA Breach Risk)"]
    Q2["2. Hot Leads<br/>(Fit Score ≥ 80, High Intent, Ready to Convert)"]
    Q3["3. New Leads<br/>(Fresh Inbound Submissions — Call within 15 mins)"]
    Q4["4. Today's Callbacks<br/>(Scheduled Appointments for Today)"]
    Q5["5. Payment Pending<br/>(Checkout Links Sent — Follow Up for Payment)"]

    Q1 --> Q2
    Q2 --> Q3
    Q3 --> Q4
    Q4 --> Q5
```

### Queue Breakdown

1. **Overdue Follow-ups (Red Badge)**:
   * **Why**: Candidates you promised to call back whose scheduled time has passed.
   * **Rule**: Clear all overdue items before 11:00 AM every morning.
2. **Hot Leads (Orange Badge)**:
   * **Why**: High-intent candidates with strong experience and background match (Fit Score ≥ 80).
   * **Rule**: Pitch cohort admission and 1-on-1 strategy sessions directly.
3. **New Leads (Blue Badge)**:
   * **Why**: Newly assigned inbound leads.
   * **Rule**: Contact within **15 minutes** to maximize conversion.
4. **Today's Callbacks (Slate Badge)**:
   * **Why**: Candidates who asked to be called at a specific time today.
   * **Rule**: Dial within ±5 minutes of the agreed time.
5. **Payment Pending (Green Badge)**:
   * **Why**: Candidates who agreed to enroll and received a payment link.
   * **Rule**: Assist with credit card/EMI or net banking queries to close the enrollment.

---

## 4. Using the Kanban Pipeline

You can manage your entire personal pipeline visually using **Kanban Mode**:

1. Click **Kanban Pipeline** in the top-right header (or select the **Kanban Pipeline** tab on `/today`).
2. Leads are grouped across 8 pipeline columns:
   * `New Lead` → `Call Pending` → `Connected` → `Interested` → `Qualified` → `Payment Pending` → `Converted` → `Lost`
3. **Drag & Drop**: Drag any lead card from one column to another to update its stage automatically.
   * Dropping a card into **Lost** opens a prompt to record the lost reason.
4. **Quick Actions**: Hover over any card for one-click **Call** or **WhatsApp**, or click the card to open its full **Lead Panel**.
5. Click **Back to Queue** (or the **Priority Action Queue** tab) anytime to return to your daily calling list.

---

## 5. How to Handle a Lead (Step-by-Step)

### Step 1: Pre-Call Preparation (30 Seconds)
Click **Details** on any lead card to open the **Lead Inspection Panel**:
* Review **Current Role & Experience** (e.g. *Senior Project Lead, 8 yrs*).
* Check **Primary Goal** (e.g. *Transitioning to AI-Native workflows*).
* Read **Comments & Past Activity** to see their context and prior touchpoints.

### Step 2: Placing the Call
* Click the phone number or the **Call** button to initiate the dial on your phone or softphone.
* Use the **Recommended Opening Script** displayed on the screen:
  > *"Hi [Candidate Name], this is [Your Name] from AIValytics. I noticed you submitted an application for our [Program Name] cohort regarding your transition as a [Current Role]. Do you have 3 quick minutes?"*

### Step 3: Fast Qualification & Objection Handling
While speaking, check the **Qualification** tab in the Lead Panel to record:
* **Current AI Usage**: Beginner / Intermediate / Advanced.
* **Timeline**: Immediate / Next Cohort.
* **Budget / Payment Preference**: Full / EMI.
* Use the **Objections** tab if the candidate asks about fee, live vs. recorded sessions, or time commitment.

### Step 4: One-Click Quick Logging
Immediately after hanging up, click **Log Call**:
1. Select the **Outcome**:
   * `Connected — Interested`
   * `Connected — Follow-up Needed`
   * `Connected — Payment Pending`
   * `Did Not Pick / Busy`
   * `Unqualified / Not Interested`
2. Enter a short note (e.g. *"Spoke to candidate. Strong background. Sent brochure on WhatsApp. Scheduled callback for tomorrow 3 PM."*).
3. Set the **Next Action Date & Time**.
4. Click **Save Call Log**. Your daily call metrics update in real time.

---

## 6. WhatsApp Outreach & Instant Follow-Ups

LeadOS includes pre-formatted WhatsApp templates that open directly in WhatsApp Web with the candidate's phone number pre-filled:

1. Click the **WhatsApp** icon on the lead card.
2. Select your template:
   * **Welcome & Curriculum Brochure**: Sends the syllabus PDF link.
   * **Missed Call Notification**: *"Hi [Name], tried reaching you regarding your AIValytics application..."*
   * **Webinar Confirmation**: Live joining link and schedule for the 3-Day Workshop.
   * **Secure Checkout Link**: Direct link to the Razorpay checkout.
3. Click **Send** in WhatsApp Web.

---

## 7. Power Calling Mode (High-Velocity Outreach)

When you need to make continuous calls (e.g. dialing 20–30 new leads or callbacks), use **Calling Mode**:

```mermaid
sequenceDiagram
    participant Rep as Salesperson
    participant App as LeadOS Calling Mode
    participant Lead as Candidate

    Rep->>App: Click "Start Calling Mode"
    App->>Rep: Loads Lead #1 with Opening Script & Context
    Rep->>Lead: Dials Phone / Sends WhatsApp
    Rep->>App: Selects Outcome & Sets Next Callback
    App->>Rep: Auto-advances to Lead #2 in 3 seconds
```

1. Click **Start Calling Mode** (top-right of `/today`).
2. The screen switches to a focused, distraction-free dialer.
3. The lead's background, past notes, and phone number appear clearly.
4. Click **Dial** or **WhatsApp**.
5. Log your notes in the right sidebar.
6. Click **Next Candidate** (or press `Ctrl + Enter`) to auto-advance.

---

## 8. Generating Payment Links & Closing Admissions

When a candidate agrees to enroll:

1. In the lead panel or quick actions, click **Send Payment Link**.
2. **Program Fees**:
   * **AI-Native Project Management (AI-PM)**: ₹49,999 (Full) or 3-Month No-Cost EMI.
   * **3-Day AI Builder Workshop**: ₹6,999 (or Free Webinar pass).
   * **Upgrade Offer**: Any AI Builder alumni receives a ₹6,999 tuition credit toward AI-PM.
3. Share the Razorpay checkout link via WhatsApp.
4. Update the stage to **Payment Pending**.
5. Once payment completes, the lead updates to **Converted** and revenue is added to your daily progress bar.

---

## 9. Daily Sales Hygiene & Checklist

To maintain pipeline health and conversion rates, complete this daily checklist before logging out:

- [ ] **Zero Overdue Tasks**: Clear all red overdue callbacks first thing in the morning.
- [ ] **<15 Min New Lead SLA**: Dial every newly assigned inbound lead within 15 minutes.
- [ ] **Next Action Scheduled**: Never leave an active lead without a scheduled next task date.
- [ ] **Call Log Completeness**: Every dial must have an outcome and 1-sentence note logged.
- [ ] **Daily Call Target**: Hit your minimum daily dial target (25–30 calls/day).

---

## 10. FAQs & Troubleshooting

### Q: Why don't I see any leads in my queue?
* Verify you are signed in with your own work email and password.
* Check the **All Assigned Leads** or **Kanban Pipeline** tab to see leads across all stages, including those scheduled for future dates.

### Q: Why does opening `/today` in a new tab ask me to sign in again?
* LeadOS uses strict session-based authentication so confidential candidate phone numbers and pipeline records stay protected whenever a link is opened in a new tab or browser. Simply sign in with your work email and password to resume.

---

*LeadOS Admissions Support • AIValytics India • Build · Learn · Deploy*
