"""Render original track 'Blue Hour' (104 BPM); no sampled or copied music."""
import math
import random
import struct
import wave
from pathlib import Path

RATE = 22050
BEAT = 60 / 104
LENGTH = round(64 * BEAT * RATE)
mix = [0.0] * LENGTH
rng = random.Random(23)


def note(midi, beat, duration, gain, bass=False):
    frequency = 440 * 2 ** ((midi - 69) / 12)
    start = round(beat * BEAT * RATE)
    seconds = duration * BEAT
    for i in range(round(seconds * RATE)):
        t = i / RATE
        phase = 2 * math.pi * frequency * t
        envelope = min(1, t / .008) * math.exp(-t * (3 if bass else 4)) * min(1, (seconds - t) / .06)
        sound = math.sin(phase) + .25 * math.sin(phase * 2) + (.08 if bass else .14) * math.sin(phase * 3)
        mix[(start + i) % LENGTH] += gain * sound * envelope


chords = [[57, 60, 64, 67, 71], [53, 57, 60, 64, 67], [50, 53, 57, 60, 64], [55, 59, 62, 65, 69]]
melodies = [[76, 79, 74, 71], [72, 76, 79, 76], [77, 76, 72, 69], [74, 71, 69, 74],
            [79, 83, 81, 76], [79, 76, 72, 67], [77, 81, 76, 72], [74, 77, 71, 69]]
for bar in range(16):
    chord = chords[bar % 4]
    for offset, velocity in [(0, .035), (1.5, .024), (2.75, .03)]:
        for pitch in chord:
            note(pitch, bar * 4 + offset, 1.6, velocity)
    for offset, pitch in [(0, chord[0] - 12), (1.75, chord[0] - 12), (2.5, chord[0] - 5), (3.25, chord[0])]:
        note(pitch, bar * 4 + offset, .65, .12, True)
    for index, pitch in enumerate(melodies[bar % 8]):
        note(pitch, bar * 4 + [0.5, 1.25, 2, 3.25][index], .7, .032 if bar < 8 else .042)
    for step in range(8):
        start = round((bar * 4 + step / 2 + (.045 if step % 2 else 0)) * BEAT * RATE)
        previous = 0
        for i in range(round(.06 * RATE)):
            noise = rng.uniform(-1, 1)
            mix[(start + i) % LENGTH] += (noise - previous) * .018 * math.exp(-i / RATE * 75)
            previous = noise
    for beat in [0, 1.5, 2, 3.5]:
        start = round((bar * 4 + beat) * BEAT * RATE)
        for i in range(round(.2 * RATE)):
            t = i / RATE
            phase = 2 * math.pi * (48 * t + 55 * .025 * (1 - math.exp(-t / .025)))
            mix[(start + i) % LENGTH] += .2 * math.sin(phase) * math.exp(-t * 24)
    for beat in [1, 3]:
        start = round((bar * 4 + beat) * BEAT * RATE)
        for i in range(round(.14 * RATE)):
            t = i / RATE
            mix[(start + i) % LENGTH] += (.07 * rng.uniform(-1, 1) + .025 * math.sin(2 * math.pi * 180 * t)) * math.exp(-t * 32)

# Circular delay preserves tails across the loop boundary.
left = [value + .16 * mix[(i - round(BEAT * .75 * RATE)) % LENGTH] for i, value in enumerate(mix)]
right = [value + .16 * mix[(i - round(BEAT * .5 * RATE)) % LENGTH] for i, value in enumerate(mix)]
peak = max(max(map(abs, left)), max(map(abs, right)))
assert 0 < peak < 2
output = Path(__file__).resolve().parents[1] / 'public/assets/blue-hour.wav'
with wave.open(str(output), 'wb') as audio:
    audio.setparams((2, 2, RATE, 0, 'NONE', 'not compressed'))
    audio.writeframes(b''.join(struct.pack('<hh', round(l / peak * 22000), round(r / peak * 22000)) for l, r in zip(left, right)))
with wave.open(str(output)) as audio:
    assert audio.getnframes() == LENGTH and audio.getnchannels() == 2
print(f'{output.name}: {LENGTH / RATE:.2f}s seamless original loop')
