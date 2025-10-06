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
      const sections = Array.from(document.querySelectorAll('section'));
      const claritySection = sections.find((section) => {
        const heading = section.querySelector('h2');
        return heading && heading.textContent.includes('Clarity Diagnostic');
      });

      if (!claritySection) {
        return null;
      }

      const layoutParent = claritySection.querySelector('div[class*="grid"]');
      if (!layoutParent) {
        return null;
      }

      const columns = Array.from(layoutParent.children).filter(
        (child) => child.tagName.toLowerCase() === 'div',
      );
      const [lhs, rhs] = columns;

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
