/**
 * @file Interaktive Darstellung des Reflexionsgesetzes
 * @author Tim Stahlheber
 */

/**
 * Wird ausgeführt, sobald das DOM vollständig geladen ist
 */
document.addEventListener("DOMContentLoaded", () => {

    const canvas = document.getElementById("reflexionCanvas");
    const ctx = canvas.getContext("2d");
    const angleInput = document.getElementById("angleInput");
    const angleValue = document.getElementById("angleValue");

    /**
     * Mittelpunkt des Auftreffpunkts
     */
    const hitPoint = {
        x: canvas.width / 2,
        y: canvas.height / 2
    };

    /**
     * Zeichnet die gesamte Szene neu
     */
    function drawScene(angle) {
        clearCanvas();
        drawMirror();
        drawNormal();
        drawIncomingRay(angle);
        drawReflectedRay(angle);
        drawIncomingAngle(angle);
        drawReflectedAngle(angle);
    }

    /**
     * Weißer Hintergrund
     */
    function clearCanvas() {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    /**
     * Spiegel
     */
    function drawMirror() {
        ctx.strokeStyle = "black";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(50, hitPoint.y);
        ctx.lineTo(canvas.width - 50, hitPoint.y);
        ctx.stroke();
    }

    /**
     * Einfallslot (rot)
     */
    function drawNormal() {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(hitPoint.x, hitPoint.y - 150);
        ctx.lineTo(hitPoint.x, hitPoint.y + 150);
        ctx.stroke();
    }

    /**
     * Einfallender Strahl (blau)
     */
    function drawIncomingRay(angle) {
        const rad = angle * Math.PI / 180;
        const length = 200;

        const x = hitPoint.x - Math.sin(rad) * length;
        const y = hitPoint.y - Math.cos(rad) * length;

        ctx.strokeStyle = "blue";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(hitPoint.x, hitPoint.y);
        ctx.stroke();
    }

    /**
     * Reflektierter Strahl (grün)
     */
    function drawReflectedRay(angle) {
        const rad = angle * Math.PI / 180;
        const length = 200;

        const x = hitPoint.x + Math.sin(rad) * length;
        const y = hitPoint.y - Math.cos(rad) * length;

        ctx.strokeStyle = "green";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(hitPoint.x, hitPoint.y);
        ctx.lineTo(x, y);
        ctx.stroke();
    }

    /**
     * Einfallswinkel (grün) + Beschriftung
     */
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

        drawAngleLabel(
            angle,
            -Math.PI / 2 + rad / 2,
            radius + 15,
            "green"
        );
    }

    /**
     * Reflexionswinkel (blau) + Beschriftung
     */
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

        drawAngleLabel(
            angle,
            -Math.PI / 2 - rad / 2,
            radius + 15,
            "blue"
        );
    }

    /**
     * Zeichnet die Winkelbeschriftung (z. B. "45°")
     */
    function drawAngleLabel(angle, directionRad, distance, color) {
        const x = hitPoint.x + Math.cos(directionRad) * distance;
        const y = hitPoint.y + Math.sin(directionRad) * distance;

        ctx.fillStyle = color;
        ctx.font = "14px Arial";
        ctx.fillText(`${angle}°`, x - 8, y + 5);
    }

    /**
     * Slider-Interaktion
     */
    angleInput.addEventListener("input", () => {
        const angle = Number(angleInput.value);
        angleValue.textContent = angle;
        drawScene(angle);
    });

    // Initiale Zeichnung
    drawScene(Number(angleInput.value));
});
