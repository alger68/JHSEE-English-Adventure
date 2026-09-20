import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('English Adventure UI contract', () => {
  const html = readFileSync('index.html','utf8');

  it('preserves DOM ids required by existing scripts', () => {
    for (const id of ['nav','streak','xp','level','main','toast','storageWarning','contentUpdate']) {
      assert.match(html, new RegExp(`id=["']${id}["']`));
    }
  });

  it('loads canonical JHSEE tokens before product styles', () => {
    const tokens = readFileSync('design-tokens.css','utf8');
    assert.ok(html.indexOf('design-tokens.css') >= 0);
    assert.ok(html.indexOf('design-tokens.css') < html.indexOf('style.css'));
    assert.match(tokens, /--jh-primary:\s*#D97706/);
    assert.match(tokens, /JHSEE Design System v1\.0/);
  });
});
