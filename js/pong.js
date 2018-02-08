const GAME_WIDTH = 400
const GAME_HEIGHT = 600

const BALL_RADIUS = 10
const PADDLE_HEIGHT = 10
const PADDLE_WIDTH = 80

let keysDown = {right: false, left: false, a: false, d: false, q: false, w: false}

document.addEventListener('keydown', function(event) {
  switch(event.keyCode) {
	case 37:
      keysDown.left = true;
	  break;
	case 39:
      keysDown.right = true;
	  break;
	case 65:
      keysDown.a = true;
      break;
	case 68:
      keysDown.d = true
	  break;
	case 81:
	  keysDown.q = true;
	  break;
	case 87:
	  keysDown.w = true;
	  break;
    }
});
document.addEventListener('keyup', function(event) {
  switch(event.keyCode) {
    case 37:
      keysDown.left = false;
      break;
    case 39:
      keysDown.right = false;
      break;
    case 65:
      keysDown.a = false;
      break;
    case 68:
      keysDown.d = false;
      break;
    case 81:
      keysDown.q = false;
      break;
    case 87:
      keysDown.w = false;
      break;
    }
});

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
    this.pos.plus(this.vel)
    actors.forEach(actor => {
        if (this === actor) {return}
        if (this.hasCollisionWith(actor)) {
            this.vel.y *= -1
            this.vel.x = 10*((this.pos.x-actor.pos.x)/actor.width)
        }
    })
    if (this.pos.x < 0 || this.pos.x > 400) {
        this.vel.x *= -1
    }
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
	this.pos = new Vector(200,250);
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
}

Game.prototype.animate = function (step) {
    this.readKeyboardInput();
		this.readAIInput();
	
	if (this.active) {
        //OLD ACTORS ACT AS PREVIOUS STATE
        let oldActors = [...this.actors]

        this.actors.forEach(actor => {
            actor.update(oldActors,step)
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

////////////////////////////////////// Input

Game.prototype.readKeyboardInput = function () {
    //PLAYER 1
	if (keysDown.a || keysDown.q) {
		this.paddle1.cmdMoveLeft();
	} else if (keysDown.d || keysDown.w) {
		this.paddle1.cmdMoveRight();
	} else {
		this.paddle1.cmdStop();
	}
    //PLAYER 2
    if (keysDown.left) {
		this.paddle2.cmdMoveLeft();
	} else if (keysDown.right) {
		this.paddle2.cmdMoveRight();
	} else {
		//this.paddle2.cmdStop();
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
		console.log("DKLSFJFDLK");
		console.log(this.ai[numCommands-1].cmd);
			this.paddle2.receiveCmd(this.ai[numCommands-1].cmd);
	}

	console.log(this.paddle2.pos.x);
}
