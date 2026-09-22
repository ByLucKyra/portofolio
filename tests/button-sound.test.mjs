import { test } from 'node:test';
import assert from 'node:assert/strict';
import { playButtonSound } from '../src/button-sound.mjs';

test('three distinct cues stay quiet, stop promptly, and release their nodes', () => {
  const signatures = [];
  for (const type of ['welcome', 'menu', 'detail']) {
    const tones = [], peaks = [];
    let disconnected = 0;
    const node = { connect() {}, disconnect() { disconnected++; } };
    playButtonSound({
      currentTime: 2, destination: {},
      createOscillator() {
        const frequencies = [];
        const tone = { ...node, frequencies,
          frequency: { setValueAtTime: value => frequencies.push(value), exponentialRampToValueAtTime: value => frequencies.push(value) },
          start(time) { this.started = time; }, stop(time) { this.stopped = time; },
        };
        tones.push(tone);
        return tone;
      },
      createGain: () => ({ ...node, gain: { setValueAtTime() {}, linearRampToValueAtTime: value => peaks.push(value), exponentialRampToValueAtTime() {} } }),
    }, type);
    assert.equal(tones.length, type === 'detail' ? 1 : 2);
    for (const tone of tones) {
      assert.ok(tone.started >= 2 && tone.stopped > tone.started && tone.stopped <= 2.3);
      tone.onended();
    }
    assert.ok(peaks.every(peak => peak > 0 && peak <= .04));
    assert.equal(disconnected, tones.length * 2);
    signatures.push(JSON.stringify(tones.map(tone => [tone.type, tone.frequencies])));
  }
  assert.equal(new Set(signatures).size, 3);
});
