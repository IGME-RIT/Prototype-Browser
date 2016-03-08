(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports={
    "lessons":[
        {
            "x": "0",
            "y": "0",
            "image": "dog.jpeg"
        },
        {
            "x": "100",
            "y": "100",
            "image": "dog.jpeg"
        }
    ]
}
},{}],2:[function(require,module,exports){
"use strict";
//imports
var Game = require('./modules/game.js');
var Point = require('./modules/point.js');
var MouseState = require('./modules/mouseState.js');

//variables
var game;
var canvas;
var ctx;

var header;
var activeHeight;
var center;

var mousePosition;
var relativeMousePosition;
var mouseDown;
var mouseIn;
/*app.IMAGES = {
    testImage: "images/dog.png"
 };*/

window.onload = function(e){
    initializeVariables();
    loop();
}

function initializeVariables(){
    canvas = document.querySelector('canvas');
    ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    console.log("Canvas Dimensions: " + canvas.width + ", " + canvas.height);
    
    header = document.querySelector('header');
    activeHeight = canvas.offsetHeight - header.offsetHeight;
    center = new Point(canvas.width/2, activeHeight/2 + header.offsetHeight);
    
    mousePosition = new Point(0,0);
    relativeMousePosition = new Point(0,0);
    
    //event listener for when the mouse moves over the canvas
    canvas.addEventListener("mousemove", function(e){
        var boundRect = canvas.getBoundingClientRect();
        mousePosition = new Point(e.clientX - boundRect.left, e.clientY - boundRect.top);
        relativeMousePosition = new Point(mousePosition.x - (canvas.offsetWidth/2.0), mousePosition.y - (header.offsetHeight + activeHeight/2.0));        
    });
    mouseDown = false;
    canvas.addEventListener("mousedown", function(e){
        mouseDown = true;
    });
    canvas.addEventListener("mouseup", function(e){
        mouseDown = false;
    });
    mouseIn = false;
    canvas.addEventListener("mouseover", function(e){
        mouseIn = true;
    });
    canvas.addEventListener("mouseout", function(e){
        mouseIn = false;
        mouseDown = false;
    });
    
    game = new Game();
}

function loop(){
    window.requestAnimationFrame(loop.bind(this));
    game.update(ctx, canvas, 0, center, activeHeight, new MouseState(mousePosition, relativeMousePosition, mouseDown, mouseIn));
}

window.addEventListener("resize", function(e){
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    activeHeight = canvas.height - header.offsetHeight;
    center = new Point(canvas.width / 2, activeHeight / 2 + header.offsetHeight)
    
    console.log("Canvas Dimensions: " + canvas.width + ", " + canvas.height);
});




},{"./modules/game.js":9,"./modules/mouseState.js":11,"./modules/point.js":12}],3:[function(require,module,exports){
'use strict';
//var utilities = require('./utilities.js');
var app = app || {};

app.main = {    
    //variables
    canvas: undefined,
    ctx: undefined,
    app: undefined,
    utilities: undefined,
    drawLib: undefined,
    
    mousePosition: undefined,
    lastMousePosition: undefined,
    relativeMousePosition: undefined,
    animationID: 0,
	lastTime: 0,
    
    header: undefined,
    activeHeight: undefined,
    center: undefined,
    board: undefined,
    
    dragging: undefined,
    cursor: undefined,
    
    //dataObject: require('./objects/dataObject.js'),
    
    //enumeration
    GAME_STATE: Object.freeze({	
		BOARD_VIEW: 0,
		FOCUS_VIEW: 1
	}),
    
    init : function() {
        //this.debugLine = document.querySelector('#debugLine');
        
        this.canvas = document.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        
        this.mousePosition = new app.point(this.canvas.width/2, this.canvas.height/2);
        this.lastMousePosition = this.mousePosition;
        this.relativeMousePosition = this.mousePosition;
        
        this.header = document.querySelector('header');
        this.activeHeight = this.canvas.height - this.header.offsetHeight;
        this.center = new app.point(this.canvas.width/2, this.activeHeight / 2 + this.header.offsetHeight);
        //get listv of nodes from data
        
        var tempLessonNodeArray = [];
        tempLessonNodeArray.push(new app.lessonNode(new app.point(0,0)));
        tempLessonNodeArray.push(new app.lessonNode(new app.point(300,300)));
        tempLessonNodeArray.push(new app.lessonNode(new app.point(300,-300)));
        this.board = new app.board(new app.point(0,0), tempLessonNodeArray);
        
        this.dragging = false;
        this.cursor = document.getElementById("myP");
        
        var testetest = this.dataObject.infoArray;
        
        //denotes gameplay state
        this.game_state = this.GAME_STATE.BOARD_VIEW;
        
        //connecting events
        this.canvas.onmousemove = this.getMousePosition.bind(this);
        this.canvas.onmousedown = this.doMouseDown.bind(this);
        this.canvas.onmouseup = this.doMouseUp.bind(this);
        this.canvas.addEventListener("mousewheel", this.doWheel.bind(this));
        
        //start the loop
        this.update();
    },
    
    //loop functions
    update: function() {
        //call the loop
        this.animationID = requestAnimationFrame(this.update.bind(this));
        
        //calculate delta time
        var dt = this.calculateDeltaTime();
        
        //clear the canvas
        this.drawLib.clear(this.ctx,0,0,this.canvas.offsetWidth,this.canvas.offsetHeight);
        this.drawLib.rect(this.ctx, 0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight, "White");
        
        //update
        if(this.game_state == this.GAME_STATE.BOARD_VIEW){
            
            //draw game screen
            
            this.boardCollisionHandling();
            this.board.draw(this.ctx, this.center, this.canvas.width, this.activeHeight);
            
            this.drawLib.circle(this.ctx, this.mousePosition.x, this.mousePosition.y, 10, "RoyalBlue");
        }
        else if(this.game_state == this.GAME_STATE.TITLE){
            //draw title screen
        }
        //cursor handling
        this.cursorHandler();
        this.debugHud(this.ctx, dt);
    },
    
    calculateDeltaTime: function(){
		var now;
        var fps;
		now = (+ new Date); 
		fps = 1000 / (now - this.lastTime);
		fps = app.utilities.clamp(fps, 12, 60);
		this.lastTime = now; 
		return 1/fps;
	},
    
    //helper event functions
    getMousePosition: function(e){
		this.lastMousePosition = this.mousePosition;
        this.mousePosition = app.utilities.getMouse(e, this.canvas.offsetWidth, this.canvas.offsetHeight);
        this.relativeMousePosition = new app.point(this.mousePosition.x - this.canvas.width/2 + this.board.position.x, this.mousePosition.y - this.activeHeight/2 + this.board.position.y - this.header.offsetHeight);
        
        if(this.dragging){
            //the positional difference between last loop and this
            this.board.move(this.lastMousePosition.x - this.mousePosition.x, this.lastMousePosition.y - this.mousePosition.y);
        }
	},
    doMouseDown : function(e) {
        this.dragging = true;
    },
    doMouseUp : function(e) {
        this.dragging = false;
    },
    doWheel : function(e) {
        this.board.zoom(this.ctx, this.center, e.deltaY);
    },
    
    cursorHandler : function(){
        //is it hovering over the canvas?
        //is it dragging?
        if(this.dragging){
            this.canvas.style.cursor = "-webkit-grabbing";
        }
        else{
            this.canvas.style.cursor = "default";
        }
    },
    
    boardCollisionHandling : function(){
        var activeNode;
        for(var i = 0; i < this.board.lessonNodeArray.length; i++){
            activeNode = this.board.lessonNodeArray[i];
            if(this.relativeMousePosition.x > activeNode.position.x - activeNode.width/2 && this.relativeMousePosition.x < activeNode.position.x + activeNode.width/2){
                if(this.relativeMousePosition.y > activeNode.position.y - activeNode.height/2 && this.relativeMousePosition.y < activeNode.position.y + activeNode.height/2){
                    activeNode.boardButton.hovered = true;
                    break;
                }
                else{
                    activeNode.boardButton.hovered = false;
                }
            }
            else{
                activeNode.boardButton.hovered = false;
            }
        }
    },
    
    //debug
    debugHud: function(ctx, dt) {
        ctx.save();
        this.fillText(ctx, "mousePosition: " + this.mousePosition.x + ", " + this.mousePosition.y, 50, this.canvas.height - 10, "12pt oswald", "Black");
        this.fillText(ctx,"RelMousePosition: "+this.relativeMousePosition.x + ", " + this.relativeMousePosition.y, this.canvas.width/2, this.canvas.height - 10,"12pt oswald","Black");
        this.fillText(ctx, "dt: " + dt.toFixed(3), this.canvas.width - 150, this.canvas.height - 10, "12pt oswald", "black");
        this.drawLib.line(ctx, this.center.x, this.center.y - this.activeHeight/2, this.center.x, this.center.y + this.activeHeight/2, 2, "Lightgray");
        this.drawLib.line(ctx, 0, this.center.y, this.canvas.width, this.center.y, 2, "Lightgray");
        
        this.fillText(ctx, this.board.lessonNodeArray[0].boardButton.hovered, this.canvas.width/2, this.canvas.height - 30, "12pt oswald", "black");
        this.fillText(ctx, this.board.lessonNodeArray[1].boardButton.hovered, this.canvas.width/2, this.canvas.height - 50, "12pt oswald", "black");
        this.fillText(ctx, this.board.lessonNodeArray[2].boardButton.hovered, this.canvas.width/2, this.canvas.height - 70, "12pt oswald", "black");
        
        ctx.restore();
    },
    fillText: function(ctx, string, x, y, css, color) {
		ctx.save();
		// https://developer.mozilla.org/en-US/docs/Web/CSS/font
		this.ctx.font = css;
		this.ctx.fillStyle = color;
		this.ctx.fillText(string, x, y);
		ctx.restore();
	},
};
},{}],4:[function(require,module,exports){
"use strict";

//parameter is a point that denotes starting position
function board(startPosition, lessonNodes){
    this.position = startPosition;
    this.lessonNodeArray = lessonNodes;
}

board.drawLib = undefined;

//helper
function calculateBounds(){
    if(this.lessonNodeArray.length > 0){
        this.boundLeft = this.lessonNodeArray[0].position.x;
        this.boundRight = this.lessonNodeArray[0].position.x;
        this.boundTop = this.lessonNodeArray[0].position.y;
        this.boundBottom = this.lessonNodeArray[0].position.y;
        for(var i = 1; i < this.lessonNodeArray.length; i++){
            if(this.boundLeft > this.lessonNodeArray[i].position.x){
                this.boundLeft = this.lessonNodeArray[i].position.x;
            }
            else if(this.boundRight < this.lessonNodeArray[i].position.x){
                this.boundRight > this.lessonNodeArray[i].position.x;
            }
            if(this.boundTop > this.lessonNodeArray[i].position.y){
                this.boundTop = this.lessonNodeArray[i].position.y;
            }
            else if(this.boundBottom < this.lessonNodeArray[i].position.y){
                this.boundBottom = this.lessonNodeArray[i].position.y;
            }
        }
    }
}


//prototype
var p = board.prototype;

p.move = function(pX, pY){
    this.position.x += pX;
    this.position.y += pY;
};

p.draw = function(ctx, center, activeHeight){
    ctx.save();
    //translate to the center of the screen
    ctx.translate(center.x - this.position.x, center.y - this.position.y);
    for(var i = 0; i < this.lessonNodeArray.length; i++){
        this.lessonNodeArray[i].draw(ctx);
    }
    ctx.restore();
};

module.exports = board;

//this is an object named Board and this is its javascript
//var Board = require('./objects/board.js');
//var b = new Board();
    
},{}],5:[function(require,module,exports){
"use strict";

//parameter is a point that denotes starting position
function button(startPosition, width, height){
    this.position = position;
    this.width = width;
    this.height = height;
    this.clicked = false;
    this.hovered = false;
}
button.drawLib = undefined;

var p = button.prototype;

p.draw = function(ctx){
    ctx.save();
    var col;
    if(this.hovered){
        col = "dodgerblue";
    }
    else{
        col = "lightblue";
    }
    //draw rounded container
    boardButton.drawLib.rect(ctx, this.position.x - this.width/2, this.position.y - this.height/2, this.width, this.height, col);

    ctx.restore();
};

module.exports = button;
},{}],6:[function(require,module,exports){
"use strict";
//the json is local, no need for xhr when using this module pattern
module.exports = require('../../data/lessons.json');
/*
var xhr = require('xhr');

var app = app || {};

var infoArray = undefined;

xhr({
    uri: "data/lessons.json",
    headers: {
        "Content-Type": "application/json",
        "If-Modified-Since": "Sat, 1 Jan 2010 00:00:00 GMT"
    }
}, function (err, resp, body) {
    var myJSON = JSON.parse(body);
    infoArray = myJSON.lessons;
});


module.exports = infoArray;
*/
},{"../../data/lessons.json":1}],7:[function(require,module,exports){
"use strict";
function drawLib(){
    
}

var p = drawLib.prototype;

p.clear = function(ctx, x, y, w, h) {
    ctx.clearRect(x, y, w, h);
}

p.rect = function(ctx, x, y, w, h, col) {
    ctx.save();
    ctx.fillStyle = col;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
}

p.line = function(ctx, x1, y1, x2, y2, thickness, color) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.restore();
}

p.circle = function(ctx, x, y, radius, color){
    ctx.save();
    ctx.beginPath();
    ctx.arc(x,y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
}

function boardButton(ctx, position, width, height, hovered){
    //ctx.save();
    if(hovered){
        ctx.fillStyle = "dodgerblue";
    }
    else{
        ctx.fillStyle = "lightblue";
    }
    //draw rounded container
    ctx.rect(position.x - width/2, position.y - height/2, width, height);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.fill();
    //ctx.restore();
}

module.exports = drawLib;
},{}],8:[function(require,module,exports){
arguments[4][7][0].apply(exports,arguments)
},{"dup":7}],9:[function(require,module,exports){
"use strict";
var Board = require('./board.js');
var Point = require('./point.js');
var DrawLib = require('./drawLib.js');
var LessonNode = require('./lessonNode.js');
var Utilities = require('./utilities.js');

var board;
var painter;

var mouseState;
var previousMouseState;
var draggingDisabled;
var mouseTarget;
var mouseSustainedDown;

function game(){
    painter = new DrawLib();
    
    draggingDisabled = false;
    mouseSustainedDown = false;
    
    var testLessonNodeArray = [];
    testLessonNodeArray.push(new LessonNode(new Point(0,0), "images/dog.png"));
    testLessonNodeArray.push(new LessonNode(new Point(100,100), "images/goldDog.png"));
    testLessonNodeArray.push(new LessonNode(new Point(100,-100), "images/smolDog.png"));
    
    board = new Board(new Point(0,0), testLessonNodeArray);
}

var p = game.prototype;

p.update = function(ctx, canvas, dt, center, activeHeight, pMouseState){
    //update stuff
    p.act(pMouseState);
    //draw stuff
    p.draw(ctx, canvas, center, activeHeight);
}

p.act = function(pMouseState){
    previousMouseState = mouseState;
    mouseState = pMouseState;
    mouseTarget = 0;
    if(typeof previousMouseState === 'undefined'){
        previousMouseState = mouseState;
    }
    
    
    //collision detection, iterate through each node in the active board
    for(var i = 0; i < board.lessonNodeArray.length; i++){
        var targetLessonNode = board.lessonNodeArray[i];
        mouseIntersect(targetLessonNode, board.position, targetLessonNode.scaleFactor);
        if(targetLessonNode.mouseOver == true){
            mouseTarget = targetLessonNode;
            break;
        }
    }
    
    //if the element that the mouse is hovering over is NOT the canvas
    if(mouseTarget != 0){
        //if mouseDown
        if(mouseState.mouseDown == true && previousMouseState.mouseDown == false){
            mouseSustainedDown = true;
            draggingDisabled = true;
        }
        //if mouseUp click event
        else if(mouseState.mouseDown == false && previousMouseState.mouseDown == true){
            console.log(mouseTarget.type);
            mouseTarget.click(mouseState);
        }
    }
    else{
        //if not a sustained down
        if(mouseSustainedDown == false){
            draggingDisabled = false;
        }
    }
    if(mouseState.mouseDown == false && previousMouseState.mouseDown == true){
        mouseSustainedDown = false;
    }
    
    //moving the board
    if(mouseState.mouseDown == true && draggingDisabled == false){
        board.move(previousMouseState.position.x - mouseState.position.x, previousMouseState.position.y - mouseState.position.y);
    }
    
    
    
    document.querySelector('#debugLine').innerHTML = "mousePosition: x = " + mouseState.relativePosition.x + ", y = " + mouseState.relativePosition.y + 
    "<br>Clicked = " + mouseState.mouseDown + 
    "<br>Over Canvas = " + mouseState.mouseIn + 
    "<br>Clicked = " + mouseState.mouseDown;
}

p.draw = function(ctx, canvas, center, activeHeight){
    //draw board
    ctx.save();
    painter.clear(ctx, 0, 0, canvas.offsetWidth, canvas.offsetHeight);
    painter.rect(ctx, 0, 0, canvas.offsetWidth, canvas.offsetHeight, "white");
    painter.line(ctx, canvas.offsetWidth/2, center.y - activeHeight/2, canvas.offsetWidth/2, canvas.offsetHeight, 2, "lightgray");
    painter.line(ctx, 0, center.y, canvas.offsetWidth, center.y, 2, "lightGray");
    
    //drawing lesson nodes
    board.draw(ctx, center, activeHeight);
    
    ctx.restore();
}

module.exports = game;

//pElement is the object on the canvas that is being checked against the mouse, pOffsetter will most likely be the board so we can subtract position or whatever it needs to remain aligned
function mouseIntersect(pElement, pOffsetter, pScale){
    if(mouseState.relativePosition.x + pOffsetter.x > (pElement.position.x - (pScale*pElement.width)/2) && mouseState.relativePosition.x + pOffsetter.x < (pElement.position.x + (pScale*pElement.width)/2)){
        if(mouseState.relativePosition.y + pOffsetter.y > (pElement.position.y - (pScale*pElement.height)/2) && mouseState.relativePosition.y + pOffsetter.y < (pElement.position.y + (pScale*pElement.height)/2)){
            pElement.mouseOver = true;
        }
        else{
            pElement.mouseOver = false;
        }
    }
    else{
        pElement.mouseOver = false;
    }
}
},{"./board.js":4,"./drawLib.js":7,"./lessonNode.js":10,"./point.js":12,"./utilities.js":13}],10:[function(require,module,exports){
"use strict";

//parameter is a point that denotes starting position
function lessonNode(startPosition, imagePath){
    this.position = startPosition;
    this.mouseOver = false;
    this.scaleFactor = 1;
    this.type = "lessonNode";
    
    
    //image loading and resizing
    var tempImage = new Image();
    try{
        tempImage.src = imagePath;
        this.image = tempImage;
    }
    catch (e) {
        tempImage.src = "images/dog.png";
        this.image = tempImage;
    }
    this.width = this.image.naturalWidth;
    this.height = this.image.naturalHeight;
    var maxDimension = 100;
    //too small?
    if(this.width < maxDimension && this.height < maxDimension){
        var x;
        if(this.width > this.height){
            x = maxDimension / this.width;
        }
        else{
            x = maxDimension / this.height;
        }
        this.width = this.width * x;
        this.height = this.height * x;
    }
    if(this.width > maxDimension || this.height > maxDimension){
        var x;
        if(this.width > this.height){
            x = this.width / maxDimension;
        }
        else{
            x = this.height / maxDimension;
        }
        this.width = this.width / x;
        this.height = this.height / x;
    }
}

lessonNode.drawLib = undefined;

var p = lessonNode.prototype;

p.draw = function(ctx){
    //lessonNode.drawLib.circle(ctx, this.position.x, this.position.y, 10, "red");
    //draw the image, shadow if hovered
    ctx.save();
    if(this.mouseOver){
        ctx.shadowColor = 'dodgerBlue';
        ctx.shadowBlur = 20;
    }
    ctx.drawImage(this.image, this.position.x - (this.width*this.scaleFactor)/2, this.position.y - (this.height*this.scaleFactor)/2, this.width * this.scaleFactor, this.height * this.scaleFactor)
    
    ctx.restore();
};

p.click = function(mouseState){
    console.log("whoopity doo");
}

module.exports = lessonNode;
},{}],11:[function(require,module,exports){
//keeps track of mouse related variables.
//calculated in main and passed to game
//contains up state
//position
//relative position
//on canvas
"use strict";
function mouseState(pPosition, pRelativePosition, pMousedown, pMouseIn){
    this.position = pPosition;
    this.relativePosition = pRelativePosition;
    this.mouseDown = pMousedown;
    this.mouseIn = pMouseIn;
}

var p = mouseState.prototype;

module.exports = mouseState;
},{}],12:[function(require,module,exports){
"use strict";
function point(pX, pY){
    this.x = pX;
    this.y = pY;
}

var p = point.prototype;

module.exports = point;
},{}],13:[function(require,module,exports){
"use strict";
var Point = require('./point.js');

function utilities(){
}

var p = utilities.prototype;
// returns mouse position in local coordinate system of element
p.getMouse = function(e){
    //return new app.Point((e.pageX - e.target.offsetLeft) * (app.main.renderWidth / actualCanvasWidth), (e.pageY - e.target.offsetTop) * (app.main.renderHeight / actualCanvasHeight));
    return new Point((e.pageX - e.target.offsetLeft), (e.pageY - e.target.offsetTop));
}

p.map = function(value, min1, max1, min2, max2){
    //return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
}

p.clamp = function(value, min, max){
    //return Math.max(min, Math.min(max, value));
}

module.exports = utilities;
},{"./point.js":12}]},{},[2,3,4,5,6,8,9,10,11,12,13])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkYXRhL2xlc3NvbnMuanNvbiIsImpzL21haW4uanMiLCJqcy9tYWluT0xELmpzIiwianMvbW9kdWxlcy9ib2FyZC5qcyIsImpzL21vZHVsZXMvYnV0dG9uLmpzIiwianMvbW9kdWxlcy9kYXRhT2JqZWN0LmpzIiwianMvbW9kdWxlcy9kcmF3TGliLmpzIiwianMvbW9kdWxlcy9nYW1lLmpzIiwianMvbW9kdWxlcy9sZXNzb25Ob2RlLmpzIiwianMvbW9kdWxlcy9tb3VzZVN0YXRlLmpzIiwianMvbW9kdWxlcy9wb2ludC5qcyIsImpzL21vZHVsZXMvdXRpbGl0aWVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cz17XHJcbiAgICBcImxlc3NvbnNcIjpbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBcInhcIjogXCIwXCIsXHJcbiAgICAgICAgICAgIFwieVwiOiBcIjBcIixcclxuICAgICAgICAgICAgXCJpbWFnZVwiOiBcImRvZy5qcGVnXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgXCJ4XCI6IFwiMTAwXCIsXHJcbiAgICAgICAgICAgIFwieVwiOiBcIjEwMFwiLFxyXG4gICAgICAgICAgICBcImltYWdlXCI6IFwiZG9nLmpwZWdcIlxyXG4gICAgICAgIH1cclxuICAgIF1cclxufSIsIlwidXNlIHN0cmljdFwiO1xyXG4vL2ltcG9ydHNcclxudmFyIEdhbWUgPSByZXF1aXJlKCcuL21vZHVsZXMvZ2FtZS5qcycpO1xyXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuL21vZHVsZXMvcG9pbnQuanMnKTtcclxudmFyIE1vdXNlU3RhdGUgPSByZXF1aXJlKCcuL21vZHVsZXMvbW91c2VTdGF0ZS5qcycpO1xyXG5cclxuLy92YXJpYWJsZXNcclxudmFyIGdhbWU7XHJcbnZhciBjYW52YXM7XHJcbnZhciBjdHg7XHJcblxyXG52YXIgaGVhZGVyO1xyXG52YXIgYWN0aXZlSGVpZ2h0O1xyXG52YXIgY2VudGVyO1xyXG5cclxudmFyIG1vdXNlUG9zaXRpb247XHJcbnZhciByZWxhdGl2ZU1vdXNlUG9zaXRpb247XHJcbnZhciBtb3VzZURvd247XHJcbnZhciBtb3VzZUluO1xyXG4vKmFwcC5JTUFHRVMgPSB7XHJcbiAgICB0ZXN0SW1hZ2U6IFwiaW1hZ2VzL2RvZy5wbmdcIlxyXG4gfTsqL1xyXG5cclxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKGUpe1xyXG4gICAgaW5pdGlhbGl6ZVZhcmlhYmxlcygpO1xyXG4gICAgbG9vcCgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0aWFsaXplVmFyaWFibGVzKCl7XHJcbiAgICBjYW52YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdjYW52YXMnKTtcclxuICAgIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgY2FudmFzLndpZHRoID0gY2FudmFzLm9mZnNldFdpZHRoO1xyXG4gICAgY2FudmFzLmhlaWdodCA9IGNhbnZhcy5vZmZzZXRIZWlnaHQ7XHJcbiAgICBjb25zb2xlLmxvZyhcIkNhbnZhcyBEaW1lbnNpb25zOiBcIiArIGNhbnZhcy53aWR0aCArIFwiLCBcIiArIGNhbnZhcy5oZWlnaHQpO1xyXG4gICAgXHJcbiAgICBoZWFkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdoZWFkZXInKTtcclxuICAgIGFjdGl2ZUhlaWdodCA9IGNhbnZhcy5vZmZzZXRIZWlnaHQgLSBoZWFkZXIub2Zmc2V0SGVpZ2h0O1xyXG4gICAgY2VudGVyID0gbmV3IFBvaW50KGNhbnZhcy53aWR0aC8yLCBhY3RpdmVIZWlnaHQvMiArIGhlYWRlci5vZmZzZXRIZWlnaHQpO1xyXG4gICAgXHJcbiAgICBtb3VzZVBvc2l0aW9uID0gbmV3IFBvaW50KDAsMCk7XHJcbiAgICByZWxhdGl2ZU1vdXNlUG9zaXRpb24gPSBuZXcgUG9pbnQoMCwwKTtcclxuICAgIFxyXG4gICAgLy9ldmVudCBsaXN0ZW5lciBmb3Igd2hlbiB0aGUgbW91c2UgbW92ZXMgb3ZlciB0aGUgY2FudmFzXHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBmdW5jdGlvbihlKXtcclxuICAgICAgICB2YXIgYm91bmRSZWN0ID0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIG1vdXNlUG9zaXRpb24gPSBuZXcgUG9pbnQoZS5jbGllbnRYIC0gYm91bmRSZWN0LmxlZnQsIGUuY2xpZW50WSAtIGJvdW5kUmVjdC50b3ApO1xyXG4gICAgICAgIHJlbGF0aXZlTW91c2VQb3NpdGlvbiA9IG5ldyBQb2ludChtb3VzZVBvc2l0aW9uLnggLSAoY2FudmFzLm9mZnNldFdpZHRoLzIuMCksIG1vdXNlUG9zaXRpb24ueSAtIChoZWFkZXIub2Zmc2V0SGVpZ2h0ICsgYWN0aXZlSGVpZ2h0LzIuMCkpOyAgICAgICAgXHJcbiAgICB9KTtcclxuICAgIG1vdXNlRG93biA9IGZhbHNlO1xyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgbW91c2VEb3duID0gdHJ1ZTtcclxuICAgIH0pO1xyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIG1vdXNlRG93biA9IGZhbHNlO1xyXG4gICAgfSk7XHJcbiAgICBtb3VzZUluID0gZmFsc2U7XHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3ZlclwiLCBmdW5jdGlvbihlKXtcclxuICAgICAgICBtb3VzZUluID0gdHJ1ZTtcclxuICAgIH0pO1xyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW91dFwiLCBmdW5jdGlvbihlKXtcclxuICAgICAgICBtb3VzZUluID0gZmFsc2U7XHJcbiAgICAgICAgbW91c2VEb3duID0gZmFsc2U7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgZ2FtZSA9IG5ldyBHYW1lKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxvb3AoKXtcclxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobG9vcC5iaW5kKHRoaXMpKTtcclxuICAgIGdhbWUudXBkYXRlKGN0eCwgY2FudmFzLCAwLCBjZW50ZXIsIGFjdGl2ZUhlaWdodCwgbmV3IE1vdXNlU3RhdGUobW91c2VQb3NpdGlvbiwgcmVsYXRpdmVNb3VzZVBvc2l0aW9uLCBtb3VzZURvd24sIG1vdXNlSW4pKTtcclxufVxyXG5cclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgZnVuY3Rpb24oZSl7XHJcbiAgICBjYW52YXMud2lkdGggPSBjYW52YXMub2Zmc2V0V2lkdGg7XHJcbiAgICBjYW52YXMuaGVpZ2h0ID0gY2FudmFzLm9mZnNldEhlaWdodDtcclxuICAgIGFjdGl2ZUhlaWdodCA9IGNhbnZhcy5oZWlnaHQgLSBoZWFkZXIub2Zmc2V0SGVpZ2h0O1xyXG4gICAgY2VudGVyID0gbmV3IFBvaW50KGNhbnZhcy53aWR0aCAvIDIsIGFjdGl2ZUhlaWdodCAvIDIgKyBoZWFkZXIub2Zmc2V0SGVpZ2h0KVxyXG4gICAgXHJcbiAgICBjb25zb2xlLmxvZyhcIkNhbnZhcyBEaW1lbnNpb25zOiBcIiArIGNhbnZhcy53aWR0aCArIFwiLCBcIiArIGNhbnZhcy5oZWlnaHQpO1xyXG59KTtcclxuXHJcblxyXG5cclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG4vL3ZhciB1dGlsaXRpZXMgPSByZXF1aXJlKCcuL3V0aWxpdGllcy5qcycpO1xyXG52YXIgYXBwID0gYXBwIHx8IHt9O1xyXG5cclxuYXBwLm1haW4gPSB7ICAgIFxyXG4gICAgLy92YXJpYWJsZXNcclxuICAgIGNhbnZhczogdW5kZWZpbmVkLFxyXG4gICAgY3R4OiB1bmRlZmluZWQsXHJcbiAgICBhcHA6IHVuZGVmaW5lZCxcclxuICAgIHV0aWxpdGllczogdW5kZWZpbmVkLFxyXG4gICAgZHJhd0xpYjogdW5kZWZpbmVkLFxyXG4gICAgXHJcbiAgICBtb3VzZVBvc2l0aW9uOiB1bmRlZmluZWQsXHJcbiAgICBsYXN0TW91c2VQb3NpdGlvbjogdW5kZWZpbmVkLFxyXG4gICAgcmVsYXRpdmVNb3VzZVBvc2l0aW9uOiB1bmRlZmluZWQsXHJcbiAgICBhbmltYXRpb25JRDogMCxcclxuXHRsYXN0VGltZTogMCxcclxuICAgIFxyXG4gICAgaGVhZGVyOiB1bmRlZmluZWQsXHJcbiAgICBhY3RpdmVIZWlnaHQ6IHVuZGVmaW5lZCxcclxuICAgIGNlbnRlcjogdW5kZWZpbmVkLFxyXG4gICAgYm9hcmQ6IHVuZGVmaW5lZCxcclxuICAgIFxyXG4gICAgZHJhZ2dpbmc6IHVuZGVmaW5lZCxcclxuICAgIGN1cnNvcjogdW5kZWZpbmVkLFxyXG4gICAgXHJcbiAgICAvL2RhdGFPYmplY3Q6IHJlcXVpcmUoJy4vb2JqZWN0cy9kYXRhT2JqZWN0LmpzJyksXHJcbiAgICBcclxuICAgIC8vZW51bWVyYXRpb25cclxuICAgIEdBTUVfU1RBVEU6IE9iamVjdC5mcmVlemUoe1x0XHJcblx0XHRCT0FSRF9WSUVXOiAwLFxyXG5cdFx0Rk9DVVNfVklFVzogMVxyXG5cdH0pLFxyXG4gICAgXHJcbiAgICBpbml0IDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy90aGlzLmRlYnVnTGluZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNkZWJ1Z0xpbmUnKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2NhbnZhcycpO1xyXG4gICAgICAgIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgICAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMuY2FudmFzLm9mZnNldFdpZHRoO1xyXG4gICAgICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuY2FudmFzLm9mZnNldEhlaWdodDtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm1vdXNlUG9zaXRpb24gPSBuZXcgYXBwLnBvaW50KHRoaXMuY2FudmFzLndpZHRoLzIsIHRoaXMuY2FudmFzLmhlaWdodC8yKTtcclxuICAgICAgICB0aGlzLmxhc3RNb3VzZVBvc2l0aW9uID0gdGhpcy5tb3VzZVBvc2l0aW9uO1xyXG4gICAgICAgIHRoaXMucmVsYXRpdmVNb3VzZVBvc2l0aW9uID0gdGhpcy5tb3VzZVBvc2l0aW9uO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuaGVhZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaGVhZGVyJyk7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVIZWlnaHQgPSB0aGlzLmNhbnZhcy5oZWlnaHQgLSB0aGlzLmhlYWRlci5vZmZzZXRIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5jZW50ZXIgPSBuZXcgYXBwLnBvaW50KHRoaXMuY2FudmFzLndpZHRoLzIsIHRoaXMuYWN0aXZlSGVpZ2h0IC8gMiArIHRoaXMuaGVhZGVyLm9mZnNldEhlaWdodCk7XHJcbiAgICAgICAgLy9nZXQgbGlzdHYgb2Ygbm9kZXMgZnJvbSBkYXRhXHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIHRlbXBMZXNzb25Ob2RlQXJyYXkgPSBbXTtcclxuICAgICAgICB0ZW1wTGVzc29uTm9kZUFycmF5LnB1c2gobmV3IGFwcC5sZXNzb25Ob2RlKG5ldyBhcHAucG9pbnQoMCwwKSkpO1xyXG4gICAgICAgIHRlbXBMZXNzb25Ob2RlQXJyYXkucHVzaChuZXcgYXBwLmxlc3Nvbk5vZGUobmV3IGFwcC5wb2ludCgzMDAsMzAwKSkpO1xyXG4gICAgICAgIHRlbXBMZXNzb25Ob2RlQXJyYXkucHVzaChuZXcgYXBwLmxlc3Nvbk5vZGUobmV3IGFwcC5wb2ludCgzMDAsLTMwMCkpKTtcclxuICAgICAgICB0aGlzLmJvYXJkID0gbmV3IGFwcC5ib2FyZChuZXcgYXBwLnBvaW50KDAsMCksIHRlbXBMZXNzb25Ob2RlQXJyYXkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmN1cnNvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibXlQXCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciB0ZXN0ZXRlc3QgPSB0aGlzLmRhdGFPYmplY3QuaW5mb0FycmF5O1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vZGVub3RlcyBnYW1lcGxheSBzdGF0ZVxyXG4gICAgICAgIHRoaXMuZ2FtZV9zdGF0ZSA9IHRoaXMuR0FNRV9TVEFURS5CT0FSRF9WSUVXO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vY29ubmVjdGluZyBldmVudHNcclxuICAgICAgICB0aGlzLmNhbnZhcy5vbm1vdXNlbW92ZSA9IHRoaXMuZ2V0TW91c2VQb3NpdGlvbi5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuY2FudmFzLm9ubW91c2Vkb3duID0gdGhpcy5kb01vdXNlRG93bi5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuY2FudmFzLm9ubW91c2V1cCA9IHRoaXMuZG9Nb3VzZVVwLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNld2hlZWxcIiwgdGhpcy5kb1doZWVsLmJpbmQodGhpcykpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vc3RhcnQgdGhlIGxvb3BcclxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgfSxcclxuICAgIFxyXG4gICAgLy9sb29wIGZ1bmN0aW9uc1xyXG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvL2NhbGwgdGhlIGxvb3BcclxuICAgICAgICB0aGlzLmFuaW1hdGlvbklEID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMudXBkYXRlLmJpbmQodGhpcykpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vY2FsY3VsYXRlIGRlbHRhIHRpbWVcclxuICAgICAgICB2YXIgZHQgPSB0aGlzLmNhbGN1bGF0ZURlbHRhVGltZSgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vY2xlYXIgdGhlIGNhbnZhc1xyXG4gICAgICAgIHRoaXMuZHJhd0xpYi5jbGVhcih0aGlzLmN0eCwwLDAsdGhpcy5jYW52YXMub2Zmc2V0V2lkdGgsdGhpcy5jYW52YXMub2Zmc2V0SGVpZ2h0KTtcclxuICAgICAgICB0aGlzLmRyYXdMaWIucmVjdCh0aGlzLmN0eCwgMCwgMCwgdGhpcy5jYW52YXMub2Zmc2V0V2lkdGgsIHRoaXMuY2FudmFzLm9mZnNldEhlaWdodCwgXCJXaGl0ZVwiKTtcclxuICAgICAgICBcclxuICAgICAgICAvL3VwZGF0ZVxyXG4gICAgICAgIGlmKHRoaXMuZ2FtZV9zdGF0ZSA9PSB0aGlzLkdBTUVfU1RBVEUuQk9BUkRfVklFVyl7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvL2RyYXcgZ2FtZSBzY3JlZW5cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmRDb2xsaXNpb25IYW5kbGluZygpO1xyXG4gICAgICAgICAgICB0aGlzLmJvYXJkLmRyYXcodGhpcy5jdHgsIHRoaXMuY2VudGVyLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5hY3RpdmVIZWlnaHQpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5kcmF3TGliLmNpcmNsZSh0aGlzLmN0eCwgdGhpcy5tb3VzZVBvc2l0aW9uLngsIHRoaXMubW91c2VQb3NpdGlvbi55LCAxMCwgXCJSb3lhbEJsdWVcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYodGhpcy5nYW1lX3N0YXRlID09IHRoaXMuR0FNRV9TVEFURS5USVRMRSl7XHJcbiAgICAgICAgICAgIC8vZHJhdyB0aXRsZSBzY3JlZW5cclxuICAgICAgICB9XHJcbiAgICAgICAgLy9jdXJzb3IgaGFuZGxpbmdcclxuICAgICAgICB0aGlzLmN1cnNvckhhbmRsZXIoKTtcclxuICAgICAgICB0aGlzLmRlYnVnSHVkKHRoaXMuY3R4LCBkdCk7XHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICBjYWxjdWxhdGVEZWx0YVRpbWU6IGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgbm93O1xyXG4gICAgICAgIHZhciBmcHM7XHJcblx0XHRub3cgPSAoKyBuZXcgRGF0ZSk7IFxyXG5cdFx0ZnBzID0gMTAwMCAvIChub3cgLSB0aGlzLmxhc3RUaW1lKTtcclxuXHRcdGZwcyA9IGFwcC51dGlsaXRpZXMuY2xhbXAoZnBzLCAxMiwgNjApO1xyXG5cdFx0dGhpcy5sYXN0VGltZSA9IG5vdzsgXHJcblx0XHRyZXR1cm4gMS9mcHM7XHJcblx0fSxcclxuICAgIFxyXG4gICAgLy9oZWxwZXIgZXZlbnQgZnVuY3Rpb25zXHJcbiAgICBnZXRNb3VzZVBvc2l0aW9uOiBmdW5jdGlvbihlKXtcclxuXHRcdHRoaXMubGFzdE1vdXNlUG9zaXRpb24gPSB0aGlzLm1vdXNlUG9zaXRpb247XHJcbiAgICAgICAgdGhpcy5tb3VzZVBvc2l0aW9uID0gYXBwLnV0aWxpdGllcy5nZXRNb3VzZShlLCB0aGlzLmNhbnZhcy5vZmZzZXRXaWR0aCwgdGhpcy5jYW52YXMub2Zmc2V0SGVpZ2h0KTtcclxuICAgICAgICB0aGlzLnJlbGF0aXZlTW91c2VQb3NpdGlvbiA9IG5ldyBhcHAucG9pbnQodGhpcy5tb3VzZVBvc2l0aW9uLnggLSB0aGlzLmNhbnZhcy53aWR0aC8yICsgdGhpcy5ib2FyZC5wb3NpdGlvbi54LCB0aGlzLm1vdXNlUG9zaXRpb24ueSAtIHRoaXMuYWN0aXZlSGVpZ2h0LzIgKyB0aGlzLmJvYXJkLnBvc2l0aW9uLnkgLSB0aGlzLmhlYWRlci5vZmZzZXRIZWlnaHQpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKHRoaXMuZHJhZ2dpbmcpe1xyXG4gICAgICAgICAgICAvL3RoZSBwb3NpdGlvbmFsIGRpZmZlcmVuY2UgYmV0d2VlbiBsYXN0IGxvb3AgYW5kIHRoaXNcclxuICAgICAgICAgICAgdGhpcy5ib2FyZC5tb3ZlKHRoaXMubGFzdE1vdXNlUG9zaXRpb24ueCAtIHRoaXMubW91c2VQb3NpdGlvbi54LCB0aGlzLmxhc3RNb3VzZVBvc2l0aW9uLnkgLSB0aGlzLm1vdXNlUG9zaXRpb24ueSk7XHJcbiAgICAgICAgfVxyXG5cdH0sXHJcbiAgICBkb01vdXNlRG93biA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICB0aGlzLmRyYWdnaW5nID0gdHJ1ZTtcclxuICAgIH0sXHJcbiAgICBkb01vdXNlVXAgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZyA9IGZhbHNlO1xyXG4gICAgfSxcclxuICAgIGRvV2hlZWwgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgdGhpcy5ib2FyZC56b29tKHRoaXMuY3R4LCB0aGlzLmNlbnRlciwgZS5kZWx0YVkpO1xyXG4gICAgfSxcclxuICAgIFxyXG4gICAgY3Vyc29ySGFuZGxlciA6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgLy9pcyBpdCBob3ZlcmluZyBvdmVyIHRoZSBjYW52YXM/XHJcbiAgICAgICAgLy9pcyBpdCBkcmFnZ2luZz9cclxuICAgICAgICBpZih0aGlzLmRyYWdnaW5nKXtcclxuICAgICAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUuY3Vyc29yID0gXCItd2Via2l0LWdyYWJiaW5nXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLmN1cnNvciA9IFwiZGVmYXVsdFwiO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcclxuICAgIGJvYXJkQ29sbGlzaW9uSGFuZGxpbmcgOiBmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciBhY3RpdmVOb2RlO1xyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmJvYXJkLmxlc3Nvbk5vZGVBcnJheS5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgIGFjdGl2ZU5vZGUgPSB0aGlzLmJvYXJkLmxlc3Nvbk5vZGVBcnJheVtpXTtcclxuICAgICAgICAgICAgaWYodGhpcy5yZWxhdGl2ZU1vdXNlUG9zaXRpb24ueCA+IGFjdGl2ZU5vZGUucG9zaXRpb24ueCAtIGFjdGl2ZU5vZGUud2lkdGgvMiAmJiB0aGlzLnJlbGF0aXZlTW91c2VQb3NpdGlvbi54IDwgYWN0aXZlTm9kZS5wb3NpdGlvbi54ICsgYWN0aXZlTm9kZS53aWR0aC8yKXtcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMucmVsYXRpdmVNb3VzZVBvc2l0aW9uLnkgPiBhY3RpdmVOb2RlLnBvc2l0aW9uLnkgLSBhY3RpdmVOb2RlLmhlaWdodC8yICYmIHRoaXMucmVsYXRpdmVNb3VzZVBvc2l0aW9uLnkgPCBhY3RpdmVOb2RlLnBvc2l0aW9uLnkgKyBhY3RpdmVOb2RlLmhlaWdodC8yKXtcclxuICAgICAgICAgICAgICAgICAgICBhY3RpdmVOb2RlLmJvYXJkQnV0dG9uLmhvdmVyZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICBhY3RpdmVOb2RlLmJvYXJkQnV0dG9uLmhvdmVyZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgYWN0aXZlTm9kZS5ib2FyZEJ1dHRvbi5ob3ZlcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICAvL2RlYnVnXHJcbiAgICBkZWJ1Z0h1ZDogZnVuY3Rpb24oY3R4LCBkdCkge1xyXG4gICAgICAgIGN0eC5zYXZlKCk7XHJcbiAgICAgICAgdGhpcy5maWxsVGV4dChjdHgsIFwibW91c2VQb3NpdGlvbjogXCIgKyB0aGlzLm1vdXNlUG9zaXRpb24ueCArIFwiLCBcIiArIHRoaXMubW91c2VQb3NpdGlvbi55LCA1MCwgdGhpcy5jYW52YXMuaGVpZ2h0IC0gMTAsIFwiMTJwdCBvc3dhbGRcIiwgXCJCbGFja1wiKTtcclxuICAgICAgICB0aGlzLmZpbGxUZXh0KGN0eCxcIlJlbE1vdXNlUG9zaXRpb246IFwiK3RoaXMucmVsYXRpdmVNb3VzZVBvc2l0aW9uLnggKyBcIiwgXCIgKyB0aGlzLnJlbGF0aXZlTW91c2VQb3NpdGlvbi55LCB0aGlzLmNhbnZhcy53aWR0aC8yLCB0aGlzLmNhbnZhcy5oZWlnaHQgLSAxMCxcIjEycHQgb3N3YWxkXCIsXCJCbGFja1wiKTtcclxuICAgICAgICB0aGlzLmZpbGxUZXh0KGN0eCwgXCJkdDogXCIgKyBkdC50b0ZpeGVkKDMpLCB0aGlzLmNhbnZhcy53aWR0aCAtIDE1MCwgdGhpcy5jYW52YXMuaGVpZ2h0IC0gMTAsIFwiMTJwdCBvc3dhbGRcIiwgXCJibGFja1wiKTtcclxuICAgICAgICB0aGlzLmRyYXdMaWIubGluZShjdHgsIHRoaXMuY2VudGVyLngsIHRoaXMuY2VudGVyLnkgLSB0aGlzLmFjdGl2ZUhlaWdodC8yLCB0aGlzLmNlbnRlci54LCB0aGlzLmNlbnRlci55ICsgdGhpcy5hY3RpdmVIZWlnaHQvMiwgMiwgXCJMaWdodGdyYXlcIik7XHJcbiAgICAgICAgdGhpcy5kcmF3TGliLmxpbmUoY3R4LCAwLCB0aGlzLmNlbnRlci55LCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jZW50ZXIueSwgMiwgXCJMaWdodGdyYXlcIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5maWxsVGV4dChjdHgsIHRoaXMuYm9hcmQubGVzc29uTm9kZUFycmF5WzBdLmJvYXJkQnV0dG9uLmhvdmVyZWQsIHRoaXMuY2FudmFzLndpZHRoLzIsIHRoaXMuY2FudmFzLmhlaWdodCAtIDMwLCBcIjEycHQgb3N3YWxkXCIsIFwiYmxhY2tcIik7XHJcbiAgICAgICAgdGhpcy5maWxsVGV4dChjdHgsIHRoaXMuYm9hcmQubGVzc29uTm9kZUFycmF5WzFdLmJvYXJkQnV0dG9uLmhvdmVyZWQsIHRoaXMuY2FudmFzLndpZHRoLzIsIHRoaXMuY2FudmFzLmhlaWdodCAtIDUwLCBcIjEycHQgb3N3YWxkXCIsIFwiYmxhY2tcIik7XHJcbiAgICAgICAgdGhpcy5maWxsVGV4dChjdHgsIHRoaXMuYm9hcmQubGVzc29uTm9kZUFycmF5WzJdLmJvYXJkQnV0dG9uLmhvdmVyZWQsIHRoaXMuY2FudmFzLndpZHRoLzIsIHRoaXMuY2FudmFzLmhlaWdodCAtIDcwLCBcIjEycHQgb3N3YWxkXCIsIFwiYmxhY2tcIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuICAgIH0sXHJcbiAgICBmaWxsVGV4dDogZnVuY3Rpb24oY3R4LCBzdHJpbmcsIHgsIHksIGNzcywgY29sb3IpIHtcclxuXHRcdGN0eC5zYXZlKCk7XHJcblx0XHQvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9DU1MvZm9udFxyXG5cdFx0dGhpcy5jdHguZm9udCA9IGNzcztcclxuXHRcdHRoaXMuY3R4LmZpbGxTdHlsZSA9IGNvbG9yO1xyXG5cdFx0dGhpcy5jdHguZmlsbFRleHQoc3RyaW5nLCB4LCB5KTtcclxuXHRcdGN0eC5yZXN0b3JlKCk7XHJcblx0fSxcclxufTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbi8vcGFyYW1ldGVyIGlzIGEgcG9pbnQgdGhhdCBkZW5vdGVzIHN0YXJ0aW5nIHBvc2l0aW9uXHJcbmZ1bmN0aW9uIGJvYXJkKHN0YXJ0UG9zaXRpb24sIGxlc3Nvbk5vZGVzKXtcclxuICAgIHRoaXMucG9zaXRpb24gPSBzdGFydFBvc2l0aW9uO1xyXG4gICAgdGhpcy5sZXNzb25Ob2RlQXJyYXkgPSBsZXNzb25Ob2RlcztcclxufVxyXG5cclxuYm9hcmQuZHJhd0xpYiA9IHVuZGVmaW5lZDtcclxuXHJcbi8vaGVscGVyXHJcbmZ1bmN0aW9uIGNhbGN1bGF0ZUJvdW5kcygpe1xyXG4gICAgaWYodGhpcy5sZXNzb25Ob2RlQXJyYXkubGVuZ3RoID4gMCl7XHJcbiAgICAgICAgdGhpcy5ib3VuZExlZnQgPSB0aGlzLmxlc3Nvbk5vZGVBcnJheVswXS5wb3NpdGlvbi54O1xyXG4gICAgICAgIHRoaXMuYm91bmRSaWdodCA9IHRoaXMubGVzc29uTm9kZUFycmF5WzBdLnBvc2l0aW9uLng7XHJcbiAgICAgICAgdGhpcy5ib3VuZFRvcCA9IHRoaXMubGVzc29uTm9kZUFycmF5WzBdLnBvc2l0aW9uLnk7XHJcbiAgICAgICAgdGhpcy5ib3VuZEJvdHRvbSA9IHRoaXMubGVzc29uTm9kZUFycmF5WzBdLnBvc2l0aW9uLnk7XHJcbiAgICAgICAgZm9yKHZhciBpID0gMTsgaSA8IHRoaXMubGVzc29uTm9kZUFycmF5Lmxlbmd0aDsgaSsrKXtcclxuICAgICAgICAgICAgaWYodGhpcy5ib3VuZExlZnQgPiB0aGlzLmxlc3Nvbk5vZGVBcnJheVtpXS5wb3NpdGlvbi54KXtcclxuICAgICAgICAgICAgICAgIHRoaXMuYm91bmRMZWZ0ID0gdGhpcy5sZXNzb25Ob2RlQXJyYXlbaV0ucG9zaXRpb24ueDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmKHRoaXMuYm91bmRSaWdodCA8IHRoaXMubGVzc29uTm9kZUFycmF5W2ldLnBvc2l0aW9uLngpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib3VuZFJpZ2h0ID4gdGhpcy5sZXNzb25Ob2RlQXJyYXlbaV0ucG9zaXRpb24ueDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZih0aGlzLmJvdW5kVG9wID4gdGhpcy5sZXNzb25Ob2RlQXJyYXlbaV0ucG9zaXRpb24ueSl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvdW5kVG9wID0gdGhpcy5sZXNzb25Ob2RlQXJyYXlbaV0ucG9zaXRpb24ueTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmKHRoaXMuYm91bmRCb3R0b20gPCB0aGlzLmxlc3Nvbk5vZGVBcnJheVtpXS5wb3NpdGlvbi55KXtcclxuICAgICAgICAgICAgICAgIHRoaXMuYm91bmRCb3R0b20gPSB0aGlzLmxlc3Nvbk5vZGVBcnJheVtpXS5wb3NpdGlvbi55O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5cclxuLy9wcm90b3R5cGVcclxudmFyIHAgPSBib2FyZC5wcm90b3R5cGU7XHJcblxyXG5wLm1vdmUgPSBmdW5jdGlvbihwWCwgcFkpe1xyXG4gICAgdGhpcy5wb3NpdGlvbi54ICs9IHBYO1xyXG4gICAgdGhpcy5wb3NpdGlvbi55ICs9IHBZO1xyXG59O1xyXG5cclxucC5kcmF3ID0gZnVuY3Rpb24oY3R4LCBjZW50ZXIsIGFjdGl2ZUhlaWdodCl7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgLy90cmFuc2xhdGUgdG8gdGhlIGNlbnRlciBvZiB0aGUgc2NyZWVuXHJcbiAgICBjdHgudHJhbnNsYXRlKGNlbnRlci54IC0gdGhpcy5wb3NpdGlvbi54LCBjZW50ZXIueSAtIHRoaXMucG9zaXRpb24ueSk7XHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5sZXNzb25Ob2RlQXJyYXkubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgIHRoaXMubGVzc29uTm9kZUFycmF5W2ldLmRyYXcoY3R4KTtcclxuICAgIH1cclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGJvYXJkO1xyXG5cclxuLy90aGlzIGlzIGFuIG9iamVjdCBuYW1lZCBCb2FyZCBhbmQgdGhpcyBpcyBpdHMgamF2YXNjcmlwdFxyXG4vL3ZhciBCb2FyZCA9IHJlcXVpcmUoJy4vb2JqZWN0cy9ib2FyZC5qcycpO1xyXG4vL3ZhciBiID0gbmV3IEJvYXJkKCk7XHJcbiAgICAiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbi8vcGFyYW1ldGVyIGlzIGEgcG9pbnQgdGhhdCBkZW5vdGVzIHN0YXJ0aW5nIHBvc2l0aW9uXHJcbmZ1bmN0aW9uIGJ1dHRvbihzdGFydFBvc2l0aW9uLCB3aWR0aCwgaGVpZ2h0KXtcclxuICAgIHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcclxuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgdGhpcy5jbGlja2VkID0gZmFsc2U7XHJcbiAgICB0aGlzLmhvdmVyZWQgPSBmYWxzZTtcclxufVxyXG5idXR0b24uZHJhd0xpYiA9IHVuZGVmaW5lZDtcclxuXHJcbnZhciBwID0gYnV0dG9uLnByb3RvdHlwZTtcclxuXHJcbnAuZHJhdyA9IGZ1bmN0aW9uKGN0eCl7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgdmFyIGNvbDtcclxuICAgIGlmKHRoaXMuaG92ZXJlZCl7XHJcbiAgICAgICAgY29sID0gXCJkb2RnZXJibHVlXCI7XHJcbiAgICB9XHJcbiAgICBlbHNle1xyXG4gICAgICAgIGNvbCA9IFwibGlnaHRibHVlXCI7XHJcbiAgICB9XHJcbiAgICAvL2RyYXcgcm91bmRlZCBjb250YWluZXJcclxuICAgIGJvYXJkQnV0dG9uLmRyYXdMaWIucmVjdChjdHgsIHRoaXMucG9zaXRpb24ueCAtIHRoaXMud2lkdGgvMiwgdGhpcy5wb3NpdGlvbi55IC0gdGhpcy5oZWlnaHQvMiwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIGNvbCk7XHJcblxyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gYnV0dG9uOyIsIlwidXNlIHN0cmljdFwiO1xyXG4vL3RoZSBqc29uIGlzIGxvY2FsLCBubyBuZWVkIGZvciB4aHIgd2hlbiB1c2luZyB0aGlzIG1vZHVsZSBwYXR0ZXJuXHJcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vLi4vZGF0YS9sZXNzb25zLmpzb24nKTtcclxuLypcclxudmFyIHhociA9IHJlcXVpcmUoJ3hocicpO1xyXG5cclxudmFyIGFwcCA9IGFwcCB8fCB7fTtcclxuXHJcbnZhciBpbmZvQXJyYXkgPSB1bmRlZmluZWQ7XHJcblxyXG54aHIoe1xyXG4gICAgdXJpOiBcImRhdGEvbGVzc29ucy5qc29uXCIsXHJcbiAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICAgICAgXCJJZi1Nb2RpZmllZC1TaW5jZVwiOiBcIlNhdCwgMSBKYW4gMjAxMCAwMDowMDowMCBHTVRcIlxyXG4gICAgfVxyXG59LCBmdW5jdGlvbiAoZXJyLCByZXNwLCBib2R5KSB7XHJcbiAgICB2YXIgbXlKU09OID0gSlNPTi5wYXJzZShib2R5KTtcclxuICAgIGluZm9BcnJheSA9IG15SlNPTi5sZXNzb25zO1xyXG59KTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGluZm9BcnJheTtcclxuKi8iLCJcInVzZSBzdHJpY3RcIjtcclxuZnVuY3Rpb24gZHJhd0xpYigpe1xyXG4gICAgXHJcbn1cclxuXHJcbnZhciBwID0gZHJhd0xpYi5wcm90b3R5cGU7XHJcblxyXG5wLmNsZWFyID0gZnVuY3Rpb24oY3R4LCB4LCB5LCB3LCBoKSB7XHJcbiAgICBjdHguY2xlYXJSZWN0KHgsIHksIHcsIGgpO1xyXG59XHJcblxyXG5wLnJlY3QgPSBmdW5jdGlvbihjdHgsIHgsIHksIHcsIGgsIGNvbCkge1xyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIGN0eC5maWxsU3R5bGUgPSBjb2w7XHJcbiAgICBjdHguZmlsbFJlY3QoeCwgeSwgdywgaCk7XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG59XHJcblxyXG5wLmxpbmUgPSBmdW5jdGlvbihjdHgsIHgxLCB5MSwgeDIsIHkyLCB0aGlja25lc3MsIGNvbG9yKSB7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgY3R4Lm1vdmVUbyh4MSwgeTEpO1xyXG4gICAgY3R4LmxpbmVUbyh4MiwgeTIpO1xyXG4gICAgY3R4LmxpbmVXaWR0aCA9IHRoaWNrbmVzcztcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9IGNvbG9yO1xyXG4gICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxufVxyXG5cclxucC5jaXJjbGUgPSBmdW5jdGlvbihjdHgsIHgsIHksIHJhZGl1cywgY29sb3Ipe1xyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIGN0eC5hcmMoeCx5LCByYWRpdXMsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSk7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gY29sb3I7XHJcbiAgICBjdHguZmlsbCgpO1xyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gYm9hcmRCdXR0b24oY3R4LCBwb3NpdGlvbiwgd2lkdGgsIGhlaWdodCwgaG92ZXJlZCl7XHJcbiAgICAvL2N0eC5zYXZlKCk7XHJcbiAgICBpZihob3ZlcmVkKXtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJkb2RnZXJibHVlXCI7XHJcbiAgICB9XHJcbiAgICBlbHNle1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBcImxpZ2h0Ymx1ZVwiO1xyXG4gICAgfVxyXG4gICAgLy9kcmF3IHJvdW5kZWQgY29udGFpbmVyXHJcbiAgICBjdHgucmVjdChwb3NpdGlvbi54IC0gd2lkdGgvMiwgcG9zaXRpb24ueSAtIGhlaWdodC8yLCB3aWR0aCwgaGVpZ2h0KTtcclxuICAgIGN0eC5saW5lV2lkdGggPSA1O1xyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gXCJibGFja1wiO1xyXG4gICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgY3R4LmZpbGwoKTtcclxuICAgIC8vY3R4LnJlc3RvcmUoKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBkcmF3TGliOyIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgQm9hcmQgPSByZXF1aXJlKCcuL2JvYXJkLmpzJyk7XHJcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4vcG9pbnQuanMnKTtcclxudmFyIERyYXdMaWIgPSByZXF1aXJlKCcuL2RyYXdMaWIuanMnKTtcclxudmFyIExlc3Nvbk5vZGUgPSByZXF1aXJlKCcuL2xlc3Nvbk5vZGUuanMnKTtcclxudmFyIFV0aWxpdGllcyA9IHJlcXVpcmUoJy4vdXRpbGl0aWVzLmpzJyk7XHJcblxyXG52YXIgYm9hcmQ7XHJcbnZhciBwYWludGVyO1xyXG5cclxudmFyIG1vdXNlU3RhdGU7XHJcbnZhciBwcmV2aW91c01vdXNlU3RhdGU7XHJcbnZhciBkcmFnZ2luZ0Rpc2FibGVkO1xyXG52YXIgbW91c2VUYXJnZXQ7XHJcbnZhciBtb3VzZVN1c3RhaW5lZERvd247XHJcblxyXG5mdW5jdGlvbiBnYW1lKCl7XHJcbiAgICBwYWludGVyID0gbmV3IERyYXdMaWIoKTtcclxuICAgIFxyXG4gICAgZHJhZ2dpbmdEaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgbW91c2VTdXN0YWluZWREb3duID0gZmFsc2U7XHJcbiAgICBcclxuICAgIHZhciB0ZXN0TGVzc29uTm9kZUFycmF5ID0gW107XHJcbiAgICB0ZXN0TGVzc29uTm9kZUFycmF5LnB1c2gobmV3IExlc3Nvbk5vZGUobmV3IFBvaW50KDAsMCksIFwiaW1hZ2VzL2RvZy5wbmdcIikpO1xyXG4gICAgdGVzdExlc3Nvbk5vZGVBcnJheS5wdXNoKG5ldyBMZXNzb25Ob2RlKG5ldyBQb2ludCgxMDAsMTAwKSwgXCJpbWFnZXMvZ29sZERvZy5wbmdcIikpO1xyXG4gICAgdGVzdExlc3Nvbk5vZGVBcnJheS5wdXNoKG5ldyBMZXNzb25Ob2RlKG5ldyBQb2ludCgxMDAsLTEwMCksIFwiaW1hZ2VzL3Ntb2xEb2cucG5nXCIpKTtcclxuICAgIFxyXG4gICAgYm9hcmQgPSBuZXcgQm9hcmQobmV3IFBvaW50KDAsMCksIHRlc3RMZXNzb25Ob2RlQXJyYXkpO1xyXG59XHJcblxyXG52YXIgcCA9IGdhbWUucHJvdG90eXBlO1xyXG5cclxucC51cGRhdGUgPSBmdW5jdGlvbihjdHgsIGNhbnZhcywgZHQsIGNlbnRlciwgYWN0aXZlSGVpZ2h0LCBwTW91c2VTdGF0ZSl7XHJcbiAgICAvL3VwZGF0ZSBzdHVmZlxyXG4gICAgcC5hY3QocE1vdXNlU3RhdGUpO1xyXG4gICAgLy9kcmF3IHN0dWZmXHJcbiAgICBwLmRyYXcoY3R4LCBjYW52YXMsIGNlbnRlciwgYWN0aXZlSGVpZ2h0KTtcclxufVxyXG5cclxucC5hY3QgPSBmdW5jdGlvbihwTW91c2VTdGF0ZSl7XHJcbiAgICBwcmV2aW91c01vdXNlU3RhdGUgPSBtb3VzZVN0YXRlO1xyXG4gICAgbW91c2VTdGF0ZSA9IHBNb3VzZVN0YXRlO1xyXG4gICAgbW91c2VUYXJnZXQgPSAwO1xyXG4gICAgaWYodHlwZW9mIHByZXZpb3VzTW91c2VTdGF0ZSA9PT0gJ3VuZGVmaW5lZCcpe1xyXG4gICAgICAgIHByZXZpb3VzTW91c2VTdGF0ZSA9IG1vdXNlU3RhdGU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIFxyXG4gICAgLy9jb2xsaXNpb24gZGV0ZWN0aW9uLCBpdGVyYXRlIHRocm91Z2ggZWFjaCBub2RlIGluIHRoZSBhY3RpdmUgYm9hcmRcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBib2FyZC5sZXNzb25Ob2RlQXJyYXkubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgIHZhciB0YXJnZXRMZXNzb25Ob2RlID0gYm9hcmQubGVzc29uTm9kZUFycmF5W2ldO1xyXG4gICAgICAgIG1vdXNlSW50ZXJzZWN0KHRhcmdldExlc3Nvbk5vZGUsIGJvYXJkLnBvc2l0aW9uLCB0YXJnZXRMZXNzb25Ob2RlLnNjYWxlRmFjdG9yKTtcclxuICAgICAgICBpZih0YXJnZXRMZXNzb25Ob2RlLm1vdXNlT3ZlciA9PSB0cnVlKXtcclxuICAgICAgICAgICAgbW91c2VUYXJnZXQgPSB0YXJnZXRMZXNzb25Ob2RlO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vaWYgdGhlIGVsZW1lbnQgdGhhdCB0aGUgbW91c2UgaXMgaG92ZXJpbmcgb3ZlciBpcyBOT1QgdGhlIGNhbnZhc1xyXG4gICAgaWYobW91c2VUYXJnZXQgIT0gMCl7XHJcbiAgICAgICAgLy9pZiBtb3VzZURvd25cclxuICAgICAgICBpZihtb3VzZVN0YXRlLm1vdXNlRG93biA9PSB0cnVlICYmIHByZXZpb3VzTW91c2VTdGF0ZS5tb3VzZURvd24gPT0gZmFsc2Upe1xyXG4gICAgICAgICAgICBtb3VzZVN1c3RhaW5lZERvd24gPSB0cnVlO1xyXG4gICAgICAgICAgICBkcmFnZ2luZ0Rpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy9pZiBtb3VzZVVwIGNsaWNrIGV2ZW50XHJcbiAgICAgICAgZWxzZSBpZihtb3VzZVN0YXRlLm1vdXNlRG93biA9PSBmYWxzZSAmJiBwcmV2aW91c01vdXNlU3RhdGUubW91c2VEb3duID09IHRydWUpe1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhtb3VzZVRhcmdldC50eXBlKTtcclxuICAgICAgICAgICAgbW91c2VUYXJnZXQuY2xpY2sobW91c2VTdGF0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZXtcclxuICAgICAgICAvL2lmIG5vdCBhIHN1c3RhaW5lZCBkb3duXHJcbiAgICAgICAgaWYobW91c2VTdXN0YWluZWREb3duID09IGZhbHNlKXtcclxuICAgICAgICAgICAgZHJhZ2dpbmdEaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGlmKG1vdXNlU3RhdGUubW91c2VEb3duID09IGZhbHNlICYmIHByZXZpb3VzTW91c2VTdGF0ZS5tb3VzZURvd24gPT0gdHJ1ZSl7XHJcbiAgICAgICAgbW91c2VTdXN0YWluZWREb3duID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vbW92aW5nIHRoZSBib2FyZFxyXG4gICAgaWYobW91c2VTdGF0ZS5tb3VzZURvd24gPT0gdHJ1ZSAmJiBkcmFnZ2luZ0Rpc2FibGVkID09IGZhbHNlKXtcclxuICAgICAgICBib2FyZC5tb3ZlKHByZXZpb3VzTW91c2VTdGF0ZS5wb3NpdGlvbi54IC0gbW91c2VTdGF0ZS5wb3NpdGlvbi54LCBwcmV2aW91c01vdXNlU3RhdGUucG9zaXRpb24ueSAtIG1vdXNlU3RhdGUucG9zaXRpb24ueSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIFxyXG4gICAgXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZGVidWdMaW5lJykuaW5uZXJIVE1MID0gXCJtb3VzZVBvc2l0aW9uOiB4ID0gXCIgKyBtb3VzZVN0YXRlLnJlbGF0aXZlUG9zaXRpb24ueCArIFwiLCB5ID0gXCIgKyBtb3VzZVN0YXRlLnJlbGF0aXZlUG9zaXRpb24ueSArIFxyXG4gICAgXCI8YnI+Q2xpY2tlZCA9IFwiICsgbW91c2VTdGF0ZS5tb3VzZURvd24gKyBcclxuICAgIFwiPGJyPk92ZXIgQ2FudmFzID0gXCIgKyBtb3VzZVN0YXRlLm1vdXNlSW4gKyBcclxuICAgIFwiPGJyPkNsaWNrZWQgPSBcIiArIG1vdXNlU3RhdGUubW91c2VEb3duO1xyXG59XHJcblxyXG5wLmRyYXcgPSBmdW5jdGlvbihjdHgsIGNhbnZhcywgY2VudGVyLCBhY3RpdmVIZWlnaHQpe1xyXG4gICAgLy9kcmF3IGJvYXJkXHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgcGFpbnRlci5jbGVhcihjdHgsIDAsIDAsIGNhbnZhcy5vZmZzZXRXaWR0aCwgY2FudmFzLm9mZnNldEhlaWdodCk7XHJcbiAgICBwYWludGVyLnJlY3QoY3R4LCAwLCAwLCBjYW52YXMub2Zmc2V0V2lkdGgsIGNhbnZhcy5vZmZzZXRIZWlnaHQsIFwid2hpdGVcIik7XHJcbiAgICBwYWludGVyLmxpbmUoY3R4LCBjYW52YXMub2Zmc2V0V2lkdGgvMiwgY2VudGVyLnkgLSBhY3RpdmVIZWlnaHQvMiwgY2FudmFzLm9mZnNldFdpZHRoLzIsIGNhbnZhcy5vZmZzZXRIZWlnaHQsIDIsIFwibGlnaHRncmF5XCIpO1xyXG4gICAgcGFpbnRlci5saW5lKGN0eCwgMCwgY2VudGVyLnksIGNhbnZhcy5vZmZzZXRXaWR0aCwgY2VudGVyLnksIDIsIFwibGlnaHRHcmF5XCIpO1xyXG4gICAgXHJcbiAgICAvL2RyYXdpbmcgbGVzc29uIG5vZGVzXHJcbiAgICBib2FyZC5kcmF3KGN0eCwgY2VudGVyLCBhY3RpdmVIZWlnaHQpO1xyXG4gICAgXHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGdhbWU7XHJcblxyXG4vL3BFbGVtZW50IGlzIHRoZSBvYmplY3Qgb24gdGhlIGNhbnZhcyB0aGF0IGlzIGJlaW5nIGNoZWNrZWQgYWdhaW5zdCB0aGUgbW91c2UsIHBPZmZzZXR0ZXIgd2lsbCBtb3N0IGxpa2VseSBiZSB0aGUgYm9hcmQgc28gd2UgY2FuIHN1YnRyYWN0IHBvc2l0aW9uIG9yIHdoYXRldmVyIGl0IG5lZWRzIHRvIHJlbWFpbiBhbGlnbmVkXHJcbmZ1bmN0aW9uIG1vdXNlSW50ZXJzZWN0KHBFbGVtZW50LCBwT2Zmc2V0dGVyLCBwU2NhbGUpe1xyXG4gICAgaWYobW91c2VTdGF0ZS5yZWxhdGl2ZVBvc2l0aW9uLnggKyBwT2Zmc2V0dGVyLnggPiAocEVsZW1lbnQucG9zaXRpb24ueCAtIChwU2NhbGUqcEVsZW1lbnQud2lkdGgpLzIpICYmIG1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbi54ICsgcE9mZnNldHRlci54IDwgKHBFbGVtZW50LnBvc2l0aW9uLnggKyAocFNjYWxlKnBFbGVtZW50LndpZHRoKS8yKSl7XHJcbiAgICAgICAgaWYobW91c2VTdGF0ZS5yZWxhdGl2ZVBvc2l0aW9uLnkgKyBwT2Zmc2V0dGVyLnkgPiAocEVsZW1lbnQucG9zaXRpb24ueSAtIChwU2NhbGUqcEVsZW1lbnQuaGVpZ2h0KS8yKSAmJiBtb3VzZVN0YXRlLnJlbGF0aXZlUG9zaXRpb24ueSArIHBPZmZzZXR0ZXIueSA8IChwRWxlbWVudC5wb3NpdGlvbi55ICsgKHBTY2FsZSpwRWxlbWVudC5oZWlnaHQpLzIpKXtcclxuICAgICAgICAgICAgcEVsZW1lbnQubW91c2VPdmVyID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgcEVsZW1lbnQubW91c2VPdmVyID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZXtcclxuICAgICAgICBwRWxlbWVudC5tb3VzZU92ZXIgPSBmYWxzZTtcclxuICAgIH1cclxufSIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuLy9wYXJhbWV0ZXIgaXMgYSBwb2ludCB0aGF0IGRlbm90ZXMgc3RhcnRpbmcgcG9zaXRpb25cclxuZnVuY3Rpb24gbGVzc29uTm9kZShzdGFydFBvc2l0aW9uLCBpbWFnZVBhdGgpe1xyXG4gICAgdGhpcy5wb3NpdGlvbiA9IHN0YXJ0UG9zaXRpb247XHJcbiAgICB0aGlzLm1vdXNlT3ZlciA9IGZhbHNlO1xyXG4gICAgdGhpcy5zY2FsZUZhY3RvciA9IDE7XHJcbiAgICB0aGlzLnR5cGUgPSBcImxlc3Nvbk5vZGVcIjtcclxuICAgIFxyXG4gICAgXHJcbiAgICAvL2ltYWdlIGxvYWRpbmcgYW5kIHJlc2l6aW5nXHJcbiAgICB2YXIgdGVtcEltYWdlID0gbmV3IEltYWdlKCk7XHJcbiAgICB0cnl7XHJcbiAgICAgICAgdGVtcEltYWdlLnNyYyA9IGltYWdlUGF0aDtcclxuICAgICAgICB0aGlzLmltYWdlID0gdGVtcEltYWdlO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICB0ZW1wSW1hZ2Uuc3JjID0gXCJpbWFnZXMvZG9nLnBuZ1wiO1xyXG4gICAgICAgIHRoaXMuaW1hZ2UgPSB0ZW1wSW1hZ2U7XHJcbiAgICB9XHJcbiAgICB0aGlzLndpZHRoID0gdGhpcy5pbWFnZS5uYXR1cmFsV2lkdGg7XHJcbiAgICB0aGlzLmhlaWdodCA9IHRoaXMuaW1hZ2UubmF0dXJhbEhlaWdodDtcclxuICAgIHZhciBtYXhEaW1lbnNpb24gPSAxMDA7XHJcbiAgICAvL3RvbyBzbWFsbD9cclxuICAgIGlmKHRoaXMud2lkdGggPCBtYXhEaW1lbnNpb24gJiYgdGhpcy5oZWlnaHQgPCBtYXhEaW1lbnNpb24pe1xyXG4gICAgICAgIHZhciB4O1xyXG4gICAgICAgIGlmKHRoaXMud2lkdGggPiB0aGlzLmhlaWdodCl7XHJcbiAgICAgICAgICAgIHggPSBtYXhEaW1lbnNpb24gLyB0aGlzLndpZHRoO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICB4ID0gbWF4RGltZW5zaW9uIC8gdGhpcy5oZWlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMud2lkdGggPSB0aGlzLndpZHRoICogeDtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IHRoaXMuaGVpZ2h0ICogeDtcclxuICAgIH1cclxuICAgIGlmKHRoaXMud2lkdGggPiBtYXhEaW1lbnNpb24gfHwgdGhpcy5oZWlnaHQgPiBtYXhEaW1lbnNpb24pe1xyXG4gICAgICAgIHZhciB4O1xyXG4gICAgICAgIGlmKHRoaXMud2lkdGggPiB0aGlzLmhlaWdodCl7XHJcbiAgICAgICAgICAgIHggPSB0aGlzLndpZHRoIC8gbWF4RGltZW5zaW9uO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICB4ID0gdGhpcy5oZWlnaHQgLyBtYXhEaW1lbnNpb247XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMud2lkdGggPSB0aGlzLndpZHRoIC8geDtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IHRoaXMuaGVpZ2h0IC8geDtcclxuICAgIH1cclxufVxyXG5cclxubGVzc29uTm9kZS5kcmF3TGliID0gdW5kZWZpbmVkO1xyXG5cclxudmFyIHAgPSBsZXNzb25Ob2RlLnByb3RvdHlwZTtcclxuXHJcbnAuZHJhdyA9IGZ1bmN0aW9uKGN0eCl7XHJcbiAgICAvL2xlc3Nvbk5vZGUuZHJhd0xpYi5jaXJjbGUoY3R4LCB0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSwgMTAsIFwicmVkXCIpO1xyXG4gICAgLy9kcmF3IHRoZSBpbWFnZSwgc2hhZG93IGlmIGhvdmVyZWRcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBpZih0aGlzLm1vdXNlT3Zlcil7XHJcbiAgICAgICAgY3R4LnNoYWRvd0NvbG9yID0gJ2RvZGdlckJsdWUnO1xyXG4gICAgICAgIGN0eC5zaGFkb3dCbHVyID0gMjA7XHJcbiAgICB9XHJcbiAgICBjdHguZHJhd0ltYWdlKHRoaXMuaW1hZ2UsIHRoaXMucG9zaXRpb24ueCAtICh0aGlzLndpZHRoKnRoaXMuc2NhbGVGYWN0b3IpLzIsIHRoaXMucG9zaXRpb24ueSAtICh0aGlzLmhlaWdodCp0aGlzLnNjYWxlRmFjdG9yKS8yLCB0aGlzLndpZHRoICogdGhpcy5zY2FsZUZhY3RvciwgdGhpcy5oZWlnaHQgKiB0aGlzLnNjYWxlRmFjdG9yKVxyXG4gICAgXHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG59O1xyXG5cclxucC5jbGljayA9IGZ1bmN0aW9uKG1vdXNlU3RhdGUpe1xyXG4gICAgY29uc29sZS5sb2coXCJ3aG9vcGl0eSBkb29cIik7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbGVzc29uTm9kZTsiLCIvL2tlZXBzIHRyYWNrIG9mIG1vdXNlIHJlbGF0ZWQgdmFyaWFibGVzLlxyXG4vL2NhbGN1bGF0ZWQgaW4gbWFpbiBhbmQgcGFzc2VkIHRvIGdhbWVcclxuLy9jb250YWlucyB1cCBzdGF0ZVxyXG4vL3Bvc2l0aW9uXHJcbi8vcmVsYXRpdmUgcG9zaXRpb25cclxuLy9vbiBjYW52YXNcclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbmZ1bmN0aW9uIG1vdXNlU3RhdGUocFBvc2l0aW9uLCBwUmVsYXRpdmVQb3NpdGlvbiwgcE1vdXNlZG93biwgcE1vdXNlSW4pe1xyXG4gICAgdGhpcy5wb3NpdGlvbiA9IHBQb3NpdGlvbjtcclxuICAgIHRoaXMucmVsYXRpdmVQb3NpdGlvbiA9IHBSZWxhdGl2ZVBvc2l0aW9uO1xyXG4gICAgdGhpcy5tb3VzZURvd24gPSBwTW91c2Vkb3duO1xyXG4gICAgdGhpcy5tb3VzZUluID0gcE1vdXNlSW47XHJcbn1cclxuXHJcbnZhciBwID0gbW91c2VTdGF0ZS5wcm90b3R5cGU7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG1vdXNlU3RhdGU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmZ1bmN0aW9uIHBvaW50KHBYLCBwWSl7XHJcbiAgICB0aGlzLnggPSBwWDtcclxuICAgIHRoaXMueSA9IHBZO1xyXG59XHJcblxyXG52YXIgcCA9IHBvaW50LnByb3RvdHlwZTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gcG9pbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4vcG9pbnQuanMnKTtcclxuXHJcbmZ1bmN0aW9uIHV0aWxpdGllcygpe1xyXG59XHJcblxyXG52YXIgcCA9IHV0aWxpdGllcy5wcm90b3R5cGU7XHJcbi8vIHJldHVybnMgbW91c2UgcG9zaXRpb24gaW4gbG9jYWwgY29vcmRpbmF0ZSBzeXN0ZW0gb2YgZWxlbWVudFxyXG5wLmdldE1vdXNlID0gZnVuY3Rpb24oZSl7XHJcbiAgICAvL3JldHVybiBuZXcgYXBwLlBvaW50KChlLnBhZ2VYIC0gZS50YXJnZXQub2Zmc2V0TGVmdCkgKiAoYXBwLm1haW4ucmVuZGVyV2lkdGggLyBhY3R1YWxDYW52YXNXaWR0aCksIChlLnBhZ2VZIC0gZS50YXJnZXQub2Zmc2V0VG9wKSAqIChhcHAubWFpbi5yZW5kZXJIZWlnaHQgLyBhY3R1YWxDYW52YXNIZWlnaHQpKTtcclxuICAgIHJldHVybiBuZXcgUG9pbnQoKGUucGFnZVggLSBlLnRhcmdldC5vZmZzZXRMZWZ0KSwgKGUucGFnZVkgLSBlLnRhcmdldC5vZmZzZXRUb3ApKTtcclxufVxyXG5cclxucC5tYXAgPSBmdW5jdGlvbih2YWx1ZSwgbWluMSwgbWF4MSwgbWluMiwgbWF4Mil7XHJcbiAgICAvL3JldHVybiBtaW4yICsgKG1heDIgLSBtaW4yKSAqICgodmFsdWUgLSBtaW4xKSAvIChtYXgxIC0gbWluMSkpO1xyXG59XHJcblxyXG5wLmNsYW1wID0gZnVuY3Rpb24odmFsdWUsIG1pbiwgbWF4KXtcclxuICAgIC8vcmV0dXJuIE1hdGgubWF4KG1pbiwgTWF0aC5taW4obWF4LCB2YWx1ZSkpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHV0aWxpdGllczsiXX0=
