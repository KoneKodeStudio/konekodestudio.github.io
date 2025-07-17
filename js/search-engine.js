let data = [];

fetch('/data/data.json')
    .then(res => res.json())
    .then(jsonData => {
        data = jsonData;

        const options = {
            keys : [ 'name', 'type' ],
            threshold : 0,
        };

        const fuse = new Fuse(data, options);

        const searchInput = document.getElementById('search');
        const resultsContainer = document.getElementById('results');

        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim() === '') {
                resultsContainer.innerHTML = '';
                loadHistory();
            }
        });

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim();
            resultsContainer.innerHTML = '';

            if (query === '') {
                loadHistory();
                return;
            }

            const results = fuse.search(query);

            if (results.length === 0) {
                const noResults = document.createElement('li');
                noResults.textContent = 'Nessun risultato trovato';
                noResults.classList.add('no-results');
                resultsContainer.appendChild(noResults);
                return;
            }

            results.forEach(({item}) => {
                const li = document.createElement('li');
                const link = document.createElement('a');
                link.href = item.link;
                link.innerHTML = `${item.name} <small>(${item.type})</small>`;

                link.addEventListener('click', () => { saveToHistory(item); });

                li.appendChild(link);
                resultsContainer.appendChild(li);
            });
        });

        document.addEventListener('click', (event) => {
            const isClickInsideSearch = searchInput.contains(event.target);
            const isClickInsideResults = resultsContainer.contains(event.target);

            if (!isClickInsideSearch && !isClickInsideResults) {
                resultsContainer.innerHTML = ''; // nascondi lista risultati/cronologia
            }
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

function saveToHistory(item) {
    const historyKey = 'searchHistory';
    let history = JSON.parse(localStorage.getItem(historyKey)) || [];

    history = history.filter(entry => entry.link !== item.link);

    history.unshift(item);

    if (history.length > 10)
        history = history.slice(0, 10);

    localStorage.setItem(historyKey, JSON.stringify(history));
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    const resultsContainer = document.getElementById('results');

    resultsContainer.innerHTML = '';

    if (history.length === 0) {
        resultsContainer.innerHTML = '<li class="no-results">Nessuna cronologia disponibile</li>';
        return;
    }

    history.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML =
            `<a href="${item.link}"><i class="bx bx-history"></i> ${item.name} <small>(${item.type})</small></a>`;
        resultsContainer.appendChild(li);
    });
}

function clearHistory() {
    localStorage.removeItem('searchHistory');
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '<li class="no-results">Cronologia cancellata</li>';
}

const searchInput = document.getElementById('search');
const resultsList = document.getElementById('results');

let currentFocus = -1;

searchInput.addEventListener('keydown', function(e) {
    const items = resultsList.getElementsByTagName('li');

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        currentFocus++;
        addActive(items);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        currentFocus--;
        addActive(items);
    } else if (e.key === 'Tab') {
        e.preventDefault();
        currentFocus++;
        addActive(items);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (currentFocus > -1) {
            const selected = resultsList.getElementsByTagName('li')[currentFocus];
            const link = selected.querySelector('a');
            if (link) {
                link.click();
            }
        }
    }
});

function addActive(items) {
    if (!items)
        return;
    removeActive(items);
    if (currentFocus >= items.length)
        currentFocus = 0;
    if (currentFocus < 0)
        currentFocus = items.length - 1;
    items[currentFocus].classList.add('highlighted');
    items[currentFocus].scrollIntoView({block : "nearest"});
}

function removeActive(items) {
    for (let i = 0; i < items.length; i++) {
        items[i].classList.remove('highlighted');
    }
}