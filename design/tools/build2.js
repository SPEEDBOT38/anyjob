const only = process.argv[2];
for (const d of ['d1', 'd2', 'd3']) { if (!only || only.includes(d)) { try { require('./' + d); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; } } }
process.stdout.write(JSON.stringify(require('./lib').steps));
