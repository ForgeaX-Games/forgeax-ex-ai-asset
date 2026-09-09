import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const consumer = mkdtempSync(resolve(tmpdir(), 'forgeax-ai-asset-consumer-'));
try {
  const packed = spawnSync('npm', ['pack', '--json'], { cwd: root, encoding: 'utf8' });
  if (packed.status !== 0) throw new Error(packed.stderr || packed.stdout);
  const [{ filename }] = JSON.parse(packed.stdout);
  const tarball = resolve(root, filename);
  const installed = spawnSync('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', tarball], { cwd: consumer, encoding: 'utf8' });
  rmSync(tarball, { force: true });
  if (installed.status !== 0) throw new Error(installed.stderr || installed.stdout);
  const pkg = JSON.parse(readFileSync(resolve(consumer, 'node_modules/@forgeax-extension/ai-asset/package.json'), 'utf8'));
  if (pkg.name !== '@forgeax-extension/ai-asset') throw new Error('installed package identity mismatch');
  console.log(`${pkg.name}@${pkg.version} installs in an empty consumer`);
} finally {
  rmSync(consumer, { recursive: true, force: true });
}
