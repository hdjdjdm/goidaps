import { Rect } from 'fabric';
import { cropImage } from './edit';

export function enableCrop(canvas, aspectRatio) {
    const fabricImg = canvas.getObjects('image')[0];
    if (!fabricImg) {
        console.error("Нет изображения на канвасе для обрезки.");
        return null;
    }

    const imgWidth = fabricImg.getScaledWidth();
    const imgHeight = fabricImg.getScaledHeight();
    const imgLeft = fabricImg.left;
    const imgTop = fabricImg.top;

    let cropWidth, cropHeight;

    switch (aspectRatio) {
        case '1:1':
            cropWidth = cropHeight = Math.min(imgWidth, imgHeight);
            break;
        case '4:3':
            cropWidth = imgWidth;
            cropHeight = (imgWidth * 3) / 4;
            break;
        case '16:9':
            cropWidth = imgWidth;
            cropHeight = (imgWidth * 9) / 16;
            break;
        case '16:10':
            cropWidth = imgWidth;
            cropHeight = (imgWidth * 10) / 16;
            break;
        case 'custom':
        default:
            cropWidth = imgWidth;
            cropHeight = imgHeight;
            break;
    }

    const activeCropRect = new Rect({
        left: imgLeft,
        top: imgTop,
        width: cropWidth,
        height: cropHeight,
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

    window.addEventListener('keydown', (event) => handleEnterCrop(event, canvas, activeCropRect));

    return activeCropRect;
}

export function disableCrop(canvas, activeCropRect) {
    if (activeCropRect) {
        canvas.remove(activeCropRect);
    }
    canvas.renderAll();
    window.removeEventListener('keydown', handleEnterCrop);
}

function handleEnterCrop(event, canvas, activeCropRect) {
    if (event.key === 'Enter' && activeCropRect) {
        const fabricImg = canvas.getObjects('image')[0];
        if (!fabricImg) {
            console.error("Нет изображения на канвасе для обрезки.");
            return;
        }

        const imgBoundingRect = fabricImg.getBoundingRect();
        const boundingRect = activeCropRect.getBoundingRect();

        const x0 = Math.max(Math.floor(boundingRect.left), imgBoundingRect.left);
        const y0 = Math.max(Math.floor(boundingRect.top), imgBoundingRect.top);
        const x1 = Math.min(Math.floor(boundingRect.left + boundingRect.width), imgBoundingRect.left + imgBoundingRect.width);
        const y1 = Math.min(Math.floor(boundingRect.top + boundingRect.height), imgBoundingRect.top + imgBoundingRect.height);

        const cropWidth = x1 - x0;
        const cropHeight = y1 - y0;

        if (cropWidth === imgBoundingRect.width && cropHeight === imgBoundingRect.height) {
            disableCrop(canvas, activeCropRect);
            return;
        }

        cropImage(x0, y0, x1, y1);
        disableCrop(canvas, activeCropRect);
    }
}
