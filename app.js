"use strict";

const Engine = Matter.Engine,
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
    context = canvas.getContext('2d'),
    hoop = document.getElementById("hoop"),
    scoreBoard = document.getElementsByClassName("score"),
    arrow = document.getElementById("arrow"),
    playerOneText = document.getElementsByClassName("playerOne"),
    playerTwoText = document.getElementsByClassName("playerTwo");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//prevents ball from flying through objects
const extra = 500;

const ballNetRatio = 1.885;
const ballBackboardRatio = 3;
const backboardOffsetRatio = 0.62;

var ballStartingX = 0;
var ballStartingY = 0;

const ballDimensions = {
    radius: 35,
};

var net = {
    backboard: {
        x: 0,
        y: 0,
        w: 0,
        h: 0
    },
    rightRim: {
        x: 0,
        y: 0,
        w: 0,
        h: 0
    },
    leftRim: {
        x: 0,
        y: 0,
        w: 0,
        h: 0
    },
    backboardConnector: {
        x: 0,
        y: 0,
        w: 0,
        h: 0
    }
};

var player_one = {
    name: "Player 1",
    score: 0,
    text: playerOneText,
    scored: false,
    canMoveBall: true
};

var player_two = {
    name: "Player 2",
    score: 0,
    text: playerTwoText,
    scored: false,
    canMoveBall: true
};

var player_current = player_one;

const horse = ["", "H", "H.O", "H.O.R", "H.O.R.S", "H.O.R.S.E"];

var ballInMotion = false;

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
    var ground = Bodies.rectangle(-extra, canvas.height + extra, canvas.width * 2 + extra + extra, (ballDimensions.radius * 2) + extra + extra, {
            isStatic: true,
            render: {
                fillStyle: 'brown',
                visible: true
            }
        }),
        rightWall = Bodies.rectangle(canvas.width + extra, -extra, (ballDimensions.radius * 2) + extra + extra, canvas.height * 2 + extra + extra, {
            isStatic: true,
            render: {
                fillStyle: 'black',
                visible: true
            }
        }),
        garage = Bodies.rectangle(-extra, canvas.height + extra, (ballDimensions.radius * 2) + extra + extra, canvas.height * 1.2 + extra + extra, {
            isStatic: true,
            render: {
                fillStyle: 'grey',
                visible: true
            }
        }),
        roof = Bodies.rectangle(-extra - ballDimensions.radius * 12, -extra, (ballDimensions.radius * 2) + extra + extra, canvas.height * 1.2 + extra + extra, {
            isStatic: true,
            render: {
                fillStyle: 'black',
                visible: true
            }
        });
    Body.rotate(roof, -Math.PI / 3);

    const rimRadius = 4

    var rightRim = Matter.Bodies.circle(net.rightRim.x, net.rightRim.y, rimRadius, {
            isStatic: true,
            render: {
                visible: true
            }
        }),
        leftRim = Matter.Bodies.circle(net.leftRim.x, net.leftRim.y, rimRadius, {
            isStatic: true,
            render: {
                visible: true
            }
        });

    var ball = Matter.Bodies.circle(net.backboardConnector.x, net.backboardConnector.y - ballDimensions.radius, ballDimensions.radius, {
        density: 1,
        restitution: 0.9,
        friction: 0.1,
        render: {
            fillStyle: '#08c4ff'
        }
    });

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

        if (ballInMotion &&
            ball.velocity.y > 0 &&
            ball.position.x > net.leftRim.x &&
            ball.position.x < net.rightRim.x &&
            ball.position.y > net.rightRim.y - 20 &&
            ball.position.y < net.rightRim.y + 20) {

            scoreBoard[0].innerText = "YEET!";
			ballInMotion = false;

            setTimeout(function() {

				resetForNextPlayer(ball, ballStartingX, ballStartingY, true);
            }, 2000);

        } else if (ballInMotion &&
            ball.position.y + extra >= ground.position.y - ballDimensions.radius * 2 &&
            scoreBoard[0].innerText === "") {

        	scoreBoard[0].innerText = "Gutter Ball";
			ballInMotion = false;

			setTimeout(function() {

				resetForNextPlayer(ball, ballStartingX, ballStartingY, false);
            }, 2000);

        }
    });

    // run the engine
    Engine.run(engine);

    function getMousePosition(e) {
        mouse.x = e.mouse.position.x;
        mouse.y = e.mouse.position.y;
    }

    function mouseMoved(e) {
        if (!mouse.isDown || ballInMotion) {
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
        if (ballInMotion) {
            return;
        }
		mouse.isDown = true;
		Body.setVelocity(ball, {
            x: 0,
            y: 0
        });

        getMousePosition(e);
        console.log(player_current.canMoveBall);
        if (player_current.canMoveBall) {
            ballStartingX = mouse.x;
            ballStartingY = mouse.y;
		}
            Body.setPosition(ball, {
                x: mouse.x,
                y: mouse.y
            });

        setStatic(ball, true);

    }

    function mouseUp(e) {
        if (ballInMotion) {
            return;
        }
		mouse.isDown = false;
		context.clearRect(0, 0, canvas.width, canvas.height);
        var xVelocity = (ballStartingX - ball.position.x) * 0.25;
        var yVelocity = (ballStartingY - ball.position.y) * 0.25;

        if (Math.abs(xVelocity) < 2 && Math.abs(yVelocity) < 2) {
			return;
        }
        ballInMotion = true;
        setStatic(ball, false);
        Body.setVelocity(ball, {
            x: xVelocity,
            y: yVelocity
        })
    }

    function resetForNextPlayer(ball, x, y, scored) {

		player_current.scored  = scored;

		var player_other = player_current === player_one ? player_two : player_one;

        if (player_current.score === horse.length || player_other.score === horse.length) {
            location.reload();
            return;
        }

		scoreBoard[0].innerText = "";
        player_current.text[0].style.borderStyle = "hidden";

        if (scored && !player_other.scored) {
            setStatic(ball, true);
            Body.setPosition(ball, {
                x: x,
                y: y
            });
			player_current.canMoveBall = true;
			player_other.canMoveBall = false;


		} else if (!scored && player_other.scored){
            player_current.score++;
			player_other.canMoveBall = true;
			player_current.canMoveBall = false;
		}

        player_current.text[0].innerText = player_current.name + " " + horse[player_current.score];

		//change player
		player_current = player_current === player_one ? player_two : player_one;
        player_current.text[0].style.borderStyle = "solid";
    }

    function setStatic(object, setStatic) {

        object.isStatic = setStatic;
    }

    // Draw the slingshot arrow
    function drawArrow(context, startX, startY, endX, endY) {
        context.strokeStyle = "#6cff7c";
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.stroke();
    }
};

draw();

//used to call animate.css
$.fn.extend({
    animateCss: function(animationName, callback) {
        var animationEnd = (function(el) {
            var animations = {
                animation: 'animationend',
                OAnimation: 'oAnimationEnd',
                MozAnimation: 'mozAnimationEnd',
                WebkitAnimation: 'webkitAnimationEnd',
            };

            for (var t in animations) {
                if (el.style[t] !== undefined) {
                    return animations[t];
                }
            }
        })(document.createElement('div'));

        this.addClass('animated ' + animationName).one(animationEnd, function() {
            $(this).removeClass('animated ' + animationName);

            if (typeof callback === 'function') callback();
        });

        return this;
    },
});


//Code below is for button and shot selection

var confirm = document.getElementById("confirm"),
	skyShot = document.getElementById("skyShot"),
	blindShot = document.getElementById("blindShot"),
	garagShot = document.getElementById("garagShot"),
	swish = document.getElementById("swish"),
	roofShot = document.getElementById("roofShot"),
	allButtons = document.getElementsByClassName("button-container");

function buttonSelected(button){
	button.style.background='green';
}


$( "#confirm" ).click(function() {
	buttonSelected(confirm);
	allButtons[0].style.display = "none";
});
$( "#skyShot" ).click(function() {
	buttonSelected(skyShot);
});
$( "#blindShot" ).click(function() {
	buttonSelected(blindShot);
});
$( "#garagShot" ).click(function() {
	buttonSelected(garagShot);
});
$( "#swish" ).click(function() {
	buttonSelected(swish);
});
$( "#roofShot" ).click(function() {
	buttonSelected(roofShot);
});

