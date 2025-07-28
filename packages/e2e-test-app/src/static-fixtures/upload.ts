import { Context } from 'hono';

export function getUploadHtml(c: Context) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>File Upload Test</title>
</head>
<body data-test-automation-id="root">
<form id="uploadForm" data-test-automation-id="uploadForm">
    <input type="file" id="fileInput" data-test-automation-id="fileInput">
    <button type="submit" data-test-automation-id="uploadButton">Upload</button>
</form>

<div id="successIndicator" style="display: none;" data-test-automation-id="successIndicator">
    File uploaded successfully!
</div>

<script>
    document.getElementById('uploadForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];

        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            fetch('/upload', {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    if (data.message === 'File received successfully') {
                        document.getElementById('successIndicator').style.display = 'block';
                    }
                    console.log('File uploaded successfully:', data);
                })
                .catch(error => {
                    console.error('Error uploading file:', error);
                });
        } else {
            console.error('No file selected');
        }
    });
</script>
</body>
</html>`;
    return c.html(html);
}
