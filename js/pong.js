const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;

const PLAYER_START = {
	x: 200,
	y: 550
};

function Vector(x, y) {
	this.x = x; this.y = y;
}

function Game() {
	this.width = GAME_WIDTH;
	this.height = GAME_HEIGHT;

	this.actors = [];

	//Player
	playerStart = new Vector(PLAYER_START.x, PLAYER_START.y);
	this.actors.push(new Player(playerStart));

}

function Player(pos) {
	this.pos = pos;
	this.speed = new Vector(0,0);
}

//////////////////////////////////////////////// PONG WRAPPER
function runAnimation(frameFunc) {
	let lastTime = null;
	function frame(time) {
		let stop = false;
		if (lastTime != null) {
			let timeStep = Math.min(time - lastTime, 100) /1000;
			stop = frameFunc(timeStep) === false;
		}
		lastTime = time;
		if(!stop) 
			requestAnimationFrame(frame);
	}
	requestAnimationFrame(frame);
}

function runGame(game) {
	let display = new CanvasDisplay(document.body, game);
	runAnimation(function(step) {
		game.animate(step, arrows);
		display.drawFrame(step);
	});
}

function runPong() {
	let game = new Game();	
	runGame(game);
}

$(document).ready(function() {
	console.log("START");
	runPong();
});

//////////////////////////////////////////CANVAS

let CANVAS_WIDTH = 400;
let CANVAS_HEIGHT = 600;

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

	this.drawBackground();
	this.drawActors();

	console.log("RUNNING");
}

CanvasDisplay.prototype.drawBackground = function() {
	this.cx.filleStyle = "#000000";
	this.cx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
};

CanvasDisplay.prototype.drawActors = function() {
	this.game.actors.forEach(function(actor) {
		let x = actor.pos.x;
		let y = actor.pos.y;

		this.cx.fillStyle = "#FF0000";
		this.cx.fillRect(x, y, 50, 20);

	}, this);
};

let animate = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
	window.setTimeout(callback, 1000 / 60)
};
