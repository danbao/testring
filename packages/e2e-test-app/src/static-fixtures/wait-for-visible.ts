import { Context } from 'hono';

export function getWaitForVisibleHtml(c: Context) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Wait for visible</title>
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
        }

        #container {
            text-align: center;
        }

        #infoSection {
            display: none;
            margin-top: 20px;
            padding: 20px;
            background-color: #fff;
            border: 1px solid #ccc;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            opacity: 0;
            transition: opacity 0.5s ease-in-out;
        }

        #infoSection.visible {
            display: block;
            opacity: 1;
        }

        button {
            padding: 10px 20px;
            font-size: 16px;
            cursor: pointer;
            border: none;
            border-radius: 4px;
            background-color: #007bff;
            color: #fff;
            transition: background-color 0.3s ease;
        }

        button:hover {
            background-color: #0056b3;
        }
    </style>
    <script>
        function showInfo() {
            setTimeout(() => {
                const infoSection = document.getElementById('infoSection');
                infoSection.classList.add('visible');
                document.getElementById('appearButton').style.display = 'none';
            }, 3000);
        }

        function hideInfo() {
            setTimeout(() => {
                const infoSection = document.getElementById('infoSection');
                infoSection.classList.remove('visible');
                document.getElementById('appearButton').style.display = 'block';
            }, 3000);
        }
    </script>
</head>
<body data-test-automation-id="root">
<div id="container" data-test-automation-id="container">
    <button data-test-automation-id="appearButton"
            id="appearButton" onclick="showInfo()">Appear
    </button>
    <div id="infoSection" data-test-automation-id="infoSection">
        <p data-test-automation-id="infoText"
        >This is the info section.</p>
        <button data-test-automation-id="disappearButton"
                onclick="hideInfo()">Disappear
        </button>
    </div>
</div>
</body>
</html>`;
    return c.html(html);
}
