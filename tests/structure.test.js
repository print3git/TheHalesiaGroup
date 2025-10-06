// --- Start automated alignment tests ---
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const normalizeLayoutResult = ({
  claritySection,
  layoutParent,
  columns,
  document,
}) => {
  const [lhsFromColumns, rhsFromColumns] = columns || [];

  const lhsHook = document.querySelector('.lhs-section');
  const rhsHook = document.querySelector('.rhs-images');

  const lhs = lhsFromColumns || lhsHook || null;
  const rhs = rhsFromColumns || rhsHook || null;

  const sharedParent =
    layoutParent ||
    (lhsHook && rhsHook && lhsHook.parentElement === rhsHook.parentElement
      ? lhsHook.parentElement
      : lhsHook?.closest('.flex, .grid') || rhsHook?.closest('.flex, .grid') || null);

  return {
    claritySection:
      claritySection || lhs?.closest('section') || rhs?.closest('section') || null,
    layoutParent: sharedParent || null,
    lhs,
    rhs,
  };
};

const getClaritySectionLayout = (document) => {
  const sections = Array.from(document.querySelectorAll('section'));
  const claritySection = sections.find((section) => {
    const heading = section.querySelector('h2');
    return heading && heading.textContent.includes('Clarity Diagnostic');
  });

  if (!claritySection) {
    return normalizeLayoutResult({
      claritySection: null,
      layoutParent: null,
      columns: [],
      document,
    });
  }

  const layoutParent = claritySection.querySelector('div[class*="grid"]');
  const columns = layoutParent
    ? Array.from(layoutParent.children).filter(
        (child) => child.tagName.toLowerCase() === 'div',
      )
    : [];

  return normalizeLayoutResult({
    claritySection,
    layoutParent,
    columns,
    document,
  });
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
    const { claritySection, lhs, rhs } = getClaritySectionLayout(document);

    expect(claritySection).not.toBeNull();

    expect(lhs).not.toBeNull();
    expect(rhs).not.toBeNull();
  });

  test('lhs and rhs share the same flex or grid parent', () => {
    const { claritySection, layoutParent, lhs, rhs } = getClaritySectionLayout(document);

    expect(claritySection).not.toBeNull();
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
