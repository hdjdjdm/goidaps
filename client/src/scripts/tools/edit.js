import { currentImageId, fetchImage } from "./save_upload";

document.getElementById('flip-x').addEventListener('click', () => {
    flipImage('x');
});

document.getElementById('flip-y').addEventListener('click', () => {
    flipImage('y');
});

document.getElementById('rotate-left').addEventListener('click', () => {
    rotateImage('left')
});

document.getElementById('rotate-right').addEventListener('click', () => {
    rotateImage('right')
})

function flipImage(direction) {
    fetch(`http://localhost:8080/api/images/flip/${currentImageId}/${direction}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Ошибка при отзеркаливании изображения');
        }
        return response.json();
    })
    .then(data => {
        console.log('Успешно:', data);
        fetchImage(currentImageId);
    })
    .catch(error => {
        console.error('Ошибка:', error);
    })
}

function rotateImage(direction) {
    fetch(`http://localhost:8080/api/images/rotate/${currentImageId}/${direction}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Ошибка при повороте изображения')
        }
        return response.json
    })
    .then(data => {
        console.log('Успешно:', data)
        fetchImage(currentImageId)
    })
    .catch(error => {
        console.error('Ошибка:', error)
    })
}

export function resizeImage(width, height) {
    fetch(`http://localhost:8080/api/images/resize/${currentImageId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ width: width, height: height })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Ошибка при изменении размера изображения')
        }
        return response.json()
    })
    .then(data => {
        console.log('Успешно:', data)
        fetchImage(currentImageId)
    })
    .catch(error => {
        console.error('Ошибка', error)
    })
}

export function cropImage(x0, y0, x1, y1) {
    fetch(`http://localhost:8080/api/images/crop/${currentImageId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ x0: x0, y0: y0, x1: x1, y1: y1 })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Ошибка при обрезании изображения')
        }
        return response.json()
    })
    .then(data => {
        console.log('Успешно:', data)
        fetchImage(currentImageId)
    })
    .catch(error => {
        console.error('Ошибка', error)
    })
}