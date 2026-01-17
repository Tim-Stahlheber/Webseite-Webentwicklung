document.addEventListener("DOMContentLoaded", () => {

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const winNotification = document.getElementById("winNotification");

// Canvas-Größe setzen, wenn die Section sichtbar wird
function initializeCanvas() {
    canvas.width = 1000;
    canvas.height = 562;
}

// Überprüfen, ob die Section bereits sichtbar ist
const gameSection = document.getElementById("finalGameSection");
if (gameSection && gameSection.style.display !== "none") {
    initializeCanvas();
}

// MutationObserver, um zu erkennen, wenn die Section sichtbar wird
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            if (gameSection.style.display !== "none") {
                initializeCanvas();
                observer.disconnect(); // Nur einmal initialisieren
            }
        }
    });
});

if (gameSection) {
    observer.observe(gameSection, { attributes: true });
}

const EPSILON = 0.001;
const WATER_SURFACE = 250;
let lastHitState = false;
let notificationTimeout = null;

// CMY Light Values
const lightRay = { c: 0, m: 0, y: 0 };

// =====================
// Helper Functions
// =====================
function cmyToHex(c, m, y) {
    // CMY zu Hex (0-100 zu #RRGGBB)
    const r255 = Math.round((1 - c / 100) * 255);
    const g255 = Math.round((1 - m / 100) * 255);
    const b255 = Math.round((1 - y / 100) * 255);
    return "#" + [r255, g255, b255].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join('').toUpperCase();
}

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
// Reflection
// =====================
function reflect(d,n){
    return vec.sub(d, vec.mul(n, 2 * vec.dot(d,n)));
}

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
// Ray / Segment Intersection
// =====================
function intersectRaySegment(o,d,a,b){
    const v1=vec.sub(o,a);
    const v2=vec.sub(b,a);
    const v3={x:-d.y,y:d.x};

    const dot=vec.dot(v2,v3);
    if(Math.abs(dot)<0.00001) return null;

    const t1=(v2.x*v1.y - v2.y*v1.x)/dot;
    const t2=vec.dot(v1,v3)/dot;

    if(t1>EPSILON && t2>=0 && t2<=1){
        return { point: vec.add(o, vec.mul(d,t1)), dist:t1 };
    }
    return null;
}

// =====================
// Mirror
// =====================
class Mirror{
    constructor(x,y,len,angle,color){
        this.x=x; this.y=y; this.len=len; this.angle=angle; this.color=color;
    }
    get endpoints(){
        const dx=Math.cos(this.angle)*this.len/2;
        const dy=Math.sin(this.angle)*this.len/2;
        return [{x:this.x-dx,y:this.y-dy},{x:this.x+dx,y:this.y+dy}];
    }
    get normal(){
        return vec.norm({x:-Math.sin(this.angle), y:Math.cos(this.angle)});
    }
    draw(){
        const [a,b]=this.endpoints;
        ctx.strokeStyle=this.color;
        ctx.lineWidth=5;
        ctx.beginPath();
        ctx.moveTo(a.x,a.y);
        ctx.lineTo(b.x,b.y);
        ctx.stroke();
    }
}

// =====================
// Game Objects
// =====================
const mirror = new Mirror(700, 80, 80, 0, "#34d6ff");

const source={
    pos:{x:50,y:80},
    dir:vec.norm({x:1,y:0})
};

const target={
    x:80,y:400,r:20,hit:false,
    draw(){
        ctx.fillStyle=this.hit?"lime":"red";
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
        ctx.fill();
    }
};

// Stege an der Wasseroberflaeche
const piers = [
    {startX: 0, endX: 150, y: WATER_SURFACE - 10, height: 15},  // Links
    {startX: canvas.width - 250, endX: canvas.width, y: WATER_SURFACE - 10, height: 15}  // Rechts
];

function drawPiers(){
    ctx.fillStyle = "#8B4513";
    piers.forEach(pier => {
        ctx.fillRect(pier.startX, pier.y, pier.endX - pier.startX, pier.height);
    });
}

// =====================
// Slider
// =====================
const sliderMirror = document.getElementById("sliderMirror");
const sliderMirrorValue = document.getElementById("sliderMirrorValue");
if(sliderMirror) {
    mirror.angle = -sliderMirror.value * Math.PI / 180;
    sliderMirror.addEventListener("input", () => {
        mirror.angle = -sliderMirror.value * Math.PI / 180;
    });
}

// =====================
// Color Buttons
// =====================
const colorBoxes = document.querySelectorAll(".color-box");
colorBoxes.forEach(box => {
    // Initial fade out (inaktiv)
    box.style.opacity = "0.4";
    
    box.addEventListener("click", () => {
        const light = box.dataset.light;
        const color = box.dataset.color;

        // Toggle: 0 ↔ 100
        if (lightRay[color] === 0) {
            lightRay[color] = 100;
            box.style.opacity = "1";
            box.style.boxShadow = "0 0 15px rgba(255, 255, 255, 1)";
        } else {
            lightRay[color] = 0;
            box.style.opacity = "0.4";
            box.style.boxShadow = "none";
        }
    });
});

// =====================
// Ray Tracing with Refraction and Reflection
// =====================
function traceRay(o,d,inWater=false,depth=5){
    const segments=[];
    
    for(let i=0;i<=depth;i++){
        let closest=null, hitMirror=null;
        let hitWaterSurface = false;
        let hitPier = false;
        let closestPoint=null, closestDist=Infinity;

        // Nur im Luftbereich können wir Spiegel treffen
        if(!inWater){
            const [a,b]=mirror.endpoints;
            const hit=intersectRaySegment(o,d,a,b);
            if(hit && hit.dist < closestDist){
                closest=hit;
                hitMirror=mirror;
                closestDist=hit.dist;
                closestPoint=hit.point;
            }
        }

        // Prüfe auf Wasseroberfläche
        if(d.y > 0 && o.y < WATER_SURFACE){
            const t = (WATER_SURFACE - o.y) / d.y;
            if(t > EPSILON && t < closestDist){
                closestPoint = vec.add(o, vec.mul(d, t));
                closestDist = t;
                hitWaterSurface = true;
                hitMirror = null;
            }
        }

        // Wenn nichts getroffen, fahre geradeaus
        if(!closestPoint){
            const end=vec.add(o,vec.mul(d,2000));
            segments.push({p1:o,p2:end});
            checkTarget(o,end);
            break;
        }

        segments.push({p1:o,p2:closestPoint});
        checkTarget(o,closestPoint);

        if(hitMirror){
            // Spiegelung
            let n = hitMirror.normal;
            if(vec.dot(d,n)>0) n = vec.mul(n,-1);
            d = reflect(d,n);
            o = vec.add(closestPoint, vec.mul(d, EPSILON));
        } else if(hitWaterSurface){
            // Brechung an Wasseroberfläche
            // Prüfe ob Licht auf Steg trifft
            for(const pier of piers){
                if(closestPoint.x >= pier.startX && closestPoint.x <= pier.endX && 
                   closestPoint.y >= pier.y && closestPoint.y <= pier.y + pier.height){
                    hitPier = true;
                    break;
                }
            }
            
            if(hitPier){
                // Totalreflexion am Steg
                const normalToWater = {x:0, y:-1};
                d = vec.sub(d, vec.mul(normalToWater, 2 * vec.dot(d, normalToWater)));
                o = vec.add(closestPoint, vec.mul(d, EPSILON));
                break;
            }
            
            const normalToWater = {x:0, y:-1}; // Normale zeigt nach oben
            const refracted = refract(d, normalToWater, 1, 1.33);
            
            if(refracted){
                // Brechung erfolgt
                d = refracted;
                inWater = true;
                o = closestPoint;
            } else {
                // Totalreflexion
                d = vec.sub(d, vec.mul(normalToWater, 2 * vec.dot(d, normalToWater)));
                o = vec.add(closestPoint, vec.mul(d, EPSILON));
            }
        } else {
            break;
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
    const isInTarget = vec.len(vec.sub(p,target))<target.r;
    
    // Nur grünes Licht (Cyan + Yellow = grün, kein Magenta)
    const isGreenLight = lightRay.c === 100 && lightRay.y === 100 && lightRay.m === 0;
    
    target.hit = isInTarget && isGreenLight;
}

// =====================
// Rendering Environment
// =====================
function drawEnvironment(){
    // Luft (oben)
    ctx.fillStyle="#325157";
    ctx.fillRect(0, 0, canvas.width, WATER_SURFACE);
    
    // Wasser (unten, dunkelblau)
    ctx.fillStyle="rgba(16, 105, 214, 0.7)";
    ctx.fillRect(0, WATER_SURFACE, canvas.width, canvas.height - WATER_SURFACE);
    
    // Wasseroberfläche Linie
    ctx.strokeStyle="rgba(100, 150, 220, 0.8)";
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(0, WATER_SURFACE);
    ctx.lineTo(canvas.width, WATER_SURFACE);
    ctx.stroke();
    
    // Stege zeichnen
    drawPiers();
}

// =====================
// Rendering
// =====================
function drawRay(segs){
    ctx.strokeStyle=cmyToHex(lightRay.c, lightRay.m, lightRay.y);
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

// =====================
// Main Loop
// =====================
// Main Loop
// =====================
function loop(){
    ctx.fillStyle="#e8f4f8";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    target.hit=false;
    
    drawEnvironment();
    
    const segs=traceRay(source.pos,source.dir,false,5);
    drawRay(segs);
    drawSource();
    mirror.draw();
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
