import init from '../pkg/freakstone.js';

async function run() {
    await init();

    const queryInput = document.getElementById('query');
    const resultTable = document.getElementById('result');
    const sortButtons = Array.from(document.querySelectorAll('[id^="sort-btn"]'));
    const arrows = Array.from(document.querySelectorAll('[id^="arrow"]'));

    let csvRows = [], filteredData = [], headers = [];
    let sortColumn = null, sortOrder = 'asc';

    loadCsv();

    document.getElementById('filter-btn').addEventListener('click', handleFilter);

    sortButtons.forEach((button, index) => {
        button.addEventListener('click', () => handleSort(index));
    });

    async function loadCsv() {
        try {
            const response = await fetch('../csv/MOCK_DATA.csv');
            const csvData = await response.text();
            processCsvData(csvData);
        } catch (error) {
            displayError("Error loading CSV data.");
            console.error('Error:', error);
        }
    }

    function processCsvData(csvData) {
        const [headerRow, ...rows] = csvData.split('\n').filter(row => row.trim());
        headers = headerRow.split(',');
        csvRows = rows.map(row => row.split(','));
        filteredData = csvRows;
        displayTable(filteredData);
    }

    function handleFilter() {
        const query = queryInput.value.trim().toLowerCase();
        filteredData = query ? csvRows.filter(row => row.join(',').toLowerCase().includes(query)) : csvRows;
        displayTable(filteredData);
    }

    function handleSort(columnIndex) {
        columnIndex++;
        sortOrder = (sortColumn === columnIndex && sortOrder === 'asc') ? 'desc' : 'asc';
        sortColumn = columnIndex;
        filteredData.sort((a, b) => sortOrder === 'asc' ? a[columnIndex].localeCompare(b[columnIndex]) : b[columnIndex].localeCompare(a[columnIndex]));
        updateArrows(columnIndex);
        displayTable(filteredData);
    }

    function updateArrows(columnIndex) {
        columnIndex--;
        arrows.forEach((arrow, index) => {
            arrow.innerHTML = (index === columnIndex) ? (sortOrder === 'asc' ? '&#9650;' : '&#9660;') : '&#9650;';
        });
    }

    function displayTable(data) {
        resultTable.innerHTML = data.length ? data.map(row => `
            <tr>${row.slice(0, 6).map((cell, index) => index === 0 ? `<td><img src="${escapeHtml(cell)}" alt="Image" class="img-cell"></td>` : `<td class="${index === 1 ? 'large-font' : ''}">${escapeHtml(cell)}</td>`).join('')}</tr>
        `).join('') : "<tr><td colspan='100%'>No results found.</td></tr>";
    }

    function escapeHtml(text) {
        const element = document.createElement('div');
        element.innerText = text;
        return element.innerHTML;
    }

    function displayError(message) {
        resultTable.innerHTML = `<tr><td colspan='100%'>${message}</td></tr>`;
    }
}

run();
