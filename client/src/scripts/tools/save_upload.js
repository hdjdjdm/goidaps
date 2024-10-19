const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const saveButton = document.getElementById('saveButton');
let uploadedFileName = '';

uploadArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    uploadArea.classList.add('highlight');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('highlight');
});

uploadArea.addEventListener('drop', (event) => {
    event.preventDefault();
    uploadArea.classList.remove('highlight');

    const files = event.dataTransfer.files;
    if (files.length > 0) {
        handleFiles(files);
    }
});

uploadArea.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (event) => {
    const files = event.target.files;
    if (files.length > 0) {
        handleFiles(files);
    }
});

function handleFiles(files) {
    const file = files[0];
    if (file) {
        uploadedFileName = file.name;
        console.log(`Файл загружен: ${uploadedFileName}`);
    }
}

saveButton.addEventListener('click', function() {
    const canvas = document.getElementById('canvas');

    if (canvas) {
        canvas.toBlob(function(blob) {
            if (blob) {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);

                const filename = uploadedFileName || 'image.png'; 
                link.download = filename;

                link.click();
                URL.revokeObjectURL(link.href);
            } else {
                console.error('Не удалось создать Blob из canvas.');
            }
        }, 'image/png');
    } else {
        console.error('Canvas не найден.');
    }
});
