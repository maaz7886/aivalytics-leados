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

server.listen(4183, async () => {
  const browser = await chromium.launch({ headless: true });
  const artifactDir = 'C:\\Users\\maaza\\.gemini\\antigravity\\brain\\9450d9b1-d5d8-4b08-9df3-a1dedde9bcd8';

  // 1. Step 1 Login Desktop (1440 x 900)
  console.log('Capturing step1_login_desktop.png...');
  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktopPage.goto('http://127.0.0.1:4183/auth/signin', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({
    path: path.join(artifactDir, 'step1_login_desktop.png'),
    fullPage: false
  });

  // 2. Step 1 Login Mobile (390 x 844)
  console.log('Capturing step1_login_mobile.png...');
  const mobilePage = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  await mobilePage.goto('http://127.0.0.1:4183/auth/signin', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({
    path: path.join(artifactDir, 'step1_login_mobile.png'),
    fullPage: false
  });

  // 3. Step 1 App Shell Desktop (1440 x 900)
  console.log('Capturing step1_app_shell_desktop.png...');
  await desktopPage.goto('http://127.0.0.1:4183/leads', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(1200);
  await desktopPage.screenshot({
    path: path.join(artifactDir, 'step1_app_shell_desktop.png'),
    fullPage: false
  });

  // 4. Step 1 App Shell Mobile (390 x 844)
  console.log('Capturing step1_app_shell_mobile.png...');
  await mobilePage.goto('http://127.0.0.1:4183/leads', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1200);
  await mobilePage.screenshot({
    path: path.join(artifactDir, 'step1_app_shell_mobile.png'),
    fullPage: false
  });

  // 5. Step 2 Leads Grid Desktop (1440 x 900)
  console.log('Capturing step2_leads_grid_desktop.png...');
  await desktopPage.screenshot({
    path: path.join(artifactDir, 'step2_leads_grid_desktop.png'),
    fullPage: false
  });

  // 6. Step 2 Leads Grid Mobile (390 x 844)
  console.log('Capturing step2_leads_grid_mobile.png...');
  await mobilePage.screenshot({
    path: path.join(artifactDir, 'step2_leads_grid_mobile.png'),
    fullPage: false
  });

  // 7. Step 2 Lead Side Panel Desktop (Click lead name to open panel)
  console.log('Capturing step2_lead_panel_desktop.png...');
  // Click on the first lead row or name link
  const leadLink = await desktopPage.$('td span.cursor-pointer');
  if (leadLink) {
    await leadLink.click();
    await desktopPage.waitForTimeout(600);
  }
  await desktopPage.screenshot({
    path: path.join(artifactDir, 'step2_lead_panel_desktop.png'),
    fullPage: false
  });
  await desktopPage.close();

  // 8. Step 2 Lead Side Panel Mobile (Click lead name to open panel)
  console.log('Capturing step2_lead_panel_mobile.png...');
  const mobileLeadLink = await mobilePage.$('td span.cursor-pointer');
  if (mobileLeadLink) {
    await mobileLeadLink.click();
    await mobilePage.waitForTimeout(600);
  }
  await mobilePage.screenshot({
    path: path.join(artifactDir, 'step2_lead_panel_mobile.png'),
    fullPage: false
  });
  await mobilePage.close();

  console.log('All Step 1 & Step 2 screenshots captured successfully!');
  await browser.close();
  server.close();
  process.exit(0);
});
