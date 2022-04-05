// select canvas element
const canvas = document.getElementById("knight-pong");

// getContext of canvas = methods and properties to draw and do a lot of thing to the canvas
const ctx = canvas.getContext('2d');

// Load Textures
var _img = document.getElementById('id1');

// Used to make clips from Textures
class rClip {
    constructor(sx, sy, ew, eh) {
        this.sx = sx;   // Start of clip x coordinate
        this.sy = sy;   // Start of clip y coordinate
        this.ew = ew;   // Clip width
        this.eh = eh;   // Clip height
    }
}

// Create a rectangle
class Rect {
    constructor(x, y, w, h) {
        this.x = x; 
        this.y = y; 
        this.w = w; 
        this.h = h; 
    }
}

// Check collision between two objects
function checkCollision( x,  y,  w,  h,  x2,  y2,  w2,  h2) {
	var collide = false;

	if (x+w > x2 && x < x2 + w2 && 
        y+h > y2 && y < y2 + h2) {
		collide = true;
	}

	return collide;
}

// Load Player textures
var gPlayer = new Image;
var gBall = new Image;

// Texture pathes
gPlayer.src = 'gfx/player.png';
gBall.src = 'gfx/ball.png';

// Texture clips for Player
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

// Load sounds
let sWall = new Audio();
let sScore = new Audio();
let sSlash = new Audio();
let sHit = new Audio();

// Sound paths
sWall.src = "sounds/snd_wall.wav";
sScore.src = "sounds/snd_score.wav";
sSlash.src = "sounds/snd_slash.wav";
sHit.src = "sounds/snd_hit.wav";

// Global variables
let gameover = false;
const winningScore = 7;

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

// Player
const user = {
    x : 0,                          // left side of canvas
    y : (canvas.height - 64)/2,     // -100 the height of paddle
    w : 48,
    h : 48,
    width : 48,
    height : 48,
    alive : true,
    score : 0,
    color : "WHITE",

    // Movement
    moveLeft : false,
    moveRight : false,
    moveUp : false,
    moveDown : false,
    moving : false,
    vX : 0.0,
    vY : 0.0,
    vMax : 12,
    speed : 6,

    // Animation
    walkTimer : 0,                  // Used for animating walk
    facing : "right",
    flipW : false,
    sprite_index : 0,
    side: "",                       // side the ball is to the player

    // Attack variables
	attackTimer : 0.0,
	attackTimerSpe : 1,	            // default: 1
	attackType : 0,	                // 0: slash
	attack : false,
	spawnAttack : false,

    SlashAttack: function () {
        if (!this.attack) {
            this.attack = true;
            this.playSlash = true;
            this.spawnAttack = true;
            this.attackType = 0;
        }
    },

    Update: function () {
        // User movement
        if (this.moveLeft && !this.attack) {
            this.vX -= this.speed;
            //this.facing = "left";
            this.moving = true;
        }
        if (this.moveRight && !this.attack) {
            this.vX += this.speed;
            this.facing = "right";
            this.moving = true;
        }
        if (this.moveUp && !this.attack) {
            this.vY -= this.speed;
            this.moving = true;
        }
        if (this.moveDown && !this.attack) {
            this.vY += this.speed;
            this.moving = true;
        }

        // Player not moving in X position
        if (!this.moveleft && !this.moveright) {
            this.vX = this.vX - this.vX * 0.2;
        }

        // Player not moving in Y position
        if (!this.moveup && !this.movedown) {
            this.vY = this.vY - this.vY * 0.2;
        }
        
        // Player not moving at all
        if (!this.moveUp && !this.moveDown && !this.moveLeft && !this.moveRight) {
            this.moving = false;
        }

        ///////////////////////////////////////////////////////////////////////////
        //-----------------------------------------------------------------------//
        //-------------------------- Do idle animation --------------------------//
        // If not attacking
        if (!this.attack)
        {
            // If not moving
            if (!this.moving) {

                // If not attacking
                if (!this.attack)
                {
                    // If facing left
                    if (this.facing == "left")
                    {
                        this.sprite_index = 4;
                    } 

                    // If facing right
                    if (this.facing == "right")
                    {
                        this.sprite_index = 0;
                    }
                }

            // Moving animation
            } else {

                ///////////////////////////////////////////////////////////////////////////
                //-----------------------------------------------------------------------//
                //----------------------------- Do walkTimer ----------------------------//
                {
                    // Increment animation timer
                    this.walkTimer += 10;

                    // If walkTimer is at 30 frames
                    if (this.walkTimer == 30)
                    {
                        //
                    }

                    // Increment current animation frame
                    if (this.walkTimer > 60)
                    {
                        // Reset timer
                        this.walkTimer = 0;
                        // Go to next animation frame
                        this.sprite_index++;
                    }

                    // Reset sprite
                    
                    // If facing left
                    if (this.facing == "left")
                    {
                        if (this.sprite_index > 7) {
                            this.sprite_index = 4;
                        }
                    } 

                    // If facing right
                    else {
                        if (this.sprite_index > 3) {
                            this.sprite_index = 0;
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
        else if (this.attack)
        {
            // Stop Player movement
            this.vX = 0.0;
            this.vY = 0.0;

            // If we are doing a slash attack
            if (this.attackType == 0)
            {
                // Increase attack timer/frames
                this.attackTimer += this.attackTimerSpe;

                // If attack timer below 15 frames
                if (this.attackTimer < 15)
                {
                    // If facing left
                    if (this.facing == "left")
                    {
                        // Set pre-slashing sprite REVERSED
                        this.sprite_index = 10;
                    } 
                    
                    // If facing right
                    else
                    {
                        // Set pre-slashing sprite
                        this.sprite_index = 8;
                    }
                }

                // At frame 16, spawn attack collision
                else if (this.attackTimer == 16)
                {
                    // Play slash sound effect
                    sSlash.play();

                    // If facing left
                    if (this.facing == "left")
                    {
                        // Set slash sprite REVERSED
                        this.sprite_index = 11;
                    } 
                    
                    // If facing right
                    else
                    {
                        // Set slash sprite
                        this.sprite_index = 9;
                    }

                    // If we are spawning an attack-object
                    if (this.spawnAttack) {

                        // Immediatly stop attacking
                        this.spawnAttack = false;

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
                if (this.attackTimer > 20) {
                    // Reset attack-type
                    this.attackType = -1;
                    this.attackTimer = 0;
                    this.attack = false;
                }
            }
        }
        //----------------------------- Do Attacking ----------------------------//
        //-----------------------------------------------------------------------//
        ///////////////////////////////////////////////////////////////////////////

        // Movement max
        if (this.vX > this.vMax) {
            this.vX = this.vMax;
        }
        if (this.vX < -this.vMax) {
            this.vX = -this.vMax;
        }
        if (this.vY > this.vMax) {
            this.vY = this.vMax;
        }
        if (this.vY < -this.vMax) {
            this.vY = -this.vMax;
        }

        // Movement
        this.x += this.vX;
        this.y += this.vY;

        // Movement decay
        this.vX = this.vX - this.vX * 0.7;
        this.vY = this.vY - this.vY * 0.7;

        // Player level boundaries
        if(this.x < 0 ){
            this.x = 0;
        }
        if(this.y < 0 ){
            this.y = 0;
        }
        if(this.x+this.w > canvas.width/2 ){
            this.x = canvas.width/2-this.w;
        }
        if(this.y+this.h > canvas.height){
            this.y = canvas.height-this.h;
        }
    }
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
         user.SlashAttack();
    }

    // If Spacebar pressed
    if (event.key == " ") {
         if (gameover) {
            gameover = false;
            user.score = 0;
            com.score = 0;
            resetBall();
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

// Update
function UpdateAll(){

    // Update Player
    user.Update();
    
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
    if  (checkCollision(ball.x-ball.radius, ball.y-ball.radius, ball.radius*2, ball.radius*2, user.x, user.y, user.w, user.h)) {

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
function RenderImg(img, x, y, w, h) {
    ctx.drawImage(img, x, y, w, h);
}

// Render an image, with clips
function RenderImgClip(img, x, y, w, h, rRect = new rClip() ) {
    ctx.drawImage(img, 
                  rRect.sx, rRect.sy, rRect.ew, rRect.eh, 
                  x, y, w, h);
}

// RenderAll function, the function that does all tdhe drawing
function RenderAll(){
    
    // clear the canvas
    drawRect(0, 0, canvas.width, canvas.height, "#000");
        
        // draw the net
        drawNet();

        // Render Player Slash attack
        if (user.sprite_index == 9 || user.sprite_index == 11) {
            RenderImgClip(gPlayer, user.x, user.y, 62, user.h, rPlayer[user.sprite_index]);
        } 
        
        // Render Walking
        else {
            RenderImgClip(gPlayer, user.x, user.y, user.w, user.h, rPlayer[user.sprite_index]);
        }
        
        // Render AI
        RenderImgClip(gPlayer, com.x, com.y, com.width, com.height, rPlayer[4]);
        
        // Render Ball
        RenderImg(gBall, ball.x-ball.radius, ball.y-ball.radius, ball.radius*2, ball.radius*2);

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
                    drawText("Congrats, you win!", canvas.width/2, canvas.height * 0.75, "center");
                }
                if (com.score >= winningScore) {
                    drawText("You lose, AI wins.", canvas.width/2, canvas.height * 0.75, "center");
                }
                drawText("Press 'Spacebar' to restart game.", canvas.width/2, canvas.height * 0.90, "center");
            }
        }
}

function game(){
    UpdateAll();
    RenderAll();
}

// number of frames per second
let framePerSecond = 60;

//call the game function 50 times every 1 Sec
let loop = setInterval(game,1000/framePerSecond);


