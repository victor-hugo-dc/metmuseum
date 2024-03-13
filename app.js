document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('search-input');
    const searchForm = document.getElementById('search-form');
    const searchButton = document.getElementById('search-button');
    const artworksGrid = document.getElementById('artworks-grid');
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');

    function fetchArtworks(query) {
        return fetch(`https://collectionapi.metmuseum.org/public/collection/v1/search?q=${query}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const limitedObjectIDs = data.objectIDs.slice(0, 30);
                return limitedObjectIDs;
            })
            .catch(error => {
                console.error(error);
                throw error;
            });
    }

    function fetchArtworkDetails(objectID) {
        return fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectID}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .catch(error => {
                console.error(error);
                throw error;
            });
    }

    async function displayArtworks(query) {
        const objectIDs = await fetchArtworks(query);
        artworksGrid.innerHTML = '';
        objectIDs.forEach(async objectID => {
            const artworkDetails = await fetchArtworkDetails(objectID);
            if (artworkDetails.primaryImageSmall) {
                const artworkImage = artworkDetails.primaryImageSmall;
                const artworkTitle = artworkDetails.title;

                const artworkElement = document.createElement('div');
                artworkElement.innerHTML = `
                <div class="card">
                    <img src="${artworkImage}" class="card-img-top" alt="${artworkTitle}">
                    <div class="card-body">
                        <h5 class="card-title">${artworkTitle}</h5>
                        <button class="btn btn-primary btn-sm view-details-btn" data-artwork-id="${objectID}">View Details</button>
                    </div>
                </div>
            `;
                artworksGrid.appendChild(artworkElement);
            }
        });
    }

    async function displayModal(objectID) {
        const artworkDetails = await fetchArtworkDetails(objectID);
        modalBody.innerHTML = `
            <img src="${artworkDetails.primaryImage}" class="img-fluid mb-2" alt="${artworkDetails.title}">
            <p><strong>Artist:</strong> ${artworkDetails.artistDisplayName}</p>
            <p><strong>Medium:</strong> ${artworkDetails.medium}</p>
            <p><strong>Dimensions:</strong> ${artworkDetails.dimensions}</p>
            <p><strong>Department:</strong> ${artworkDetails.department}</p>
            <p><a href="${artworkDetails.objectURL}" target="_blank">More Info</a></p>
        `;
        modal.style.display = 'block';
    }

    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        performSearch();
    });

    searchButton.addEventListener('click', function (event) {
        event.preventDefault();
        performSearch();
    });

    function performSearch() {
        const query = searchInput.value.trim();
        if (query !== '') {
            displayArtworks(query);
        } else {
            artworksGrid.innerHTML = '';
        }
    }

    modal.addEventListener('click', function (event) {
        if (event.target && event.target.classList.contains('close')) {
            modal.style.display = 'none';
        }
    });

    artworksGrid.addEventListener('click', function (event) {
        if (event.target && event.target.classList.contains('view-details-btn')) {
            const objectID = event.target.getAttribute('data-artwork-id');
            displayModal(objectID);
        }
    });
});
