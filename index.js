const parentElement = document.querySelector("div.right-panel");

const two = new Two({fitted:true}).appendTo(parentElement);

const resizer = new ResizeObserver(()=>{setTimeout(()=>{two.fit(); two.update();},0)});
resizer.observe(parentElement);
two.renderer.domElement.classList.add("twojs");

const group = two.makeGroup();

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

function createNewPath() {
  const path=two.makePath([]);
  path.fill="transparent";
  path.closed=false;
  
  polylines.push(path);
  group.children.push(path);
  return path;
}

/** @param {PointerEvent} e */
function pointerdown(e) {
  const rel = getMousePos(e);
  if (!rel) return;

  
  let path = polylines[polylines.length-1] ?? createNewPath();
  
  if (hoverCircle.parentPath) {
    if (hoverCircle.parentPath == path) {
      path.closed=true;
      path.fill="#FFBCAD";
      path = createNewPath();
      return;
    }
    
    // Hovercircle must be a different path to us, so we just snap to the node

    rel.x = hoverCircle.position.x;
    rel.y = hoverCircle.position.y;
  }
  
  const anchor = new Two.Anchor(rel.x,rel.y, rel.x, rel.y, rel.x, rel.y);
  path.vertices.push(anchor);

  anchor.circle = two.makeCircle(rel.x,rel.y,2);
  anchor.circle.fill="black";
  anchor.circle.circleType = "point";
  anchor.path = path;
  group.children.push(anchor.circle);
  
  findHover(e);
}

/**
 * @param {{x:number, y:number}} a
 * @param {{x:number, y:number}} b
 */
function distSq(a, b) {
  return Math.pow(a.x-b.x,2) + Math.pow(a.y-b.y,2);
}

const hoverCircle = two.makeCircle(0,0,0);
hoverCircle.fill = "#3da6fd6b";
hoverCircle.stroke="transparent";
hoverCircle.parentPath = null;
hoverCircle.circleType = "point";

group.children.push(hoverCircle);

/** @param {PointerEvent} e */
function findHover(e) {
  const rel = getMousePos(e);
  if (!rel) return;
  if (!polylines.length) return;
  let closestCircle = null;
  let closestDist = Infinity;
  
  for (const path of polylines) {
    for (const anchor of path.vertices) {
      const dist = distSq(anchor, rel);
      if (dist > closestDist) continue;
      
      closestDist=dist;
      closestCircle = anchor;
    }
  }
  
  if (closestDist > 20*20) {
    hoverCircle.radius = 0;
    hoverCircle.parentPath = null;
  }
  else {
    hoverCircle.radius=10;
    hoverCircle.position.x = closestCircle.x;
    hoverCircle.position.y = closestCircle.y;
    hoverCircle.parentPath = closestCircle.path;
  }

}

/** @param {KeyboardEvent} e */
function onEnter(e) {
  if (e.key != "Enter") return;
  if (!polylines.length || polylines[polylines.length-1].vertices.length) createNewPath();
} 

addEventListener("pointerdown",pointerdown);
addEventListener("pointermove",findHover);
addEventListener("keypress", onEnter)

two.play();

const matrixContainer = document.querySelector("table.matrix-container");
const applyButton = document.querySelector("button");

/** @param {number} element */
function doError(element) {

}

/**
 * @returns {[[number,number],[number,number]] | void}
 */
function getMatrix() {
  const inputs = matrixContainer.querySelectorAll("input");
  if (inputs.length != 4) return;

  const flat = Array.from(inputs).map(el=>Number.parseFloat(el.value));

  let isGood=true;
  console.log(flat);
  flat.forEach((number,i) => {
      if (!Number.isNaN(number)) return;
      doError(i);
      isGood=false;
  });
  if (!isGood) return;
  console.log("HAHAH");

  return [
    [flat[0], flat[1]],
    [flat[2], flat[3]]
  ];
}

/**
 * @param {[[number,number],[number,number]]?} matrix
 */
function applyTransform(matrix, twoEl) {
  if (!matrix) return;

  if (twoEl.children) {
    twoEl.children.forEach(child => applyTransform(matrix,child));
  }
  if (twoEl.vertices) {
    twoEl.vertices.forEach(v => {
      const temp = {
        x: matrix[0][0] * v.x + matrix[0][1] * v.y,
        y: matrix[1][0] * v.x + matrix[1][1] * v.y 
      };
      v.x = temp.x;
      v.y = temp.y;
    });
  }
}

applyButton.addEventListener("click", () => applyTransform(getMatrix(),group))