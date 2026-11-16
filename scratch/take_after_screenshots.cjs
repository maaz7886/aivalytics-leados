const { chromium } = require('playwright');
const path = require('path');
const http = require('http');
const fs = require('fs');

function startStaticServer(distDir, port) {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  };

  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    let filePath = path.join(distDir, reqPath === '/' ? 'index.html' : reqPath);

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(distDir, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading file');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      console.log(`Static server running at http://127.0.0.1:${port}`);
      resolve(server);
    });
  });
}

(async () => {
  const port = 4173;
  const distDir = path.join(__dirname, '..', 'dist');
  const artifactDir = 'C:\\Users\\maaza\\.gemini\\antigravity\\brain\\9450d9b1-d5d8-4b08-9df3-a1dedde9bcd8';

  const server = await startStaticServer(distDir, port);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    console.log('Capturing Admin Dashboard (After)...');
    await page.goto(`http://127.0.0.1:${port}/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(artifactDir, 'phase3_after_admin_dashboard.png'), fullPage: false });

    console.log('Capturing Lead Modal (After)...');
    const candidate = page.locator('text=Rahul Sharma').first();
    if (await candidate.isVisible()) {
      await candidate.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(artifactDir, 'phase3_after_lead_modal.png'), fullPage: false });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } else {
      const anyCandidate = page.locator('td .font-bold.cursor-pointer').first();
      if (await anyCandidate.isVisible()) {
        await anyCandidate.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(artifactDir, 'phase3_after_lead_modal.png'), fullPage: false });
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    }

    console.log('Capturing Rep Home (After)...');
    await page.goto(`http://127.0.0.1:${port}/team/rep-alex-rivera`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(artifactDir, 'phase3_after_rep_home.png'), fullPage: false });

    console.log('All After screenshots captured successfully!');
  } catch (err) {
    console.error('Error taking screenshots:', err);
  } finally {
    await browser.close();
    server.close();
    process.exit(0);
  }
})();
