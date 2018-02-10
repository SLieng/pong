function runAnimation(frameFunc) {
	let lastTime = null;
	function frame(time) {
		let stop = false;
		if (lastTime != null) {
			let timeStep = Math.min(time - lastTime, 10) /1000*timeScalar
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

let timeScalar = 1
$(document).on("keydown",function (event) {
	if (event.which == 32) {
		timeScalar = 0.05
	} 
	if (event.which == 69) { //key e
		timeScalar = 4
	} 
})
$(document).on("keyup",function () {
	if (event.which == 32) {
		timeScalar = 1
	}
	if (event.which == 69) { //key e
		timeScalar = 1
	} 
})
