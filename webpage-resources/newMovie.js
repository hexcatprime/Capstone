// js/newMovie.js
import { run } from './loadCsv.js';

async function main() {
    try {
        const data = await run();
        console.log('Data received:', data);
    } catch (error) {
        console.error('Error in main:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const newMovieModal = document.getElementById('newMovieModal');
    const newMovieBtn = document.getElementById('new-movie');
    const closeNewMovieModal = document.getElementById('closeNewMovieModal');
    const newMovieForm = document.getElementById('new-movie-form');

    // open the new movie modal
    newMovieBtn.onclick = function() {
        newMovieModal.style.display = "block";
    }

    // close the new movie modal
    closeNewMovieModal.onclick = function() {
        newMovieModal.style.display = "none";
    }

    // close the new movie modal if clicking outside of it
    window.onclick = function(event) {
        if (event.target === newMovieModal) {
            newMovieModal.style.display = "none";
        }
    }

    // form submission for adding movie
    newMovieForm.onsubmit = async function(event) {
        event.preventDefault();
        const formData = new FormData(this);

        // if empty, N/A
        const newRow = [
            formData.get('poster') || 'N/A',
            formData.get('title') || 'N/A',
            formData.get('year') || 'N/A',
            formData.get('rated') || 'N/A',
            formData.get('runtime') || 'N/A',
            formData.get('imdb') || 'N/A',
            formData.get('rottenTomatoes') || 'N/A',
            formData.get('metacritic') || 'N/A',
            formData.get('released') || 'N/A',
            formData.get('genre') || 'N/A',
            formData.get('director') || 'N/A',
            formData.get('writer') || 'N/A',
            formData.get('actors') || 'N/A',
            formData.get('plot') || 'N/A',
            formData.get('language') || 'N/A',
            formData.get('country') || 'N/A',
            formData.get('awards') || 'N/A',
            formData.get('boxOffice') || 'N/A'
        ];

        // write to csv
        try {
            const response = await fetch('/append-csv', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ row: newRow })
            });

            if (response.ok) {
                alert('New movie added successfully.');
                newMovieModal.style.display = 'none';

                // Clear the form fields
                newMovieForm.reset();

                // Optionally, reload the CSV data
                await run();
            } else {
                alert('Failed to add new movie.');
            }
        } catch (error) {
            console.error('Error adding new movie:', error);
            alert('Error adding new movie.');
        }
    };
});
