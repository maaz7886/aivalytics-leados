const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const artifactDir = 'C:\\Users\\maaza\\.gemini\\antigravity\\brain\\9450d9b1-d5d8-4b08-9df3-a1dedde9bcd8';

  console.log('Capturing Admin Dashboard (Before)...');
  await page.goto('https://aivalytics-leados.vercel.app/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(artifactDir, 'phase3_before_admin_dashboard.png'), fullPage: false });

  console.log('Capturing Lead Modal (Before)...');
  // Click on the first candidate row in the table or exceptions
  const candidate = page.locator('text=Rahul Sharma').first();
  if (await candidate.isVisible()) {
    await candidate.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(artifactDir, 'phase3_before_lead_modal.png'), fullPage: false });
    // close modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  }

  console.log('Capturing Rep Home (Before)...');
  await page.goto('https://aivalytics-leados.vercel.app/team/rep-alex-rivera', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(artifactDir, 'phase3_before_rep_home.png'), fullPage: false });

  await browser.close();
  console.log('All Before screenshots captured successfully!');
})();
