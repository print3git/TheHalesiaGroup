// --- Start automated alignment tests ---
/**
 * @jest-environment node
 */
const path = require('path');
const puppeteer = require('puppeteer');
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';

const SNAPSHOT_DIR = path.resolve(__dirname, '__image_snapshots__');
const DIFF_DIR = path.resolve(SNAPSHOT_DIR, '__diff_output__');

describe('Visual regression - homepage', () => {
  let browser;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }, 45000);

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  test('homepage screenshot matches baseline', async () => {
    const page = await browser.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await page.setViewport({ width: 1440, height: 900 });

    const screenshot = await page.screenshot({ fullPage: true });

    expect(screenshot).toMatchImageSnapshot({
      customSnapshotsDir: SNAPSHOT_DIR,
      customDiffDir: DIFF_DIR,
      customSnapshotIdentifier: 'homepage-alignment',
      failureThreshold: 0.0001,
      failureThresholdType: 'percent',
    });

    await page.close();
  });
});
// --- End automated alignment tests ---
