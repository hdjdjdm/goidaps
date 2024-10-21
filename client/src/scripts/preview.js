import { Canvas, FabricImage, Point, Rect } from 'fabric';
import { cropImage } from './tools/edit';

const previewContainer = document.querySelector('.preview');
const MIN_CANVAS_SIZE = 300;
const MAX_CANVAS_SIZE = 3000;

export let canvas;
let activeCropRect;
let isCropping = false;

export function resizeCanvas() {
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

window.addEventListener('resize', resizeCanvas);

export function initializeCanvas(imageURL) {
    if (!canvas) {
        canvas = new Canvas('canvas');
        canvas.selection = false;
    } else {
        removeCanvasEvents();
        canvas.clear();
    }

    const initialZoom = 1;
    canvas.setZoom(initialZoom);
    resizeCanvas();

    const imgElement = new Image();
    imgElement.src = imageURL;
    imgElement.onload = () => {
        const fabricImg = new FabricImage(imgElement, {
            selectable: false,
        });

        canvas.add(fabricImg);

        const imgCenterX = fabricImg.getScaledWidth() / 2;
        const imgCenterY = fabricImg.getScaledHeight() / 2;

        const canvasCenterX = canvas.getWidth() / 2;
        const canvasCenterY = canvas.getHeight() / 2;

        const vpt = canvas.viewportTransform;
        vpt[4] = canvasCenterX - imgCenterX;
        vpt[5] = canvasCenterY - imgCenterY;

        canvas.setViewportTransform(vpt);
        canvas.renderAll();

        setCanvasEvents();
    };

    imgElement.onerror = () => {
        console.error("Ошибка загрузки изображения с URL:", imageURL);
    };
}

function setCanvasEvents() {
    canvas.on('mouse:wheel', handleMouseWheel);

    let isDragging = false;
    let lastPosX;
    let lastPosY;

    canvas.on('mouse:down', (opt) => {
        if (!isCropping) {
            isDragging = true;
            lastPosX = opt.e.clientX;
            lastPosY = opt.e.clientY;
        }
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

function removeCanvasEvents() {
    canvas.off('mouse:wheel');
    canvas.off('mouse:down');
    canvas.off('mouse:move');
    canvas.off('mouse:up');
}

function handleMouseWheel(opt) {
    opt.e.preventDefault();
    opt.e.stopPropagation();

    const delta = opt.e.deltaY;
    let zoom = canvas.getZoom();

    let zoomStep = 0.05;
    let newZoom = zoom - (delta > 0 ? zoomStep : -zoomStep);

    if (newZoom > 5) newZoom = 5;
    if (newZoom < 0.5) newZoom = 0.5;

    const centerX = canvas.getWidth() / 2;
    const centerY = canvas.getHeight() / 2;

    const zoomPoint = new Point(centerX / zoom, centerY / zoom);

    canvas.zoomToPoint(zoomPoint, newZoom);
    canvas.renderAll();
}

const cropButton = document.getElementById('crop');
cropButton.addEventListener('click', () => {
    if (isCropping) {
        disableCrop();
    } else {
        enableCrop();
    }
});

function enableCrop() {
    const fabricImg = canvas.getObjects('image')[0]; // Получаем первое изображение на канвасе
    if (!fabricImg) {
        console.error("Нет изображения на канвасе для обрезки.");
        return;
    }

    isCropping = true;

    const imgWidth = fabricImg.getScaledWidth();
    const imgHeight = fabricImg.getScaledHeight();
    const imgLeft = fabricImg.left;
    const imgTop = fabricImg.top;

    activeCropRect = new Rect({
        left: imgLeft,
        top: imgTop,
        width: imgWidth,
        height: imgHeight,
        fill: 'rgba(0, 0, 0, 0.3)',
        stroke: 'white',
        strokeWidth: 2,
        selectable: true,
        hasControls: true,
        lockRotation: true,
    });

    canvas.add(activeCropRect);
    canvas.setActiveObject(activeCropRect);
    canvas.renderAll();

    window.addEventListener('keydown', handleEnterCrop);
}

function disableCrop() {
    isCropping = false;
    canvas.remove(activeCropRect);
    canvas.renderAll();
    window.removeEventListener('keydown', handleEnterCrop);
}

function handleEnterCrop(event) {
    if (event.key === 'Enter') {
        const x0 = Math.floor(activeCropRect.left);
        const y0 = Math.floor(activeCropRect.top);
        const x1 = Math.floor(x0 + activeCropRect.width);
        const y1 = Math.floor(y0 + activeCropRect.height);

        cropImage(x0, y0, x1, y1);
        disableCrop();
    }
}
