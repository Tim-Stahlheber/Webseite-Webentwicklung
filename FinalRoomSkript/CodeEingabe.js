document.addEventListener("DOMContentLoaded", () => {

    const correctCode = "267"; // Code

    const input = document.getElementById("accessCode");
    const button = document.getElementById("accessButton");
    const gameSection = document.getElementById("finalGameSection");
    const errorText = document.getElementById("codeError");

    // Bereits freigeschaltet?
    if (localStorage.getItem("finalRoomUnlocked") === "true") {
        gameSection.style.display = "flex";
        return; // keine Code-Abfrage mehr nötig
    }

    function checkAccess() {
        if (input.value === correctCode) {
            // freischalten
            gameSection.style.display = "flex";
            errorText.style.display = "none";

            // merken
            localStorage.setItem("finalRoomUnlocked", "true");
        } else {
            errorText.style.display = "block";
        }
    }

    button.addEventListener("click", checkAccess);

    // ENTER-Taste
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            checkAccess();
        }
    });
});
