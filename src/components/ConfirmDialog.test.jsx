import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ConfirmDialog from './ConfirmDialog';

describe('ConfirmDialog', () => {
  it('renders nothing when closed', () => {
    render(<ConfirmDialog open={false} title="Cancel?" message="Sure?" onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('shows title and message when open, and fires callbacks', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<ConfirmDialog open title="Cancel this request?" message="This cannot be undone." confirmLabel="Cancel request" onConfirm={onConfirm} onCancel={onCancel} />);

    expect(screen.getByText('Cancel this request?')).toBeInTheDocument();
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel request' }));
    expect(onConfirm).toHaveBeenCalledOnce();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
