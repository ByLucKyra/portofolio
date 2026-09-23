// Run on #welcome at 320×568 and 390×740. Welcome has no entrance animation.
export async function verifyMobileWelcome(page) {
  const layout = await page.evaluate(() => {
    const box = selector => {
      const { left, top, right, bottom, height } = document.querySelector(selector).getBoundingClientRect();
      return { left, top, right, bottom, height };
    };
    return {
      width: innerWidth, height: innerHeight,
      brand: box('.welcome-brand'), caption: box('.welcome-caption'),
      menu: box('.welcome-menu'), footer: box('.controls'),
      buttons: [...document.querySelectorAll('.welcome-button')].map(button => {
        const { left, right, height } = button.getBoundingClientRect();
        return { left, right, height, fits: button.scrollWidth <= button.clientWidth };
      }),
    };
  });
  const inside = box => box.left >= -1 && box.right <= layout.width + 1 && box.top >= -1 && box.bottom <= layout.height + 1;
  if (![layout.brand, layout.caption, layout.menu, layout.footer].every(inside) ||
      layout.brand.bottom > layout.caption.top || layout.caption.bottom > layout.menu.top ||
      layout.menu.bottom > layout.footer.top + 1 || layout.buttons.some(button => !button.fits || button.height < 44)) {
    throw new Error(`Mobile welcome layout failed: ${JSON.stringify(layout)}`);
  }
  return layout;
}

// Run on #welcome in full motion. START and return to title must commit immediately.
export async function verifyInstantWelcomeNavigation(page) {
  const state = await page.evaluate(async () => {
    const frame = () => new Promise(resolve => requestAnimationFrame(resolve));
    const snapshot = () => {
      const stage = document.querySelector('.stage');
      const wipe = document.querySelector('.transition-wipe').getBoundingClientRect();
      const camera = getComputedStyle(stage);
      return {
        screen: stage.dataset.screen,
        ready: document.querySelector('.scene').getAttribute('aria-busy') === 'false',
        sceneVisible: getComputedStyle(document.querySelector('.scene')).opacity === '1',
        camera: ['--view-x', '--view-y', '--scroll-shift'].map(name => camera.getPropertyValue(name)).join('/'),
        backdrop: getComputedStyle(document.querySelector('.environment'), '::before').transform,
        wipeVisible: wipe.left < innerWidth && wipe.right > 0 && wipe.top < innerHeight && wipe.bottom > 0,
        flying: ['.title-color-flight', '.section-title-flight'].some(selector => getComputedStyle(document.querySelector(selector)).visibility === 'visible'),
        itemsVisible: [...document.querySelectorAll('.welcome-brand,.welcome-caption,.welcome-button:not(:disabled),.menu-button')]
          .every(item => getComputedStyle(item).opacity === '1'),
      };
    };
    const initial = snapshot();
    const stage = document.querySelector('.stage');
    stage.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: innerWidth - 1, clientY: innerHeight - 1, pointerType: 'mouse' }));
    await frame(); await frame();
    const pointer = snapshot();
    document.querySelector('.welcome-button').click();
    const menu = snapshot();
    await frame(); await frame();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    const welcome = snapshot();
    await frame(); await frame();
    const settled = snapshot();
    const config = [...document.querySelectorAll('.welcome-button')].at(-1);
    config.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse' }));
    await frame();
    return { initial, pointer, menu, welcome, settled, hoverWorks: config.classList.contains('active') };
  });
  if (state.initial.screen !== 'welcome' || state.menu.screen !== 'menu' || state.welcome.screen !== 'welcome' ||
      [state.initial, state.pointer, state.menu, state.welcome, state.settled].some(frame => !frame.ready || !frame.sceneVisible || !frame.itemsVisible || frame.wipeVisible || frame.flying) ||
      state.initial.camera !== state.pointer.camera || state.initial.backdrop !== state.pointer.backdrop ||
      state.welcome.camera !== state.settled.camera || state.welcome.backdrop !== state.settled.backdrop || !state.hoverWorks) {
    throw new Error(`Instant welcome navigation failed: ${JSON.stringify(state)}`);
  }
  return state;
}
