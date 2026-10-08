function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/**
 * Spaces request departures. The next request can leave before the previous response arrives.
 */
export class RequestScheduler {
  constructor(requestsPerSecond) {
    this.minIntervalMs = requestsPerSecond > 0 ? 1000 / requestsPerSecond : 0;
    this.nextSlotAt = 0;
    this.chain = Promise.resolve();
  }

  enqueue(run) {
    // Each call waits for the previous departure slot, not for its HTTP response.
    // 'slot' is that gate: the next caller is queued on it immediately, and we open it ourselves once this departure is allowed to leave.
    let releaseSlot = () => undefined;
    const slot = new Promise((resolve) => {
      releaseSlot = resolve;
    });
    const previous = this.chain;
    this.chain = previous.then(() => slot);

    return previous.then(async () => {
      // Reserve the following slot before waiting, so a caller that arrives during this pause is scheduled after it instead of taking the same instant.
      const now = Date.now();
      const waitMs = Math.max(0, this.nextSlotAt - now);
      this.nextSlotAt = Math.max(now, this.nextSlotAt) + this.minIntervalMs;
      if (waitMs > 0) {
        await delay(waitMs);
      }

      // Open the gate before the request itself. Responses may overlap, only the departures stay spaced.
      releaseSlot();
      return run();
    });
  }
}

export function retryAfterMs(error) {
  const header = error?.response?.headers?.['retry-after'];
  if (header === undefined || header === null || header === '') {
    return 1000;
  }

  const seconds = Number(header);
  if (Number.isFinite(seconds)) {
    return Math.max(0, seconds * 1000);
  }

  const date = Date.parse(String(header));
  if (Number.isFinite(date)) {
    return Math.max(0, date - Date.now());
  }

  return 1000;
}

export { delay };
