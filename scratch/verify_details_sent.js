import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/maaza/.gemini/antigravity/brain/9450d9b1-d5d8-4b08-9df3-a1dedde9bcd8';
const BASE_URL = 'https://aivalytics-leados.vercel.app';

async function verify() {
  console.log('🚀 Starting verification of Details Sent status button...');
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

    console.log('Opening Abhishek Raneja lead detail modal...');
    const nameHeading = page.locator('h4:has-text("Abhishek Raneja")').first();
    await nameHeading.click();
    await page.waitForTimeout(2500);

    // Wait for modal
    await page.locator('h2:has-text("Lead Status")').first().waitFor({ state: 'visible', timeout: 10000 });

    // Check if "Details Sent" button is present
    const detailsSentBtn = page.locator('button:has-text("Details Sent")');
    const isPresent = await detailsSentBtn.count() > 0;
    console.log(`Presence of "Details Sent" button: ${isPresent}`);

    // Take modal screenshot
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'details_sent_modal_verification.png') });
    console.log('📸 Captured details_sent_modal_verification.png successfully!');

    // Let's also click it to verify interactive stage update
    if (isPresent) {
      console.log('Clicking "Details Sent" status option...');
      await detailsSentBtn.first().click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'details_sent_clicked_verification.png') });
      console.log('📸 Captured details_sent_clicked_verification.png after selection!');
    }
  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    await browser.close();
  }
}

verify();
