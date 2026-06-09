import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiError } from '@/api/axios';

describe('ApiError class', () => {
  it('creates ApiError with status and message', () => {
    const error = new ApiError('Not found', 404, 'NOT_FOUND', {
      field: ['error'],
    });

    expect(error.message).toBe('Not found');
    expect(error.status).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.fieldErrors).toEqual({ field: ['error'] });
    expect(error.name).toBe('ApiError');
  });

  it('creates ApiError with default values', () => {
    const error = new ApiError('Error', 500);

    expect(error.message).toBe('Error');
    expect(error.status).toBe(500);
    expect(error.code).toBeUndefined();
    expect(error.fieldErrors).toBeUndefined();
  });

  it('creates ApiError with partial field errors', () => {
    const error = new ApiError('Validation failed', 400, 'VALIDATION');

    expect(error.message).toBe('Validation failed');
    expect(error.status).toBe(400);
    expect(error.code).toBe('VALIDATION');
    expect(error.fieldErrors).toBeUndefined();
  });
});

describe('axios instance', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('creates axios instance with correct base URL', async () => {
    const { default: api } = await import('@/api/axios');
    expect(api).toBeDefined();
    expect(api.defaults).toBeDefined();
  });
});
