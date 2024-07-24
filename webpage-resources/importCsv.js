// importCsv.js

document.getElementById('import').addEventListener('click', () => {
    document.getElementById('file-input').click();
});

document.getElementById('file-input').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const csvData = e.target.result;
            processCsvData(csvData); // Replace this with your function to handle CSV data
        };
        
        reader.readAsText(file);
    } else {
        alert('Please select a valid CSV file.');
    }
});

function processCsvData(csvData) {
    // Implement your CSV processing logic here
    // For example, you might want to parse it and display it in the table
    console.log(csvData);
    // Example: parse CSV data and display in table
}
