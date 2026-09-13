import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sections, wrap, screenFromHash, screenHash } from '../src/navigation.mjs';
test('menu wraps in both directions and every screen survives a URL round trip', () => {
  assert.equal(wrap(-1), 6); assert.equal(wrap(7), 0); assert.equal(wrap(-15), 6);
  for (let i = -1; i < sections.length; i++) assert.equal(screenFromHash(screenHash(i)), i);
  assert.equal(screenFromHash('#unknown'), -1); assert.equal(screenFromHash(''), -1);
});
