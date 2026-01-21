let people = [];
let deferredPrompt;

// Install prompt handling
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('installPrompt').classList.add('show');
});

function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted install');
            }
            deferredPrompt = null;
            document.getElementById('installPrompt').classList.remove('show');
        });
    }
}

function closeInstallPrompt() {
    document.getElementById('installPrompt').classList.remove('show');
}

// Offline detection
window.addEventListener('online', () => {
    document.getElementById('offlineIndicator').classList.remove('show');
    showMessage('Back online!', 'success');
});

window.addEventListener('offline', () => {
    document.getElementById('offlineIndicator').classList.add('show');
});

function loadData() {
    const stored = localStorage.getItem('birthdayData');
    if (stored) {
        people = JSON.parse(stored);
        displayPeople();
    }
}

function saveData() {
    localStorage.setItem('birthdayData', JSON.stringify(people));
}

function calculateAge(birthdate) {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function addPerson() {
    const nameInput = document.getElementById('name');
    const birthdateInput = document.getElementById('birthdate');
    
    const name = nameInput.value.trim();
    const birthdate = birthdateInput.value;
    
    if (!name || !birthdate) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    const person = {
        id: Date.now(),
        name: name,
        birthdate: birthdate
    };
    
    people.push(person);
    saveData();
    displayPeople();
    
    nameInput.value = '';
    birthdateInput.value = '';
    
    showMessage(`${name} added successfully!`, 'success');
}

function deletePerson(id) {
    if (confirm('Are you sure you want to delete this person?')) {
        people = people.filter(p => p.id !== id);
        saveData();
        displayPeople();
        showMessage('Person deleted', 'success');
    }
}

function displayPeople(filteredPeople = null) {
    const listContainer = document.getElementById('peopleList');
    const peopleToDisplay = filteredPeople !== null ? filteredPeople : people;
    
    if (peopleToDisplay.length === 0) {
        if (filteredPeople !== null) {
            listContainer.innerHTML = '<div class="no-results">No matching results found.</div>';
        } else {
            listContainer.innerHTML = '<div class="no-results">No birthdays saved yet. Add someone above!</div>';
        }
        return;
    }
    
    listContainer.innerHTML = peopleToDisplay.map(person => {
        const age = calculateAge(person.birthdate);
        const formattedDate = formatDate(person.birthdate);
        
        return `
            <div class="person-card">
                <div class="person-name">${person.name}</div>
                <div class="person-info">Birthday: ${formattedDate}</div>
                <div class="person-age">Current Age: ${age} years old</div>
                <button class="delete-btn" onclick="deletePerson(${person.id})">Delete</button>
            </div>
        `;
    }).join('');
}

function filterPeople() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    
    if (searchTerm === '') {
        displayPeople();
        return;
    }
    
    const filtered = people.filter(person => 
        person.name.toLowerCase().includes(searchTerm)
    );
    
    displayPeople(filtered);
}

function showMessage(text, type) {
    const messageArea = document.getElementById('messageArea');
    messageArea.innerHTML = `<div class="message ${type}">${text}</div>`;
    
    setTimeout(() => {
        messageArea.innerHTML = '';
    }, 3000);
}

loadData();
