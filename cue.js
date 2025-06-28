// cue.js
// Collision Categories
// Only allow the cue to interact with the cue ball

const CATEGORY_CUE = 0x0001;
const CATEGORY_WHITEBALL = 0x0002;
const CATEGORY_OTHER = 0x0003;

class Cue {
  constructor() {
    // this.ball = ball;

     this.visible = true;
     this.alpha = 255;
     this.fadingOut = false;
    this.minDistance = 60;
    this.maxDistance = 120;
    this.cueDistance = 72;
    this.cueAngle = 0;

    this.isDragging = false;
    this.constraintRemoved = false;

    this.resetPending = false;
    this.resetTimer = 0;
    this.resetDelay = 1000;

    this.createBody();
  }

  createBody() {
    const pos = this.getPosition();
    this.body = Bodies.rectangle(pos.x, pos.y, 120, 8, {
      density: 0.005,
      friction: 0.01,
      restitution: 0.4,
      collisionFilter: {
        category: CATEGORY_CUE,
        mask: CATEGORY_WHITEBALL
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

  getPosition() {
    // console.log('getPosition', whiteBall    )
    if (whiteBall.position.x) {
      return {
        x: whiteBall.position.x - this.cueDistance * Math.cos(this.cueAngle),
        y: whiteBall.position.y - this.cueDistance * Math.sin(this.cueAngle)
      };  
    } 
  }

  update() {
    // console.log('cue , constrain removed, is dragging', this.constraintRemoved, this.isDragging)
    if (!this.constraintRemoved && !this.isDragging) {
      // console.log('cue.update')
      let pos = this.getPosition();
      console.log('cue.update, position', pos)
      Body.setPosition(this.body, pos);
      Body.setAngle(this.body, this.cueAngle);
      this.constraint.pointB = pos;
   }
  }

  draw() {

    if (!this.visible && !this.fadingOut) return;

    push();
      // this.update()
      translate(this.body.position.x, this.body.position.y);
      rotate(this.body.angle);

      const cueLength = 120;
      const buttWidth = 10;
      const tipWidth = 4;

      fill(180, 140, 90, this.alpha);
      // noStroke();
      beginShape();
        vertex(-cueLength / 2, -buttWidth / 2);
        vertex(-cueLength / 2, buttWidth / 2);
        vertex(cueLength / 2, tipWidth / 2);
        vertex(cueLength / 2, -tipWidth / 2);
      endShape(CLOSE);

      fill(255, this.alpha);
      ellipse(cueLength / 2 + 2, 0, 6, 6);
    pop();

    // if (!this.constraintRemoved) {
    //     stroke(255, 180);         
    //     strokeWeight(3);          
    //     line(
    //       this.body.position.x,
    //       this.body.position.y,
    //       this.constraint.pointB.x,
    //       this.constraint.pointB.y
    //     );
    //     strokeWeight(1);           // reset to default
    //     this.drawPowerBar();
    // }

    if (!this.constraintRemoved) {
        stroke(255, 180);
        strokeWeight(3);

        if (this.isDragging) {
          const start = this.constraint.pointB;
          const mx = mouseX;
          const my = mouseY;

          const dx = mx - start.x;
          const dy = my - start.y;
          const d = dist(mx, my, start.x, start.y);

          // Clip the endpoint to stay within cue body length
          const maxLen = this.cueDistance;
          const t = min(1, maxLen / d); // clamp scale
          const clippedX = start.x + dx * t;
          const clippedY = start.y + dy * t;

          line(start.x, start.y, clippedX, clippedY);
        } else {
          // fallback: draw to actual cue base
          line(this.body.position.x, this.body.position.y, this.constraint.pointB.x, this.constraint.pointB.y);
        }

      strokeWeight(1);
      this.drawPowerBar();
    }

    if (this.fadingOut) {
      this.alpha -= 5; // adjust speed: 5 per frame ≈ 1 second
      if (this.alpha <= 0) {
        this.alpha = 0;
        this.fadingOut = false;
        this.visible = false;
        World.remove(world, this.body);
      }
}


  }

  drawPowerBar() {
    const x = 20, y = 20, w = 200, h = 20;
    let powerPercent = map(this.cueDistance - 20, this.minDistance, this.maxDistance, 0, 1, true);

    fill(50);
    rect(x, y, w, h, 5);
    fill(0, 255, 0);
    rect(x, y, w * powerPercent, h, 5);

    fill(255);
    textSize(12);
    textAlign(LEFT, CENTER);
    text(`Force: ${Math.round(powerPercent * 100)}%`, x, y + h + 14);
  }

  onMousePressed() {
    if (!this.constraintRemoved) {
      this.isDragging = true;
    }
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

  onKeyPressed(k) {
    const angleStep = 0.05;
    const drawStep = 3;

    if (!this.constraintRemoved && !this.isDragging) {
      if (k === 37) {  // Left Arrow Key
        this.cueAngle -= angleStep;
      } else if (k === 39) { // Right arrow key
        this.cueAngle += angleStep;
      } else if (k === 40) {  // down arrow key
        this.cueDistance = constrain(this.cueDistance + drawStep, this.minDistance, this.maxDistance);
      } else if (k === 13) {
        this.strike();  // enter key
      }
    }
  }

  strike() {
    
    if (this.constraintRemoved) return;

    // Remove the cue constraint
    World.remove(world, this.constraint);
    this.constraintRemoved = true;

    // Recalulate the exact position and direction of the cue
    // I was finding that the cue only occasionally struck the
    // whiteball in the center.  If it was slighly off of center
    // the cue would just 'scrape' the ball and this was annoying
    const cuePos = this.getPosition();
    this.cueAngle = Math.atan2(whiteBall.position.y - cuePos.y, whiteBall.position.x - cuePos.x);
    
    // Body.setPosition(this.body, cuePos);
    Body.setAngle(this.body, this.cueAngle);
    Body.setStatic(this.body, false); // allow it to move

    // let powerPercent = map(this.cueDistance, this.minDistance, this.maxDistance, 0, 0.5, true);
    let powerPercent = map(this.cueDistance, this.minDistance, this.maxDistance, 0, 0.5, true);
    powerPercent = powerPercent **2; // ease in using a quadratic functin

    const maxVelocity = 35;
    const velocity = {
      x: Math.cos(this.cueAngle) * powerPercent * maxVelocity,
      y: Math.sin(this.cueAngle) * powerPercent * maxVelocity
    };

  // Apply velocity to cue
  Body.setVelocity(this.body, velocity);


    setTimeout(() => {
      Body.setVelocity(this.body, { x: 0, y: 0 });
      Body.setAngularVelocity(this.body, 0);
      Body.setStatic(this.body, true);

      // setTimeout(() => {
      //   World.remove(world, this.body);
      //   this.visible = false;
      //   this.fadinOut = true;
      // }, 1000)
      this.fadingOut = true;
    }, 500);
  }

  checkForReset() {
    if (!this.constraintRemoved) return;

    let speed = Math.hypot(whiteBall.velocity.x, whiteBall.velocity.y);
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

  reset() {
    this.cueAngle = random(0, TWO_PI);
    // this.cueDistance = random(80, 90);
    this.cueDistance = this.minDistance + 20;
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
}
