document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById("filterModal");
    const btn = document.getElementById("filter");
    const span = document.getElementById("close");
    const filterButton = document.getElementById("filter-btn");

    console.log(modal, btn, span, filterButton);
    // open the modal
    btn.onclick = function() {
        modal.style.display = "block";
    }

    // close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // close the modal if clicking outside of it
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }

    // apply the filter
    filterButton.onclick = function() {
        handleFilter();
        modal.style.display = "none";
    }
});
