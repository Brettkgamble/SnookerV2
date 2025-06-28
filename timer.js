class Timer {
    constructor() {
        this.startTime = null;
        this.endTime = null;
        this.limitMinutes = 10;
        this.limitSeconds = 0;
    }

    startTimer() {
        if (frameCount % 60 === 0) {
            if (this.limitMinutes == 0 && this.limitSeconds == 0) {
                this.limitMinutes = 0;
                this.limitSeconds = 0;
                noLoop();
            } else if (this.limitSeconds == 0) {
                this.limitMinutes -= 1;
                this.limitSeconds = 60;
            }
            this.limitSeconds -= 1;
        }
    }

      //draws the timer
  drawTimer() {
    push();
      let cBlue = color(0, 0, 255);
      let cRed = color(255, 0, 0);
      //adds a "0" before the minutes and seconds if they're less than 10
      if (this.limitMinutes + this.limitSeconds != 0) {
        helper.drawText(`Time left: ${this.limitMinutes < 10 ? "0" + this.limitMinutes : this.limitMinutes}:${
            this.limitSeconds < 10 ? "0" + this.limitSeconds : this.limitSeconds
          }`, 10, 50, 18, cBlue)
      } else {
        helper.drawText("TIME'S UP!", 450, 200, 32, cRed);
      }
    pop();
  };

}