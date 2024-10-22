import { filterImage } from "../tools/edit";

export function createFilterModal() {
    const existingModal = document.getElementById('filter-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modalHtml = `
        <div id="filter-modal" class="modal">
            <div class="modal-content">
                <h2>Выберите фильтр</h2>
                <div class="filter-grid">
                    <div class="filter-item" data-filter="ColorBalance">
                        <img src="./assets/filters/colorBalance.jpg" alt="ColorBalance" class="filter-thumbnail">
                        <span>Цветовой баланс</span>
                    </div>
                    <div class="filter-item" data-filter="Grayscale">
                        <img src="./assets/filters/grayscale.jpg" alt="Grayscale" class="filter-thumbnail">
                        <span>Ч/Б</span>
                    </div>
                    <div class="filter-item" data-filter="Invert">
                        <img src="./assets/filters/invert.jpg" alt="Invert" class="filter-thumbnail">
                        <span>Инверсия</span>
                    </div>
                    <div class="filter-item" data-filter="Colorize">
                        <img src="./assets/filters/colorize.jpg" alt="Colorize" class="filter-thumbnail">
                        <span>Colorize</span>
                    </div>
                    <div class="filter-item" data-filter="Pixelate">
                        <img src="./assets/filters/pixelate.jpg" alt="Pixelate" class="filter-thumbnail">
                        <span>Пикселизация</span>
                    </div>
                    <div class="filter-item" data-filter="Sepia">
                        <img src="./assets/filters/sepia.jpg" alt="Sepia" class="filter-thumbnail">
                        <span>Сепия</span>
                    </div>
                    <div class="filter-item" data-filter="Sigmoid">
                        <img src="./assets/filters/sigmoid.jpg" alt="Sigmoid" class="filter-thumbnail">
                        <span>Сигмоида</span>
                    </div>
                </div>
                <footer>
                    <ul class="settings" id="filter-settings">
                    </ul>
                    <button id="apply-filter-btn">Применить</button>
                    <button id="close-filter-btn">Закрыть</button>
                </footer>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = document.getElementById('filter-modal');
    const filterSettings = document.getElementById('filter-settings');
    const closeBtn = document.getElementById('close-filter-btn');
    const applyBtn = document.getElementById('apply-filter-btn');
    const filterItems = document.querySelectorAll('.filter-item');
    let selectedFilter = null;

    const filterConfig = {
        ColorBalance: {
            showSettings: true,
            params: [
                { name: 'param1', label: 'Красный', min: -100, max: 500, default: 0 },
                { name: 'param2', label: 'Зеленый', min: -100, max: 500, default: 0 },
                { name: 'param3', label: 'Синий', min: -100, max: 500, default: 0 },
            ]
        },
        Grayscale: { showSettings: false },
        Invert: { showSettings: false },
        Colorize: {
            showSettings: true,
            params: [
                { name: 'param1', label: 'Оттенок', min: 0, max: 360, default: 0 },
                { name: 'param2', label: 'Насыщенность', min: 0, max: 100, default: 50 },
                { name: 'param3', label: 'Яркость', min: 0, max: 100, default: 100 },
            ]
        },
        Pixelate: { showSettings: true,
            params: [
                { name: 'param1', label: 'Размер пикселя', min: 0, max: 50, default: 0}
            ]
        },
        Sepia: { showSettings: true,
            params: [
                { name: 'param1', label: 'Интенсивность сепии', min: 0, max: 100, default: 0}
            ]
        },
        Sigmoid: { showSettings: true,
            params: [
                { name: 'param1', label: 'Контраст', min: 0, max: 1, default: 0.5, step: 0.1},
                { name: 'param2', label: 'Средняя точка', min: -10, max: 10, default: 0}
            ]
        },
    };

    function updateFilterSettings(filter) {
        const config = filterConfig[filter];
        if (config && config.showSettings) {
            filterSettings.style.display = 'block';
            filterSettings.innerHTML = '';
    
            config.params.forEach(param => {
                const step = param.step !== undefined ? param.step : 1;
    
                const settingHtml = `
                    <li>
                        <label for="${param.name}">${param.label}</label>
                        <input type="range" id="${param.name}" name="${param.name}" min="${param.min}" max="${param.max}" value="${param.default}" step="${step}">
                        <input type="number" id="${param.name}-value" min="${param.min}" max="${param.max}" value="${param.default}" step="${step}">
                    </li>
                `;
                filterSettings.insertAdjacentHTML('beforeend', settingHtml);
    
                const rangeInput = document.getElementById(param.name);
                const numberInput = document.getElementById(`${param.name}-value`);
    
                rangeInput.addEventListener('input', () => {
                    numberInput.value = rangeInput.value;
                });
                numberInput.addEventListener('input', () => {
                    let value = parseFloat(numberInput.value);
                    if (value < param.min) value = param.min;
                    if (value > param.max) value = param.max;
    
                    numberInput.value = value;
                    rangeInput.value = value;
                });
            });
        } else {
            filterSettings.style.display = 'none';
        }
    }
    
    filterItems.forEach(item => {
        item.addEventListener('click', () => {
            filterItems.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            selectedFilter = item.dataset.filter;

            updateFilterSettings(selectedFilter);
        });
    });

    function closeModal() {
        modal.style.display = 'none';
        selectedFilter = null;
        filterItems.forEach(i => i.classList.remove('selected'));
        filterSettings.innerHTML = '';
        filterSettings.style.display = 'none';
    }

    closeBtn.addEventListener('click', closeModal);

    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            closeModal();
        }
    });

    applyBtn.addEventListener('click', () => {
        if (selectedFilter) {
            const filterParams = {};
    
            const config = filterConfig[selectedFilter];
            if (config && config.showSettings) {
                config.params.forEach(param => {
                    filterParams[param.name] = parseFloat(document.getElementById(param.name).value, 10);
                });
            }
    
            filterImage(selectedFilter, filterParams);
            closeModal();
        }
    });

    modal.style.display = 'block';
}

document.getElementById('filters').addEventListener('click', function() {
    createFilterModal();
});
