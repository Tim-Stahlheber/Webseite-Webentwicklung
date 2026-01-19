document.addEventListener("DOMContentLoaded", () => {

    const correctCode = "267"; 
    const input = document.getElementById("accessCode");
    const button = document.getElementById("accessButton");
    const gameSection = document.getElementById("finalGameSection");
    const errorText = document.getElementById("codeError");

    // Prüfen, ob der finale Raum bereits freigeschaltet ist (LocalStorage)
    if (localStorage.getItem("finalRoomUnlocked") === "true") {
        gameSection.style.display = "flex"; // Direkt anzeigen, keine Code-Abfrage mehr
        return;
    }

    // Funktion zur Überprüfung des eingegebenen Codes
    function checkAccess() {
        if (input.value === correctCode) {
            // Richtiger Code: finalen Raum anzeigen und Fehlermeldung verbergen
            gameSection.style.display = "flex";
            errorText.style.display = "none";

            // Status speichern, damit beim nächsten Laden der Raum freigeschaltet ist
            localStorage.setItem("finalRoomUnlocked", "true");
        } else {
            // Falscher Code: Fehlermeldung anzeigen
            errorText.style.display = "block";
        }
    }

    // Event: Klick auf den Button überprüft den Code
    button.addEventListener("click", checkAccess);

    // Event: Drücken der ENTER-Taste im Eingabefeld überprüft ebenfalls den Code
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            checkAccess();
        }
    });
});
