 
function Ball(x, y, color, value) {
  //returns an object with the matter js body, the ball's color, and the value
  return {
    object: Bodies.circle(x, y, 400 / 72, {
      isSleeping: false,
      //disables mouse interaction with the red and colored balls
      collisionFilter: {
        category: CATEGORY_BALL,
        mask: CATEGORY_CUSHION | CATEGORY_WHITEBALL | CATEGORY_BALL
      },
      restitution: 0.9,
      friction: 0.7,
    }),
    color: color,
    value: value,
  };
}
