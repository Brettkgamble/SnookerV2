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