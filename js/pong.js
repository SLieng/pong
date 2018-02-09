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
	  while (true) {
			directions = this.vel.getDirections();

			let expectedPos = this.pos.getSum(this.vel*stepsLeft);


		}
		
    //this.pos.plus(this.vel)
    //actors.forEach(actor => {
        //if (this === actor) {return}
        //if (this.hasCollisionWith(actor)) {
            //this.vel.y *= -1
            //this.vel.x = 10*((this.pos.x-actor.pos.x)/actor.width)
        //}
    //})
    //if (this.pos.x < 0 || this.pos.x > 400) {
        //this.vel.x *= -1
    //}
}

Ball.prototype.hasCollisionWith = function(actor) {
    let xDistance = Math.abs(this.pos.x-actor.pos.x)
    let yDistance = Math.abs(this.pos.y-actor.pos.y)
    let totalWidth = (this.width+actor.width)/2
    let totalHeight = (this.height+actor.height)/2
    return (xDistance<=totalWidth && yDistance<=totalHeight)
}

Ball.prototype.outsideBounds = function() {
	//QUICK FIX
	if(this.pos.y < 0 || this.pos.y > 600) {
		return true;
	}
	return false;
}

Ball.prototype.respawn = function() {
	this.pos = new Vector(200, 300);
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
}

Paddle.prototype.update = function(actors,step) {
    this.pos.plus(this.vel)
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
}

Paddle.prototype.cmdMoveRight = function() {
	this.vel = new Vector(5,0);
	this.state = "right";
}

Paddle.prototype.cmdStop = function() {
	this.vel = new Vector(0,0);
	this.state = "stop";
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

				/// TEMP
				this.actors.forEach(actor => {
					switch(actor.type) {
						case "ball":	
							if(actor.outsideBounds()) {
								actor.respawn();
								this.sendLog(this.frameData);
								this.frameData = [];
								this.timePassed = -step;
							}
							break;
					}
			});
				this.timePassed += step;
        this.log();
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
    this.spawnBall(new Ball(new Vector(200,300), new Vector(0,4), "ball"));

    this.ai = [{"timePassed": 2, "cmd": "left"}]
		this.timePassed = 0;
	  this.frameData = [];
    
    this.active = true;
}

Game.prototype.spawnBall = function(ball) {
    this.actors.push(ball);
}
