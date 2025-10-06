// --- Start automated alignment tests ---
/**
 * @jest-environment node
 */
const puppeteer = require('puppeteer');

const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';

describe('Homepage alignment', () => {
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

  test('lhs and rhs bottom edges are within ±2px', async () => {
    const page = await browser.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });

    const metrics = await page.evaluate(() => {
      const lhs = document.querySelector('.lhs-section');
      const rhs = document.querySelector('.rhs-images');
      if (!lhs || !rhs) {
        return null;
      }
      const lhsRect = lhs.getBoundingClientRect();
      const rhsRect = rhs.getBoundingClientRect();
      return {
        lhsBottom: lhsRect.bottom,
        rhsBottom: rhsRect.bottom,
      };
    });

    expect(metrics).not.toBeNull();

    const delta = Math.abs(metrics.lhsBottom - metrics.rhsBottom);
    expect(delta).toBeLessThanOrEqual(2);

    await page.close();
  });
});
// --- End automated alignment tests ---
