import init, { process_csv } from '../pkg/freakstone.js';
    
        async function loadWasm() {
            await init();
    
            document.getElementById('loadCsv').addEventListener('click', async () => {
                try {
                    const response = await fetch("../csv/convertcsv.csv");
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const csvData = await response.text();
                    const rows = process_csv(csvData);
                    displayCsvContents(rows);
                } catch (error) {
                    console.error('There was a problem with the fetch operation:', error);
                }
            });
        }
    
        function displayCsvContents(rows) {
            const tableHead = document.getElementById('table-head');
            const tableBody = document.getElementById('table-body');
            tableHead.innerHTML = '';
            tableBody.innerHTML = '';
    
            if (rows.length > 0) {
                const headerRow = document.createElement('tr');
                rows[0].fields.forEach(field => {
                    const th = document.createElement('th');
                    th.textContent = field;
                    headerRow.appendChild(th);
                });
                tableHead.appendChild(headerRow);
    
                rows.forEach((row) => {
                    const tr = document.createElement('tr');
                    row.fields.forEach(field => {
                        const td = document.createElement('td');
                        td.textContent = field;
                        tr.appendChild(td);
                    });
                    tableBody.appendChild(tr);
                });
            }
        }
    
        loadWasm();