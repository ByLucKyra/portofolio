import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('each menu category has one distinct decorative emblem and respects reduced motion', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
  try {
    const { MenuEmblem } = await server.ssrLoadModule('/src/MenuEmblem.tsx');
    const symbols = new Set();
    for (let selected = 0; selected < 6; selected++) {
      const markup = renderToStaticMarkup(createElement(MenuEmblem, { selected, reduced: false }));
      const active = [...markup.matchAll(/class="emblem-symbol is-active">([\s\S]*?)<\/g>/g)];
      assert.equal(active.length, 1, `category ${selected} has exactly one active symbol`);
      symbols.add(active[0][1]);
      assert.match(markup, /aria-hidden="true"/);
      assert.match(markup, /data-reduced="false"/);
      assert.match(markup, new RegExp(`data-theme="${selected}"`));
    }
    assert.equal(symbols.size, 6, 'all categories show different symbols');
    assert.match(renderToStaticMarkup(createElement(MenuEmblem, { selected: 0, reduced: true })), /data-reduced="true"/);
  } finally {
    await server.close();
  }
});
