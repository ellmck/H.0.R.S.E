var frameRate = 0.025; // Seconds
var frameDelay = frameRate * 1000; // ms
var loopTimer = false;

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var ballStartingX ;
var ballStartingY ;

var ball = {
    position: {x: canvas.width*0.5, y: 0},
    velocity: {x: 10, y: 0},
    acceleration: 25,
    radius: 35, // 1px = 1cm
    restitution: 0.7,
    friction: -0.7
};

var ballNetRatio = 2;
var ballBackboardRatio = 4.4;
var backboardOffsetRatio = 0.62;

var net = {

    backboard: {x: 0, y: 0, w: 30, h: 0},
    rightRim: {x: 0, y: 0, w: 8, h: 8},
    leftRim: {x: 0, y: 0, w: 8, h: 8},
    backboardConnector: {x: 0, y: 0, w: 4, h: 4}

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

window.onresize = function(){onResize(canvas)};


function getMousePosition(e) {
    e.preventDefault();

    mouse.x = e.pageX - canvas.offsetLeft;
    mouse.y = e.pageY - canvas.offsetTop;
}

var mouseDown = function(e) {
    e.preventDefault();

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
    e.preventDefault();
    if (e.which == 1) {
        mouse.isDown = false;
        ball.velocity.y = (ballStartingY - ball.position.y) *0.1;
        ball.velocity.x = (ballStartingX - ball.position.x) *0.1;
    }
}

function getTouchPosition(e) {
    e.preventDefault();
    mouse.x = e.targetTouches[0].pageX;
    mouse.y = e.targetTouches[0].pageY;
}

var touchDown = function(e) {
    e.preventDefault();
        getTouchPosition(e);
        mouse.isDown = true;
        ball.position.x = mouse.x;
        ball.position.y = mouse.y;
        ballStartingX = mouse.x;
        ballStartingY = mouse.y;


}
var touchUp = function(e) {
    e.preventDefault();

        mouse.isDown = false;
        ball.velocity.y = (ballStartingY - ball.position.y) *0.1;
        ball.velocity.x = (ballStartingX - ball.position.x) *0.1;

}


var draw = function() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    ball.radius = canvas.width * 0.02;
    net.backboard.h = (ball.radius* 2) * ballBackboardRatio;
    net.backboard.w =  (ball.radius* 2);

    net.backboard.x = canvas.width - (canvas.width * 0.15);
    net.backboard.y = (canvas.height*0.4) - net.backboard.h - ((ball.radius* 2) * backboardOffsetRatio);
    net.rightRim.x = net.backboard.x -  net.rightRim.w - ((ball.radius * 2) * backboardOffsetRatio);
    net.rightRim.y = net.backboard.y + net.backboard.h - ((ball.radius * 2) * backboardOffsetRatio);
    net.leftRim.x = net.rightRim.x - net.rightRim.w - ((ball.radius* 2) * ballNetRatio);
    net.leftRim.y = net.rightRim.y;
    net.backboardConnector.x = net.rightRim.x + net.rightRim.w;
    net.backboardConnector.w = net.backboard.x - net.rightRim.x;
    net.backboardConnector.y = net.rightRim.y + net.backboardConnector.h * 0.5;
    net.leftRim.y = net.rightRim.y;

    canvas.ontouchmove = getTouchPosition;
    canvas.ontouchstart = touchDown;
    canvas.ontouchend = touchUp;
    canvas.onmousemove = getMousePosition;
    canvas.onmousedown = mouseDown;
    canvas.onmouseup = mouseUp;



    context.fillStyle = "#5f5f5f";
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

    objectCollision(ball, net.backboard);
    objectCollision(ball, net.rightRim);
    objectCollision(ball, net.leftRim);
    objectCollision(ball, net.backboardConnector);


    context.clearRect(0,0,canvas.width,canvas.height);
    context.save();


    //draw ball
    context.translate(ball.position.x, ball.position.y);
    context.beginPath();
    context.arc(0, 0, ball.radius, 0, Math.PI*2, true);
    context.fill();
    context.closePath();



    context.restore();
    context.save();

    //DRAWING OF COLLISION OBJECTS WONT BE NEEDED ONCE PHYSICS IS COMPLETE
    //draw net: backboard, rightRim, leftRim, backboardConnector
    context.stroke();
    context.strokeRect(net.backboard.x, net.backboard.y, net.backboard.w, net.backboard.h);
    context.strokeRect(net.leftRim.x, net.leftRim.y, net.leftRim.w, net.leftRim.h);
    context.strokeRect(net.rightRim.x, net.rightRim.y, net.rightRim.w, net.rightRim.h);
    context.strokeRect(net.backboardConnector.x, net.backboardConnector.y, net.backboardConnector.w, net.backboardConnector.h);

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

    setInterval(draw(), 20000);
}


function objectCollision(ball, rect) {

    if ((ball.position.x + ball.radius  + ball.velocity.x > rect.x) &&
        (ball.position.x - ball.radius  + ball.velocity.x < rect.x + rect.w)&&
        (ball.position.y + ball.radius + ball.velocity.y > rect.y) &&
        (ball.position.y - ball.radius + ball.velocity.y < rect.y + rect.h)) {
        if (ball.position.x + ball.radius <= rect.x) {

            ball.position.x = rect.x - ball.radius;

        }
        else if (ball.position.x - ball.radius >= rect.x)
        {
            ball.position.x =  rect.x + rect.w + ball.radius;
        }


        ball.velocity.x *= ball.friction;

    }

    if ((ball.position.x + ball.radius  + ball.velocity.x > rect.x) &&
        (ball.position.x - ball.radius  + ball.velocity.x < rect.x)&&
        (ball.position.y + ball.radius - ball.velocity.y > rect.y ) &&
        (ball.position.y - ball.radius - ball.velocity.y < rect.y + rect.h))
    {

        ball.velocity.y *= ball.friction;
    }

}

function isCircleColliding(ball, rim) {
    /*
    * we have a collision!
    * edge case to consider: balls may get stuck colliding back and forth
    * between each other for a few frames if they don't fully "separate"
    * from each other in one frame of motion.
   */
    return (Math.abs(ball.x - rim.x) < rim.r && Math.abs(ball.y - rim.y) < rim.r );

}




var isMovingTowardsObject = function(objectX, objectY)
{
    var xDist = ball.x - objectX;
    var yDist = ball.x - objectY;
    var xVelocity = 0 - ball.velocity.x;
    var yVelocity = 0 - ball.velocity.y;

    return 0 < xDist*xVelocity + yDist*yVelocity;
}


