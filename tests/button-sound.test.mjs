import { test } from 'node:test';
import assert from 'node:assert/strict';
import { playButtonSound } from '../src/button-sound.mjs';

test('button sound stays quiet, stops promptly, and releases its audio nodes', () => {
  const events = [];
  const parameter = { setValueAtTime: (...args) => events.push(args), linearRampToValueAtTime: (...args) => events.push(args), exponentialRampToValueAtTime: (...args) => events.push(args) };
  let disconnected = 0;
  const node = { connect() {}, disconnect() { disconnected++; } };
  const tone = { ...node, frequency: parameter, start: time => events.push(['start', time]), stop: time => events.push(['stop', time]) };
  playButtonSound({ currentTime: 2, destination: {}, createOscillator: () => tone, createGain: () => ({ ...node, gain: parameter }) });
  assert.equal(tone.type, 'triangle');
  assert.ok(events.some(([value, time]) => value === .045 && time === 2.004));
  assert.deepEqual(events.at(-2), ['start', 2]);
  assert.deepEqual(events.at(-1), ['stop', 2.09]);
  tone.onended();
  assert.equal(disconnected, 2);
});
