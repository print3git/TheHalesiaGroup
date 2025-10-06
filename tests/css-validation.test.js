// --- Start automated alignment tests ---
const fs = require('fs');
const path = require('path');

describe('CSS alignment validation', () => {
  test('layout includes flex/grid end alignment rules', () => {
    const cssPath = path.resolve(__dirname, '../style.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    const alignmentRule = /align-items\s*:\s*(flex-end|end)/i;
    expect(alignmentRule.test(cssContent)).toBe(true);
  });
});
// --- End automated alignment tests ---
