export function formatIssueDetails(issueCounts: Record<string, number>) {
  return Object.entries(issueCounts)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([type, count]) => `${type.toLocaleLowerCase().replaceAll('_', ' ')}: ${count}`)
    .join(', ');
}
