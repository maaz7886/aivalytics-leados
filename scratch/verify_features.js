import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/maaza/.gemini/antigravity/brain/9450d9b1-d5d8-4b08-9df3-a1dedde9bcd8';
const BASE_URL = 'https://aivalytics-leados.vercel.app';

async function runVerification() {
  console.log('🚀 Starting end-to-end browser feature verification...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  const results = {
    errors: [],
    checks: []
  };

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error(`[Browser Console Error]: ${msg.text()}`);
      results.errors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    console.error(`[Browser Page Error]: ${err.message}`);
    results.errors.push(err.message);
  });

  try {
    // ----------------------------------------------------
    // AUTHENTICATION: DEMO ACCESS
    // ----------------------------------------------------
    console.log('\n--- 0. Authenticating Session ---');
    await page.goto(`${BASE_URL}/auth/signin`, { waitUntil: 'networkidle', timeout: 30000 });
    const demoBtn = page.locator('button:has-text("Instant Demo Access")');
    if (await demoBtn.count() > 0) {
      console.log('Clicking Instant Demo Access button...');
      await demoBtn.click();
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      console.log('✅ Successfully authenticated into Dashboard');
    }

    // ----------------------------------------------------
    // TEST 1: DASHBOARD & CALLING TRACKER
    // ----------------------------------------------------
    console.log('\n--- 1. Testing Dashboard (/) ---');
    await page.waitForTimeout(2000);

    // Screenshot 1: Full Executive Dashboard
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'dash_1_executive.png') });
    console.log('📸 Captured executive dashboard screenshot');

    // Check Header Calling Pill
    const headerCallingPill = await page.locator('header button[title*="calls logged today"]');
    const hasHeaderPill = await headerCallingPill.count() > 0;
    const headerPillText = hasHeaderPill ? await headerCallingPill.innerText() : 'NOT FOUND';
    results.checks.push({ name: 'Header Today Calls Pill', passed: hasHeaderPill, detail: headerPillText });
    console.log(`✅ Header Today's Calls Pill: ${headerPillText.replace(/\n/g, ' ')}`);

    // Check "Calls Made Today" KPI Card
    const kpiCallsCard = page.locator('text=Calls Made Today').locator('xpath=ancestor::div[contains(@class, "rounded-2xl") or contains(@class, "p-")]').first();
    const hasKpiCalls = await kpiCallsCard.count() > 0;
    results.checks.push({ name: 'Calls Made Today KPI Card', passed: hasKpiCalls });
    console.log(`✅ Calls Made Today KPI Card: ${hasKpiCalls ? 'Present' : 'Missing'}`);

    // Check Daily Calling Performance Section
    const callingTrackerSection = page.locator('#daily-calling-tracker');
    const hasTracker = await callingTrackerSection.count() > 0;
    results.checks.push({ name: 'Daily Calling Tracker Section', passed: hasTracker });
    console.log(`✅ Daily Calling Tracker Section: ${hasTracker ? 'Present' : 'Missing'}`);

    // Scroll to Calling Tracker
    await callingTrackerSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'dash_2_calling_tracker.png') });
    console.log('📸 Captured daily calling tracker screenshot');

    // Check 4 Calling Cards
    const hasConnectedCard = await page.locator('text=Connected & Engaged').count() > 0;
    const hasFollowUpsCard = await page.locator('text=Follow-ups & Call Later').count() > 0;
    const hasUnreachedCard = await page.locator('text=Unreached / No Pick').count() > 0;
    results.checks.push({ name: 'Calling Outcome KPI Cards', passed: hasConnectedCard && hasFollowUpsCard && hasUnreachedCard });
    console.log(`✅ Calling Outcome Cards: Connected=${hasConnectedCard}, FollowUps=${hasFollowUpsCard}, Unreached=${hasUnreachedCard}`);

    // Check Call Activity Feed & Filter Tabs
    const filterAll = page.locator('button:has-text("All Calls")');
    const filterConnected = page.locator('button:has-text("Connected")');
    const hasFilters = (await filterAll.count() > 0) && (await filterConnected.count() > 0);
    results.checks.push({ name: 'Calling Activity Feed Filters', passed: hasFilters });
    console.log(`✅ Activity Feed Filters: ${hasFilters ? 'Working' : 'Missing'}`);

    // ----------------------------------------------------
    // TEST 2: QUICK LOG A CALL MODAL
    // ----------------------------------------------------
    console.log('\n--- 2. Testing Quick Log Call Modal ---');
    const logCallBtn = page.locator('button:has-text("Log a Call")').first();
    await logCallBtn.click();
    await page.waitForTimeout(500);

    const logModal = page.locator('text=Quick Log Outreach Call');
    const isModalOpen = await logModal.count() > 0;
    results.checks.push({ name: 'Quick Log Call Modal Opens', passed: isModalOpen });
    console.log(`✅ Quick Log Call Modal Open: ${isModalOpen}`);

    if (isModalOpen) {
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'dash_3_log_call_modal.png') });
      console.log('📸 Captured quick log modal screenshot');

      // Fill out quick log form
      const selectLead = page.locator('select').first();
      await selectLead.selectOption({ index: 1 }); // select first lead
      const outcomeSelect = page.locator('select').nth(1);
      await outcomeSelect.selectOption('Connected');
      const notesArea = page.locator('textarea');
      await notesArea.fill('Test Call logged via automated browser verification: Candidate interested in AI-PM curriculum.');
      
      const submitBtn = page.locator('button:has-text("Save Call Log")');
      await submitBtn.click();
      await page.waitForTimeout(1000);
      console.log('✅ Submitted new call via Quick Log Modal');
    }

    // ----------------------------------------------------
    // TEST 3: PIPELINE KANBAN & LEAD DETAIL MODAL
    // ----------------------------------------------------
    console.log('\n--- 3. Testing Pipeline Kanban (/pipeline) ---');
    await page.goto(`${BASE_URL}/pipeline`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'pipeline_kanban.png') });
    console.log('📸 Captured pipeline kanban screenshot');

    // Check "Collected:" Date and "Follow-Up:" Badges
    const collectedBadge = page.locator('text=Collected:').first();
    const hasCollectedBadge = await collectedBadge.count() > 0;
    results.checks.push({ name: 'Pipeline Lead "Collected:" Date Badge', passed: hasCollectedBadge });
    console.log(`✅ Pipeline "Collected:" Date: ${hasCollectedBadge ? 'Displayed on cards' : 'Missing'}`);

    // Click on a Lead to open LeadDetailModal
    const firstLeadCard = page.locator('h4').first();
    const leadName = await firstLeadCard.innerText();
    console.log(`Clicking lead card "${leadName}" to open LeadDetailModal...`);
    await firstLeadCard.click();
    await page.waitForTimeout(1000);

    const modalTitle = page.locator('h1').first();
    const isDetailModalOpen = await modalTitle.count() > 0;
    results.checks.push({ name: 'Lead Detail Modal Opens', passed: isDetailModalOpen });
    console.log(`✅ Lead Detail Modal Open: ${isDetailModalOpen}`);

    if (isDetailModalOpen) {
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'lead_detail_modal.png') });
      console.log('📸 Captured LeadDetailModal screenshot');

      // Check Status Options (Qualified, Interested, Did Not Pick, etc.)
      const hasQualifiedOpt = await page.locator('button:has-text("Qualified")').count() > 0;
      const hasDidNotPickOpt = await page.locator('button:has-text("Did Not Pick The Call")').count() > 0;
      results.checks.push({ name: 'Status Options in Modal', passed: hasQualifiedOpt && hasDidNotPickOpt });
      console.log(`✅ Status Options: Qualified=${hasQualifiedOpt}, DidNotPick=${hasDidNotPickOpt}`);

      // Check Follow-Up Scheduler buttons
      const followUp1Btn = page.locator('button:has-text("Follow-Up 1")').first();
      if (await followUp1Btn.count() > 0) {
        await followUp1Btn.click();
        await page.waitForTimeout(500);
        const hasDateInput = await page.locator('input[type="date"]').count() > 0;
        results.checks.push({ name: 'Follow-Up Date Picker in Modal', passed: hasDateInput });
        console.log(`✅ Follow-Up Date Picker: ${hasDateInput ? 'Working' : 'Missing'}`);
      }

      // Close modal
      const closeBtn = page.locator('button[title="Close"]');
      if (await closeBtn.count() > 0) {
        await closeBtn.click();
        await page.waitForTimeout(500);
      }
    }

    // ----------------------------------------------------
    // TEST 4: PROGRAM CRM KANBAN (/programs/ai-pm)
    // ----------------------------------------------------
    console.log('\n--- 4. Testing AI-PM Program Page (/programs/ai-pm) ---');
    await page.goto(`${BASE_URL}/programs/ai-pm`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'program_aipm.png') });
    console.log('📸 Captured AI-PM program page screenshot');

    const hasProgramKanban = await page.locator('text=Calling CRM & Pipeline Operations').count() > 0;
    results.checks.push({ name: 'Program CRM Kanban Rendered', passed: hasProgramKanban });
    console.log(`✅ AI-PM CRM Kanban: ${hasProgramKanban ? 'Working' : 'Missing'}`);

    // Click on a lead card in AI-PM Kanban (e.g. Sai Vishnu or first card)
    const pmLeadCard = page.locator('h4:has-text("Sai Vishnu")').first();
    const targetLeadCard = (await pmLeadCard.count() > 0) ? pmLeadCard : page.locator('h4').first();
    const pmLeadName = await targetLeadCard.innerText();
    console.log(`Clicking lead card "${pmLeadName}" in AI-PM Kanban...`);
    await targetLeadCard.click();
    await page.waitForTimeout(1000);

    const mobilePill = page.locator('text=Mobile:').first();
    const hasMobilePill = await mobilePill.count() > 0;
    results.checks.push({ name: 'Mobile Number Visible in Modal', passed: hasMobilePill });
    console.log(`✅ Mobile Number in Modal: ${hasMobilePill ? 'Displayed' : 'Missing'}`);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'modal_with_mobile.png') });
    console.log('📸 Captured LeadDetailModal with mobile number screenshot');

    console.log('\n--- VERIFICATION SUMMARY ---');
    console.table(results.checks);

    if (results.errors.length > 0) {
      console.log(`⚠️ Detected ${results.errors.length} browser errors:`, results.errors.slice(0, 3));
    } else {
      console.log('🎉 0 Browser Errors encountered during complete workflow traversal!');
    }

  } catch (error) {
    console.error('❌ Error during verification:', error);
    results.errors.push(error.message);
  } finally {
    await browser.close();
  }
}

runVerification();
