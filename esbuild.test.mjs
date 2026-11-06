import { build } from 'esbuild';
import { mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';

const testDir = 'src/test';
const outDir = 'out-test';

mkdirSync(outDir, { recursive: true });

const entries = readdirSync(testDir).filter((name) => name.endsWith('.test.ts'));

for (const name of entries) {
  const result = await build({
    entryPoints: [path.join(testDir, name)],
    outfile: path.join(outDir, name.replace(/\.ts$/, '.cjs')),
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node22',
    sourcemap: false,
    logLevel: 'info',
  });

  if (result.errors.length > 0) {
    process.exit(1);
  }
}
