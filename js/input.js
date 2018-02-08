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
