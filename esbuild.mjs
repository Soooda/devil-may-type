import * as esbuild from 'esbuild';

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

const ctx = await esbuild.context({
  entryPoints: ['src/extension.ts'],
  bundle: true,
  format: 'cjs',
  minify: production,
  sourcemap: !production,
  sourcesContent: false,
  platform: 'node',
  outfile: 'out/extension.js',
  external: ['vscode'],
  logLevel: 'silent',
  plugins: [
    {
      name: 'esbuild-problem-matcher',
      setup(build) {
        build.onEnd(({ errors }) => {
          if (errors.length === 0) {
            console.log('[watch] build finished');
          } else {
            errors.forEach(e => console.error(e.text));
          }
        });
      }
    }
  ]
});

if (watch) {
  await ctx.watch();
  console.log('[watch] watching...');
} else {
  await ctx.rebuild();
  await ctx.dispose();
  console.log('build finished');
}
