// Fügt Hover-Effekte für alle Navigations-Items hinzu

document.querySelectorAll('.navitem').forEach(function(item) { 
    
    // Vergrößert das Icon beim Mouseover
    item.addEventListener('mouseover', function() {
        const img = this.querySelector('img'); 
        if (img) {
            img.style.transform = 'scale(1.3)';
        }
    });

    // Setzt die Größe des Icons beim Mouseout zurück
    item.addEventListener('mouseout', function() {
        const img = this.querySelector('img'); 
        if (img) {
            img.style.transform = 'scale(1)';
        }
    });
});

// Referenzen auf wichtige Navigationselemente
const navToggle = document.getElementById('nav-toggle');    // <details> Element
const navList = document.getElementById('navlist');         // <ul> mit den Links
const summary = navToggle.querySelector('summary');         // sichtbarer Button ☰

// Initialisiert den Status der Navigation beim Laden der Seite
window.addEventListener('load', () => {
    const navClosed = sessionStorage.getItem('navClosed') === 'true'; // gespeicherter Zustand

    // Navigation anzeigen oder verstecken
    navList.style.display = navClosed ? 'none' : 'flex';

    // <details> öffnen oder schließen entsprechend dem gespeicherten Zustand
    if (!navClosed) {
        navToggle.setAttribute('open', '');
    } else {
        navToggle.removeAttribute('open');
    }
});

// Klick auf das Hamburger-Icon (☰) toggelt die Navigation
summary.addEventListener('click', (e) => {
    // Verzögerung 0ms, um sicherzustellen, dass <details> seinen Status aktualisiert hat
    setTimeout(() => {
        const isOpen = navToggle.hasAttribute('open'); // prüft, ob geöffnet

        // Navigation ein- oder ausblenden
        navList.style.display = isOpen ? 'flex' : 'none';

        // aktuellen Zustand im Session Storage speichern
        sessionStorage.setItem('navClosed', (!isOpen).toString());
    }, 0);
});
