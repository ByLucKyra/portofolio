// Connected browser check: start on #menu in full motion, then run finish.
// Repeat for ABOUT, EXPERIENCE, PROJECTS, SKILLS, ACHIEVEMENTS, CONTACT.
export async function startTitleTransition(page, menuName) {
  await page.getByRole('button', { name: `Open ${menuName}`, exact: true }).press('Enter');
  const frames = await page.evaluate(menuName => new Promise(resolve => {
    const samples = [];
    const started = performance.now();
    const sample = () => {
      const stage = document.querySelector('.stage');
      const flight = document.querySelector('.section-title-flight');
      const wipe = document.querySelector('.transition-wipe').getBoundingClientRect();
      const colors = document.querySelector('.title-color-flight');
      const colorsVisible = getComputedStyle(colors).visibility === 'visible';
      const points = [[1, 1], [innerWidth - 1, 1], [1, innerHeight - 1],
        [innerWidth - 1, innerHeight - 1], [innerWidth / 2, innerHeight / 2]];
      const layers = ['navy', 'blue', 'cyan', 'pink', 'white', 'red'].map(name => {
        const path = colors.querySelector(`.sweep-${name}`);
        const style = getComputedStyle(path);
        const visible = colorsVisible && Number(style.opacity) > .1;
        const inverse = path.getScreenCTM().inverse();
        return { name, visible, transform: style.transform, shape: path.getAttribute('d'),
          covers: visible && Number(style.opacity) >= .99 && points.every(([x, y]) => path.isPointInFill(new DOMPoint(x, y).matrixTransform(inverse))) };
      });
      const ink = getComputedStyle(flight, '::after');
      const ready = document.querySelector('.scene').getAttribute('aria-busy') === 'false';
      // A second activation must not replace the category while its colors are flying.
      if (!ready && !samples.length) {
        [...document.querySelectorAll('.menu-button')].find(button => button.getAttribute('aria-label') !== `Open ${menuName}`)?.click();
      }
      samples.push({
        ready, screen: stage.dataset.screen,
        flying: getComputedStyle(flight).visibility === 'visible',
        travel: parseFloat(getComputedStyle(stage).getPropertyValue('--scene-travel')) || 0,
        wipeVisible: wipe.left < innerWidth && wipe.right > 0 && wipe.top < innerHeight && wipe.bottom > 0,
        colorsVisible, layers, ink: ink.transform, inkOpacity: Number(ink.opacity),
      });
      if (ready || performance.now() - started > 3500) resolve(samples);
      else requestAnimationFrame(sample);
    };
    sample();
  }), menuName);
  if (!frames.some(frame => frame.layers.some(layer => layer.covers)) ||
      !frames.some(frame => frame.layers.every(layer => layer.visible)) ||
      frames.some(frame => frame.wipeVisible || Math.abs(frame.travel) > .001 || ((frame.flying || frame.colorsVisible) && frame.ready)) ||
      frames[0].layers.some(({ name }) => new Set(frames.filter(frame => frame.colorsVisible)
        .map(frame => { const layer = frame.layers.find(layer => layer.name === name); return `${layer.transform}/${layer.shape}`; })).size < 2) ||
      !frames.some(frame => frame.inkOpacity > .1 && frame.ink !== 'none' && frame.ink !== 'matrix(1, 0, 0, 1, 0, 0)') ||
      !frames.find(frame => frame.screen === menuName.toLowerCase())?.layers.some(layer => layer.covers) ||
      !frames.at(-1).ready || frames.at(-1).screen !== menuName.toLowerCase()) throw new Error(`Category motion failed: ${JSON.stringify(frames)}`);
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
      depthColorsHidden: ['navy', 'blue', 'cyan'].every(name => getComputedStyle(colors.querySelector(`.sweep-${name}`)).opacity === '0'),
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
      !state.oldArtworkRemoved || !state.colorsHidden || !state.depthColorsHidden || !state.redHidden || !state.inkHidden ||
      state.distance > 2 || state.colorDistance > 2) throw new Error(JSON.stringify(state));
  return state;
}
