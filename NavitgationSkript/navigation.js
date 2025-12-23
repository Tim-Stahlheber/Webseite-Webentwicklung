/**
 * @file alle JavaScript Funktionen zur Nutzung der Navigationsleiste 
 * @author Tim Stahlheber
 */


/**
 * Fügt Eventlistener für die li Elementer der Navbar hinzu
 * Das Icon wird beim Hover in der Navigationsleiste um 1.3 vergrößert.
 * @function
 * @param {HTMLElement} item - das komplette li Element der Navigationsleiste mit child
 * @description verwendete Variablen
 * {HTMLElement} img - das jeweilige img aus dem gerade iterierten `item`
 * 
 * @this {HTMLElement} - in diesem Kontext das li Element
 * 
 * querySelectorAll nach https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Locating_DOM_elements_using_selectors
 */ 
document.querySelectorAll('.navitem').forEach(function(item) { 
    item.addEventListener('mouseover', function() {
        const img = this.querySelector('img'); 
        if (img) {
            img.style.transform = 'scale(1.3)';
        }
    });

    item.addEventListener('mouseout', function() {
        const img = this.querySelector('img'); 
        if (img) {
            img.style.transform = 'scale(1)';
        }
    });
});


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