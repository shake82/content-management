import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { generateCertificateRequest } from '../../../api/toolsApi';
import { renderApp } from '../../../test/render';
import { CertificateRequestGeneratorPage } from './CertificateRequestGeneratorPage';

vi.mock('../../../api/toolsApi', () => ({ generateCertificateRequest: vi.fn() }));

it('submits certificate fields, renders generated results, and resets', async () => {
  vi.mocked(generateCertificateRequest)
    .mockResolvedValueOnce({ privateKey: 'FAKE-PRIVATE-PEM', certificateRequest: 'FAKE-CSR-PEM' })
    .mockRejectedValueOnce(new Error('Service unavailable'));
  renderApp(<CertificateRequestGeneratorPage />);

  expect(screen.getByRole('heading', { name: 'Certificate Request Generator' })).toBeInTheDocument();
  await userEvent.type(screen.getByRole('textbox', { name: 'Subject value' }), 'service.example.gov');
  await userEvent.click(screen.getByRole('button', { name: 'Add subject' }));
  await userEvent.type(screen.getByRole('textbox', { name: 'Alternate DNS subjects' }), 'api.example.gov');
  await userEvent.click(screen.getByRole('button', { name: 'Generate request' }));

  expect(await screen.findByRole('heading', { name: 'Certificate request result' })).toBeInTheDocument();
  expect(generateCertificateRequest).toHaveBeenCalledWith({
    subject: 'CN=service.example.gov,OU=Devices,OU=USCIS,OU=Department of Homeland Security,O=U.S. Government,C=US',
    alternateSubjects: ['api.example.gov'],
  });
  expect(screen.getByLabelText('Private key PEM')).toHaveTextContent('FAKE-PRIVATE-PEM');

  await userEvent.click(screen.getByRole('button', { name: 'Generate another' }));
  expect(screen.getByRole('heading', { name: 'Certificate Request Generator' })).toBeInTheDocument();

  await userEvent.type(screen.getByRole('textbox', { name: 'Subject value' }), 'retry.example.gov');
  await userEvent.click(screen.getByRole('button', { name: 'Add subject' }));
  await userEvent.click(screen.getByRole('button', { name: 'Generate request' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Service unavailable');
  expect(screen.getByRole('textbox', { name: 'Subject value' })).toBeInTheDocument();
});
