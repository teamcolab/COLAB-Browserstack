# Visual Regression Testing with BrowserStack

This repository contains automated visual regression testing for the VACU website using [Playwright](https://playwright.dev/docs/intro) and [BrowserStack](https://www.browserstack.com/) for cross-browser testing, with [Percy](https://percy.io/) for visual comparison.

![BrowserStack Logo](https://d98b8t1nnulk5.cloudfront.net/production/images/layout/logo-header.png?1469004780)

## 🚀 Getting Started

### Quick Setup (5 minutes)

1. **Set up Node.js version and install dependencies:**
   ```bash
   cd tests/browserstack
   nvm use && npm install
   ```

2. **Set up environment variables:**
   ```bash
   # Copy the example file and update with your credentials
   cp .env.example .env
   
   # Edit .env file with your actual values
   # Get BrowserStack credentials from: https://www.browserstack.com/accounts/settings
   # Get Percy token from: https://percy.io/ (Dashboard > Settings > API Tokens)
   # Or check 1Password for stored credentials
   ```

3. **Run your first test:**
   ```bash
   # Test against default environment (test)
   npm run test:visual
   
   # Or compare two environments interactively
   npm run test:compare
   ```

That's it! Your tests will run on BrowserStack and results will appear in Percy.

## 📁 Configuration Files

### `config/` Directory

The `config/` directory contains all the configuration files that control how your tests behave:

#### `config/environments.js`
Defines the target environments for testing:
```javascript
const environments = [
  { name: 'test', host: 'https://test-vacu-d9.pantheonsite.io' },
  { name: 'dev', host: 'https://dev-vacu-d9.pantheonsite.io' },
  { name: 'live', host: 'https://vacu.org/' }
];
```

**Modify this file to:**
- Add new environments
- Change environment URLs
- Update environment names

#### `config/pages.js`
Defines which pages to test for visual regression:
```javascript
const pages = [
  { name: 'Homepage', path: '/' },
  { name: 'Help', path: '/help' },
  { name: 'Loans', path: '/loans' },
  // ... more pages
];
```

**Modify this file to:**
- Add new pages to test
- Remove pages you don't need
- Change page names (affects Percy screenshot names and comparability with older builds)
- Update page paths

#### `config/breakpoints.js`
Defines the viewport sizes for responsive testing:
```javascript
const breakpoints = [
  { name: 'Mobile Portrait', width: 390, height: 844, minHeight: 844 },
  { name: 'Tablet', width: 768, height: 1024, minHeight: 1024 },
  { name: 'Desktop Large', width: 1440, height: 900, minHeight: 900 }
];
```

**Modify this file to:**
- Add new breakpoints (e.g., mobile landscape, ultra-wide desktop)
- Change existing breakpoint dimensions
- Remove breakpoints you don't need

#### `config/project-breakpoints.js`
Maps BrowserStack platforms to specific breakpoints. This is where the magic happens for responsive testing:

```javascript
const projectBreakpointMap = {
  'tahoe': [mobile, tablet, desktop],  // macOS Tahoe = all breakpoints
  'ios': [mobile],                     // iOS = mobile only
  'iphone': [mobile]                   // iPhone = mobile only
};
```

**Key Concept:** Different platforms test different breakpoints:
- **macOS Tahoe** (desktop browsers): Tests all breakpoints (mobile, tablet, desktop)
- **iOS Safari**: Tests only mobile breakpoints
- **Android**: Tests only mobile breakpoints

**Modify this file to:**
- Add new platform mappings
- Change which breakpoints are tested on each platform
- Optimize testing by reducing breakpoints per platform

## 🌐 BrowserStack Configuration

### `browserstack.yml` File

This file controls which browsers and devices your tests run on:

```yaml
platforms:
  - os: OS X
    osVersion: Tahoe
    browserName: chrome
    browserVersion: '141'
  - os: OS X
    osVersion: Tahoe
    browserName: playwright-firefox
    browserVersion: '140'
  - os: OS X
    osVersion: Tahoe
    browserName: playwright-webkit
    browserVersion: '26'
```

### Platform vs Breakpoints: The Key Distinction

**Platforms (`browserstack.yml`):** Define which browsers/devices BrowserStack will use
- macOS Chrome, macOS Firefox, macOS Safari
- iOS Safari, Android Chrome, etc.

**Breakpoints (`config/breakpoints.js`):** Define which viewport sizes to test within each platform
- Mobile (390px), Tablet (768px), Desktop (1440px)

**The Magic:** Each platform can test multiple breakpoints:
- macOS Chrome tests: Mobile view, Tablet view, Desktop view
- iOS Safari tests: Mobile view only (because it's a mobile device)

This gives you comprehensive coverage without redundant testing.

### Modifying Platforms

**Add new browsers:**
```yaml
platforms:
  - os: Windows
    osVersion: 11
    browserName: chrome
    browserVersion: '141'
```

**Add mobile devices:**
```yaml
platforms:
  - os: iOS
    osVersion: 17.5
    browserName: safari
    device: iPhone 15 Pro
    browserstack.deviceName: iPhone 15 Pro
    browserstack.deviceOrientation: portrait
    browserstack.realMobile: true
```

**Performance considerations:**
- More platforms = more test time and cost
- Each platform runs all pages × all breakpoints
- Use `parallelsPerPlatform: 1` to control parallel execution

## 🔄 Environment Comparison Feature

### Why This Exists

Pantheon's dev, test, and live environments all run from the same `master` branch, but they may have different commits deployed. The comparison feature lets you:

- Compare dev vs live (different commits on same branch)
- Compare any custom URL against any environment
- Test staging URLs before they go live
- Validate changes across environments

### How It Works

1. **Select baseline environment** (e.g., live/production)
2. **Select comparison environment** (e.g., dev/staging)  
3. **Percy creates a unique branch** for the comparison
4. **Baseline environment is tested first** and automatically accepted
5. **Comparison environment is tested** against the accepted baseline
6. **Differences are highlighted** in Percy dashboard

### Automatic Baseline Acceptance

- The baseline environment snapshots are **automatically accepted** after the first scan
- No manual intervention required - the comparison workflow handles this
- Requires `PERCY_API_TOKEN` in your `.env` file for API access

### Usage

The `npm run test:visual:compare` script:

1. **Prompts for two environments** (baseline and comparison)
2. **Creates unique Percy branch** (`env-comparison-dev-vs-live-2024-01-15T10-30-00`)
3. **Runs tests twice** with the same branch name
4. **Percy compares** the two sets of screenshots

### Usage Examples

```bash
# Interactive selection
npm run test:compare

# Example workflow:
# 1. Select baseline: "dev" 
# 2. Select comparison: "live"
# 3. Percy creates: env-comparison-dev-vs-live-2024-01-15T10-30-00
# 4. Tests run against both environments
# 5. Percy shows differences in dashboard
```

### Custom URL Support

When you select "Custom URL", you can test against:
- Different Pantheon environments
- Staging servers
- Any publicly accessible URL

## 🧪 Test Types

### Visual Regression Tests
```bash
npm run test:visual                    # Single environment (all browsers)
npm run test:visual:smoke              # Single environment (Chrome only)
npm run test:visual:compare            # Two environments (all browsers)
npm run test:visual:compare:smoke      # Two environments (Chrome only)
```

### Behavior Tests
```bash
npm run test:behavior:search    # Search functionality
npm run test:behavior:news       # News section
npm run test:behavior:misc       # Miscellaneous features
npm run test:behavior:help       # Help and support
npm run test:behavior:branch     # Branch/ATM locator
npm run test:behavior:banking    # Online banking menu
npm run test:behavior:learn      # Learning center
npm run test:behavior            # All behavior tests
```

**Note:** Behavior tests run on all configured browsers (Chrome, Firefox, Safari) at desktop viewport (1440x900) only.

**Configuration Files:**
- **Visual Regression Tests**: Use `playwright.config.js` (no viewport restriction - tests all breakpoints)
- **Behavior Tests**: Use `playwright.behavior.config.js` (desktop viewport only for consistent functionality testing)

**Smoke Tests:** Chrome-only versions for faster testing:
- **Faster execution** (1 browser instead of 3)
- **Lower BrowserStack usage** (fewer parallel sessions)
- **Quick validation** before full regression testing
- **Same Percy coverage** (all pages at all breakpoints)

**Build Naming:** Each test type has distinct build names in BrowserStack:
- **Visual Regression**: "VACU Visual Regression Tests"
- **Visual Regression Smoke**: "VACU Visual Regression Smoke Test (Chrome Only)"
- **Environment Comparison**: "VACU Visual Regression Comparison - {env}"
- **Environment Comparison Smoke**: "VACU Visual Regression Comparison Smoke Test (Chrome Only) - {env}"
- **Behavior Tests**: "VACU Behavior Tests - {feature}" (e.g., "VACU Behavior Tests - Search")

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `BROWSERSTACK_USERNAME` | Your BrowserStack username | [BrowserStack Account Settings](https://www.browserstack.com/accounts/settings) or 1Password |
| `BROWSERSTACK_ACCESS_KEY` | Your BrowserStack access key | [BrowserStack Account Settings](https://www.browserstack.com/accounts/settings) or 1Password |
| `PERCY_TOKEN` | Your Percy authentication token | [Percy Dashboard](https://percy.io/) → Settings → API Tokens or 1Password |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BROWSERSTACK_PROJECT_NAME` | Project name for reporting | "VACU Visual Regression Tests" |
| `BROWSERSTACK_BUILD_NAME` | Build name for reporting | "VACU Visual Regression Test Run" |
| `BROWSERSTACK_BUILD_IDENTIFIER` | Build identifier format | "#${BUILD_NUMBER}" |

## 📊 Understanding Results

### Percy Dashboard
- **Screenshots grouped by page name** (from `config/pages.js`)
- **Multiple viewports per page** (from `config/breakpoints.js`)
- **Branch-based organization** (each comparison gets its own branch)
- **Visual diff highlighting** for changes

### BrowserStack Dashboard
- **Test execution details** and logs
- **Performance metrics** and timing
- **Screenshots and videos** of test runs
- **Error debugging** information

## 🚨 Troubleshooting

### Common Issues

**"PERCY_TOKEN not found"**
- Ensure `.env` file exists and contains `PERCY_TOKEN=your_token`
- Verify token is valid in Percy dashboard

**"BrowserStack credentials not found"**
- Check `.env` file has correct `BROWSERSTACK_USERNAME` and `BROWSERSTACK_ACCESS_KEY`
- Verify credentials in BrowserStack account settings

**Tests fail with timeout errors**
- Increase timeout values in `playwright.config.js`
- Check if target URLs are accessible
- Verify BrowserStack platform availability

**Custom URLs not working**
- Ensure URL is publicly accessible
- Check URL format (must start with `http://` or `https://`)
- For localhost URLs, enable BrowserStack Local in `browserstack.yml`

### Getting Help

- **BrowserStack Issues**: Check [BrowserStack Status](https://status.browserstack.com/)
- **Percy Issues**: Check [Percy Status](https://status.percy.io/)
- **Test Failures**: Check BrowserStack dashboard for detailed logs and screenshots

## 📈 Performance Optimization

### Reducing Test Time
- **Fewer platforms** in `browserstack.yml`
- **Fewer breakpoints** in `config/breakpoints.js`
- **Fewer pages** in `config/pages.js`
- **Lower `parallelsPerPlatform`** in `browserstack.yml`

### Cost Management
- **Use `parallelsPerPlatform: 1`** to minimize parallel sessions
- **Focus on critical browsers** (Chrome, Firefox, Safari)
- **Test mobile only on actual mobile platforms** (iOS, Android)

## 🔗 Useful Links

- [BrowserStack Automate Dashboard](https://www.browserstack.com/automate)
- [Percy Dashboard](https://percy.io/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [BrowserStack Parallel Test Calculator](https://www.browserstack.com/automate/parallel-calculator?ref=github)