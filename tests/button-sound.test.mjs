import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { playButtonSound } from '../src/button-sound.mjs';

test('soundtrack is a complete stereo loop with headroom', () => {
  const wav = readFileSync(new URL('../public/assets/blue-hour.wav', import.meta.url));
  assert.equal(wav.toString('ascii', 0, 4), 'RIFF');
  assert.equal(wav.toString('ascii', 8, 12), 'WAVE');
  assert.equal(wav.readUInt16LE(22), 2);
  assert.equal(wav.readUInt32LE(24), 22050);
  assert.equal(wav.readUInt32LE(40), wav.length - 44);
  const duration = (wav.length - 44) / 4 / 22050;
  assert.ok(duration > 36 && duration < 38);
  let peak = 0;
  for (let i = 44; i < wav.length; i += 2) peak = Math.max(peak, Math.abs(wav.readInt16LE(i)));
  assert.equal(peak, 22000);
});

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
