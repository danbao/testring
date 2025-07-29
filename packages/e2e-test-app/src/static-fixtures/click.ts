import { Context } from 'hono';

export function getClickHtml(c: Context) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Click test</title>
    <script>
        const SUCCESS = 'success';
        let clickCount = 0;
        let isHovered = true;

        function test() {
            document.getElementById('output').innerText = SUCCESS;
        }

        function halfHoveredTest(e) {
            document.getElementById('halfHoveredOutput').innerText = SUCCESS;
        }

        function partiallyHoveredTest() {
            document.getElementById('partiallyHoveredOutput').innerText = SUCCESS;
        }

        function countClicks() {
            clickCount++;
            document.getElementById('clickCountOutput').innerText = \`Click count: \${clickCount}\`;
        }

        function manageClickableState() {
            const overlay = document.getElementById('clickableOverlay');
            isHovered = !isHovered;
            if (isHovered) {
                setTimeout(() => {
                    overlay.style.width = '100%';
                }, 3000);
            } else {
                setTimeout(() => {
                overlay.style.width = '0';
                }, 3000);
            }
        }
    </script>
</head>
<body data-test-automation-id="root">
<button data-test-automation-id="button" onclick="test()">Press me!</button>
<p id="output" data-test-automation-id="output"></p>

<div style="position: relative; width: 200px;">
    <button style="position: relative; z-index: 1; width: 100%;" data-test-automation-id="halfHoveredButton" onclick="halfHoveredTest()">Press me!</button>
    <div data-test-automation-id="halfHoveredOverlay" style="position: absolute; z-index: 2; width: 100%; left: -1px; top: -1px; bottom: -1px; background: #000;" onclick="this.style.width = '50%'"></div>
</div>
<p id="halfHoveredOutput" data-test-automation-id="halfHoveredOutput"></p>

<div style="position: relative; width: 200px;">
    <button style="width: 100%;" data-test-automation-id="partiallyHoveredButton" onclick="partiallyHoveredTest()">Press me!</button>
    <div data-test-automation-id="partiallyHoveredOverlay" style="position: absolute; width: 100%; left: -1px; top: -1px; bottom: -1px; background: #000;" onclick="this.style.width = '30%'"></div>
</div>
<p id="partiallyHoveredOutput" data-test-automation-id="partiallyHoveredOutput"></p>

<button data-test-automation-id="clickCounterButton" onclick="countClicks()">Click me!</button>
<p id="clickCountOutput" data-test-automation-id="clickCountOutput">Click count: 0</p>

<button data-test-automation-id="manageClickableStateButton" onclick="manageClickableState()">Manage clickable state</button>
<div style="position: relative; width: 200px;">
    <button style="width: 100%;" data-test-automation-id="clickableButton">Clickable/Not Clickable</button>
    <div id="clickableOverlay" style="position: absolute; z-index: 2; width: 100%; left: -1px; top: -1px; bottom: -1px; background: #000;"></div>
</div>
</body>
</html>`;
    return c.html(html);
}
