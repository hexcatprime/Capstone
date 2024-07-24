// modal.js

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById("filterModal");
    const btn = document.getElementById("filter");
    const span = document.getElementsByClassName("close")[0];
    const filterButton = document.getElementById("filter-btn");

    // Open the modal
    btn.onclick = function() {
        modal.style.display = "block";
    }

    // Close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // Close the modal if clicking outside of it
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }

    // Apply the filter when clicking the button in the modal
    filterButton.onclick = function() {
        handleFilter(); // Ensure this function is available
        modal.style.display = "none";
    }
});
    