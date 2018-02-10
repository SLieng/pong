const GAME_WIDTH = 400
const GAME_HEIGHT = 600

const BALL_RADIUS = 10
const PADDLE_HEIGHT = 10
const PADDLE_WIDTH = 80

//=============================================================Vector
//=============================================================
function Vector(x,y) {
    this.x = x
    this.y = y
}

Vector.prototype.plus = function(otherVector) {
    this.x += otherVector.x
    this.y += otherVector.y
}

Vector.prototype.multiply = function(scalar) {
	 return new Vector(this.x * scalar, this.y * scalar);
}

Vector.prototype.getSum = function(otherVector) {
		return new Vector(this.x + otherVector.x, this.y + otherVector.y)
}

Vector.prototype.getDirections = function() {
	let directions = [];
	if(this.x < 0) {
		directions.push("left");
	} else if(this.x > 0) {
		directions.push("right");
	}
	if(this.y < 0) {
		directions.push("up");
	} else if(this.y > 0) {
		directions.push("down");
	}
	return directions;
}

//==============================================================WALL
//===============================================================
function Wall(type, startVec, endVec) { //(, left, right) or (, up, down) RELATIVE POSITION
	this.type = type;
	this.startVec = startVec;
	this.endVec = endVec;
}

function Field() {
	this.pos = new Vector(0, 0);
	this.walls = [new Wall("left", new Vector(0, 0), new Vector(0, 600)), new Wall("right", new Vector(400, 0), new Vector(400, 600))];
}

Field.prototype.update = function(actors, step) {
}

Field.prototype.log = function(data) {
	return data;
}

//==============================================================BALL
//===============================================================
function Ball(initialPos, initialVel, id) {
    this.height = BALL_RADIUS
    this.width = BALL_RADIUS
    this.pos= initialPos
    this.vel= initialVel
    this.id = id
    this.type= "ball"
}

Ball.prototype.update = function(actors,step) {
	let stepsLeft = step;
	while (stepsLeft > 0) {
		directions = this.vel.getDirections();


		let stepsTaken = stepsLeft;
		let newVel = new Vector(this.vel.x, this.vel.y);
		let newPos = this.pos.getSum(this.vel.multiply(stepsLeft*100));

		for(let i=0; i<actors.length; i++) {
			if(actors[i] === this) continue;
			if(actors[i].walls) {
				for(let j=0; j<actors[i].walls.length; j++) {
					if(directions.includes(actors[i].walls[j].type)) {
						let corners = [new Vector(-BALL_RADIUS/2, -BALL_RADIUS/2), new Vector(BALL_RADIUS/2, -BALL_RADIUS/2), new Vector(-BALL_RADIUS/2, BALL_RADIUS/2), new Vector(BALL_RADIUS/2, BALL_RADIUS/2)];
						for(let k=0; k<corners.length; k++) {
							let oldCorner = this.pos.getSum(corners[k]);
							let newCorner = newPos.getSum(corners[k]);

							// y = mx + c
							let m = (newCorner.y - oldCorner.y)/(newCorner.x - oldCorner.x);
							let c = newCorner.y - m*newCorner.x;

							let absStartVec = actors[i].walls[j].startVec.getSum(actors[i].pos);
							let absEndVec = actors[i].walls[j].endVec.getSum(actors[i].pos);

							switch(actors[i].walls[j].type) {
								case "left":
								case "right":
									let xValue = absStartVec.x;
									let y = m*xValue + c;
									if((absStartVec.y <= y) && (y <= absEndVec.y)) {
										let ratio = Math.abs((y - oldCorner.y)/(newCorner.y - oldCorner.y));	
										let newTimeTaken = ratio*stepsLeft;
										if(newTimeTaken < stepsTaken) {
											stepsTaken = newTimeTaken;
											if(actors[i].walls[j].type == "left" && corners[k].getDirections().includes("left")) {
												newVel.x = Math.abs(this.vel.x);
											} else if (actors[i].walls[j].type == "right" && corners[k].getDirections().includes("right")) {
												newVel.x = -Math.abs(this.vel.x);
											}
											newVel.y = this.vel.y;
										}
									}
									break;
								case "up":
								case "down":
									let yValue = absStartVec.y;
									let x = (yValue-c)/m;
									if((absStartVec.x <= x) && (x <= absEndVec.x)) {
										let ratio = Math.abs((yValue - oldCorner.y)/(newCorner.y - oldCorner.y));	
										let newTimeTaken = ratio*stepsLeft;
										if(newTimeTaken < stepsTaken) {
											stepsTaken = newTimeTaken;
											newVel.x = this.vel.x;
											if(actors[i].walls[j].type == "up" && corners[k].getDirections().includes("up")) {
												newVel.y = Math.abs(this.vel.y);
											} else if(actors[i].walls[j].type == "down" && corners[k].getDirections().includes("down")){
												newVel.y = -Math.abs(this.vel.y);
											}
										}
									}
									break;
								}

							}
						}
					}
				}
			}
			if(stepsTaken == 0) {
				//console.log("STEPS TAKEN IS 0");
				this.pos.plus(this.vel.multiply(0.0001));
			  stepsLeft -= 0.001;
				//break;
			}

			this.pos.plus(this.vel.multiply(stepsTaken*100));
			this.vel = newVel;
			stepsLeft -= stepsTaken;
		}
	
}

Ball.prototype.hasCollisionWith = function(actor) {
    let xDistance = Math.abs(this.pos.x-actor.pos.x)
    let yDistance = Math.abs(this.pos.y-actor.pos.y)
    let totalWidth = (this.width+actor.width)/2
    let totalHeight = (this.height+actor.height)/2
    return (xDistance<=totalWidth && yDistance<=totalHeight)
}

Ball.prototype.log = function(data) {
	data.pos = { x: null, y: null};
	data.pos.x = this.pos.x;
	data.pos.y = this.pos.y;
}
//===========================================================PADDLE
//===========================================================
function Paddle(initialPos, initialVel, id) {
    this.width = PADDLE_WIDTH
    this.height = PADDLE_HEIGHT
    this.pos= initialPos
    this.vel= initialVel
    this.id = id
    this.type = "paddle"
	  this.state = "stop"
	  this.walls = [];
	  this.walls.push(new Wall("down", new Vector(-PADDLE_WIDTH/2, -PADDLE_HEIGHT/2), new Vector(PADDLE_WIDTH/2, -PADDLE_HEIGHT/2)));
	  this.walls.push(new Wall("left", new Vector(PADDLE_WIDTH/2, -PADDLE_HEIGHT/2), new Vector(PADDLE_WIDTH/2, PADDLE_HEIGHT/2)));
	  this.walls.push(new Wall("right", new Vector(-PADDLE_WIDTH/2, -PADDLE_HEIGHT/2), new Vector(-PADDLE_WIDTH/2, PADDLE_HEIGHT/2)));
	  this.walls.push(new Wall("up", new Vector(-PADDLE_WIDTH/2, PADDLE_HEIGHT/2), new Vector(PADDLE_WIDTH/2, PADDLE_HEIGHT/2)));
}

Paddle.prototype.update = function(actors,step) {
    this.pos.plus(this.vel.multiply(step*100))
}

Paddle.prototype.receiveCmd = function(command) {
	switch(command) {
			case "left":
			this.cmdMoveLeft();
			break;
		case "right":
			this.cmdMoveRight();
			break;
		case "stop":
			this.cmdStop();
			break;
	}
}

Paddle.prototype.cmdMoveLeft = function() {
	this.vel = new Vector(-5,0);
	this.state = "left";
	this.warp();
}

Paddle.prototype.cmdMoveRight = function() {
	this.vel = new Vector(5,0);
	this.state = "right";
	this.warp();
}

Paddle.prototype.cmdStop = function() {
	this.vel = new Vector(0,0);
	this.state = "stop";
	this.warp();
}

Paddle.prototype.warp = function() {
	if(this.pos.x < 0) {
		this.pos.x = 400 - this.pos.x;
	} else if(this.pos.x > 400) {
		this.pos.x = this.pos.x - 400;
	}
}

Paddle.prototype.log = function(data) {
	data.pos = { x: null, y: null};
	data.pos.x = this.pos.x;
	data.pos.y = this.pos.y;
	data.state = this.state;
}
//=================================================================GAME
//=================================================================
function Game() {
	this.width = GAME_WIDTH
    this.height = GAME_HEIGHT
    this.paddle1 = new Paddle(new Vector(200,50),new Vector(0,0),"player1");
    this.paddle2 = new Paddle(new Vector(200,550),new Vector(0,0),"player2");
    this.actors = [this.paddle1,this.paddle2]
    this.active = false

		this.actors.push(new Field());
}

Game.prototype.animate = function (step) {
    this.readKeyboardInput();
		this.readAIInput();
	
	if (this.active) {
        //OLD ACTORS ACT AS PREVIOUS STATE
        let oldActors = [...this.actors]

        this.actors.forEach(actor => {
            actor.update(this.actors, step)
        })
				this.timePassed += step;
        this.log();
    }

	if(this.ballOutsideBounds()) {
		this.respawnBall();
		this.sendLog(this.frameData);
		this.frameData = [];
		this.timePassed = -step;

	}
}

Game.prototype.log = function () {
  let newFrameEntry = {};

	this.actors.forEach((actor) => {
		let data = {};
		actor.log(data);
		let key = actor.id;
		newFrameEntry[key] = data;
	});

	newFrameEntry.timePassed = this.timePassed;

	this.frameData.push(newFrameEntry);
	//console.log(newFrameEntry);
}

Game.prototype.sendLog = function(data) {
	let game = this;
	$.ajax({
		type: "POST",
		contentType: "application/json; charset=utf-8",
		url: "/receiver",
		data: JSON.stringify(data)
	}).done(function(data) {
		console.log("SUCCESS in sending log");
		game.getAI();
	});
}

Game.prototype.getAI = function () {
	let game = this;
	$.ajax({
		type: "GET",
		contentType: "application/json; charset=utf-8",
		url: "/transmit"
	}).done(function(data) {
		game.ai = JSON.parse(data);
		//console.log(data);
		console.log("SUCCESS in getting AI");
	});
}

Game.prototype.begin = function () {
	  let initialVel = this.getBallStartVel()
	  this.ball = new Ball(new Vector(200,300), initialVel, "ball");
    this.spawnBall(this.ball);

    this.ai = [{"timePassed": 2, "cmd": "left"}]
		this.timePassed = 0;
	  this.frameData = [];
    
    this.active = true;
}

Game.prototype.getBallStartVel = function() {
	let x,y;
	if(Math.random() < 0.5) {
		y = 2;
	} else {
		y = -2;
	}

	x = 8*Math.random() - 4;
	return new Vector(x, y);
}

Game.prototype.ballOutsideBounds = function() {
	//QUICK FIX
	if(this.ball.pos.y < 0 || this.ball.pos.y > 600) {
		return true;
	}
	return false;
}

Game.prototype.respawnBall = function() {
	this.ball.pos = new Vector(200, 300);
  this.ball.vel =  this.getBallStartVel();
}

Game.prototype.spawnBall = function(ball) {
    this.actors.push(ball);
}

Game.prototype.readKeyboardInput = function () {
    //PLAYER 1
	if (keysDown.player1Left) {
		this.paddle1.cmdMoveLeft();
	} else if (keysDown.player1Right) {
		this.paddle1.cmdMoveRight();
	} else {
		this.paddle1.cmdStop();
	}
}

Game.prototype.readAIInput = function () {
	let numCommands = this.ai.length;
	let timePassed = this.timePassed;
	let receivedCmd = false;

	for(let i=1; i<numCommands; i++) {
		if(this.ai[i].timePassed > timePassed) {
			this.paddle2.receiveCmd(this.ai[i-1].cmd);
			receivedCmd = true;
			break;
		}
	}
	
	if(!receivedCmd) {
		//console.log(this.ai[numCommands-1].cmd);
			this.paddle2.receiveCmd(this.ai[numCommands-1].cmd);
	}

	//console.log(this.paddle2.pos.x);
}
