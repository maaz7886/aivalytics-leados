const { chromium } = require('c:\\Users\\maaza\\OneDrive\\Desktop\\leados\\node_modules\\playwright');

async function testVercelLive() {
  console.log('Testing live Vercel deployment: https://aivalytics-leados.vercel.app...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // 1. Visit Live Vercel Sign-In
  await page.goto('https://aivalytics-leados.vercel.app/auth/signin');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'C:/Users/maaza/.gemini/antigravity/brain/9450d9b1-d5d8-4b08-9df3-a1dedde9bcd8/live_vercel_signin.png' });
  console.log('[1/4] Live Sign-in captured.');

  // 2. Sign In on Live Vercel with Maaz Patel credentials
  await page.fill('input[type="email"]', 'maazpatel123@gmail.com');
  await page.fill('input[type="password"]', 'Maaz@7886');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2500);

  console.log('Current Live URL after login:', page.url());
  await page.screenshot({ path: 'C:/Users/maaza/.gemini/antigravity/brain/9450d9b1-d5d8-4b08-9df3-a1dedde9bcd8/live_vercel_dashboard.png' });
  console.log('[2/4] Live Dashboard captured.');

  // 3. Team Page on Live Vercel
  await page.goto('https://aivalytics-leados.vercel.app/team');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'C:/Users/maaza/.gemini/antigravity/brain/9450d9b1-d5d8-4b08-9df3-a1dedde9bcd8/live_vercel_team.png' });
  console.log('[3/4] Live Team page captured.');

  // 4. Leads Page on Live Vercel
  await page.goto('https://aivalytics-leados.vercel.app/leads');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'C:/Users/maaza/.gemini/antigravity/brain/9450d9b1-d5d8-4b08-9df3-a1dedde9bcd8/live_vercel_leads.png' });
  console.log('[4/4] Live Leads Grid captured.');

  // 5. Mobile View (390px)
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('https://aivalytics-leados.vercel.app/dashboard');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'C:/Users/maaza/.gemini/antigravity/brain/9450d9b1-d5d8-4b08-9df3-a1dedde9bcd8/live_vercel_mobile.png' });
  console.log('[5/5] Live Mobile view captured.');

  await browser.close();
  console.log('All live Vercel checks completed successfully!');
}

testVercelLive().catch(err => {
  console.error(err);
  process.exit(1);
});
