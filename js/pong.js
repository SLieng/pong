const GAME_WIDTH = 400
const GAME_HEIGHT = 600

const BALL_RADIUS = 10
const PADDLE_HEIGHT = 10
const PADDLE_WIDTH = 80

//Vector
function Vector(x,y) {
    this.x = x
    this.y = y
}
Vector.prototype.plus = function(otherVector) {
    this.x += otherVector.x
    this.y += otherVector.y
}

//ACTORS
function Ball(initialPos, initialVel) {
    this.height = BALL_RADIUS
    this.pos= initialPos
    this.type= "ball"
    this.vel= initialVel
    this.width = BALL_RADIUS
}
Ball.prototype.update = function() {
    this.pos.plus(this.vel)
}
function Player(initialPos, initialVel) {
    this.height = PADDLE_HEIGHT
    this.pos= initialPos
    this.type = "player"
    this.vel= initialVel
    this.width = PADDLE_WIDTH
}
Player.prototype.update = function() {
    this.pos.plus(this.vel)
}


function Game() {
	this.width = GAME_WIDTH
	this.height = GAME_HEIGHT
    this.actors = []
    this.active = false
}
Game.prototype.animate = function () {
	if (this.active) {
        //UPDATE ACTORS
        //OLD ACTORS ACT AS PREVIOUS STATE
        let oldActors = [...this.actors]
        let newActors = []

        function hasCollision(actorA,actorB) {
            let xDistance = Math.abs(actorA.pos.x-actorB.pos.x)
            let yDistance = Math.abs(actorA.pos.y-actorB.pos.y)
            let totalWidth = (actorA.width+actorB.width)/2
            let totalHeight = (actorA.height+actorB.height)/2
            return (xDistance<=totalWidth && yDistance<=totalHeight)
        }

        this.actors.forEach(actor => {
            switch(actor.type) {
                case "ball":
                    actor.pos.plus(actor.vel)
                    oldActors.forEach(actor2 => {
                        if (actor === actor2) {
                            return
                        }
                        if (hasCollision(actor,actor2)) {
                            actor.vel.y *= -1
                            actor.vel.x = 10*(actor.pos.x-actor2.pos.x)/actor2.width
                        }
                    })
                    if (actor.pos.x < 0 || actor.pos.x > this.width) {
                        actor.vel.x *= -1
                    }
                    break;
            }
            newActors.push(actor)
        })
        console.log(newActors)
        this.actors = newActors
	}
}
Game.prototype.begin = function () {
    this.actors.push(new Player(new Vector(200,50),new Vector(0,0)))
    this.actors.push(new Player(new Vector(200,550),new Vector(0,0)))
    this.actors.push(new Ball(new Vector(160,300),new Vector(0,2)))
    this.active = true
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
            case "player":
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
