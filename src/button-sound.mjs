// Frequency sweep, delay, duration, and peak gain for each UI cue.
const cues = {
  welcome: [[660, 880, 0, .12, .04], [990, 1320, .085, .16, .035]],
  menu: [[1500, 480, 0, .09, .04], [880, 880, .055, .11, .025]],
  detail: [[1100, 700, 0, .065, .025]],
};

export function playButtonSound(context, type = 'detail') {
  const now = context.currentTime;
  for (const [from, to, delay, duration, peak] of cues[type] ?? cues.detail) {
    const tone = context.createOscillator();
    const volume = context.createGain();
    const start = now + delay;
    tone.type = type === 'welcome' ? 'sine' : 'triangle';
    tone.frequency.setValueAtTime(from, start);
    tone.frequency.exponentialRampToValueAtTime(to, start + duration * .75);
    volume.gain.setValueAtTime(0, start);
    volume.gain.linearRampToValueAtTime(peak, start + .004);
    volume.gain.exponentialRampToValueAtTime(.001, start + duration);
    tone.connect(volume);
    volume.connect(context.destination);
    tone.onended = () => { tone.disconnect(); volume.disconnect(); };
    tone.start(start);
    tone.stop(start + duration + .005);
  }
}
