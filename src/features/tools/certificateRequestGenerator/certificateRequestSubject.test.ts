import { expect, it } from 'vitest';
import {
  DEFAULT_SUBJECTS,
  formatSubjectEntry,
  hasCommonName,
  parseAlternateSubjects,
  serializeSubject,
  sortSubjectEntries,
} from './certificateRequestSubject';

it('formats, stably orders, serializes, validates, and parses certificate request fields', () => {
  const entries = [
    { code: 'C' as const, value: ' US ' },
    { code: 'OU' as const, value: 'First' },
    { code: 'CN' as const, value: 'service.example.gov' },
    { code: 'O' as const, value: 'Agency' },
    { code: 'OU' as const, value: 'Second' },
  ];

  expect(DEFAULT_SUBJECTS.map(formatSubjectEntry)).toEqual([
    'OU=Devices', 'OU=USCIS', 'OU=Department of Homeland Security', 'O=U.S. Government', 'C=US',
  ]);
  expect(sortSubjectEntries(entries).map(formatSubjectEntry)).toEqual([
    'CN=service.example.gov', 'OU=First', 'OU=Second', 'O=Agency', 'C=US',
  ]);
  expect(serializeSubject(entries)).toBe('CN=service.example.gov,OU=First,OU=Second,O=Agency,C=US');
  expect(hasCommonName(entries)).toBe(true);
  expect(hasCommonName(DEFAULT_SUBJECTS)).toBe(false);
  expect(parseAlternateSubjects(' api.example.gov\n\n www.example.gov \r\n')).toEqual([
    'api.example.gov', 'www.example.gov',
  ]);
});
