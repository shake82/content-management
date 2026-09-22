import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderApp } from '../../../test/render';
import { CertificateRequestFields } from './CertificateRequestFields';

it('renders defaults, manages ordered subjects, validates CN, and submits normalized values', async () => {
  const onSubmit = vi.fn();
  renderApp(
    <CertificateRequestFields
      defaultSubjects={[{ code: 'L', value: 'Washington' }]}
      onSubmit={onSubmit}
    />,
  );

  const subjects = screen.getByLabelText('Certificate subjects');
  expect(subjects).toHaveTextContent('OU=Devices');
  expect(subjects).toHaveTextContent('L=Washington');
  expect(screen.getAllByRole('button', { name: /^Remove/ })).toHaveLength(6);

  await userEvent.click(screen.getByRole('button', { name: 'Generate request' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Add at least one Common Name');
  expect(onSubmit).not.toHaveBeenCalled();

  await userEvent.type(screen.getByRole('textbox', { name: 'Subject value' }), 'service.example.gov');
  await userEvent.click(screen.getByRole('button', { name: 'Add subject' }));
  expect(subjects.textContent?.indexOf('CN=service.example.gov')).toBeLessThan(subjects.textContent?.indexOf('OU=Devices') ?? 0);

  await userEvent.type(screen.getByRole('textbox', { name: 'Alternate DNS subjects' }), 'api.example.gov\n\n www.example.gov ');
  await userEvent.click(screen.getByRole('button', { name: 'Generate request' }));
  expect(onSubmit).toHaveBeenCalledWith({
    subject: 'CN=service.example.gov,OU=Devices,OU=USCIS,OU=Department of Homeland Security,O=U.S. Government,L=Washington,C=US',
    alternateSubjects: ['api.example.gov', 'www.example.gov'],
  });

  await userEvent.click(within(subjects).getByRole('button', { name: 'Remove CN=service.example.gov' }));
  expect(subjects).not.toHaveTextContent('CN=service.example.gov');
});
