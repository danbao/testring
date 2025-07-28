import { Context } from 'hono';

export function getIframe2Html(c: Context) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Iframe 2</title>
</head>
<body data-test-automation-id="root">
<div data-test-automation-id="div2">Content of Iframe 2</div>
</body>
</html>`;
    return c.html(html);
}
