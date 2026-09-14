// On #menu with full motion: run start, then finish in a separate browser turn.
// Separate turns let the in-app browser render its animation frames.
export async function verifyMenuFillStart(page) {
  await page.getByRole('button', { name: 'Open EXPERIENCE', exact: true }).press('Enter');
  const state = await page.evaluate(() => {
    const wipe = document.querySelector('.transition-wipe');
    const rect = wipe.getBoundingClientRect();
    return {
      screen: document.querySelector('.stage').getAttribute('data-screen'),
      clip: getComputedStyle(wipe).clipPath,
      positionedToFill: rect.left === 0 && rect.top === 0 && rect.right >= document.documentElement.clientWidth && rect.bottom >= document.documentElement.clientHeight,
    };
  });
  if (state.screen !== 'menu' || !state.clip.startsWith('polygon(') || !state.positionedToFill) throw new Error(JSON.stringify(state));
  return state;
}

export async function verifyMenuFillFinish(page) {
  const state = await page.evaluate(() => ({
    screen: document.querySelector('.stage').getAttribute('data-screen'),
    clip: getComputedStyle(document.querySelector('.transition-wipe')).clipPath,
    overlayCleared: document.querySelector('.transition-wipe').getBoundingClientRect().left >= document.documentElement.clientWidth,
  }));
  if (state.screen !== 'experience' || state.clip !== 'none' || !state.overlayCleared) throw new Error(JSON.stringify(state));
  return state;
}
