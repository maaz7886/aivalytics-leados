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

server.listen(4182, async () => {
  const browser = await chromium.launch({ headless: true });
  const artifactDir = 'C:\\Users\\maaza\\.gemini\\antigravity\\brain\\9450d9b1-d5d8-4b08-9df3-a1dedde9bcd8';

  // 1. Desktop App Shell (1440 x 900)
  console.log('Capturing Desktop App Shell (1440px)...');
  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktopPage.goto('http://127.0.0.1:4182/leads', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({
    path: path.join(artifactDir, 'step1_app_shell_desktop.png'),
    fullPage: false
  });

  // 2. Desktop Login Page (1440 x 900)
  console.log('Capturing Desktop Login Page (1440px)...');
  await desktopPage.goto('http://127.0.0.1:4182/auth/signin', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({
    path: path.join(artifactDir, 'step1_login_desktop.png'),
    fullPage: false
  });
  await desktopPage.close();

  // 3. Mobile App Shell (390 x 844)
  console.log('Capturing Mobile App Shell (390px)...');
  const mobilePage = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  await mobilePage.goto('http://127.0.0.1:4182/leads', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({
    path: path.join(artifactDir, 'step1_app_shell_mobile.png'),
    fullPage: false
  });

  // 4. Mobile Login Page (390 x 844)
  console.log('Capturing Mobile Login Page (390px)...');
  await mobilePage.goto('http://127.0.0.1:4182/auth/signin', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({
    path: path.join(artifactDir, 'step1_login_mobile.png'),
    fullPage: false
  });
  await mobilePage.close();

  console.log('All screenshots captured successfully!');
  await browser.close();
  server.close();
  process.exit(0);
});
