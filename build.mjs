/**
 * Builds lib/client.js from src/client.js.
 *
 * The client is now a thin iframe wrapper (the full site is served by dsh/index.js),
 * so no engine inlining is needed — just copy the source verbatim.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)));
const client = readFileSync(resolve(root, 'src/client.js'), 'utf8');

const out = `/* Built by build.mjs — do not edit directly. */\n${client}`;

mkdirSync(resolve(root, 'lib'), { recursive: true });
writeFileSync(resolve(root, 'lib/client.js'), out, 'utf8');
process.stdout.write(`Wrote lib/client.js (${Buffer.byteLength(out)} bytes)\n`);
