// One camera drives every decorative layer; controls keep their hit areas still.
export function attachParallax(stage) {
  const view = stage.ownerDocument.defaultView;
  const current = { x: 0, y: 0, scroll: 0 };
  const target = { ...current };
  let frame = 0;
  let previous = 0;
  let disposed = false;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const draw = () => {
    stage.style.setProperty('--view-x', String(current.x));
    stage.style.setProperty('--view-y', String(current.y));
    stage.style.setProperty('--scroll-shift', `${current.scroll}px`);
  };
  const tick = time => {
    frame = 0;
    if (disposed) return;
    const blend = previous ? 1 - Math.exp(-Math.min(time - previous, 64) / 110) : .15;
    previous = time;
    let moving = false;
    for (const key of ['x', 'y', 'scroll']) {
      current[key] += (target[key] - current[key]) * blend;
      if (Math.abs(target[key] - current[key]) < (key === 'scroll' ? .1 : .001)) current[key] = target[key];
      else moving = true;
    }
    draw();
    if (moving) frame = view.requestAnimationFrame(tick);
  };
  const schedule = () => {
    if (!frame && !disposed) { previous = 0; frame = view.requestAnimationFrame(tick); }
  };
  const move = event => {
    const bounds = stage.getBoundingClientRect();
    target.x = clamp((event.clientX - bounds.left) / Math.max(bounds.width, 1) * 2 - 1, -1, 1);
    // Use the visible viewport, even when a section is several screens tall.
    target.y = clamp(event.clientY / Math.max(view.innerHeight, 1) * 2 - 1, -1, 1);
    schedule();
  };
  const leave = () => { target.x = 0; target.y = 0; schedule(); };
  const release = event => { if (event.pointerType !== 'mouse') leave(); };
  const scroll = () => {
    target.scroll = clamp(-stage.getBoundingClientRect().top + stage.scrollTop, 0, view.innerHeight);
    schedule();
  };
  const pointerEvents = { pointermove: move, pointerdown: move, pointerleave: leave, pointerup: release, pointercancel: leave };
  for (const [event, handler] of Object.entries(pointerEvents)) stage.addEventListener(event, handler, { passive: true });
  view.addEventListener('scroll', scroll, { passive: true, capture: true });
  view.addEventListener('resize', scroll, { passive: true });
  view.addEventListener('blur', leave);
  draw(); scroll();
  return () => {
    disposed = true;
    view.cancelAnimationFrame(frame);
    for (const [event, handler] of Object.entries(pointerEvents)) stage.removeEventListener(event, handler);
    view.removeEventListener('scroll', scroll, true);
    view.removeEventListener('resize', scroll);
    view.removeEventListener('blur', leave);
    for (const property of ['--view-x', '--view-y', '--scroll-shift']) stage.style.removeProperty(property);
  };
}
