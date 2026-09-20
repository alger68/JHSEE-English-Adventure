import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('English Adventure UI contract', () => {
  const html = readFileSync('index.html','utf8');

  it('preserves DOM ids required by existing scripts', () => {
    for (const id of ['nav','streak','xp','level','main','toast','storageWarning','contentUpdate']) {
      assert.match(html, new RegExp(`id=["']${id}["']`));
    }
    it('exposes the unified family shell and mobile navigation', () => {
    for (const label of ['JHSEE','English Adventure','今日','闖關','錯題','更多']) assert.ok(html.includes(label));
    for (const url of [
      'https://alger68.github.io/JHSEE-Study-Planner/',
      'https://alger68.github.io/JHSEE-All-Subjects/',
      'https://alger68.github.io/JHSEE-English-Adventure/'
    ]) assert.ok(html.includes(url));
    assert.match(html, /class=["'][^"']*mobile-bottom-nav/);
  });

});

  it('loads canonical JHSEE tokens before product styles', () => {
    const tokens = readFileSync('design-tokens.css','utf8');
    assert.ok(html.indexOf('design-tokens.css') >= 0);
    assert.ok(html.indexOf('design-tokens.css') < html.indexOf('style.css'));
    assert.match(tokens, /--jh-primary:\s*#D97706/);
    assert.match(tokens, /JHSEE Design System v1\.0/);
  });
});
