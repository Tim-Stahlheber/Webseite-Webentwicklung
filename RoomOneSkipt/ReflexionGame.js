document.addEventListener("DOMContentLoaded", () => {

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const winNotification = document.getElementById("winNotification");

const EPSILON = 0.001;
let lastHitState = false;

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
const mirrors=[
    new Mirror(300,200,160,0, "green"),
    new Mirror(540,510,160,0, "orange"),
    new Mirror(680,220,160,0, "purple")
];

const source={
    pos:{x:80,y:300},
    dir:vec.norm({x:1,y:-0.1})
};

const target={
    x:825,y:150,r:20,hit:false,
    draw(){
        ctx.fillStyle=this.hit?"lime":"red";
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
        ctx.fill();
    }
};

// =====================
// Sliders
// =====================
["m1","m2","m3"].forEach((id,i)=>{
    const s=document.getElementById(id);
    mirrors[i].angle=s.value*Math.PI/180;
    s.addEventListener("input",()=>{
        mirrors[i].angle=s.value*Math.PI/180;
    });
});

// =====================
// Ray Tracing
// =====================
function traceRay(o,d,depth=3){
    const segments=[];
    for(let i=0;i<=depth;i++){
        let closest=null, hitMirror=null;

        for(const m of mirrors){
            const [a,b]=m.endpoints;
            const hit=intersectRaySegment(o,d,a,b);
            if(hit && (!closest || hit.dist<closest.dist)){
                closest=hit; hitMirror=m;
            }
        }

        if(!closest){
            const end=vec.add(o,vec.mul(d,2000));
            segments.push({p1:o,p2:end});
            checkTarget(o,end);
            break;
        }

        segments.push({p1:o,p2:closest.point});

        let n = hitMirror.normal;
        if(vec.dot(d,n)>0) n = vec.mul(n,-1);

        d = reflect(d,n);
        o = vec.add(closest.point, vec.mul(d, EPSILON));
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
    ctx.strokeStyle="#00aaff";
    ctx.lineWidth=2;
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
    ctx.arc(source.pos.x, source.pos.y, 6, 0, Math.PI*2);
    ctx.fill();
}

// =====================
// Main Loop
// =====================
function loop(){
    ctx.fillStyle="#325157";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    target.hit=false;

    const segs=traceRay(source.pos,source.dir,3);
    drawRay(segs);
    drawSource();
    mirrors.forEach(m=>m.draw());
    target.draw();

    // Show win notification when target is hit
    if(target.hit && !lastHitState) {
        winNotification.classList.add("show");
        // Auto-hide after 3 seconds
        setTimeout(() => {
            winNotification.classList.remove("show");
        }, 3000);
    } else if(!target.hit && lastHitState) {
        winNotification.classList.remove("show");
    }
    lastHitState = target.hit;

    requestAnimationFrame(loop);
}

loop();

});
