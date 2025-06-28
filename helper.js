class Helper {
    constructor() {}

    drawVertices(vertices) {
        beginShape();
        for (let i = 0; i < vertices.length; i++) {
            vertex(vertices[i].x, vertices[i].y)
        }
        endShape(CLOSE)
    };

    /* 
      There is an issue with this in chrome that writes a warning to the console.
      [violation] Added non-passive event listener to a scroll-blocking 'touchstart' event.
      A little research indicated that there is no solutionin p5 for this and to ignore it for the time being.
    */
    setupMouseInteraction = () => {
        //sets up the mouse interaction with the cue ball
        let mouseConstraint;
        const mouse = Mouse.create(canvas.elt);
        const mouseParams = {
            mouse: mouse,
            constraint: { stiffness: 0.05 },
        };
        mouseConstraint = MouseConstraint.create(engine, mouseParams);
        //disables mouse interaction with the other balls
        mouseConstraint.mouse.pixelRatio = pixelDensity();
        mouseConstraint.collisionFilter.mask = 0x0001;
        World.add(engine.world, mouseConstraint);
  };

  drawText = (_text, x, y, _size=12, _fill=125, _stroke='') => {
        textSize(_size);
        fill(_fill);
        if (_stroke != '')
            stroke(_stroke);
        else {
            noStroke();
        }
        text(_text, x, y);
  }
}




