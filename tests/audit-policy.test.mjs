import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { validateAudit } from '../scripts/audit-policy.mjs';

const policy = JSON.parse(fs.readFileSync(new URL('../security/audit-exceptions.json', import.meta.url), 'utf8'));
const zodUrl = policy.exceptions[0].url;
const now = new Date('2026-10-29T00:00:00Z');

function report() {
  return {
    vulnerabilities: {
      zod: { name: 'zod', severity: 'high', via: [{ severity: 'high', url: zodUrl }] },
      '@vee-validate/zod': { name: '@vee-validate/zod', severity: 'high', via: ['zod'] },
      deepmerge: { name: 'deepmerge', severity: 'low', via: [{ severity: 'low', url: 'https://github.com/advisories/GHSA-gcqx-w48m-w2h4' }] },
    },
    metadata: { vulnerabilities: { low: 1, high: 2, critical: 0, total: 3 } },
  };
}

test('the zod advisory and its @vee-validate/zod aggregate pass until review', () => {
  const result = validateAudit(report(), policy, now);
  assert.deepEqual(result.accepted, ['zod', '@vee-validate/zod']);
  assert.deepEqual(result.reported, ['deepmerge (low)']);
});

test('the exception expires after its review date', () => {
  assert.throws(() => validateAudit(report(), policy, new Date('2026-11-30T00:00:00Z')), /not covered/);
});

test('a new advisory on zod fails closed', () => {
  const value = report();
  value.vulnerabilities.zod.via.push({ severity: 'high', url: 'https://github.com/advisories/new' });
  assert.throws(() => validateAudit(value, policy, now), /zod: high/);
});

test('critical severity cannot use the high exception', () => {
  const value = report();
  value.vulnerabilities.zod.severity = 'critical';
  value.vulnerabilities.zod.via[0].severity = 'critical';
  value.metadata.vulnerabilities.high = 1;
  value.metadata.vulnerabilities.critical = 1;
  assert.throws(() => validateAudit(value, policy, now), /not covered/);
});

test('another package inheriting from zod is not covered', () => {
  const value = report();
  value.vulnerabilities['other-forms'] = { name: 'other-forms', severity: 'high', via: ['zod'] };
  value.metadata.vulnerabilities.high = 3;
  value.metadata.vulnerabilities.total = 4;
  assert.throws(() => validateAudit(value, policy, now), /other-forms: high/);
});

test('any other high finding fails', () => {
  const value = report();
  value.vulnerabilities.vite = { name: 'vite', severity: 'high', via: [{ severity: 'high', url: 'https://github.com/advisories/x' }] };
  value.metadata.vulnerabilities.high = 3;
  value.metadata.vulnerabilities.total = 4;
  assert.throws(() => validateAudit(value, policy, now), /vite: high/);
});

test('registry failures and inconsistent counts are not a clean audit', () => {
  assert.throws(() => validateAudit({ error: { message: 'offline' } }, policy, now), /complete/);
  const value = report();
  value.metadata.vulnerabilities.critical = 1;
  assert.throws(() => validateAudit(value, policy, now), /inconsistent/);
});

test('invalid calendar review dates cannot extend an exception', () => {
  const invalid = structuredClone(policy);
  invalid.exceptions[0].reviewBy = '2026-11-31';
  assert.throws(() => validateAudit(report(), invalid, now), /not covered/);
});

test('a fixed tree passes with no accepted packages', () => {
  const result = validateAudit({ vulnerabilities: {}, metadata: { vulnerabilities: { total: 0 } } }, policy, now);
  assert.deepEqual(result.accepted, []);
});
