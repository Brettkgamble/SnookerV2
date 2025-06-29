/**
 * Class representing a snookercue in a Matter.js + p5.js based physics simulation.
 *
 * The `Cue` class handles:
 * - Graphical rendering of the cue stick
 * - User interaction (mouse and keyboard control)
 * - Physics-based striking of the cue ball
 * - Cue fading and resetting after a shot
 * - Constraint-based positioning to allow drawing back and aiming
 * - Collision filtering to ensure the cue only interacts with the white ball
 *
 * The cue is visually tapered, includes a visible power meter, and smoothly fades out
 * after a strike. The strike velocity follows a non-linear quadratic force curve.
 *
 * Requires:
 * - Matter.js (Body, World, Constraint)
 * - Global `whiteBall` object (must have `.position` and `.velocity`)
 * - Global `world` object (the Matter.js world)
 * - Collision category constants: `CATEGORY_CUE`, `CATEGORY_WHITEBALL`
 * 
 * In general, I had a lot of difficulty figuring out the placement of the cue tip, especially after
 * the initial draw moving into the second shot.
 * 
 * I also had a lot of difficulty converting this from an elastic band type mechanism based on the
 * Angry Birds work.
 * 
 * I think that the cue works effectively.  The user can either use the key pad arrows to rotate and 
 * load up force, followed by the enter key to strike, or can grab the center of the cue and drag.
 * A white line is drawn as user feedback for the dragging effect and is the result of issues that
 * I was having with my mouse (my issues, mainly with an old mouse on a dark surface.  Just annoying)
 * 
 * I also used the fact that the cue used to collide with the balls around it which led me to researching
 * about collision filters even before I got to that point in the rubic.
 * 
 * The cue fades out after the strike to simulate being lifted away from the table. Once the ball is 
 * 'almost'stopped, the player can begin setting up the cue again as it is re-rendered.
 */
class Cue {
  /**
   * Initializes the cue object, sets default interaction parameters, and creates the cue body.
   */
  constructor() {
    this.visible = true;          // Whether the cue is currently drawn
    this.alpha = 255;             // Opacity for fade-out animation
    this.fadingOut = false;       // Whether the cue is currently fading out
    this.powerAlpha = 0;          // Opacity of the power bar
    this.minDistance = 72;        // Minimum pull-back distance from white ball
    this.maxDistance = 172;       // Maximum pull-back distance from white ball
    this.cueDistance = 72;        // Current distance from the white ball
    this.cueAngle = 0;            // Current aiming angle (radians)

    this.isDragging = false;      // Whether the user is actively pulling back the cue
    this.constraintRemoved = false; // Whether the constraint has been removed during strike

    this.resetPending = false;    // Whether the cue is waiting to reset after a shot
    this.resetTimer = 0;          // Timestamp of last reset trigger
    this.resetDelay = 1000;       // Time in ms to delay cue reset after ball stops

    this.createBody();            // Initialize Matter.js body and constraint
  }

  /**
   * Creates the cue body and its constraint, linking it to a point near the white ball.
   */
  createBody() {
    const pos = this.getPosition();
    this.body = Bodies.rectangle(pos.x, pos.y, 120, 8, {
      // I did not really play with this.  Given more time then perhaps...
      density: 0.005,
      friction: 0.01,
      restitution: 0.4,
      collisionFilter: {
        category: CATEGORY_CUE,
        mask: CATEGORY_WHITEBALL // Cue only collides with the white ball
      }
    });
    Body.setAngle(this.body, this.cueAngle);
    World.add(world, this.body);

    this.constraint = Constraint.create({
      bodyA: this.body,
      pointB: pos,
      stiffness: 0.02,
      damping: 0.05,
      length: 0
    });
    World.add(world, this.constraint);
  }

  /**
   * Calculates the cue position based on white ball position, cue angle, and cue distance.
   * @returns {Object} x/y position of the cue tip
   */
  getPosition() {
    if (whiteBall.position.x) {
      return {
        x: whiteBall.position.x - this.cueDistance * Math.cos(this.cueAngle),
        y: whiteBall.position.y - this.cueDistance * Math.sin(this.cueAngle)
      };
    }
  }

  /**
   * Updates the cue's position and angle, unless it's being dragged or has struck the ball.
   */
  update() {
    if (!this.constraintRemoved && !this.isDragging) {
      const pos = this.getPosition();
      Body.setPosition(this.body, pos);
      Body.setAngle(this.body, this.cueAngle);
      this.constraint.pointB = pos;
    }
  }

  /**
   * Draws the cue on screen, including its shape, tip, and optional constraint line.
   * Handles fade-out animation after a strike.
   */
  draw() {
    if (!this.visible && !this.fadingOut) return;

    push();
    translate(this.body.position.x, this.body.position.y);
    rotate(this.body.angle);

    const cueLength = 120;
    const buttWidth = 10;
    const tipWidth = 4;

    fill(180, 140, 90, this.alpha);
    beginShape();
    vertex(-cueLength / 2, -buttWidth / 2);
    vertex(-cueLength / 2, buttWidth / 2);
    vertex(cueLength / 2, tipWidth / 2);
    vertex(cueLength / 2, -tipWidth / 2);
    endShape(CLOSE);

    fill(255, this.alpha);
    ellipse(cueLength / 2 + 2, 0, 6, 6);
    pop();

    if (!this.constraintRemoved) {
      stroke(255, 180);
      strokeWeight(3);

      if (this.isDragging) {
        const start = this.constraint.pointB;
        const dx = mouseX - start.x;
        const dy = mouseY - start.y;
        const d = dist(mouseX, mouseY, start.x, start.y);
        const t = min(1, this.cueDistance / d);
        const clippedX = start.x + dx * t;
        const clippedY = start.y + dy * t;
        line(start.x, start.y, clippedX, clippedY);
      } else {
        line(this.body.position.x, this.body.position.y, this.constraint.pointB.x, this.constraint.pointB.y);
      }

      strokeWeight(1);
      this.drawPowerBar();
    }

    if (this.fadingOut) {
      this.alpha -= 5;
      if (this.alpha <= 0) {
        this.alpha = 0;
        this.fadingOut = false;
        this.visible = false;
        World.remove(world, this.body);
      }
    }
  }

  /**
   * Draws the power bar on screen, representing the strength of the cue strike.
   * Colors change based on force intensity (green → orange → red).
   */
  drawPowerBar() {
    const x = 20, y = 20, w = 200, h = 20;
    // Not happy about subtracting the - 21 but I struggled to get the power percentage right
    // amongst other things including the amount of force being generated.  
    let powerPercent = map(this.cueDistance - 21, this.minDistance - 21, this.maxDistance - 21, 0.00, 1, true);

    fill(50);
    rect(x, y, w, h, 5);
    
    // Changes color of the fill based on how much force is to be applied
    // Anything above 94% risks ball flyout from the table.
    if (powerPercent > 0.94) {
      fill(255, 0, 0);
    } else if (powerPercent > 0.6) {
      fill(255, 165, 0);
    } else {
      fill(0, 255, 0);
    }

    rect(x, y, w * powerPercent, h, 5);

    fill(255);
    textSize(12);
    textAlign(LEFT, CENTER);
    text(`Force: ${Math.round(powerPercent * 100)}%`, x, y + h + 14);
  }



  /**
   * Executes a strike by applying velocity to the cue and initiating fade-out.
   * This again took a lot of effort.  The cue strike was generally not occuring on the 
   * center of the target ball resulting in 'swipes' rather than strikes.  No wonder
   * my uncle never let me near his snooker table.
   * The 'cueAngle' attempts to resolve the issue and I researched quite a lot 
   * from google, stackoverflow, blogs. 
   */
  strike() {
    if (this.constraintRemoved) return;

    World.remove(world, this.constraint);
    this.constraintRemoved = true;

    const cuePos = this.getPosition();
    
    this.cueAngle = Math.atan2(whiteBall.position.y - cuePos.y, whiteBall.position.x - cuePos.x);
    Body.setAngle(this.body, this.cueAngle);
    Body.setStatic(this.body, false);

    let powerPercent = map(this.cueDistance, this.minDistance, this.maxDistance, 0.1, 0.58, true);
    powerPercent = powerPercent ** 2;

    const maxVelocity = 35;
    const velocity = {
      x: Math.cos(this.cueAngle) * powerPercent * maxVelocity,
      y: Math.sin(this.cueAngle) * powerPercent * maxVelocity
    };

    Body.setVelocity(this.body, velocity);

    setTimeout(() => {
      Body.setVelocity(this.body, { x: 0, y: 0 });
      Body.setAngularVelocity(this.body, 0);
      Body.setStatic(this.body, true);
      this.fadingOut = true;
    }, 500);
  }

  /**
   * Monitors white ball velocity to determine when it's safe to reset the cue.
   */
  checkForReset() {
    if (!this.constraintRemoved) return;

    const speed = Math.hypot(whiteBall.velocity.x, whiteBall.velocity.y);
    if (speed < 0.2) {
      if (!this.resetPending) {
        this.resetPending = true;
        this.resetTimer = millis();
      } else if (millis() - this.resetTimer > this.resetDelay) {
        this.reset();
        this.resetPending = false;
      }
    } else {
      this.resetPending = false;
    }
  }

  /**
   * Resets the cue to a new random angle and minimum distance near the white ball.
   */
  reset() {
    this.cueAngle = random(0, TWO_PI);
    this.cueDistance = this.minDistance;

    const pos = this.getPosition();
    World.remove(world, this.body);
    this.body = Bodies.rectangle(pos.x, pos.y, 120, 8, {
      density: 0.005,
      friction: 0.01,
      restitution: 0.4
    });
    Body.setAngle(this.body, this.cueAngle);
    World.add(world, this.body);

    this.constraint = Constraint.create({
      bodyA: this.body,
      pointB: pos,
      stiffness: 0.02,
      damping: 0.05,
      length: 0
    });
    World.add(world, this.constraint);

    this.constraintRemoved = false;
    this.isDragging = false;
    this.alpha = 255;
    this.visible = true;
    this.fadingOut = false;
  }
  
// ========== Event Handlers ==========
/**
 * Probably not the pefect place to put these but my decision was made for 
 * here based on the cue having the most interaction with the player. 
 * */  

  onMousePressed() {
    if (!this.constraintRemoved) this.isDragging = true;
  }

  onMouseDragged() {
    if (this.isDragging) {
      const dx = whiteBall.position.x - mouseX;
      const dy = whiteBall.position.y - mouseY;
      this.cueAngle = Math.atan2(dy, dx);
      this.cueDistance = constrain(dist(mouseX, mouseY, whiteBall.position.x, whiteBall.position.y), this.minDistance, this.maxDistance);
    }
  }

  onMouseReleased() {
    if (this.isDragging && !this.constraintRemoved) {
      this.strike();
    }
    this.isDragging = false;
  }

  /**
   * Handles keyboard input for rotating the cue and increasing power.
   * @param {number} k - The keyCode value (left, right, down, enter)
   */
  onKeyPressed(k) {
    const angleStep = 0.05;
    const drawStep = 2;

    if (!this.constraintRemoved && !this.isDragging) {
      if (k === 37) this.cueAngle -= angleStep; // LEFT
      else if (k === 39) this.cueAngle += angleStep; // RIGHT
      else if (k === 40) this.cueDistance = constrain(this.cueDistance + drawStep, this.minDistance, this.maxDistance); // DOWN
      else if (k === 13) this.strike(); // ENTER
    }
  }
}
