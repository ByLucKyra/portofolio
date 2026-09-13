export const sections = ['ABOUT', 'EXPERIENCE', 'PROJECTS', 'SKILLS', 'ACHIEVEMENTS', 'THE LAB', 'CONTACT'];
export function wrap(index) { return ((index % sections.length) + sections.length) % sections.length; }
export function screenFromHash(hash) {
  return sections.findIndex(name => name.toLowerCase().replaceAll(' ', '-') === hash.replace(/^#/, ''));
}
export function screenHash(screen) { return screen < 0 ? '#menu' : '#' + sections[screen].toLowerCase().replaceAll(' ', '-'); }
