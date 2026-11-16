const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:/Users/maaza/.gemini/antigravity/brain/9450d9b1-d5d8-4b08-9df3-a1dedde9bcd8';
const BASE_URL = 'http://localhost:5173';
const CSV_PATH = path.resolve(__dirname, 'sample_step2c_import.csv');
const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');

async function run() {
  console.log('Starting Playwright test for Step 2C...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  // 1. Authenticate as Admin
  console.log('Navigating to signin...');
  await page.goto(`${BASE_URL}/auth/signin`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'maazpatel123@gmail.com');
  await page.fill('input[type="password"]', 'Maaz@7886');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);

  // 2. Step 1: Source Screen
  console.log('Navigating to /import (Step 1)...');
  await page.goto(`${BASE_URL}/import`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'step2c_import_step1_source.png'),
    fullPage: false
  });
  console.log('Captured: step2c_import_step1_source.png');

  // Switch to Paste tab to reliably pass sample CSV rows
  console.log('Switching to Paste rows tab...');
  const pasteTab = await page.$('button:has-text("Paste rows")');
  if (pasteTab) {
    await pasteTab.click();
    await page.waitForTimeout(400);
    await page.fill('textarea', csvContent);
    await page.waitForTimeout(400);
    const parseBtn = await page.$('button:has-text("Process Pasted Rows")');
    if (parseBtn) {
      await parseBtn.click();
    }
  } else {
    // Fallback to file input
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      await fileInput.setInputFiles(CSV_PATH);
      await fileInput.dispatchEvent('change');
    }
  }

  // 3. Step 2: Map Columns Screen
  console.log('Waiting for Step 2 (Map Columns)...');
  await page.waitForSelector('text=Step 2: Map Columns', { timeout: 10000 });
  await page.waitForTimeout(800);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'step2c_import_step2_mappings.png'),
    fullPage: false
  });
  console.log('Captured: step2c_import_step2_mappings.png');

  // Click Validate & Preview (Step 2 -> Step 3)
  const step2NextBtn = await page.$('button:has-text("Validate & Preview")');
  if (step2NextBtn) {
    await step2NextBtn.click();
  }
  await page.waitForTimeout(800);

  // 4. Step 3: Preview & Validate Screen
  console.log('Waiting for Step 3 (Preview & Validate)...');
  await page.waitForSelector('text=Step 3: Validation', { timeout: 10000 });
  await page.waitForTimeout(800);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'step2c_import_step3_validate.png'),
    fullPage: false
  });
  console.log('Captured: step2c_import_step3_validate.png');

  // Click Program & Assignment (Step 3 -> Step 4)
  const step3NextBtn = await page.$('button:has-text("Program & Assignment")');
  if (step3NextBtn) {
    await step3NextBtn.click();
  }
  await page.waitForTimeout(800);

  // 5. Step 4: Program & Assignment Screen
  console.log('Waiting for Step 4 (Program & Assignment)...');
  await page.waitForSelector('text=Step 4: Target Program', { timeout: 10000 });
  await page.waitForTimeout(800);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'step2c_import_step4_assignment.png'),
    fullPage: false
  });
  console.log('Captured: step2c_import_step4_assignment.png');

  // Click Execute Ingestion & Merge (Step 4 -> Step 5)
  const step4NextBtn = await page.$('button:has-text("Execute Ingestion & Merge")');
  if (step4NextBtn) {
    await step4NextBtn.click();
  }
  await page.waitForTimeout(1000);

  // 6. Step 5: Report & Conflicts Screen
  console.log('Waiting for Step 5 (Report & Conflicts)...');
  await page.waitForSelector('text=Ingestion Report:', { timeout: 15000 });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'step2c_import_step5_report_conflicts.png'),
    fullPage: false
  });
  console.log('Captured: step2c_import_step5_report_conflicts.png');

  // 7. Lead Panel: Answers & Qualification
  console.log('Checking Lead Panel Answers...');
  await page.goto(`${BASE_URL}/leads?lead=lead-rahul-001`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'step2c_lead_panel_answers.png'),
    fullPage: false
  });
  console.log('Captured: step2c_lead_panel_answers.png');

  // 8. Question Bank Settings
  console.log('Checking Settings Question Bank...');
  await page.goto(`${BASE_URL}/settings?tab=question-bank`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'step2c_question_bank_settings.png'),
    fullPage: false
  });
  console.log('Captured: step2c_question_bank_settings.png');

  // 9. Leads Grid with Custom Field Column + Filter
  console.log('Checking Leads Grid with Custom Fields...');
  await page.goto(`${BASE_URL}/leads`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  // Open filter popover to show custom fields
  const filterBtn = await page.$('button:has-text("Filter")');
  if (filterBtn) {
    await filterBtn.click();
    await page.waitForTimeout(500);
  }
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'step2c_leads_grid_custom_fields.png'),
    fullPage: false
  });
  console.log('Captured: step2c_leads_grid_custom_fields.png');

  console.log('All 8 Step 2C screenshots captured successfully!');
  await browser.close();
}

run().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
