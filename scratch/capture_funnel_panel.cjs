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

server.listen(4186, async () => {
  const browser = await chromium.launch({ headless: true });
  const artifactDir = 'C:\\Users\\maaza\\.gemini\\antigravity\\brain\\9450d9b1-d5d8-4b08-9df3-a1dedde9bcd8';

  console.log('Capturing step3_sales_funnel_playbook_desktop.png...');
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:4186/leads?lead=lead-rahul-001', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(artifactDir, 'step3_sales_funnel_playbook_desktop.png'),
    fullPage: false
  });

  console.log('Funnel playbook screenshot captured successfully!');
  await browser.close();
  server.close();
  process.exit(0);
});
