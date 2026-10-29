// Production dependency gate: every finding at or above the policy gate
// severity must be covered by an active, owned exception. Lower severities are
// reported but do not fail the gate.
const SEVERITIES = ['info', 'low', 'moderate', 'high', 'critical'];

function activeException(policy, now, name, severity, url) {
  return policy.exceptions.find((exception) => {
    const deadline = new Date(`${exception.reviewBy}T23:59:59.999Z`);
    return exception.package === name && exception.severity === severity && exception.url === url &&
      exception.owner?.trim() && exception.reason?.trim() && exception.control?.trim() &&
      Number.isFinite(deadline.getTime()) &&
      deadline.toISOString().slice(0, 10) === exception.reviewBy && now <= deadline;
  });
}

export function validateAudit(report, policy, now = new Date()) {
  if (!report || report.error || !report.vulnerabilities || !report.metadata?.vulnerabilities) {
    throw new Error('Audit did not return a complete vulnerability report.');
  }
  if (policy.version !== 1 || !Array.isArray(policy.exceptions) || !SEVERITIES.includes(policy.gate)) {
    throw new Error('Invalid audit exception policy.');
  }
  const counts = report.metadata.vulnerabilities;
  const entries = Object.entries(report.vulnerabilities);
  if (!Number.isInteger(counts.total) || counts.total !== entries.length ||
      entries.some(([key, finding]) => key !== finding.name || !SEVERITIES.includes(finding.severity)) ||
      SEVERITIES.some((severity) => (counts[severity] ?? 0) !== entries.filter(([, finding]) => finding.severity === severity).length)) {
    throw new Error('Audit counts or finding schema are inconsistent.');
  }

  const gated = (severity) => SEVERITIES.indexOf(severity) >= SEVERITIES.indexOf(policy.gate);
  const accepted = [];
  const reported = [];
  const pendingDependents = [];
  const errors = [];
  for (const finding of Object.values(report.vulnerabilities)) {
    if (!gated(finding.severity)) {
      reported.push(`${finding.name} (${finding.severity})`);
      continue;
    }
    const details = Array.isArray(finding.via) ? finding.via : [];
    const direct = details.filter((item) => typeof item === 'object');
    const inherited = details.filter((item) => typeof item === 'string');
    if (direct.length && !inherited.length &&
        direct.every((item) => item.severity === finding.severity &&
          activeException(policy, now, finding.name, finding.severity, item.url))) {
      accepted.push(finding.name);
    } else if (!direct.length && inherited.length === 1) {
      pendingDependents.push({ name: finding.name, severity: finding.severity, dependency: inherited[0] });
    } else {
      errors.push(`${finding.name}: ${finding.severity} finding is not covered by an active exception`);
    }
  }
  // A dependent is accepted only when it inherits solely from an accepted
  // package whose exception explicitly names it.
  for (const dependent of pendingDependents) {
    const exception = policy.exceptions.find((item) => item.package === dependent.dependency);
    if (!accepted.includes(dependent.dependency) || !exception?.dependents?.includes(dependent.name) ||
        exception.severity !== dependent.severity) {
      errors.push(`${dependent.name}: ${dependent.severity} finding is not covered by an active exception`);
    } else {
      accepted.push(dependent.name);
    }
  }
  if (errors.length) throw new Error(errors.join('\n'));
  return { accepted, reported, counts };
}
