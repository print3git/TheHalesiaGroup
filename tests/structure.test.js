// --- Start automated alignment tests ---
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('Homepage structural layout', () => {
  let document;

  beforeAll(() => {
    const htmlPath = path.resolve(__dirname, '../index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    const dom = new JSDOM(html);
    document = dom.window.document;
  });

  test('lhs and rhs containers exist', () => {
    const lhs = document.querySelector('.lhs-section');
    const rhs = document.querySelector('.rhs-images');

    expect(lhs).not.toBeNull();
    expect(rhs).not.toBeNull();
  });

  test('lhs and rhs share the same flex or grid parent', () => {
    const lhs = document.querySelector('.lhs-section');
    const rhs = document.querySelector('.rhs-images');

    expect(lhs).not.toBeNull();
    expect(rhs).not.toBeNull();

    const layoutParent = lhs.closest('.flex, .grid');

    expect(layoutParent).not.toBeNull();
    expect(layoutParent.contains(rhs)).toBe(true);

    const classList = new Set(layoutParent.className.split(/\s+/));
    const hasFlexOrGrid = classList.has('flex') || classList.has('grid');
    expect(hasFlexOrGrid).toBe(true);
  });
});
// --- End automated alignment tests ---
