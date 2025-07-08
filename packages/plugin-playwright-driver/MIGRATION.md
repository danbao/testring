# Migrating from `@testring/plugin-selenium-driver` to `@testring/plugin-playwright-driver`

This guide provides steps and considerations for migrating your Testring test suites from the Selenium-based WebdriverIO driver (`@testring/plugin-selenium-driver`) to the new Playwright-based driver (`@testring/plugin-playwright-driver`).

The Playwright driver aims to provide a more modern, potentially faster, and more stable browser automation experience by leveraging Playwright's capabilities.

## Benefits of Migrating to Playwright Driver

*   **No Selenium Server Needed**: Playwright interacts directly with browsers, eliminating the need to manage a Selenium Server process. This simplifies setup and can reduce flakiness.
*   **Modern Browser Automation**: Leverages Playwright's modern features, including its robust auto-waits, network interception, and multi-context/multi-page capabilities (though full multi-tab per applicant support in this plugin is evolving).
*   **Potentially Faster Execution**: Direct browser communication can lead to faster test execution compared to the Selenium WebDriver protocol.
*   **Simplified Dependencies**: Fewer moving parts in your testing infrastructure.

## Steps to Migrate

1.  **Install the Playwright Driver Plugin**:
    Add the new plugin as a dev dependency to your project:
    ```bash
    npm install @testring/plugin-playwright-driver --save-dev
    # or
    yarn add @testring/plugin-playwright-driver --dev
    ```

2.  **Update `testring.conf.js`**:
    Change the `driver` and `driverConfig` sections in your `testring.conf.js`:

    **Old Configuration (Selenium):**
    ```javascript
    // testring.conf.js
    module.exports = {
        driver: 'selenium-driver', // or 'selenium'
        driverConfig: {
            // Selenium/WebdriverIO specific capabilities
            capabilities: {
                browserName: 'chrome',
                // ... other capabilities
            },
            // port: 4444,
            // host: 'localhost',
            // ...
        },
        // ... other Testring settings
    };
    ```

    **New Configuration (Playwright):**
    ```javascript
    // testring.conf.js
    module.exports = {
        driver: 'playwright-driver', // Switch to the new driver
        driverConfig: {
            browserType: 'chromium', // 'chromium', 'firefox', or 'webkit'
            headless: true,          // true for headless, false for headed mode
            // Optional: Other Playwright launch options
            // slowMo: 50, // Slows down Playwright operations by ms
            // args: ['--disable-gpu'], // Browser launch arguments
            // viewport: { width: 1280, height: 720 } // For browser context
        },
        // ... other Testring settings
    };
    ```

3.  **Remove Selenium Infrastructure**:
    *   If you were running a standalone Selenium Server, you no longer need it.
    *   You can remove `selenium-server` or `chromedriver`/`geckodriver` direct dependencies if they were only for Testring. Playwright manages its own browser binaries.

4.  **Review and Adapt Tests (Key Considerations)**:
    While the goal is a near drop-in replacement, Playwright and WebdriverIO have fundamental differences. A best-effort mapping has been made, but some test adjustments might be necessary. Pay attention to the following:

    *   **Selectors**:
        *   Playwright primarily uses CSS selectors and its own selector engine (which can include XPath, e.g., `xpath=//button`). While XPath selectors from WebdriverIO might work if prefixed correctly for Playwright (e.g. `xpath=//div`), it's recommended to prefer CSS selectors for better compatibility and performance with Playwright.
        *   The plugin generally expects CSS selectors for methods like `click`, `getValue`, etc. Parameters previously named `xpath` in the `IBrowserProxyPlugin` interface are now treated as generic `selector` strings.

    *   **Element ID Chaining**:
        *   WebdriverIO commands like `elements()` return element IDs that can be used in subsequent low-level commands (e.g., `elementIdText(id)`). Playwright does not use shareable string-based element IDs in the same way.
        *   The Playwright plugin attempts to provide a compatible structure for `elements()` but the returned "ELEMENT" IDs are pseudo-IDs and may not work reliably with subsequent commands expecting true WebdriverIO element IDs.
        *   **Recommendation**: Modify tests that rely on this pattern. Instead of `const id = (await elements(selector))[0].ELEMENT; await elementIdText(id);`, prefer `const text = await getText(selector);` or use Playwright's recommended patterns if more complex interaction with a specific element from a list is needed (e.g., `page.locator(selector).nth(0).textContent()`).

    *   **Frame Switching (`frame`, `frameParent`)**:
        *   Playwright's frame handling is primarily through `FrameLocator` objects (`page.frameLocator('iframe').locator('button').click()`) which is different from WebdriverIO's stateful `frame()` and `frameParent()` commands.
        *   The plugin's implementation of `frame()` can identify a frame, but making subsequent commands automatically target this frame is challenging with the current plugin architecture. The context might not "stick" to the frame as it does in WebdriverIO.
        *   **Recommendation**: Review tests using frame switching. You might need to chain operations on frames differently or ensure selectors are specific enough to target elements within frames from the main page context if possible. Explicitly target elements within frames using Playwright's recommended locators if tests become problematic.

    *   **Multi-Tab/Window Management (`switchTab`, `close(tabId)`, `getTabIds`)**:
        *   The current plugin has basic support, primarily managing one active page per "applicant" (test session).
        *   `newWindow()` creates a new page and context, effectively replacing the applicant's current page.
        *   True multi-tab operations (e.g., seamlessly switching between multiple self-opened tabs for a single applicant) have limitations.
        *   **Recommendation**: Tests heavily relying on complex multi-tab interactions might need adjustments or simplification.

    *   **`uploadFile(filePath)`**:
        *   Playwright's file upload (`page.setInputFiles(selector, files)`) requires a selector for an `<input type="file">` element. The `IBrowserProxyPlugin`'s `uploadFile(filePath)` method does not include a selector.
        *   **Adaptation Required**: This plugin's `uploadFile` method will now **require a selector** as the first argument to align with Playwright. Your test code calling `uploadFile` will need to be updated.
            *   Old (example): `await client.uploadFile('./path/to/file.txt');`
            *   New (Playwright Plugin): `await client.uploadFile('input[type="file"]', './path/to/file.txt');` (The first argument is the selector).
            *   *This part of the guide reflects a decision to modify the plugin's `uploadFile` to take a selector, which is a deviation from "no test code changes" but necessary for Playwright.*

    *   **`waitUntil(condition, ...)`**:
        *   WebdriverIO's `waitUntil` executes its `condition` function in the Node.js context, allowing it to contain other WebdriverIO commands and complex logic.
        *   The Playwright plugin's `waitUntil` currently maps to `page.waitForFunction`, which executes the condition in the browser's context.
        *   **Limitation**: This means the `condition` function passed to `waitUntil` cannot use Node.js scope or make other Testring/WebdriverIO browser commands. It must be a self-contained, browser-executable function.
        *   **Recommendation**: Review `waitUntil` usage. If conditions are complex or use external commands, they will need to be refactored, possibly into multiple steps or by using Playwright's more specific `waitForSelector`, `waitForEvent`, etc.

    *   **Alert Handling (`alertAccept`, `alertDismiss`, `alertText`, `isAlertOpen`)**:
        *   Playwright handles dialogs (alerts, prompts, confirms) asynchronously via events. WebdriverIO often treats these more synchronously.
        *   The plugin sets up listeners for dialogs. `alertAccept` and `alertDismiss` will handle the *next* dialog that appears. `isAlertOpen` and `alertText` rely on information from dialogs that have already triggered an event.
        *   This generally works but be mindful of timing if tests perform actions that trigger dialogs immediately before an accept/dismiss call.

    *   **`windowHandleMaximize()`**:
        *   Playwright does not offer a direct window maximization command. The plugin attempts to set a large viewport size (e.g., 1920x1080) as a workaround. This is not true OS-level maximization.
        *   **Recommendation**: If specific window dimensions are critical, configure them via `driverConfig.viewport` or ensure tests are resilient to standard large viewport sizes.

5.  **Run Your Tests**:
    Execute your test suite with the updated configuration.
    ```bash
    npx testring
    ```

6.  **Debug and Refine**:
    Address any test failures, paying close attention to the areas mentioned above. Use Playwright's debugging capabilities (e.g., `headless: false`, `slowMo`, Playwright Inspector) as needed.

## Reporting Issues

If you encounter issues or have questions during migration, please report them in the Testring project's issue tracker, providing details about the specific problem and relevant test code snippets.

By understanding these differences and planning for potential adjustments, you can smoothly transition to the more modern and efficient Playwright driver for your Testring automation.
---
*Note: The `uploadFile` section above makes an assumption about modifying the plugin to take a selector. This decision was based on user feedback to align with Playwright's model. This will be a documented breaking change for that specific command for users migrating.*
