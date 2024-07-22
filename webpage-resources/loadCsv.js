import init from '../pkg/freakstone.js';

async function run() {
    await init();

    const queryInput = document.getElementById('query');
    const filterButton = document.getElementById('filter-btn');
    const sortButton1 = document.getElementById('sort-btn1');
    const sortButton2 = document.getElementById('sort-btn2');
    const sortButton3 = document.getElementById('sort-btn3');
    const sortButton4 = document.getElementById('sort-btn4');
    const arrow1 = document.getElementById('arrow1');
    const arrow2 = document.getElementById('arrow2');
    const arrow3 = document.getElementById('arrow3');
    const arrow4 = document.getElementById('arrow4');
    const resultTable = document.getElementById('result');

    let csvRows = [];
    let filteredData = [];
    let headers = [];
    
    let sortColumn = null;
    let sortOrder = 'asc'; // Default sort order

    function loadCsv() {
        fetch('../csv/convertcsv.csv')
            .then(response => response.text())
            .then(csvData => {
                const [headerRow, ...rows] = csvData.split('\n').filter(row => row.trim() !== '');
                headers = headerRow.split(',');
                csvRows = rows.map(row => row.split(','));

                filteredData = csvRows;

                displayTable(filteredData);
            })
            .catch(error => {
                resultTable.innerHTML = "<tr><td colspan='100%'>Error loading CSV data.</td></tr>";
                console.error('Error:', error);
            });
    }

    loadCsv();

    filterButton.addEventListener('click', () => {
        const query = queryInput.value.trim();

        if (query === "") {
            filteredData = csvRows;
        } else {
            filteredData = csvRows.filter(row => row.join(',').toLowerCase().includes(query.toLowerCase()));
        }

        displayTable(filteredData);
    });

    function sortData(columnIndex, arrowElement) {
        if (sortColumn === columnIndex) {
            sortOrder = (sortOrder === 'asc') ? 'desc' : 'asc';
        } else {
            sortColumn = columnIndex;
            sortOrder = 'asc'; // Default to ascending when switching columns
        }

        const sortedData = [...filteredData].sort((a, b) => {
            const valueA = a[columnIndex] || '';
            const valueB = b[columnIndex] || '';

            if (sortOrder === 'asc') {
                return valueA.localeCompare(valueB);
            } else {
                return valueB.localeCompare(valueA);
            }
        });

        displayTable(sortedData);
        updateArrows(columnIndex);
    }

    function updateArrows(columnIndex) {
        // Reset arrows
        arrow1.innerHTML = columnIndex === 0 ? (sortOrder === 'asc' ? '&#9650;' : '&#9660;') : '&#9650;';
        arrow2.innerHTML = columnIndex === 1 ? (sortOrder === 'asc' ? '&#9650;' : '&#9660;') : '&#9650;';
        arrow3.innerHTML = columnIndex === 2 ? (sortOrder === 'asc' ? '&#9650;' : '&#9660;') : '&#9650;';
        arrow4.innerHTML = columnIndex === 3 ? (sortOrder === 'asc' ? '&#9650;' : '&#9660;') : '&#9650;';
    }

    sortButton1.addEventListener('click', () => sortData(0, arrow1));
    sortButton2.addEventListener('click', () => sortData(1, arrow2));
    sortButton3.addEventListener('click', () => sortData(2, arrow3));
    sortButton4.addEventListener('click', () => sortData(3, arrow4));

    function displayTable(data) {
        const nonEmptyData = data.filter(row => row.some(cell => cell.trim() !== ''));

        if (nonEmptyData.length === 0) {
            resultTable.innerHTML = "<tr><td colspan='100%'>No results found.</td></tr>";
            return;
        }

        const bodyHtml = nonEmptyData.map(row => `<tr>${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('');

        resultTable.innerHTML = `<tbody>${bodyHtml}</tbody>`;
    }

    function escapeHtml(text) {
        const element = document.createElement('div');
        if (text) {
            element.innerText = text;
            return element.innerHTML;
        }
        return '';
    }
}

run();
