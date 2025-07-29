import { Context } from 'hono';

export function getIframe1Html(c: Context) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Iframe 1</title>
</head>
<body data-test-automation-id="root">
<div data-test-automation-id="div1">Content of Iframe 1</div>
</body>
</html>`;
    return c.html(html);
}
