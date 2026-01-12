document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("colorCanvas");
    const ctx = canvas.getContext("2d");

    const rSlider = document.getElementById("rSlider");
    const gSlider = document.getElementById("gSlider");
    const bSlider = document.getElementById("bSlider");
    const cSlider = document.getElementById("cSlider");
    const mSlider = document.getElementById("mSlider");
    const ySlider = document.getElementById("ySlider");

    const width = canvas.width;
    const height = canvas.height;

    const radius = 100;      // Kreisradius
    const offset = 50;      // Abstand der Kreise

    function draw() {
        // Hintergrund weiß füllen
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // RGB-Kreise (links)
        const rgbX = 200;
        const rgbY = 200;
        const R = rSlider.value / 100;
        const G = gSlider.value / 100;
        const B = bSlider.value / 100;

        // CMY-Kreise (rechts)
        const cmyX = 600;
        const cmyY = 200;
        const C = cSlider.value / 100;
        const M = mSlider.value / 100;
        const Y = ySlider.value / 100;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let index = (y * width + x) * 4;

                // --- RGB Additiv ---
                if (distance(x, y, rgbX - offset, rgbY - offset) <= radius ||
                    distance(x, y, rgbX + offset, rgbY - offset) <= radius ||
                    distance(x, y, rgbX, rgbY + offset) <= radius) {
                    
                    let rPixel = 0, gPixel = 0, bPixel = 0;

                    if (distance(x, y, rgbX - offset, rgbY - offset) <= radius) rPixel += R;
                    if (distance(x, y, rgbX + offset, rgbY - offset) <= radius) gPixel += G;
                    if (distance(x, y, rgbX, rgbY + offset) <= radius) bPixel += B;

                    rPixel = Math.min(rPixel, 1);
                    gPixel = Math.min(gPixel, 1);
                    bPixel = Math.min(bPixel, 1);

                    data[index] = rPixel * 255;
                    data[index + 1] = gPixel * 255;
                    data[index + 2] = bPixel * 255;
                    data[index + 3] = 255;
                }

                // --- CMY Subtraktiv ---
                if (distance(x, y, cmyX - offset, cmyY - offset) <= radius ||
                    distance(x, y, cmyX + offset, cmyY - offset) <= radius ||
                    distance(x, y, cmyX, cmyY + offset) <= radius) {
                    
                    let rCmy = 1, gCmy = 1, bCmy = 1;

                    if (distance(x, y, cmyX - offset, cmyY - offset) <= radius) rCmy *= (1 - C);
                    if (distance(x, y, cmyX + offset, cmyY - offset) <= radius) gCmy *= (1 - M);
                    if (distance(x, y, cmyX, cmyY + offset) <= radius) bCmy *= (1 - Y);

                    data[index] = rCmy * 255;
                    data[index + 1] = gCmy * 255;
                    data[index + 2] = bCmy * 255;
                    data[index + 3] = 255;
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);
      }

    function distance(x1, y1, x2, y2) {
        return Math.sqrt((x1-x2)**2 + (y1-y2)**2);
    }

    [rSlider,gSlider,bSlider,cSlider,mSlider,ySlider].forEach(slider => {
        slider.addEventListener("input", draw);
    });

    draw();
});
