/**
 * Sample Testring Configuration for Playwright Driver
 *
 * To use this configuration:
 * 1. Ensure `@testring/plugin-playwright-driver` is installed in your project.
 * 2. Save this file as `testring.conf.js` in the root of your project,
 *    or specify it using the --config CLI option.
 * 3. Update the `tests` pattern to match your test file locations.
 */
module.exports = {
    /**
     * Specify the Playwright driver.
     * Testring will look for a package named `@testring/plugin-playwright-driver`
     * or a local plugin resolvable to 'playwright-driver'.
     */
    driver: 'playwright-driver', // This string needs to be resolvable by Testring's plugin loader

    /**
     * Configure tests location.
     * Adjust this pattern to match where your test files are located.
     */
    tests: './tests/**/*.spec.js', // Example: find all .spec.js files in a 'tests' directory

    /**
     * Playwright-specific driver configuration.
     * These options are passed to the Playwright plugin.
     */
    driverConfig: {
        browserType: 'chromium', // 'chromium', 'firefox', or 'webkit'
        headless: true,          // Run in headless mode (true) or headed (false)
        // slowMo: 50,              // Slows down Playwright operations by the specified ms. Useful for debugging.
        // আরো Playwright launch options can be added here if supported by the plugin, e.g.:
        // args: ['--disable-gpu'],
        // viewport: { width: 1280, height: 720 } // For context options
    },

    /**
     * Optional: Configure other Testring settings as needed.
     */
    // workers: 2, // Number of parallel workers
    // timeout: 30000, // Test timeout in milliseconds
    // reporting: {
    //     reporters: ['spec', 'html'], // Example reporters
    //     htmlPath: './reports/testring-report.html'
    // },
    // logger: {
    //     level: 'info', // 'verbose', 'debug', 'info', 'warn', 'error'
    //     console: true, // Log to console
    //     file: './testring.log' // Log to a file
    // }
};

/**
 * To make Testring resolve 'playwright-driver' correctly if it's a local package
 * or not yet published, you might need to adjust Testring's plugin search paths
 * or ensure your local package is linked (e.g., via `npm link` or Lerna).
 *
 * If `@testring/plugin-playwright-driver` is published and installed,
 * Testring should resolve it automatically based on naming conventions.
 * The plugin entry point in `plugin-playwright-driver/package.json` (`main`)
 * should export the function that Testring calls to initialize the plugin.
 *
 * The `driver` field in `testring.conf.js` is typically the suffix of the plugin package name.
 * For `@testring/plugin-XYZ`, `driver: 'XYZ'` is common.
 * So, for `@testring/plugin-playwright-driver`, `driver: 'playwright-driver'` should work if Testring's
 * plugin discovery mechanism (likely in `@testring/plugin-api` or `@testring/testring`)
 * correctly resolves `@testring/plugin-${driverName}`.
 */
