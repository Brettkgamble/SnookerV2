// sketch.js

let Engine = Matter.Engine;
let World = Matter.World;
let Bodies = Matter.Bodies;
let Body = Matter.Body;
let Constraint = Matter.Constraint;
let Vector = Matter.Vector;

let engine, world;
let ball;
let cue;
let table;
let gameStarted = false;




function setup() {
  createCanvas(1200, 600);
  engine = Engine.create();
  
  engine.timing.timeScale = 0.8; // Improves accuracy of matter.js 
                                 // collisions at high speeds
  
  world = engine.world;

  world.gravity.x = 0;
  world.gravity.y = 0;

  // initialise a cue ball as it is needed to instantiate a cue
  setupCueBall(0, 0)
  

  // ball = Bodies.circle(400, 200, 5, {
  //   restitution: 0.9,
  //   friction: 0.01,
  //   density: 0.04
  // });
  // World.add(world, ball);

  /* The table is the underlying structure of the 'slab'
     It includes the slab, rails, cushions and pockets
  */
  table = new Table();
  timer = new Timer();
  // cue = new Cue();
  helper = new Helper();

}

function draw() {
  background(30, 100, 50);
  Engine.update(engine);

  const cYellow = color(255, 255, 0);

  table.drawTable();

  fill(255);
  noStroke();
  ellipse(150, 460, 10);

  if (gameStarted) {
    drawWhiteBall()
    cue.update()
    cue.draw();
    cue.checkForReset();
  } else {
    helper.drawText('Click anywhere with the D arc to place the cue ball (white)',350, 180, 12, cYellow);
  }
}

function mousePressed() {
  if (!gameStarted) {
      // Determine if mouse up is within the D Zone Arc
      if (dist(mouseX, mouseY, 150 + table.tableLength / 5, table.tableStartY + table.tableWidth/2) < 75 && mouseX < 310) {
        setupCueBall(mouseX, mouseY);
        cue = new Cue()
        gameStarted = true;
      }
  } else {
    if (cue) cue.onMousePressed();
  }
}

  function keyPressed(e) {
  // Prevent arrow keys and Enter from scrolling the page
  if ([LEFT_ARROW, RIGHT_ARROW, DOWN_ARROW, ENTER].includes(keyCode)) {
    e.preventDefault();
  }

  if (cue) cue.onKeyPressed(keyCode);
}

function mouseReleased() {
  if (cue) cue.onMouseReleased();
}

function mouseDragged() {
  console.log('Dragging')
if (cue) cue.onMouseDragged();
}
