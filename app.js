var frameRate = 0.025; // Seconds
var frameDelay = frameRate * 1000; // ms
var loopTimer = false;

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");


var frameRate = 1/40; // Seconds
var frameDelay = frameRate * 1000; // ms
var loopTimer = false;

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
    position: {x: canvas.width/2, y: 0},
    velocity: {x: 10, y: 0},
    acceleration: 15,
    radius: 35, // 1px = 1cm
    restitution: 0.8,
    friction: -0.5
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
        ball.velocity.y = (ballStartingY - ball.position.y) /10;
        ball.velocity.x = (ballStartingX - ball.position.x) / 10;
    }
}

var setup = function() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    window.addEventListener("touchstart", mouseDown, false);
    window.addEventListener("touchend", mouseUp, false);
    window.addEventListener("touchmove", getMousePosition, false);
    window.onmousemove = getMousePosition;
    window.onmousedown = mouseDown;
    window.onmouseup = mouseUp;

    ctx.fillStyle = 'red';
    ctx.strokeStyle = '#000000';
    loopTimer = setInterval(loop, frameDelay);
}
var loop = function() {

    if ( ! mouse.isDown) {
        // Do physics
        // Drag force: Fd = -1/2 * Cd * A * rho * v * v

        // Integrate to get velocity
        ball.velocity.y += ball.acceleration*frameRate;

        // Integrate to get position
        ball.position.x += ball.velocity.x*frameRate*100;
        ball.position.y += ball.velocity.y*frameRate*100;
    }
    // Handle collisions
    if (ball.position.y > canvas.height - ball.radius) {
        ball.velocity.y *= -ball.restitution;
        ball.position.y = canvas.height - ball.radius;
    }
    if (ball.position.x > canvas.width - ball.radius) {
        ball.velocity.x *= ball.friction;
        ball.position.x = canvas.width - ball.radius;
    }
    if (ball.position.x < ball.radius) {
        ball.velocity.x *= ball.friction;
        ball.position.x = ball.radius;
    }

    // ball is rolling along the bottom
    if (ball.position.y == canvas.height - ball.radius)
    {
        ball.velocity.x *= ball.restitution;;
    }
    // Draw the ball


    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.save();

    ctx.translate(ball.position.x, ball.position.y);
    ctx.beginPath();
    ctx.arc(0, 0, ball.radius, 0, Math.PI*2, true);
    ctx.fill();
    ctx.closePath();

    ctx.restore();


    // Draw the slingshot
    if (mouse.isDown) {
        ctx.beginPath();
        ctx.moveTo(ballStartingX, ballStartingY);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
        ctx.closePath();
        ball.position.x = mouse.x;
        ball.position.y = mouse.y;
    }

}
setup();



