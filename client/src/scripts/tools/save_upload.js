let currentImageId = null;

function initialize() {
    loadCurrentImageId();
    if (currentImageId) {
        fetchImage(currentImageId);
    }
    resizeCanvas();
}

function loadCurrentImageId() {
    currentImageId = localStorage.getItem('currentImageId');
    if (!currentImageId) {
        console.log("Изображение не найдено в localStorage");
    }
}

window.addEventListener('load', initialize);

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const saveButton = document.getElementById('saveButton');

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
    const formData = new FormData();
    formData.append("image", files[0]);

    fetch('http://localhost:8080/api/images/upload', {
        method: 'POST',
        body: formData,
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errData => {
                throw new Error(`Ошибка: ${errData.error || response.statusText}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Успешно загружено:', data);
        
        currentImageId = data.id;
        uploadedFileName = files[0].name;
        localStorage.setItem('currentImageId', currentImageId);
        fetchImage(currentImageId);
    })
    .catch(error => {
        console.error('Ошибка:', error);
        alert(error.message);
    });
}

function fetchImage(id) {
    showLoading()
    const timestamp = new Date().getTime();
    fetch(`http://localhost:8080/api/images/${id}?t=${timestamp}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Ошибка загрузки изображения");
            }
            return response.blob();
        })
        .then(imageBlob => {
            hideLoading()
            const imageURL = URL.createObjectURL(imageBlob);
            initializeCanvas(imageURL);

            const upload_modal = document.getElementById("upload-modal");
            upload_modal.style.display = 'none';
        })
        .catch(error => {
            hideLoading()
            console.error("Ошибка:", error);
        });
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
