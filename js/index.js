var game_canvas;
var text_canvas;
var text_ctx;
var canvas_ctx;

var intervalId;

var gameStart = false;
var gameEnd = false;
var gameRestart = false;

var grid = {};
var gridSize = 10;

var pieceWidth = 50;
var pieceSpacing = 5;

var movementOccuring = false;

var snake = [
	{ 'x': 1, 'y': 3 }
];

var treasure = {
	'x': null,
	'y': null
};

var direction = 'R';

window.onload = gameInit;

function drawGamePiece(colour, x, y, type = 'fill') {

	if (type === 'fill') {
		canvas_ctx.fillStyle = colour;
		canvas_ctx.fillRect(pieceWidth * x + pieceSpacing * (x + 1), pieceWidth * y + pieceSpacing * (y + 1), pieceWidth, pieceWidth);
	} else if (type === 'rect') {
		canvas_ctx.strokeRect(pieceWidth * x + pieceSpacing * (x + 1), pieceWidth * y + pieceSpacing * (y + 1), pieceWidth, pieceWidth);
	} else {
		canvas_ctx.clearRect(pieceWidth * x + pieceSpacing * (x + 1), pieceWidth * y + pieceSpacing * (y + 1), pieceWidth, pieceWidth);
	}
}

function writeText(text, pos_y = 10, height = 50) {

	if (height >= text_canvas.height)
		text_canvas.setAttribute("height", pos_y + 10);

	text_ctx.fillText(text, text_canvas.width / 2 - text_ctx.measureText(text).width / 2, pos_y);
}

function clearText() {
	text_ctx.clearRect(0, 0, text_canvas.width, text_canvas.height);
	text_ctx.stroke();
	text_canvas.setAttribute("height", 0);
}

function gameInit() {

	game_canvas = document.getElementById("gameCanvas");
	canvas_ctx = game_canvas.getContext("2d");

	text_canvas = document.getElementById("textCanvas");
	text_ctx = text_canvas.getContext("2d");
	text_ctx.font = "80px Arial";
	text_ctx.text_align = "center";

	if (!gameRestart)
		writeText("Press Space to Begin!");

	// Set the dimensions of the canvas
	game_canvas.width = (pieceWidth * gridSize) + (pieceSpacing * gridSize + 1);
	game_canvas.height = (pieceWidth * gridSize) + (pieceSpacing * gridSize + 1);

	// Create the basic grid and init the grid that keeps track of the snake's position
	for (x = 0; x < gridSize; x++) {
		for (y = 0; y < gridSize; y++) {
			grid[x + '' + y] = 'U';
			drawGamePiece(null, x, y, 'rect');
			drawGamePiece(null, x, y, 'clear');
			drawGamePiece(null, x, y, 'rect');
		}
	}

	// Create the 'head' of the snake and set to occupied
	drawGamePiece('#00b300', snake[0].x, snake[0].y);
	grid[snake[0].x + '' + snake[0].y] = 'O';

	var treasurex;
	var treasurey;
	do {
		treasurex = Math.floor((Math.random() * gridSize));
		treasurey = Math.floor((Math.random() * gridSize));
	} while (grid[treasurex + '' + treasurey] != 'U');

	treasure.x = treasurex;
	treasure.y = treasurey;

	drawGamePiece('gold', treasurex, treasurey);
	grid[treasurex + '' + treasurey] = 'T';


};

document.onkeypress = function (e) {
	switch (e.key) {
		case 'w':
			direction = (direction != 'D') ? 'U' : 'D';
			moveSnake();
			stopMovement();
			startMovement();
			break;
		case 's':
			direction = (direction != 'U') ? 'D' : 'U';
			moveSnake();
			stopMovement();
			startMovement();
			break;
		case 'a':
			direction = (direction != 'R') ? 'L' : 'R';
			moveSnake();
			stopMovement();
			startMovement();
			break;
		case 'd':
			direction = (direction != 'L') ? 'R' : 'L';
			moveSnake();
			stopMovement();
			startMovement();
			break;
		case 'r':
			if (gameEnd) {
				gameEnd = false;

				// Clear any text
				clearText();

				// Reset the snake
				snake = [
					{ 'x': 1, 'y': 3 }
				];

				// Reset initial direction
				direction = 'R';

				gameInit();

			}
			break;
		case ' ':
			if (!gameEnd) {
				gameStart = true;
				clearText();
				startMovement();
			}
			break;
	}
};


function startMovement() {
	intervalId = setInterval(moveSnake, 300);
}

function stopMovement() {
	clearInterval(intervalId);
}


function moveSnake() {
	if (!gameStart || gameEnd || movementOccuring) {
		return;
	}

	movementOccuring = true;

	var dx = 0;
	var dy = 0;

	switch (direction) {
		case 'U':
			dx = -1;
			break;

		case 'D':
			dx = 1;
			break;

		case 'R':
			dy = 1;
			break;

		case 'L':
			dy = -1;
			break;
	}

	grid[snake[0].x + '' + snake[0].y] = 'U';
	var old_pos_x = snake[0].x;
	var old_pos_y = snake[0].y;

	snake[0].x += dy;
	snake[0].y += dx;

	if (snake[0].x > gridSize - 1 || snake[0].y > gridSize - 1 || snake[0].x < 0 || snake[0].y < 0 || grid[snake[0].x + '' + snake[0].y] == 'O') {
		gameEnd = true;

		writeText("Press R to Restart!");
		gameRestart = true;
		// Draw the dead head
		drawGamePiece("red", old_pos_x, old_pos_y);

		movementOccuring = false;
		return;
	}

	drawGamePiece(null, old_pos_x, old_pos_y, 'clear');
	drawGamePiece(null, old_pos_x, old_pos_y, 'empty');

	var treasureHit = false;
	if (grid[snake[0].x + '' + snake[0].y] == 'T') {
		treasureHit = true;

		var treasurex;
		var treasurey;
		do {
			treasurex = Math.floor((Math.random() * gridSize));
			treasurey = Math.floor((Math.random() * gridSize));
		} while (grid[treasurex + '' + treasurey] != 'U');

		treasure.x = treasurex;
		treasure.y = treasurey;

		drawGamePiece('gold', treasurex, treasurey);

		grid[treasurex + '' + treasurey] = 'T';
	} else if (grid[treasure.x + '' + treasure.y] == 'U') {
		var treasurex;
		var treasurey;
		do {
			treasurex = Math.floor((Math.random() * gridSize));
			treasurey = Math.floor((Math.random() * gridSize));
		} while (grid[treasurex + '' + treasurey] != 'U');

		treasure.x = treasurex;
		treasure.y = treasurey;

		drawGamePiece('gold', treasurex, treasurey);
		
		grid[treasurex + '' + treasurey] = 'T';
	}

	drawGamePiece('#00b300', snake[0].x, snake[0].y);

	grid[snake[0].x + '' + snake[0].y] = 'O';

	for (i = 1; i < snake.length; i++) {
		grid[snake[i].x + '' + snake[i].y] = 'U';

		var tempx = snake[i].x;
		var tempy = snake[i].y;

		drawGamePiece(null, snake[i].x, snake[i].y, 'empty');

		snake[i].x = old_pos_x;
		snake[i].y = old_pos_y;

		old_pos_x = tempx;
		old_pos_y = tempy;

		if (snake[i].x > gridSize - 1 || snake[i].y > gridSize - 1 || snake[i].x < 0 || snake[i].y < 0 || grid[snake[i].x + '' + snake[i].y] == 'O') {

			gameEnd = true;
			writeText("Press R to Restart!");
			gameRestart = true;

			drawGamePiece('red', snake[0].x, snake[0].y);
			movementOccuring = false;

			return;
		}

		var colour = (snake[i].colour != undefined) ? snake[i].colour : snake[i].colour = "rgb(0," + (Math.floor(Math.random() * (51)) + 100) + ",0)";
		
		drawGamePiece( colour, snake[i].x, snake[i].y);
		grid[snake[i].x + '' + snake[i].y] = 'O';

	}

	if (treasureHit) {
		drawGamePiece('green', old_pos_x, old_pos_y);
		grid[old_pos_x + '' + old_pos_y] = 'O';

		snake.push({ 'x': old_pos_x, 'y': old_pos_y });
	}
	movementOccuring = false;
}