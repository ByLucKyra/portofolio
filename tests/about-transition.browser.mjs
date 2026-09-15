// Connected browser check: start on #menu in full motion, then run finish
// in the next browser turn once the transition has settled.
export async function startAboutTransition(page) {
  await page.getByRole('button', { name: 'Open ABOUT', exact: true }).press('Enter');
}

export async function finishAboutTransition(page) {
  const state = await page.evaluate(() => {
    const word = document.querySelector('.about-title-word');
    const me = document.querySelector('.about-title-me');
    const flight = document.querySelector('.about-title-flight');
    if (!word || !me || !flight) return { missingTitle: true };
    const target = word.getBoundingClientRect();
    const landed = flight.getBoundingClientRect();
    return {
      ready: document.querySelector('.scene').getAttribute('aria-busy') === 'false',
      heading: document.querySelector('.section-heading h1').textContent,
      wordVisible: getComputedStyle(word).visibility === 'visible',
      meVisible: getComputedStyle(me).opacity === '1' && getComputedStyle(me).clipPath === 'none',
      bannerVisible: getComputedStyle(word.parentElement, '::before').opacity === '1',
      bannerExpanded: parseFloat(getComputedStyle(flight).getPropertyValue('--banner-tail')) > 0,
      flightHidden: getComputedStyle(flight).visibility === 'hidden',
      distance: Math.hypot((target.left + target.right - landed.left - landed.right) / 2,
        (target.top + target.bottom - landed.top - landed.bottom) / 2),
    };
  });
  if (!state.ready || state.heading !== 'ABOUT ME' || !state.wordVisible || !state.meVisible ||
      !state.bannerVisible || !state.bannerExpanded || !state.flightHidden || state.distance > 2) throw new Error(JSON.stringify(state));
  return state;
}
