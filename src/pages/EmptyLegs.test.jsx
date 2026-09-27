import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EmptyLegs from './EmptyLegs';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({ api: vi.fn() }));
vi.mock('../lib/auth', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('../components/Toast', () => ({ useToast: () => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }) }));

const leg = {
  id: 1, ref: 'EL-1001', origin: 'Mumbai (BOM)', destination: 'Goa (GOX)',
  depart_date: '2026-01-15', depart_time: '10:00', aircraft: 'Citation XLS',
  seats_available: 3, seats_total: 6, price: 1200, currency: 'USD', notes: 'Repositioning flight',
};

const renderPage = () => render(<MemoryRouter><EmptyLegs /></MemoryRouter>);

describe('EmptyLegs page', () => {
  beforeEach(() => { api.mockReset(); });

  it('shows an empty state when there are no listings', async () => {
    api.mockResolvedValueOnce([]);
    renderPage();
    expect(await screen.findByText(/No empty legs available right now/)).toBeInTheDocument();
  });

  it('renders a listing and opens the guest booking form on "Book now"', async () => {
    api.mockResolvedValueOnce([leg]);
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText(/Mumbai \(BOM\)/)).toBeInTheDocument();
    expect(screen.getByText('3 left')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Book now' }));

    expect(screen.getByLabelText('Your name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Passengers')).toHaveAttribute('max', '3');
  });

  it('submits a guest booking and shows the confirmation reference', async () => {
    api.mockResolvedValueOnce([leg]);
    api.mockResolvedValueOnce({ ref: 'ELB-9001', email: 'jane@example.com' });
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Book now' }));
    await user.type(screen.getByLabelText('Your name'), 'Jane Doe');
    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.type(screen.getByLabelText('Contact phone'), '9876543210');
    await user.click(screen.getByRole('button', { name: 'Confirm booking' }));

    await waitFor(() => expect(screen.getByText('Booking confirmed')).toBeInTheDocument());
    expect(screen.getByText('ELB-9001')).toBeInTheDocument();
    expect(api).toHaveBeenLastCalledWith('/public/empty-legs/1/book', expect.objectContaining({ method: 'POST' }));
  });
});
