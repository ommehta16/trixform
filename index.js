const parentElement = document.querySelector("div.right-panel");

const two = new Two({fitted:true}).appendTo(parentElement);

const resizer = new ResizeObserver(()=>{setTimeout(()=>{two.fit(); two.update();},0)});
resizer.observe(parentElement);
two.renderer.domElement.classList.add("twojs");

const circle = two.makeCircle(-75,0,50);
circle.fill = "orange";
const rectangle = two.makeRectangle(75,0,100,100);
rectangle.fill = "red";

const group = two.makeGroup(circle,rectangle);

function centerElements() {
  const cx = two.width*0.5;
  const cy = two.height*0.5;

  group.position.set(cx,cy);
}
centerElements();
group.scale=1;
group.noStroke();

const startTime = Date.now();

let t = 0;

two.bind('resize',centerElements);

two.bind('update',() => {
  const t = (Date.now()-startTime)/1000; // seconds
  
  // group.rotation += (two.timeDelta/1000)*2;
});

// two.play();
addEventListener("load",() => {two.fit(); two.update();});

const twoElement = document.querySelector(".twojs");

const mouse = {x:0,y:0}
const current = {x:0,y:0}

const polylines = [];

/**
 * @param {PointerEvent} e
 * @returns {{x:number, y:number}|null}
 */
function getMousePos(e) {
  if (!document.querySelector(".twojs:hover")) return;
  mouse.x = e.clientX;
  mouse.y = e.clientY;

  const twoOutsideRect = twoElement.getBoundingClientRect();

  const rel = {
    x:mouse.x - twoOutsideRect.left - two.width*0.5,
    y:mouse.y - twoOutsideRect.top - two.height*0.5
  };
  return rel;
}

/** @param {PointerEvent} e */
function pointerdown(e) {
  const rel = getMousePos(e);
  if (!rel) return;

  const path = polylines[polylines.length-1] ?? (() => {
    const temp=two.makePath([]);
    temp.fill="transparent";
    temp.closed=false;
    
    polylines.push(temp);
    group.children.push(temp);
    return temp;
  })();
  
  const anchor = new Two.Anchor(rel.x,rel.y, rel.x, rel.y, rel.x, rel.y);
  path.vertices.push(anchor);

  anchor.circle = two.makeCircle(rel.x,rel.y,2);
  anchor.circle.fill="black";
  group.children.push(anchor.circle);

  two.update();
}

/**
 * @param {{x:number, y:number}} a
 * @param {{x:number, y:number}} b
 */
function distSq(a, b) {
  return Math.pow(a.x-b.x,2) + Math.pow(a.y-b.y,2);
}

const hoverCircle = two.makeCircle(0,0,10);
group.children.push(hoverCircle);

/** @param {PointerEvent} e */
function pointermove(e) {
  const rel = getMousePos(e);
  if (!rel) return;
  if (!polylines.length) return;

  let closestCircle = null;
  let closestDist = Infinity;

  for (const anchor of polylines[polylines.length-1].vertices) {
    const dist = distSq(anchor, rel);
    if (dist >= closestDist) continue;
    
    closestDist=dist;
    closestCircle = anchor;
  }

  console.log(closestCircle, hoverCircle);

  hoverCircle.position.set(closestCircle.x, closestCircle.y);
  
  hoverCircle.radius = 10;
  hoverCircle.fill = "#3da6fd6b";
  hoverCircle.stroke="transparent";

  two.update();
}

addEventListener("pointerdown",pointerdown);
addEventListener("pointermove",pointermove);

document.querySelector("#start").addEventListener("click",()=>{
  two.play();
});
two.update();