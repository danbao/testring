import { Context } from 'hono';

export function getElementsHtml(c: Context) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Elements test</title>
</head>
<body data-test-automation-id="root">
<ul data-test-automation-id="existingElement">
    <li data-test-automation-id="li"></li>
    <li data-test-automation-id="li"></li>
    <li data-test-automation-id="li"></li>
    <li data-test-automation-id="li"></li>
    <li data-test-automation-id="li"></li>
</ul>
<input type="checkbox" data-test-automation-id="checkbox1">
<input type="checkbox" data-test-automation-id="checkbox2" checked>
<textarea data-test-automation-id="textarea" ></textarea>
</body>
</html>`;
    return c.html(html);
}
