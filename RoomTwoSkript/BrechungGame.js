document.addEventListener("DOMContentLoaded", () => {

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const winNotification = document.getElementById("winNotification");
const angleSlider = document.getElementById("angleSlider");
const targetSlider = document.getElementById("targetSlider");

const EPSILON = 0.001;
const WATER_SURFACE = 250; 
const PIER_START = 0; 
const PIER_END = 450;
let lastHitState = false;
let notificationTimeout = null;

// =====================
// Vector Math
// =====================
const vec = {
    add:(a,b)=>({x:a.x+b.x,y:a.y+b.y}),
    sub:(a,b)=>({x:a.x-b.x,y:a.y-b.y}),
    mul:(v,s)=>({x:v.x*s,y:v.y*s}),
    dot:(a,b)=>a.x*b.x+a.y*b.y,
    len:v=>Math.hypot(v.x,v.y),
    norm:v=>{
        const l=Math.hypot(v.x,v.y);
        return {x:v.x/l,y:v.y/l};
    }
};

// =====================
// Refraction (Snellius Law)
// =====================
function refract(d,n,n1,n2){
    const eta = n1 / n2;
    const cosTheta = -vec.dot(n, d);
    const k = 1 - eta * eta * (1 - cosTheta * cosTheta);

    if (k < 0) return null; // Totalreflexion

    return vec.norm({
        x: eta * d.x + (eta * cosTheta - Math.sqrt(k)) * n.x,
        y: eta * d.y + (eta * cosTheta - Math.sqrt(k)) * n.y
    });
}

// =====================
// Game Objects
// =====================
const source={
    pos:{x:50,y:100},
    angle:-30,
    get dir(){
        const rad = this.angle * Math.PI / 180;
        return vec.norm({x: Math.cos(rad), y: Math.sin(rad)});
    }
};

const target={
    x:parseInt(document.getElementById("targetSlider").value),
    y:500,
    r:25,
    hit:false,
    draw(){
        ctx.fillStyle=this.hit?"lime":"red";
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
        ctx.fill();
    }
};

// =====================
// Steg (Pier)
// =====================
const pier = {
    startX: PIER_START,
    endX: PIER_END,
    y: WATER_SURFACE - 10,
    height: 15,
    draw(){
        ctx.fillStyle = "#8B4513";
        ctx.fillRect(this.startX, this.y, this.endX - this.startX, this.height);
    }
};

// =====================
// Ray Tracing with Refraction (Luft -> Wasser)
// =====================
function traceRay(o,d,inWater=false){
    const segments=[];
    
    for(let i=0;i<=10;i++){
        // Finde Schnittpunkt mit Wasseroberfläche oder Steg oder fahre geradeaus
        let hitWaterSurface = false;
        let hitPier = false;
        let nextPoint = null;
        
        if(!inWater){
            // In Luft - prüfe auf Steg oder Wasseroberfläche
            if(d.y > 0){
                const t = (WATER_SURFACE - o.y) / d.y;
                if(t > EPSILON){
                    const hitPoint = vec.add(o, vec.mul(d, t));
                    
                    // Prüfe ob Licht auf den Steg trifft 
                    if(hitPoint.x >= pier.startX && hitPoint.x <= pier.endX && 
                       hitPoint.y >= pier.y && hitPoint.y <= pier.y + pier.height){
                        nextPoint = hitPoint;
                        hitPier = true;
                    } else {
                        nextPoint = hitPoint;
                        hitWaterSurface = true;
                    }
                }
            }
        } else {
            // Im Wasser - fahre geradeaus
            nextPoint = vec.add(o, vec.mul(d, 1000));
        }
        
        if(!nextPoint){
            nextPoint = vec.add(o, vec.mul(d, 1000));
        }
        
        segments.push({p1:o,p2:nextPoint});
        checkTarget(o,nextPoint);
        
        if(hitPier || !hitWaterSurface){
            break;
        }
        
        // Brechung an der Wasseroberfläche
        const normalToWater = {x:0, y:-1}; // Normale zeigt nach oben
        
        const refracted = refract(d, normalToWater, 1, 1.33);
        if(refracted){
            d = refracted;
            inWater = true;
            o = nextPoint;
        } else {
            // Totalreflexion (sehr flacher Winkel)
            d = vec.sub(d, vec.mul(normalToWater, 2 * vec.dot(d, normalToWater)));
            o = nextPoint;
        }
    }
    
    return segments;
}

// =====================
// Target Check
// =====================
function checkTarget(a,b){
    const ap=vec.sub(target,a);
    const ab=vec.sub(b,a);
    const t=Math.max(0,Math.min(1,vec.dot(ap,ab)/vec.dot(ab,ab)));
    const p=vec.add(a,vec.mul(ab,t));
    target.hit=vec.len(vec.sub(p,target))<target.r;
}

// =====================
// Rendering
// =====================
function drawRay(segs){
    ctx.strokeStyle="#ffff00";
    ctx.lineWidth=3;
    segs.forEach(s=>{
        ctx.beginPath();
        ctx.moveTo(s.p1.x,s.p1.y);
        ctx.lineTo(s.p2.x,s.p2.y);
        ctx.stroke();
    });
}

function drawSource(){
    ctx.fillStyle="red";
    ctx.beginPath();
    ctx.arc(source.pos.x, source.pos.y, 8, 0, Math.PI*2);
    ctx.fill();
}

function drawEnvironment(){
    // Luft n
    ctx.fillStyle="rgba(100, 180, 255, 0.3)";
    ctx.fillRect(0, 0, canvas.width, WATER_SURFACE);
    
    // Wasser (dunkelblau) unten
    ctx.fillStyle="rgba(16, 105, 214, 0.7)";
    ctx.fillRect(0, WATER_SURFACE, canvas.width, canvas.height - WATER_SURFACE);
    
    // Wasseroberfläche Linie
    ctx.strokeStyle="rgba(100, 150, 220, 0.8)";
    ctx.lineWidth=3;
    ctx.beginPath();
    ctx.moveTo(0, WATER_SURFACE);
    ctx.lineTo(canvas.width, WATER_SURFACE);
    ctx.stroke();
    
    // Steg zeichnen
    pier.draw();
}

// =====================
// Slider Control
// =====================
angleSlider.addEventListener("input", () => {
    source.angle = parseInt(angleSlider.value);
});

targetSlider.addEventListener("input", () => {
    target.x = parseInt(targetSlider.value);
});

// =====================
// Main Loop
// =====================
function loop(){
    ctx.fillStyle="#e8f4f8";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    target.hit=false;
    
    drawEnvironment();
    
    const segs=traceRay(source.pos, source.dir, false);
    drawRay(segs);
    drawSource();
    target.draw();

    // Show win notification when target is hit
    if(target.hit && !lastHitState) {
        winNotification.classList.add("show");
        // Auto-hide after 5 seconds 
        if(notificationTimeout) {
            clearTimeout(notificationTimeout);
        }
        notificationTimeout = setTimeout(() => {
            winNotification.classList.remove("show");
            notificationTimeout = null;
        }, 5000);
    } else if(!target.hit && lastHitState) {
        winNotification.classList.remove("show");
    }
    lastHitState = target.hit;

    requestAnimationFrame(loop);
}

loop();

});
