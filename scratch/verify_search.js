import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/maaza/.gemini/antigravity/brain/9450d9b1-d5d8-4b08-9df3-a1dedde9bcd8';
const BASE_URL = 'https://aivalytics-leados.vercel.app';

async function testSearchFeature() {
  console.log('🚀 Verifying search by name and mobile number on AI-PM Program...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // Authenticate
    await page.goto(`${BASE_URL}/auth/signin`, { waitUntil: 'networkidle', timeout: 30000 });
    const demoBtn = page.locator('button:has-text("Instant Demo Access")');
    if (await demoBtn.count() > 0) {
      await demoBtn.click();
      await page.waitForURL('**/dashboard', { timeout: 15000 });
    }

    // Navigate to AI-PM Program page
    console.log('Navigating to /programs/ai-pm...');
    await page.goto(`${BASE_URL}/programs/ai-pm`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Look for search input
    const searchInput = page.locator('input[placeholder*="Search by name or mobile number"]');
    
    // Check if new deploy is live
    let isLive = await searchInput.count() > 0;
    let attempts = 0;
    while (!isLive && attempts < 6) {
      console.log(`Waiting for Vercel deployment... retry ${attempts + 1}/6`);
      await page.waitForTimeout(10000);
      await page.reload({ waitUntil: 'networkidle' });
      isLive = await searchInput.count() > 0;
      attempts++;
    }

    if (!isLive) {
      console.log('Search input not found on live yet, taking snapshot of current page...');
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'search_deploy_pending.png') });
      await browser.close();
      return;
    }

    console.log('✅ Search input found on /programs/ai-pm!');

    // Screenshot 1: Default view before search
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'search_1_default.png') });
    console.log('📸 Captured default state screenshot');

    // Test 1: Search by Name (e.g. "Sai" or "Vishnu" or "Sharma")
    console.log('Testing search by candidate name: "Sai"...');
    await searchInput.fill('Sai');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'search_2_by_name.png') });
    console.log('📸 Captured search by name screenshot');

    // Clear search
    const clearBtn = page.locator('button[title="Clear search"]');
    if (await clearBtn.count() > 0) {
      await clearBtn.click();
      await page.waitForTimeout(500);
    } else {
      await searchInput.fill('');
    }

    // Test 2: Search by Mobile Number (e.g. "9790" or "98")
    console.log('Testing search by mobile number digits: "9790"...');
    await searchInput.fill('9790');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'search_3_by_phone.png') });
    console.log('📸 Captured search by mobile number screenshot');

    console.log('🎉 Verification completed successfully!');
  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    await browser.close();
  }
}

testSearchFeature();
