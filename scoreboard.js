/**
 * ScoreBoard class is responsible for tracking and displaying the player's score
 * 
 * This is very simple and could be enhanced a lot.  It serves the purpose.
 */
class ScoreBoard {
    /**
     * Initializes the scoreboard with a default score of 0.
     */
    constructor() {
        this.score = 0;
    }

    /**
     * Adds a specified number of points to the current score.
     * 
     * @param {number} points - The number of points to add.
     */
    addScore(points) {
        this.score = this.score + points;
    }

    /**
     * Renders the current score to the screen.
     * Uses a helper function to draw styled text in the top-left area of the canvas.
     * 
     * Note: Requires `push()` before the helper function call to preserve drawing state.
     */
    drawScore() {
        push(); // Save current drawing style
            // Draws score in yellow at coordinates (10, 80) with font size 24
            helper.drawText("Score: " + this.score, 10, 80, 24, color(255, 255, 0));
        pop();  // Restore previous drawing style
    }
}
