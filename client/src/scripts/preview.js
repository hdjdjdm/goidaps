import { Canvas, FabricImage, Point } from 'fabric';
import { enableCrop, disableCrop } from './tools/crop';

const previewContainer = document.querySelector('.preview');
const MIN_CANVAS_SIZE = 300;
const MAX_CANVAS_SIZE = 3000;

export let canvas;
let activeCropRect = null;

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
    let lastPosX, lastPosY;

    canvas.on('mouse:down', (opt) => {
        if (!activeCropRect) {
            isDragging = true;
            lastPosX = opt.e.clientX || opt.e.touches[0].clientX;
            lastPosY = opt.e.clientY || opt.e.touches[0].clientY;
        }
    });

    canvas.on('mouse:move', (opt) => {
        if (isDragging) {
            const deltaX = (opt.e.clientX || opt.e.touches[0].clientX) - lastPosX;
            const deltaY = (opt.e.clientY || opt.e.touches[0].clientY) - lastPosY;

            let vpt = canvas.viewportTransform;
            vpt[4] += deltaX;
            vpt[5] += deltaY;

            lastPosX = opt.e.clientX || opt.e.touches[0].clientX;
            lastPosY = opt.e.clientY || opt.e.touches[0].clientY;
            canvas.renderAll();
        }
    });

    canvas.on('mouse:up', () => {
        isDragging = false;
    });

    canvas.on('touch:gesture', handleTouchGesture);
}

function handleTouchGesture(event) {
    const scaleFactor = event.e.scale;
    const zoom = canvas.getZoom();
    const newZoom = zoom * scaleFactor;

    if (newZoom > 5) newZoom = 5;
    if (newZoom < 0.5) newZoom = 0.5;

    canvas.zoomToPoint({ x: event.self.x, y: event.self.y }, newZoom);
    canvas.renderAll();
}

function removeCanvasEvents() {
    canvas.off('mouse:wheel');
    canvas.off('mouse:down');
    canvas.off('mouse:move');
    canvas.off('mouse:up');
}

function handleKeyPress(event) {
    if (activeCropRect && event.key === 'Escape') {
        disableCrop(canvas, activeCropRect);
        activeCropRect = null;
    }

    if (!activeCropRect) {
        const moveStep = 10;

        switch (event.key) {
            case 'ArrowUp':
                moveCanvas(0, moveStep);
                break;
            case 'ArrowDown':
                moveCanvas(0, -moveStep);
                break;
            case 'ArrowLeft':
                moveCanvas(moveStep, 0);
                break;
            case 'ArrowRight':
                moveCanvas(-moveStep, 0);
                break;
        }
    }
}

function moveCanvas(deltaX, deltaY) {
    let vpt = canvas.viewportTransform;
    vpt[4] += deltaX;
    vpt[5] += deltaY;
    canvas.setViewportTransform(vpt);
    canvas.renderAll();
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
    if (activeCropRect) {
        disableCrop(canvas, activeCropRect);
        activeCropRect = null;
    } else {
        activeCropRect = enableCrop(canvas, 'custom');
    }
});

document.getElementById('crop_1_1').addEventListener('click', () => {
    activeCropRect = enableCrop(canvas, '1:1');
});
document.getElementById('crop_4_3').addEventListener('click', () => {
    activeCropRect = enableCrop(canvas, '4:3');
});
document.getElementById('crop_16_9').addEventListener('click', () => {
    activeCropRect = enableCrop(canvas, '16:9');
});
document.getElementById('crop_16_10').addEventListener('click', () => {
    activeCropRect = enableCrop(canvas, '16:10');
});
