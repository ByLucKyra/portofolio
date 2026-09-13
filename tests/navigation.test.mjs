import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sections, wrap, screenFromHash, screenHash, WELCOME, readSavedScreen, saveScreen } from '../src/navigation.mjs';
test('menu wraps in both directions and every screen survives a URL round trip', () => {
  assert.equal(wrap(-1), 6); assert.equal(wrap(7), 0); assert.equal(wrap(-15), 6);
  for (let i = WELCOME; i < sections.length; i++) assert.equal(screenFromHash(screenHash(i)), i);
  assert.equal(screenFromHash('#unknown'), WELCOME); assert.equal(screenFromHash(''), WELCOME);
});
test('continue restores valid visits, ignores welcome and handles blocked or corrupt storage', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  assert.equal(readSavedScreen(storage), null);
  saveScreen(2, storage); assert.equal(readSavedScreen(storage), 2);
  saveScreen(WELCOME, storage); assert.equal(readSavedScreen(storage), 2);
  saveScreen(999, storage); assert.equal(readSavedScreen(storage), 2);
  storage.setItem('lucky:last-screen', '#invalid'); assert.equal(readSavedScreen(storage), null);
  const blocked = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
  assert.equal(readSavedScreen(blocked), null); assert.doesNotThrow(() => saveScreen(0, blocked));
});
