let data = [];

fetch('/data/data.json')
.then(res => res.json())
.then(jsonData => {
    data = jsonData;

    const options = {
    keys: ['name', 'type'],
    threshold: 0.4,
    };

    const fuse = new Fuse(data, options);

    const searchInput = document.getElementById('search');
    const resultsContainer = document.getElementById('results');

    searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    resultsContainer.innerHTML = '';

    if (query === '') return;

    const results = fuse.search(query);

    if (results.length === 0) {
        const noResults = document.createElement('li');
        noResults.textContent = 'Nessun risultato trovato';
        noResults.classList.add('no-results');
        resultsContainer.appendChild(noResults);
        return;
    }

    results.forEach(({ item }) => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${item.link}">${item.name} <small>(${item.type})</small></a>`;
        resultsContainer.appendChild(li);
    });
    });
})
.catch(err => {
    console.error('Errore caricamento dati:', err);
    const resultsContainer = document.getElementById('results');
    const errorMsg = document.createElement('li');
    errorMsg.textContent = 'Impossibile caricare i dati.';
    errorMsg.classList.add('no-results');
    resultsContainer.appendChild(errorMsg);
});