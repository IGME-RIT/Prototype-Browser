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
	/*app.main.app = app;
    
	app.main.utilities = app.utilities;
	app.main.drawLib = app.drawLib;
    app.main.dataObject = new app.dataObject();
    app.board.drawLib = app.drawLib;
    app.lessonNode.drawLib = app.drawLib;
    app.boardButton.drawLib = app.drawLib;
    
	app.queue = new createjs.LoadQueue(false);
	app.queue.on("complete", function(){
		app.main.init();
	});
    app.queue.loadManifest([
        {id: "exampleImage", src:"images/dog.jpg"},
	]);
    
    window.addEventListener("resize",function(e){
        app.main.canvas.width = app.main.canvas.offsetWidth;
        app.main.canvas.height = app.main.canvas.offsetHeight;
        app.main.activeHeight = app.main.canvas.height - app.main.header.offsetHeight;
        app.main.center = new app.point(app.main.canvas.width / 2, app.main.activeHeight / 2 + app.main.header.offsetHeight)
	});*/
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
var position;
var width;
var height;
var clicked;
var hovered;

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

var boardArray;
var activeBoardIndex;
var painter;

var mouseState;
var previousMouseState;

function game(){
    painter = new DrawLib();
    
    activeBoardIndex = 0;
    
    var testLessonNodeArray = [];
    testLessonNodeArray.push(new LessonNode(new Point(0,0), "images/dog.png"));
    
    boardArray = [];
    boardArray.push(new Board(new Point(0,0), testLessonNodeArray));
    
    
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
    document.querySelector('#debugLine').innerHTML = "mousePosition: x = " + mouseState.relativePosition.x + ", y = " + mouseState.relativePosition.y + 
    "<br>Clicked = " + mouseState.mouseDown + 
    "<br>Over Canvas = " + mouseState.mouseIn;
    
    //collision detection, iterate through each node in the active board
    for(var i = 0; i < boardArray[activeBoardIndex].lessonNodeArray.length; i++){
        var targetLessonNode = boardArray[activeBoardIndex].lessonNodeArray[i];
        mouseIntersect(targetLessonNode, boardArray[activeBoardIndex].position, targetLessonNode.scaleFactor);
    }
    
    
    //moving the board
    if(mouseState.mouseDown == true){
        boardArray[activeBoardIndex].move(previousMouseState.position.x - mouseState.position.x, previousMouseState.position.y - mouseState.position.y);
    }
}

p.draw = function(ctx, canvas, center, activeHeight){
    //draw board
    ctx.save();
    painter.clear(ctx, 0, 0, canvas.offsetWidth, canvas.offsetHeight);
    painter.rect(ctx, 0, 0, canvas.offsetWidth, canvas.offsetHeight, "white");
    painter.line(ctx, canvas.offsetWidth/2, center.y - activeHeight/2, canvas.offsetWidth/2, canvas.offsetHeight, 2, "lightgray");
    painter.line(ctx, 0, center.y, canvas.offsetWidth, center.y, 2, "lightGray");
    
    //drawing lesson nodes
    boardArray[0].draw(ctx, center, activeHeight);
    
    ctx.restore();
}

module.exports = game;

//pElement is the object on the canvas that is being checked against the mouse, pOffseter will most likely be the board so we can subtract position or whatever it needs to remain aligned
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

var position;
var width;
var height;
var image;
var scaleFactor;

//parameter is a point that denotes starting position
function lessonNode(startPosition, imagePath){
    this.position = startPosition;
    this.width = 100;
    this.height = 100;
    this.mouseOver = false;
    this.scaleFactor = 1;
    
    //image loading
    var tempImage = new Image();
    try{
        tempImage.src = imagePath;
        image = tempImage;
    }
    catch (e) {
        tempImage.src = "images/dog.png";
        image = tempImage;
    }
}

lessonNode.drawLib = undefined;

var p = lessonNode.prototype;

p.draw = function(ctx){
    //lessonNode.drawLib.circle(ctx, this.position.x, this.position.y, 10, "red");
    //draw the image, shadow if hovered
    ctx.save();
    if(this.mouseOver){
        //ctx.shadowOffsetX = 10;
        //ctx.shadowOffsetY = 10;
        ctx.shadowColor = 'blue';
        ctx.shadowBlur = 30;
    }
    ctx.drawImage(image, this.position.x - (this.width*this.scaleFactor)/2, this.position.y - (this.height*this.scaleFactor)/2, this.width * this.scaleFactor, this.height * this.scaleFactor)
    
    ctx.restore();
};

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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkYXRhL2xlc3NvbnMuanNvbiIsImpzL21haW4uanMiLCJqcy9tYWluT0xELmpzIiwianMvbW9kdWxlcy9ib2FyZC5qcyIsImpzL21vZHVsZXMvYnV0dG9uLmpzIiwianMvbW9kdWxlcy9kYXRhT2JqZWN0LmpzIiwianMvbW9kdWxlcy9kcmF3TGliLmpzIiwianMvbW9kdWxlcy9nYW1lLmpzIiwianMvbW9kdWxlcy9sZXNzb25Ob2RlLmpzIiwianMvbW9kdWxlcy9tb3VzZVN0YXRlLmpzIiwianMvbW9kdWxlcy9wb2ludC5qcyIsImpzL21vZHVsZXMvdXRpbGl0aWVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cz17XHJcbiAgICBcImxlc3NvbnNcIjpbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBcInhcIjogXCIwXCIsXHJcbiAgICAgICAgICAgIFwieVwiOiBcIjBcIixcclxuICAgICAgICAgICAgXCJpbWFnZVwiOiBcImRvZy5qcGVnXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgXCJ4XCI6IFwiMTAwXCIsXHJcbiAgICAgICAgICAgIFwieVwiOiBcIjEwMFwiLFxyXG4gICAgICAgICAgICBcImltYWdlXCI6IFwiZG9nLmpwZWdcIlxyXG4gICAgICAgIH1cclxuICAgIF1cclxufSIsIlwidXNlIHN0cmljdFwiO1xyXG4vL2ltcG9ydHNcclxudmFyIEdhbWUgPSByZXF1aXJlKCcuL21vZHVsZXMvZ2FtZS5qcycpO1xyXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuL21vZHVsZXMvcG9pbnQuanMnKTtcclxudmFyIE1vdXNlU3RhdGUgPSByZXF1aXJlKCcuL21vZHVsZXMvbW91c2VTdGF0ZS5qcycpO1xyXG5cclxuLy92YXJpYWJsZXNcclxudmFyIGdhbWU7XHJcbnZhciBjYW52YXM7XHJcbnZhciBjdHg7XHJcblxyXG52YXIgaGVhZGVyO1xyXG52YXIgYWN0aXZlSGVpZ2h0O1xyXG52YXIgY2VudGVyO1xyXG5cclxudmFyIG1vdXNlUG9zaXRpb247XHJcbnZhciByZWxhdGl2ZU1vdXNlUG9zaXRpb247XHJcbnZhciBtb3VzZURvd247XHJcbnZhciBtb3VzZUluO1xyXG4vKmFwcC5JTUFHRVMgPSB7XHJcbiAgICB0ZXN0SW1hZ2U6IFwiaW1hZ2VzL2RvZy5wbmdcIlxyXG4gfTsqL1xyXG5cclxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKGUpe1xyXG4gICAgaW5pdGlhbGl6ZVZhcmlhYmxlcygpO1xyXG4gICAgXHJcbiAgICBsb29wKCk7XHJcblx0LyphcHAubWFpbi5hcHAgPSBhcHA7XHJcbiAgICBcclxuXHRhcHAubWFpbi51dGlsaXRpZXMgPSBhcHAudXRpbGl0aWVzO1xyXG5cdGFwcC5tYWluLmRyYXdMaWIgPSBhcHAuZHJhd0xpYjtcclxuICAgIGFwcC5tYWluLmRhdGFPYmplY3QgPSBuZXcgYXBwLmRhdGFPYmplY3QoKTtcclxuICAgIGFwcC5ib2FyZC5kcmF3TGliID0gYXBwLmRyYXdMaWI7XHJcbiAgICBhcHAubGVzc29uTm9kZS5kcmF3TGliID0gYXBwLmRyYXdMaWI7XHJcbiAgICBhcHAuYm9hcmRCdXR0b24uZHJhd0xpYiA9IGFwcC5kcmF3TGliO1xyXG4gICAgXHJcblx0YXBwLnF1ZXVlID0gbmV3IGNyZWF0ZWpzLkxvYWRRdWV1ZShmYWxzZSk7XHJcblx0YXBwLnF1ZXVlLm9uKFwiY29tcGxldGVcIiwgZnVuY3Rpb24oKXtcclxuXHRcdGFwcC5tYWluLmluaXQoKTtcclxuXHR9KTtcclxuICAgIGFwcC5xdWV1ZS5sb2FkTWFuaWZlc3QoW1xyXG4gICAgICAgIHtpZDogXCJleGFtcGxlSW1hZ2VcIiwgc3JjOlwiaW1hZ2VzL2RvZy5qcGdcIn0sXHJcblx0XSk7XHJcbiAgICBcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgYXBwLm1haW4uY2FudmFzLndpZHRoID0gYXBwLm1haW4uY2FudmFzLm9mZnNldFdpZHRoO1xyXG4gICAgICAgIGFwcC5tYWluLmNhbnZhcy5oZWlnaHQgPSBhcHAubWFpbi5jYW52YXMub2Zmc2V0SGVpZ2h0O1xyXG4gICAgICAgIGFwcC5tYWluLmFjdGl2ZUhlaWdodCA9IGFwcC5tYWluLmNhbnZhcy5oZWlnaHQgLSBhcHAubWFpbi5oZWFkZXIub2Zmc2V0SGVpZ2h0O1xyXG4gICAgICAgIGFwcC5tYWluLmNlbnRlciA9IG5ldyBhcHAucG9pbnQoYXBwLm1haW4uY2FudmFzLndpZHRoIC8gMiwgYXBwLm1haW4uYWN0aXZlSGVpZ2h0IC8gMiArIGFwcC5tYWluLmhlYWRlci5vZmZzZXRIZWlnaHQpXHJcblx0fSk7Ki9cclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdGlhbGl6ZVZhcmlhYmxlcygpe1xyXG4gICAgY2FudmFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignY2FudmFzJyk7XHJcbiAgICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgIGNhbnZhcy53aWR0aCA9IGNhbnZhcy5vZmZzZXRXaWR0aDtcclxuICAgIGNhbnZhcy5oZWlnaHQgPSBjYW52YXMub2Zmc2V0SGVpZ2h0O1xyXG4gICAgY29uc29sZS5sb2coXCJDYW52YXMgRGltZW5zaW9uczogXCIgKyBjYW52YXMud2lkdGggKyBcIiwgXCIgKyBjYW52YXMuaGVpZ2h0KTtcclxuICAgIFxyXG4gICAgaGVhZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaGVhZGVyJyk7XHJcbiAgICBhY3RpdmVIZWlnaHQgPSBjYW52YXMub2Zmc2V0SGVpZ2h0IC0gaGVhZGVyLm9mZnNldEhlaWdodDtcclxuICAgIGNlbnRlciA9IG5ldyBQb2ludChjYW52YXMud2lkdGgvMiwgYWN0aXZlSGVpZ2h0LzIgKyBoZWFkZXIub2Zmc2V0SGVpZ2h0KTtcclxuICAgIFxyXG4gICAgbW91c2VQb3NpdGlvbiA9IG5ldyBQb2ludCgwLDApO1xyXG4gICAgcmVsYXRpdmVNb3VzZVBvc2l0aW9uID0gbmV3IFBvaW50KDAsMCk7XHJcbiAgICBcclxuICAgIC8vZXZlbnQgbGlzdGVuZXIgZm9yIHdoZW4gdGhlIG1vdXNlIG1vdmVzIG92ZXIgdGhlIGNhbnZhc1xyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgdmFyIGJvdW5kUmVjdCA9IGNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICBtb3VzZVBvc2l0aW9uID0gbmV3IFBvaW50KGUuY2xpZW50WCAtIGJvdW5kUmVjdC5sZWZ0LCBlLmNsaWVudFkgLSBib3VuZFJlY3QudG9wKTtcclxuICAgICAgICByZWxhdGl2ZU1vdXNlUG9zaXRpb24gPSBuZXcgUG9pbnQobW91c2VQb3NpdGlvbi54IC0gKGNhbnZhcy5vZmZzZXRXaWR0aC8yLjApLCBtb3VzZVBvc2l0aW9uLnkgLSAoaGVhZGVyLm9mZnNldEhlaWdodCArIGFjdGl2ZUhlaWdodC8yLjApKTsgICAgICAgIFxyXG4gICAgfSk7XHJcbiAgICBtb3VzZURvd24gPSBmYWxzZTtcclxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIG1vdXNlRG93biA9IHRydWU7XHJcbiAgICB9KTtcclxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBmdW5jdGlvbihlKXtcclxuICAgICAgICBtb3VzZURvd24gPSBmYWxzZTtcclxuICAgIH0pO1xyXG4gICAgbW91c2VJbiA9IGZhbHNlO1xyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW92ZXJcIiwgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgbW91c2VJbiA9IHRydWU7XHJcbiAgICB9KTtcclxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VvdXRcIiwgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgbW91c2VJbiA9IGZhbHNlO1xyXG4gICAgICAgIG1vdXNlRG93biA9IGZhbHNlO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIGdhbWUgPSBuZXcgR2FtZSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBsb29wKCl7XHJcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGxvb3AuYmluZCh0aGlzKSk7XHJcbiAgICBnYW1lLnVwZGF0ZShjdHgsIGNhbnZhcywgMCwgY2VudGVyLCBhY3RpdmVIZWlnaHQsIG5ldyBNb3VzZVN0YXRlKG1vdXNlUG9zaXRpb24sIHJlbGF0aXZlTW91c2VQb3NpdGlvbiwgbW91c2VEb3duLCBtb3VzZUluKSk7XHJcbn1cclxuXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgY2FudmFzLndpZHRoID0gY2FudmFzLm9mZnNldFdpZHRoO1xyXG4gICAgY2FudmFzLmhlaWdodCA9IGNhbnZhcy5vZmZzZXRIZWlnaHQ7XHJcbiAgICBhY3RpdmVIZWlnaHQgPSBjYW52YXMuaGVpZ2h0IC0gaGVhZGVyLm9mZnNldEhlaWdodDtcclxuICAgIGNlbnRlciA9IG5ldyBQb2ludChjYW52YXMud2lkdGggLyAyLCBhY3RpdmVIZWlnaHQgLyAyICsgaGVhZGVyLm9mZnNldEhlaWdodClcclxuICAgIFxyXG4gICAgY29uc29sZS5sb2coXCJDYW52YXMgRGltZW5zaW9uczogXCIgKyBjYW52YXMud2lkdGggKyBcIiwgXCIgKyBjYW52YXMuaGVpZ2h0KTtcclxufSk7XHJcblxyXG5cclxuXHJcbiIsIid1c2Ugc3RyaWN0JztcclxuLy92YXIgdXRpbGl0aWVzID0gcmVxdWlyZSgnLi91dGlsaXRpZXMuanMnKTtcclxudmFyIGFwcCA9IGFwcCB8fCB7fTtcclxuXHJcbmFwcC5tYWluID0geyAgICBcclxuICAgIC8vdmFyaWFibGVzXHJcbiAgICBjYW52YXM6IHVuZGVmaW5lZCxcclxuICAgIGN0eDogdW5kZWZpbmVkLFxyXG4gICAgYXBwOiB1bmRlZmluZWQsXHJcbiAgICB1dGlsaXRpZXM6IHVuZGVmaW5lZCxcclxuICAgIGRyYXdMaWI6IHVuZGVmaW5lZCxcclxuICAgIFxyXG4gICAgbW91c2VQb3NpdGlvbjogdW5kZWZpbmVkLFxyXG4gICAgbGFzdE1vdXNlUG9zaXRpb246IHVuZGVmaW5lZCxcclxuICAgIHJlbGF0aXZlTW91c2VQb3NpdGlvbjogdW5kZWZpbmVkLFxyXG4gICAgYW5pbWF0aW9uSUQ6IDAsXHJcblx0bGFzdFRpbWU6IDAsXHJcbiAgICBcclxuICAgIGhlYWRlcjogdW5kZWZpbmVkLFxyXG4gICAgYWN0aXZlSGVpZ2h0OiB1bmRlZmluZWQsXHJcbiAgICBjZW50ZXI6IHVuZGVmaW5lZCxcclxuICAgIGJvYXJkOiB1bmRlZmluZWQsXHJcbiAgICBcclxuICAgIGRyYWdnaW5nOiB1bmRlZmluZWQsXHJcbiAgICBjdXJzb3I6IHVuZGVmaW5lZCxcclxuICAgIFxyXG4gICAgLy9kYXRhT2JqZWN0OiByZXF1aXJlKCcuL29iamVjdHMvZGF0YU9iamVjdC5qcycpLFxyXG4gICAgXHJcbiAgICAvL2VudW1lcmF0aW9uXHJcbiAgICBHQU1FX1NUQVRFOiBPYmplY3QuZnJlZXplKHtcdFxyXG5cdFx0Qk9BUkRfVklFVzogMCxcclxuXHRcdEZPQ1VTX1ZJRVc6IDFcclxuXHR9KSxcclxuICAgIFxyXG4gICAgaW5pdCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vdGhpcy5kZWJ1Z0xpbmUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZGVidWdMaW5lJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdjYW52YXMnKTtcclxuICAgICAgICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICAgICAgdGhpcy5jYW52YXMud2lkdGggPSB0aGlzLmNhbnZhcy5vZmZzZXRXaWR0aDtcclxuICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmNhbnZhcy5vZmZzZXRIZWlnaHQ7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5tb3VzZVBvc2l0aW9uID0gbmV3IGFwcC5wb2ludCh0aGlzLmNhbnZhcy53aWR0aC8yLCB0aGlzLmNhbnZhcy5oZWlnaHQvMik7XHJcbiAgICAgICAgdGhpcy5sYXN0TW91c2VQb3NpdGlvbiA9IHRoaXMubW91c2VQb3NpdGlvbjtcclxuICAgICAgICB0aGlzLnJlbGF0aXZlTW91c2VQb3NpdGlvbiA9IHRoaXMubW91c2VQb3NpdGlvbjtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmhlYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2hlYWRlcicpO1xyXG4gICAgICAgIHRoaXMuYWN0aXZlSGVpZ2h0ID0gdGhpcy5jYW52YXMuaGVpZ2h0IC0gdGhpcy5oZWFkZXIub2Zmc2V0SGVpZ2h0O1xyXG4gICAgICAgIHRoaXMuY2VudGVyID0gbmV3IGFwcC5wb2ludCh0aGlzLmNhbnZhcy53aWR0aC8yLCB0aGlzLmFjdGl2ZUhlaWdodCAvIDIgKyB0aGlzLmhlYWRlci5vZmZzZXRIZWlnaHQpO1xyXG4gICAgICAgIC8vZ2V0IGxpc3R2IG9mIG5vZGVzIGZyb20gZGF0YVxyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciB0ZW1wTGVzc29uTm9kZUFycmF5ID0gW107XHJcbiAgICAgICAgdGVtcExlc3Nvbk5vZGVBcnJheS5wdXNoKG5ldyBhcHAubGVzc29uTm9kZShuZXcgYXBwLnBvaW50KDAsMCkpKTtcclxuICAgICAgICB0ZW1wTGVzc29uTm9kZUFycmF5LnB1c2gobmV3IGFwcC5sZXNzb25Ob2RlKG5ldyBhcHAucG9pbnQoMzAwLDMwMCkpKTtcclxuICAgICAgICB0ZW1wTGVzc29uTm9kZUFycmF5LnB1c2gobmV3IGFwcC5sZXNzb25Ob2RlKG5ldyBhcHAucG9pbnQoMzAwLC0zMDApKSk7XHJcbiAgICAgICAgdGhpcy5ib2FyZCA9IG5ldyBhcHAuYm9hcmQobmV3IGFwcC5wb2ludCgwLDApLCB0ZW1wTGVzc29uTm9kZUFycmF5KTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmRyYWdnaW5nID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5jdXJzb3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm15UFwiKTtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgdGVzdGV0ZXN0ID0gdGhpcy5kYXRhT2JqZWN0LmluZm9BcnJheTtcclxuICAgICAgICBcclxuICAgICAgICAvL2Rlbm90ZXMgZ2FtZXBsYXkgc3RhdGVcclxuICAgICAgICB0aGlzLmdhbWVfc3RhdGUgPSB0aGlzLkdBTUVfU1RBVEUuQk9BUkRfVklFVztcclxuICAgICAgICBcclxuICAgICAgICAvL2Nvbm5lY3RpbmcgZXZlbnRzXHJcbiAgICAgICAgdGhpcy5jYW52YXMub25tb3VzZW1vdmUgPSB0aGlzLmdldE1vdXNlUG9zaXRpb24uYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLmNhbnZhcy5vbm1vdXNlZG93biA9IHRoaXMuZG9Nb3VzZURvd24uYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLmNhbnZhcy5vbm1vdXNldXAgPSB0aGlzLmRvTW91c2VVcC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXdoZWVsXCIsIHRoaXMuZG9XaGVlbC5iaW5kKHRoaXMpKTtcclxuICAgICAgICBcclxuICAgICAgICAvL3N0YXJ0IHRoZSBsb29wXHJcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuICAgIH0sXHJcbiAgICBcclxuICAgIC8vbG9vcCBmdW5jdGlvbnNcclxuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy9jYWxsIHRoZSBsb29wXHJcbiAgICAgICAgdGhpcy5hbmltYXRpb25JRCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpKTtcclxuICAgICAgICBcclxuICAgICAgICAvL2NhbGN1bGF0ZSBkZWx0YSB0aW1lXHJcbiAgICAgICAgdmFyIGR0ID0gdGhpcy5jYWxjdWxhdGVEZWx0YVRpbWUoKTtcclxuICAgICAgICBcclxuICAgICAgICAvL2NsZWFyIHRoZSBjYW52YXNcclxuICAgICAgICB0aGlzLmRyYXdMaWIuY2xlYXIodGhpcy5jdHgsMCwwLHRoaXMuY2FudmFzLm9mZnNldFdpZHRoLHRoaXMuY2FudmFzLm9mZnNldEhlaWdodCk7XHJcbiAgICAgICAgdGhpcy5kcmF3TGliLnJlY3QodGhpcy5jdHgsIDAsIDAsIHRoaXMuY2FudmFzLm9mZnNldFdpZHRoLCB0aGlzLmNhbnZhcy5vZmZzZXRIZWlnaHQsIFwiV2hpdGVcIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy91cGRhdGVcclxuICAgICAgICBpZih0aGlzLmdhbWVfc3RhdGUgPT0gdGhpcy5HQU1FX1NUQVRFLkJPQVJEX1ZJRVcpe1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy9kcmF3IGdhbWUgc2NyZWVuXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLmJvYXJkQ29sbGlzaW9uSGFuZGxpbmcoKTtcclxuICAgICAgICAgICAgdGhpcy5ib2FyZC5kcmF3KHRoaXMuY3R4LCB0aGlzLmNlbnRlciwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuYWN0aXZlSGVpZ2h0KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuZHJhd0xpYi5jaXJjbGUodGhpcy5jdHgsIHRoaXMubW91c2VQb3NpdGlvbi54LCB0aGlzLm1vdXNlUG9zaXRpb24ueSwgMTAsIFwiUm95YWxCbHVlXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKHRoaXMuZ2FtZV9zdGF0ZSA9PSB0aGlzLkdBTUVfU1RBVEUuVElUTEUpe1xyXG4gICAgICAgICAgICAvL2RyYXcgdGl0bGUgc2NyZWVuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vY3Vyc29yIGhhbmRsaW5nXHJcbiAgICAgICAgdGhpcy5jdXJzb3JIYW5kbGVyKCk7XHJcbiAgICAgICAgdGhpcy5kZWJ1Z0h1ZCh0aGlzLmN0eCwgZHQpO1xyXG4gICAgfSxcclxuICAgIFxyXG4gICAgY2FsY3VsYXRlRGVsdGFUaW1lOiBmdW5jdGlvbigpe1xyXG5cdFx0dmFyIG5vdztcclxuICAgICAgICB2YXIgZnBzO1xyXG5cdFx0bm93ID0gKCsgbmV3IERhdGUpOyBcclxuXHRcdGZwcyA9IDEwMDAgLyAobm93IC0gdGhpcy5sYXN0VGltZSk7XHJcblx0XHRmcHMgPSBhcHAudXRpbGl0aWVzLmNsYW1wKGZwcywgMTIsIDYwKTtcclxuXHRcdHRoaXMubGFzdFRpbWUgPSBub3c7IFxyXG5cdFx0cmV0dXJuIDEvZnBzO1xyXG5cdH0sXHJcbiAgICBcclxuICAgIC8vaGVscGVyIGV2ZW50IGZ1bmN0aW9uc1xyXG4gICAgZ2V0TW91c2VQb3NpdGlvbjogZnVuY3Rpb24oZSl7XHJcblx0XHR0aGlzLmxhc3RNb3VzZVBvc2l0aW9uID0gdGhpcy5tb3VzZVBvc2l0aW9uO1xyXG4gICAgICAgIHRoaXMubW91c2VQb3NpdGlvbiA9IGFwcC51dGlsaXRpZXMuZ2V0TW91c2UoZSwgdGhpcy5jYW52YXMub2Zmc2V0V2lkdGgsIHRoaXMuY2FudmFzLm9mZnNldEhlaWdodCk7XHJcbiAgICAgICAgdGhpcy5yZWxhdGl2ZU1vdXNlUG9zaXRpb24gPSBuZXcgYXBwLnBvaW50KHRoaXMubW91c2VQb3NpdGlvbi54IC0gdGhpcy5jYW52YXMud2lkdGgvMiArIHRoaXMuYm9hcmQucG9zaXRpb24ueCwgdGhpcy5tb3VzZVBvc2l0aW9uLnkgLSB0aGlzLmFjdGl2ZUhlaWdodC8yICsgdGhpcy5ib2FyZC5wb3NpdGlvbi55IC0gdGhpcy5oZWFkZXIub2Zmc2V0SGVpZ2h0KTtcclxuICAgICAgICBcclxuICAgICAgICBpZih0aGlzLmRyYWdnaW5nKXtcclxuICAgICAgICAgICAgLy90aGUgcG9zaXRpb25hbCBkaWZmZXJlbmNlIGJldHdlZW4gbGFzdCBsb29wIGFuZCB0aGlzXHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmQubW92ZSh0aGlzLmxhc3RNb3VzZVBvc2l0aW9uLnggLSB0aGlzLm1vdXNlUG9zaXRpb24ueCwgdGhpcy5sYXN0TW91c2VQb3NpdGlvbi55IC0gdGhpcy5tb3VzZVBvc2l0aW9uLnkpO1xyXG4gICAgICAgIH1cclxuXHR9LFxyXG4gICAgZG9Nb3VzZURvd24gOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZyA9IHRydWU7XHJcbiAgICB9LFxyXG4gICAgZG9Nb3VzZVVwIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcgPSBmYWxzZTtcclxuICAgIH0sXHJcbiAgICBkb1doZWVsIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIHRoaXMuYm9hcmQuem9vbSh0aGlzLmN0eCwgdGhpcy5jZW50ZXIsIGUuZGVsdGFZKTtcclxuICAgIH0sXHJcbiAgICBcclxuICAgIGN1cnNvckhhbmRsZXIgOiBmdW5jdGlvbigpe1xyXG4gICAgICAgIC8vaXMgaXQgaG92ZXJpbmcgb3ZlciB0aGUgY2FudmFzP1xyXG4gICAgICAgIC8vaXMgaXQgZHJhZ2dpbmc/XHJcbiAgICAgICAgaWYodGhpcy5kcmFnZ2luZyl7XHJcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLmN1cnNvciA9IFwiLXdlYmtpdC1ncmFiYmluZ1wiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS5jdXJzb3IgPSBcImRlZmF1bHRcIjtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICBib2FyZENvbGxpc2lvbkhhbmRsaW5nIDogZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgYWN0aXZlTm9kZTtcclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5ib2FyZC5sZXNzb25Ob2RlQXJyYXkubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgICAgICBhY3RpdmVOb2RlID0gdGhpcy5ib2FyZC5sZXNzb25Ob2RlQXJyYXlbaV07XHJcbiAgICAgICAgICAgIGlmKHRoaXMucmVsYXRpdmVNb3VzZVBvc2l0aW9uLnggPiBhY3RpdmVOb2RlLnBvc2l0aW9uLnggLSBhY3RpdmVOb2RlLndpZHRoLzIgJiYgdGhpcy5yZWxhdGl2ZU1vdXNlUG9zaXRpb24ueCA8IGFjdGl2ZU5vZGUucG9zaXRpb24ueCArIGFjdGl2ZU5vZGUud2lkdGgvMil7XHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLnJlbGF0aXZlTW91c2VQb3NpdGlvbi55ID4gYWN0aXZlTm9kZS5wb3NpdGlvbi55IC0gYWN0aXZlTm9kZS5oZWlnaHQvMiAmJiB0aGlzLnJlbGF0aXZlTW91c2VQb3NpdGlvbi55IDwgYWN0aXZlTm9kZS5wb3NpdGlvbi55ICsgYWN0aXZlTm9kZS5oZWlnaHQvMil7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlTm9kZS5ib2FyZEJ1dHRvbi5ob3ZlcmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlTm9kZS5ib2FyZEJ1dHRvbi5ob3ZlcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgIGFjdGl2ZU5vZGUuYm9hcmRCdXR0b24uaG92ZXJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFxyXG4gICAgLy9kZWJ1Z1xyXG4gICAgZGVidWdIdWQ6IGZ1bmN0aW9uKGN0eCwgZHQpIHtcclxuICAgICAgICBjdHguc2F2ZSgpO1xyXG4gICAgICAgIHRoaXMuZmlsbFRleHQoY3R4LCBcIm1vdXNlUG9zaXRpb246IFwiICsgdGhpcy5tb3VzZVBvc2l0aW9uLnggKyBcIiwgXCIgKyB0aGlzLm1vdXNlUG9zaXRpb24ueSwgNTAsIHRoaXMuY2FudmFzLmhlaWdodCAtIDEwLCBcIjEycHQgb3N3YWxkXCIsIFwiQmxhY2tcIik7XHJcbiAgICAgICAgdGhpcy5maWxsVGV4dChjdHgsXCJSZWxNb3VzZVBvc2l0aW9uOiBcIit0aGlzLnJlbGF0aXZlTW91c2VQb3NpdGlvbi54ICsgXCIsIFwiICsgdGhpcy5yZWxhdGl2ZU1vdXNlUG9zaXRpb24ueSwgdGhpcy5jYW52YXMud2lkdGgvMiwgdGhpcy5jYW52YXMuaGVpZ2h0IC0gMTAsXCIxMnB0IG9zd2FsZFwiLFwiQmxhY2tcIik7XHJcbiAgICAgICAgdGhpcy5maWxsVGV4dChjdHgsIFwiZHQ6IFwiICsgZHQudG9GaXhlZCgzKSwgdGhpcy5jYW52YXMud2lkdGggLSAxNTAsIHRoaXMuY2FudmFzLmhlaWdodCAtIDEwLCBcIjEycHQgb3N3YWxkXCIsIFwiYmxhY2tcIik7XHJcbiAgICAgICAgdGhpcy5kcmF3TGliLmxpbmUoY3R4LCB0aGlzLmNlbnRlci54LCB0aGlzLmNlbnRlci55IC0gdGhpcy5hY3RpdmVIZWlnaHQvMiwgdGhpcy5jZW50ZXIueCwgdGhpcy5jZW50ZXIueSArIHRoaXMuYWN0aXZlSGVpZ2h0LzIsIDIsIFwiTGlnaHRncmF5XCIpO1xyXG4gICAgICAgIHRoaXMuZHJhd0xpYi5saW5lKGN0eCwgMCwgdGhpcy5jZW50ZXIueSwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2VudGVyLnksIDIsIFwiTGlnaHRncmF5XCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuZmlsbFRleHQoY3R4LCB0aGlzLmJvYXJkLmxlc3Nvbk5vZGVBcnJheVswXS5ib2FyZEJ1dHRvbi5ob3ZlcmVkLCB0aGlzLmNhbnZhcy53aWR0aC8yLCB0aGlzLmNhbnZhcy5oZWlnaHQgLSAzMCwgXCIxMnB0IG9zd2FsZFwiLCBcImJsYWNrXCIpO1xyXG4gICAgICAgIHRoaXMuZmlsbFRleHQoY3R4LCB0aGlzLmJvYXJkLmxlc3Nvbk5vZGVBcnJheVsxXS5ib2FyZEJ1dHRvbi5ob3ZlcmVkLCB0aGlzLmNhbnZhcy53aWR0aC8yLCB0aGlzLmNhbnZhcy5oZWlnaHQgLSA1MCwgXCIxMnB0IG9zd2FsZFwiLCBcImJsYWNrXCIpO1xyXG4gICAgICAgIHRoaXMuZmlsbFRleHQoY3R4LCB0aGlzLmJvYXJkLmxlc3Nvbk5vZGVBcnJheVsyXS5ib2FyZEJ1dHRvbi5ob3ZlcmVkLCB0aGlzLmNhbnZhcy53aWR0aC8yLCB0aGlzLmNhbnZhcy5oZWlnaHQgLSA3MCwgXCIxMnB0IG9zd2FsZFwiLCBcImJsYWNrXCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGN0eC5yZXN0b3JlKCk7XHJcbiAgICB9LFxyXG4gICAgZmlsbFRleHQ6IGZ1bmN0aW9uKGN0eCwgc3RyaW5nLCB4LCB5LCBjc3MsIGNvbG9yKSB7XHJcblx0XHRjdHguc2F2ZSgpO1xyXG5cdFx0Ly8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQ1NTL2ZvbnRcclxuXHRcdHRoaXMuY3R4LmZvbnQgPSBjc3M7XHJcblx0XHR0aGlzLmN0eC5maWxsU3R5bGUgPSBjb2xvcjtcclxuXHRcdHRoaXMuY3R4LmZpbGxUZXh0KHN0cmluZywgeCwgeSk7XHJcblx0XHRjdHgucmVzdG9yZSgpO1xyXG5cdH0sXHJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vL3BhcmFtZXRlciBpcyBhIHBvaW50IHRoYXQgZGVub3RlcyBzdGFydGluZyBwb3NpdGlvblxyXG5mdW5jdGlvbiBib2FyZChzdGFydFBvc2l0aW9uLCBsZXNzb25Ob2Rlcyl7XHJcbiAgICB0aGlzLnBvc2l0aW9uID0gc3RhcnRQb3NpdGlvbjtcclxuICAgIHRoaXMubGVzc29uTm9kZUFycmF5ID0gbGVzc29uTm9kZXM7XHJcbn1cclxuXHJcbmJvYXJkLmRyYXdMaWIgPSB1bmRlZmluZWQ7XHJcblxyXG4vL2hlbHBlclxyXG5mdW5jdGlvbiBjYWxjdWxhdGVCb3VuZHMoKXtcclxuICAgIGlmKHRoaXMubGVzc29uTm9kZUFycmF5Lmxlbmd0aCA+IDApe1xyXG4gICAgICAgIHRoaXMuYm91bmRMZWZ0ID0gdGhpcy5sZXNzb25Ob2RlQXJyYXlbMF0ucG9zaXRpb24ueDtcclxuICAgICAgICB0aGlzLmJvdW5kUmlnaHQgPSB0aGlzLmxlc3Nvbk5vZGVBcnJheVswXS5wb3NpdGlvbi54O1xyXG4gICAgICAgIHRoaXMuYm91bmRUb3AgPSB0aGlzLmxlc3Nvbk5vZGVBcnJheVswXS5wb3NpdGlvbi55O1xyXG4gICAgICAgIHRoaXMuYm91bmRCb3R0b20gPSB0aGlzLmxlc3Nvbk5vZGVBcnJheVswXS5wb3NpdGlvbi55O1xyXG4gICAgICAgIGZvcih2YXIgaSA9IDE7IGkgPCB0aGlzLmxlc3Nvbk5vZGVBcnJheS5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuYm91bmRMZWZ0ID4gdGhpcy5sZXNzb25Ob2RlQXJyYXlbaV0ucG9zaXRpb24ueCl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvdW5kTGVmdCA9IHRoaXMubGVzc29uTm9kZUFycmF5W2ldLnBvc2l0aW9uLng7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZih0aGlzLmJvdW5kUmlnaHQgPCB0aGlzLmxlc3Nvbk5vZGVBcnJheVtpXS5wb3NpdGlvbi54KXtcclxuICAgICAgICAgICAgICAgIHRoaXMuYm91bmRSaWdodCA+IHRoaXMubGVzc29uTm9kZUFycmF5W2ldLnBvc2l0aW9uLng7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYodGhpcy5ib3VuZFRvcCA+IHRoaXMubGVzc29uTm9kZUFycmF5W2ldLnBvc2l0aW9uLnkpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib3VuZFRvcCA9IHRoaXMubGVzc29uTm9kZUFycmF5W2ldLnBvc2l0aW9uLnk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZih0aGlzLmJvdW5kQm90dG9tIDwgdGhpcy5sZXNzb25Ob2RlQXJyYXlbaV0ucG9zaXRpb24ueSl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvdW5kQm90dG9tID0gdGhpcy5sZXNzb25Ob2RlQXJyYXlbaV0ucG9zaXRpb24ueTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuXHJcbi8vcHJvdG90eXBlXHJcbnZhciBwID0gYm9hcmQucHJvdG90eXBlO1xyXG5cclxucC5tb3ZlID0gZnVuY3Rpb24ocFgsIHBZKXtcclxuICAgIHRoaXMucG9zaXRpb24ueCArPSBwWDtcclxuICAgIHRoaXMucG9zaXRpb24ueSArPSBwWTtcclxufTtcclxuXHJcbnAuZHJhdyA9IGZ1bmN0aW9uKGN0eCwgY2VudGVyLCBhY3RpdmVIZWlnaHQpe1xyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIC8vdHJhbnNsYXRlIHRvIHRoZSBjZW50ZXIgb2YgdGhlIHNjcmVlblxyXG4gICAgY3R4LnRyYW5zbGF0ZShjZW50ZXIueCAtIHRoaXMucG9zaXRpb24ueCwgY2VudGVyLnkgLSB0aGlzLnBvc2l0aW9uLnkpO1xyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMubGVzc29uTm9kZUFycmF5Lmxlbmd0aDsgaSsrKXtcclxuICAgICAgICB0aGlzLmxlc3Nvbk5vZGVBcnJheVtpXS5kcmF3KGN0eCk7XHJcbiAgICB9XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBib2FyZDtcclxuXHJcbi8vdGhpcyBpcyBhbiBvYmplY3QgbmFtZWQgQm9hcmQgYW5kIHRoaXMgaXMgaXRzIGphdmFzY3JpcHRcclxuLy92YXIgQm9hcmQgPSByZXF1aXJlKCcuL29iamVjdHMvYm9hcmQuanMnKTtcclxuLy92YXIgYiA9IG5ldyBCb2FyZCgpO1xyXG4gICAgIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBwb3NpdGlvbjtcclxudmFyIHdpZHRoO1xyXG52YXIgaGVpZ2h0O1xyXG52YXIgY2xpY2tlZDtcclxudmFyIGhvdmVyZWQ7XHJcblxyXG4vL3BhcmFtZXRlciBpcyBhIHBvaW50IHRoYXQgZGVub3RlcyBzdGFydGluZyBwb3NpdGlvblxyXG5mdW5jdGlvbiBidXR0b24oc3RhcnRQb3NpdGlvbiwgd2lkdGgsIGhlaWdodCl7XHJcbiAgICB0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XHJcbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XHJcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcclxuICAgIHRoaXMuY2xpY2tlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5ob3ZlcmVkID0gZmFsc2U7XHJcbn1cclxuYnV0dG9uLmRyYXdMaWIgPSB1bmRlZmluZWQ7XHJcblxyXG52YXIgcCA9IGJ1dHRvbi5wcm90b3R5cGU7XHJcblxyXG5wLmRyYXcgPSBmdW5jdGlvbihjdHgpe1xyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIHZhciBjb2w7XHJcbiAgICBpZih0aGlzLmhvdmVyZWQpe1xyXG4gICAgICAgIGNvbCA9IFwiZG9kZ2VyYmx1ZVwiO1xyXG4gICAgfVxyXG4gICAgZWxzZXtcclxuICAgICAgICBjb2wgPSBcImxpZ2h0Ymx1ZVwiO1xyXG4gICAgfVxyXG4gICAgLy9kcmF3IHJvdW5kZWQgY29udGFpbmVyXHJcbiAgICBib2FyZEJ1dHRvbi5kcmF3TGliLnJlY3QoY3R4LCB0aGlzLnBvc2l0aW9uLnggLSB0aGlzLndpZHRoLzIsIHRoaXMucG9zaXRpb24ueSAtIHRoaXMuaGVpZ2h0LzIsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCBjb2wpO1xyXG5cclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGJ1dHRvbjsiLCJcInVzZSBzdHJpY3RcIjtcclxuLy90aGUganNvbiBpcyBsb2NhbCwgbm8gbmVlZCBmb3IgeGhyIHdoZW4gdXNpbmcgdGhpcyBtb2R1bGUgcGF0dGVyblxyXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL2RhdGEvbGVzc29ucy5qc29uJyk7XHJcbi8qXHJcbnZhciB4aHIgPSByZXF1aXJlKCd4aHInKTtcclxuXHJcbnZhciBhcHAgPSBhcHAgfHwge307XHJcblxyXG52YXIgaW5mb0FycmF5ID0gdW5kZWZpbmVkO1xyXG5cclxueGhyKHtcclxuICAgIHVyaTogXCJkYXRhL2xlc3NvbnMuanNvblwiLFxyXG4gICAgaGVhZGVyczoge1xyXG4gICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgIFwiSWYtTW9kaWZpZWQtU2luY2VcIjogXCJTYXQsIDEgSmFuIDIwMTAgMDA6MDA6MDAgR01UXCJcclxuICAgIH1cclxufSwgZnVuY3Rpb24gKGVyciwgcmVzcCwgYm9keSkge1xyXG4gICAgdmFyIG15SlNPTiA9IEpTT04ucGFyc2UoYm9keSk7XHJcbiAgICBpbmZvQXJyYXkgPSBteUpTT04ubGVzc29ucztcclxufSk7XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBpbmZvQXJyYXk7XHJcbiovIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmZ1bmN0aW9uIGRyYXdMaWIoKXtcclxuICAgIFxyXG59XHJcblxyXG52YXIgcCA9IGRyYXdMaWIucHJvdG90eXBlO1xyXG5cclxucC5jbGVhciA9IGZ1bmN0aW9uKGN0eCwgeCwgeSwgdywgaCkge1xyXG4gICAgY3R4LmNsZWFyUmVjdCh4LCB5LCB3LCBoKTtcclxufVxyXG5cclxucC5yZWN0ID0gZnVuY3Rpb24oY3R4LCB4LCB5LCB3LCBoLCBjb2wpIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gY29sO1xyXG4gICAgY3R4LmZpbGxSZWN0KHgsIHksIHcsIGgpO1xyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxufVxyXG5cclxucC5saW5lID0gZnVuY3Rpb24oY3R4LCB4MSwgeTEsIHgyLCB5MiwgdGhpY2tuZXNzLCBjb2xvcikge1xyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIGN0eC5tb3ZlVG8oeDEsIHkxKTtcclxuICAgIGN0eC5saW5lVG8oeDIsIHkyKTtcclxuICAgIGN0eC5saW5lV2lkdGggPSB0aGlja25lc3M7XHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBjb2xvcjtcclxuICAgIGN0eC5zdHJva2UoKTtcclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbn1cclxuXHJcbnAuY2lyY2xlID0gZnVuY3Rpb24oY3R4LCB4LCB5LCByYWRpdXMsIGNvbG9yKXtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHguYXJjKHgseSwgcmFkaXVzLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IGNvbG9yO1xyXG4gICAgY3R4LmZpbGwoKTtcclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGJvYXJkQnV0dG9uKGN0eCwgcG9zaXRpb24sIHdpZHRoLCBoZWlnaHQsIGhvdmVyZWQpe1xyXG4gICAgLy9jdHguc2F2ZSgpO1xyXG4gICAgaWYoaG92ZXJlZCl7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwiZG9kZ2VyYmx1ZVwiO1xyXG4gICAgfVxyXG4gICAgZWxzZXtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJsaWdodGJsdWVcIjtcclxuICAgIH1cclxuICAgIC8vZHJhdyByb3VuZGVkIGNvbnRhaW5lclxyXG4gICAgY3R4LnJlY3QocG9zaXRpb24ueCAtIHdpZHRoLzIsIHBvc2l0aW9uLnkgLSBoZWlnaHQvMiwgd2lkdGgsIGhlaWdodCk7XHJcbiAgICBjdHgubGluZVdpZHRoID0gNTtcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9IFwiYmxhY2tcIjtcclxuICAgIGN0eC5zdHJva2UoKTtcclxuICAgIGN0eC5maWxsKCk7XHJcbiAgICAvL2N0eC5yZXN0b3JlKCk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZHJhd0xpYjsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIEJvYXJkID0gcmVxdWlyZSgnLi9ib2FyZC5qcycpO1xyXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuL3BvaW50LmpzJyk7XHJcbnZhciBEcmF3TGliID0gcmVxdWlyZSgnLi9kcmF3TGliLmpzJyk7XHJcbnZhciBMZXNzb25Ob2RlID0gcmVxdWlyZSgnLi9sZXNzb25Ob2RlLmpzJyk7XHJcbnZhciBVdGlsaXRpZXMgPSByZXF1aXJlKCcuL3V0aWxpdGllcy5qcycpO1xyXG5cclxudmFyIGJvYXJkQXJyYXk7XHJcbnZhciBhY3RpdmVCb2FyZEluZGV4O1xyXG52YXIgcGFpbnRlcjtcclxuXHJcbnZhciBtb3VzZVN0YXRlO1xyXG52YXIgcHJldmlvdXNNb3VzZVN0YXRlO1xyXG5cclxuZnVuY3Rpb24gZ2FtZSgpe1xyXG4gICAgcGFpbnRlciA9IG5ldyBEcmF3TGliKCk7XHJcbiAgICBcclxuICAgIGFjdGl2ZUJvYXJkSW5kZXggPSAwO1xyXG4gICAgXHJcbiAgICB2YXIgdGVzdExlc3Nvbk5vZGVBcnJheSA9IFtdO1xyXG4gICAgdGVzdExlc3Nvbk5vZGVBcnJheS5wdXNoKG5ldyBMZXNzb25Ob2RlKG5ldyBQb2ludCgwLDApLCBcImltYWdlcy9kb2cucG5nXCIpKTtcclxuICAgIFxyXG4gICAgYm9hcmRBcnJheSA9IFtdO1xyXG4gICAgYm9hcmRBcnJheS5wdXNoKG5ldyBCb2FyZChuZXcgUG9pbnQoMCwwKSwgdGVzdExlc3Nvbk5vZGVBcnJheSkpO1xyXG4gICAgXHJcbiAgICBcclxufVxyXG5cclxudmFyIHAgPSBnYW1lLnByb3RvdHlwZTtcclxuXHJcbnAudXBkYXRlID0gZnVuY3Rpb24oY3R4LCBjYW52YXMsIGR0LCBjZW50ZXIsIGFjdGl2ZUhlaWdodCwgcE1vdXNlU3RhdGUpe1xyXG4gICAgLy91cGRhdGUgc3R1ZmZcclxuICAgIHAuYWN0KHBNb3VzZVN0YXRlKTtcclxuICAgIC8vZHJhdyBzdHVmZlxyXG4gICAgcC5kcmF3KGN0eCwgY2FudmFzLCBjZW50ZXIsIGFjdGl2ZUhlaWdodCk7XHJcbn1cclxuXHJcbnAuYWN0ID0gZnVuY3Rpb24ocE1vdXNlU3RhdGUpe1xyXG4gICAgcHJldmlvdXNNb3VzZVN0YXRlID0gbW91c2VTdGF0ZTtcclxuICAgIG1vdXNlU3RhdGUgPSBwTW91c2VTdGF0ZTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNkZWJ1Z0xpbmUnKS5pbm5lckhUTUwgPSBcIm1vdXNlUG9zaXRpb246IHggPSBcIiArIG1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbi54ICsgXCIsIHkgPSBcIiArIG1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbi55ICsgXHJcbiAgICBcIjxicj5DbGlja2VkID0gXCIgKyBtb3VzZVN0YXRlLm1vdXNlRG93biArIFxyXG4gICAgXCI8YnI+T3ZlciBDYW52YXMgPSBcIiArIG1vdXNlU3RhdGUubW91c2VJbjtcclxuICAgIFxyXG4gICAgLy9jb2xsaXNpb24gZGV0ZWN0aW9uLCBpdGVyYXRlIHRocm91Z2ggZWFjaCBub2RlIGluIHRoZSBhY3RpdmUgYm9hcmRcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBib2FyZEFycmF5W2FjdGl2ZUJvYXJkSW5kZXhdLmxlc3Nvbk5vZGVBcnJheS5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgdmFyIHRhcmdldExlc3Nvbk5vZGUgPSBib2FyZEFycmF5W2FjdGl2ZUJvYXJkSW5kZXhdLmxlc3Nvbk5vZGVBcnJheVtpXTtcclxuICAgICAgICBtb3VzZUludGVyc2VjdCh0YXJnZXRMZXNzb25Ob2RlLCBib2FyZEFycmF5W2FjdGl2ZUJvYXJkSW5kZXhdLnBvc2l0aW9uLCB0YXJnZXRMZXNzb25Ob2RlLnNjYWxlRmFjdG9yKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgXHJcbiAgICAvL21vdmluZyB0aGUgYm9hcmRcclxuICAgIGlmKG1vdXNlU3RhdGUubW91c2VEb3duID09IHRydWUpe1xyXG4gICAgICAgIGJvYXJkQXJyYXlbYWN0aXZlQm9hcmRJbmRleF0ubW92ZShwcmV2aW91c01vdXNlU3RhdGUucG9zaXRpb24ueCAtIG1vdXNlU3RhdGUucG9zaXRpb24ueCwgcHJldmlvdXNNb3VzZVN0YXRlLnBvc2l0aW9uLnkgLSBtb3VzZVN0YXRlLnBvc2l0aW9uLnkpO1xyXG4gICAgfVxyXG59XHJcblxyXG5wLmRyYXcgPSBmdW5jdGlvbihjdHgsIGNhbnZhcywgY2VudGVyLCBhY3RpdmVIZWlnaHQpe1xyXG4gICAgLy9kcmF3IGJvYXJkXHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgcGFpbnRlci5jbGVhcihjdHgsIDAsIDAsIGNhbnZhcy5vZmZzZXRXaWR0aCwgY2FudmFzLm9mZnNldEhlaWdodCk7XHJcbiAgICBwYWludGVyLnJlY3QoY3R4LCAwLCAwLCBjYW52YXMub2Zmc2V0V2lkdGgsIGNhbnZhcy5vZmZzZXRIZWlnaHQsIFwid2hpdGVcIik7XHJcbiAgICBwYWludGVyLmxpbmUoY3R4LCBjYW52YXMub2Zmc2V0V2lkdGgvMiwgY2VudGVyLnkgLSBhY3RpdmVIZWlnaHQvMiwgY2FudmFzLm9mZnNldFdpZHRoLzIsIGNhbnZhcy5vZmZzZXRIZWlnaHQsIDIsIFwibGlnaHRncmF5XCIpO1xyXG4gICAgcGFpbnRlci5saW5lKGN0eCwgMCwgY2VudGVyLnksIGNhbnZhcy5vZmZzZXRXaWR0aCwgY2VudGVyLnksIDIsIFwibGlnaHRHcmF5XCIpO1xyXG4gICAgXHJcbiAgICAvL2RyYXdpbmcgbGVzc29uIG5vZGVzXHJcbiAgICBib2FyZEFycmF5WzBdLmRyYXcoY3R4LCBjZW50ZXIsIGFjdGl2ZUhlaWdodCk7XHJcbiAgICBcclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZ2FtZTtcclxuXHJcbi8vcEVsZW1lbnQgaXMgdGhlIG9iamVjdCBvbiB0aGUgY2FudmFzIHRoYXQgaXMgYmVpbmcgY2hlY2tlZCBhZ2FpbnN0IHRoZSBtb3VzZSwgcE9mZnNldGVyIHdpbGwgbW9zdCBsaWtlbHkgYmUgdGhlIGJvYXJkIHNvIHdlIGNhbiBzdWJ0cmFjdCBwb3NpdGlvbiBvciB3aGF0ZXZlciBpdCBuZWVkcyB0byByZW1haW4gYWxpZ25lZFxyXG5mdW5jdGlvbiBtb3VzZUludGVyc2VjdChwRWxlbWVudCwgcE9mZnNldHRlciwgcFNjYWxlKXtcclxuICAgIGlmKG1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbi54ICsgcE9mZnNldHRlci54ID4gKHBFbGVtZW50LnBvc2l0aW9uLnggLSAocFNjYWxlKnBFbGVtZW50LndpZHRoKS8yKSAmJiBtb3VzZVN0YXRlLnJlbGF0aXZlUG9zaXRpb24ueCArIHBPZmZzZXR0ZXIueCA8IChwRWxlbWVudC5wb3NpdGlvbi54ICsgKHBTY2FsZSpwRWxlbWVudC53aWR0aCkvMikpe1xyXG4gICAgICAgIGlmKG1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbi55ICsgcE9mZnNldHRlci55ID4gKHBFbGVtZW50LnBvc2l0aW9uLnkgLSAocFNjYWxlKnBFbGVtZW50LmhlaWdodCkvMikgJiYgbW91c2VTdGF0ZS5yZWxhdGl2ZVBvc2l0aW9uLnkgKyBwT2Zmc2V0dGVyLnkgPCAocEVsZW1lbnQucG9zaXRpb24ueSArIChwU2NhbGUqcEVsZW1lbnQuaGVpZ2h0KS8yKSl7XHJcbiAgICAgICAgICAgIHBFbGVtZW50Lm1vdXNlT3ZlciA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIHBFbGVtZW50Lm1vdXNlT3ZlciA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2V7XHJcbiAgICAgICAgcEVsZW1lbnQubW91c2VPdmVyID0gZmFsc2U7XHJcbiAgICB9XHJcbn0iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBwb3NpdGlvbjtcclxudmFyIHdpZHRoO1xyXG52YXIgaGVpZ2h0O1xyXG52YXIgaW1hZ2U7XHJcbnZhciBzY2FsZUZhY3RvcjtcclxuXHJcbi8vcGFyYW1ldGVyIGlzIGEgcG9pbnQgdGhhdCBkZW5vdGVzIHN0YXJ0aW5nIHBvc2l0aW9uXHJcbmZ1bmN0aW9uIGxlc3Nvbk5vZGUoc3RhcnRQb3NpdGlvbiwgaW1hZ2VQYXRoKXtcclxuICAgIHRoaXMucG9zaXRpb24gPSBzdGFydFBvc2l0aW9uO1xyXG4gICAgdGhpcy53aWR0aCA9IDEwMDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gMTAwO1xyXG4gICAgdGhpcy5tb3VzZU92ZXIgPSBmYWxzZTtcclxuICAgIHRoaXMuc2NhbGVGYWN0b3IgPSAxO1xyXG4gICAgXHJcbiAgICAvL2ltYWdlIGxvYWRpbmdcclxuICAgIHZhciB0ZW1wSW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuICAgIHRyeXtcclxuICAgICAgICB0ZW1wSW1hZ2Uuc3JjID0gaW1hZ2VQYXRoO1xyXG4gICAgICAgIGltYWdlID0gdGVtcEltYWdlO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICB0ZW1wSW1hZ2Uuc3JjID0gXCJpbWFnZXMvZG9nLnBuZ1wiO1xyXG4gICAgICAgIGltYWdlID0gdGVtcEltYWdlO1xyXG4gICAgfVxyXG59XHJcblxyXG5sZXNzb25Ob2RlLmRyYXdMaWIgPSB1bmRlZmluZWQ7XHJcblxyXG52YXIgcCA9IGxlc3Nvbk5vZGUucHJvdG90eXBlO1xyXG5cclxucC5kcmF3ID0gZnVuY3Rpb24oY3R4KXtcclxuICAgIC8vbGVzc29uTm9kZS5kcmF3TGliLmNpcmNsZShjdHgsIHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55LCAxMCwgXCJyZWRcIik7XHJcbiAgICAvL2RyYXcgdGhlIGltYWdlLCBzaGFkb3cgaWYgaG92ZXJlZFxyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIGlmKHRoaXMubW91c2VPdmVyKXtcclxuICAgICAgICAvL2N0eC5zaGFkb3dPZmZzZXRYID0gMTA7XHJcbiAgICAgICAgLy9jdHguc2hhZG93T2Zmc2V0WSA9IDEwO1xyXG4gICAgICAgIGN0eC5zaGFkb3dDb2xvciA9ICdibHVlJztcclxuICAgICAgICBjdHguc2hhZG93Qmx1ciA9IDMwO1xyXG4gICAgfVxyXG4gICAgY3R4LmRyYXdJbWFnZShpbWFnZSwgdGhpcy5wb3NpdGlvbi54IC0gKHRoaXMud2lkdGgqdGhpcy5zY2FsZUZhY3RvcikvMiwgdGhpcy5wb3NpdGlvbi55IC0gKHRoaXMuaGVpZ2h0KnRoaXMuc2NhbGVGYWN0b3IpLzIsIHRoaXMud2lkdGggKiB0aGlzLnNjYWxlRmFjdG9yLCB0aGlzLmhlaWdodCAqIHRoaXMuc2NhbGVGYWN0b3IpXHJcbiAgICBcclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGxlc3Nvbk5vZGU7IiwiLy9rZWVwcyB0cmFjayBvZiBtb3VzZSByZWxhdGVkIHZhcmlhYmxlcy5cclxuLy9jYWxjdWxhdGVkIGluIG1haW4gYW5kIHBhc3NlZCB0byBnYW1lXHJcbi8vY29udGFpbnMgdXAgc3RhdGVcclxuLy9wb3NpdGlvblxyXG4vL3JlbGF0aXZlIHBvc2l0aW9uXHJcbi8vb24gY2FudmFzXHJcblwidXNlIHN0cmljdFwiO1xyXG5mdW5jdGlvbiBtb3VzZVN0YXRlKHBQb3NpdGlvbiwgcFJlbGF0aXZlUG9zaXRpb24sIHBNb3VzZWRvd24sIHBNb3VzZUluKXtcclxuICAgIHRoaXMucG9zaXRpb24gPSBwUG9zaXRpb247XHJcbiAgICB0aGlzLnJlbGF0aXZlUG9zaXRpb24gPSBwUmVsYXRpdmVQb3NpdGlvbjtcclxuICAgIHRoaXMubW91c2VEb3duID0gcE1vdXNlZG93bjtcclxuICAgIHRoaXMubW91c2VJbiA9IHBNb3VzZUluO1xyXG59XHJcblxyXG52YXIgcCA9IG1vdXNlU3RhdGUucHJvdG90eXBlO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBtb3VzZVN0YXRlOyIsIlwidXNlIHN0cmljdFwiO1xyXG5mdW5jdGlvbiBwb2ludChwWCwgcFkpe1xyXG4gICAgdGhpcy54ID0gcFg7XHJcbiAgICB0aGlzLnkgPSBwWTtcclxufVxyXG5cclxudmFyIHAgPSBwb2ludC5wcm90b3R5cGU7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHBvaW50OyIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuL3BvaW50LmpzJyk7XHJcblxyXG5mdW5jdGlvbiB1dGlsaXRpZXMoKXtcclxufVxyXG5cclxudmFyIHAgPSB1dGlsaXRpZXMucHJvdG90eXBlO1xyXG4vLyByZXR1cm5zIG1vdXNlIHBvc2l0aW9uIGluIGxvY2FsIGNvb3JkaW5hdGUgc3lzdGVtIG9mIGVsZW1lbnRcclxucC5nZXRNb3VzZSA9IGZ1bmN0aW9uKGUpe1xyXG4gICAgLy9yZXR1cm4gbmV3IGFwcC5Qb2ludCgoZS5wYWdlWCAtIGUudGFyZ2V0Lm9mZnNldExlZnQpICogKGFwcC5tYWluLnJlbmRlcldpZHRoIC8gYWN0dWFsQ2FudmFzV2lkdGgpLCAoZS5wYWdlWSAtIGUudGFyZ2V0Lm9mZnNldFRvcCkgKiAoYXBwLm1haW4ucmVuZGVySGVpZ2h0IC8gYWN0dWFsQ2FudmFzSGVpZ2h0KSk7XHJcbiAgICByZXR1cm4gbmV3IFBvaW50KChlLnBhZ2VYIC0gZS50YXJnZXQub2Zmc2V0TGVmdCksIChlLnBhZ2VZIC0gZS50YXJnZXQub2Zmc2V0VG9wKSk7XHJcbn1cclxuXHJcbnAubWFwID0gZnVuY3Rpb24odmFsdWUsIG1pbjEsIG1heDEsIG1pbjIsIG1heDIpe1xyXG4gICAgLy9yZXR1cm4gbWluMiArIChtYXgyIC0gbWluMikgKiAoKHZhbHVlIC0gbWluMSkgLyAobWF4MSAtIG1pbjEpKTtcclxufVxyXG5cclxucC5jbGFtcCA9IGZ1bmN0aW9uKHZhbHVlLCBtaW4sIG1heCl7XHJcbiAgICAvL3JldHVybiBNYXRoLm1heChtaW4sIE1hdGgubWluKG1heCwgdmFsdWUpKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB1dGlsaXRpZXM7Il19
