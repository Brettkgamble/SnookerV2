function setupCueBall(x, y){
    // console.log('Physics - setupCueBall')
    
   whiteBall = Bodies.circle(x, y, 5 , {
    restitution: 0.9,
    friction: 0.01,
    density: 0.04,
    collisionFilter: {
        category: CATEGORY_WHITEBALL,
        mask: CATEGORY_CUE | CATEGORY_OTHER
    }
  })

  World.add(engine.world, whiteBall)
}

function drawWhiteBall() {
    push ();
        fill (255);
        helper.drawVertices(whiteBall.vertices)
    pop ();
}

function whiteBallInPlay() {
  /* 
    This function dectects whether the white ball is within the field of play.
    This also includes the position of the cue drawback as the cue stick end 
    (contact point) cannot ever be physically outside the table when setting
    up to strike the white ball.
  */
  // Table field dimensions are table length and width less or 
  // plus railings for a rectangular field
  // TopL(165, 75); TopR(935, 75), BotL(165, 445), BotR(935, 445)
  return (whiteBall.position.y >= 75 && whiteBall.position.y <= 445 &&
          whiteBall.position.x >= 165 && whiteBall.position.x <= 935)
}