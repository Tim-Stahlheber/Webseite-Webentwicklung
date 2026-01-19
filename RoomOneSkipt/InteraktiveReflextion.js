// Warten, bis das DOM vollständig geladen ist
document.addEventListener("DOMContentLoaded", () => {

    // Referenzen auf wichtige HTML-Elemente
    const canvas = document.getElementById("reflexionCanvas");  // Canvas für Zeichnung
    const ctx = canvas.getContext("2d");                        // 2D-Zeichenkontext
    const angleInput = document.getElementById("angleInput");   // Input für Einfallswinkel
    const angleValue = document.getElementById("angleValue");   // Anzeige des aktuellen Winkels

    // Punkt, an dem der Lichtstrahl auf den Spiegel trifft
    const hitPoint = {
        x: canvas.width / 2,
        y: canvas.height / 2
    };

    // Hauptfunktion zum Zeichnen der gesamten Szene abhängig vom Winkel 
    function drawScene(angle) {
        clearCanvas();                  // Canvas löschen
        drawMirror();                   // Spiegel zeichnen
        drawNormal();                   // Lot (Normalenlinie) zeichnen
        drawIncomingRay(angle);         // einfallender Strahl
        drawReflectedRay(angle);        // reflektierter Strahl
        drawIncomingAngle(angle);       // Winkel des einfallenden Strahls
        drawReflectedAngle(angle);      // Winkel des reflektierten Strahls
    }

    // Löscht das Canvas und füllt den Hintergrund weiß
    function clearCanvas() {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Zeichnet den Spiegel als horizontale Linie
    function drawMirror() {
        ctx.strokeStyle = "black";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(50, hitPoint.y);
        ctx.lineTo(canvas.width - 50, hitPoint.y);
        ctx.stroke();

        // Beschriftung "Spiegel"
        ctx.fillStyle = "black";
        ctx.font = "16px Arial";
        ctx.fillText("Spiegel", canvas.width - 100, hitPoint.y - 10);
    }

    // Zeichnet die Normale (Lot) senkrecht auf den Spiegel
    function drawNormal() {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(hitPoint.x, hitPoint.y - 150);
        ctx.lineTo(hitPoint.x, hitPoint.y + 150);
        ctx.stroke();

        // Beschriftung "Lot"
        ctx.fillStyle = "red";
        ctx.font = "16px Arial";
        ctx.fillText("Lot", hitPoint.x + 10, hitPoint.y - 140);
    }

    // Zeichnet den einfallenden Strahl abhängig vom Winkel
    function drawIncomingRay(angle) {
        const rad = angle * Math.PI / 180; // Umrechnung in Radiant
        const length = 200;

        const startX = hitPoint.x - Math.sin(rad) * length;
        const startY = hitPoint.y - Math.cos(rad) * length;

        ctx.strokeStyle = "blue";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(hitPoint.x, hitPoint.y);
        ctx.stroke();

        // Pfeil in der Mitte des Strahls
        drawArrowMid(startX, startY, hitPoint.x, hitPoint.y, "blue");
    }

    // Zeichnet den reflektierten Strahl abhängig vom Winkel
    function drawReflectedRay(angle) {
        const rad = angle * Math.PI / 180;
        const length = 200;

        const endX = hitPoint.x + Math.sin(rad) * length;
        const endY = hitPoint.y - Math.cos(rad) * length;

        ctx.strokeStyle = "green";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(hitPoint.x, hitPoint.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        drawArrowMid(hitPoint.x, hitPoint.y, endX, endY, "green");
    }

    // Zeichnet den Winkel des einfallenden Strahls
    function drawIncomingAngle(angle) {
        const rad = angle * Math.PI / 180;
        const radius = 50;

        ctx.strokeStyle = "green";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
            hitPoint.x,
            hitPoint.y,
            radius,
            -Math.PI / 2,
            -Math.PI / 2 + rad
        );
        ctx.stroke();

        drawAngleLabel(angle, -Math.PI / 2 + rad / 2, radius + 15, "green");
    }

    // Zeichnet den Winkel des reflektierten Strahls
    function drawReflectedAngle(angle) {
        const rad = angle * Math.PI / 180;
        const radius = 50;

        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
            hitPoint.x,
            hitPoint.y,
            radius,
            -Math.PI / 2 - rad,
            -Math.PI / 2
        );
        ctx.stroke();

        drawAngleLabel(angle, -Math.PI / 2 - rad / 2, radius + 15, "blue");
    }

    // Beschriftet die Winkel auf dem Canvas
    function drawAngleLabel(angle, directionRad, distance, color) {
        const x = hitPoint.x + Math.cos(directionRad) * distance;
        const y = hitPoint.y + Math.sin(directionRad) * distance;

        ctx.fillStyle = color;
        ctx.font = "14px Arial";
        ctx.fillText(`${angle}°`, x - 8, y + 5);
    }

    // Zeichnet einen Pfeil in der Mitte einer Linie
    function drawArrowMid(x1, y1, x2, y2, color) {
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        const angle = Math.atan2(y2 - y1, x2 - x1);
        const size = 18;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(midX, midY);
        ctx.lineTo(
            midX - size * Math.cos(angle - Math.PI / 6),
            midY - size * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            midX - size * Math.cos(angle + Math.PI / 6),
            midY - size * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
    }

    // Eventlistener für den Winkel-Input
    angleInput.addEventListener("input", () => {
        const angle = Number(angleInput.value);     // aktueller Winkel
        angleValue.textContent = angle;             // Anzeige aktualisieren
        drawScene(angle);                           // Szene neu zeichnen
    });

    // Zeichnet die Szene initial mit dem Startwert des Inputs
    drawScene(Number(angleInput.value));
});
