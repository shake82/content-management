export function filterStagingCertificateKeys(keys: string[], query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return keys;
  return keys.filter((key) => key.toLocaleLowerCase().includes(normalizedQuery));
}

export function getTotalPages(totalItems: number, pageSize: number) {
  if (totalItems === 0) return 1;
  return Math.max(Math.ceil(totalItems / pageSize), 1);
}

export function paginateKeys(keys: string[], pageNumber: number, pageSize: number) {
  const start = Math.max(pageNumber, 0) * pageSize;
  return keys.slice(start, start + pageSize);
}
