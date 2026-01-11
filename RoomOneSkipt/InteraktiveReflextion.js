document.addEventListener("DOMContentLoaded", () => {

    const canvas = document.getElementById("reflexionCanvas");
    const ctx = canvas.getContext("2d");
    const angleInput = document.getElementById("angleInput");
    const angleValue = document.getElementById("angleValue");

    const hitPoint = {
        x: canvas.width / 2,
        y: canvas.height / 2
    };

    function drawScene(angle) {
        clearCanvas();
        drawMirror();
        drawNormal();
        drawIncomingRay(angle);
        drawReflectedRay(angle);
        drawIncomingAngle(angle);
        drawReflectedAngle(angle);
    }

    function clearCanvas() {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawMirror() {
        ctx.strokeStyle = "black";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(50, hitPoint.y);
        ctx.lineTo(canvas.width - 50, hitPoint.y);
        ctx.stroke();
        ctx.fillStyle = "black";
        ctx.font = "16px Arial";
        ctx.fillText("Spiegel", canvas.width - 100, hitPoint.y - 10);
    }

    function drawNormal() {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(hitPoint.x, hitPoint.y - 150);
        ctx.lineTo(hitPoint.x, hitPoint.y + 150);
        ctx.stroke();
        ctx.fillStyle = "red";
        ctx.font = "16px Arial";
        ctx.fillText("Lot", hitPoint.x + 10, hitPoint.y - 140);
    }

    function drawIncomingRay(angle) {
        const rad = angle * Math.PI / 180;
        const length = 200;

        const startX = hitPoint.x - Math.sin(rad) * length;
        const startY = hitPoint.y - Math.cos(rad) * length;

        ctx.strokeStyle = "blue";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(hitPoint.x, hitPoint.y);
        ctx.stroke();

        drawArrowMid(startX, startY, hitPoint.x, hitPoint.y, "blue");
    }

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

    function drawAngleLabel(angle, directionRad, distance, color) {
        const x = hitPoint.x + Math.cos(directionRad) * distance;
        const y = hitPoint.y + Math.sin(directionRad) * distance;

        ctx.fillStyle = color;
        ctx.font = "14px Arial";
        ctx.fillText(`${angle}°`, x - 8, y + 5);
    }

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

    angleInput.addEventListener("input", () => {
        const angle = Number(angleInput.value);
        angleValue.textContent = angle;
        drawScene(angle);
    });

    drawScene(Number(angleInput.value));
});
