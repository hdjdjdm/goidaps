export function showLoading() {
    const loadingElement = document.getElementById('loading');
    loadingElement.style.display = 'flex';
}

export function hideLoading() {
    const loadingElement = document.getElementById('loading');
    loadingElement.style.display = 'none';
}