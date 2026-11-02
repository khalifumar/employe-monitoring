import { chromium } from '@playwright/test';
import * as path from 'node:path';
import * as fs from 'node:fs';

const ARTIFACT_DIR = 'C:/Users/Khalif Umar Al Faruq/.gemini/antigravity-ide/brain/43934e76-a809-4860-9bdb-c90f85a5b018/screenshots';

const PAGES = [
  { name: '01_overview', path: '/' },
  { name: '02_insights', path: '/insights' },
  { name: '03_my_wellbeing', path: '/my-wellbeing' },
  { name: '04_privacy_center', path: '/privacy' },
  { name: '05_settings', path: '/settings' },
  { name: '06_onboarding', path: '/onboarding' },
];

async function main() {
  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ channel: 'chrome' });

  // 1. Desktop 1280x800
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const desktopPage = await desktopContext.newPage();

  for (const p of PAGES) {
    await desktopPage.goto(`http://localhost:3000${p.path}`, { waitUntil: 'networkidle' });
    const file = path.join(ARTIFACT_DIR, `${p.name}_desktop.png`);
    await desktopPage.screenshot({ path: file, fullPage: true });
    console.log(`Captured desktop: ${file}`);
  }
  await desktopContext.close();

  // 2. Mobile 375x667
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 667 },
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();

  for (const p of PAGES) {
    await mobilePage.goto(`http://localhost:3000${p.path}`, { waitUntil: 'networkidle' });
    const file = path.join(ARTIFACT_DIR, `${p.name}_mobile.png`);
    await mobilePage.screenshot({ path: file, fullPage: true });
    console.log(`Captured mobile: ${file}`);
  }
  await mobileContext.close();

  await browser.close();
  console.log('All screenshots captured successfully!');
}

main().catch(console.error);
