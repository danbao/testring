import { Context } from 'hono';

export function getWaitUntilHtml(c: Context) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Wait Until Page</title>
    <style>
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
        }
        .container {
            text-align: center;
            margin: 10px;
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
            margin: 10px;
        }
        button:hover {
            background-color: #0056b3;
        }
        input, select {
            padding: 10px;
            font-size: 16px;
            margin: 10px;
        }
    </style>
    <script>
        function addInputValue() {
            setTimeout(() => {
                document.getElementById('inputElement').value = 'Input Value';
            }, 3000);
        }

        function addSelected() {
            setTimeout(() => {
                document.getElementById('selectElement').selectedIndex = 1;
            }, 3000);
        }
    </script>
</head>
<body data-test-automation-id="root">
<div class="container" data-test-automation-id="container1">
    <button onclick="addInputValue()" data-test-automation-id="addInputValueButton">Add Input Value</button>
    <input type="text" id="inputElement" data-test-automation-id="inputElement">
</div>
<div class="container" data-test-automation-id="container2">
    <button onclick="addSelected()" data-test-automation-id="addSelectedButton">Add Selected</button>
    <select id="selectElement" data-test-automation-id="selectElement">
        <option data-test-automation-id="option1">Option 1</option>
        <option data-test-automation-id="option2">Option 2</option>
        <option data-test-automation-id="option3">Option 3</option>
    </select>
</div>
</body>
</html>`;
    return c.html(html);
}
