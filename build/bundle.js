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
    testLessonNodeArray.push(new LessonNode(new Point(100,100), "images/goldDog.png"));
    
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
        this.image = tempImage;
    }
    catch (e) {
        tempImage.src = "images/dog.png";
        this.image = tempImage;
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
    ctx.drawImage(this.image, this.position.x - (this.width*this.scaleFactor)/2, this.position.y - (this.height*this.scaleFactor)/2, this.width * this.scaleFactor, this.height * this.scaleFactor)
    
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkYXRhL2xlc3NvbnMuanNvbiIsImpzL21haW4uanMiLCJqcy9tYWluT0xELmpzIiwianMvbW9kdWxlcy9ib2FyZC5qcyIsImpzL21vZHVsZXMvYnV0dG9uLmpzIiwianMvbW9kdWxlcy9kYXRhT2JqZWN0LmpzIiwianMvbW9kdWxlcy9kcmF3TGliLmpzIiwianMvbW9kdWxlcy9nYW1lLmpzIiwianMvbW9kdWxlcy9sZXNzb25Ob2RlLmpzIiwianMvbW9kdWxlcy9tb3VzZVN0YXRlLmpzIiwianMvbW9kdWxlcy9wb2ludC5qcyIsImpzL21vZHVsZXMvdXRpbGl0aWVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHM9e1xyXG4gICAgXCJsZXNzb25zXCI6W1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgXCJ4XCI6IFwiMFwiLFxyXG4gICAgICAgICAgICBcInlcIjogXCIwXCIsXHJcbiAgICAgICAgICAgIFwiaW1hZ2VcIjogXCJkb2cuanBlZ1wiXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFwieFwiOiBcIjEwMFwiLFxyXG4gICAgICAgICAgICBcInlcIjogXCIxMDBcIixcclxuICAgICAgICAgICAgXCJpbWFnZVwiOiBcImRvZy5qcGVnXCJcclxuICAgICAgICB9XHJcbiAgICBdXHJcbn0iLCJcInVzZSBzdHJpY3RcIjtcclxuLy9pbXBvcnRzXHJcbnZhciBHYW1lID0gcmVxdWlyZSgnLi9tb2R1bGVzL2dhbWUuanMnKTtcclxudmFyIFBvaW50ID0gcmVxdWlyZSgnLi9tb2R1bGVzL3BvaW50LmpzJyk7XHJcbnZhciBNb3VzZVN0YXRlID0gcmVxdWlyZSgnLi9tb2R1bGVzL21vdXNlU3RhdGUuanMnKTtcclxuXHJcbi8vdmFyaWFibGVzXHJcbnZhciBnYW1lO1xyXG52YXIgY2FudmFzO1xyXG52YXIgY3R4O1xyXG5cclxudmFyIGhlYWRlcjtcclxudmFyIGFjdGl2ZUhlaWdodDtcclxudmFyIGNlbnRlcjtcclxuXHJcbnZhciBtb3VzZVBvc2l0aW9uO1xyXG52YXIgcmVsYXRpdmVNb3VzZVBvc2l0aW9uO1xyXG52YXIgbW91c2VEb3duO1xyXG52YXIgbW91c2VJbjtcclxuLyphcHAuSU1BR0VTID0ge1xyXG4gICAgdGVzdEltYWdlOiBcImltYWdlcy9kb2cucG5nXCJcclxuIH07Ki9cclxuXHJcbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbihlKXtcclxuICAgIGluaXRpYWxpemVWYXJpYWJsZXMoKTtcclxuICAgIFxyXG4gICAgbG9vcCgpO1xyXG5cdC8qYXBwLm1haW4uYXBwID0gYXBwO1xyXG4gICAgXHJcblx0YXBwLm1haW4udXRpbGl0aWVzID0gYXBwLnV0aWxpdGllcztcclxuXHRhcHAubWFpbi5kcmF3TGliID0gYXBwLmRyYXdMaWI7XHJcbiAgICBhcHAubWFpbi5kYXRhT2JqZWN0ID0gbmV3IGFwcC5kYXRhT2JqZWN0KCk7XHJcbiAgICBhcHAuYm9hcmQuZHJhd0xpYiA9IGFwcC5kcmF3TGliO1xyXG4gICAgYXBwLmxlc3Nvbk5vZGUuZHJhd0xpYiA9IGFwcC5kcmF3TGliO1xyXG4gICAgYXBwLmJvYXJkQnV0dG9uLmRyYXdMaWIgPSBhcHAuZHJhd0xpYjtcclxuICAgIFxyXG5cdGFwcC5xdWV1ZSA9IG5ldyBjcmVhdGVqcy5Mb2FkUXVldWUoZmFsc2UpO1xyXG5cdGFwcC5xdWV1ZS5vbihcImNvbXBsZXRlXCIsIGZ1bmN0aW9uKCl7XHJcblx0XHRhcHAubWFpbi5pbml0KCk7XHJcblx0fSk7XHJcbiAgICBhcHAucXVldWUubG9hZE1hbmlmZXN0KFtcclxuICAgICAgICB7aWQ6IFwiZXhhbXBsZUltYWdlXCIsIHNyYzpcImltYWdlcy9kb2cuanBnXCJ9LFxyXG5cdF0pO1xyXG4gICAgXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIGFwcC5tYWluLmNhbnZhcy53aWR0aCA9IGFwcC5tYWluLmNhbnZhcy5vZmZzZXRXaWR0aDtcclxuICAgICAgICBhcHAubWFpbi5jYW52YXMuaGVpZ2h0ID0gYXBwLm1haW4uY2FudmFzLm9mZnNldEhlaWdodDtcclxuICAgICAgICBhcHAubWFpbi5hY3RpdmVIZWlnaHQgPSBhcHAubWFpbi5jYW52YXMuaGVpZ2h0IC0gYXBwLm1haW4uaGVhZGVyLm9mZnNldEhlaWdodDtcclxuICAgICAgICBhcHAubWFpbi5jZW50ZXIgPSBuZXcgYXBwLnBvaW50KGFwcC5tYWluLmNhbnZhcy53aWR0aCAvIDIsIGFwcC5tYWluLmFjdGl2ZUhlaWdodCAvIDIgKyBhcHAubWFpbi5oZWFkZXIub2Zmc2V0SGVpZ2h0KVxyXG5cdH0pOyovXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRpYWxpemVWYXJpYWJsZXMoKXtcclxuICAgIGNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2NhbnZhcycpO1xyXG4gICAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICBjYW52YXMud2lkdGggPSBjYW52YXMub2Zmc2V0V2lkdGg7XHJcbiAgICBjYW52YXMuaGVpZ2h0ID0gY2FudmFzLm9mZnNldEhlaWdodDtcclxuICAgIGNvbnNvbGUubG9nKFwiQ2FudmFzIERpbWVuc2lvbnM6IFwiICsgY2FudmFzLndpZHRoICsgXCIsIFwiICsgY2FudmFzLmhlaWdodCk7XHJcbiAgICBcclxuICAgIGhlYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2hlYWRlcicpO1xyXG4gICAgYWN0aXZlSGVpZ2h0ID0gY2FudmFzLm9mZnNldEhlaWdodCAtIGhlYWRlci5vZmZzZXRIZWlnaHQ7XHJcbiAgICBjZW50ZXIgPSBuZXcgUG9pbnQoY2FudmFzLndpZHRoLzIsIGFjdGl2ZUhlaWdodC8yICsgaGVhZGVyLm9mZnNldEhlaWdodCk7XHJcbiAgICBcclxuICAgIG1vdXNlUG9zaXRpb24gPSBuZXcgUG9pbnQoMCwwKTtcclxuICAgIHJlbGF0aXZlTW91c2VQb3NpdGlvbiA9IG5ldyBQb2ludCgwLDApO1xyXG4gICAgXHJcbiAgICAvL2V2ZW50IGxpc3RlbmVyIGZvciB3aGVuIHRoZSBtb3VzZSBtb3ZlcyBvdmVyIHRoZSBjYW52YXNcclxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIHZhciBib3VuZFJlY3QgPSBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgbW91c2VQb3NpdGlvbiA9IG5ldyBQb2ludChlLmNsaWVudFggLSBib3VuZFJlY3QubGVmdCwgZS5jbGllbnRZIC0gYm91bmRSZWN0LnRvcCk7XHJcbiAgICAgICAgcmVsYXRpdmVNb3VzZVBvc2l0aW9uID0gbmV3IFBvaW50KG1vdXNlUG9zaXRpb24ueCAtIChjYW52YXMub2Zmc2V0V2lkdGgvMi4wKSwgbW91c2VQb3NpdGlvbi55IC0gKGhlYWRlci5vZmZzZXRIZWlnaHQgKyBhY3RpdmVIZWlnaHQvMi4wKSk7ICAgICAgICBcclxuICAgIH0pO1xyXG4gICAgbW91c2VEb3duID0gZmFsc2U7XHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBmdW5jdGlvbihlKXtcclxuICAgICAgICBtb3VzZURvd24gPSB0cnVlO1xyXG4gICAgfSk7XHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgbW91c2VEb3duID0gZmFsc2U7XHJcbiAgICB9KTtcclxuICAgIG1vdXNlSW4gPSBmYWxzZTtcclxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VvdmVyXCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIG1vdXNlSW4gPSB0cnVlO1xyXG4gICAgfSk7XHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3V0XCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIG1vdXNlSW4gPSBmYWxzZTtcclxuICAgICAgICBtb3VzZURvd24gPSBmYWxzZTtcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICBnYW1lID0gbmV3IEdhbWUoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gbG9vcCgpe1xyXG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShsb29wLmJpbmQodGhpcykpO1xyXG4gICAgZ2FtZS51cGRhdGUoY3R4LCBjYW52YXMsIDAsIGNlbnRlciwgYWN0aXZlSGVpZ2h0LCBuZXcgTW91c2VTdGF0ZShtb3VzZVBvc2l0aW9uLCByZWxhdGl2ZU1vdXNlUG9zaXRpb24sIG1vdXNlRG93biwgbW91c2VJbikpO1xyXG59XHJcblxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBmdW5jdGlvbihlKXtcclxuICAgIGNhbnZhcy53aWR0aCA9IGNhbnZhcy5vZmZzZXRXaWR0aDtcclxuICAgIGNhbnZhcy5oZWlnaHQgPSBjYW52YXMub2Zmc2V0SGVpZ2h0O1xyXG4gICAgYWN0aXZlSGVpZ2h0ID0gY2FudmFzLmhlaWdodCAtIGhlYWRlci5vZmZzZXRIZWlnaHQ7XHJcbiAgICBjZW50ZXIgPSBuZXcgUG9pbnQoY2FudmFzLndpZHRoIC8gMiwgYWN0aXZlSGVpZ2h0IC8gMiArIGhlYWRlci5vZmZzZXRIZWlnaHQpXHJcbiAgICBcclxuICAgIGNvbnNvbGUubG9nKFwiQ2FudmFzIERpbWVuc2lvbnM6IFwiICsgY2FudmFzLndpZHRoICsgXCIsIFwiICsgY2FudmFzLmhlaWdodCk7XHJcbn0pO1xyXG5cclxuXHJcblxyXG4iLCIndXNlIHN0cmljdCc7XHJcbi8vdmFyIHV0aWxpdGllcyA9IHJlcXVpcmUoJy4vdXRpbGl0aWVzLmpzJyk7XHJcbnZhciBhcHAgPSBhcHAgfHwge307XHJcblxyXG5hcHAubWFpbiA9IHsgICAgXHJcbiAgICAvL3ZhcmlhYmxlc1xyXG4gICAgY2FudmFzOiB1bmRlZmluZWQsXHJcbiAgICBjdHg6IHVuZGVmaW5lZCxcclxuICAgIGFwcDogdW5kZWZpbmVkLFxyXG4gICAgdXRpbGl0aWVzOiB1bmRlZmluZWQsXHJcbiAgICBkcmF3TGliOiB1bmRlZmluZWQsXHJcbiAgICBcclxuICAgIG1vdXNlUG9zaXRpb246IHVuZGVmaW5lZCxcclxuICAgIGxhc3RNb3VzZVBvc2l0aW9uOiB1bmRlZmluZWQsXHJcbiAgICByZWxhdGl2ZU1vdXNlUG9zaXRpb246IHVuZGVmaW5lZCxcclxuICAgIGFuaW1hdGlvbklEOiAwLFxyXG5cdGxhc3RUaW1lOiAwLFxyXG4gICAgXHJcbiAgICBoZWFkZXI6IHVuZGVmaW5lZCxcclxuICAgIGFjdGl2ZUhlaWdodDogdW5kZWZpbmVkLFxyXG4gICAgY2VudGVyOiB1bmRlZmluZWQsXHJcbiAgICBib2FyZDogdW5kZWZpbmVkLFxyXG4gICAgXHJcbiAgICBkcmFnZ2luZzogdW5kZWZpbmVkLFxyXG4gICAgY3Vyc29yOiB1bmRlZmluZWQsXHJcbiAgICBcclxuICAgIC8vZGF0YU9iamVjdDogcmVxdWlyZSgnLi9vYmplY3RzL2RhdGFPYmplY3QuanMnKSxcclxuICAgIFxyXG4gICAgLy9lbnVtZXJhdGlvblxyXG4gICAgR0FNRV9TVEFURTogT2JqZWN0LmZyZWV6ZSh7XHRcclxuXHRcdEJPQVJEX1ZJRVc6IDAsXHJcblx0XHRGT0NVU19WSUVXOiAxXHJcblx0fSksXHJcbiAgICBcclxuICAgIGluaXQgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvL3RoaXMuZGVidWdMaW5lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2RlYnVnTGluZScpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignY2FudmFzJyk7XHJcbiAgICAgICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gdGhpcy5jYW52YXMub2Zmc2V0V2lkdGg7XHJcbiAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5jYW52YXMub2Zmc2V0SGVpZ2h0O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubW91c2VQb3NpdGlvbiA9IG5ldyBhcHAucG9pbnQodGhpcy5jYW52YXMud2lkdGgvMiwgdGhpcy5jYW52YXMuaGVpZ2h0LzIpO1xyXG4gICAgICAgIHRoaXMubGFzdE1vdXNlUG9zaXRpb24gPSB0aGlzLm1vdXNlUG9zaXRpb247XHJcbiAgICAgICAgdGhpcy5yZWxhdGl2ZU1vdXNlUG9zaXRpb24gPSB0aGlzLm1vdXNlUG9zaXRpb247XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5oZWFkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdoZWFkZXInKTtcclxuICAgICAgICB0aGlzLmFjdGl2ZUhlaWdodCA9IHRoaXMuY2FudmFzLmhlaWdodCAtIHRoaXMuaGVhZGVyLm9mZnNldEhlaWdodDtcclxuICAgICAgICB0aGlzLmNlbnRlciA9IG5ldyBhcHAucG9pbnQodGhpcy5jYW52YXMud2lkdGgvMiwgdGhpcy5hY3RpdmVIZWlnaHQgLyAyICsgdGhpcy5oZWFkZXIub2Zmc2V0SGVpZ2h0KTtcclxuICAgICAgICAvL2dldCBsaXN0diBvZiBub2RlcyBmcm9tIGRhdGFcclxuICAgICAgICBcclxuICAgICAgICB2YXIgdGVtcExlc3Nvbk5vZGVBcnJheSA9IFtdO1xyXG4gICAgICAgIHRlbXBMZXNzb25Ob2RlQXJyYXkucHVzaChuZXcgYXBwLmxlc3Nvbk5vZGUobmV3IGFwcC5wb2ludCgwLDApKSk7XHJcbiAgICAgICAgdGVtcExlc3Nvbk5vZGVBcnJheS5wdXNoKG5ldyBhcHAubGVzc29uTm9kZShuZXcgYXBwLnBvaW50KDMwMCwzMDApKSk7XHJcbiAgICAgICAgdGVtcExlc3Nvbk5vZGVBcnJheS5wdXNoKG5ldyBhcHAubGVzc29uTm9kZShuZXcgYXBwLnBvaW50KDMwMCwtMzAwKSkpO1xyXG4gICAgICAgIHRoaXMuYm9hcmQgPSBuZXcgYXBwLmJvYXJkKG5ldyBhcHAucG9pbnQoMCwwKSwgdGVtcExlc3Nvbk5vZGVBcnJheSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuY3Vyc29yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJteVBcIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIHRlc3RldGVzdCA9IHRoaXMuZGF0YU9iamVjdC5pbmZvQXJyYXk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9kZW5vdGVzIGdhbWVwbGF5IHN0YXRlXHJcbiAgICAgICAgdGhpcy5nYW1lX3N0YXRlID0gdGhpcy5HQU1FX1NUQVRFLkJPQVJEX1ZJRVc7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9jb25uZWN0aW5nIGV2ZW50c1xyXG4gICAgICAgIHRoaXMuY2FudmFzLm9ubW91c2Vtb3ZlID0gdGhpcy5nZXRNb3VzZVBvc2l0aW9uLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5jYW52YXMub25tb3VzZWRvd24gPSB0aGlzLmRvTW91c2VEb3duLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5jYW52YXMub25tb3VzZXVwID0gdGhpcy5kb01vdXNlVXAuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V3aGVlbFwiLCB0aGlzLmRvV2hlZWwuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9zdGFydCB0aGUgbG9vcFxyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICAvL2xvb3AgZnVuY3Rpb25zXHJcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vY2FsbCB0aGUgbG9vcFxyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uSUQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy51cGRhdGUuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9jYWxjdWxhdGUgZGVsdGEgdGltZVxyXG4gICAgICAgIHZhciBkdCA9IHRoaXMuY2FsY3VsYXRlRGVsdGFUaW1lKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9jbGVhciB0aGUgY2FudmFzXHJcbiAgICAgICAgdGhpcy5kcmF3TGliLmNsZWFyKHRoaXMuY3R4LDAsMCx0aGlzLmNhbnZhcy5vZmZzZXRXaWR0aCx0aGlzLmNhbnZhcy5vZmZzZXRIZWlnaHQpO1xyXG4gICAgICAgIHRoaXMuZHJhd0xpYi5yZWN0KHRoaXMuY3R4LCAwLCAwLCB0aGlzLmNhbnZhcy5vZmZzZXRXaWR0aCwgdGhpcy5jYW52YXMub2Zmc2V0SGVpZ2h0LCBcIldoaXRlXCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vdXBkYXRlXHJcbiAgICAgICAgaWYodGhpcy5nYW1lX3N0YXRlID09IHRoaXMuR0FNRV9TVEFURS5CT0FSRF9WSUVXKXtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vZHJhdyBnYW1lIHNjcmVlblxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5ib2FyZENvbGxpc2lvbkhhbmRsaW5nKCk7XHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmQuZHJhdyh0aGlzLmN0eCwgdGhpcy5jZW50ZXIsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmFjdGl2ZUhlaWdodCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLmRyYXdMaWIuY2lyY2xlKHRoaXMuY3R4LCB0aGlzLm1vdXNlUG9zaXRpb24ueCwgdGhpcy5tb3VzZVBvc2l0aW9uLnksIDEwLCBcIlJveWFsQmx1ZVwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZih0aGlzLmdhbWVfc3RhdGUgPT0gdGhpcy5HQU1FX1NUQVRFLlRJVExFKXtcclxuICAgICAgICAgICAgLy9kcmF3IHRpdGxlIHNjcmVlblxyXG4gICAgICAgIH1cclxuICAgICAgICAvL2N1cnNvciBoYW5kbGluZ1xyXG4gICAgICAgIHRoaXMuY3Vyc29ySGFuZGxlcigpO1xyXG4gICAgICAgIHRoaXMuZGVidWdIdWQodGhpcy5jdHgsIGR0KTtcclxuICAgIH0sXHJcbiAgICBcclxuICAgIGNhbGN1bGF0ZURlbHRhVGltZTogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBub3c7XHJcbiAgICAgICAgdmFyIGZwcztcclxuXHRcdG5vdyA9ICgrIG5ldyBEYXRlKTsgXHJcblx0XHRmcHMgPSAxMDAwIC8gKG5vdyAtIHRoaXMubGFzdFRpbWUpO1xyXG5cdFx0ZnBzID0gYXBwLnV0aWxpdGllcy5jbGFtcChmcHMsIDEyLCA2MCk7XHJcblx0XHR0aGlzLmxhc3RUaW1lID0gbm93OyBcclxuXHRcdHJldHVybiAxL2ZwcztcclxuXHR9LFxyXG4gICAgXHJcbiAgICAvL2hlbHBlciBldmVudCBmdW5jdGlvbnNcclxuICAgIGdldE1vdXNlUG9zaXRpb246IGZ1bmN0aW9uKGUpe1xyXG5cdFx0dGhpcy5sYXN0TW91c2VQb3NpdGlvbiA9IHRoaXMubW91c2VQb3NpdGlvbjtcclxuICAgICAgICB0aGlzLm1vdXNlUG9zaXRpb24gPSBhcHAudXRpbGl0aWVzLmdldE1vdXNlKGUsIHRoaXMuY2FudmFzLm9mZnNldFdpZHRoLCB0aGlzLmNhbnZhcy5vZmZzZXRIZWlnaHQpO1xyXG4gICAgICAgIHRoaXMucmVsYXRpdmVNb3VzZVBvc2l0aW9uID0gbmV3IGFwcC5wb2ludCh0aGlzLm1vdXNlUG9zaXRpb24ueCAtIHRoaXMuY2FudmFzLndpZHRoLzIgKyB0aGlzLmJvYXJkLnBvc2l0aW9uLngsIHRoaXMubW91c2VQb3NpdGlvbi55IC0gdGhpcy5hY3RpdmVIZWlnaHQvMiArIHRoaXMuYm9hcmQucG9zaXRpb24ueSAtIHRoaXMuaGVhZGVyLm9mZnNldEhlaWdodCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYodGhpcy5kcmFnZ2luZyl7XHJcbiAgICAgICAgICAgIC8vdGhlIHBvc2l0aW9uYWwgZGlmZmVyZW5jZSBiZXR3ZWVuIGxhc3QgbG9vcCBhbmQgdGhpc1xyXG4gICAgICAgICAgICB0aGlzLmJvYXJkLm1vdmUodGhpcy5sYXN0TW91c2VQb3NpdGlvbi54IC0gdGhpcy5tb3VzZVBvc2l0aW9uLngsIHRoaXMubGFzdE1vdXNlUG9zaXRpb24ueSAtIHRoaXMubW91c2VQb3NpdGlvbi55KTtcclxuICAgICAgICB9XHJcblx0fSxcclxuICAgIGRvTW91c2VEb3duIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcgPSB0cnVlO1xyXG4gICAgfSxcclxuICAgIGRvTW91c2VVcCA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICB0aGlzLmRyYWdnaW5nID0gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgZG9XaGVlbCA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICB0aGlzLmJvYXJkLnpvb20odGhpcy5jdHgsIHRoaXMuY2VudGVyLCBlLmRlbHRhWSk7XHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICBjdXJzb3JIYW5kbGVyIDogZnVuY3Rpb24oKXtcclxuICAgICAgICAvL2lzIGl0IGhvdmVyaW5nIG92ZXIgdGhlIGNhbnZhcz9cclxuICAgICAgICAvL2lzIGl0IGRyYWdnaW5nP1xyXG4gICAgICAgIGlmKHRoaXMuZHJhZ2dpbmcpe1xyXG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS5jdXJzb3IgPSBcIi13ZWJraXQtZ3JhYmJpbmdcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUuY3Vyc29yID0gXCJkZWZhdWx0XCI7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFxyXG4gICAgYm9hcmRDb2xsaXNpb25IYW5kbGluZyA6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyIGFjdGl2ZU5vZGU7XHJcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMuYm9hcmQubGVzc29uTm9kZUFycmF5Lmxlbmd0aDsgaSsrKXtcclxuICAgICAgICAgICAgYWN0aXZlTm9kZSA9IHRoaXMuYm9hcmQubGVzc29uTm9kZUFycmF5W2ldO1xyXG4gICAgICAgICAgICBpZih0aGlzLnJlbGF0aXZlTW91c2VQb3NpdGlvbi54ID4gYWN0aXZlTm9kZS5wb3NpdGlvbi54IC0gYWN0aXZlTm9kZS53aWR0aC8yICYmIHRoaXMucmVsYXRpdmVNb3VzZVBvc2l0aW9uLnggPCBhY3RpdmVOb2RlLnBvc2l0aW9uLnggKyBhY3RpdmVOb2RlLndpZHRoLzIpe1xyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5yZWxhdGl2ZU1vdXNlUG9zaXRpb24ueSA+IGFjdGl2ZU5vZGUucG9zaXRpb24ueSAtIGFjdGl2ZU5vZGUuaGVpZ2h0LzIgJiYgdGhpcy5yZWxhdGl2ZU1vdXNlUG9zaXRpb24ueSA8IGFjdGl2ZU5vZGUucG9zaXRpb24ueSArIGFjdGl2ZU5vZGUuaGVpZ2h0LzIpe1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZU5vZGUuYm9hcmRCdXR0b24uaG92ZXJlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZU5vZGUuYm9hcmRCdXR0b24uaG92ZXJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICBhY3RpdmVOb2RlLmJvYXJkQnV0dG9uLmhvdmVyZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcclxuICAgIC8vZGVidWdcclxuICAgIGRlYnVnSHVkOiBmdW5jdGlvbihjdHgsIGR0KSB7XHJcbiAgICAgICAgY3R4LnNhdmUoKTtcclxuICAgICAgICB0aGlzLmZpbGxUZXh0KGN0eCwgXCJtb3VzZVBvc2l0aW9uOiBcIiArIHRoaXMubW91c2VQb3NpdGlvbi54ICsgXCIsIFwiICsgdGhpcy5tb3VzZVBvc2l0aW9uLnksIDUwLCB0aGlzLmNhbnZhcy5oZWlnaHQgLSAxMCwgXCIxMnB0IG9zd2FsZFwiLCBcIkJsYWNrXCIpO1xyXG4gICAgICAgIHRoaXMuZmlsbFRleHQoY3R4LFwiUmVsTW91c2VQb3NpdGlvbjogXCIrdGhpcy5yZWxhdGl2ZU1vdXNlUG9zaXRpb24ueCArIFwiLCBcIiArIHRoaXMucmVsYXRpdmVNb3VzZVBvc2l0aW9uLnksIHRoaXMuY2FudmFzLndpZHRoLzIsIHRoaXMuY2FudmFzLmhlaWdodCAtIDEwLFwiMTJwdCBvc3dhbGRcIixcIkJsYWNrXCIpO1xyXG4gICAgICAgIHRoaXMuZmlsbFRleHQoY3R4LCBcImR0OiBcIiArIGR0LnRvRml4ZWQoMyksIHRoaXMuY2FudmFzLndpZHRoIC0gMTUwLCB0aGlzLmNhbnZhcy5oZWlnaHQgLSAxMCwgXCIxMnB0IG9zd2FsZFwiLCBcImJsYWNrXCIpO1xyXG4gICAgICAgIHRoaXMuZHJhd0xpYi5saW5lKGN0eCwgdGhpcy5jZW50ZXIueCwgdGhpcy5jZW50ZXIueSAtIHRoaXMuYWN0aXZlSGVpZ2h0LzIsIHRoaXMuY2VudGVyLngsIHRoaXMuY2VudGVyLnkgKyB0aGlzLmFjdGl2ZUhlaWdodC8yLCAyLCBcIkxpZ2h0Z3JheVwiKTtcclxuICAgICAgICB0aGlzLmRyYXdMaWIubGluZShjdHgsIDAsIHRoaXMuY2VudGVyLnksIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNlbnRlci55LCAyLCBcIkxpZ2h0Z3JheVwiKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmZpbGxUZXh0KGN0eCwgdGhpcy5ib2FyZC5sZXNzb25Ob2RlQXJyYXlbMF0uYm9hcmRCdXR0b24uaG92ZXJlZCwgdGhpcy5jYW52YXMud2lkdGgvMiwgdGhpcy5jYW52YXMuaGVpZ2h0IC0gMzAsIFwiMTJwdCBvc3dhbGRcIiwgXCJibGFja1wiKTtcclxuICAgICAgICB0aGlzLmZpbGxUZXh0KGN0eCwgdGhpcy5ib2FyZC5sZXNzb25Ob2RlQXJyYXlbMV0uYm9hcmRCdXR0b24uaG92ZXJlZCwgdGhpcy5jYW52YXMud2lkdGgvMiwgdGhpcy5jYW52YXMuaGVpZ2h0IC0gNTAsIFwiMTJwdCBvc3dhbGRcIiwgXCJibGFja1wiKTtcclxuICAgICAgICB0aGlzLmZpbGxUZXh0KGN0eCwgdGhpcy5ib2FyZC5sZXNzb25Ob2RlQXJyYXlbMl0uYm9hcmRCdXR0b24uaG92ZXJlZCwgdGhpcy5jYW52YXMud2lkdGgvMiwgdGhpcy5jYW52YXMuaGVpZ2h0IC0gNzAsIFwiMTJwdCBvc3dhbGRcIiwgXCJibGFja1wiKTtcclxuICAgICAgICBcclxuICAgICAgICBjdHgucmVzdG9yZSgpO1xyXG4gICAgfSxcclxuICAgIGZpbGxUZXh0OiBmdW5jdGlvbihjdHgsIHN0cmluZywgeCwgeSwgY3NzLCBjb2xvcikge1xyXG5cdFx0Y3R4LnNhdmUoKTtcclxuXHRcdC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0NTUy9mb250XHJcblx0XHR0aGlzLmN0eC5mb250ID0gY3NzO1xyXG5cdFx0dGhpcy5jdHguZmlsbFN0eWxlID0gY29sb3I7XHJcblx0XHR0aGlzLmN0eC5maWxsVGV4dChzdHJpbmcsIHgsIHkpO1xyXG5cdFx0Y3R4LnJlc3RvcmUoKTtcclxuXHR9LFxyXG59OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuLy9wYXJhbWV0ZXIgaXMgYSBwb2ludCB0aGF0IGRlbm90ZXMgc3RhcnRpbmcgcG9zaXRpb25cclxuZnVuY3Rpb24gYm9hcmQoc3RhcnRQb3NpdGlvbiwgbGVzc29uTm9kZXMpe1xyXG4gICAgdGhpcy5wb3NpdGlvbiA9IHN0YXJ0UG9zaXRpb247XHJcbiAgICB0aGlzLmxlc3Nvbk5vZGVBcnJheSA9IGxlc3Nvbk5vZGVzO1xyXG59XHJcblxyXG5ib2FyZC5kcmF3TGliID0gdW5kZWZpbmVkO1xyXG5cclxuLy9oZWxwZXJcclxuZnVuY3Rpb24gY2FsY3VsYXRlQm91bmRzKCl7XHJcbiAgICBpZih0aGlzLmxlc3Nvbk5vZGVBcnJheS5sZW5ndGggPiAwKXtcclxuICAgICAgICB0aGlzLmJvdW5kTGVmdCA9IHRoaXMubGVzc29uTm9kZUFycmF5WzBdLnBvc2l0aW9uLng7XHJcbiAgICAgICAgdGhpcy5ib3VuZFJpZ2h0ID0gdGhpcy5sZXNzb25Ob2RlQXJyYXlbMF0ucG9zaXRpb24ueDtcclxuICAgICAgICB0aGlzLmJvdW5kVG9wID0gdGhpcy5sZXNzb25Ob2RlQXJyYXlbMF0ucG9zaXRpb24ueTtcclxuICAgICAgICB0aGlzLmJvdW5kQm90dG9tID0gdGhpcy5sZXNzb25Ob2RlQXJyYXlbMF0ucG9zaXRpb24ueTtcclxuICAgICAgICBmb3IodmFyIGkgPSAxOyBpIDwgdGhpcy5sZXNzb25Ob2RlQXJyYXkubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgICAgICBpZih0aGlzLmJvdW5kTGVmdCA+IHRoaXMubGVzc29uTm9kZUFycmF5W2ldLnBvc2l0aW9uLngpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib3VuZExlZnQgPSB0aGlzLmxlc3Nvbk5vZGVBcnJheVtpXS5wb3NpdGlvbi54O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYodGhpcy5ib3VuZFJpZ2h0IDwgdGhpcy5sZXNzb25Ob2RlQXJyYXlbaV0ucG9zaXRpb24ueCl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvdW5kUmlnaHQgPiB0aGlzLmxlc3Nvbk5vZGVBcnJheVtpXS5wb3NpdGlvbi54O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKHRoaXMuYm91bmRUb3AgPiB0aGlzLmxlc3Nvbk5vZGVBcnJheVtpXS5wb3NpdGlvbi55KXtcclxuICAgICAgICAgICAgICAgIHRoaXMuYm91bmRUb3AgPSB0aGlzLmxlc3Nvbk5vZGVBcnJheVtpXS5wb3NpdGlvbi55O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYodGhpcy5ib3VuZEJvdHRvbSA8IHRoaXMubGVzc29uTm9kZUFycmF5W2ldLnBvc2l0aW9uLnkpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib3VuZEJvdHRvbSA9IHRoaXMubGVzc29uTm9kZUFycmF5W2ldLnBvc2l0aW9uLnk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG4vL3Byb3RvdHlwZVxyXG52YXIgcCA9IGJvYXJkLnByb3RvdHlwZTtcclxuXHJcbnAubW92ZSA9IGZ1bmN0aW9uKHBYLCBwWSl7XHJcbiAgICB0aGlzLnBvc2l0aW9uLnggKz0gcFg7XHJcbiAgICB0aGlzLnBvc2l0aW9uLnkgKz0gcFk7XHJcbn07XHJcblxyXG5wLmRyYXcgPSBmdW5jdGlvbihjdHgsIGNlbnRlciwgYWN0aXZlSGVpZ2h0KXtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICAvL3RyYW5zbGF0ZSB0byB0aGUgY2VudGVyIG9mIHRoZSBzY3JlZW5cclxuICAgIGN0eC50cmFuc2xhdGUoY2VudGVyLnggLSB0aGlzLnBvc2l0aW9uLngsIGNlbnRlci55IC0gdGhpcy5wb3NpdGlvbi55KTtcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmxlc3Nvbk5vZGVBcnJheS5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgdGhpcy5sZXNzb25Ob2RlQXJyYXlbaV0uZHJhdyhjdHgpO1xyXG4gICAgfVxyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gYm9hcmQ7XHJcblxyXG4vL3RoaXMgaXMgYW4gb2JqZWN0IG5hbWVkIEJvYXJkIGFuZCB0aGlzIGlzIGl0cyBqYXZhc2NyaXB0XHJcbi8vdmFyIEJvYXJkID0gcmVxdWlyZSgnLi9vYmplY3RzL2JvYXJkLmpzJyk7XHJcbi8vdmFyIGIgPSBuZXcgQm9hcmQoKTtcclxuICAgICIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuLy9wYXJhbWV0ZXIgaXMgYSBwb2ludCB0aGF0IGRlbm90ZXMgc3RhcnRpbmcgcG9zaXRpb25cclxuZnVuY3Rpb24gYnV0dG9uKHN0YXJ0UG9zaXRpb24sIHdpZHRoLCBoZWlnaHQpe1xyXG4gICAgdGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICB0aGlzLmNsaWNrZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuaG92ZXJlZCA9IGZhbHNlO1xyXG59XHJcbmJ1dHRvbi5kcmF3TGliID0gdW5kZWZpbmVkO1xyXG5cclxudmFyIHAgPSBidXR0b24ucHJvdG90eXBlO1xyXG5cclxucC5kcmF3ID0gZnVuY3Rpb24oY3R4KXtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICB2YXIgY29sO1xyXG4gICAgaWYodGhpcy5ob3ZlcmVkKXtcclxuICAgICAgICBjb2wgPSBcImRvZGdlcmJsdWVcIjtcclxuICAgIH1cclxuICAgIGVsc2V7XHJcbiAgICAgICAgY29sID0gXCJsaWdodGJsdWVcIjtcclxuICAgIH1cclxuICAgIC8vZHJhdyByb3VuZGVkIGNvbnRhaW5lclxyXG4gICAgYm9hcmRCdXR0b24uZHJhd0xpYi5yZWN0KGN0eCwgdGhpcy5wb3NpdGlvbi54IC0gdGhpcy53aWR0aC8yLCB0aGlzLnBvc2l0aW9uLnkgLSB0aGlzLmhlaWdodC8yLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgY29sKTtcclxuXHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBidXR0b247IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vdGhlIGpzb24gaXMgbG9jYWwsIG5vIG5lZWQgZm9yIHhociB3aGVuIHVzaW5nIHRoaXMgbW9kdWxlIHBhdHRlcm5cclxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9kYXRhL2xlc3NvbnMuanNvbicpO1xyXG4vKlxyXG52YXIgeGhyID0gcmVxdWlyZSgneGhyJyk7XHJcblxyXG52YXIgYXBwID0gYXBwIHx8IHt9O1xyXG5cclxudmFyIGluZm9BcnJheSA9IHVuZGVmaW5lZDtcclxuXHJcbnhocih7XHJcbiAgICB1cmk6IFwiZGF0YS9sZXNzb25zLmpzb25cIixcclxuICAgIGhlYWRlcnM6IHtcclxuICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuICAgICAgICBcIklmLU1vZGlmaWVkLVNpbmNlXCI6IFwiU2F0LCAxIEphbiAyMDEwIDAwOjAwOjAwIEdNVFwiXHJcbiAgICB9XHJcbn0sIGZ1bmN0aW9uIChlcnIsIHJlc3AsIGJvZHkpIHtcclxuICAgIHZhciBteUpTT04gPSBKU09OLnBhcnNlKGJvZHkpO1xyXG4gICAgaW5mb0FycmF5ID0gbXlKU09OLmxlc3NvbnM7XHJcbn0pO1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gaW5mb0FycmF5O1xyXG4qLyIsIlwidXNlIHN0cmljdFwiO1xyXG5mdW5jdGlvbiBkcmF3TGliKCl7XHJcbiAgICBcclxufVxyXG5cclxudmFyIHAgPSBkcmF3TGliLnByb3RvdHlwZTtcclxuXHJcbnAuY2xlYXIgPSBmdW5jdGlvbihjdHgsIHgsIHksIHcsIGgpIHtcclxuICAgIGN0eC5jbGVhclJlY3QoeCwgeSwgdywgaCk7XHJcbn1cclxuXHJcbnAucmVjdCA9IGZ1bmN0aW9uKGN0eCwgeCwgeSwgdywgaCwgY29sKSB7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IGNvbDtcclxuICAgIGN0eC5maWxsUmVjdCh4LCB5LCB3LCBoKTtcclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbn1cclxuXHJcbnAubGluZSA9IGZ1bmN0aW9uKGN0eCwgeDEsIHkxLCB4MiwgeTIsIHRoaWNrbmVzcywgY29sb3IpIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHgubW92ZVRvKHgxLCB5MSk7XHJcbiAgICBjdHgubGluZVRvKHgyLCB5Mik7XHJcbiAgICBjdHgubGluZVdpZHRoID0gdGhpY2tuZXNzO1xyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gY29sb3I7XHJcbiAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG59XHJcblxyXG5wLmNpcmNsZSA9IGZ1bmN0aW9uKGN0eCwgeCwgeSwgcmFkaXVzLCBjb2xvcil7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgY3R4LmFyYyh4LHksIHJhZGl1cywgMCwgMiAqIE1hdGguUEksIGZhbHNlKTtcclxuICAgIGN0eC5maWxsU3R5bGUgPSBjb2xvcjtcclxuICAgIGN0eC5maWxsKCk7XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBib2FyZEJ1dHRvbihjdHgsIHBvc2l0aW9uLCB3aWR0aCwgaGVpZ2h0LCBob3ZlcmVkKXtcclxuICAgIC8vY3R4LnNhdmUoKTtcclxuICAgIGlmKGhvdmVyZWQpe1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBcImRvZGdlcmJsdWVcIjtcclxuICAgIH1cclxuICAgIGVsc2V7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwibGlnaHRibHVlXCI7XHJcbiAgICB9XHJcbiAgICAvL2RyYXcgcm91bmRlZCBjb250YWluZXJcclxuICAgIGN0eC5yZWN0KHBvc2l0aW9uLnggLSB3aWR0aC8yLCBwb3NpdGlvbi55IC0gaGVpZ2h0LzIsIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgY3R4LmxpbmVXaWR0aCA9IDU7XHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBcImJsYWNrXCI7XHJcbiAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICBjdHguZmlsbCgpO1xyXG4gICAgLy9jdHgucmVzdG9yZSgpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGRyYXdMaWI7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBCb2FyZCA9IHJlcXVpcmUoJy4vYm9hcmQuanMnKTtcclxudmFyIFBvaW50ID0gcmVxdWlyZSgnLi9wb2ludC5qcycpO1xyXG52YXIgRHJhd0xpYiA9IHJlcXVpcmUoJy4vZHJhd0xpYi5qcycpO1xyXG52YXIgTGVzc29uTm9kZSA9IHJlcXVpcmUoJy4vbGVzc29uTm9kZS5qcycpO1xyXG52YXIgVXRpbGl0aWVzID0gcmVxdWlyZSgnLi91dGlsaXRpZXMuanMnKTtcclxuXHJcbnZhciBib2FyZEFycmF5O1xyXG52YXIgYWN0aXZlQm9hcmRJbmRleDtcclxudmFyIHBhaW50ZXI7XHJcblxyXG52YXIgbW91c2VTdGF0ZTtcclxudmFyIHByZXZpb3VzTW91c2VTdGF0ZTtcclxuXHJcbmZ1bmN0aW9uIGdhbWUoKXtcclxuICAgIHBhaW50ZXIgPSBuZXcgRHJhd0xpYigpO1xyXG4gICAgXHJcbiAgICBhY3RpdmVCb2FyZEluZGV4ID0gMDtcclxuICAgIFxyXG4gICAgdmFyIHRlc3RMZXNzb25Ob2RlQXJyYXkgPSBbXTtcclxuICAgIHRlc3RMZXNzb25Ob2RlQXJyYXkucHVzaChuZXcgTGVzc29uTm9kZShuZXcgUG9pbnQoMCwwKSwgXCJpbWFnZXMvZG9nLnBuZ1wiKSk7XHJcbiAgICB0ZXN0TGVzc29uTm9kZUFycmF5LnB1c2gobmV3IExlc3Nvbk5vZGUobmV3IFBvaW50KDEwMCwxMDApLCBcImltYWdlcy9nb2xkRG9nLnBuZ1wiKSk7XHJcbiAgICBcclxuICAgIGJvYXJkQXJyYXkgPSBbXTtcclxuICAgIGJvYXJkQXJyYXkucHVzaChuZXcgQm9hcmQobmV3IFBvaW50KDAsMCksIHRlc3RMZXNzb25Ob2RlQXJyYXkpKTtcclxuICAgIFxyXG4gICAgXHJcbn1cclxuXHJcbnZhciBwID0gZ2FtZS5wcm90b3R5cGU7XHJcblxyXG5wLnVwZGF0ZSA9IGZ1bmN0aW9uKGN0eCwgY2FudmFzLCBkdCwgY2VudGVyLCBhY3RpdmVIZWlnaHQsIHBNb3VzZVN0YXRlKXtcclxuICAgIC8vdXBkYXRlIHN0dWZmXHJcbiAgICBwLmFjdChwTW91c2VTdGF0ZSk7XHJcbiAgICAvL2RyYXcgc3R1ZmZcclxuICAgIHAuZHJhdyhjdHgsIGNhbnZhcywgY2VudGVyLCBhY3RpdmVIZWlnaHQpO1xyXG59XHJcblxyXG5wLmFjdCA9IGZ1bmN0aW9uKHBNb3VzZVN0YXRlKXtcclxuICAgIHByZXZpb3VzTW91c2VTdGF0ZSA9IG1vdXNlU3RhdGU7XHJcbiAgICBtb3VzZVN0YXRlID0gcE1vdXNlU3RhdGU7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZGVidWdMaW5lJykuaW5uZXJIVE1MID0gXCJtb3VzZVBvc2l0aW9uOiB4ID0gXCIgKyBtb3VzZVN0YXRlLnJlbGF0aXZlUG9zaXRpb24ueCArIFwiLCB5ID0gXCIgKyBtb3VzZVN0YXRlLnJlbGF0aXZlUG9zaXRpb24ueSArIFxyXG4gICAgXCI8YnI+Q2xpY2tlZCA9IFwiICsgbW91c2VTdGF0ZS5tb3VzZURvd24gKyBcclxuICAgIFwiPGJyPk92ZXIgQ2FudmFzID0gXCIgKyBtb3VzZVN0YXRlLm1vdXNlSW47XHJcbiAgICBcclxuICAgIC8vY29sbGlzaW9uIGRldGVjdGlvbiwgaXRlcmF0ZSB0aHJvdWdoIGVhY2ggbm9kZSBpbiB0aGUgYWN0aXZlIGJvYXJkXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgYm9hcmRBcnJheVthY3RpdmVCb2FyZEluZGV4XS5sZXNzb25Ob2RlQXJyYXkubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgIHZhciB0YXJnZXRMZXNzb25Ob2RlID0gYm9hcmRBcnJheVthY3RpdmVCb2FyZEluZGV4XS5sZXNzb25Ob2RlQXJyYXlbaV07XHJcbiAgICAgICAgbW91c2VJbnRlcnNlY3QodGFyZ2V0TGVzc29uTm9kZSwgYm9hcmRBcnJheVthY3RpdmVCb2FyZEluZGV4XS5wb3NpdGlvbiwgdGFyZ2V0TGVzc29uTm9kZS5zY2FsZUZhY3Rvcik7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIFxyXG4gICAgLy9tb3ZpbmcgdGhlIGJvYXJkXHJcbiAgICBpZihtb3VzZVN0YXRlLm1vdXNlRG93biA9PSB0cnVlKXtcclxuICAgICAgICBib2FyZEFycmF5W2FjdGl2ZUJvYXJkSW5kZXhdLm1vdmUocHJldmlvdXNNb3VzZVN0YXRlLnBvc2l0aW9uLnggLSBtb3VzZVN0YXRlLnBvc2l0aW9uLngsIHByZXZpb3VzTW91c2VTdGF0ZS5wb3NpdGlvbi55IC0gbW91c2VTdGF0ZS5wb3NpdGlvbi55KTtcclxuICAgIH1cclxufVxyXG5cclxucC5kcmF3ID0gZnVuY3Rpb24oY3R4LCBjYW52YXMsIGNlbnRlciwgYWN0aXZlSGVpZ2h0KXtcclxuICAgIC8vZHJhdyBib2FyZFxyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIHBhaW50ZXIuY2xlYXIoY3R4LCAwLCAwLCBjYW52YXMub2Zmc2V0V2lkdGgsIGNhbnZhcy5vZmZzZXRIZWlnaHQpO1xyXG4gICAgcGFpbnRlci5yZWN0KGN0eCwgMCwgMCwgY2FudmFzLm9mZnNldFdpZHRoLCBjYW52YXMub2Zmc2V0SGVpZ2h0LCBcIndoaXRlXCIpO1xyXG4gICAgcGFpbnRlci5saW5lKGN0eCwgY2FudmFzLm9mZnNldFdpZHRoLzIsIGNlbnRlci55IC0gYWN0aXZlSGVpZ2h0LzIsIGNhbnZhcy5vZmZzZXRXaWR0aC8yLCBjYW52YXMub2Zmc2V0SGVpZ2h0LCAyLCBcImxpZ2h0Z3JheVwiKTtcclxuICAgIHBhaW50ZXIubGluZShjdHgsIDAsIGNlbnRlci55LCBjYW52YXMub2Zmc2V0V2lkdGgsIGNlbnRlci55LCAyLCBcImxpZ2h0R3JheVwiKTtcclxuICAgIFxyXG4gICAgLy9kcmF3aW5nIGxlc3NvbiBub2Rlc1xyXG4gICAgYm9hcmRBcnJheVswXS5kcmF3KGN0eCwgY2VudGVyLCBhY3RpdmVIZWlnaHQpO1xyXG4gICAgXHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGdhbWU7XHJcblxyXG4vL3BFbGVtZW50IGlzIHRoZSBvYmplY3Qgb24gdGhlIGNhbnZhcyB0aGF0IGlzIGJlaW5nIGNoZWNrZWQgYWdhaW5zdCB0aGUgbW91c2UsIHBPZmZzZXRlciB3aWxsIG1vc3QgbGlrZWx5IGJlIHRoZSBib2FyZCBzbyB3ZSBjYW4gc3VidHJhY3QgcG9zaXRpb24gb3Igd2hhdGV2ZXIgaXQgbmVlZHMgdG8gcmVtYWluIGFsaWduZWRcclxuZnVuY3Rpb24gbW91c2VJbnRlcnNlY3QocEVsZW1lbnQsIHBPZmZzZXR0ZXIsIHBTY2FsZSl7XHJcbiAgICBpZihtb3VzZVN0YXRlLnJlbGF0aXZlUG9zaXRpb24ueCArIHBPZmZzZXR0ZXIueCA+IChwRWxlbWVudC5wb3NpdGlvbi54IC0gKHBTY2FsZSpwRWxlbWVudC53aWR0aCkvMikgJiYgbW91c2VTdGF0ZS5yZWxhdGl2ZVBvc2l0aW9uLnggKyBwT2Zmc2V0dGVyLnggPCAocEVsZW1lbnQucG9zaXRpb24ueCArIChwU2NhbGUqcEVsZW1lbnQud2lkdGgpLzIpKXtcclxuICAgICAgICBpZihtb3VzZVN0YXRlLnJlbGF0aXZlUG9zaXRpb24ueSArIHBPZmZzZXR0ZXIueSA+IChwRWxlbWVudC5wb3NpdGlvbi55IC0gKHBTY2FsZSpwRWxlbWVudC5oZWlnaHQpLzIpICYmIG1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbi55ICsgcE9mZnNldHRlci55IDwgKHBFbGVtZW50LnBvc2l0aW9uLnkgKyAocFNjYWxlKnBFbGVtZW50LmhlaWdodCkvMikpe1xyXG4gICAgICAgICAgICBwRWxlbWVudC5tb3VzZU92ZXIgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICBwRWxlbWVudC5tb3VzZU92ZXIgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNle1xyXG4gICAgICAgIHBFbGVtZW50Lm1vdXNlT3ZlciA9IGZhbHNlO1xyXG4gICAgfVxyXG59IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vL3BhcmFtZXRlciBpcyBhIHBvaW50IHRoYXQgZGVub3RlcyBzdGFydGluZyBwb3NpdGlvblxyXG5mdW5jdGlvbiBsZXNzb25Ob2RlKHN0YXJ0UG9zaXRpb24sIGltYWdlUGF0aCl7XHJcbiAgICB0aGlzLnBvc2l0aW9uID0gc3RhcnRQb3NpdGlvbjtcclxuICAgIHRoaXMud2lkdGggPSAxMDA7XHJcbiAgICB0aGlzLmhlaWdodCA9IDEwMDtcclxuICAgIHRoaXMubW91c2VPdmVyID0gZmFsc2U7XHJcbiAgICB0aGlzLnNjYWxlRmFjdG9yID0gMTtcclxuICAgIFxyXG4gICAgLy9pbWFnZSBsb2FkaW5nXHJcbiAgICB2YXIgdGVtcEltYWdlID0gbmV3IEltYWdlKCk7XHJcbiAgICB0cnl7XHJcbiAgICAgICAgdGVtcEltYWdlLnNyYyA9IGltYWdlUGF0aDtcclxuICAgICAgICB0aGlzLmltYWdlID0gdGVtcEltYWdlO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICB0ZW1wSW1hZ2Uuc3JjID0gXCJpbWFnZXMvZG9nLnBuZ1wiO1xyXG4gICAgICAgIHRoaXMuaW1hZ2UgPSB0ZW1wSW1hZ2U7XHJcbiAgICB9XHJcbn1cclxuXHJcbmxlc3Nvbk5vZGUuZHJhd0xpYiA9IHVuZGVmaW5lZDtcclxuXHJcbnZhciBwID0gbGVzc29uTm9kZS5wcm90b3R5cGU7XHJcblxyXG5wLmRyYXcgPSBmdW5jdGlvbihjdHgpe1xyXG4gICAgLy9sZXNzb25Ob2RlLmRyYXdMaWIuY2lyY2xlKGN0eCwgdGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnksIDEwLCBcInJlZFwiKTtcclxuICAgIC8vZHJhdyB0aGUgaW1hZ2UsIHNoYWRvdyBpZiBob3ZlcmVkXHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgaWYodGhpcy5tb3VzZU92ZXIpe1xyXG4gICAgICAgIC8vY3R4LnNoYWRvd09mZnNldFggPSAxMDtcclxuICAgICAgICAvL2N0eC5zaGFkb3dPZmZzZXRZID0gMTA7XHJcbiAgICAgICAgY3R4LnNoYWRvd0NvbG9yID0gJ2JsdWUnO1xyXG4gICAgICAgIGN0eC5zaGFkb3dCbHVyID0gMzA7XHJcbiAgICB9XHJcbiAgICBjdHguZHJhd0ltYWdlKHRoaXMuaW1hZ2UsIHRoaXMucG9zaXRpb24ueCAtICh0aGlzLndpZHRoKnRoaXMuc2NhbGVGYWN0b3IpLzIsIHRoaXMucG9zaXRpb24ueSAtICh0aGlzLmhlaWdodCp0aGlzLnNjYWxlRmFjdG9yKS8yLCB0aGlzLndpZHRoICogdGhpcy5zY2FsZUZhY3RvciwgdGhpcy5oZWlnaHQgKiB0aGlzLnNjYWxlRmFjdG9yKVxyXG4gICAgXHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBsZXNzb25Ob2RlOyIsIi8va2VlcHMgdHJhY2sgb2YgbW91c2UgcmVsYXRlZCB2YXJpYWJsZXMuXHJcbi8vY2FsY3VsYXRlZCBpbiBtYWluIGFuZCBwYXNzZWQgdG8gZ2FtZVxyXG4vL2NvbnRhaW5zIHVwIHN0YXRlXHJcbi8vcG9zaXRpb25cclxuLy9yZWxhdGl2ZSBwb3NpdGlvblxyXG4vL29uIGNhbnZhc1xyXG5cInVzZSBzdHJpY3RcIjtcclxuZnVuY3Rpb24gbW91c2VTdGF0ZShwUG9zaXRpb24sIHBSZWxhdGl2ZVBvc2l0aW9uLCBwTW91c2Vkb3duLCBwTW91c2VJbil7XHJcbiAgICB0aGlzLnBvc2l0aW9uID0gcFBvc2l0aW9uO1xyXG4gICAgdGhpcy5yZWxhdGl2ZVBvc2l0aW9uID0gcFJlbGF0aXZlUG9zaXRpb247XHJcbiAgICB0aGlzLm1vdXNlRG93biA9IHBNb3VzZWRvd247XHJcbiAgICB0aGlzLm1vdXNlSW4gPSBwTW91c2VJbjtcclxufVxyXG5cclxudmFyIHAgPSBtb3VzZVN0YXRlLnByb3RvdHlwZTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbW91c2VTdGF0ZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuZnVuY3Rpb24gcG9pbnQocFgsIHBZKXtcclxuICAgIHRoaXMueCA9IHBYO1xyXG4gICAgdGhpcy55ID0gcFk7XHJcbn1cclxuXHJcbnZhciBwID0gcG9pbnQucHJvdG90eXBlO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBwb2ludDsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIFBvaW50ID0gcmVxdWlyZSgnLi9wb2ludC5qcycpO1xyXG5cclxuZnVuY3Rpb24gdXRpbGl0aWVzKCl7XHJcbn1cclxuXHJcbnZhciBwID0gdXRpbGl0aWVzLnByb3RvdHlwZTtcclxuLy8gcmV0dXJucyBtb3VzZSBwb3NpdGlvbiBpbiBsb2NhbCBjb29yZGluYXRlIHN5c3RlbSBvZiBlbGVtZW50XHJcbnAuZ2V0TW91c2UgPSBmdW5jdGlvbihlKXtcclxuICAgIC8vcmV0dXJuIG5ldyBhcHAuUG9pbnQoKGUucGFnZVggLSBlLnRhcmdldC5vZmZzZXRMZWZ0KSAqIChhcHAubWFpbi5yZW5kZXJXaWR0aCAvIGFjdHVhbENhbnZhc1dpZHRoKSwgKGUucGFnZVkgLSBlLnRhcmdldC5vZmZzZXRUb3ApICogKGFwcC5tYWluLnJlbmRlckhlaWdodCAvIGFjdHVhbENhbnZhc0hlaWdodCkpO1xyXG4gICAgcmV0dXJuIG5ldyBQb2ludCgoZS5wYWdlWCAtIGUudGFyZ2V0Lm9mZnNldExlZnQpLCAoZS5wYWdlWSAtIGUudGFyZ2V0Lm9mZnNldFRvcCkpO1xyXG59XHJcblxyXG5wLm1hcCA9IGZ1bmN0aW9uKHZhbHVlLCBtaW4xLCBtYXgxLCBtaW4yLCBtYXgyKXtcclxuICAgIC8vcmV0dXJuIG1pbjIgKyAobWF4MiAtIG1pbjIpICogKCh2YWx1ZSAtIG1pbjEpIC8gKG1heDEgLSBtaW4xKSk7XHJcbn1cclxuXHJcbnAuY2xhbXAgPSBmdW5jdGlvbih2YWx1ZSwgbWluLCBtYXgpe1xyXG4gICAgLy9yZXR1cm4gTWF0aC5tYXgobWluLCBNYXRoLm1pbihtYXgsIHZhbHVlKSk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdXRpbGl0aWVzOyJdfQ==
