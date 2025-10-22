// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

// Configuration specifically for behavior tests
// Uses desktop viewport only for consistent functionality testing
const config = {
  testDir: './tests',
  testMatch: '**/test-*.js',

  /* Maximum time one test can run for. */
  timeout: 2 * 60 * 60 * 1000, // 2 hours for behavior tests
  use: {
    actionTimeout: 5 * 60 * 1000,
    navigationTimeout: 5 * 60 * 1000,
    // Set desktop viewport for behavior tests only
    viewport: { width: 1440, height: 900 }
  },
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 50000,
  },
  /* Run behavior tests in serial to avoid flooding parallel sessions */
  workers: 2,

  retries: 1,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['line']],
  /* Projects are managed by browserstack.yml - don't define them here */
};

export default config;
