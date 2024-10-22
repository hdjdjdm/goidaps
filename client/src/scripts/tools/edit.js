import config from "../../config";
import { hideLoading, showLoading } from "../loading";
import { currentImageId, fetchImage } from "./save_upload";

const apiUrl = config.API_URL;

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
    showLoading()
    fetch(`${apiUrl}/api/images/flip/${currentImageId}/${direction}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        hideLoading()
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
        hideLoading()
        console.error('Ошибка:', error);
    })
}

function rotateImage(direction) {
    showLoading()
    fetch(`${apiUrl}/api/images/rotate/${currentImageId}/${direction}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        hideLoading()
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
        hideLoading()
        console.error('Ошибка:', error)
    })
}

export function resizeImage(width, height) {
    showLoading()
    fetch(`${apiUrl}/api/images/resize/${currentImageId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ width: width, height: height })
    })
    .then(response => {
        hideLoading()
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
        hideLoading()
        console.error('Ошибка', error)
    })
}

export function cropImage(x0, y0, x1, y1) {
    showLoading()
    fetch(`${apiUrl}/api/images/crop/${currentImageId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ x0: x0, y0: y0, x1: x1, y1: y1 })
    })
    .then(response => {
        hideLoading()
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
        hideLoading()
        console.error('Ошибка', error)
    })
}

export function settingImage(filters) {
    showLoading()
    fetch(`${apiUrl}/api/images/${currentImageId}/settings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(filters)
    })
    .then(response => {
        hideLoading()
        if (!response.ok) {
            throw new Error('Ошибка при применении фильтров изображения')
        }
        return response.json()
    })
    .then(data => {
        console.log('Успешно:', data)
        fetchImage(currentImageId)
    })
    .catch(error => {
        hideLoading()
        console.error('Ошибка', error)
    })
}

export function filterImage(filter, filterParams) {
    showLoading()
    fetch(`${apiUrl}/api/images/${currentImageId}/filters/${filter}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(filterParams)
    })
    .then(response => {
        hideLoading()
        if (!response.ok) {
            throw new Error('Ошибка при применении фильтров изображения')
        }
        return response.json()
    })
    .then(data => {
        console.log('Успешно:', data)
        fetchImage(currentImageId)
    })
    .catch(error => {
        hideLoading()
        console.error('Ошибка', error)
    })
}