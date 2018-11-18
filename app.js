"use strict";

var Engine = Matter.Engine,
	World = Matter.World,
	Bodies = Matter.Bodies,
	Body = Matter.Body,
	Render = Matter.Render,
	Constraint = Matter.Constraint,
	Composites = Matter.Composites,
	Events = Matter.Events,
	MouseConstraint = Matter.MouseConstraint;


var engine;
var mouse;
var canvas = document.getElementById('canvas'),
	context = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var draw = function() {

	var render = Render.create({
		element: document.body,
		engine: engine,
		options: {
			canvas: canvas,
			width: window.innerWidth,
			height: window.innerHeight,
			wireframes: false, // <-- important
			background: "transparent",
			pixelRatio: 1,
			wireframeBackground: '#222',
			hasBounds: false,
			enabled: true,
			showSleeping: true,
			showDebug: false,
			showBroadphase: false,
			showBounds: false,
			showVelocity: false,
			showCollisions: false,
			showSeparations: false,
			showAxes: false,
			showPositions: false,
			showAngleIndicator: false,
			showIds: false,
			showShadows: false,
			showVertexNumbers: false,
			showConvexHulls: false,
			showInternalEdges: false,
			showMousePosition: false
		}
	});
	// create a Matter.js engine
	engine = Engine.create(document.body, {
		render: render

	});
	engine.world.gravity.y = 4;
	mouse = {
		x: 0,
		y: 0,
		isDown: false
	};
	var hoop = document.getElementById("hoop"),
		scoreBoard = document.getElementsByClassName("score"),
		arrow = document.getElementById("arrow");


	// add a mouse controlled constraint
	var mouseConstraint = MouseConstraint.create(engine);

	Events.on(mouseConstraint, 'mouseup', function(event) {
		mouseUp(event);
	});
	Events.on(mouseConstraint, 'mousemove', function(event) {
		mouseMoved(event);
	});
	Events.on(mouseConstraint, 'mousedown', function(event) {
		mouseDown(event);
	});


	const ballNetRatio = 1.885;
	const ballBackboardRatio = 3;
	const backboardOffsetRatio = 0.62;

	var ballDimensions = {
		radius: 35,
	};

	var net = {
		backboard: {
			x: 0,
			y: 0,
			w: 30,
			h: 0
		},
		rightRim: {
			x: 0,
			y: 0,
			w: 8,
			h: 8
		},
		leftRim: {
			x: 0,
			y: 0,
			w: 8,
			h: 8
		},
		backboardConnector: {
			x: 0,
			y: 0,
			w: 4,
			h: 4
		}
	};

	ballDimensions.radius = canvas.width * 0.02;
	net.backboard.h = (ballDimensions.radius * 2) * ballBackboardRatio;
	net.backboard.w = (ballDimensions.radius * 0.4);
	net.backboard.x = canvas.width - (canvas.width * 0.12);
	net.backboard.y = (canvas.height * 0.5) - net.backboard.h - ((ballDimensions.radius * 2) * backboardOffsetRatio);
	net.rightRim.x = net.backboard.x - net.rightRim.w - ((ballDimensions.radius * 2) * backboardOffsetRatio);
	net.rightRim.y = net.backboard.y + ((ballDimensions.radius * 2) * backboardOffsetRatio);
	net.leftRim.x = net.rightRim.x - ((ballDimensions.radius * 2) * ballNetRatio);
	net.leftRim.y = net.rightRim.y;
	net.backboardConnector.w = net.rightRim.x - net.backboard.x;
	net.backboardConnector.x = net.rightRim.x - (net.backboardConnector.w * 0.5);
	net.backboardConnector.y = net.rightRim.y;
	net.backboardConnector.h = (ballDimensions.radius * 0.25);

	var backboardColor = "#000000";

	var backboard = Bodies.rectangle(net.backboard.x, net.backboard.y, net.backboard.w, net.backboard.h, {
			isStatic: true,

			render: {
				fillStyle: backboardColor
			}
		}),
		backboardConnector = Bodies.rectangle(net.backboardConnector.x, net.backboardConnector.y, net.backboardConnector.w, net.backboardConnector.h, {
			isStatic: true,
			render: {
				fillStyle: backboardColor
			}
		});

	// create game objects
	var ground = Bodies.rectangle(0, canvas.height, canvas.width * 2, (ballDimensions.radius * 2), {
			isStatic: true,
			render: {
				fillStyle: 'brown',
				visible: true
			}
		}),
		rightWall = Bodies.rectangle(canvas.width, 0, (ballDimensions.radius * 2), canvas.height * 2, {
			isStatic: true,
			render: {
				fillStyle: 'black',
				visible: true
			}
		}),
		garage = Bodies.rectangle(0, canvas.height, (ballDimensions.radius * 2), canvas.height * 1.2, {
			isStatic: true,
			render: {
				fillStyle: 'grey',
				visible: true
			}
		}),
		roof = Bodies.rectangle(0 - ballDimensions.radius * 12, 0, (ballDimensions.radius * 2), canvas.height * 1.2, {
			isStatic: true,
			render: {
				fillStyle: 'black',
				visible: true
			}
		});
	Body.rotate(roof, -Math.PI / 3);

	var rightRim = Matter.Bodies.circle(net.rightRim.x, net.rightRim.y, 2, {
			isStatic: true,
			render: {
				visible: true
			}
		}),
		leftRim = Matter.Bodies.circle(net.leftRim.x, net.leftRim.y, 2, {
			isStatic: true,
			render: {
				visible: true
			}
		});

	var ball = Matter.Bodies.circle(200, 200, ballDimensions.radius, {
		density: 1,
		restitution: 0.9,
		friction: 0.1,
		render: {
			fillStyle: '#08c4ff'
		}
	});
	var ballStartingX = 0;
	var ballStartingY = 0;


	var leftBoxes = Composites.stack(net.leftRim.x, net.leftRim.y, 5, 1, (ballDimensions.radius * 0.5), 0, function(x, y) {
		return Bodies.rectangle(x, y, 6, 6);
	});

	var rightBoxes = Composites.stack(net.rightRim.x, net.rightRim.y, 5, 1, (ballDimensions.radius * 0.5), 0, function(x, y) {
		return Bodies.rectangle(x, y, 6, 6);
	});

	leftBoxes.bodies[0].isStatic = true;
	rightBoxes.bodies[0].isStatic = true;


	var leftChain = Composites.chain(leftBoxes, 0, 0, -0.5, 0, {
		stiffness: 1
	});
	var rightChain = Composites.chain(rightBoxes, 0, 0, -0.5, 0, {
		stiffness: 1
	});


	// add all of the bodies to the world
	World.add(engine.world, [ball, ground, rightWall, garage, roof, mouseConstraint, leftChain, rightChain, backboard, backboardConnector, leftRim, rightRim]);


	Events.on(engine, 'tick', function(event) {
		if (ball.position.x > net.leftRim.x && ball.position.x < net.rightRim.x && ball.position.y > net.rightRim.y && ball.position.y < net.rightRim.y + 10) {
			scoreBoard[0].innerText = "YEET";
		} else if (ball.position.y >= ground.position.y - ballDimensions.radius * 2 &&
			scoreBoard[0].innerText === "") {
			scoreBoard[0].innerText = "MISS";
		}

	});


	// run the engine
	Engine.run(engine);

	function getMousePosition(e) {
		mouse.x = e.mouse.position.x;
		mouse.y = e.mouse.position.y;
	}

	function mouseMoved(e) {
		if (!mouse.isDown) {
			return;
		}
		getMousePosition(e);
		Body.setPosition(ball, {
			x: mouse.x,
			y: mouse.y
		});
		context.clearRect(0, 0, canvas.width, canvas.height);

		drawArrow(context, ballStartingX, ballStartingY, mouse.x, mouse.y);

	}

	function mouseDown(e) {
		scoreBoard[0].innerText = "";
		Body.setVelocity(ball, {
			x: 0,
			y: 0
		})
		getMousePosition(e);
		mouse.isDown = true;
		ballStartingX = mouse.x;
		ballStartingY = mouse.y;
		Body.setPosition(ball, {
			x: mouse.x,
			y: mouse.y
		});
		setStatic(ball, true);

	}

	function mouseUp(e) {
		context.clearRect(0, 0, canvas.width, canvas.height);

		var xVelocity = (ballStartingX - ball.position.x) * 0.2;
		var yVelocity = (ballStartingY - ball.position.y) * 0.2;

		if (Math.abs(xVelocity) < 2 && Math.abs(yVelocity) < 2) {
			return;
		}

		mouse.isDown = false;
		setStatic(ball, false);
		Body.setVelocity(ball, {
			x: (ballStartingX - ball.position.x) * 0.2,
			y: (ballStartingY - ball.position.y) * 0.2
		})
	}

	function getTouchPosition(e) {
		mouse.x = e.mouse.position.x;
		mouse.y = e.mouse.position.y;
	}

	var touchDown = function(e) {
		getTouchPosition(e);
		mouse.isDown = true;
		ball.position.x = mouse.x;
		ball.position.y = mouse.y;
		ballStartingX = mouse.x;
		ballStartingY = mouse.y;

	}
	var touchUp = function(e) {
		mouse.isDown = false;
		ball.velocity.y = (ballStartingY - ball.position.y) * 0.1;
		ball.velocity.x = (ballStartingX - ball.position.x) * 0.1;

	}
}

function setStatic(object, setStatic) {

	object.isStatic = setStatic;
}

// Draw the slingshot arrow
function drawArrow(context, startX, startY, endX, endY) {
	context.strokeStyle="#6cff7c";
	context.lineWidth=2;
	context.beginPath();
	context.moveTo(startX, startY);
	context.lineTo(endX, endY);
	context.stroke();
}
draw();