// Warten, bis das DOM vollständig geladen ist
document.addEventListener("DOMContentLoaded", () => {
    // Referenzen auf Canvas und Zeichenkontext
    const canvas = document.getElementById("colorCanvas");
    const ctx = canvas.getContext("2d");

    // Slider für RGB-Additivfarben
    const rSlider = document.getElementById("rSlider");
    const gSlider = document.getElementById("gSlider");
    const bSlider = document.getElementById("bSlider");

    // Slider für CMY-Subtraktivfarben
    const cSlider = document.getElementById("cSlider");
    const mSlider = document.getElementById("mSlider");
    const ySlider = document.getElementById("ySlider");

    // Canvas-Größe
    const width = canvas.width;
    const height = canvas.height;

    // Kreisradius und Abstand zwischen Kreisen
    const radius = 100;      
    const offset = 50;      

    // Hauptfunktion zum Zeichnen der Venn-Diagramme
    function draw() {
        // Hintergrund weiß füllen
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width, height);

        // Canvas-Pixel abrufen
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // --- RGB-Kreise (links) ---
        const rgbX = 200;  // Zentrum X
        const rgbY = 200;  // Zentrum Y
        const R = rSlider.value / 100; // Rotwert [0..1]
        const G = gSlider.value / 100; // Grünwert [0..1]
        const B = bSlider.value / 100; // Blauwert [0..1]

        // --- CMY-Kreise (rechts) ---
        const cmyX = 600;  // Zentrum X
        const cmyY = 200;  // Zentrum Y
        const C = cSlider.value / 100; // Cyanwert [0..1]
        const M = mSlider.value / 100; // Magentawert [0..1]
        const Y = ySlider.value / 100; // Gelbwert [0..1]

        // Schleife über alle Pixel des Canvas
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let index = (y * width + x) * 4; // Index für RGBA

                // --- RGB Additiv ---
                if (distance(x, y, rgbX - offset, rgbY - offset) <= radius ||
                    distance(x, y, rgbX + offset, rgbY - offset) <= radius ||
                    distance(x, y, rgbX, rgbY + offset) <= radius) {
                    
                    let rPixel = 0, gPixel = 0, bPixel = 0;

                    // Prüfen, in welchem Kreis sich der Pixel befindet
                    if (distance(x, y, rgbX - offset, rgbY - offset) <= radius) rPixel += R;
                    if (distance(x, y, rgbX + offset, rgbY - offset) <= radius) gPixel += G;
                    if (distance(x, y, rgbX, rgbY + offset) <= radius) bPixel += B;

                    // Maximalwert 1
                    rPixel = Math.min(rPixel, 1);
                    gPixel = Math.min(gPixel, 1);
                    bPixel = Math.min(bPixel, 1);

                    // Pixel setzen (RGB)
                    data[index] = rPixel * 255;
                    data[index + 1] = gPixel * 255;
                    data[index + 2] = bPixel * 255;
                    data[index + 3] = 255; // Alpha
                }

                // --- CMY Subtraktiv ---
                if (distance(x, y, cmyX - offset, cmyY - offset) <= radius ||
                    distance(x, y, cmyX + offset, cmyY - offset) <= radius ||
                    distance(x, y, cmyX, cmyY + offset) <= radius) {
                    
                    let rCmy = 1, gCmy = 1, bCmy = 1;

                    // Prüfen, in welchem CMY-Kreis sich der Pixel befindet
                    if (distance(x, y, cmyX - offset, cmyY - offset) <= radius) rCmy *= (1 - C);
                    if (distance(x, y, cmyX + offset, cmyY - offset) <= radius) gCmy *= (1 - M);
                    if (distance(x, y, cmyX, cmyY + offset) <= radius) bCmy *= (1 - Y);

                    // Pixel setzen (subtraktive Farbmischung)
                    data[index] = rCmy * 255;
                    data[index + 1] = gCmy * 255;
                    data[index + 2] = bCmy * 255;
                    data[index + 3] = 255;
                }
            }
        }

        // Geänderte Pixel zurück auf Canvas
        ctx.putImageData(imageData, 0, 0);
      }

    // Hilfsfunktion: berechnet Abstand zwischen zwei Punkten
    function distance(x1, y1, x2, y2) {
        return Math.sqrt((x1-x2)**2 + (y1-y2)**2);
    }

    // Eventlistener auf allen Slider, um das Diagramm bei Änderung neu zu zeichnen
    [rSlider,gSlider,bSlider,cSlider,mSlider,ySlider].forEach(slider => {
        slider.addEventListener("input", draw);
    });

    // Initiales Zeichnen
    draw();
});
