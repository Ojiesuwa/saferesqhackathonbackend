export function withTimeout(asyncFn, timeoutMs = 30000) {
  return (...args) =>
    Promise.race([
      asyncFn(...args),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Operation timed out")), timeoutMs)
      ),
    ]);
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
