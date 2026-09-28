import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/maaza/.gemini/antigravity/brain/9450d9b1-d5d8-4b08-9df3-a1dedde9bcd8';
const BASE_URL = 'https://aivalytics-leados.vercel.app';

async function verify() {
  console.log('🚀 Starting end-to-end verification of Sales Team pages...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    console.log('1. Checking SignIn page...');
    await page.goto(`${BASE_URL}/auth/signin`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sales_team_1_signin.png') });
    console.log('📸 Captured sales_team_1_signin.png');

    console.log('2. Signing in as Admin Manager...');
    const adminBtn = page.locator('button:has-text("Sign In as Admin Manager")');
    if (await adminBtn.count() > 0) {
      await adminBtn.click();
      await page.waitForURL('**/dashboard', { timeout: 10000 });
    }

    console.log('3. Navigating to Sales Team Hub (/team)...');
    await page.goto(`${BASE_URL}/team`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sales_team_2_hub.png') });
    console.log('📸 Captured sales_team_2_hub.png');

    console.log('4. Navigating to Sarah Chen personal workspace (/team/rep-sarah-chen)...');
    await page.goto(`${BASE_URL}/team/rep-sarah-chen`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sales_team_3_workspace_sarah.png') });
    console.log('📸 Captured sales_team_3_workspace_sarah.png');

    console.log('5. Navigating to Pipeline Kanban with Sales Rep Filter (/pipeline)...');
    await page.goto(`${BASE_URL}/pipeline`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sales_team_4_pipeline_rep_filter.png') });
    console.log('📸 Captured sales_team_4_pipeline_rep_filter.png');

    console.log('🎉 Verification completed successfully!');
  } catch (err) {
    console.error('Error in verification:', err);
  } finally {
    await browser.close();
  }
}

verify();
