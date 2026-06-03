import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAsyncAction } from '@/hooks/useAsyncAction';

describe('useAsyncAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns initial state', () => {
    const action = vi.fn().mockResolvedValue('result');
    const { result } = renderHook(() => useAsyncAction(action));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBeNull();
  });

  it('sets isLoading to true during execution', async () => {
    const action = vi
      .fn()
      .mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
    const { result } = renderHook(() => useAsyncAction(action));

    const promise = act(async () => {
      result.current.execute();
      await new Promise((r) => setTimeout(r, 50));
    });

    await promise;
    expect(result.current.isLoading).toBe(true);
  });

  it('sets success message on successful execution with custom message', async () => {
    const action = vi.fn().mockResolvedValue('result');
    const { result } = renderHook(() =>
      useAsyncAction(action, { onSuccessMessage: 'Success!' })
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.success).toBe('Success!');
    expect(result.current.error).toBeNull();
  });

  it('sets success to null when no onSuccessMessage provided', async () => {
    const action = vi.fn().mockResolvedValue('result');
    const { result } = renderHook(() => useAsyncAction(action));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.success).toBeNull();
  });

  it('sets error message on failure', async () => {
    const action = vi.fn().mockRejectedValue(new Error('Something went wrong'));
    const { result } = renderHook(() => useAsyncAction(action));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Something went wrong');
    expect(result.current.success).toBeNull();
  });

  it('uses custom error message when provided', async () => {
    const action = vi.fn().mockRejectedValue(new Error('Some error'));
    const { result } = renderHook(() =>
      useAsyncAction(action, { onErrorMessage: 'Custom error' })
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.error).toBe('Custom error');
  });

  it('returns result on success', async () => {
    const action = vi.fn().mockResolvedValue('success-data');
    const { result } = renderHook(() =>
      useAsyncAction<string[], string>(action)
    );

    let returnValue: string | undefined;
    await act(async () => {
      returnValue = await result.current.execute();
    });

    expect(returnValue).toBe('success-data');
  });

  it('returns undefined on failure', async () => {
    const action = vi.fn().mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useAsyncAction(action));

    let returnValue: unknown;
    await act(async () => {
      returnValue = await result.current.execute();
    });

    expect(returnValue).toBeUndefined();
  });

  it('clears error when clearError is called', async () => {
    const action = vi.fn().mockRejectedValue(new Error('error'));
    const { result } = renderHook(() => useAsyncAction(action));

    await act(async () => {
      await result.current.execute();
    });
    expect(result.current.error).toBe('error');

    act(() => {
      result.current.clearError();
    });
    expect(result.current.error).toBeNull();
  });

  it('clears success when clearSuccess is called', async () => {
    const action = vi.fn().mockResolvedValue('result');
    const { result } = renderHook(() =>
      useAsyncAction(action, { onSuccessMessage: 'OK' })
    );

    await act(async () => {
      await result.current.execute();
    });
    expect(result.current.success).toBe('OK');

    act(() => {
      result.current.clearSuccess();
    });
    expect(result.current.success).toBeNull();
  });

  it('resets to initial state when reset is called', async () => {
    const action = vi.fn().mockResolvedValue('result');
    const { result } = renderHook(() =>
      useAsyncAction(action, { onSuccessMessage: 'OK' })
    );

    await act(async () => {
      await result.current.execute();
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBeNull();
  });

  it('handles non-Error thrown values', async () => {
    const action = vi.fn().mockRejectedValue('string error');
    const { result } = renderHook(() => useAsyncAction(action));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.error).toBe('Произошла ошибка');
  });

  it('passes arguments to the action function', async () => {
    const action = vi.fn().mockResolvedValue('result');
    const { result } = renderHook(() =>
      useAsyncAction<[string, string], string>(action)
    );

    await act(async () => {
      await result.current.execute('arg1', 'arg2');
    });

    expect(action).toHaveBeenCalledWith('arg1', 'arg2');
  });
});
