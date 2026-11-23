import { build } from 'esbuild';
import { mkdir, rm } from 'node:fs/promises';
// Single classic-script bundle: Hatchable serves public/ without a module-aware pipeline.
await rm('public/workspace',{recursive:true,force:true});
await mkdir('public/workspace',{recursive:true});
await build({entryPoints:['src/app.jsx'],outdir:'public/workspace',bundle:true,minify:true,splitting:false,format:'iife',target:'es2022',loader:{'.woff2':'file','.woff':'file','.ttf':'base64'},entryNames:'app',assetNames:'[name]-[hash]',define:{'process.env.NODE_ENV':'"production"'},logLevel:'warning'});
