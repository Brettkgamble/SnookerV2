// sketch.js

let Engine = Matter.Engine;
let World = Matter.World;
let Bodies = Matter.Bodies;
let Body = Matter.Body;
let Constraint = Matter.Constraint;
let Vector = Matter.Vector;
let Collision = Matter.Collision;

let engine, world;
let ball;
let cue;
let table;
let scoreboard;
let ballLayout;
let gameStarted = false;

// https://reitgames.com/news/collision-filtering-phaser
const CATEGORY_CUE = 0x0001; // binary 0001
const CATEGORY_BALL = 0x0002; // binary 0010
const CATEGORY_WHITEBALL = 0x0004; // binary 0100
const CATEGORY_CUSHION = 0x0008;  // binaru 1000


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
  ballLayout = new BallLayout(800, 400 / 72);
  scoreboard = new ScoreBoard()
  timer = new Timer();
  // cue = new Cue();
  helper = new Helper();

}

function draw() {
  background(30, 100, 50);
  Engine.update(engine);

  const cYellow = color(255, 255, 0);
  const cWhite = color(255, 255, 255);

  table.drawTable();

  timer.drawTimer();

  helper.drawText("CM2030 Mid Term - Snooker", 450, 40, 22, 255, cWhite)
  
  if (!ballLayout.gameOption) {
    helper.drawText( "To start, there are three possible play modes: ", 350, 180, 12, cWhite);
    helper.drawText('- "1" for standard starting positions layout\n- "2" for random all\n- "3" for random reds only', 350, 210, 12, cWhite);
  } else {
      helper.drawText("mode: " + ballLayout.gameOption, 10, 100, 14, cWhite);
      ballLayout.drawBalls();
      scoreboard.drawScore();
      if (!gameStarted) {
        helper.drawText('Click anywhere within the D arc to place the cue ball (white)',350, 180, 12, cYellow);
      } else {
        timer.startTimer();
        helper.drawText("Reds Left: " + ballLayout.countReds() , 10, 275, 12, cYellow)
        helper.drawText("Colors Left: " + ballLayout.countColors() , 10, 290, 12, cYellow)
        helper.drawText("Consecutive Colors: " + ballLayout.consecutiveColors , 10, 305, 12, cYellow)
        helper.drawText("Instructions: ", 250, 475, 12, cYellow)
        helper.drawText("- 'n' to start a new game", 250, 490, 12, cYellow)
        helper.drawText("- Right Arrow Key rotates the cue clockwise", 250, 505, 12, cYellow)
        helper.drawText("- Left Arrow Key rotates the cue counter clockwise", 250, 520, 12, cYellow)
        helper.drawText("- Down Arrow Key adds shot power", 250, 535, 12, cYellow)
        helper.drawText("--- Hold and drag center of cue adds shot power", 250, 550, 12, cYellow)
        helper.drawText("- Order is one red followed by a color", 550, 490, 12, cYellow)
        helper.drawText("- Two colors consecutively incur a penalty of -4 points", 550, 505, 12, cYellow)

        if (whiteBallInPlay()) {
          table.cushionCollision(whiteBall);
          ballLayout.ballCollision(whiteBall);
          ballLayout.ballInPocket();
          ballLayout.checkWin();
          drawWhiteBall()
          cue.update()
          cue.draw();
          cue.checkForReset();
        } else {
          scoreboard.addScore(-4);
          ballLayout.drawPenalty();
          removeWhiteBallFromWorld();
          gameStarted = false;
        }
      }     
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
  if (key.toLowerCase() === "1") {
    ballLayout.setGameOption("standard");
  }
  if (key.toLowerCase() === "2") {
    ballLayout.setGameOption("unordered");
  }
  if (key.toLowerCase() === "3") {
    ballLayout.setGameOption("random");
  }
  if (key.toLowerCase() === "n") {
    window.location.reload();
  }

  if ([LEFT_ARROW, RIGHT_ARROW, DOWN_ARROW, ENTER].includes(keyCode)) {
    e.preventDefault();
  }

  if (cue) cue.onKeyPressed(keyCode);
}

function mouseReleased() {
  if (cue) cue.onMouseReleased();
}

function mouseDragged() {
if (cue) cue.onMouseDragged();
}
