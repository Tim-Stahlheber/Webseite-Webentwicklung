document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const winNotification = document.getElementById("winNotification");

    // Speichert die aktuellen Werte für jedes Licht
    const lightValues = {
        rgb1: { r: 0, g: 0, b: 0 },
        rgb2: { r: 0, g: 0, b: 0 },
        cmy1: { c: 0, m: 0, y: 0 },
        cmy2: { c: 0, m: 0, y: 0 }
    };

    // =====================
    // Target Colors
    // =====================
    const targets = [
        { id: "rgb1", x: 150, y: 220, type: "rgb", target: { r: 100, g: 0, b: 100 }, name: "RGB 1: Magenta" },        // Magenta
        { id: "rgb2", x: 350, y: 220, type: "rgb", target: { r: 0, g: 100, b: 100 }, name: "RGB 2: Cyan" },           // Cyan
        { id: "cmy1", x: 650, y: 220, type: "cmy", target: { c: 100, m: 100, y: 0 }, name: "CMY 1: Blau" },          // Blau
        { id: "cmy2", x: 850, y: 220, type: "cmy", target: { c: 0, m: 100, y: 100 }, name: "CMY 2: Rot" }             // Rot
    ];

    let allCorrect = false;
    let lastCorrectState = false;

    // =====================
    // Helper Functions
    // =====================
    function rgbToHex(r, g, b) {
        // Konvertiere von 0-100 zu 0-255
        const r255 = Math.round(r * 255 / 100);
        const g255 = Math.round(g * 255 / 100);
        const b255 = Math.round(b * 255 / 100);
        return "#" + [r255, g255, b255].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }).join('').toUpperCase();
    }

    function cmyToHex(c, m, y) {
        // CMY direkt zu Hex (0-100 zu #RRGGBB)
        const r255 = Math.round((1 - c / 100) * 255);
        const g255 = Math.round((1 - m / 100) * 255);
        const b255 = Math.round((1 - y / 100) * 255);
        return "#" + [r255, g255, b255].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }).join('').toUpperCase();
    }

    function cmyToRgb100(c, m, y) {
        // CMY zu RGB (0-100 zu 0-100) für colorDistance
        const r = Math.round((1 - c / 100) * 100);
        const g = Math.round((1 - m / 100) * 100);
        const b = Math.round((1 - y / 100) * 100);
        return { r, g, b };
    }



    function colorDistance(color1, color2) {
        // Berechnet die Farbe Distanz zwischen zwei RGB Farben (0-100 Skala)
        const r1 = Math.round(color1.r * 255 / 100);
        const g1 = Math.round(color1.g * 255 / 100);
        const b1 = Math.round(color1.b * 255 / 100);
        
        const r2 = Math.round(color2.r * 255 / 100);
        const g2 = Math.round(color2.g * 255 / 100);
        const b2 = Math.round(color2.b * 255 / 100);

        const dr = r1 - r2;
        const dg = g1 - g2;
        const db = b1 - b2;
        return Math.sqrt(dr * dr + dg * dg + db * db);
    }

    function isColorCorrect(distance) {
        return distance < 30; // Toleranz
    }

    // =====================
    // Get Current Colors
    // =====================
    function getCurrentColor(target) {
        if (target.type === "rgb") {
            const values = lightValues[target.id];
            return {
                r: values.r,
                g: values.g,
                b: values.b
            };
        } else { // cmy
            const values = lightValues[target.id];
            // CMY zu RGB (0-100) für colorDistance
            return cmyToRgb100(values.c, values.m, values.y);
        }
    }

    // =====================
    // Draw Light
    // =====================
    function drawLight(x, y, target) {
        // Bestimme die Hex-Farbe basierend auf Typ (RGB oder CMY)
        let hexColor;
        if (target.type === "rgb") {
            const values = lightValues[target.id];
            hexColor = rgbToHex(values.r, values.g, values.b);
        } else { // cmy
            const values = lightValues[target.id];
            hexColor = cmyToHex(values.c, values.m, values.y);
        }
        
        const size = 80;
        ctx.fillStyle = hexColor;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        // Klarer schwarzer Rahmen
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.stroke();
    }

    // =====================
    // Draw Indicator
    // =====================
    function drawIndicator(x, y, isCorrect, targetName) {
        const indicator = isCorrect ? "✓" : "✗";
        const color = isCorrect ? "#00FF00" : "#FF0000";
        
        ctx.fillStyle = color;
        ctx.font = "bold 30px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(indicator, x, y + 110);

        // Target Name
        ctx.fillStyle = "#ffffff";
        ctx.font = "14px Arial";
        ctx.fillText(targetName, x, y + 150);
    }

    // =====================
    // Draw Game
    // =====================
    function draw() {
        // Hintergrund
        ctx.fillStyle = "#325157";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Zeichne alle Lichter und Indikatoren
        targets.forEach(target => {
            const currentColor = getCurrentColor(target);
            
            // Konvertiere auch das Ziel zu RGB (0-100) für den Vergleich
            let targetColor;
            if (target.type === "rgb") {
                targetColor = target.target;
            } else { // cmy
                targetColor = cmyToRgb100(target.target.c, target.target.m, target.target.y);
            }
            
            const distance = colorDistance(currentColor, targetColor);
            const isCorrect = isColorCorrect(distance);

            // Licht zeichnen
            drawLight(target.x, target.y, target);

            // Indikator zeichnen
            drawIndicator(target.x, target.y, isCorrect, target.name);
        });

        // Überprüfe, ob alle Lichter korrekt sind
        allCorrect = targets.every(target => {
            const currentColor = getCurrentColor(target);
            
            // Konvertiere auch das Ziel zu RGB (0-100) für den Vergleich
            let targetColor;
            if (target.type === "rgb") {
                targetColor = target.target;
            } else { // cmy
                targetColor = cmyToRgb100(target.target.c, target.target.m, target.target.y);
            }
            
            const distance = colorDistance(currentColor, targetColor);
            return isColorCorrect(distance);
        });

        // Win-Benachrichtigung zeigen
        if (allCorrect && !lastCorrectState) {
            winNotification.classList.add("show");
            // Nach 5 Sekunden automatisch ausblenden
            setTimeout(() => {
                winNotification.classList.remove("show");
            }, 5000);
        } else if (!allCorrect && lastCorrectState) {
            winNotification.classList.remove("show");
        }
        lastCorrectState = allCorrect;

        requestAnimationFrame(draw);
    }

    // =====================
    // Event Listeners für Color Boxes
    // =====================
    // Event Listeners für Color Boxes
    // =====================
    const colorBoxes = document.querySelectorAll(".color-box");
    colorBoxes.forEach(box => {
        // Initial fade out (inaktiv)
        box.style.opacity = "0.4";
        
        box.addEventListener("click", () => {
            const light = box.dataset.light;
            const color = box.dataset.color;

            // Einheitliche Toggle-Logik: 0 ↔ 100
            if (lightValues[light][color] === 0) {
                lightValues[light][color] = 100;
                box.classList.add("active");
                box.style.opacity = "1";
                box.style.boxShadow = "0 0 15px rgba(255, 255, 255, 1)";
            } else {
                lightValues[light][color] = 0;
                box.classList.remove("active");
                box.style.opacity = "0.4";
                box.style.boxShadow = "none";
            }
        });
    });

    // =====================
    // Start Game Loop
    // =====================
    draw();
});
