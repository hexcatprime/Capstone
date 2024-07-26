import init, { filter_csv, sort_csv } from '../pkg/freakstone.js';

export async function run() {
    await init();

    const resultTable = document.getElementById('result');
    const sortByDropdown = document.getElementById('sort-by');
    const exportBtn = document.getElementById('export');
    const sortOrderDropdown = document.getElementById('sort-order');

    let csvRows = [], filteredData = [], headers = [];
    
    await fetchLatestCsv();

    document.getElementById('filter-btn').addEventListener('click', handleFilter);
    sortByDropdown.addEventListener('change', handleSort);
    sortOrderDropdown.addEventListener('change', handleSort);
    exportBtn.addEventListener('click', exportCsv);
    
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
                        : `<td>${escapeHtml(cell)}</td>`
                    )
                    .join('')
                }</tr>`
            )
            .join('');
            
        resultTable.innerHTML = data.length 
            ? `<thead><tr>${headerHtml}</tr></thead><tbody>${rowsHtml}</tbody>` 
            : '<tr><td colspan="100%">No results found.</td></tr>';
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
            if (field.includes('"')) {
                field = field.replace(/"/g, '""');
            }
            if (field.includes(',') || field.includes('\n') || field.includes('"')) {
                field = `"${field}"`;
            }
            return field;
        }
    
        const csvString = [
            headers.map(escapeCsvField).join(","),
            ...filteredData.map(row => row.map(escapeCsvField).join(","))
        ].join("\n");
    
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
    
        const a = document.createElement('a');
        a.href = url;
        a.download = 'latest.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    
        URL.revokeObjectURL(url);
    }
}    

run();
