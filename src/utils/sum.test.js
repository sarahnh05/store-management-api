const sum = require('./sum');

test('sum 1 + sum 2 should return 3', () => {
  expect(sum(1, 2)).toBe(3);
});
