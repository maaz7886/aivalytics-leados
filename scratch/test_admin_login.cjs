const { chromium } = require('c:\\Users\\maaza\\OneDrive\\Desktop\\leados\\node_modules\\playwright');

async function testAdminLogin() {
  console.log('Testing Admin Login with maazpatel123@gmail.com...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Test 1: Wrong Password
  await page.goto('http://localhost:5173/auth/signin');
  await page.fill('input[type="email"]', 'maazpatel123@gmail.com');
  await page.fill('input[type="password"]', 'WrongPassword123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(500);

  const errorText = await page.textContent('body');
  if (errorText.includes('Invalid email or password')) {
    console.log('[PASS] Rejected wrong password successfully.');
  } else {
    console.error('[FAIL] Did not reject wrong password.');
    process.exit(1);
  }

  // Test 2: Correct Password
  await page.fill('input[type="password"]', 'Maaz@7886');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 5000 });
  console.log('[PASS] Redirected to /dashboard on correct password.');
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'C:/Users/maaza/.gemini/antigravity/brain/9450d9b1-d5d8-4b08-9df3-a1dedde9bcd8/maaz_admin_dashboard.png' });
  console.log('[PASS] Saved maaz_admin_dashboard.png');

  await browser.close();
  console.log('All admin login tests passed!');
}

testAdminLogin().catch(err => {
  console.error(err);
  process.exit(1);
});
