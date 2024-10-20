const canvasElement = document.getElementById('canvas');
const previewContainer = document.querySelector('.preview');

const MIN_CANVAS_SIZE = 300;
const MAX_CANVAS_SIZE = 3000;

let canvas;

function resizeCanvas() {
    if (!canvas) return;

    let newWidth = previewContainer.clientWidth;
    let newHeight = previewContainer.clientHeight;

    if (newWidth < MIN_CANVAS_SIZE) newWidth = MIN_CANVAS_SIZE;
    if (newWidth > MAX_CANVAS_SIZE) newWidth = MAX_CANVAS_SIZE;

    if (newHeight < MIN_CANVAS_SIZE) newHeight = MIN_CANVAS_SIZE;
    if (newHeight > MAX_CANVAS_SIZE) newHeight = MAX_CANVAS_SIZE;

    canvas.setWidth(newWidth);
    canvas.setHeight(newHeight);
    canvas.renderAll();
}

window.addEventListener('load', () => {
    initializeCanvas('./assets/icons/test/preview.jpg');
    resizeCanvas();
    updateZoomValue(canvas.getZoom()); // Инициализация значения зума
});

window.addEventListener('resize', resizeCanvas);

function initializeCanvas(imageURL) {
    if (!canvas) {
        canvas = new fabric.Canvas('canvas');
        canvas.selection = false;
    } else {
        canvas.clear();
    }

    fabric.Image.fromURL(imageURL, (img) => {
        const canvasCenterX = canvas.getWidth() / 2;
        img.set({
            left: canvasCenterX - img.width / 2,
            top: 0,
            scaleX: 1,
            scaleY: 1
        });
        canvas.add(img);
        resizeCanvas();
    });

    canvas.on('mouse:wheel', (opt) => {
        opt.e.preventDefault();
        opt.e.stopPropagation();
    
        const delta = opt.e.deltaY;
        let zoom = canvas.getZoom();
        
        // Используйте меньший шаг для зума, чтобы сделать его более плавным
        let zoomStep = 0.05;
        let newZoom = zoom - (delta > 0 ? zoomStep : -zoomStep);
    
        if (newZoom > 5) newZoom = 5;
        if (newZoom < 0.5) newZoom = 0.5;

        // Получаем координаты курсора относительно канваса
        const pointer = canvas.getPointer(opt.e);
        const zoomPoint = new fabric.Point(
            (pointer.x - canvas.viewportTransform[4]) / zoom,
            (pointer.y - canvas.viewportTransform[5]) / zoom
        );

        canvas.zoomToPoint(zoomPoint, newZoom);
        canvas.renderAll();
        updateZoomValue(newZoom); // Обновляем значение зума
    });

    // Обработчик изменения ползунка
    const zoomSlider = document.getElementById('zoom-slider');
    zoomSlider.addEventListener('input', (e) => {
        const zoomValue = e.target.value / 100; // Преобразуем в процент
        canvas.setZoom(zoomValue);
        updateZoomValue(zoomValue); // Обновляем значение зума
        canvas.renderAll();
    });

    let isDragging = false;
    let lastPosX;
    let lastPosY;

    canvas.on('mouse:down', (opt) => {
        isDragging = true;
        lastPosX = opt.e.clientX;
        lastPosY = opt.e.clientY;
    });

    canvas.on('mouse:move', (opt) => {
        if (isDragging) {
            const deltaX = opt.e.clientX - lastPosX;
            const deltaY = opt.e.clientY - lastPosY;

            let vpt = canvas.viewportTransform;
            vpt[4] += deltaX;
            vpt[5] += deltaY;

            lastPosX = opt.e.clientX;
            lastPosY = opt.e.clientY;
            canvas.renderAll();
        }
    });

    canvas.on('mouse:up', () => {
        isDragging = false;
    });
}

// Функция для обновления значения зума
function updateZoomValue(zoom) {
    const zoomValue = document.getElementById('zoom-value');
    zoomValue.textContent = Math.round(zoom * 100) + '%'; // Устанавливаем значение зума в процентах
}
