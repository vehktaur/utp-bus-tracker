import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { useShareLocation } from '~/hooks';
import SharePanel from '~/pages/track/-components/SharePanel';

type Share = ReturnType<typeof useShareLocation>;

const share = (overrides: Partial<Share> = {}): Share => ({
  deviceId: 'device-1',
  isSharing: false,
  isSharingElsewhere: false,
  isSupported: true,
  error: null,
  lastFixAt: null,
  wakeLock: { isSupported: true, isLocked: false },
  start: vi.fn(),
  stop: vi.fn(),
  ...overrides,
});

describe('SharePanel', () => {
  it('starts sharing from the main button', async () => {
    const props = share();
    render(<SharePanel share={props} isSimulating={false} />);

    await userEvent.click(screen.getByRole('button', { name: /on this bus/ }));

    expect(props.start).toHaveBeenCalledOnce();
  });

  it('is disabled during demo mode', () => {
    render(<SharePanel share={share()} isSimulating />);

    expect(screen.getByRole('button', { name: /on this bus/ })).toBeDisabled();
    expect(screen.getByText(/turn off demo mode/i)).toBeInTheDocument();
  });

  it('offers a way to stop while sharing', async () => {
    const props = share({ isSharing: true, lastFixAt: 1 });
    render(<SharePanel share={props} isSimulating={false} />);

    expect(
      screen.getByText('GPS is connected.', { exact: false }),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'I got off, stop sharing' }),
    );
    expect(props.stop).toHaveBeenCalledOnce();
  });

  it('surfaces location errors', () => {
    render(
      <SharePanel
        share={share({ error: 'Location permission was denied.' })}
        isSimulating={false}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Location permission was denied.',
    );
  });
});
