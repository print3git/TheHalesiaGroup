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
      const normalizeLayoutResult = ({ claritySection, layoutParent, columns }) => {
        const [lhsFromColumns, rhsFromColumns] = columns || [];
        const lhsHook = document.querySelector('.lhs-section');
        const rhsHook = document.querySelector('.rhs-images');

        const lhsCandidate = lhsFromColumns || lhsHook || null;
        const rhsCandidate = rhsFromColumns || rhsHook || null;

        const sharedParent =
          layoutParent ||
          (lhsHook && rhsHook && lhsHook.parentElement === rhsHook.parentElement
            ? lhsHook.parentElement
            : lhsHook?.closest('.flex, .grid') || rhsHook?.closest('.flex, .grid') || null);

        return {
          claritySection:
            claritySection ||
            lhsCandidate?.closest('section') ||
            rhsCandidate?.closest('section') ||
            null,
          layoutParent: sharedParent || null,
          lhs: lhsCandidate,
          rhs: rhsCandidate,
        };
      };

      const sections = Array.from(document.querySelectorAll('section'));
      const claritySection = sections.find((section) => {
        const heading = section.querySelector('h2');
        return heading && heading.textContent.includes('Clarity Diagnostic');
      });

      const layoutParent = claritySection?.querySelector('div[class*="grid"]') || null;
      const columns = layoutParent
        ? Array.from(layoutParent.children).filter(
            (child) => child.tagName.toLowerCase() === 'div',
          )
        : [];

      const { lhs, rhs } = normalizeLayoutResult({
        claritySection,
        layoutParent,
        columns,
      });

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
