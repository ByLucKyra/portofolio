// Run against the connected preview after a navigation action has settled.
// Example: await page.getByRole('region', { name: 'Experience timeline', exact: true }).press('End');
// Next browser turn: await verifyExperienceChapter(page, 3);
export async function verifyExperienceChapter(page, expected) {
  const state = await page.evaluate(() => {
    const stops = [...document.querySelectorAll('.journey-stop')];
    const world = document.querySelector('.journey-world').getBoundingClientRect();
    const viewport = document.querySelector('.journey-viewport');
    return {
      active: stops.findIndex(stop => stop.hasAttribute('aria-current')),
      count: stops.length,
      idle: document.querySelector('.journey-traveler').getAttribute('data-motion') === 'idle',
      previousDisabled: document.querySelector('[aria-label="Previous experience"]').disabled,
      nextDisabled: document.querySelector('[aria-label="Next experience"]').disabled,
      scrollable: viewport.scrollWidth > viewport.clientWidth,
      fits: document.documentElement.scrollWidth <= window.innerWidth && stops.every(stop => {
        const card = stop.querySelector('.journey-card').getBoundingClientRect();
        return card.top >= world.top - 1 && card.bottom <= world.bottom + 1;
      }),
    };
  });
  if (state.active !== expected || !state.idle || !state.scrollable || !state.fits ||
      state.previousDisabled !== (expected === 0) || state.nextDisabled !== (expected === state.count - 1)) {
    throw new Error(`Experience journey check failed: ${JSON.stringify(state)}`);
  }
  return state;
}
