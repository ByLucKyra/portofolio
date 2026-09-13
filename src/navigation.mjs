export const sections = ['ABOUT', 'EXPERIENCE', 'PROJECTS', 'SKILLS', 'ACHIEVEMENTS', 'THE LAB', 'CONTACT'];
export const WELCOME = -2;
export function wrap(index) { return ((index % sections.length) + sections.length) % sections.length; }
export function screenFromHash(hash) {
  if (hash === '#menu') return -1;
  const index = sections.findIndex(name => name.toLowerCase().replaceAll(' ', '-') === hash.replace(/^#/, ''));
  return index < 0 ? WELCOME : index;
}
export function screenHash(screen) { return screen === WELCOME ? '#welcome' : screen < 0 ? '#menu' : '#' + sections[screen].toLowerCase().replaceAll(' ', '-'); }
export function readSavedScreen(storage) {
  try { const hash = (storage ?? globalThis.localStorage).getItem('lucky:last-screen'); const screen = screenFromHash(hash ?? ''); return screen === WELCOME ? null : screen; } catch { return null; }
}
export function saveScreen(screen, storage) {
  if (!Number.isInteger(screen) || screen < -1 || screen >= sections.length) return;
  try { (storage ?? globalThis.localStorage).setItem('lucky:last-screen', screenHash(screen)); } catch { /* Browsing still works when storage is unavailable. */ }
}
