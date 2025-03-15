import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ddpfetch } from '../index';

// Mock global fetch
const originalFetch = global.fetch;
let abortedCalls = 0;

function mockFetch(delay: number): Promise<Response> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(new Response('ok'));
    }, delay);
  });
}

describe('ddpfetch', async () => {
  test('should make successful requests', async () => {
    global.fetch = () => mockFetch(10);
    const response = await ddpfetch('key1', 'https://example.com');
    assert.equal(response.status, 200);
  });

  test('should abort previous request with same key', async (t) => {
    let aborted = false;
    
    global.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.signal) {
        init.signal.addEventListener('abort', () => {
          aborted = true;
        });
      }
      return mockFetch(100);
    };

    // Start first request
    const promise1 = ddpfetch('key2', 'https://example.com');
    
    // Start second request immediately
    const promise2 = ddpfetch('key2', 'https://example.com');
    
    await promise2;
    assert.equal(aborted, true, 'First request should have been aborted');
  });

  test('should allow concurrent requests with different keys', async () => {
    global.fetch = () => mockFetch(10);
    
    const [response1, response2] = await Promise.all([
      ddpfetch('key3', 'https://example.com'),
      ddpfetch('key4', 'https://example.com')
    ]);

    assert.equal(response1.status, 200);
    assert.equal(response2.status, 200);
  });
});

// Cleanup
test.after(() => {
  global.fetch = originalFetch;
});
