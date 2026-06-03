import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authEvents } from '@/utils/authEvents';

describe('authEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('emits event and calls registered listeners', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    authEvents.on('unauthorized', callback1);
    authEvents.on('unauthorized', callback2);

    authEvents.emit('unauthorized');

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it('removes listener with off', () => {
    const callback = vi.fn();

    authEvents.on('unauthorized', callback);
    authEvents.off('unauthorized', callback);

    authEvents.emit('unauthorized');

    expect(callback).not.toHaveBeenCalled();
  });

  it('does not throw when emitting event with no listeners', () => {
    expect(() => {
      authEvents.emit('unauthorized');
    }).not.toThrow();
  });

  it('does not throw when removing listener from non-existent event', () => {
    const callback = vi.fn();

    expect(() => {
      authEvents.off('unauthorized', callback);
    }).not.toThrow();
  });

  it('only removes the specific callback', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    authEvents.on('unauthorized', callback1);
    authEvents.on('unauthorized', callback2);

    authEvents.off('unauthorized', callback1);
    authEvents.emit('unauthorized');

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
  });
});
