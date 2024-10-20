const resizeModal = document.getElementById('resize-modal');
const openResizeModalButton = document.getElementById('resize');

openResizeModalButton.addEventListener('click', function() {
    resizeModal.style.display = 'block';
});

window.addEventListener('click', function(event) {
    if (event.target == resizeModal) {
        resizeModal.style.display = 'none';
    }
});
