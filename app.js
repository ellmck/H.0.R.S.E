var frameRate = 0.025; // Seconds
var frameDelay = frameRate * 1000; // ms
var loopTimer = false;

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var basket = document.getElementById("basket");

var ballStartingX ;
var ballStartingY ;
/*
 * Experiment with values of mass, radius, restitution,
 * gravity (ag), and density (rho)!
 * 
 * Changing the constants literally changes the environment
 * the ball is in. 
 * 
 * Some settings to try:
 * the moon: ag = 1.6
 * water: rho = 1000, mass 5
 * beach ball: mass 0.05, radius 30
 * lead ball: mass 10, restitution -0.05
 */
var ball = {
    position: {x: canvas.width*0.5, y: 0},
    velocity: {x: 10, y: 0},
    acceleration: 25,
    radius: 35, // 1px = 1cm
    restitution: 0.7,
    friction: -0.7
};

var backboard = {
    x: basket.offsetLeft - basket.offsetLeft * 0.018,
    y: basket.offsetTop + basket.offsetTop + basket.offsetTop,
    w: 10,
    h: 100
};


var basketballImage = new Image();
basketballImage.src = "images/basketball.png";
basketballImage.onload = function() {
    context.save();
    context.globalCompositeOperation = 'source-in';
    context.drawImage(basketballImage, 0, 0);
    context.restore();
};

var mouse = {x: 0, y: 0, isDown: false};

function getMousePosition(e) {
    mouse.x = e.pageX - canvas.offsetLeft;
    mouse.y = e.pageY - canvas.offsetTop;
}
var mouseDown = function(e) {
    if (e.which == 1) {
        getMousePosition(e);
        mouse.isDown = true;
        ball.position.x = mouse.x;
        ball.position.y = mouse.y;
        ballStartingX = mouse.x;
        ballStartingY = mouse.y;

    }
}
var mouseUp = function(e) {
    if (e.which == 1) {
        mouse.isDown = false;
        ball.velocity.y = (ballStartingY - ball.position.y) *0.1;
        ball.velocity.x = (ballStartingX - ball.position.x) *0.1;
    }
}

var draw = function() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    ball.radius = canvas.width * 0.025;
    basket.style.top = canvas.height*0.15 + "px";
    basket.style.left = canvas.width - (canvas.width * 0.3) + "px";
    basket.style.width = ball.radius * 10
    basket.ondragstart = function() { return false; };

    window.ontouchmove = getMousePosition;
    window.ontouchdown = mouseDown;
    window.ontouchup = mouseUp;
    window.onmousemove = getMousePosition;
    window.onmousedown = mouseDown;
    window.onmouseup = mouseUp;


    context.fillStyle = 'red';
    context.strokeStyle = '#000000';
    loopTimer = setInterval(loop, frameDelay);
}
var loop = function() {

    if ( ! mouse.isDown)
    {
        // Do physics

        // Integrate to get velocity
        ball.velocity.y += ball.acceleration*frameRate;

        // Integrate to get position
        ball.position.x += ball.velocity.x*frameRate*100;
        ball.position.y += ball.velocity.y*frameRate*100;
    }
    // Handle collisions
    if (ball.position.y > canvas.height - ball.radius)
    {
        ball.velocity.y *= -ball.restitution;
        ball.position.y = canvas.height - ball.radius;
    }
    if (ball.position.x > canvas.width - ball.radius)
    {
        ball.velocity.x *= ball.friction;
        ball.position.x = canvas.width - ball.radius;
    }
    if (ball.position.x < ball.radius)
    {
        ball.velocity.x *= ball.friction;
        ball.position.x = ball.radius;
    }

    // ball is rolling along the bottom
    if (ball.position.y == canvas.height - ball.radius)
    {
        ball.velocity.x *= ball.restitution;;
    }

    objectCollision(backboard);

    //draw ball
    context.clearRect(0,0,canvas.width,canvas.height);
    context.save();
    context.translate(ball.position.x, ball.position.y);
    context.beginPath();
    context.arc(0, 0, ball.radius, 0, Math.PI*2, true);
    context.fill();
    context.closePath();


    context.restore();
    context.save();

    //DRAWING OF COLLISION OBJECTS WONT BE NEEDED ONCE PHYSICS IS COMPLETE
    //draw backboard
    context.stroke();
    context.strokeRect(backboard.x, backboard.y, backboard.w, backboard.h);


    // Draw the slingshot
    if (mouse.isDown) {
        context.beginPath();
        context.moveTo(ballStartingX, ballStartingY);
        context.lineTo(mouse.x, mouse.y);
        context.stroke();
        context.closePath();
        ball.position.x = mouse.x;
        ball.position.y = mouse.y;
    }

}
draw();

var onResize = function(){

    setInterval(draw(), 2000);
}

window.onresize = function(){onResize(canvas)};

// (((ballX + ballRadius >= object.left) &&
//     (ballX - ballRadius <= object.right) &&
//     (ballY - ballRadius <= object.top) &&
//     (ballY + ballRadius >= object.bottom)) &&
//     (isMovingTowardsObject(ball, object.left, obj

function objectCollision(rect) {

    if ((ball.position.x + ball.radius >= rect.x) &&
        (ball.position.x - ball.radius <= rect.x + rect.w) )
    {
        ball.velocity.x *= ball.friction;
    }
}


var isMovingTowardsPoint = function(objectX, objectY)
{
    var xDist = ball.x - objectX;
    var yDist = ball.x - objectY;
    var xVelocity = 0 - ball.velocity.x;
    var yVelocity = 0 - ball.velocity.y;

    return 0 < xDist*xVelocity + yDist*yVelocity;
}


