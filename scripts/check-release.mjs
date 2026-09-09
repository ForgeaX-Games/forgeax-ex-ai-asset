import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(resolve(root, 'forgeax-extension.json'), 'utf8'));
const expected = '@forgeax-extension/ai-asset';
const errors = [];

if (pkg.name !== expected || manifest.id !== expected) errors.push(`package and manifest must use ${expected}`);
if (pkg.version !== manifest.version) errors.push('package and manifest versions must match');
if (pkg.private !== false) errors.push('release package must not be private');
if (pkg.repository?.url !== 'git+https://github.com/ForgeaX-Games/forgeax-ex-ai-asset.git') errors.push('repository URL is not canonical');
if (pkg.publishConfig?.access !== 'public') errors.push('package must publish with public npm access');
if (pkg.publishConfig?.provenance === true) errors.push('private source repositories must not request npm provenance');
for (const [section, dependencies] of Object.entries({ dependencies: pkg.dependencies, optionalDependencies: pkg.optionalDependencies, peerDependencies: pkg.peerDependencies })) {
  for (const [name, specifier] of Object.entries(dependencies ?? {})) {
    if (/^(?:file:|workspace:|git(?:\+|:)|https?:.*\.git(?:#|$)|github:)/.test(String(specifier))) errors.push(`${section}.${name} must use a registry semver, not ${specifier}`);
  }
}
for (const path of [manifest.entry?.frontend, manifest.entry?.backend].filter(Boolean)) {
  if (!existsSync(resolve(root, path))) errors.push(`manifest-owned file is missing: ${path}`);
}
if (errors.length) throw new Error(errors.join('\n'));
console.log(`${expected} release contract is complete`);
