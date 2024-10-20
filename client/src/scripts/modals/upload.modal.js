const modal = document.getElementById('upload-modal');
const openFormButton = document.getElementById('openUploadForm');

openFormButton.addEventListener('click', function() {
    modal.style.display = 'block';
});

window.addEventListener('click', function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
});
