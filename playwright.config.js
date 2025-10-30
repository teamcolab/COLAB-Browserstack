// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

// This is a sample config for what users might be running locally
const config = {
  testDir: './tests',
  testMatch: '**/test-*.js',

  /* Maximum time one test can run for. */
  timeout: 5 * 60 * 1000, // 5 minutes for visual regression tests
  use: {
    actionTimeout: 5 * 60 * 1000,
    navigationTimeout: 5 * 60 * 1000
  },
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5 * 60 * 1000,
  },
  /* tests in parallel - conservative setting for BrowserStack limits */
  workers: 1,

  retries: 1,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['line']],
  /* Projects are managed by browserstack.yml - don't define them here */
};

export default config;
