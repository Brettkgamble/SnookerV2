// sketch.
/**
 *  COMMENTARY:
 *  The app design was based on the angry birds app that used an elastic band mechanism to sling shot a bird at 
 *  a tower.  One of the difficulties I had was converting this to a non-elastic mechanism for cue draw back and 
 *  force generation.
 * 
 *  I did decide early on to use classes and this led me down a dark path.  But, I learned an incredible amount
 *  along the way, so building it mostly based on O-O and classes was a good learning point for me.  
 * 
 *  There are no real enhancements outside of the base rubic with the exception of a force UI component that 
 *  works with either a mouse drag or key type (down arrow) to generate a force effect.  
 * 
 *  The layout was based on several searches for snooker layouts.  There are not many sites out there that are very
 *  good, especially for dimensions.
 * 
 *  The cue ball is placed only in the D area (constrained within the code) by a mouse click and release.  I did 
 *  not provide a way of setting the cue ball using keys.
 * 
 *  The user either clicks and drags the cue (a bit buggy but works) and a line is drawn as the cue is dragged 
 *  to show that the mouse is actually dragging.  Or, the down arrow key can be tapped to generate force which
 *  is shown in the force UI componet (for dragging and tapping).  The user releases the cue to strike by hitting
 *  the enter key.
 * 
 *  There is nothing exceptional about this app.  Given more time and understanding about p5.js and matter.js then
 *  perhaps the presentation and options could be extended.  I was honestly disappointed in having to code yet another
 *  game.  I thought that the art generation would be much more fun, and data dynamic, especially if combined with
 *  music.  
 * 
 *  Difficulties along the way were that I spent way too much time on this and re-wrote it in a day, the day before 
 *  submission.  I was having a lot of trouble getting the cue to work and overnight decided to start over, and work
 *  from the more difficult things (the cue and whiteball placement) to the easy things like layout and static objects 
 *  (cushions etc).  Literally 45 hours of prior work was completed in about 10 hours of work in a single day.  
 * 
 *  Figuring our collisions, using the collision detection within matter.js was tricky.  Most examples were using
 *  hex notation and it took me a while to figure out why my collisions were not working as expected.  Finally reading
 *  the matter.js (avoided because it is terrible) led me to reading a blog post where the writer explained the 
 *  requirement for the masking to be a binary bit set that can be divided by 2. 
 * 
 *  Other difficulties are in game play and testing.  I spent endless time playing the game and debugging.  I hope you
 *  find a few!  They are probably there.
 *  
 */

// Import Matter.js modules for physics simulation
let Engine = Matter.Engine;
let World = Matter.World;
let Bodies = Matter.Bodies;
let Body = Matter.Body;
let Constraint = Matter.Constraint;
let Vector = Matter.Vector;
let Collision = Matter.Collision;
let Events = Matter.Events;
let Sleeping = Matter.Sleeping;

// Declare core variables and objects
let engine, world;
let ball;
let cue;
let table;
let scoreboard;
let ballLayout;
let gameStarted = false;

// UI-related message state
let collisionMessage = '';
let collisionTimer = 0;
let consecutieColorsMessage = 'Penalty!  2 colors sunk in a row';
let messageTime = 0;
const MESSAGE_DURATION = 3000; // Duration (in ms) for showing messages

/** Collision categories (bitmasking for filtering)
 * Each bit pattern must be divisible by 2 
 * and each must have a '1' in a unique position to the rest
 * TODO: I need to understand this more fully.
 */
const CATEGORY_CUE = 0x0001; // 0001
const CATEGORY_BALL = 0x0002; // 0010
const CATEGORY_WHITEBALL = 0x0004; // 0100
const CATEGORY_CUSHION = 0x0008; // 1000

/**
 * Sets up the game canvas, physics engine, game entities, and event listeners.
 */
function setup() {
  createCanvas(1200, 600);
  engine = Engine.create();
  engine.timing.timeScale = 0.8; // Slows down simulation for better collision accuracy
  world = engine.world;
  world.gravity.x = 0;
  world.gravity.y = 0;

  setupCueBall(0, 0); // Initialize cue ball at dummy position to allow cue (class) setup

  // Instantiate main components
  table = new Table();
  // TODO: Fix the parameterization of this class instantiation
  ballLayout = new BallLayout(800, 400 / 72);
  scoreboard = new ScoreBoard();
  timer = new Timer();
  helper = new Helper();

  /**
   * Collision event listener to detect when the white ball collides with another object.
   * Displays a short on-screen message and logs to the console.
   * The documentation on matter.js for collision detection is extremely difficult to 
   * understand.  This took quite a bit of effort and fiddling with over a few days to
   * finally get right.
   */
  Events.on(engine, 'collisionStart', function(event) {
    const pairs = event.pairs;
    for (let pair of pairs) {
      const { bodyA, bodyB, collision } = pair;

      let white, other;
      if (bodyA.label === 'whiteBall') {
        white = bodyA;
        other = bodyB;
      } else if (bodyB.label === 'whiteBall') {
        white = bodyB;
        other = bodyA;
      }

      if (white) {
        console.log(`White ball collided with : ${other.label}`);
        collisionMessage = `White ball collided with : ${other.label}`;
        collisionTimer = millis();
      }
    }
  });
}

/**
 * Main drawing loop to render the game frame-by-frame.
 * Handles rendering, game instructions, gameplay logic, and collision feedback.
 */
function draw() {
  background(30, 100, 50);
  Engine.update(engine);

  const cYellow = color(255, 255, 0);
  const cWhite = color(255, 255, 255);
  const cRed = color(255, 0, 0);

  table.drawTable();
  timer.drawTimer();
  helper.drawFouls();

  // Display penalty message for the potting of 2 balls in a row
  if (ballLayout.consecutiveColors > 2 && millis() - messageTime < MESSAGE_DURATION) {
    fill(255, 0, 0);
    textSize(20);
    text(consecutieColorsMessage, 400, 260);
  }

  // Main title
  helper.drawText("CM2030 Mid Term - Snooker", 450, 40, 22, 255, cWhite);

  // Initial game mode instructions
  if (!ballLayout.gameOption) {
    helper.drawText("To start, there are three possible play modes:", 350, 180, 12, cWhite);
    helper.drawText('- "1" for standard starting positions layout\n- "2" for random reds only\n- "3" ' + 
                    'for random (colors and reds)\n\n"n" to reset', 350, 210, 12, cWhite);
  } else {
    // In-game UI
    helper.drawText("mode: " + ballLayout.gameOption, 10, 100, 14, cWhite);
    ballLayout.drawBalls();
    scoreboard.drawScore();

    if (!gameStarted) {
      helper.drawText('Click anywhere within the D arc to place the cue ball (white)', 350, 180, 12, cYellow);
    } else {
      timer.startTimer();
      // TODO: This is quite a glut of text.  Perhaps refactor into a class or something.
      helper.drawText("Reds Left: " + ballLayout.countReds(), 10, 275, 12, cYellow);
      helper.drawText("Colors Left: " + ballLayout.countColors(), 10, 290, 12, cYellow);
      helper.drawText("Consecutive Colors: " + ballLayout.consecutiveColors, 10, 305, 12, cYellow);

      // Game instructions
      helper.drawText("Instructions:", 250, 475, 12, cYellow);
      helper.drawText("- 'n' to start a new game", 250, 490, 12, cYellow);
      helper.drawText("- Right Arrow Key rotates the cue clockwise", 250, 505, 12, cYellow);
      helper.drawText("- Left Arrow Key rotates the cue counter clockwise", 250, 520, 12, cYellow);
      helper.drawText("- Down Arrow Key adds shot power", 250, 535, 12, cYellow);
      helper.drawText("--- Hold and drag center of cue adds shot power", 250, 550, 12, cYellow);
      helper.drawText("- Order is one red followed by a color", 550, 490, 12, cYellow);
      helper.drawText("- Two colors consecutively incur a penalty of -4 points", 550, 505, 12, cYellow);

      // Gameplay execution
      if (whiteBallInPlay()) {
        table.cushionCollision(whiteBall);
        // ballLayout.ballCollision(whiteBall);
        ballLayout.ballInPocket();
        ballLayout.checkWin();
        drawWhiteBall();
        cue.update();
        cue.draw();
        cue.checkForReset();
      } else {
        // Penalize and reset white ball if out of bounds
        scoreboard.addScore(-4);
        ballLayout.drawPenalty();
        removeWhiteBallFromWorld();
        // Allows the user to re-drop the white ball
        gameStarted = false;
      }

      // Display collision message briefly
      if (millis() - collisionTimer < 2000 && collisionMessage) {
        fill(255, 0, 0);
        textSize(16);
        text(collisionMessage, 550, 530);
      }
    }
  }
}

/**
 * Handles mouse input when placing the cue ball or interacting with the cue.
 */
function mousePressed() {
  if (!gameStarted) {
    // Allow cue ball placement within the "D" zone
    if (dist(mouseX, mouseY, 150 + table.tableLength / 5, table.tableStartY + table.tableWidth / 2) < 75 && mouseX < 310) {
      setupCueBall(mouseX, mouseY);
      cue = new Cue();
      gameStarted = true;
    }
  } else {
    if (cue) cue.onMousePressed();
  }
}

/**
 * Handles keyboard input for game mode selection and cue control.
 */
function keyPressed(e) {
  if (key.toLowerCase() === "1") ballLayout.setGameOption("standard");
  if (key.toLowerCase() === "2") ballLayout.setGameOption("unordered");
  if (key.toLowerCase() === "3") ballLayout.setGameOption("random");
  if (key.toLowerCase() === "n") window.location.reload();

  if ([LEFT_ARROW, RIGHT_ARROW, DOWN_ARROW, ENTER].includes(keyCode)) {
    e.preventDefault(); // Prevent browser from scrolling
  }

  // If the previous conditions have not been met then the key is handled
  // by the cue class
  if (cue) cue.onKeyPressed(keyCode);
}

/**
 * Handles mouse release interaction with the cue inside the cue class
 */
function mouseReleased() {
  if (cue) cue.onMouseReleased();
}

/**
 * Handles mouse drag interaction with the cue  inside the cue class
 */
function mouseDragged() {
  if (cue) cue.onMouseDragged();
}
