// Bundles the studio into ONE self-contained HTML (no server, opens via file://).
import { build } from 'esbuild';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const result = await build({
  entryPoints: [join(root, 'src/standalone.tsx')],
  bundle: true,
  format: 'iife',
  minify: true,
  jsx: 'automatic',
  loader: { '.png': 'dataurl', '.svg': 'dataurl', '.ttf': 'dataurl', '.jpg': 'dataurl' },
  define: { 'process.env.NODE_ENV': '"production"' },
  outdir: 'out',
  write: false,
  logLevel: 'info',
});

const jsFile = result.outputFiles.find((f) => f.path.endsWith('.js'));
const cssFile = result.outputFiles.find((f) => f.path.endsWith('.css'));
const js = jsFile.text.replace(/<\/script>/g, '<\\/script>');
const css = cssFile ? cssFile.text : '';

const html = `<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>TGS Post Studio</title>
<style>${css}</style>
</head>
<body>
<div id="root"></div>
<script>${js}</script>
</body>
</html>`;

const out = join(root, 'TGS_Post_Studio.html');
writeFileSync(out, html);
console.log('Wrote', out, (html.length / 1024 / 1024).toFixed(2), 'MB');
