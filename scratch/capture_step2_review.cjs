const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png'
};

const distDir = path.join(__dirname, '..', 'dist');

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  let filePath = path.join(distDir, reqPath === '/' ? 'index.html' : reqPath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(distDir, 'index.html');
  }
  const ext = path.extname(filePath).toLowerCase();
  fs.readFile(filePath, (err, content) => {
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(content, 'utf-8');
  });
});

server.listen(4184, async () => {
  const browser = await chromium.launch({ headless: true });
  const artifactDir = 'C:\\Users\\maaza\\.gemini\\antigravity\\brain\\9450d9b1-d5d8-4b08-9df3-a1dedde9bcd8';

  // 1. Grid grouped by stage (desktop 1440x900)
  console.log('Capturing step2_grid_grouped_desktop.png...');
  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktopPage.goto('http://127.0.0.1:4184/leads', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({
    path: path.join(artifactDir, 'step2_grid_grouped_desktop.png'),
    fullPage: false
  });

  // 2. Grid with filters applied (desktop 1440x900)
  console.log('Capturing step2_grid_filters_desktop.png...');
  // Open filter popover and click "+ Add condition"
  const filterBtn = await desktopPage.$('button:has-text("Filter")');
  if (filterBtn) {
    await filterBtn.click();
    await desktopPage.waitForTimeout(400);
    const addCondBtn = await desktopPage.$('button:has-text("+ Add condition")');
    if (addCondBtn) {
      await addCondBtn.click();
      await desktopPage.waitForTimeout(400);
    }
    // Close popover to see the filter pill bar clearly
    await filterBtn.click();
    await desktopPage.waitForTimeout(400);
  }
  await desktopPage.screenshot({
    path: path.join(artifactDir, 'step2_grid_filters_desktop.png'),
    fullPage: false
  });

  // 3. Side panel open (desktop 1440x900) - grid visible behind it without dark overlay
  console.log('Capturing step2_side_panel_desktop.png...');
  // Click on the first lead name button
  const leadBtn = await desktopPage.$('button[title]');
  if (leadBtn) {
    await leadBtn.click();
    await desktopPage.waitForTimeout(600);
  }
  await desktopPage.screenshot({
    path: path.join(artifactDir, 'step2_side_panel_desktop.png'),
    fullPage: false
  });

  // 4. Bulk action bar (desktop 1440x900)
  console.log('Capturing step2_bulk_actions_desktop.png...');
  // Close side panel first via Esc or X
  await desktopPage.keyboard.press('Escape');
  await desktopPage.waitForTimeout(400);
  // Select first 3 checkboxes
  const checkboxes = await desktopPage.$$('tbody input[type="checkbox"]');
  for (let i = 0; i < Math.min(3, checkboxes.length); i++) {
    await checkboxes[i].click();
    await desktopPage.waitForTimeout(150);
  }
  await desktopPage.waitForTimeout(500);
  await desktopPage.screenshot({
    path: path.join(artifactDir, 'step2_bulk_actions_desktop.png'),
    fullPage: false
  });
  await desktopPage.close();

  // 5. Side panel on mobile (390 x 844) - full screen with back arrow
  console.log('Capturing step2_side_panel_mobile.png...');
  const mobilePage = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  await mobilePage.goto('http://127.0.0.1:4184/leads', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);
  const mobileLeadBtn = await mobilePage.$('button[title]');
  if (mobileLeadBtn) {
    await mobileLeadBtn.click();
    await mobilePage.waitForTimeout(600);
  }
  await mobilePage.screenshot({
    path: path.join(artifactDir, 'step2_side_panel_mobile.png'),
    fullPage: false
  });
  await mobilePage.close();

  // 6. Rep view (desktop 1440x900) - showing only their own assigned leads
  console.log('Capturing step2_rep_view_desktop.png...');
  const repPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await repPage.goto('http://127.0.0.1:4184/leads', { waitUntil: 'networkidle' });
  await repPage.evaluate(() => {
    localStorage.setItem(
      'aivalytics_active_user',
      JSON.stringify({
        id: 'rep-alex',
        name: 'Alex Rivera',
        email: 'alex@aivalytics.io',
        role: 'Salesperson',
        title: 'Senior Admissions Specialist',
        status: 'Active',
        avatarColor: 'bg-blue-600'
      })
    );
  });
  await repPage.reload({ waitUntil: 'networkidle' });
  await repPage.waitForTimeout(1000);
  await repPage.screenshot({
    path: path.join(artifactDir, 'step2_rep_view_desktop.png'),
    fullPage: false
  });
  await repPage.close();

  console.log('All 6 review screenshots captured successfully!');
  await browser.close();
  server.close();
  process.exit(0);
});
