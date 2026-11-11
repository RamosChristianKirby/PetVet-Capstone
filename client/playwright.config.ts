import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: { baseURL: "http://localhost:5174", trace: "retain-on-failure" },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
      },
    },
    {
      name: "mobile",
      use: {
        ...devices["iPhone 13"],
        browserName: "chromium",
        channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
      },
    },
  ],
  webServer: [
    {
      command: "npm run demo --prefix ../server",
      url: "http://127.0.0.1:5001/api/health",
      env: { DEMO_PORT: "5001" },
      reuseExistingServer: false,
      timeout: 180000,
    },
    {
      command: "npm run dev -- --host 127.0.0.1 --port 5174 --strictPort",
      url: "http://localhost:5174",
      env: { API_PROXY_TARGET: "http://127.0.0.1:5001", VITE_API_URL: "/api" },
      reuseExistingServer: false,
      timeout: 30000,
    },
  ],
});
