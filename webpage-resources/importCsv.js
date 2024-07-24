// js/importCsv.js
import { run } from './loadCsv.js';

document.addEventListener('DOMContentLoaded', () => {
    const importCsvModal = document.getElementById('importCsvModal');
    const importCsvBtn = document.getElementById('import');
    const closeImportCsvModal = document.getElementById('closeImportCsvModal');
    const importCsvForm = document.getElementById('import-csv-form');

    // Open the modal
    importCsvBtn.addEventListener('click', () => {
        importCsvModal.style.display = 'block';
    });

    // Close the modal
    closeImportCsvModal.addEventListener('click', () => {
        importCsvModal.style.display = 'none';
    });

    // Close the modal when clicking outside of the modal content
    window.addEventListener('click', (event) => {
        if (event.target == importCsvModal) {
            importCsvModal.style.display = 'none';
        }
    });

    // Handle the form submission
    importCsvForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(importCsvForm);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert('CSV uploaded successfully!');
                importCsvModal.style.display = 'none';
                // Reload the CSV data
                run(); // Make sure fetchLatestCsv is accessible here
            } else {
                alert('Failed to upload CSV');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error uploading CSV');
        }
    });
});
