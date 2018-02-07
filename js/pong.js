const GAME_WIDTH = 400
const GAME_HEIGHT = 600

const actor1 = {
    paddle: {
        pos: {x: 200, y: 50},
        vel: {x: 0,y: 0},
    }
}
const actor2 = {
    paddle: {
        pos: {x: 200, y: 550},
        vel: {x: 0,y: 0},
    }
}

function Game() {
	this.width = GAME_WIDTH
	this.height = GAME_HEIGHT
    this.actors = [actor1, actor2]
    this.active = false
}
Game.prototype.begin = function () {
    this.active = true
}
Game.prototype.animate = function () {
	if (this.active) {
	}
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
    let that = this

    this.drawBackground().then(function() {
        that.drawActors();
    })
}

CanvasDisplay.prototype.drawBackground = function () {
    let cd = this
    return new Promise(function (resolve,reject) {
        cd.cx.fillStyle = "#000000";
        cd.cx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        resolve()
    })
};

CanvasDisplay.prototype.drawActors = function () {
	this.game.actors.forEach(actor => {
        const pos = actor.paddle.pos
        console.log("x:"+pos.x+",y:"+pos.y)

        this.cx.fillStyle = "#FF0000";
        this.cx.fillRect(pos.x, pos.y, 50, 20);
    });
};

let animate = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
	window.setTimeout(callback, 1000 / 60)
};
