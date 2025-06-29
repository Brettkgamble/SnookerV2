/**
 * Class representing the ball layout, state tracking, and rule enforcement for a snooker/pool-style game.
 * Manages creation, positioning, drawing, scoring, collision handling, and win condition for colored and red balls.
 */
class BallLayout {
  /**
   * Initializes the BallLayout with table size and ball dimensions.
   *
   * @param {number} tableLength - The full length of the pool/snooker table.
   * @param {number} ballDiameter - Diameter of each ball.
   */
  constructor(tableLength, ballDiameter) {
    // Matter.js world context
    this.world = World;

    // Gameplay control flags
    this.gameOption = "";
    this.target = "Red Ball";   // Initial target ball type
    this.won = false;
    this.foul = false;
    this.penalty = false;
    this.penaltyMessage = "";
    this.ballCollided = false;

    this.MESSAGE_DURATION = 2000; // Time to display messages

    // Ball dimensions
    this.ballDiameter = ballDiameter;
    this.ballRadius = ballDiameter / 2;
    this.ballSpacing = 7;

    // Track state of play
    this.redBallIn = false;
    this.consecutiveColors = 0;

    // Define legal table bounds (based on cushion/railing offsets)
    this.tableXMin = 150 + 12 + table.railingWidth + table.cushionWidth;
    this.tableXMax = 950 - 24 - table.railingWidth - table.cushionWidth;
    this.tableYMin = 60 + 12 + table.railingWidth + table.cushionWidth;
    this.tableYMax = 460 - 12 - table.railingWidth - table.cushionWidth;

    // Active balls
    this.balls = {
      red: [],
      color: []
    };

    // Predefined positions and values for colored balls
    this.coloredBalls = {
      black:  { x: 150 + tableLength - tableLength / 12, y: 260, label: "Black Ball",  color: "black",  value: 7 },
      pink:   { x: 750, y: 260, label: "Pink Ball",   color: "pink",   value: 6 },
      blue:   { x: 150 + tableLength / 2, y: 260, label: "Blue Ball",   color: "blue",   value: 5 },
      brown:  { x: 150 + tableLength / 5, y: 260, label: "Brown Ball",  color: "brown",  value: 4 },
      green:  { x: 150 + tableLength / 5, y: 335, label: "Green Ball",  color: "green",  value: 3 },
      yellow: { x: 150 + tableLength / 5, y: 185, label: "Yellow Ball", color: "yellow", value: 2 },
    };
  }

  /**
   * Returns the number of red balls currently in play.
   * @returns {number}
   */
  countReds() {
    return this.balls.red.length;
  }

  /**
   * Returns the number of colored balls defined for the game.
   * @returns {number}
   */
  countColors() {
    return Object.keys(this.coloredBalls).length;
  }

  /**
   * Sets the game configuration (standard, unordered, or random) and creates the balls accordingly.
   * @param {string} gameOption - Game mode type.
   */
  setGameOption(gameOption) {
    this.gameOption = gameOption;
    this.createBalls(gameOption);
  }

  /**
   * Renders a penalty message to the screen if a foul has occurred.
   * This code is old code and is no longer used.  Kept for documentation purposes.
   */
  drawPenalty() {
    push();
    textSize(24);
    stroke(this.penalty ? "red" : 0);
    fill(this.penalty ? "red" : 0);
    text("Penalty!" + this.penaltyMessage, 10, 300);
    pop();
  }

  /**
   * Creates and adds a new ball to the world and stores it in the appropriate list.
   */
  createBall(x, y, color, value, label) {
    const ball = new Ball(x, y, color, value, label);
    this.balls[color === "red" ? "red" : "color"].push(ball);
    World.add(engine.world, [ball.object]);
  }

  /**
   * Removes a ball from the physics world and its internal tracking array.
   * This occurs for red balls that are potted
   */
  removeBall(array, index) {
    World.remove(engine.world, [array[index].object]);
    array.splice(index, 1);
  }

  /**
   * Generates a triangular rack of red balls in a fixed location.
   * This was quite hard and I spent a lot of time here.  The first red ball location 
   * was always good, and the x positions of all the balls was also good.  However, the
   * y position was slightly off and took some figuring out to get it close enough to be
   * good for the game.
   */
  createRedBalls() {
    const initialX = 750 + this.ballDiameter;
    const initialY = 262;
    const radius = 4.7;
    for (let i = 0; i < 6; i++) {
      const yPos = initialY - i * radius + 2.5;
      for (let j = 0; j < i; j++) {
        this.createBall(
          initialX + i * (this.ballRadius + this.ballSpacing),
          yPos + 2 * j * this.ballDiameter,
          'red',
          1,
          "Red Ball"
        );
      }
    }
  }

  /**
   * Adds the colored balls to the world in their traditional starting positions.
   */
  createOrderedColoredBalls() {
    for (const color in this.coloredBalls) {
      const ball = this.coloredBalls[color];
      this.createBall(ball.x, ball.y, ball.color, ball.value, ball.label);
    }
  }

  /**
   * Randomly places all red and colored balls within table bounds.
   * Unordered balls is completely random placement of all balls except the cue ball.
   * Note that the colored balls are from a dictionary whereas the red balls are from
   * an array.
   */
  createUnorderedBalls() {
    // reds
    for (let i = 0; i < 15; i++) {
      this.createBall(
        random(this.tableXMin, this.tableXMax),
        random(this.tableYMin, this.tableYMax),
        'red',
        1,
        "Red Ball"
      );
      Sleeping.set(this.balls.red[i].object, false);
    }

    // colors  
    Object.entries(this.coloredBalls).forEach(([key, val], i) => {
      this.createBall(
        random(this.tableXMin, this.tableXMax),
        random(this.tableYMin, this.tableYMax),
        val.color,
        val.value,
        val.label
      );
      Sleeping.set(this.balls.color[i].object, false);
    });
  }

  /**
   * Places red balls randomly and colored balls in their standard layout.
   */
  createPartiallyOrderedBalls() {
    // reds - array
    for (let i = 0; i < 15; i++) {
      this.createBall(
        random(this.tableXMin, this.tableXMax),
        random(this.tableYMin, this.tableYMax),
        'red',
        1,
        "Red Ball"
      );
      Sleeping.set(this.balls.red[i].object, false);
    }
    
    // colors - dictionary  
    for (const color in this.coloredBalls) {
      const ball = this.coloredBalls[color];
      this.createBall(ball.x, ball.y, ball.color, ball.value, ball.label);
    }
  }

  /**
   * Master switch to generate the ball layout based on the selected game type.
   */
  createBalls(gameOption) {
    switch (gameOption) {
      case "standard":
        this.createRedBalls();
        this.createOrderedColoredBalls();
        break;
      case "unordered":
        this.createPartiallyOrderedBalls();
        break;
      case "random":
        this.createUnorderedBalls();
        break;
      default:
        break;
    }
  }

  /**
   * Sets all active balls to either sleeping or active state.
   * @param {boolean} asleep - Whether balls should be put to sleep.
   */
  setSleep(asleep) {
    for (const balltype in this.balls) {
      for (const ball of this.balls[balltype]) {
        Sleeping.set(ball.object, asleep);
      }
    }
  }

  /**
   * Detects and handles when a ball has fallen into a pocket, updating scores and game state accordingly.
   */
  ballInPocket() {
    for (const balltype in this.balls) {
      for (const ball of this.balls[balltype]) {
        const px = ball.object.position.x;
        const py = ball.object.position.y;

        if (table.testBallInHole(px, py)) {
          // Logic for red balls
          if (ball.color === "red") {
            this.redBallIn = true;
            this.removeBall(this.balls.red, this.balls.red.indexOf(ball));
            scoreboard.addScore(ball.value);
            this.target = "Colored Ball";
          }
          // Logic for colored balls
          else {
            this.removeBall(this.balls.color, this.balls.color.indexOf(ball));
            this.consecutiveColors++;

            if (this.consecutiveColors >= 2) {
              // foul and foul message are no longer used
              this.foul = true;
              this.foulMessage = "Penalty: Two consecutive colors sunk";
              scoreboard.addScore(-4);
              this.consecutiveColors = 0;
            }

            if (this.balls.red.length !== 0) {
              const c = this.coloredBalls[ball.color];
              this.createBall(c.x, c.y, ball.color, ball.value, ball.label);
            } else {
              this.target = "Red Ball";
            }

            if (this.balls.red.length === 0 && this.balls.color.length === 0) {
              this.won = true;
            }

            this.redBallIn = false;
            scoreboard.addScore(ball.value);
          }
        }
      }
    }
  }

  /**
   * Handles foul logic if a red ball is incorrectly hit or sunk.
   * Old code. no longer used
   */
  /* redBallsCollided() {
    if ((this.redBallIn || this.ballCollided === "color") && !this.foul) {
      this.foul = true;
      this.foulMessage = "Red ball hit";
    }
    this.redBallIn = true;
    this.ballCollided = "red";
  } */

  /**
   * Handles foul logic if a colored ball is incorrectly hit or sunk.
   * old code no longer used
   */
  // coloredBallsCollided() {
  //   if ((!this.redBallIn || this.balls.red.length !== 0) && !this.foul) {
  //     this.foul = true;
  //     this.foulMessage = "Colored ball hit";
  //   }
  //   this.redBallIn = false;
  //   this.ballCollided = "color";
  // }

  /**
   * Detects if the white ball has collided with any target ball.
   * @param {Body} whiteBall - The white cue ball.
   * A part of the rubic that requires messages for each collision that the
   * whiteball has within the world.  Includes collisions with the cushions,
   * other balls, and the cue.
   * Collisions and how they mask were quite difficult to understand and get
   * going as they rely in a byte pattern divided by 2.
   */
  ballCollision(whiteBall) {
    for (const balltype in this.balls) {
      for (const ball of this.balls[balltype]) {
        if (Collision.collides(whiteBall, ball.object)) {
          if (ball.color === "red") this.redBallsCollided();
          else this.coloredBallsCollided();
        }
      }
    }
  }

  /**
   * Prepares the game state for a new player turn.
   */
  newTurn() {
    this.foul = false;
    this.foulMessage = "";
    this.consecutiveColors = 0;
    this.setSleep(true);
  }

  /**
   * Displays a win message if the game is won.
   */
  checkWin() {
    if (this.won) {
      helper.drawText("YOU WIN!!!", 450, 200, 32, color(0, 255, 0));
    }
  }

  /**
   * Renders all active balls using color-coded fill.
   */
  drawBalls() {
    for (const balltype in this.balls) {
      for (const ball of this.balls[balltype]) {
        switch (ball.color) {
          case "black": fill(0); break;
          case "blue": fill(70, 0, 255); break;
          case "brown": fill(150, 75, 0); break;
          case "green": fill(0, 128, 0); break;
          case "pink": fill(241, 156, 187); break;
          case "red": fill(200, 0, 0); break;
          case "yellow": fill(255, 255, 0); break;
          default: fill(125); break;
        }
        noStroke();
        helper.drawVertices(ball.object.vertices);
      }
    }
  }
}
