// --- Start automated alignment tests ---
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const getClaritySectionLayout = (document) => {
  const sections = Array.from(document.querySelectorAll('section'));
  const claritySection = sections.find((section) => {
    const heading = section.querySelector('h2');
    return heading && heading.textContent.includes('Clarity Diagnostic');
  });

  if (!claritySection) {
    return { claritySection: null, layoutParent: null, lhs: null, rhs: null };
  }

  const layoutParent = claritySection.querySelector('div[class*="grid"]');
  if (!layoutParent) {
    return { claritySection, layoutParent: null, lhs: null, rhs: null };
  }

  const columns = Array.from(layoutParent.children).filter(
    (child) => child.tagName.toLowerCase() === 'div',
  );

  const [lhs, rhs] = columns;

  return { claritySection, layoutParent, lhs: lhs || null, rhs: rhs || null };
};

describe('Homepage structural layout', () => {
  let document;

  beforeAll(() => {
    const htmlPath = path.resolve(__dirname, '../index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    const dom = new JSDOM(html);
    document = dom.window.document;
  });

  test('lhs and rhs containers exist', () => {
    const { lhs, rhs } = getClaritySectionLayout(document);

    expect(lhs).not.toBeNull();
    expect(rhs).not.toBeNull();
  });

  test('lhs and rhs share the same flex or grid parent', () => {
    const { layoutParent, lhs, rhs } = getClaritySectionLayout(document);

    expect(lhs).not.toBeNull();
    expect(rhs).not.toBeNull();
    expect(layoutParent).not.toBeNull();

    if (!layoutParent || !lhs || !rhs) {
      return;
    }

    expect(layoutParent.contains(lhs)).toBe(true);
    expect(layoutParent.contains(rhs)).toBe(true);

    const classList = new Set(layoutParent.className.split(/\s+/));
    const hasFlexOrGrid = classList.has('flex') || classList.has('grid');
    expect(hasFlexOrGrid).toBe(true);
  });
});
// --- End automated alignment tests ---
