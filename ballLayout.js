class BallLayout {
    constructor(tableLength, ballDiameter) {
        this.world = World;
        this.gameOption = "";
        this.target = "Red Ball";
        this.won = false;
        this.foul = false;

        // used for random placement of balls to ensure they are within the table limits
        this.tableXMin = 150 + 12 + table.railingWidth + table.cushionWidth;
        this.tableXMax = 950 - 24 - table.railingWidth - table.cushionWidth;
        this.tableYMin = 60 + 12 + table.railingWidth + table.cushionWidth;
        this.tableYMax = 460 - 12 - table.railingWidth - table.cushionWidth;

        this.ballDiameter = ballDiameter;
        this.ballRadius = ballDiameter / 2;
        this.ballSpacing = 7;

        // rule of play: red/color/red/color until no more reds
        this.consecutiveColors = 0;
        // track if the last ball sunk is red
        this.redBallIn = false;

        this.ballCollided = false;

        this.penalty = false;
        this.penaltyMessage = "";

        this.balls = {
            red: [],
            color: []
        };

        /* 
           
        */
        this.coloredBalls = {
            black: {
                x: 150 + tableLength - (tableLength/12),
                y: 260,
                color: "black",
                value: 7
            },
            pink: {
                x: 750,
                y: 260,
                color: "pink",
                value: 6
            },
            blue: {
                x: 150 + tableLength/2,
                y: 260,
                color: "blue",
                value: 5
            },
            brown: {
                x: 150 + tableLength / 5,
                y: 260,
                color: "brown",
                value: 4
            },
            green: {
                x: 150 + tableLength / 5,
                y: 335,
                color: "green",
                value: 3
            },
            yellow: {
                x: 150 + tableLength / 5,
                y: 185,
                color: "yellow",
                value: 2
            },
        };
    }

    setGameOption(gameOption) {
        this.gameOption = gameOption;
        this.createBalls(gameOption);
    }

    drawPenalty() {
        push ();
            textSize(24);
            stroke(this.penalty ? "red" : 0);
            fill(this.penalty ? "red" : 0);
            text("Penalty!" + this.penaltyMessage, 10, 300);
        pop ();
    }

    createBall(x, y, color, value) {
        // console.log('ball', x, y, color, value)
        let ball = new Ball(x, y, color, value);
        
        // console.log('Ball', ball)
        this.balls[color == "red" ? "red" : "color"].push(ball);
        World.add(engine.world, [ball.object]);
    }

    removeBall(array, index) {
        World.remove(engine.world, [array[index].object]);
        array.splice(index, 1);
    }

    createRedBalls() {
        let initialX = 750 + this.ballDiameter;
        let initialY = 262;
        let radius= 4.7;
        for (var i = 0; i < 6; i++) {
            let yPos = initialY  - i * radius + 2.5;
            for (var j = 0; j < i; j++) {
                this.createBall(
                    initialX + i * (this.ballRadius + this.ballSpacing),
                    yPos + 2 * j * (this.ballDiameter),
                    'red',
                    1
                );
            }
        }
    }

    createOrderedColoredBalls() {
        for (let color in this.coloredBalls) {
            this.createBall(
                this.coloredBalls[color].x,
                this.coloredBalls[color].y,
                this.coloredBalls[color].color,
                this.coloredBalls[color].value,
            );
        }
    }

    createUnorderedBalls() {
        // table x limits are 150 to 950
        // table y limits are 60 to 460
        // FIrst randomly generate 15 red balls
        for (let i = 0; i < 15; i++) {
            this.createBall(
                random(this.tableXMin, this.tableXMax),
                random(this.tableYMin, this.tableYMax),
                'red',
                1
            );
            Sleeping.set(this.balls.red[i].object, false);
        }
        // colored balls
        for (let i = 0; i < Object.keys(this.coloredBalls).length; i++) {
            let color = Object.keys(this.coloredBalls)[i];
            this.createBall(
                random(this.tableXMin, this.tableXMax),
                random(this.tableYMin, this.tableYMax),
                color,
                this.coloredBalls[color].value
            );
            
            Sleeping.set(this.balls.color[i].object, false);

        }
    }   

    createPartiallyOrderedBalls() {
        // table x limits are 150 to 950
        // table y limits are 60 to 460
        // FIrst randomly generate 15 red balls
        for (let i = 0; i < 15; i++) {
            this.createBall(
                random(this.tableXMin, this.tableXMax),
                random(this.tableYMin, this.tableYMax),
                'red',
                1
            );
            Sleeping.set(this.balls.red[i].object, false);
        }
        // colored balls
        for (let i = 0; i < Object.keys(this.coloredBalls).length; i++) {
            let color = Object.keys(this.coloredBalls)[i];
            this.createBall(
                this.coloredBalls[color].x,
                this.coloredBalls[color].y,
                this.coloredBalls[color].color,
                this.coloredBalls[color].value,
            );
        }
    }

    createBalls(gameOption) {
        switch (gameOption) {
            case "standard":
                this.createRedBalls();
                this.createOrderedColoredBalls();
                break;
            case "unordered":
                this.createPartiallyOrderedBalls();
                break;
            case "random":
                this.createUnorderedBalls();
                break;
            default: 
                break;
        }
    }

    setSleep(asleep) {
        for (let balltype in this.balls) {
            for (let ball of this.balls[balltype]) {
                Sleeping.set(ball.object, asleep);
            }
        }
    }

    ballInPocket() {
        let c = (255);
        helper.drawText("consecutive colors" + this.consecutiveColors, 400, 200, 24, c);
        for (let balltype in this.balls) {
            for (let ball of this.balls[balltype]) {
                // test for ball in field or pocket
                let px = ball.object.position.x;
                let py = ball.object.position.y;
                if (table.testBallInHole(px, py)) {
                    if (ball.color == "red") {
                        // track that the ball sunk was red.  Next is a color
                        this.redBallIn = true;
                        // Ball in pocket remove from red ball array
                        this.removeBall(this.balls.red, this.balls.red.indexOf(ball));
                        scoreBoard.addScore(ball.value);
                        this.target = "Colored Ball";
                    }
                    else {
                        // remove colored 
                        // scoreBoard.addScore(ball.value)
                        this.removeBall(this.balls.color, this.balls.color.indexOf(ball));
                        // rule of play is that if two consecutive colors fall then a
                        // foul has occured.  The order is red/color/red/color until
                        // there are no more reds left
                        this.consecutiveColors++;
                        if (this.consecutiveColors >= 2) {
                            console.log('Consecutive colors?');
                            this.foul = true;
                            let cRed = (255, 0, 0);
                            this.foulMessage = "Penalty:  Two consecutive colors sunk";
                            scoreBoard.addScore(-4);
                        }
                        // If there are red balls remaining we add back the colored balls
                        // as they are sunk
                        if (this.balls.red.length != 0 ){
                            this.createBall(
                                this.coloredBalls[ball.color].x,
                                this.coloredBalls[ball.color].y,
                                ball.color,
                                ball.value
                            );
                        } else {
                            this.target = "Red Ball";
                        }
                        if (this.balls.red.length == 0 && this.balls.color.length == 0 ) {
                            this.won = true;
                        }
                        this.redBallIn = false;
                        scoreBoard.addScore(ball.value);
                    }
                    // scoreBoard.addScore(ball.value)
                }
            }
        }
    }

    redBallsCollided() {
        if ((this.redBallIn || this.ballCollided == "color") && !this.foul ) {
            this.foul = true;
            this.foulMessage = "Red ball hit";
            // scoreBoard.addScore(-4)
        } 
        this.redBallIn = true;
        this.ballCollided = "red";
    }

    coloredBallsCollided() {
        if ((!this.redBallIn || this.balls.red.length != 0) && !this.foul ) {
            this.foul = true;
            this.foulMessage = "Colored ball hit";
            // scoreBoard.addScore(-4)
        } 
        this.redBallIn = false;
        this.ballCollided = "color";
    }

    ballCollision(whiteBall) {
        for (let balltype in this.balls) {
            for (let ball of this.balls[balltype]) {
                if (Collision.collides(whiteBall, ball.object)){
                    if (ball.color == "red") {
                        this.redBallsCollided();
                    } else {
                        this.coloredBallsCollided();
                    }
                }
            }
        }
    }

    newTurn() {
        this.foul = false;
        this.foulMessage = "";
        // ballCollided = "";
        this.consecutiveColors = 0;
        this.setSleep(true);
    }

    checkWin() {
        let c;
        if (this.won) {
            c = color(0, 255, 0);
        } else {
            c = color(255, 255, 255);
        }
        if (this.won) {
            helper.drawText("YOU WIN!!!", 450, 200, 32, c, c);
        }
    }

    drawBalls() {
        // console.log("Draw balls")
        for (let balltype in this.balls) {
            // console.log(balltype);
            for (let ball of this.balls[balltype]) {
                // console.log(ball.object);
                switch (ball.color) {
                    case 'black':
                        fill(0);
                        break;
                    case 'blue':
                        fill(70, 0, 255);
                        break;
                    case 'brown':
                        fill(150, 75, 0);
                        break;
                    case 'green':
                        fill(0, 128, 0);
                        break;
                    case 'pink':
                        fill(241, 156, 187);
                        break;
                    case 'red':
                        fill(200, 0, 0);
                        break;
                    case 'yellow':
                        fill(255, 255, 0);
                        break;
                    default:
                        fill(125);
                        break;
                }
                noStroke();
                helper.drawVertices(ball.object.vertices);
            }
        }
    }
}
