import init, { filter_csv, sort_csv } from '../pkg/freakstone.js';

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
        const [headerRow, ...rows] = csvData
        .split('\n')
        .filter(row => row.trim());
        
        headers = headerRow.split(',');
        csvRows = rows.map(row => row.split(','));
        filteredData = csvRows;
        displayTable(filteredData);
    }

    async function handleFilter() {
        const titleQuery = document.getElementById('title-filter').value.trim();
        const yearQuery = document.getElementById('year-filter').value.trim();
        const genreQuery = document.getElementById('genre-filter').value.trim();
        const ratingQuery = document.getElementById('rating-filter').value.trim();
        const directorQuery = document.getElementById('director-filter').value.trim();
        const writerQuery = document.getElementById('writer-filter').value.trim();
        const actorQuery = document.getElementById('actor-filter').value.trim();
        const languageQuery = document.getElementById('language-filter').value.trim();
        const countryQuery = document.getElementById('country-filter').value.trim();
        
    
        if (!titleQuery && !yearQuery && !genreQuery && !ratingQuery && !directorQuery && !writerQuery && !actorQuery && !languageQuery && !countryQuery) {
            filteredData = csvRows;
            displayTable(filteredData);
            return;
        }
    
        const csvData = csvRows
            .map(row => row.join(','))
            .join('\n');
    
        const filteredCsvData = filter_csv(csvData, titleQuery, yearQuery, genreQuery, ratingQuery, directorQuery, writerQuery, actorQuery, languageQuery, countryQuery);
    
        filteredData = filteredCsvData
            .split('\n')
            .filter(row => row.trim())
            .map(row => row.split(','))
            .filter(row => 
                (!titleQuery || row[1].toLowerCase().includes(titleQuery.toLowerCase())) &&
                (!yearQuery || row[2].toLowerCase().includes(yearQuery)) &&
                (!genreQuery || row[7].toLowerCase().includes(genreQuery)) &&
                (!ratingQuery || row[4].toLowerCase().includes(ratingQuery)) &&
                (!directorQuery || row[9].toLowerCase().includes(directorQuery)) &&
                (!writerQuery || row[10].toLowerCase().includes(writerQuery)) &&
                (!actorQuery || row[11].toLowerCase().includes(actorQuery)) &&
                (!languageQuery || row[13].toLowerCase().includes(languageQuery)) &&
                (!countryQuery || row[14].toLowerCase().includes(countryQuery))

            );
    
        displayTable(filteredData);
    }
    

    function handleSort(columnIndex) {
        columnIndex++;
        sortOrder = (sortColumn === columnIndex && sortOrder === 'asc') ? 'desc' : 'asc';
        sortColumn = columnIndex;

        const csvData = filteredData.map(row => row.join(',')).join('\n');
        const sortedCsvData = sort_csv(csvData, columnIndex, sortOrder);

        filteredData = sortedCsvData.split('\n')
        .map(row => row.split(','));
        
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
            <tr>${row.slice(0,5).map((cell, index) => index === 0 ? `<td><img src="${escapeHtml(cell)}" alt="Image" class="img-cell"></td>` : `<td class="${index === 1 ? 'large-font' : ''}">${escapeHtml(cell)}</td>`).join('')}</tr>
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
