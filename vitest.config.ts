import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    environment: "node",
    // "reporters" is not supported in a project config,
    // so it will show an error
    reporters: ["default"],
    globals: true,
    disableConsoleInterceptor: true,
  },
});
