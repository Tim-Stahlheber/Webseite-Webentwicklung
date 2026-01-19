// Warten, bis das DOM vollständig geladen ist
document.addEventListener("DOMContentLoaded", () => {

    // Brechungsindices für Luft und Wasser
    const nLuft = 1.0;
    const nWasser = 1.33;

    // Setup für Brechung von Luft → Wasser (linkes Canvas)
    setupBrechung(
        "brechungCanvasLeft",    // Canvas-ID
        "angleInputLeft",        // Input für Einfallswinkel
        "angleValueLeft",        // Anzeige des aktuellen Winkels
        nLuft,                   // n1
        nWasser                  // n2
    );

    // Setup für Brechung von Wasser → Luft (rechtes Canvas)
    setupBrechung(
        "brechungCanvasRight",
        "angleInputRight",
        "angleValueRight",
        nWasser,
        nLuft
    );
});

// Funktion zum Setup eines einzelnen Brechungs-Canvas
function setupBrechung(canvasId, inputId, valueId, n1, n2) {

    // Referenzen auf Canvas und 2D-Kontext
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");

    // Referenzen auf Input und Anzeige des Winkels
    const angleInput = document.getElementById(inputId);
    const angleValue = document.getElementById(valueId);

    // Mittelpunkt des Canvas
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const rayLength = 180;    // Länge der Strahlen
    const angleRadius = 40;   // Radius für Winkelbögen

    // Initialer Wert des Inputs anzeigen und Szene zeichnen
    angleValue.textContent = angleInput.value;
    draw(Number(angleInput.value));

    // Eventlistener: aktualisiert Szene bei Änderung des Winkels
    angleInput.addEventListener("input", () => {
        angleValue.textContent = angleInput.value;
        draw(Number(angleInput.value));
    });

    // Funktion zum Zeichnen der gesamten Szene
    function draw(angleDeg) {

        // Canvas löschen
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // obere Hälfte: Medium 1 (hellblau)
        ctx.fillStyle = "#e6f4ff";
        ctx.fillRect(0, 0, canvas.width, cy);

        // untere Hälfte: Medium 2 (dunkleres Blau)
        ctx.fillStyle = "#cceeff";
        ctx.fillRect(0, cy, canvas.width, canvas.height - cy);

        // Grenzfläche zeichnen
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(canvas.width, cy);
        ctx.stroke();

        // Beschriftung der Grenzfläche
        ctx.fillStyle = "black";
        ctx.font = "14px Arial";
        ctx.fillText("Grenzfläche", 10, cy - 5);

        // Normale (Lot) zeichnen
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 150);
        ctx.lineTo(cx, cy + 150);
        ctx.stroke();

        // Beschriftung "Lot"
        ctx.fillStyle = "red";
        ctx.font = "14px Arial";
        ctx.fillText("Lot", cx + 6, cy - 130);

        // Umrechnung des Winkels in Radiant
        const rad = angleDeg * Math.PI / 180;

        // Startpunkt des einfallenden Strahls berechnen
        const x1 = cx - Math.sin(rad) * rayLength;
        const y1 = cy - Math.cos(rad) * rayLength;

        // Einfallender Strahl zeichnen (blau)
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(cx, cy);
        ctx.stroke();

        // Winkelbogen des einfallenden Strahls
        ctx.beginPath();
        ctx.arc(
            cx,
            cy,
            angleRadius,
            -Math.PI / 2 - rad,
            -Math.PI / 2,
            false
        );
        ctx.stroke();

        // Winkelbeschriftung einfallender Strahl
        ctx.fillStyle = "blue";
        ctx.fillText(
            `${angleDeg}°`,
            cx + Math.cos(-Math.PI / 2 - rad / 2) * (angleRadius + 10),
            cy + Math.sin(-Math.PI / 2 - rad / 2) * (angleRadius + 10)
        );

        // Brechung berechnen (Snelliussches Gesetz)
        const sinBeta = (n1 / n2) * Math.sin(rad);
        let totalreflexion = false;
        let rad2;

        // Prüfen auf Totalreflexion
        if (sinBeta > 1) {
            totalreflexion = true;
            ctx.fillStyle = "red";
            ctx.font = "14px Arial";
            ctx.fillText("Totalreflexion", cx + 10, cy + 25);
        } else {
            rad2 = Math.asin(sinBeta); // Brechungswinkel berechnen
        }

        // Reflektierter/gebrochener Strahl (nur wenn keine Totalreflexion)
        if (!totalreflexion) {
            const x2 = cx + Math.sin(rad2) * rayLength;
            const y2 = cy + Math.cos(rad2) * rayLength;

            // Gebrochener Strahl (orange)
            ctx.strokeStyle = "orange";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            // Winkelbogen für gebrochenen Strahl
            ctx.beginPath();
            ctx.arc(
                cx,
                cy,
                angleRadius,
                Math.PI / 2,
                Math.PI / 2 - rad2,
                true
            );
            ctx.stroke();

            // Beschriftung des Brechungswinkels
            ctx.fillStyle = "orange";
            ctx.fillText(
                `${Math.round(rad2 * 180 / Math.PI)}°`,
                cx + Math.cos(Math.PI / 2 - rad2 / 2) * (angleRadius + 12),
                cy + Math.sin(Math.PI / 2 - rad2 / 2) * (angleRadius + 12)
            );
        }

        // optischer Strahl für reflektiertes Licht (gestrichelt, Lichtweg visualisieren)
        const radRef = rad;
        ctx.strokeStyle = "lightblue";
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.sin(radRef) * rayLength, cy - Math.cos(radRef) * rayLength);
        ctx.stroke();
        ctx.setLineDash([]); // gestrichelte Linie zurücksetzen

        // Brechungsindices anzeigen
        ctx.fillStyle = "black";
        ctx.font = "14px Arial";
        ctx.fillText(`n₁ = ${n1}`, 10, 20);
        ctx.fillText(`n₂ = ${n2}`, 10, canvas.height - 10);
    }
}
