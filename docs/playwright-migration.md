# Migrating to the Playwright driver

To replace the Selenium based browser driver with the new Playwright version:

1. Install `@testring/plugin-playwright-driver` in your project.
2. Update `testring.conf.js`:
   ```js
   module.exports = { driver: 'playwright-driver' };
   ```
3. Remove any Selenium Server or WebDriver specific setup.

Existing tests will continue to run without modifications.
