// Run on #welcome after its entrance animation, at 320×568 and 390×740.
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
