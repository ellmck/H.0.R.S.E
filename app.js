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

let engine;
let mouse;
let canvas = document.getElementById('canvas'),
    context = canvas.getContext('2d'),
    scoreBoard = document.getElementById("score"),
    blindShotOverlay = document.getElementById("blindShotOverlay"),
    playerOneText = document.getElementById("playerOne"),
    playerTwoText = document.getElementById("playerTwo");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


//Code below is for button and shot selection
let allButtons = document.getElementsByClassName("button-container");

let skyShot = {
    name: "Sky",
    button: document.getElementById("skyShot"),
    selected: false,
    complete: false
};

let blindShot = {
    name: "Blind",
    button: document.getElementById("blindShot"),
    selected: false,
    complete: true
};

let bounceShot = {
    name: "Bounce",
    button: document.getElementById("bounceShot"),
    selected: false,
    complete: false
};

let garageShot = {
    name: "Garage",
    button: document.getElementById("garageShot"),
    selected: false,
    complete: false
};

let swish = {
    name: "Swish",
    button: document.getElementById("swish"),
    selected: false,
    complete: true
};

let roofShot = {
    name: "Roof",
    button: document.getElementById("roofShot"),
    selected: false,
    complete: false
};

let shotTypes = [skyShot, blindShot, bounceShot, garageShot, swish, roofShot];

let numberOfBouncesLeft = 1;

//code below is for game physics

//prevents ball from flying through objects
const extra = 500;

const ballNetRatio = 1.885;
const ballBackboardRatio = 3;
const backboardOffsetRatio = 0.62;

let ballStartingX = 0;
let ballStartingY = 0;

const ballDimensions = {
    radius: 35,
};

let net = {
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

let player_one = {
    name: "Player 1",
    score: 0,
    text: playerOneText,
    scored: false,
    canMoveBall: true
};

let player_two = {
    name: "Player 2",
    score: 0,
    text: playerTwoText,
    scored: false,
    canMoveBall: true
};

let player_current = player_one;

const horse = ["", "H", "H.O", "H.O.R", "H.O.R.S", "H.O.R.S.E"];

let ballInMotion = false;
let playerCanMoveBall = false;


let draw = function() {

    let render = Render.create({
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
    let mouseConstraint = MouseConstraint.create(engine);

    Events.on(mouseConstraint, 'mouseup', function(event) {
        mouseUp(event);
    });
    Events.on(mouseConstraint, 'mousemove', function(event) {
        mouseMoved(event);
    });
    Events.on(mouseConstraint, 'mousedown', function(event) {
        mouseDown(event);
    });


    //basketball net object
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
    net.backboardConnector.h = (ballDimensions.radius * 0.15);

    let backboardColor = "#7b0500";

    let backboard = Bodies.rectangle(net.backboard.x, net.backboard.y, net.backboard.w, net.backboard.h, {
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
    let ground = Bodies.rectangle(-extra, canvas.height + extra, canvas.width * 2 + extra + extra, (ballDimensions.radius * 2) + extra + extra, {
            isStatic: true,
            render: {
                visible: true
            }
        }),
        rightWall = Bodies.rectangle(canvas.width + extra, -extra, extra + extra, canvas.height * 2 + extra + extra, {
            isStatic: true,
            render: {
                fillStyle: 'grey',
                visible: true
            }
        }),
        garage = Bodies.rectangle(-extra, canvas.height + extra, (ballDimensions.radius * 2) + extra + extra, canvas.height * 10 + extra + extra, {
            isStatic: true,
            render: {
                fillStyle: 'grey',
                visible: true
            }
        }),
        roof = Bodies.rectangle(0 - canvas.height, -100, canvas.height * 1.2 + extra, (ballDimensions.radius * 10), {
            isStatic: true,
            render: {
                fillStyle: 'black',
                visible: true
            }
        });
    Body.rotate(roof, Math.PI / 5);

    const rimRadius = 4;

    let rightRim = Bodies.circle(net.rightRim.x, net.rightRim.y, rimRadius, {
            isStatic: true,
            render: {
                visible: true
            }
        }),
        leftRim = Bodies.circle(net.leftRim.x, net.leftRim.y, rimRadius, {
            isStatic: true,
            render: {
                visible: true
            }
        });

    let ball = Bodies.circle(net.backboardConnector.x, net.backboardConnector.y - ballDimensions.radius, ballDimensions.radius, {
        density: 1,
        restitution: 0.9,
        friction: 0.1,
        render: {
            sprite: {
                texture: 'assets/sprites/ball2.png',
                xScale: ballDimensions.radius * 2 / 512,
                yScale: ballDimensions.radius * 2 / 512
            }
        }
    });


    // add all of the bodies to the world
    World.add(engine.world, [ball, ground, rightWall, garage, mouseConstraint, backboard, backboardConnector, leftRim, rightRim]);

    Events.on(engine, 'tick', function(event) {

        if (skyShot.selected && ball.position.y < 0) {
            skyShot.complete = true;
        }

        if (Matter.SAT.collides(ball, garage).collided) {
            garageShot.complete = true;
        }
        if (Matter.SAT.collides(ball, leftRim).collided ||
            Matter.SAT.collides(ball, rightRim).collided ||
            Matter.SAT.collides(ball, backboard).collided) {
            swish.complete = false;
        }

        var ballHitGround = Matter.SAT.collides(ball, ground).collided && ballInMotion;

        if (ballHitGround) {
            numberOfBouncesLeft--;
        }
        bounceShot.complete = (numberOfBouncesLeft <= 0);


        if ((ballInMotion &&
            ball.velocity.y > 0 &&
            ball.position.x > net.leftRim.x &&
            ball.position.x < net.rightRim.x &&
            ball.position.y > net.rightRim.y - 10 &&
            ball.position.y < net.rightRim.y + 30) && isScored()) {

            ballInMotion = false;
            scoreBoard.innerText = "YEET!";

            setTimeout(function() {
                resetForNextPlayer(ball, ballStartingX, ballStartingY, true);
            }, 2000);

        } else if (ballHitGround &&
            scoreBoard.innerText === "" &&
            numberOfBouncesLeft < 0) {

            ballInMotion = false;

            scoreBoard.innerText = "Gutter Ball";
            setTimeout(function() {
                resetForNextPlayer(ball, ballStartingX, ballStartingY, false);
            }, 2000);

        }


    });

    // run the engine
    Engine.run(engine);

    let opacityLevel = 0;

    function getMousePosition(e) {
        mouse.x = e.mouse.position.x;
        mouse.y = e.mouse.position.y;
    }

    function mouseMoved(e) {
        if (!mouse.isDown || !playerCanMoveBall) {
            return;
        }

        if (blindShot.selected) {
            let isMobile = navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i);
            if (isMobile) {
                opacityLevel += 0.1;
                blindShotOverlay.style.zIndex = "99";
                blindShotOverlay.style.opacity = opacityLevel.toString();
            }
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
        if (!playerCanMoveBall) {
            return;
        }
        mouse.isDown = true;
        Body.setVelocity(ball, {
            x: 0,
            y: 0
        });

        getMousePosition(e);
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
        if (!mouse.isDown || !playerCanMoveBall) {
            return;
        }
        mouse.isDown = false;
        blindShotOverlay.style.zIndex = "0";
        blindShotOverlay.style.opacity = "0";
        opacityLevel = 0;
        context.clearRect(0, 0, canvas.width, canvas.height);
        let xVelocity = (ballStartingX - ball.position.x) * 0.25;
        let yVelocity = (ballStartingY - ball.position.y) * 0.25;

        if (Math.abs(xVelocity) < 2 && Math.abs(yVelocity) < 2) {
            return;
        }
        playerCanMoveBall = false;
        ballInMotion = true;
        setStatic(ball, false);
        Body.setVelocity(ball, {
            x: xVelocity,
            y: yVelocity
        })
    }


    function resetForNextPlayer(ball, x, y, scored) {

        player_current.scored = scored;

        numberOfBouncesLeft = bounceShot.selected ? 1 : 0;

        let player_other = player_current === player_one ? player_two : player_one;

        if (player_current.score >= horse.length - 1 || player_other.score >= horse.length - 1) {
            location.reload();
            return;
        }

        scoreBoard.innerText = "";
        player_current.text.style.borderBottom = "3px hidden #000000";

        if (scored && !player_other.scored) {
            setStatic(ball, true);
            Body.setPosition(ball, {
                x: x,
                y: y
            });
            player_current.canMoveBall = true;
            player_other.canMoveBall = false;


        } else if (!scored && player_other.scored) {
            player_current.score++;
            player_other.canMoveBall = true;
            player_current.canMoveBall = false;

            //show shot selection
            showOptionsScreen(true);

        } else if (scored === player_other.scored) {
            player_other.canMoveBall = true;
            player_current.canMoveBall = true;
            //show shot selection
            showOptionsScreen(true);
        }

        player_current.text.innerText = player_current.name + " " + horse[player_current.score];

        //change player
        player_current = player_current === player_one ? player_two : player_one;
        player_current.text.style.borderBottom = "3px solid #000000";

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


//checks that all selected shots have been completed
function isScored() {
    let scored = true;
    shotTypes.forEach(function(arrayItem) {
        if (arrayItem.selected && !arrayItem.complete) {
            scored = false;
        }
    });
    return scored;
}

function showOptionsScreen(newShot){

   if (newShot){
       allButtons[0].style.display = "grid";
   }
}

function buttonSelected(shot) {
    if (shot.selected) {
        shot.selected = false;
        shot.button.style.background = '#5500FF';
    } else {
        shot.selected = true;
        shot.button.style.background = 'green';
    }
}

$("#confirm").click(function(event) {
    event.preventDefault();

    let shotText = " Shot";
    let numberSelected = 0;
    shotTypes.forEach(function(arrayItem) {
        if (arrayItem.selected) {
            shotText = " " + arrayItem.name + shotText;
            numberSelected++;
        }
        arrayItem.complete = false;
    });

    //blindShot will always be true
    blindShot.complete = true;
    //swish is true until rim is hit
    swish.complete = true;
    numberOfBouncesLeft = bounceShot.selected ? 1 : 0;
    shotText = numberSelected > 0 ? shotText : "Normal Shot";
    $("#shotType").text(shotText);
    allButtons[0].style.display = "none";

    playerCanMoveBall = true;

});

$("#skyShot").click(function(event) {
    event.preventDefault();
    buttonSelected(skyShot);
});
$("#blindShot").click(function(event) {
    event.preventDefault();
    buttonSelected(blindShot);
});
$("#bounceShot").click(function(event) {
    event.preventDefault();
    buttonSelected(bounceShot);
});
$("#garageShot").click(function(event) {
    event.preventDefault();
    buttonSelected(garageShot);
});
$("#swish").click(function(event) {
    event.preventDefault();
    buttonSelected(swish);
});
$("#roofShot").click(function(event) {
    event.preventDefault();
    buttonSelected(roofShot);
});

//used to call animate.css
$.fn.extend({
    animateCss: function(animationName, callback) {
        let animationEnd = (function(el) {
            let animations = {
                animation: 'animationend',
                OAnimation: 'oAnimationEnd',
                MozAnimation: 'mozAnimationEnd',
                WebkitAnimation: 'webkitAnimationEnd',
            };

            for (let t in animations) {
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