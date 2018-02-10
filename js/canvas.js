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

                this.cx.strokeStyle = "#FFFF00"
                this.cx.beginPath();
                this.cx.moveTo(pos.x-width/2, pos.y-height/2)
                this.cx.lineTo(pos.x-width/2+100*actor.vel.x, pos.y-height/2+100*actor.vel.y)

                this.cx.moveTo(pos.x+width/2, pos.y-height/2)
                this.cx.lineTo(pos.x+width/2+100*actor.vel.x, pos.y-height/2+100*actor.vel.y)

                this.cx.moveTo(pos.x-width/2, pos.y+height/2)
                this.cx.lineTo(pos.x-width/2+100*actor.vel.x, pos.y+height/2+100*actor.vel.y)

                this.cx.moveTo(pos.x+width/2, pos.y+height/2)
                this.cx.lineTo(pos.x+width/2+100*actor.vel.x, pos.y+height/2+100*actor.vel.y)

                this.cx.stroke()
        }
    });
};

let animate = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
	window.setTimeout(callback, 1000 / 60)
};
