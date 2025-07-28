import { Context } from 'hono';

export function getFrameHtml(c: Context) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Iframe Test</title>
</head>
<body data-test-automation-id="root">

<div data-test-automation-id="content">Content of the main page</div>

<iframe src="iframe1.html" data-test-automation-id="iframe1"></iframe>
<iframe src="iframe2.html" data-test-automation-id="iframe2"></iframe>

<script>
    // JavaScript code for testing switching between iframes
    window.addEventListener('load', () => {
        const iframe1 = document.querySelector('[data-test-automation-id="iframe1"]');
        const iframe2 = document.querySelector('[data-test-automation-id="iframe2"]');

        iframe1.addEventListener('load', () => {
            const iframe1Doc = iframe1.contentDocument || iframe1.contentWindow.document;
            console.log('Iframe 1 loaded:', iframe1Doc.querySelector('[data-test-automation-id="iframe1-content"]').textContent);
        });

        iframe2.addEventListener('load', () => {
            const iframe2Doc = iframe2.contentDocument || iframe2.contentWindow.document;
            console.log('Iframe 2 loaded:', iframe2Doc.querySelector('[data-test-automation-id="iframe2-content"]').textContent);
        });
    });
</script>
</body>
</html>`;
    return c.html(html);
}
