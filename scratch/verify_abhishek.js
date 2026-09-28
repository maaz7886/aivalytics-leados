import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/maaza/.gemini/antigravity/brain/9450d9b1-d5d8-4b08-9df3-a1dedde9bcd8';
const BASE_URL = 'https://aivalytics-leados.vercel.app';

async function verify() {
  console.log('🚀 Starting verification of Abhishek Raneja modal click...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    await page.goto(`${BASE_URL}/auth/signin`, { waitUntil: 'networkidle', timeout: 30000 });
    const demoBtn = page.locator('button:has-text("Instant Demo Access")');
    if (await demoBtn.count() > 0) {
      await demoBtn.click();
      await page.waitForURL('**/dashboard', { timeout: 10000 });
    }

    console.log('Navigating to /programs/ai-pm...');
    await page.goto(`${BASE_URL}/programs/ai-pm`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    const searchInput = page.locator('input[placeholder*="Search by name or mobile number"]');
    await searchInput.fill('Abhishek');
    await page.waitForTimeout(1500);

    console.log('Clicking h4 with text Abhishek Raneja...');
    const nameHeading = page.locator('h4:has-text("Abhishek Raneja")').first();
    await nameHeading.click();
    await page.waitForTimeout(2000);

    // Wait for LeadDetailModal to appear
    await page.locator('text=Form Qualifying Questions & Responses').waitFor({ state: 'visible', timeout: 10000 });

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'abhishek_modal_qualifying.png') });
    console.log('📸 Captured abhishek_modal_qualifying.png successfully!');

    console.log('🎉 Verification completed successfully!');
  } catch (err) {
    console.error('Error in verification:', err);
  } finally {
    await browser.close();
  }
}

verify();
