/**
 * Table class simulates a snooker table, including its visual components (slab, cushions, railings, pockets)
 * and physical interactions using Matter.js physics bodies.
 * 
 * The dimensions and properties are scaled to proportionally simulate a 12ft x 6ft real-world snooker table.
 */
class Table {
  constructor() {
    // Physical and visual dimensions of the table
    this.tableLength = 800;                    // Canvas width in pixels
    this.tableWidth = this.tableLength / 2;    // Table height
    this.tableStartX = 150;                    // Starting X position on canvas
    this.tableStartY = 60;                     // Starting Y position on canvas
    this.railingWidth = 15;                    // Width of railings around the table
    this.tableMidX = this.tableStartX + this.tableLength / 2;
    this.ballDiameter = this.tableWidth / 36;
    this.pocketSize = this.ballDiameter * 1.5;
    this.dLineRadius = this.tableWidth / 2;
    this.cushionAngle = 0.05;
    this.cushionWidth = this.tableWidth / 72 * 1.5; // Proportional cushion width
    this.smallRailWidth = 365;

    // Cushion physics properties
    this.cushionFriction = 0;
    this.cushionResitution = 1;

    this.cushions = [];
    this.setupCushions();
  }

  /**
   * Initializes and positions the six cushions around the table using trapezoidal shapes.
   * Applies physics properties and adds them to the Matter.js world.
   */
  setupCushions () {
    const config = {
      isStatic: true,
      friction: this.cushionFriction,
      restitution: this.cushionResitution,
      collisionFilter: {
        category: CATEGORY_CUSHION,
        mask: CATEGORY_WHITEBALL | CATEGORY_BALL
      }
    };

    // Define trapezoid cushions in approximate locations around the table
    // 
    this.cushions.push(
      Bodies.trapezoid(358,  79, this.smallRailWidth - 22.5, this.cushionWidth, -this.cushionAngle,
                      { ...config, label: 'top left cushion' }));
    this.cushions.push(
      Bodies.trapezoid(742,  79, this.smallRailWidth - 22,   this.cushionWidth, -this.cushionAngle, 
                      { ...config, label: 'top right cushion' }));
    this.cushions.push(
      Bodies.trapezoid(150 + this.railingWidth + 4, 259.5, 
                       this.smallRailWidth - 22, this.cushionWidth, this.cushionAngle, 
                       { ...config, label: 'left cushion', angle: Math.PI / 2 }));
    this.cushions.push(
      Bodies.trapezoid(358, 441, this.smallRailWidth - 6, this.cushionWidth, this.cushionAngle, 
                       { ...config, label: 'bottom left cushion' }));
    this.cushions.push(
      Bodies.trapezoid(742, 441, this.smallRailWidth - 6, this.cushionWidth, this.cushionAngle, 
                       { ...config, label: 'bottom right cushion' }));
    this.cushions.push(
      Bodies.trapezoid(931, 260, this.smallRailWidth - 24, this.cushionWidth, this.cushionAngle, 
                       { ...config, label: 'right cushion', angle: -Math.PI / 2 }));

    for (let cushion of this.cushions) {
      World.add(engine.world, cushion);
    }
  }

  /**
   * Draws the cushions.
   * Changes cushion color dynamically based on `render.visible` to simulate collision.
   */
  drawCushions () {
    for (let cushion of this.cushions) {
      push();
        noStroke();
        // Pretty nasty ui
        fill(cushion.render.visible ? "#346219" : "#69F319");
        helper.drawVertices(cushion.vertices);
        stroke(255);
      pop();
    }
  }

  /**
   * Draws the central green slab of the table.
   * Come up to the lab and see what's on the slab
   */
  drawSlab () {
    noStroke();
    fill(83, 108, 77); // Standard snooker green
    rect(this.tableStartX + 12, this.tableStartY, this.tableLength - 24, this.tableWidth);
  }

  /**
   * Draws the brown wood-colored railings around the edge of the table.
   */
  drawRailings () {
    fill(99, 59, 59);
    rect(this.tableStartX, this.tableStartY + 25, this.railingWidth, this.tableWidth - 50); // Left
    rect(162, this.tableStartY, this.tableLength - this.railingWidth - 12, this.railingWidth); // Top
    rect(this.tableStartX + this.tableLength - this.railingWidth, this.tableStartY + 20, 
         this.railingWidth, this.tableWidth - this.railingWidth - 20); // Right
    rect(150 + 25, this.tableWidth + 45, this.tableLength - this.railingWidth * 2 - 10, 15); // Bottom
  }

  /**
   * Draws decorative yellow-colored rectangular shapes to represent pockets.
   */
  drawYellowPockets () {
    fill(241, 215, 74);
    rect(this.tableStartX, this.tableStartY, 28, 28, 15, 0, 0, 0); // Top-left
    rect(this.tableMidX - 12, this.tableStartY, 24, 15);           // Top-center
    rect(this.tableStartX + this.tableLength - 28, this.tableStartY, 28, 28, 0, 15, 0, 0); // Top-right
    rect(this.tableStartX, this.tableStartY + this.tableWidth - 28, 28, 28, 0, 0, 0, 15);  // Bottom-left
    rect(this.tableMidX - 12, this.tableStartY + this.tableWidth - this.railingWidth, 24, 15); // Bottom-center
    rect(this.tableStartX + this.tableLength - 28, 
         this.tableStartY + this.tableWidth - 28, 28, 28, 0, 0, 15, 0); // Bottom-right
  }

  /**
   * Draws the actual ball-receiving holes (circular pockets) on the table surface.
   */
  drawHoles () {
    fill(125);
    ellipse(this.tableStartX + 22, this.tableStartY + 22, this.pocketSize); // Top-left
    ellipse(this.tableMidX, this.tableStartY + 15, this.pocketSize);        // Top-mid
    ellipse(150 + this.tableLength - 22, this.tableStartY + 22, this.pocketSize); // Top-right
    ellipse(this.tableStartX + 22, this.tableStartY + this.tableWidth - 22, this.pocketSize); // Bottom-left
    ellipse(this.tableMidX, this.tableStartY + this.tableWidth - 15 , this.pocketSize); // Bottom-mid
    ellipse(150 + this.tableLength - 22, this.tableStartY + this.tableWidth - 22, this.pocketSize); // Bottom-right
  }

  /**
   * Checks whether a given (x, y) coordinate is within one of the six pocket holes.
   * Used for detecting pocketed balls.
   * 
   * @param {number} px - X position of the ball
   * @param {number} py - Y position of the ball
   * @returns {boolean} true if the point is within any pocket radius
   */
  testBallInHole (px, py) {
    const holeXArray = [172, 550, 928, 172, 550, 928];
    const holeYArray = [82, 75, 82, 438, 445, 438];
    for (let i = 0; i < 6; i++) {
      let deltaX = (px - holeXArray[i]) ** 2;
      let deltaY = (py - holeYArray[i]) ** 2;
      let distance = Math.sqrt(deltaX + deltaY);
      if (distance < this.pocketSize) {
        return true;
      }
    }
    return false;
  }

  /**
   * Draws the vertical D-line and semi-circular arc used for cue ball placement.
   */
  drawDLine() {
    angleMode(DEGREES);
    const dlineXstart = 150 + this.tableLength / 5;
    const dlineYstart = this.tableStartY + this.railingWidth + this.cushionWidth;
    const dlineYend = this.tableStartY + this.tableWidth - 22;

    push();
      stroke(255);
      line(dlineXstart, dlineYstart, dlineXstart, dlineYend);
      noFill();
      arc(dlineXstart, this.tableStartY + this.tableWidth / 2, 150, 150, 90, 270);
    pop();
    angleMode(RADIANS);
  }

  /**
   * Checks for collision between the cue ball and any cushion.
   * If a collision is detected, the cushion’s color is updated to indicate impact.
   * 
   * @param {Matter.Body} cue - The cue ball body
   */
  cushionCollision (cue) {
    for (let cushion of this.cushions) {
      if (Collision.collides(cue, cushion)) {
        cushion.render.visible = false;
      } else {
        cushion.render.visible = true;
      }
    }
  }

  /**
   * Draws all components of the snooker table in order.
   */
  drawTable () {
    this.drawSlab();
    this.drawCushions();
    this.drawRailings();
    this.drawYellowPockets();
    this.drawHoles();
    this.drawDLine();
  }
}
