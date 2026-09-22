// Connected browser check: start on #menu in full motion, then run finish.
// Repeat for ABOUT, EXPERIENCE, PROJECTS, SKILLS, ACHIEVEMENTS, CONTACT.
export async function startTitleTransition(page, menuName) {
  await page.getByRole('button', { name: `Open ${menuName}`, exact: true }).press('Enter');
  const frames = await page.evaluate(() => new Promise(resolve => {
    const samples = [];
    const started = performance.now();
    const sample = () => {
      const stage = document.querySelector('.stage');
      const flight = document.querySelector('.section-title-flight');
      const wipe = document.querySelector('.transition-wipe').getBoundingClientRect();
      const bounds = flight.getBoundingClientRect();
      const colors = document.querySelector('.title-color-flight');
      const white = getComputedStyle(colors.querySelector('.sweep-white'));
      const pink = getComputedStyle(colors.querySelector('.sweep-pink'));
      const red = getComputedStyle(colors.querySelector('.sweep-red'));
      const ink = getComputedStyle(flight, '::after');
      const ready = document.querySelector('.scene').getAttribute('aria-busy') === 'false';
      samples.push({
        ready,
        flying: getComputedStyle(flight).visibility === 'visible',
        travel: parseFloat(getComputedStyle(stage).getPropertyValue('--scene-travel')) || 0,
        wipeVisible: wipe.left < innerWidth && wipe.right > 0 && wipe.top < innerHeight && wipe.bottom > 0,
        titleArea: bounds.width * bounds.height / (innerWidth * innerHeight),
        colorsVisible: getComputedStyle(colors).visibility === 'visible',
        white: white.transform, pink: pink.transform, red: red.transform,
        redOpacity: Number(red.opacity), ink: ink.transform, inkOpacity: Number(ink.opacity),
      });
      if (ready || performance.now() - started > 3500) resolve(samples);
      else requestAnimationFrame(sample);
    };
    sample();
  }));
  if (!frames.some(frame => frame.travel < -.01) || !frames.some(frame => frame.travel > .01) ||
      frames.some(frame => frame.wipeVisible || (frame.flying && (frame.ready || frame.titleArea > .45))) ||
      !frames.some(frame => frame.colorsVisible && frame.white !== frame.pink && frame.pink !== frame.red && frame.redOpacity > .1) ||
      !frames.some(frame => frame.inkOpacity > .1 && frame.ink !== 'none' && frame.ink !== 'matrix(1, 0, 0, 1, 0, 0)') ||
      !frames.at(-1).ready) throw new Error(`Category motion failed: ${JSON.stringify(frames)}`);
  return frames;
}

export async function finishTitleTransition(page, menuName) {
  const state = await page.evaluate(() => {
    const word = document.querySelector('.section-title-word');
    const extra = document.querySelector('.section-title-extra');
    const flight = document.querySelector('.section-title-flight');
    if (!word || !flight) return { missingTitle: true };
    const target = word.getBoundingClientRect();
    const landed = flight.getBoundingClientRect();
    const colors = document.querySelector('.title-color-flight');
    const banner = word.parentElement.getBoundingClientRect();
    const plates = colors.getBoundingClientRect();
    return {
      ready: document.querySelector('.scene').getAttribute('aria-busy') === 'false',
      heading: document.querySelector('.section-heading h1').textContent,
      wordVisible: getComputedStyle(word).visibility === 'visible',
      extraVisible: !extra || (getComputedStyle(extra).visibility === 'visible' && getComputedStyle(extra).opacity === '1'),
      bannerVisible: getComputedStyle(word.parentElement, '::before').opacity === '1',
      bannerExpanded: parseFloat(getComputedStyle(colors).width) >= word.parentElement.offsetWidth,
      colorsHidden: getComputedStyle(colors).visibility === 'hidden',
      redHidden: getComputedStyle(colors.querySelector('.sweep-red')).opacity === '0',
      inkHidden: getComputedStyle(flight, '::after').opacity === '0',
      colorDistance: Math.hypot((banner.left + banner.right - plates.left - plates.right) / 2,
        (banner.top + banner.bottom - plates.top - plates.bottom) / 2),
      flightHidden: getComputedStyle(flight).visibility === 'hidden',
      travelReset: Math.abs(parseFloat(getComputedStyle(document.querySelector('.stage')).getPropertyValue('--scene-travel')) || 0) < .001,
      oldArtworkRemoved: !document.querySelector('.environment-art-outgoing'),
      distance: Math.hypot((target.left + target.right - landed.left - landed.right) / 2,
        (target.top + target.bottom - landed.top - landed.bottom) / 2),
    };
  });
  const heading = menuName === 'ABOUT' ? 'ABOUT ME' : menuName === 'SKILLS' ? 'SKILL TREE' : menuName;
  if (!state.ready || state.heading !== heading || !state.wordVisible || !state.extraVisible ||
      !state.bannerVisible || !state.bannerExpanded || !state.flightHidden || !state.travelReset ||
      !state.oldArtworkRemoved || !state.colorsHidden || !state.redHidden || !state.inkHidden ||
      state.distance > 2 || state.colorDistance > 2) throw new Error(JSON.stringify(state));
  return state;
}
