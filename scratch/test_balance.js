import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/maaza/.gemini/antigravity/brain/9450d9b1-d5d8-4b08-9df3-a1dedde9bcd8';
const BASE_URL = 'https://aivalytics-leados.vercel.app';

async function testBalance() {
  console.log('🚀 Testing Auto-Balance Leads on live site...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    await page.goto(`${BASE_URL}/auth/signin`, { waitUntil: 'networkidle', timeout: 30000 });
    const adminBtn = page.locator('button:has-text("Sign In as Admin Manager")');
    if (await adminBtn.count() > 0) {
      await adminBtn.click();
      await page.waitForURL('**/dashboard', { timeout: 10000 });
    }

    console.log('Navigating to /team...');
    await page.goto(`${BASE_URL}/team`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    console.log('Clicking Auto-Balance Leads...');
    const balanceBtn = page.locator('button:has-text("Auto-Balance Leads")');
    await balanceBtn.click();
    await page.waitForTimeout(3000);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sales_team_balanced_hub.png') });
    console.log('📸 Captured sales_team_balanced_hub.png');

    console.log('Visiting Sarah Chen workspace (/team/rep-sarah-chen)...');
    await page.goto(`${BASE_URL}/team/rep-sarah-chen`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sarah_chen_balanced_workspace.png') });
    console.log('📸 Captured sarah_chen_balanced_workspace.png');

    console.log('Visiting Pipeline Kanban (/pipeline)...');
    await page.goto(`${BASE_URL}/pipeline`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);

    // Click Sarah Chen filter pill
    const sarahPill = page.locator('button:has-text("Sarah Chen")');
    if (await sarahPill.count() > 0) {
      await sarahPill.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'pipeline_sarah_chen_filtered.png') });
      console.log('📸 Captured pipeline_sarah_chen_filtered.png');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
}

testBalance();
