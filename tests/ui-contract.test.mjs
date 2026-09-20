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
});
