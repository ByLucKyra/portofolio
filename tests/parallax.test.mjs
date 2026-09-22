import { test } from 'node:test';
import assert from 'node:assert/strict';
import { attachParallax } from '../src/parallax.mjs';

test('parallax follows viewport input, bounds scrolling, and disposes all work', () => {
  class Surface extends EventTarget {
    listeners = [];
    addEventListener(type, callback, options) {
      const capture = typeof options === 'boolean' ? options : !!options?.capture;
      this.listeners.push({ type, callback, capture });
      super.addEventListener(type, callback, { capture });
    }
    removeEventListener(type, callback, options) {
      const capture = typeof options === 'boolean' ? options : !!options?.capture;
      this.listeners = this.listeners.filter(item => item.type !== type || item.callback !== callback || item.capture !== capture);
      super.removeEventListener(type, callback, { capture });
    }
  }
  const view = new Surface();
  const stage = new Surface();
  const frames = new Map();
  const styles = new Map();
  let id = 0, time = 0, writes = 0;
  let bounds = { left: 40, width: 600, top: -900, height: 2400 };
  Object.assign(view, {
    innerHeight: 600,
    requestAnimationFrame: callback => { frames.set(++id, callback); return id; },
    cancelAnimationFrame: frame => frames.delete(frame),
  });
  Object.assign(stage, {
    ownerDocument: { defaultView: view }, scrollTop: 0,
    getBoundingClientRect: () => bounds,
    style: {
      setProperty: (key, value) => { writes++; styles.set(key, value); },
      removeProperty: key => styles.delete(key),
    },
  });
  const emit = (surface, type, properties = {}) => surface.dispatchEvent(Object.assign(new Event(type), properties));
  const settle = () => {
    let count = 0;
    while (frames.size) {
      assert.ok(++count < 500, 'animation must converge');
      const batch = [...frames.values()]; frames.clear();
      time += 16;
      batch.forEach(callback => callback(time));
    }
  };
  const position = () => [Number(styles.get('--view-x')), Number(styles.get('--view-y'))];
  const dispose = attachParallax(stage);
  assert.ok(view.listeners.some(item => item.type === 'scroll' && item.capture), 'nested scrolling is captured');

  emit(stage, 'pointermove', { clientX: 640, clientY: 0, pointerType: 'mouse' });
  settle(); assert.deepEqual(position(), [1, -1]);
  emit(stage, 'pointermove', { clientX: 340, clientY: 300, pointerType: 'mouse' });
  settle(); assert.deepEqual(position(), [0, 0], 'viewport center stays neutral on a tall scrolled stage');
  emit(stage, 'pointerdown', { clientX: -1000, clientY: 2000, pointerType: 'touch' });
  settle(); assert.deepEqual(position(), [-1, 1]);
  emit(stage, 'pointerup', { pointerType: 'touch' });
  settle(); assert.deepEqual(position(), [0, 0]);
  emit(stage, 'pointermove', { clientX: 10000, clientY: -100, pointerType: 'mouse' });
  settle(); assert.deepEqual(position(), [1, -1]);
  emit(stage, 'pointerup', { pointerType: 'mouse' });
  settle(); assert.deepEqual(position(), [1, -1], 'mouse release keeps hover depth');
  emit(stage, 'pointerleave'); settle(); assert.deepEqual(position(), [0, 0]);

  bounds = { ...bounds, top: -320 }; stage.scrollTop = 85;
  emit(view, 'scroll'); settle(); assert.equal(styles.get('--scroll-shift'), '405px');
  bounds.top = -900;
  emit(view, 'scroll'); settle(); assert.equal(styles.get('--scroll-shift'), '600px');
  view.innerHeight = 400;
  emit(view, 'resize'); settle(); assert.equal(styles.get('--scroll-shift'), '400px');
  bounds.top = 100; stage.scrollTop = 0;
  emit(view, 'scroll'); settle(); assert.equal(styles.get('--scroll-shift'), '0px');

  emit(stage, 'pointermove', { clientX: 640, clientY: 0, pointerType: 'mouse' });
  const lateFrame = [...frames.values()][0];
  assert.equal(typeof lateFrame, 'function');
  dispose();
  assert.equal(frames.size, 0);
  assert.equal(stage.listeners.length + view.listeners.length, 0);
  assert.equal(styles.size, 0);
  const writesBefore = writes;
  lateFrame(time + 16);
  emit(stage, 'pointermove', { clientX: 0, clientY: 0 }); emit(view, 'scroll');
  assert.equal(frames.size, 0); assert.equal(writes, writesBefore);
});
