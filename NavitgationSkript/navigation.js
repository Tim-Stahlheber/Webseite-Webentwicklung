/**
 * @file alle JavaScript Funktionen zur Nutzung der Navigationsleiste 
 * @author Tim Stahlheber
 */


/**
 * HTMLElement für das <details>-Element, das den Button enthält
 * @type {HTMLElement}
 */
const navToggle = document.getElementById('nav-toggle');

/**
 * HTMLElement für die Navigation <ul>
 * @type {HTMLElement}
 */
const navList = document.getElementById('navlist');

/**
 * HTMLElement für das <summary>-Element innerhalb von <details>
 * Dieses Element fungiert als sichtbarer Button (☰)
 * @type {HTMLElement}
 */
const summary = navToggle.querySelector('summary');


/**
 * Initialisiert die Navigationsleiste beim Laden der Seite
 * Zeigt oder versteckt die Navigation basierend auf dem im Session Storage gespeicherten Status
 * @function
 * @name initializeNavState
 */
window.addEventListener('load', () => {
    // Status aus Session Storage auslesen
    // "true" bedeutet: Navigation geschlossen
    const navClosed = sessionStorage.getItem('navClosed') === 'true';

    // Navigation entsprechend anzeigen oder verstecken
    navList.style.display = navClosed ? 'none' : 'flex';

    // <details> entsprechend öffnen oder schließen
    if (!navClosed) {
        navToggle.setAttribute('open', '');
    } else {
        navToggle.removeAttribute('open');
    }
});


/**
 * Fügt Event Listener auf das Summary-Element hinzu
 * @function
 * @name toggleNavOnClick
 * @description
 * Bei Klick auf das Symbol(☰) wird die Navigation ein- oder ausgeblendet.
 * Der Zustand wird anschließend im Session Storage gespeichert.
 */
summary.addEventListener('click', (e) => {
    // Kurze Verzögerung (0ms), um sicherzustellen, dass <details> bereits geöffnet/geschlossen ist
    setTimeout(() => {
        // Prüfen, ob <details> aktuell geöffnet ist
        const isOpen = navToggle.hasAttribute('open');

        // Navigation anzeigen, wenn <details> geöffnet, ansonsten verstecken
        navList.style.display = isOpen ? 'flex' : 'none';

        // Status in Session Storage speichern
        // true = geschlossen, false = offen
        sessionStorage.setItem('navClosed', (!isOpen).toString());
    }, 0);
});