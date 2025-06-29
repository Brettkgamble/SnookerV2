/**
 * Timer class handles countdown logic and time display for a game.
 * Tracks a 10-minute timer and renders the remaining time on screen.
 */
class Timer {
    constructor() {
        /**
         * Timestamp when the timer starts (not used in countdown logic, reserved for extension).
         * @type {number|null}
         */
        this.startTime = null;

        /**
         * Timestamp when the timer ends (not used in countdown logic, reserved for extension).
         * @type {number|null}
         */
        this.endTime = null;

        /**
         * Countdown starting minutes.
         * @type {number}
         */
        this.limitMinutes = 10;

        /**
         * Countdown starting seconds.
         * @type {number}
         */
        this.limitSeconds = 0;
    }

    /**
     * Decreases the timer once per second, based on frame count.
     * When time runs out, stops the draw loop using p5.js `noLoop()`.
     */
    startTimer() {
        // Runs only once per second (assuming 60 FPS)
        if (frameCount % 60 === 0) {
            if (this.limitMinutes === 0 && this.limitSeconds === 0) {
                // Time's up: freeze game loop
                this.limitMinutes = 0;
                this.limitSeconds = 0;
                noLoop(); // p5.js function to stop continuous rendering
            } else if (this.limitSeconds === 0) {
                this.limitMinutes -= 1;
                this.limitSeconds = 60;
            }
            this.limitSeconds -= 1;
        }
    }

    /**
     * Renders the countdown timer on the screen.
     * Displays time in MM:SS format, or "TIME'S UP!" in red when time expires.
     */
    drawTimer() {
        push(); // Preserve current drawing state

        const cYellow = color(255, 255, 0);
        const cRed = color(255, 0, 0);

        if (this.limitMinutes + this.limitSeconds !== 0) {
            // Pad with leading zeros for single-digit values
            const minutes = this.limitMinutes < 10 ? "0" + this.limitMinutes : this.limitMinutes;
            const seconds = this.limitSeconds < 10 ? "0" + this.limitSeconds : this.limitSeconds;

            helper.drawText(`Time left: ${minutes}:${seconds}`, 10, 150, 18, cYellow);
        } else {
            // Display end-of-timer message
            helper.drawText("TIME'S UP!", 450, 200, 32, cRed);
        }

        pop(); // Restore previous drawing state
    }
}
