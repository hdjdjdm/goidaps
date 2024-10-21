import { filterImage } from "../tools/edit";

export function createFilterModal() {
    const modalHtml = `
        <div id="filter-modal" class="modal">
            <div class="modal-content">
                <h2>Выберите фильтр</h2>
                <div class="filter-grid">
                    <div class="filter-item" data-filter="Grayscale">
                        <img src="./assets/filters/grayscale.jpg" alt="Grayscale" class="filter-thumbnail">
                        <span>Ч/Б</span>
                    </div>
                    <div class="filter-item" data-filter="Invert">
                        <img src="./assets/filters/grayscale.jpg" alt="Invert" class="filter-thumbnail">
                        <span>Инверсия</span>
                    </div>
                    <div class="filter-item" data-filter="Colorize">
                        <img src="./assets/filters/grayscale.jpg" alt="Grayscale" class="filter-thumbnail">
                        <span>Colorize</span>
                    </div>
                    <div class="filter-item" data-filter="Grayscale">
                        <img src="./assets/filters/grayscale.jpg" alt="Grayscale" class="filter-thumbnail">
                        <span>Grayscale</span>
                    </div>
                    <div class="filter-item" data-filter="Grayscale">
                        <img src="./assets/filters/grayscale.jpg" alt="Grayscale" class="filter-thumbnail">
                        <span>Grayscale</span>
                    </div>
                    <div class="filter-item" data-filter="Grayscale">
                        <img src="./assets/filters/grayscale.jpg" alt="Grayscale" class="filter-thumbnail">
                        <span>Grayscale</span>
                    </div>
                    <div class="filter-item" data-filter="Grayscale">
                        <img src="./assets/filters/grayscale.jpg" alt="Grayscale" class="filter-thumbnail">
                        <span>Grayscale</span>
                    </div>
                    <div class="filter-item" data-filter="Grayscale">
                        <img src="./assets/filters/grayscale.jpg" alt="Grayscale" class="filter-thumbnail">
                        <span>Grayscale</span>
                    </div>
                    <div class="filter-item" data-filter="Grayscale">
                        <img src="./assets/filters/grayscale.jpg" alt="Grayscale" class="filter-thumbnail">
                        <span>Grayscale</span>
                    </div>
                    <div class="filter-item" data-filter="Grayscale">
                        <img src="./assets/filters/grayscale.jpg" alt="Grayscale" class="filter-thumbnail">
                        <span>Grayscale</span>
                    </div>
                    <div class="filter-item" data-filter="Grayscale">
                        <img src="./assets/filters/grayscale.jpg" alt="Grayscale" class="filter-thumbnail">
                        <span>Grayscale</span>
                    </div>
                    <div class="filter-item" data-filter="Grayscale">
                        <img src="./assets/filters/grayscale.jpg" alt="Grayscale" class="filter-thumbnail">
                        <span>Grayscale</span>
                    </div>
                    <div class="filter-item" data-filter="Grayscale">
                        <img src="./assets/filters/grayscale.jpg" alt="Grayscale" class="filter-thumbnail">
                        <span>Grayscale</span>
                    </div>
                </div>
                <footer>
                    <button id="apply-filter-btn">Применить</button>
                </footer>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = document.getElementById('filter-modal');
    const applyBtn = document.getElementById('apply-filter-btn');
    const filterItems = document.querySelectorAll('.filter-item');
    let selectedFilter = null;

    filterItems.forEach(item => {
        item.addEventListener('click', () => {
            filterItems.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            selectedFilter = item.dataset.filter;
        });
    });

    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    applyBtn.addEventListener('click', () => {
        if (selectedFilter) {
            filterImage(selectedFilter);
            modal.style.display = 'none';
        }
    });

    modal.style.display = 'block';
}

document.getElementById('filters').addEventListener('click', function() {
    createFilterModal();
});
