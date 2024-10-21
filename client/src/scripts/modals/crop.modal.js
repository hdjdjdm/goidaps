const cropModal = document.getElementById('crop-modal');
const openCropModalButton = document.getElementById('crop');
const closeCropModalButton = document.getElementById('close-crop-modal');
const cropButton = document.getElementById('crop-btn');
const imageToCrop = document.getElementById('image-to-crop');

let cropper; // Переменная для хранения экземпляра Cropper.js

// Открыть модальное окно
openCropModalButton.addEventListener('click', function () {
    imageToCrop.src = canvas.toDataURL(); // Получаем данные изображения из канваса
    cropModal.style.display = 'block';

    // Инициализация Cropper.js
    cropper = new Cropper(imageToCrop, {
        aspectRatio: NaN, // Установите на NaN, если хотите произвольные пропорции
        viewMode: 1,
    });
});

// Закрыть модальное окно
closeCropModalButton.addEventListener('click', function () {
    cropper.destroy(); // Удаляем экземпляр Cropper.js
    cropModal.style.display = 'none';
});

// Обработка кнопки обрезки
cropButton.addEventListener('click', function () {
    const canvas = cropper.getCroppedCanvas();

    // Здесь вы можете сделать что-то с обрезанным изображением
    const croppedImageDataURL = canvas.toDataURL(); // Получаем данные обрезанного изображения

    // Например, отображаем его или отправляем на сервер
    console.log(croppedImageDataURL); // Логируем или используйте по вашему усмотрению

    // Закрыть модальное окно после обрезки
    cropper.destroy(); // Удаляем экземпляр Cropper.js
    cropModal.style.display = 'none';
});
