'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');

// Generated files are not committed: build them from the sources before testing.
for (const tool of ['generate-layouts.cjs', 'generate-file-bundles.cjs']) {
  const result = spawnSync(process.execPath, [path.join(root, 'tools', tool)], {cwd: root, stdio: 'inherit'});
  if (result.error || result.status !== 0) process.exit(1);
}
require('./check-structure.cjs').checkStructure({root});
require('./check-game-contracts.cjs').checkGameContracts();

// Every tests/test*.cjs runs automatically: contracts first, the site build last.
const first = ['test-structure.cjs', 'test-content.cjs', 'test-wave-contract.cjs'], last = ['test-site.cjs'];
const rank = name => first.includes(name) ? first.indexOf(name) - first.length : last.includes(name) ? 1 : 0;
const tests = fs.readdirSync(path.join(root, 'tests')).filter(name => /^test.*\.cjs$/.test(name))
  .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));

let failed = 0;
for (const test of tests) {
  console.log(`\nRunning ${test}`);
  const result = spawnSync(process.execPath, ['--experimental-vm-modules', path.join(root, 'tests', test)], {cwd: root, stdio: 'inherit'});
  if (result.error || result.status !== 0) {
    failed++;
    console.error(`FAIL: ${test}: ${result.error?.message || result.signal || result.status}`);
  }
}
console.log(`\n${tests.length - failed}/${tests.length} test suites passed.`);
process.exitCode = failed ? 1 : 0;
