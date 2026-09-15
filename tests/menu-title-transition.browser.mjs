// Connected browser check: start on #menu in full motion, then run finish
// in the next browser turn once the transition has settled.
// Repeat for ABOUT, EXPERIENCE, PROJECTS, SKILLS, ACHIEVEMENTS, CONTACT.
export async function startTitleTransition(page, menuName) {
  await page.getByRole('button', { name: `Open ${menuName}`, exact: true }).press('Enter');
}

export async function finishTitleTransition(page, menuName) {
  const state = await page.evaluate(() => {
    const word = document.querySelector('.section-title-word');
    const extra = document.querySelector('.section-title-extra');
    const flight = document.querySelector('.section-title-flight');
    if (!word || !flight) return { missingTitle: true };
    const target = word.getBoundingClientRect();
    const landed = flight.getBoundingClientRect();
    return {
      ready: document.querySelector('.scene').getAttribute('aria-busy') === 'false',
      heading: document.querySelector('.section-heading h1').textContent,
      wordVisible: getComputedStyle(word).visibility === 'visible',
      extraVisible: !extra || (getComputedStyle(extra).visibility === 'visible' && getComputedStyle(extra).opacity === '1'),
      bannerVisible: getComputedStyle(word.parentElement, '::before').opacity === '1',
      bannerExpanded: parseFloat(getComputedStyle(flight).getPropertyValue('--banner-tail')) >= (extra ? 1 : 0),
      flightHidden: getComputedStyle(flight).visibility === 'hidden',
      distance: Math.hypot((target.left + target.right - landed.left - landed.right) / 2,
        (target.top + target.bottom - landed.top - landed.bottom) / 2),
    };
  });
  const heading = menuName === 'ABOUT' ? 'ABOUT ME' : menuName === 'SKILLS' ? 'SKILL TREE' : menuName;
  if (!state.ready || state.heading !== heading || !state.wordVisible || !state.extraVisible ||
      !state.bannerVisible || !state.bannerExpanded || !state.flightHidden || state.distance > 2) throw new Error(JSON.stringify(state));
  return state;
}
