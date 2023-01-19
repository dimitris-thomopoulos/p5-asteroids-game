let controllerPad;
let controllerLeft;
let controllerRight;
let controllerNew;
let controllerPause;
let controllerShoot;
var controllerShootPressed;

let leftIsPressed;
let rightIsPressed;

document.addEventListener('contextmenu', event => event.preventDefault()); // disable context menu that would appear on long taps

function setupTouchScreenControls()
{
	console.log("Execution of: setupTouchScreenControls()");
	controllerPad = createImg("./game-assets/game-controller-2.png");
	controllerLeft = createImg("./game-assets/arrow-left.png");
	controllerRight = createImg("./game-assets/arrow-right.png");
	controllerNew = createImg("./game-assets/n-button.png");
	controllerPause = createImg("./game-assets/p-button.png");
	controllerShoot = createImg("./game-assets/shoot-button.png");

	controllerLeft.touchStarted(touchLeftPressed);
	controllerLeft.mouseReleased(releasedTouchControls);
	
	controllerRight.touchStarted(touchRightPressed);
	controllerRight.mouseReleased(releasedTouchControls);
	
	controllerNew.mousePressed(newGameTouchPressed);
	controllerPause.mousePressed(pauseGameTouchPressed);

	controllerShoot.mousePressed(throwShurikenTouchPressed);
}

function throwShurikenTouchPressed()
{
	controllerShootPressed = true;
	setTimeout(()=> {
		controllerShootPressed = false;
	}, 15);


	// if(!controllerShootPressed) {
	// 	controllerShootPressed = true;
	// 	return true;
	// } else {

	// }
}

function drawTouchScreenControls()
{
	controllerPad.position(0,600);
	controllerLeft.position(20,700);
	controllerRight.position(770,700);
	controllerNew.position(280, 700);
	controllerPause.position(540, 700);
	controllerShoot.position(1050, 700);
}

function releasedTouchControls()
{
	leftIsPressed = false;
	rightIsPressed = false;
}

function touchLeftPressed()
{
	leftIsPressed = true;
	rightIsPressed = false;
}

function touchRightPressed()
{
	leftIsPressed = false;
	rightIsPressed = true;
}

function getTouchDirectionControl()
{
	if (leftIsPressed)
	{
		return -1;
	}
	
	if (rightIsPressed)
	{
		return 1;
	}
}

function newGameTouchPressed()
{
	startGame = true;
	startOnce = true;
	gameOver = false;
}

function pauseGameTouchPressed()
{
	if (startGame && !gameOver && !paused)
					paused = true;
				else if (startGame && !gameOver && paused)
					paused = false;
					
				if (paused)
					spaceship.stopEngineSound();
					
				if (!paused)
					spaceship.startEngineSound();
}
