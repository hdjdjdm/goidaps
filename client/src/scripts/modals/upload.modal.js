const uploadModal = document.createElement('div');
uploadModal.id = 'upload-modal';
uploadModal.className = 'modal';
uploadModal.innerHTML = `
    <div class="modal-content">
        <form id="uploadForm" enctype="multipart/form-data">
            <h2>Загрузить фото</h2>
            <div class="upload-area" id="uploadArea">
                <img src="./assets/icons/file-upload.svg" alt="Upload" class="upload-icon" id="svg" />
                <span>Перетащите изображение сюда или нажмите для загрузки</span>
                <input type="file" id="fileInput" accept="image/*" required hidden />
            </div>
        </form>
    </div>
`;

document.body.appendChild(uploadModal);

const openUploadFormButton = document.getElementById('openUploadForm');

openUploadFormButton.addEventListener('click', function() {
    uploadModal.style.display = 'block';
});

window.addEventListener('click', function(event) {
    if (event.target == uploadModal) {
        uploadModal.style.display = 'none';
    }
});

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');

uploadArea.addEventListener('click', () => {
    fileInput.click();
});

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

fileInput.addEventListener('change', (event) => {
    const files = event.target.files;
    if (files.length > 0) {
        handleFiles(files);
    }
});