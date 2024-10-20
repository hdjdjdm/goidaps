const uploadModal = document.getElementById('upload-modal');
const openUploadFormButton = document.getElementById('openUploadForm');

openUploadFormButton.addEventListener('click', function() {
    uploadModal.style.display = 'block';
});

window.addEventListener('click', function(event) {
    if (event.target == uploadModal) {
        uploadModal.style.display = 'none';
    }
});
