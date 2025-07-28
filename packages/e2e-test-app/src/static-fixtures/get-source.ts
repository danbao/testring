import { Context } from 'hono';

export function getGetSourceHtml(c: Context) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Get Source</title>
    <!-- test comment -->
</head>
<body>

</body>
</html>`;
    return c.html(html);
}
