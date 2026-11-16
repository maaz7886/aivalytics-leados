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

server.listen(4185, async () => {
  const browser = await chromium.launch({ headless: true });
  const artifactDir = 'C:\\Users\\maaza\\.gemini\\antigravity\\brain\\9450d9b1-d5d8-4b08-9df3-a1dedde9bcd8';

  // 1. Kanban View Desktop (1440 x 900)
  console.log('Capturing step3_kanban_desktop.png...');
  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktopPage.goto('http://127.0.0.1:4185/leads?mode=kanban', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({
    path: path.join(artifactDir, 'step3_kanban_desktop.png'),
    fullPage: false
  });

  // 2. Kanban View with Side Panel Open (1440 x 900)
  console.log('Capturing step3_kanban_side_panel_desktop.png...');
  const firstCard = await desktopPage.$('div[draggable="true"]');
  if (firstCard) {
    await firstCard.click();
    await desktopPage.waitForTimeout(600);
  }
  await desktopPage.screenshot({
    path: path.join(artifactDir, 'step3_kanban_side_panel_desktop.png'),
    fullPage: false
  });

  // 3. Calendar View Desktop (1440 x 900)
  console.log('Capturing step3_calendar_desktop.png...');
  // Press Escape to close panel
  await desktopPage.keyboard.press('Escape');
  await desktopPage.waitForTimeout(400);
  await desktopPage.goto('http://127.0.0.1:4185/leads?mode=calendar', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({
    path: path.join(artifactDir, 'step3_calendar_desktop.png'),
    fullPage: false
  });

  // 4. Saved View in Kanban Mode (Desktop 1440 x 900) - e.g. Hot Leads
  console.log('Capturing step3_saved_views_kanban_desktop.png...');
  await desktopPage.goto('http://127.0.0.1:4185/leads?view=hot&mode=kanban', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({
    path: path.join(artifactDir, 'step3_saved_views_kanban_desktop.png'),
    fullPage: false
  });
  await desktopPage.close();

  // 5. Kanban Mobile (390 x 844)
  console.log('Capturing step3_kanban_mobile.png...');
  const mobilePage = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  await mobilePage.goto('http://127.0.0.1:4185/leads?mode=kanban', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({
    path: path.join(artifactDir, 'step3_kanban_mobile.png'),
    fullPage: false
  });

  // 6. Calendar Mobile (390 x 844)
  console.log('Capturing step3_calendar_mobile.png...');
  await mobilePage.goto('http://127.0.0.1:4185/leads?mode=calendar', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({
    path: path.join(artifactDir, 'step3_calendar_mobile.png'),
    fullPage: false
  });
  await mobilePage.close();

  console.log('All Step 3 screenshots captured successfully!');
  await browser.close();
  server.close();
  process.exit(0);
});
