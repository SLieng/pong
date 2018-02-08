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
	console.log(newFrameEntry);
}

Game.prototype.sendLog = function(data) {
	$.ajax({
		type: "POST",
		contentType: "application/json; charset=utf-8",
		url: "/receiver",
		data: JSON.stringify(data)
	}).done(function(data) {
		console.log("SUCCESS in sending log");
	});
}

Game.prototype.begin = function () {
    this.spawnBall(new Ball(new Vector(200,300), new Vector(0,4), "ball"));

		this.timePassed = 0;
	  this.frameData = [];
    
    this.active = true;
}

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
		this.paddle2.cmdStop();
	}
}

Game.prototype.spawnBall = function(ball) {
    this.actors.push(ball);
}
//////////////////////////////////////////////// PONG WRAPPER
function runAnimation(frameFunc) {
	let lastTime = null;
	function frame(time) {
		let stop = false;
		if (lastTime != null) {
			let timeStep = Math.min(time - lastTime, 10) /1000;
			stop = frameFunc(timeStep) === false;
		}
		lastTime = time;
		if(!stop) 
			requestAnimationFrame(frame);
	}
	requestAnimationFrame(frame);
}

function runPong() {
	let game = new Game();

	let display = new CanvasDisplay(document.body, game);
	runAnimation(function(step) {
		game.animate(step);
		display.drawFrame(step);
	});

	game.begin()
}

$(document).ready(function() {
	console.log("START");
	runPong();
});

//////////////////////////////////////////CANVAS

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;

function CanvasDisplay(parent, game) {
	this.canvas = document.createElement("canvas");
	this.canvas.width = CANVAS_WIDTH;
	this.canvas.height = CANVAS_HEIGHT;
	parent.appendChild(this.canvas);
	this.cx = this.canvas.getContext("2d");

	this.game = game;
	this.animationTime = 0;
	this.drawFrame(0);
}

CanvasDisplay.prototype.drawFrame = function(step) {
    this.animationTime += step;

    this.drawBackground()
    this.drawActors();
}

CanvasDisplay.prototype.drawBackground = function () {

    this.cx.fillStyle = "#000000";
    this.cx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
};

CanvasDisplay.prototype.drawActors = function () {
	this.game.actors.forEach(actor => {
        const pos = actor.pos
        const height = actor.height
        const width = actor.width

        switch(actor.type) {
            case "paddle":
                this.cx.fillStyle = "#FF0000";
                this.cx.fillRect(pos.x - width/2, pos.y - height/2, width, height);
                break;
            case "ball":
                this.cx.fillStyle = "#FFFFFF";
                this.cx.fillRect(pos.x - width/2, pos.y - height/2, width, height);
        }
    });
};

let animate = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
	window.setTimeout(callback, 1000 / 60)
};
