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


/** @param {PointerEvent} e */
function pointerdown(e) {
  if (!document.querySelector(".twojs:hover")) return;
  mouse.x = e.clientX;
  mouse.y = e.clientY;

  const twoOutsideRect = twoElement.getBoundingClientRect();

  const relative = {
    x:mouse.x - twoOutsideRect.left - two.width*0.5,
    y:mouse.y - twoOutsideRect.top - two.height*0.5
  };

  const circle = two.makeCircle(relative.x,relative.y,4);
  circle.fill="black";

  group.children.push(circle);
  two.update();
}

addEventListener("pointerdown",pointerdown);

document.querySelector("#start").addEventListener("click",()=>{
  two.play();
});
two.update();