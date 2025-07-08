# `@testring/plugin-playwright-driver`

A Playwright based browser driver plugin for testring.

## Usage

Install the package and enable it in `testring.conf.js`:

```js
module.exports = {
  driver: 'playwright-driver'
};
```

See [the migration guide](../../docs/playwright-migration.md) for tips on
switching from the Selenium driver.

All existing browser commands are mapped to Playwright equivalents.
