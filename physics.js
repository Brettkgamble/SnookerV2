/** 
 * This file is a remnant of the physics.js file used in the Angry birds simulation
 * 
 */

/**
 * Initializes the white cue ball in the physics engine at the specified coordinates.
 * 
 * @param {number} x - The x-coordinate for the cue ball's initial position.
 * @param {number} y - The y-coordinate for the cue ball's initial position.
 * 
  */
function setupCueBall(x, y) {
    whiteBall = Bodies.circle(x, y, 5, {
        label: "whiteBall",
        restitution: 0.95, // Makes the ball bounce realistically
        friction: 0,       // Allows smooth rolling without slowdown
        density: 0.04,     // Affects how the ball responds to forces
        collisionFilter: {
            category: CATEGORY_WHITEBALL,
            mask: CATEGORY_CUE | CATEGORY_BALL | CATEGORY_CUSHION // Defines what this ball can collide with
        }
    });

    World.add(engine.world, whiteBall); // Add the white ball to the physics world
}

/**
 * Renders the white ball on the canvas.
 * Uses a helper function to draw the ball using its current vertex positions.
 */
function drawWhiteBall() {
    push();                  // Save current drawing style settings
        fill(255);           // Set fill color to white
        helper.drawVertices(whiteBall.vertices); // Draw the white ball shape
    pop();                   // Restore previous style settings
}

/**
 * Checks whether the white ball (and the cue's contact point) is within the playable field.
 * This prevents cue interaction if the white ball is too close to or outside the table boundary.
 * 
 * @returns {boolean} - True if the white ball is within table bounds; false otherwise.
 */
function whiteBallInPlay() {
    // Field boundaries (excluding railings): TopL(165, 75) to BotR(935, 445)
    return (
        whiteBall.position.y >= 75 && whiteBall.position.y <= 445 &&
        whiteBall.position.x >= 165 && whiteBall.position.x <= 935
    );
}

/**
 * Removes the white ball from the physics simulation world.
 * Useful when resetting the table or removing the ball after a foul.
 */
function removeWhiteBallFromWorld() {
    World.remove(engine.world, [whiteBall]);
}
