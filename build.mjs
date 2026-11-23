import { build } from 'esbuild';
import { copyFile, mkdir } from 'node:fs/promises';
await mkdir('public/workspace',{recursive:true});
await build({entryPoints:['src/app.jsx'],outdir:'public/workspace',bundle:true,minify:true,splitting:true,format:'esm',target:'es2022',loader:{'.woff2':'file','.woff':'file'},entryNames:'app',assetNames:'[name]-[hash]',define:{'process.env.NODE_ENV':'"production"'}});
await copyFile('node_modules/pdfjs-dist/build/pdf.worker.min.mjs','public/workspace/pdf.worker.min.mjs');
