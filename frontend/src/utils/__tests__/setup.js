// Global test setup — runs before every test file.
// Mocks browser globals that utility modules reference at import time.

if (typeof window !== "undefined") {
  window.confirm = () => true;
  window.alert = () => {};
  window.LeatherProvider = undefined;
}
