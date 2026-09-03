const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:8765',
    trace: 'on-first-retry',
    headless: true
  },
  webServer: {
    command: 'node server.js',
    url: 'http://127.0.0.1:8765/api/health',
    reuseExistingServer: true,
    timeout: 15000
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
