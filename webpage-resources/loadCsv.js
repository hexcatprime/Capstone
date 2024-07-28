import init, { filter_csv, sort_csv } from '../pkg/freakstone.js';
import { showModal } from './movieInfo.js';

export async function run() {
    await init();

    const resultTable = document.getElementById('result');
    const sortByDropdown = document.getElementById('sort-by');
    const exportBtn = document.getElementById('export');
    const sortOrderDropdown = document.getElementById('sort-order');
    const closeModal = document.getElementById('closeModal');
    const movieModal = document.getElementById('movieModal');

    let csvRows = [], filteredData = [], headers = [];
    
    await fetchLatestCsv();

    document.getElementById('filter-btn').addEventListener('click', handleFilter);
    sortByDropdown.addEventListener('change', handleSort);
    sortOrderDropdown.addEventListener('change', handleSort);
    exportBtn.addEventListener('click', exportCsv);

    closeModal.addEventListener('click', () => {
        movieModal.style.display = 'none';
    });
    
    // Close the modal if user clicks outside of it
    window.addEventListener('click', (event) => {
        if (event.target === movieModal) {
            movieModal.style.display = 'none';
        }
    });
    
    async function fetchLatestCsv() {
        try {
            const response = await fetch('/latest-csv');
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            const filePath = await response.text();
    
            if (!filePath.includes('latest.csv')) {
                throw new Error('File path is not correct.');
            }
    
            await loadCsv(filePath);
        } catch (error) {
            displayError("Error fetching latest CSV.");
        }
    }

    async function loadCsv(filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            const csvData = await response.text();
            processCsvData(csvData);
        } catch (error) {
            displayError("Error loading CSV data.");
        }
    }

    function processCsvData(csvData) {
        const rows = [];
        let row = [];
        let field = '';
        let inQuotes = false;
    
        function finalizeField() {
            if (field !== '') {
                row.push(field.replace(/""/g, '"'));
                field = '';
            }   
        }   
    
        for (let i = 0; i < csvData.length; i++) {
            const char = csvData[i];
    
            if (char === '"') {
                if (inQuotes && csvData[i + 1] === '"') {
                    field += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                finalizeField();
            } else if (char === '\n' || char === '\r') {
                finalizeField();
                rows.push(row);
                row = [];
                if (char === '\r' && csvData[i + 1] === '\n') {
                    i++;
                }
            } else {
                field += char;
            }
        }
    
        finalizeField();
        if (row.length > 0) {
            rows.push(row);
        }
    
        if (rows.length === 0) {
            return;
        }
    
        const [headerRow, ...dataRows] = rows;
        headers = headerRow;
        csvRows = dataRows;
        filteredData = csvRows;
    
        displayTable(filteredData);
    }

    async function handleFilter() {
        const titleQuery = document.getElementById('title-filter').value.trim().toLowerCase();
        const yearQuery = document.getElementById('year-filter').value.trim().toLowerCase();
        const genreQuery = document.getElementById('genre-filter').value.trim().toLowerCase();
        const ratingQuery = document.getElementById('rating-filter').value.trim().toLowerCase();
        const directorQuery = document.getElementById('director-filter').value.trim().toLowerCase();
        const writerQuery = document.getElementById('writer-filter').value.trim().toLowerCase();
        const actorQuery = document.getElementById('actor-filter').value.trim().toLowerCase();
        const languageQuery = document.getElementById('language-filter').value.trim().toLowerCase();
        const countryQuery = document.getElementById('country-filter').value.trim().toLowerCase();
        
        if (!titleQuery && !yearQuery && !genreQuery && !ratingQuery && !directorQuery && !writerQuery && !actorQuery && !languageQuery && !countryQuery) {
            filteredData = csvRows;
            displayTable(filteredData);
            return;
        }
    
        filteredData = csvRows.filter(row => 
            (!titleQuery || (row[1] && row[1].toLowerCase().includes(titleQuery))) &&
            (!yearQuery || (row[2] && row[2].toLowerCase().includes(yearQuery))) &&
            (!genreQuery || (row[9] && row[9].toLowerCase().includes(genreQuery))) &&
            (!ratingQuery || (row[3] && row[3].toLowerCase().includes(ratingQuery))) &&
            (!directorQuery || (row[10] && row[10].toLowerCase().includes(directorQuery))) &&
            (!writerQuery || (row[11] && row[11].toLowerCase().includes(writerQuery))) &&
            (!actorQuery || (row[12] && row[12].toLowerCase().includes(actorQuery))) &&
            (!languageQuery || (row[14] && row[14].toLowerCase().includes(languageQuery))) &&
            (!countryQuery || (row[15] && row[15].toLowerCase().includes(countryQuery)))
        );
    
        displayTable(filteredData);
    }
    
    async function handleSort() {
        const sortColumn = parseInt(sortByDropdown.value);
        const sortOrder = sortOrderDropdown.value;
    
        const csvString = [
            headers.join(","), 
            ...filteredData.map(row => row.join(","))
        ].join("\n");
    
        try {
            const sortedCsv = sort_csv(csvString, sortColumn, sortOrder);
            processCsvData(sortedCsv);
        } catch (error) {
            displayError("Error sorting CSV data.");
        }
    }

    function displayTable(data) {
        const numColumnsToShow = 8;

        const headerHtml = headers
            .slice(0, numColumnsToShow)
            .map(header => `<th>${header}</th>`)
            .join('');

        const rowsHtml = data
            .map(row => 
                `<tr>${
                    row.slice(0, numColumnsToShow)
                    .map((cell, index) => 
                        index === 0 
                        ? `<td><img src="${escapeHtml(cell)}" alt="Image" class="img-cell"></td>`
                        : index === 1 
                        ? `<td class="clickable-title" data-row='${escapeHtml(JSON.stringify(row).replace(/'/g, "&#39;"))}'>${escapeHtml(cell)}</td>`
                        : `<td>${escapeHtml(cell)}</td>`
                    )
                    .join('')
                }</tr>`
            )
            .join('');

        resultTable.innerHTML = data.length 
            ? `<thead><tr>${headerHtml}</tr></thead><tbody>${rowsHtml}</tbody>` 
            : '<tr><td colspan="100%">No results found.</td></tr>';

        document.querySelectorAll('.clickable-title').forEach(titleCell => {
            titleCell.addEventListener('click', (event) => {
                try {
                    const jsonData = event.target.dataset.row;
                    console.log("JSON Data:", jsonData);
                    const row = JSON.parse(jsonData);
                    showModal(row, deleteRow);
                } catch (error) {
                    console.error("Error parsing JSON data:", error);
                    displayError("Error displaying movie details.");
                }
            });
        });
    }
    
    function escapeHtml(text) {
        const element = document.createElement('div');
        element.innerText = text;
        return element.innerHTML;
    }

    function displayError(message) {
        resultTable.innerHTML = `<tr><td colspan='100%'>${message}</td></tr>`;
    }

    function exportCsv() {
        function escapeCsvField(field) {
            field = field.replace(/"/g, '""'); // Escape any existing double quotes
            return `"${field}"`; // Wrap the field in double quotes
        }
    
        const csvString = [
            headers.map(escapeCsvField).join(","),
            ...filteredData.map(row => row.map(escapeCsvField).join(","))
        ].join("\n");
    
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'filtered_movies.csv';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click(); // Trigger the download
        document.body.removeChild(link);
    }
    

    function deleteRow(row) {
        fetch('/delete-movie', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ row })
        })
        .then(response => response.text())
        .then(message => {
            if (message === 'Movie deleted successfully.') {
                const rowIndex = csvRows.findIndex(csvRow => JSON.stringify(csvRow) === JSON.stringify(row));
                if (rowIndex !== -1) {
                    csvRows.splice(rowIndex, 1);
                    filteredData = csvRows;
                    displayTable(filteredData);
                }
                movieModal.style.display = 'none';
            } else {
                displayError(message);
            }
        })
        .catch(error => {
            displayError('Error deleting movie.');
        });
        fetchLatestCsv();
    }
}

run();
