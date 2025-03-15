# dfetch

A lightweight wrapper around the fetch API that automatically dedupes concurrent requests with the same key.

## Problem

When making multiple identical API calls in quick succession, you often want to cancel previous pending requests to avoid race conditions and unnecessary network traffic. This library solves that problem by providing a simple wrapper around fetch that automatically handles request deduplication.

## Installation

```bash
npm i dfetch
```

## Usage

```typescript
import { dfetch } from 'dfetch';

// Basic usage
const response = await dfetch('user-data', 'https://api.example.com/users/1');

// With fetch options
const response = await dfetch('post-data', 'https://api.example.com/posts', {
  method: 'POST',
  body: JSON.stringify({ title: 'Hello' }),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatic deduping
// This will abort the first request and only the second one will complete
const promise1 = dfetch('same-key', 'https://api.example.com/data');
const promise2 = dfetch('same-key', 'https://api.example.com/data');

// Different keys allow concurrent requests
const [response1, response2] = await Promise.all([
  dfetch('key1', 'https://api.example.com/data1'),
  dfetch('key2', 'https://api.example.com/data2')
]);
```

## API

### `dfetch(dedupeKey: string, input: RequestInfo | URL, init?: RequestInit): Promise<Response>`

- `dedupeKey`: A string key that identifies the request. Concurrent requests with the same key will cancel previous pending requests.
- `input`: The resource URL or Request object (same as fetch)
- `init`: Fetch options (same as fetch)
- Returns: A Promise that resolves to the Response (same as fetch)

## How it Works

The library uses AbortController signals internally to cancel previous pending requests with the same dedupeKey. When a new request is made with the same key as a pending request:

1. The previous request is aborted
2. The new request is initiated
3. The request is automatically cleaned up from memory when completed

## Testing

Run the test suite:

```bash
npm test
```

Run with coverage:

```bash
npm run test:coverage
```

## License

ISC

## Author

Michael Di Prisco <cadienvan@gmail.com>
