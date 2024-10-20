const imageId = localStorage.getItem('currentImageId');

function flipImage(direction) {
    fetch(`http://localhost:8080/api/images/flip/${imageId}/${direction}`, {
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
        fetchImage(imageId);
    })
    .catch(error => {
        console.error('Ошибка:', error);
    });
}

document.getElementById('flip-x').addEventListener('click', () => {
    flipImage('x');
});

document.getElementById('flip-y').addEventListener('click', () => {
    flipImage('y');
});
