import { Button, Group, Pill, Select, Stack, Text, Textarea, TextInput, Title } from '@mantine/core';
import { IconPlus, IconShieldLock } from '@tabler/icons-react';
import { useId, useRef, useState, type FormEvent } from 'react';
import {
  DEFAULT_SUBJECTS,
  SUBJECT_OPTIONS,
  formatSubjectEntry,
  hasCommonName,
  parseAlternateSubjects,
  serializeSubject,
  sortSubjectEntries,
} from './certificateRequestSubject';
import type {
  CertificateSubjectEntry,
  GenerateCertificateRequestPayload,
  SubjectCode,
} from './certificateRequestTypes';

interface CertificateRequestFieldsProps {
  defaultSubjects?: CertificateSubjectEntry[];
  disabled?: boolean;
  loading?: boolean;
  onSubmit: (request: GenerateCertificateRequestPayload) => void;
}

interface EditableSubjectEntry extends CertificateSubjectEntry {
  id: number;
}

export function CertificateRequestFields({
  defaultSubjects = [],
  disabled = false,
  loading = false,
  onSubmit,
}: CertificateRequestFieldsProps) {
  const nextId = useRef(0);
  const subjectValueId = useId();
  const [subjects, setSubjects] = useState<EditableSubjectEntry[]>(() =>
    [...DEFAULT_SUBJECTS, ...defaultSubjects].map((subject) => ({ ...subject, id: nextId.current++ })),
  );
  const [subjectCode, setSubjectCode] = useState<SubjectCode>('CN');
  const [subjectValue, setSubjectValue] = useState('');
  const [alternateSubjects, setAlternateSubjects] = useState('');
  const [validationError, setValidationError] = useState<string>();

  const addSubject = () => {
    const value = subjectValue.trim();
    if (!value) return;
    setSubjects((current) => [...current, { code: subjectCode, value, id: nextId.current++ }]);
    setSubjectValue('');
    setValidationError(undefined);
  };

  const removeSubject = (id: number) => {
    setSubjects((current) => current.filter((subject) => subject.id !== id));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasCommonName(subjects)) {
      setValidationError('Add at least one Common Name (CN) before generating the request.');
      return;
    }
    setValidationError(undefined);
    onSubmit({
      subject: serializeSubject(subjects),
      alternateSubjects: parseAlternateSubjects(alternateSubjects),
    });
  };

  return (
    <form onSubmit={submit}>
      <Stack gap="xl">
        <div>
          <Title order={2} size="h4" mb="xs">Subject</Title>
          <Text size="sm" c="dimmed" mb="md">Add the distinguished-name fields for the certificate request.</Text>
          <div className="certificate-request-subject-row">
            <Select
              label="Subject field"
              data={SUBJECT_OPTIONS}
              value={subjectCode}
              onChange={(value) => setSubjectCode((value ?? 'CN') as SubjectCode)}
              disabled={disabled}
              allowDeselect={false}
            />
            <TextInput
              id={subjectValueId}
              label="Subject value"
              value={subjectValue}
              placeholder="service.example.gov"
              onChange={(event) => setSubjectValue(event.currentTarget.value)}
              disabled={disabled}
            />
            <Button
              type="button"
              variant="light"
              leftSection={<IconPlus size={16} />}
              onClick={addSubject}
              disabled={disabled || !subjectValue.trim()}
            >
              Add subject
            </Button>
          </div>
          <Pill.Group mt="md" aria-label="Certificate subjects">
            {sortSubjectEntries(subjects).map((subject) => (
              <Pill
                key={subject.id}
                withRemoveButton={!disabled}
                onRemove={() => removeSubject(subject.id)}
                removeButtonProps={{
                  'aria-label': `Remove ${formatSubjectEntry(subject)}`,
                  'aria-hidden': false,
                  tabIndex: 0,
                }}
              >
                {formatSubjectEntry(subject)}
              </Pill>
            ))}
          </Pill.Group>
          {validationError && <Text c="red" size="sm" mt="xs" role="alert">{validationError}</Text>}
        </div>

        <div>
          <Title order={2} size="h4" mb="xs">Alternate subjects</Title>
          <Textarea
            label="Alternate DNS subjects"
            description="Enter one DNS subject per line. Blank lines are ignored."
            placeholder={'api.example.gov\nwww.example.gov'}
            value={alternateSubjects}
            onChange={(event) => setAlternateSubjects(event.currentTarget.value)}
            disabled={disabled}
            rows={5}
          />
        </div>

        <Group justify="flex-end">
          <Button
            type="submit"
            leftSection={<IconShieldLock size={16} />}
            disabled={disabled}
            loading={loading}
          >
            Generate request
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
