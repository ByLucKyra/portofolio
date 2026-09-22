// A short, quiet electronic click, synthesized without downloading audio assets.
export function playButtonSound(context) {
  const tone = context.createOscillator();
  const volume = context.createGain();
  const now = context.currentTime;
  tone.type = 'triangle';
  tone.frequency.setValueAtTime(1100, now);
  tone.frequency.exponentialRampToValueAtTime(520, now + .065);
  volume.gain.setValueAtTime(0, now);
  volume.gain.linearRampToValueAtTime(.045, now + .004);
  volume.gain.exponentialRampToValueAtTime(.001, now + .085);
  tone.connect(volume);
  volume.connect(context.destination);
  tone.onended = () => { tone.disconnect(); volume.disconnect(); };
  tone.start(now);
  tone.stop(now + .09);
}
