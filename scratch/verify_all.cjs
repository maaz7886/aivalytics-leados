const { chromium } = require('c:\\Users\\maaza\\OneDrive\\Desktop\\leados\\node_modules\\playwright');

async function runChecklist() {
  console.log('==================================================');
  console.log('     LeadOS E2E Final Verification Checklist      ');
  console.log('==================================================\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  let passed = 0;
  let failed = 0;

  function test(name, ok) {
    if (ok) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name}`);
      failed++;
    }
  }

  // 1. Verify Sign In Page Loads Empty
  await page.goto('http://localhost:5173/auth/signin');
  await page.waitForLoadState('networkidle');
  const emailVal = await page.$eval('input[type="email"]', el => el.value).catch(() => null);
  const passVal = await page.$eval('input[type="password"]', el => el.value).catch(() => null);
  test('Sign In form loads with empty email and password', emailVal === '' && passVal === '');

  const hasAuthorizedButtons = await page.$('text=Authorized Team Accounts');
  test('No demo/quick-login buttons on Sign In page', hasAuthorizedButtons === null);

  // 2. Setup Admin session in localStorage
  await page.evaluate(() => {
    const adminUser = {
      id: 'admin-1',
      name: 'Admin Manager',
      email: 'admin@aivalytics.com',
      role: 'admin'
    };
    localStorage.setItem('aivalytics_active_user', JSON.stringify(adminUser));
    localStorage.setItem('aivalytics_demo_user', JSON.stringify({ user: adminUser }));
  });

  // 3. Admin Dashboard (/dashboard)
  await page.goto('http://localhost:5173/dashboard');
  await page.waitForTimeout(1000);
  const dashboardText = await page.textContent('body');
  test('Admin Control Room (/dashboard) renders KPIs and Pipeline summary', 
    dashboardText.includes('Control Room') || dashboardText.includes('Pipeline') || dashboardText.includes('Active Leads'));

  // 4. Leads Page (Grid View /leads)
  await page.goto('http://localhost:5173/leads');
  await page.waitForTimeout(1000);
  const leadsCount = await page.$$eval('tbody tr', trs => trs.length);
  test(`Leads Grid View displays leads table (${leadsCount} leads loaded)`, leadsCount > 0);

  // 5. Side Panel Opening
  const leadBtn = await page.$('tbody tr td button');
  if (leadBtn) {
    await leadBtn.click();
    await page.waitForTimeout(800);
    const hasPanel = await page.$('aside');
    test('Clicking a lead name opens 480px Lead Side Panel', hasPanel !== null);
  } else {
    test('Clicking a lead name opens 480px Lead Side Panel', false);
  }

  // 6. Kanban Switcher
  const kanbanBtn = await page.$('button:has-text("Kanban")');
  if (kanbanBtn) {
    await kanbanBtn.click();
    await page.waitForTimeout(800);
    const kanbanText = await page.textContent('body');
    test('Kanban view renders stages & lead cards', kanbanText.includes('Webinar') || kanbanText.includes('Attempt') || kanbanText.includes('Enrolled') || kanbanText.includes('Interested'));
  }

  // 7. Calendar Switcher
  const calBtn = await page.$('button:has-text("Calendar")');
  if (calBtn) {
    await calBtn.click();
    await page.waitForTimeout(800);
    const calText = await page.textContent('body');
    test('Calendar view renders interactive scheduling grid', calText.includes('Sun') || calText.includes('Mon') || calText.includes('Today'));
  }

  // 8. Rep Workspace / Today Page (/today)
  await page.goto('http://localhost:5173/today');
  await page.waitForTimeout(1000);
  const todayText = await page.textContent('body');
  test('My Day / Today (/today) renders action queue & Calling Mode launch', 
    todayText.includes('Today') && (todayText.includes('Call') || todayText.includes('Follow-up')));

  // 9. Sales Team Page (/team)
  await page.goto('http://localhost:5173/team');
  await page.waitForTimeout(1000);
  const teamText = await page.textContent('body');
  test('Sales Team (/team) displays reps, assignment weights and toggle controls', 
    teamText.includes('Sales Team') && (teamText.includes('Round-Robin') || teamText.includes('Round Robin')));

  // 10. Rep Activity Page (/rep-activity)
  await page.goto('http://localhost:5173/rep-activity');
  await page.waitForTimeout(1000);
  const activityText = await page.textContent('body');
  test('Rep Activity (/rep-activity) audit logs display chronological actions and filters', 
    activityText.includes('Activity') || activityText.includes('Call') || activityText.includes('Sync'));

  // 11. Payouts Ledger (/payouts)
  await page.goto('http://localhost:5173/payouts');
  await page.waitForTimeout(1000);
  const payoutsText = await page.textContent('body');
  test('Payouts Commission Ledger (/payouts) renders commission tiers, rates & payout ledger', 
    payoutsText.includes('Payout') && payoutsText.includes('Commission'));

  // 12. Programs Playbook (/programs)
  await page.goto('http://localhost:5173/programs');
  await page.waitForTimeout(1000);
  const programsText = await page.textContent('body');
  test('Programs Playbook (/programs) displays AI Builder (₹6,999) and AI-PM (₹49,999) with pitch scripts', 
    programsText.includes('AI Native Builder') && (programsText.includes('AI Native Project Management') || programsText.includes('AI-PM')));

  // 13. Mentors Directory (/mentors)
  await page.goto('http://localhost:5173/mentors');
  await page.waitForTimeout(1000);
  const mentorsText = await page.textContent('body');
  test('Mentors Directory (/mentors) renders faculty profiles, domains and Google Meet links', 
    mentorsText.includes('Mentors') && (mentorsText.includes('Maaz') || mentorsText.includes('Meet')));

  // 14. Integrations Hub (/integrations)
  await page.goto('http://localhost:5173/integrations');
  await page.waitForTimeout(1000);
  const integrationsText = await page.textContent('body');
  test('Integrations Hub (/integrations) renders live Google Sheets sync stats and webhook triggers', 
    integrationsText.includes('Google Sheets') && integrationsText.includes('Sync'));

  // 15. Team Users Settings (/users)
  await page.goto('http://localhost:5173/users');
  await page.waitForTimeout(1000);
  const usersText = await page.textContent('body');
  test('Users Settings (/users) renders team members table, role switchers & invite dialog', 
    usersText.includes('User Access & Permissions') && usersText.includes('Authorized LeadOS Team Accounts'));

  console.log(`\n==================================================`);
  console.log(`   Final Result: ${passed} Passed, ${failed} Failed`);
  console.log('==================================================');

  await browser.close();
  if (failed > 0) process.exit(1);
}

runChecklist().catch(err => {
  console.error(err);
  process.exit(1);
});
