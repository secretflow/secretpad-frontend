import '@secretflow/testing/jest';
import { Future } from './future';

describe('future', () => {
  test('resolving', () => {
    const future = new Future();
    future.fulfill();
    expect(future.status).toBe('fulfilled');
    expect(future).resolves.toBe(undefined);
  });

  test('rejecting', () => {
    const future = new Future();
    future.reject(new Error());
    expect(future.status).toBe('rejected');
    expect(future).rejects.toBeInstanceOf(Error);
  });

  test('idempotent', () => {
    const future = new Future();
    future.fulfill();
    future.reject(new Error());
    expect(future.status).toBe('fulfilled');
    expect(future).resolves.toBe(undefined);
  });
});
