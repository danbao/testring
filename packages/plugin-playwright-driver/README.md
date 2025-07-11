# @testring/plugin-playwright-driver

Modern browser automation plugin for testring using Playwright.

## Features

- **Fast & Reliable** - Built on Playwright for better performance and stability
- **Multi-browser Support** - Chrome, Firefox, Safari, and Edge
- **Modern APIs** - Auto-waiting, network interception, and mobile emulation
- **Rich Debugging** - Video recording, tracing, and screenshots
- **Coverage Support** - Built-in code coverage collection

## Installation

```bash
npm install @testring/plugin-playwright-driver
```

## Usage

### Basic Configuration

```javascript
// testring.config.js
module.exports = {
    plugins: [
        ['@testring/plugin-playwright-driver', {
            browserName: 'chromium', // 'chromium', 'firefox', or 'webkit'
            launchOptions: {
                headless: true,
                args: ['--no-sandbox']
            }
        }]
    ]
};
```

### Advanced Configuration

```javascript
module.exports = {
    plugins: [
        ['@testring/plugin-playwright-driver', {
            browserName: 'chromium',
            launchOptions: {
                headless: false,
                slowMo: 100
            },
            contextOptions: {
                viewport: { width: 1280, height: 720 },
                locale: 'en-US'
            },
            coverage: true,
            video: true,
            trace: true
        }]
    ]
};
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `browserName` | string | `'chromium'` | Browser to use: `'chromium'`, `'firefox'`, or `'webkit'` |
| `launchOptions` | object | `{}` | Playwright launch options |
| `contextOptions` | object | `{}` | Browser context options |
| `coverage` | boolean | `false` | Enable code coverage collection |
| `video` | boolean | `false` | Enable video recording |
| `trace` | boolean | `false` | Enable trace recording |
| `clientTimeout` | number | `900000` | Client timeout in milliseconds |

## Migration from Selenium

This plugin provides the same API as `@testring/plugin-selenium-driver`, making migration straightforward:

```javascript
// Before (Selenium)
['@testring/plugin-selenium-driver', { ... }]

// After (Playwright) 
['@testring/plugin-playwright-driver', { ... }]
```

Most existing tests should work without modification.

## Browser Support

- **Chromium** - Latest stable version
- **Firefox** - Latest stable version  
- **WebKit** - Safari technology preview

## Debugging

### Video Recording
```javascript
{
    video: true,
    videoDir: './test-results/videos'
}
```

### Trace Recording
```javascript
{
    trace: true,
    traceDir: './test-results/traces'
}
```

### Screenshots
Screenshots are automatically available via the `makeScreenshot()` method.

## Performance Tips

1. Use `headless: true` for CI environments
2. Enable coverage only when needed
3. Limit video recording to failing tests
4. Use viewport settings appropriate for your tests

## License

MIT