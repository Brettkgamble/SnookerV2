 /**
 * Creates and returns a Matter.js circular physics body representing a snooker or pool ball,
 * along with its associated color and point value metadata.
 *
 * @param {number} x - The x-coordinate of the ball's initial position.
 * @param {number} y - The y-coordinate of the ball's initial position.
 * @param {string} color - The ball's display color (e.g., 'red', 'yellow', 'blue').
 * @param {number} value - The point value associated with this ball (e.g., red = 1, black = 7).
 * @param {string} label - A unique string label used to identify the ball in collision events or rendering.
 *
 * @returns {Object} An object containing:
 *   - `object`: A Matter.js `Body` instance (a circular body with snooker-like physics settings),
 *   - `color`: The provided ball color,
 *   - `value`: The scoring value assigned to the ball.
 *   - `label`: A label associated with the ball type that is used for collision detection purposes
 *
 * @example
 * const redBall = Ball(200, 100, 'red', 1, 'redBall');
 * World.add(world, redBall.object);
 *
 * @note
 * - Ball radius is set to 400 / 72 (approx. 5.55) to simulate realistic size.
 * - Collision filter ensures interaction with cushions, the white ball, and other balls only.
 * - Mouse interactions are implicitly disabled by excluding cue category from mask.
 * - Restitution (0.95) ensures realistic bounce; friction is set to 0 for smooth sliding.
 */
function Ball(x, y, color, value, label) {
  // console.log('Label', label)
  //returns an object with the matter js body, the ball's color, and the value
  return {
    object: Bodies.circle(x, y, 400 / 72, {
      // label : (color === 'red' ? "redBall" : "coloredBall "),
      label: label,
      isSleeping: false,
      //disables mouse interaction with the red and colored balls
      collisionFilter: {
        category: CATEGORY_BALL,
        mask: CATEGORY_CUSHION | CATEGORY_WHITEBALL | CATEGORY_BALL
      },
      restitution: 0.95,
      friction: 0,
      density: 0.04,
    }),
    color: color,
    value: value,
  };
}
