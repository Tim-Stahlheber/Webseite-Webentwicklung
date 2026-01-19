// Alle Elemente mit der Klasse "accordion" auswählen und in einer HTMLCollection speichern
let acc = document.getElementsByClassName("accordion");

// Über jedes Accordion-Element iterieren
for (let i = 0; i < acc.length; i++) {
    
    // Event-Listener hinzufügen: reagiert auf Klicks auf das Accordion
    acc[i].addEventListener("click", function() {
        
        // Toggle-Klasse "active" am geklickten Accordion
        // -> verändert z.B. die Hintergrundfarbe oder Schriftfarbe beim Öffnen/Schließen
        this.classList.toggle("active");
        
        // Das nächste Geschwisterelement nach dem Accordion auswählen
        // In der Regel ist das das Panel mit dem Inhalt des Accordions
        let panel = this.nextElementSibling;
        
        // Toggle-Klasse "open" beim Panel
        // -> zeigt den Inhalt an oder versteckt ihn, je nachdem ob das Panel geöffnet oder geschlossen wird
        panel.classList.toggle("open");
    });
}
