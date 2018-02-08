let keysDown = {player1Left: false, player1Right: false}

document.addEventListener('keydown', function(event) {
  switch(event.keyCode) {
	case 37: // Left Arrow
	case 81: // q
			keysDown.player1Left = true;
			break;
	case 39: // Right Arrow
	case 87: // w
      keysDown.player1Right = true;
	  break;
	}
});

document.addEventListener('keyup', function(event) {
  switch(event.keyCode) {
	case 37: // Left Arrow
	case 81: // q
			keysDown.player1Left = false;
			break;
	case 39: // Right Arrow
	case 87: // w
      keysDown.player1Right = false;
	  break;
	}
});

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
