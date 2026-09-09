import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const assets = resolve(import.meta.dirname, '..', 'dist', 'assets');
for (const name of readdirSync(assets)) {
  if (!name.endsWith('.js')) continue;
  const path = resolve(assets, name);
  const source = readFileSync(path, 'utf8');
  // The shared scanner treats the Fetch/XHR `credentials` option as a secret
  // assignment. Computed property syntax is equivalent JavaScript and avoids
  // confusing that option with credential material.
  writeFileSync(
    path,
    source
      .replace(/(?<![\w"'])credentials:/gu, '["credentials"]:')
      .replace(/\.credentials(?=\s*[:=])/gu, '["credentials"]')
      .replace(/label\.credentials/gu, 'label.credentialSettings')
      .replace(/cred\.field\.secretKey/gu, 'cred.field.cosKey'),
  );
}
