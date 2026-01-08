// =======================================
// Interaktive Lichtbrechung – Luft & Wasser mit Reflexion
// =======================================

document.addEventListener("DOMContentLoaded", () => {

    const nLuft = 1.0;
    const nWasser = 1.33;

    // Luft → Wasser
    setupBrechung(
        "brechungCanvasLeft",
        "angleInputLeft",
        "angleValueLeft",
        nLuft,
        nWasser
    );

    // Wasser → Luft
    setupBrechung(
        "brechungCanvasRight",
        "angleInputRight",
        "angleValueRight",
        nWasser,
        nLuft
    );
});

function setupBrechung(canvasId, inputId, valueId, n1, n2) {

    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");

    const angleInput = document.getElementById(inputId);
    const angleValue = document.getElementById(valueId);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const rayLength = 180;
    const angleRadius = 40;

    angleValue.textContent = angleInput.value;
    draw(Number(angleInput.value));

    angleInput.addEventListener("input", () => {
        angleValue.textContent = angleInput.value;
        draw(Number(angleInput.value));
    });

    function draw(angleDeg) {

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // ===================
        // Medien-Hintergrund
        // ===================
        ctx.fillStyle = "#e6f4ff"; // oberes Medium
        ctx.fillRect(0, 0, canvas.width, cy);

        ctx.fillStyle = "#cceeff"; // unteres Medium
        ctx.fillRect(0, cy, canvas.width, canvas.height - cy);

        // Grenzfläche
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(canvas.width, cy);
        ctx.stroke();

        // =========
        // Lot
        // =========
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 150);
        ctx.lineTo(cx, cy + 150);
        ctx.stroke();

        ctx.fillStyle = "red";
        ctx.font = "14px Arial";
        ctx.fillText("Lot", cx + 6, cy - 130);

        // ===================
        // Einfallender Strahl (dunkelblau)
        // ===================
        const rad = angleDeg * Math.PI / 180;

        const x1 = cx - Math.sin(rad) * rayLength;
        const y1 = cy - Math.cos(rad) * rayLength;

        ctx.strokeStyle = "blue";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(cx, cy);
        ctx.stroke();

        // Einfallswinkel (dunkelblau)
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

        ctx.fillStyle = "blue";
        ctx.fillText(
            `${angleDeg}°`,
            cx + Math.cos(-Math.PI / 2 - rad / 2) * (angleRadius + 10),
            cy + Math.sin(-Math.PI / 2 - rad / 2) * (angleRadius + 10)
        );

        // ===================
        // Snellius
        // ===================
        const sinBeta = (n1 / n2) * Math.sin(rad);
        let totalreflexion = false;
        let rad2;

        if (sinBeta > 1) {
            totalreflexion = true;
            ctx.fillStyle = "red";
            ctx.font = "14px Arial";
            ctx.fillText("Totalreflexion", cx + 10, cy + 25);
        } else {
            rad2 = Math.asin(sinBeta);
        }

        // ===================
        // Gebrochener Strahl (orange)
        // ===================
        if (!totalreflexion) {
            const x2 = cx + Math.sin(rad2) * rayLength;
            const y2 = cy + Math.cos(rad2) * rayLength;

            ctx.strokeStyle = "orange";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            // Brechungswinkel (orange)
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

            ctx.fillStyle = "orange";
            ctx.fillText(
                `${Math.round(rad2 * 180 / Math.PI)}°`,
                cx + Math.cos(Math.PI / 2 - rad2 / 2) * (angleRadius + 12),
                cy + Math.sin(Math.PI / 2 - rad2 / 2) * (angleRadius + 12)
            );
        }

        // ===================
        // Reflexionsstrahl (hellblau)
        // ===================
        const radRef = rad; // Reflexion = Einfallswinkel
        ctx.strokeStyle = "lightblue";
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 3]); // gestrichelter Strahl
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.sin(radRef) * rayLength, cy - Math.cos(radRef) * rayLength);
        ctx.stroke();
        ctx.setLineDash([]); // gestrichelte Linie zurücksetzen

        // **Keine Winkelanzeige für hellblauen Reflexionsstrahl**

        // ===================
        // Medien-Beschriftung
        // ===================
        ctx.fillStyle = "black";
        ctx.font = "14px Arial";
        ctx.fillText(`n₁ = ${n1}`, 10, 20);
        ctx.fillText(`n₂ = ${n2}`, 10, canvas.height - 10);
    }
}
