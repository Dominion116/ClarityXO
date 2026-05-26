import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/utils/__tests__/setup.js"],
    include: ["src/**/*.test.{js,ts}"],
    coverage: {
      provider: "v8",
      include: ["src/utils/**"],
    },
  },
});
