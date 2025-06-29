/**
 * Helper class providing utility methods for vertex drawing,
 * mouse interaction using Matter.js, and text rendering via p5.js.
 */
class Helper {
    constructor() {
        // No initialization needed for this helper class
    }

    /**
     * Draws a closed shape connecting the provided vertices.
     * Uses p5.js beginShape and endShape methods.
     * 
     * @param {Array<{x: number, y: number}>} vertices - List of 2D points to connect.
     */
    drawVertices(vertices) {
        beginShape();
        for (let i = 0; i < vertices.length; i++) {
            vertex(vertices[i].x, vertices[i].y);
        }
        endShape(CLOSE);
    }

    /**
     * Sets up mouse interaction using Matter.js to allow dragging of the cue ball.
     * Limits mouse interaction using collision filter mask.
     * 
     */
    setupMouseInteraction() {
        let mouseConstraint;
        const mouse = Mouse.create(canvas.elt);
        const mouseParams = {
            mouse: mouse,
            constraint: { stiffness: 0.05 },
        };
        mouseConstraint = MouseConstraint.create(engine, mouseParams);

        // Adjust pixel ratio for display scaling
        mouseConstraint.mouse.pixelRatio = pixelDensity();

        // Allow interaction only with specific objects (e.g., cue ball)
        mouseConstraint.collisionFilter.mask = 0x0001;

        World.add(engine.world, mouseConstraint);
    }

    /**
     * Simple helper function to draw a foul or penalty message.
     * Only used for consecutive fouls in this implementation
     * 
     */
    drawFouls() {
        let cRed = color(255, 0, 0)
        if (ballLayout.foul) {
            console.log('This is a foul')
            this.drawText("Penalty! 2 consecutive colors potted: ", 350, 100, 18, cRed);
            // reset the foul flag after 3 seconds
            setTimeout(() => {
               ballLayout.foul = false;    
            }, 3000)
        }
    }
    
    /**
     * Draws text on the canvas with specified styling.
     * 
     * @param {string} _text - The text to display.
     * @param {number} x - X-coordinate for the text.
     * @param {number} y - Y-coordinate for the text.
     * @param {number} [_size=12] - Font size.
     * @param {number} [_fill=125] - Fill color (grayscale value).
     * @param {string} [_stroke=''] - Optional stroke color.
     */
    drawText(_text, x, y, _size=12, _fill=125, _stroke=''){
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
