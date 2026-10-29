import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { validateAudit } from './audit-policy.mjs';

const npmPath = process.env.npm_execpath;
if (!npmPath || !/npm-cli\.js$/.test(npmPath)) {
  throw new Error('Run the production dependency gate with npm run audit.');
}
const audit = spawnSync(process.execPath, [npmPath, 'audit', '--omit=dev', '--json'], {
  encoding: 'utf8', shell: false, maxBuffer: 10 * 1024 * 1024,
});
if (audit.error || ![0, 1].includes(audit.status)) {
  throw audit.error ?? new Error(`npm audit failed (${audit.status}): ${audit.stderr}`);
}
// Print the raw report before interpreting it, so CI retains the evidence.
process.stdout.write(audit.stdout);
const report = JSON.parse(audit.stdout);
const policy = JSON.parse(fs.readFileSync(new URL('../security/audit-exceptions.json', import.meta.url), 'utf8'));
const result = validateAudit(report, policy);
console.log(`\nProduction audit passed (gate: ${policy.gate}).`);
console.log(`Accepted by exception: ${result.accepted.join(', ') || 'none'}`);
console.log(`Below gate, reported only: ${result.reported.join(', ') || 'none'}`);
