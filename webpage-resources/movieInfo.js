export function showModal(row, deleteRowCallback) {
    const movieModal = document.getElementById('movieModal');
    const modalMovieDetails = document.getElementById('modalMovieDetails');

    const movieDetails = `
        <h2>${escapeHtml(row[1])}</h2>
        <p><strong>Plot:</strong> ${escapeHtml(row[13])}</p>
        <p><strong>Released:</strong> ${escapeHtml(row[8])}</p>
        <p><strong>Genre:</strong> ${escapeHtml(row[9])}</p>
        <p><strong>Rating:</strong> ${escapeHtml(row[3])}</p>
        <p><strong>Director:</strong> ${escapeHtml(row[10])}</p>
        <p><strong>Writer:</strong> ${escapeHtml(row[11])}</p>
        <p><strong>Actors:</strong> ${escapeHtml(row[12])}</p>
        <p><strong>Language:</strong> ${escapeHtml(row[14])}</p>
        <p><strong>Country:</strong> ${escapeHtml(row[15])}</p>
        <p><strong>Awards:</strong> ${escapeHtml(row[16])}</p>
        <p><strong>Box Office:</strong> ${escapeHtml(row[17])}</p>
    `;

    modalMovieDetails.innerHTML = movieDetails;
    movieModal.style.display = 'block';

    document.getElementById('delete-movie-btn').onclick = () => {
        deleteRowCallback(row);
    };
}

function escapeHtml(text) {
    const element = document.createElement('div');
    element.innerText = text;
    return element.innerHTML;
}
