// Map to store active requests
const activeRequests = new Map<string, { controller: AbortController, promise: Promise<Response> }>();

export function unfetch(dedupeKey: string, input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  // Abort previous request with the same key if it exists
  if (activeRequests.has(dedupeKey)) {
    const previous = activeRequests.get(dedupeKey)!;
    previous.controller.abort();
  }

  // Create new abort controller for this request
  const controller = new AbortController();
  
  // Create the fetch promise with the abort signal
  const fetchPromise = fetch(input, {
    ...init,
    signal: controller.signal
  }).finally(() => {
    // Clean up the map entry when the fetch completes
    if (activeRequests.get(dedupeKey)?.controller === controller) {
      activeRequests.delete(dedupeKey);
    }
  });

  // Store the new request
  activeRequests.set(dedupeKey, {
    controller,
    promise: fetchPromise
  });

  return fetchPromise;
}