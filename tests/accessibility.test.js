// --- Start automated alignment tests ---
/**
 * @jest-environment node
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
const hasConfig = Boolean(process.env.LIGHTHOUSE_CONFIG);

(hasConfig ? describe : describe.skip)('Accessibility audit (axe-core)', () => {
  let browser;
  let AxePuppeteer;
  let axeOptions = {};

  beforeAll(async () => {
    if (!hasConfig) {
      return;
    }

    try {
      ({ AxePuppeteer } = require('@axe-core/puppeteer'));
    } catch (error) {
      throw new Error(
        'Accessibility config provided but @axe-core/puppeteer is not installed. Add it to devDependencies to enable this test.'
      );
    }

    const resolvedPath = path.resolve(process.env.LIGHTHOUSE_CONFIG);
    const rawConfig = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
    if (rawConfig?.runOnlyTags && Array.isArray(rawConfig.runOnlyTags)) {
      axeOptions = {
        runOnly: {
          type: 'tag',
          values: rawConfig.runOnlyTags,
        },
      };
    }

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

  test('no serious accessibility violations detected', async () => {
    const page = await browser.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });

    const axeBuilder = new AxePuppeteer(page);
    if (Object.keys(axeOptions).length > 0) {
      axeBuilder.options(axeOptions);
    }

    const results = await axeBuilder.analyze();
    const seriousViolations = results.violations.filter((violation) =>
      ['serious', 'critical'].includes(violation.impact)
    );

    expect(seriousViolations).toHaveLength(0);

    await page.close();
  });
});
// --- End automated alignment tests ---
