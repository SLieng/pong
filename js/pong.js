const GAME_WIDTH = 360
const GAME_HEIGHT = 600

const BALL_RADIUS = 6
const PADDLE_HEIGHT = 6
const PADDLE_WIDTH = 80

//=================================================================GAME
//=================================================================
function Game() {
	this.width = GAME_WIDTH
    this.height = GAME_HEIGHT
    this.paddle1 = new Paddle(new Vector(GAME_WIDTH/2,30),new Vector(0,0),"player1");
	this.paddle2 = new Paddle(new Vector(GAME_WIDTH/2,GAME_HEIGHT-30),new Vector(0,0),"player2");
	this.field = new Field();

    this.actors = [this.paddle1,this.paddle2,this.field]
	this.active = false
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

	for(let i=0; i<this.actors.length;i++) {
		if(this.actors[i].type == "field") continue;
		let data = {};
		this.actors[i].log(data);
		let key = this.actors[i].id;
		newFrameEntry[key] = data;
	}

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
		console.log(data);
		console.log("SUCCESS in getting AI");
	});
}

Game.prototype.begin = function () {
	  let initialVel = this.getBallStartVel()
	  this.ball = new Ball(new Vector(GAME_WIDTH/2,GAME_HEIGHT/2), initialVel, "ball");
    this.spawnBall(this.ball);

    this.ai = [{"timePassed": 2, "cmd": "left"}]
		this.timePassed = 0;
	  this.frameData = [];
    
    this.active = true;
}

Game.prototype.getBallStartVel = function() {
	let x,y;
	if(Math.random() < 0.5) {
		y = 200;
	} else {
		y = -200;
	}

	x = 800*Math.random() - 400;
	return new Vector(x, y);
}

Game.prototype.ballOutsideBounds = function() {
	//QUICK FIX
	if(this.ball.pos.y < 0 || this.ball.pos.y > GAME_HEIGHT) {
		return true;
	}
	return false;
}

Game.prototype.respawnBall = function() {
	this.ball.pos = new Vector(GAME_WIDTH/2, GAME_HEIGHT/2);
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
