// select canvas element
const canvas = document.getElementById("atm");

// getContext of canvas = methods and properties to draw and do a lot of thing to the canvas
const ctx = canvas.getContext('2d');

// Load Textures
var _img = document.getElementById('id1');

// Load Player textures
var gPlayer = new Image;
gPlayer.onload = function() {
    _img.src = this.src;
}
gPlayer.src = 'gfx/player.png';

class rClip {
    constructor(sx, sy, ew, eh) {
        this.sx = sx;   // Start of clip x coordinate
        this.sy = sy;   // Start of clip y coordinate
        this.ew = ew;   // Clip width
        this.eh = eh;   // Clip height
    }
}

class Rect {
    constructor(x, y, w, h) {
        this.x = x; 
        this.y = y; 
        this.w = w; 
        this.h = h; 
    }
}

// CLips for Player
let rPlayer = new rClip(14);

// Player Texture clips


rPlayer[0] = new rClip(0,0,48,48);			 // Walking 			    0
rPlayer[1] = new rClip(48,0,48,48);			 // Walking 			    1
rPlayer[2] = new rClip(96,0,48,48);			 // Walking 			    2
rPlayer[3] = new rClip(144,0,48,48);		 // Walking 			    3

rPlayer[4] = new rClip(0,48,48,48);			 // Walking Reversed	    4
rPlayer[5] = new rClip(48,48,48,48);		 // Walking Reversed	    5
rPlayer[6] = new rClip(96,48,48,48);		 // Walking Reversed	    6
rPlayer[7] = new rClip(144,48,48,48);		 // Walking Reversed	    7

rPlayer[8] = new rClip(0,96,48,48);			 // Before Slash 	        8
rPlayer[9] = new rClip(48,96,64,48);		 // Slash attack 	        9

rPlayer[10] = new rClip(0,144,48,48);		 // Before Slash Reversed 	10
rPlayer[11] = new rClip(48,144,64,48);		 // Slash attack Reversed 	11

rPlayer[12] = new rClip(144,96,48,48);		 // Parry 			        12
rPlayer[13] = new rClip(144,144,48,48);		 // Parry Reversed			13


// load sounds
let sWall = new Audio();
let sScore = new Audio();
let sSlash = new Audio();
let sHit = new Audio();

// Load Sounds
sWall.src = "sounds/snd_wall.wav";
sScore.src = "sounds/snd_score.wav";
sSlash.src = "sounds/snd_slash.wav";
sHit.src = "sounds/snd_hit.wav";

let gameover = false;
const winningScore = 999;

// Ball object
const ball = {
    x : canvas.width/2,
    y : canvas.height/2,
    radius : 20,
    w : 40,
    h : 40,
    velocityX : 5,
    velocityY : 5,
    speed : 7,
    color : "WHITE"
}

// User Paddle
const user = {
    x : 0, // left side of canvas
    y : (canvas.height - 64)/2, // -100 the height of paddle
    w : 48,
    h : 48,
    width : 48,
    height : 48,
    score : 0,
    color : "WHITE",
    moveLeft : false,
    moveRight : false,
    moveUp : false,
    moveDown : false,
    moving : false,
    vX : 0.0,
    vY : 0.0,
    vMax : 12,
    speed : 6,
    walkTimer : 0,              // Used for animating walk
    facing : "right",
    sprite_index : 0,
    flipW : false,
	attackTimer : 0.0,
	attackTimerSpe : 1,	// default: 1
	attackFrame : 0.0,
	attackType : 0.0,	// 0: slash, 1: down stab
	stunTimer : 0.0,
	attack : false,
	stunned : false,
	clash : false,
	spawnAttack : false,
    alive : true,
    side: ""            // side the ball is to the player
}

// COM Paddle
const com = {
    x : canvas.width - 48, // - width of paddle
    y : (canvas.height - 48)/2, // -100 the height of paddle
    width : 48,
    height : 48,
    score : 0,
    color : "WHITE",
    side: ""            // side the ball is to the AI
}

// NET
const net = {
    x : (canvas.width - 2)/2,
    y : 0,
    height : 10,
    width : 2,
    color : "WHITE"
}

// draw a rectangle, will be used to draw paddles
function drawRect(x, y, w, h, color){
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

// draw circle, will be used to draw the ball
function drawArc(x, y, r, color){
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2,true);
    ctx.closePath();
    ctx.fill();
}

// Keydown events
document.addEventListener('keydown', (event)=> {
   if (event.key == "a") {
        user.moveLeft = true;
   }
   if (event.key == "d") {
        user.moveRight = true;
   }
   if (event.key == "w") {
        user.moveUp = true;
   }
   if (event.key == "s") {
        user.moveDown = true;
   }
   // If pressed 'n' key, do slash attack
   if (event.key == "n") {
        if (!user.attack) {
            user.attack = true;
            user.playSlash = true;
            user.clash = false;
            user.spawnAttack = true;
            user.attackType = 0;
        }
   }
});


// Keyup events
document.addEventListener('keyup', (event) => {
    if (event.key == "a") {
        user.moveLeft = false;
    }
    if (event.key == "d") {
        user.moveRight = false;
    }
    if (event.key == "w") {
        user.moveUp = false;
    }
    if (event.key == "s") {
        user.moveDown = false;
    }
});

// Reset ball if scoring
function resetBall(){
    ball.x = canvas.width/2;
    ball.y = canvas.height/2;
    ball.velocityX = -ball.velocityX;
    ball.speed = 7;
}

// Render net
function drawNet(){
    for(let i = 0; i <= canvas.height; i+=15){
        drawRect(net.x, net.y + i, net.width, net.height, net.color);
    }
}

// Render text
function drawText(text,x,y, alignment){
    if (alignment == "center") {
        ctx.textAlign = "center";
    }
    ctx.fillStyle = "#FFF";
    ctx.font = "75px fantasy";
    ctx.fillText(text, x, y);
}

// Update
function UpdateAll(){

    // User movement
    if (user.moveLeft && !user.attack) {
        user.vX -= user.speed;
        user.facing = "left";
        user.moving = true;
    }
    if (user.moveRight && !user.attack) {
        user.vX += user.speed;
        user.facing = "right";
        user.moving = true;
    }
    if (user.moveUp && !user.attack) {
        user.vY -= user.speed;
        user.moving = true;
    }
    if (user.moveDown && !user.attack) {
        user.vY += user.speed;
        user.moving = true;
    }

    // Player not moving X
    if (!user.moveleft && !user.moveright) {
        user.vX = user.vX - user.vX * 0.2;
    }

    // Player not moving Y
    if (!user.moveup && !user.movedown) {
        user.vY = user.vY - user.vY * 0.2;
    }
    
    // Player not moving
    if (!user.moveUp && !user.moveDown && !user.moveLeft && !user.moveRight) {
        user.moving = false;
    }

    ///////////////////////////////////////////////////////////////////////////
    //-----------------------------------------------------------------------//
    //-------------------------- Do idle animation --------------------------//
    // If not attacking
    if (!user.attack)
    {
        // If not moving
        if (!user.moving) {

            // If not attacking
            if (!user.attack)
            {
                // If facing left
                if (user.facing == "left")
                {
                    user.sprite_index = 4;
                } 

                // If facing right
                if (user.facing == "right")
                {
                    user.sprite_index = 0;
                }
            }

        // Moving animation
        } else {

            ///////////////////////////////////////////////////////////////////////////
            //-----------------------------------------------------------------------//
            //----------------------------- Do walkTimer ----------------------------//
            {
                // Increment animation timer
                user.walkTimer += 10;

                // If walkTimer is at 30 frames
                if (user.walkTimer == 30)
                {
                    //
                }

                // Increment current animation frame
                if (user.walkTimer > 60)
                {
                    // Reset timer
                    user.walkTimer = 0;
                    // Go to next animation frame
                    user.sprite_index++;
                }

                // Reset sprite
                
                // If facing left
                if (user.facing == "left")
                {
                    if (user.sprite_index > 7) {
                        user.sprite_index = 4;
                    }
                } 

                // If facing right
                else {
                    if (user.sprite_index > 3) {
                        user.sprite_index = 0;
                    }
                }



            }
            //----------------------------- Do walkTimer ----------------------------//
            //-----------------------------------------------------------------------//
            ///////////////////////////////////////////////////////////////////////////
        }

    }
    //-------------------------- Do idle animation --------------------------//
    //-----------------------------------------------------------------------//
    ///////////////////////////////////////////////////////////////////////////

    //-----------------------------------------------------------------------//
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    //-----------------------------------------------------------------------//
    //----------------------------- Do Attacking ----------------------------//
    // If attacking
    else if (user.attack)
    {
        // Stop Player movement
        user.vX = 0.0;
        user.vY = 0.0;

        // If we are doing a slash attack
        if (user.attackType == 0)
        {
            // Increase attack timer/frames
            user.attackTimer += user.attackTimerSpe;

            // If attack timer below 15 frames
            if (user.attackTimer < 15)
            {
                // If facing left
                if (user.facing == "left")
                {
                    // Set pre-slashing sprite REVERSED
                    user.sprite_index = 10;
                } 
                
                // If facing right
                else
                {
                    // Set pre-slashing sprite
                    user.sprite_index = 8;
                }
            }

            // At frame 16, spawn attack collision
            else if (user.attackTimer == 16)
            {
                // Play slash sound effect
                sSlash.play();

                // If facing left
                if (user.facing == "left")
                {
                    // Set slash sprite REVERSED
                    user.sprite_index = 11;
                } 
                
                // If facing right
                else
                {
                    // Set slash sprite
                    user.sprite_index = 9;
                }

                // If we are spawning an attack-object
                if (user.spawnAttack) {

                    // Immediatly stop attacking
                    user.spawnAttack = false;

                    // If facing right
                    /* var width;
                    if (facing == "right") {

                        // Set attack object's x pos to the right of player's body
                        width = 38;
                    }else{

                        // Set attack object's x pos to the left of player's body
                        width = -21;
                    }
                    // Attack-object's width and height
                    int tempWidth = 38;
                    int tempHeight = 64;

                    // Spawn attack object (it will appear in the world for 1 frame then remove itself)
                    obj.spawn(object, x+w/2-38/2+width,
                                        y-16,
                                        tempWidth, tempHeight,
                                        0);*/
                }
            }
            // Attack over
            if (user.attackTimer > 20) {
                // Reset attack-type
                user.attackType = -1;
                user.attackTimer = 0;
                user.attack = false;
            }
        }
    }
    //----------------------------- Do Attacking ----------------------------//
    //-----------------------------------------------------------------------//
    ///////////////////////////////////////////////////////////////////////////

    // Movement max
    if (user.vX > user.vMax) {
        user.vX = user.vMax;
    }
    if (user.vX < -user.vMax) {
        user.vX = -user.vMax;
    }
    if (user.vY > user.vMax) {
        user.vY = user.vMax;
    }
    if (user.vY < -user.vMax) {
        user.vY = -user.vMax;
    }

    // Movement
    user.x += user.vX;
    user.y += user.vY;

    // Movement decay
    user.vX = user.vX - user.vX * 0.7;
    user.vY = user.vY - user.vY * 0.7;

    // Player level boundaries
    if(user.x < 0 ){
       user.x = 0;
    }
    if(user.y < 0 ){
       user.y = 0;
    }
    if(user.x+user.w > canvas.width ){
       user.x = canvas.width-user.w;
    }
    if(user.y+user.h > canvas.height){
       user.y = canvas.height-user.h;
    }
    
    // change the score of players, if the ball goes to the left "ball.x<0" computer win, else if "ball.x > canvas.width" the user win
    if( ball.x - ball.radius < 0 ){
        com.score++;
        sScore.play();
        resetBall();
    }else if( ball.x + ball.radius > canvas.width){
        user.score++;
        sScore.play();
        resetBall();
    }
    
    // when the ball collides with bottom and top walls we inverse the y velocity.
    if(ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height){
        ball.velocityY = -ball.velocityY;
        sWall.play();
    }

    // If collision happened between ball and Player
    if  (checkCollision(ball.x, ball.y, ball.radius*2, ball.radius*2, user.x, user.y, user.w, user.h)) {

        // If player attacked
        if (user.attackTimer >= 16)
        {
            // play sound
            sHit.play();

            let paddle = user;

            // we check where the ball hits the paddle
            let collidePoint = (ball.y - (paddle.y + paddle.height/2));
            
            // normalize the value of collidePoint, we need to get numbers between -1 and 1.
            // -paddle.height/2 < collide Point < player.height/2
            collidePoint = collidePoint / (paddle.height/2);
            
            // when the ball hits the top of a paddle we want the ball, to take a -45degees angle
            // when the ball hits the center of the paddle we want the ball to take a 0degrees angle
            // when the ball hits the bottom of the paddle we want the ball to take a 45degrees
            // Math.PI/4 = 45degrees
            let angleRad = (Math.PI/4) * collidePoint;
            
            // change the X and Y velocity direction
            let direction = (ball.x + ball.radius < canvas.width/2) ? 1 : -1;

            // Change velocity of Ball
            ball.velocityX = direction * ball.speed * Math.cos(angleRad);
            ball.velocityY = ball.speed * Math.sin(angleRad);

            // speed up the ball everytime a paddle hits it.
            ball.speed += 0.1;
        }
    }

    // If collision happened between ball and Player
    if  (checkCollision(ball.x-ball.radius, ball.y-ball.radius, ball.radius*2, ball.radius*2, com.x, com.y, com.width, com.height))
    {
            // play sound
            sHit.play();

            let paddle = com;

            // we check where the ball hits the paddle
            let collidePoint = (ball.y - (paddle.y + paddle.height/2));
            
            // normalize the value of collidePoint, we need to get numbers between -1 and 1.
            // -paddle.height/2 < collide Point < player.height/2
            collidePoint = collidePoint / (paddle.height/2);
            
            // when the ball hits the top of a paddle we want the ball, to take a -45degees angle
            // when the ball hits the center of the paddle we want the ball to take a 0degrees angle
            // when the ball hits the bottom of the paddle we want the ball to take a 45degrees
            // Math.PI/4 = 45degrees
            let angleRad = (Math.PI/4) * collidePoint;
            
            // change the X and Y velocity direction
            let direction = (ball.x + ball.radius < canvas.width/2) ? 1 : -1;

            // Change velocity of Ball
           // ball.velocityX = direction * ball.speed * Math.cos(angleRad);
            ball.velocityX = -ball.velocityX;
            ball.velocityY = ball.speed * Math.sin(angleRad);

            // speed up the ball everytime a paddle hits it.
            ball.speed += 0.1;
    }

    // Winner
    if (user.score >= winningScore || com.score >= winningScore) {
        gameover = true;
    }

    // If not game over, continue game
    if (!gameover)
    {
        // the ball has a velocity
        ball.x += ball.velocityX;
        ball.y += ball.velocityY;
    
        // computer plays for itself, and we must be able to beat it
        // simple AI
        com.y += ((ball.y - (com.y + com.height/2)))*0.1;
    } 
    
    // There is a winner!
    else {
        
    }
}

// Render an image, with clips
function RenderImg(img, x, y, w, h, rRect = new rClip() ) {
    ctx.drawImage(gPlayer, 
                  rRect.sx, rRect.sy, rRect.ew, rRect.eh, 
                  user.x, user.y, user.w, user.h);
}


// RenderAll function, the function that does all tdhe drawing
function RenderAll(){
    
    // clear the canvas
    drawRect(0, 0, canvas.width, canvas.height, "#000");
        
        // draw the net
        drawNet();

        // Render Player Slash attack
        if (user.sprite_index == 9 || user.sprite_index == 11) {
            RenderImg(gPlayer, user.x, user.y, 62, user.h, rPlayer[user.sprite_index]);
        } 
        
        // Render Walking
        else {
            RenderImg(gPlayer, user.x, user.y, user.w, user.h, rPlayer[user.sprite_index]);
        }
        
        // Render AI
        //drawRect(com.x, com.y, com.width, com.height, com.color);
        tClip = rPlayer[4];
        ctx.drawImage(gPlayer, tClip.sx, tClip.sy, tClip.ew, tClip.eh, com.x, com.y, com.width, com.height);
        
        // draw the ball
        drawArc(ball.x, ball.y, ball.radius, ball.color);

        // Draw UI
        {
    
            // draw the user score to the left
            drawText(user.score,canvas.width/4,canvas.height/5);
            //drawText(user.score,canvas.width/4,canvas.height/5);
            
            // draw the COM score to the right
            drawText(com.score,3*canvas.width/4,canvas.height/5);

            // Draw game over ctx
            if (gameover) {
                if (user.score >= winningScore) {
                    drawText("Congrats, you win!", canvas.width/2, canvas.height * 0.90, "center");
                }
                if (com.score >= winningScore) {
                    drawText("You lose, AI wins.", canvas.width/2, canvas.height * 0.90, "center");
                }
            }
        }
}

function checkCollision( x,  y,  w,  h,  x2,  y2,  w2,  h2) {
	var collide = false;

	if (x+w > x2 && x < x2 + w2 && 
        y+h > y2 && y < y2 + h2) {
		collide = true;
	}

	return collide;
}

function checkCollisionRect ( a = new Rect (), b = new Rect () )
{
    //The sides of the rectangles
    var leftA,   leftB;
    var rightA,  rightB;
    var topA, 	 topB;
    var bottomA, bottomB;

    //Calculate the sides of rect A
    leftA 	= a.x;
    rightA 	= a.x + a.w;
    topA 	= a.y;
    bottomA = a.y + a.h;

    //Calculate the sides of rect B
    leftB 	= b.x;
    rightB 	= b.x + b.w;
    topB 	= b.y;
    bottomB = b.y + b.h;

    //If any of the sides from A are outside of B
    if( bottomA < topB )
    {
        return false;
    }

    if( topA > bottomB )
    {
        return false;
    }

    if( rightA < leftB )
    {
        return false;
    }

    if( leftA > rightB )
    {
        return false;
    }

    //If none of the sides from A are outside B
    return true;
}










function game(){
    UpdateAll();
    RenderAll();
}











// number of frames per second
let framePerSecond = 60;

//call the game function 50 times every 1 Sec
let loop = setInterval(game,1000/framePerSecond);


