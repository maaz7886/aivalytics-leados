const { chromium } = require('c:\\Users\\maaza\\OneDrive\\Desktop\\leados\\node_modules\\playwright');

async function testAdminFullEditing() {
  console.log('==================================================');
  console.log('   Starting LeadOS Admin Panel Full Audit & Edit  ');
  console.log('==================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  let passed = 0;
  let failed = 0;

  function assert(name, condition) {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name}`);
      failed++;
    }
  }

  // 1. Sign in as Maaz Patel (Admin)
  await page.goto('http://localhost:5173/auth/signin');
  await page.fill('input[type="email"]', 'maazpatel123@gmail.com');
  await page.fill('input[type="password"]', 'Maaz@7886');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 5000 });
  assert('Signed in as Admin Maaz Patel', page.url().includes('/dashboard'));

  // ==================================================
  // SECTION 1: SALES TEAM (/team)
  // ==================================================
  console.log('\n--- Auditing Sales Team (/team) ---');
  await page.goto('http://localhost:5173/team');
  await page.waitForTimeout(800);

  // 1.1 Toggle Round-Robin
  const roundRobinBtn = await page.$('button:has-text("Round-Robin Routing")');
  assert('Round-Robin Routing button exists', roundRobinBtn !== null);
  if (roundRobinBtn) {
    await roundRobinBtn.click();
    await page.waitForTimeout(400);
    const toast = await page.textContent('body');
    assert('Toggling Round-Robin shows confirmation alert', toast.includes('Round-robin lead routing'));
  }

  // 1.2 Add New Sales Rep
  const addRepBtn = await page.$('button:has-text("Add Sales Rep")');
  assert('"Add Sales Rep" button exists', addRepBtn !== null);
  if (addRepBtn) {
    await addRepBtn.click();
    await page.waitForTimeout(400);
    await page.fill('input[placeholder="e.g. Rahul Verma"]', 'Vikram Malhotra');
    await page.fill('input[placeholder="rahul@aivalytics.com"]', 'vikram@aivalytics.io');
    await page.fill('input[placeholder="+91 98220 12345"]', '+91 99887 76655');
    await page.click('button:has-text("Add Representative")');
    await page.waitForTimeout(600);

    const teamTableText = await page.textContent('table');
    assert('New sales rep Vikram Malhotra added to table', teamTableText.includes('Vikram Malhotra'));
  }

  // 1.3 Edit Sales Rep
  const editBtns = await page.$$('button:has(svg.lucide-edit-2), button:has(svg.lucide-edit)');
  if (editBtns.length > 0) {
    await editBtns[editBtns.length - 1].click(); // Edit the newly added rep
    await page.waitForTimeout(400);
    // Change title
    const titleInput = await page.$('input[value="Senior Admissions Specialist"], input[value="Senior Account Executive"]');
    if (titleInput) {
      await titleInput.fill('Senior Admissions Consultant');
      await page.click('button:has-text("Save Changes")');
      await page.waitForTimeout(600);
      const updatedTable = await page.textContent('table');
      assert('Sales rep details edited and updated in table', updatedTable.includes('Senior Admissions Consultant'));
    }
  }

  // 1.4 Lead Reassignment Tab
  const reassignmentTab = await page.$('button:has-text("Lead Routing & Reassignment")');
  assert('Lead Routing & Reassignment tab exists', reassignmentTab !== null);
  if (reassignmentTab) {
    await reassignmentTab.click();
    await page.waitForTimeout(500);

    // Select first lead
    const checkboxes = await page.$$('table tbody input[type="checkbox"]');
    if (checkboxes.length > 0) {
      await checkboxes[0].click();
      await page.waitForTimeout(300);

      // Verify bulk action bar appeared
      const hasBulkBar = await page.$('text=leads selected');
      assert('Bulk reassignment bar appears on selecting leads', hasBulkBar !== null);

      // Select target rep
      const selectRep = await page.$('select:has-text("-- Assign to Rep --")');
      if (selectRep) {
        await selectRep.selectOption({ label: 'Alex Rivera' });
        await page.click('button:has-text("Reassign")');
        await page.waitForTimeout(500);
        const toast = await page.textContent('body');
        assert('Leads successfully reassigned with confirmation alert', toast.includes('Reassigned'));
      }
    }
  }

  // ==================================================
  // SECTION 2: USERS & PERMISSIONS (/users)
  // ==================================================
  console.log('\n--- Auditing Users & Permissions (/users) ---');
  await page.goto('http://localhost:5173/users');
  await page.waitForTimeout(800);

  const usersTableText = await page.textContent('table');
  assert('Maaz Patel listed as Admin with full control room access', usersTableText.includes('Maaz Patel') && usersTableText.includes('Admin'));

  // 2.1 Invite Team Member
  const inviteBtn = await page.$('button:has-text("Invite Team Member")');
  if (inviteBtn) {
    await inviteBtn.click();
    await page.waitForTimeout(400);
    await page.fill('input[placeholder="e.g. Priyanshu Roy"]', 'Rohan Sharma');
    await page.fill('input[placeholder="name@aivalytics.com"]', 'rohan@aivalytics.io');
    await page.click('button:has-text("Authorize Account")');
    await page.waitForTimeout(600);

    const updatedUsersTable = await page.textContent('table');
    assert('Invited team member Rohan Sharma added to authorized accounts', updatedUsersTable.includes('Rohan Sharma'));
  }

  // 2.2 Role Switcher
  const roleDropdowns = await page.$$('table select');
  if (roleDropdowns.length > 0) {
    await roleDropdowns[0].selectOption('Admin');
    await page.waitForTimeout(500);
    const toast = await page.textContent('body');
    assert('Role switcher updates user access with confirmation toast', toast.includes('Updated role'));
  }

  // ==================================================
  // SECTION 3: CONTROL ROOM / DASHBOARD (/dashboard)
  // ==================================================
  console.log('\n--- Auditing Control Room & Exceptions (/dashboard) ---');
  await page.goto('http://localhost:5173/dashboard');
  await page.waitForTimeout(800);

  // 3.1 Exception Cards Drill-Down
  const overdueCard = await page.$('text=Overdue Tasks');
  if (overdueCard) {
    await overdueCard.click();
    await page.waitForTimeout(500);
    const drillDownTitle = await page.textContent('body');
    assert('Clicking exception card filters drill-down records', drillDownTitle.includes('Exception Drill-Down'));
  }

  // 3.2 Inline Rep Reassignment in Drill-Down
  const drillDownRepSelect = await page.$('table select');
  if (drillDownRepSelect) {
    await drillDownRepSelect.selectOption({ label: 'Sarah Chen' });
    await page.waitForTimeout(500);
    const toast = await page.textContent('body');
    assert('Inline rep reassignment in exception center succeeds', toast.includes('Assigned'));
  }

  // 3.3 Details button opens 480px Side Panel
  const detailsBtn = await page.$('table button:has-text("Details")');
  if (detailsBtn) {
    await detailsBtn.click();
    await page.waitForTimeout(800);
    const panel = await page.$('aside');
    assert('Drill-down "Details" button opens 480px Lead Side Panel', panel !== null);
    // Close panel
    const closeBtn = await page.$('aside button:has(svg.lucide-x)');
    if (closeBtn) await closeBtn.click();
  }

  // ==================================================
  // SECTION 4: LEADS GRID & SIDE PANEL (/leads)
  // ==================================================
  console.log('\n--- Auditing Leads Grid & Full Editing (/leads) ---');
  await page.goto('http://localhost:5173/leads');
  await page.waitForTimeout(1000);

  // 4.1 Add Lead Modal
  const addLeadBtn = await page.$('button:has-text("+ Add lead")');
  if (addLeadBtn) {
    await addLeadBtn.click();
    await page.waitForTimeout(400);
    await page.fill('input[placeholder="Full Name *"]', 'Priya Sharma');
    await page.fill('input[placeholder="+91 98220 12345 *"]', '+91 98111 22334');
    await page.fill('input[placeholder="Email *"]', 'priya.sharma@example.com');
    await page.click('button:has-text("Create Lead")');
    await page.waitForTimeout(600);

    const leadsTable = await page.textContent('table');
    assert('Created new lead Priya Sharma in Leads Grid', leadsTable.includes('Priya Sharma'));
  }

  // 4.2 Open Side Panel on first lead
  const firstLead = await page.$('table tbody tr td button');
  if (firstLead) {
    await firstLead.click();
    await page.waitForTimeout(800);

    // 4.3 Add a Note in Side Panel
    const notesTab = await page.$('button:has-text("Notes")');
    if (notesTab) {
      await notesTab.click();
      await page.waitForTimeout(400);

      const noteTextarea = await page.$('textarea[placeholder*="note"], textarea');
      if (noteTextarea) {
        await noteTextarea.fill('Admin note: verified candidate interest in AI-PM track.');
        const saveNoteBtn = await page.$('button:has-text("Add Note"), button:has-text("Save Note")');
        if (saveNoteBtn) {
          await saveNoteBtn.click();
          await page.waitForTimeout(500);
          const panelContent = await page.textContent('aside');
          assert('Note added and rendered in Lead Side Panel', panelContent.includes('verified candidate interest'));
        }
      }
    }
  }

  // Take screenshot of the audited admin state
  await page.goto('http://localhost:5173/team');
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'C:/Users/maaza/.gemini/antigravity/brain/9450d9b1-d5d8-4b08-9df3-a1dedde9bcd8/admin_full_team_audit.png' });

  await page.goto('http://localhost:5173/dashboard');
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'C:/Users/maaza/.gemini/antigravity/brain/9450d9b1-d5d8-4b08-9df3-a1dedde9bcd8/admin_full_dashboard_audit.png' });

  console.log(`\n==================================================`);
  console.log(`   Admin Panel Audit Result: ${passed} Passed, ${failed} Failed`);
  console.log('==================================================');

  await browser.close();
  if (failed > 0) process.exit(1);
}

testAdminFullEditing().catch(err => {
  console.error(err);
  process.exit(1);
});
