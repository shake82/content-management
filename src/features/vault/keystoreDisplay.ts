import { parseKeystoreDate } from './certificateStatus';

export function formatKeystoreDate(value: string | null) {
  if (!value) return 'None';

  const date = parseKeystoreDate(value);
  if (!date) return value;

  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
}
