import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePolling } from '@/hooks/usePolling';

describe('usePolling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('вызывает onTick немедленно при монтировании', () => {
    const onTick = vi.fn();

    renderHook(() => usePolling({ onTick }));

    expect(onTick).toHaveBeenCalledTimes(1);
  });

  it('вызывает onTick с указанным интервалом', () => {
    const onTick = vi.fn();

    renderHook(() => usePolling({ interval: 5000, onTick }));

    expect(onTick).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(5000);
    expect(onTick).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(5000);
    expect(onTick).toHaveBeenCalledTimes(3);
  });

  it('не вызывает onTick при enabled=false', () => {
    const onTick = vi.fn();

    renderHook(() => usePolling({ interval: 5000, enabled: false, onTick }));

    expect(onTick).not.toHaveBeenCalled();

    vi.advanceTimersByTime(10000);
    expect(onTick).not.toHaveBeenCalled();
  });

  it('перезапускает polling при переключении enabled с false на true', () => {
    const onTick = vi.fn();

    const { rerender } = renderHook(
      ({ enabled }) => usePolling({ interval: 5000, enabled, onTick }),
      { initialProps: { enabled: false } }
    );

    expect(onTick).not.toHaveBeenCalled();

    rerender({ enabled: true });
    expect(onTick).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(5000);
    expect(onTick).toHaveBeenCalledTimes(2);
  });

  it('останавливает polling при переключении enabled с true на false', () => {
    const onTick = vi.fn();

    const { rerender } = renderHook(
      ({ enabled }) => usePolling({ interval: 5000, enabled, onTick }),
      { initialProps: { enabled: true } }
    );

    expect(onTick).toHaveBeenCalledTimes(1);

    rerender({ enabled: false });

    vi.advanceTimersByTime(10000);
    expect(onTick).toHaveBeenCalledTimes(1);
  });

  it('использует актуальную версию onTick при каждом вызове', () => {
    const onTick1 = vi.fn();
    const onTick2 = vi.fn();

    const { rerender } = renderHook(
      ({ tick }) => usePolling({ interval: 5000, onTick: tick }),
      { initialProps: { tick: onTick1 } }
    );

    expect(onTick1).toHaveBeenCalledTimes(1);

    rerender({ tick: onTick2 });

    vi.advanceTimersByTime(5000);

    expect(onTick1).toHaveBeenCalledTimes(1);
    expect(onTick2).toHaveBeenCalledTimes(1);
  });

  it('очищает интервал при размонтировании', () => {
    const onTick = vi.fn();

    const { unmount } = renderHook(() =>
      usePolling({ interval: 5000, onTick })
    );

    expect(onTick).toHaveBeenCalledTimes(1);

    unmount();

    vi.advanceTimersByTime(10000);
    expect(onTick).toHaveBeenCalledTimes(1);
  });

  it('не прерывается при наличии ошибки в onTick', () => {
    const onTick = vi.fn().mockImplementation(() => {
      throw new Error('Test error');
    });

    renderHook(() => usePolling({ interval: 5000, onTick }));

    expect(onTick).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(5000);
    expect(onTick).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(5000);
    expect(onTick).toHaveBeenCalledTimes(3);
  });

  it('обрабатывает асинхронный onTick без сбоев', async () => {
    const onTick = vi.fn().mockResolvedValue(undefined);

    renderHook(() => usePolling({ interval: 5000, onTick }));

    expect(onTick).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(5000);
    expect(onTick).toHaveBeenCalledTimes(2);
  });
});
