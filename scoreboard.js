class ScoreBoard {
    constructor() {
        this.score = 0;
    }

    addScore(points) {
        this.score = this.score + points;
    }

    drawScore() {
        // very interesting.  this will not work if you do not have an expression before
        // the function call
        push ();
           helper.drawText("Score: " + this.score, 10, 80, 24, color(255, 255, 0));
        pop ();
    }
}