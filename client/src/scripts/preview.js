const canvasElement = document.getElementById('canvas');
const previewContainer = document.querySelector('.preview');

const MIN_CANVAS_SIZE = 300;
const MAX_CANVAS_SIZE = 3000;

function resizeCanvas() {
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

window.addEventListener('load', resizeCanvas);

window.addEventListener('resize', resizeCanvas);

const canvas = new fabric.Canvas('canvas');

fabric.Image.fromURL('./assets/icons/test/preview.jpg', (img) => {
    const canvasCenterX = canvas.getWidth() / 2;
    img.set({
        left: canvasCenterX + img.width / 2,
        top: 0,
        scaleX: 1,
        scaleY: 1
    });
    canvas.add(img);
});

canvas.on('mouse:wheel', (opt) => {
    const delta = opt.e.deltaY;
    let zoom = canvas.getZoom();
    let newZoom = zoom - delta / 800;

    if (newZoom > 5) {
        newZoom = 5;
    }
    if (newZoom < 0.5) {
        newZoom = 0.5;
    }

    const pointer = canvas.getPointer(opt.e);
    const point = new fabric.Point(pointer.x, pointer.y);

    canvas.zoomToPoint(point, newZoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
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
