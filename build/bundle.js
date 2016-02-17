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
        mouseDown = true;
    });
    mouseIn = false;
    canvas.addEventListener("onmouseover", function(e){
        mouseIn = true;
    });
    canvas.addEventListener("onmouseout", function(e){
        mouseout = false;
    });
    
    game = new Game();
}

function loop(){
    window.requestAnimationFrame(loop.bind(this));
    game.update(ctx, canvas, 0, center, activeHeight, new MouseState(mousePosition, relativeMousePosition, mouseDown));
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
var position;
var lessonNodeArray;

//parameter is a point that denotes starting position
function board(startPosition, lessonNodes){
    position = startPosition;
    lessonNodeArray = lessonNodes;
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
    ctx.translate(center.x - position.x, center.y - position.y);
    for(var i = 0; i < lessonNodeArray.length; i++){
        lessonNodeArray[i].draw(ctx);
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
var painter;

var mouseState;

function game(){
    painter = new DrawLib();
    
    
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
    mouseState = pMouseState;
    document.querySelector('#debugLine').innerHTML = "mousePosition: x = " + mouseState.relativePosition.x + ", y = " + mouseState.relativePosition.y;
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
},{"./board.js":4,"./drawLib.js":7,"./lessonNode.js":10,"./point.js":12,"./utilities.js":13}],10:[function(require,module,exports){
"use strict";
var Button = require('./button.js');

var position;
var width;
var height;
var button;
var image;
var scaleFactor;

//parameter is a point that denotes starting position
function lessonNode(startPosition, imagePath){
    position = startPosition;
    width = 100;
    height = 100;
    button = new Button(position, width, height);
    
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
    
    scaleFactor = 2;
}

lessonNode.drawLib = undefined;

var p = lessonNode.prototype;

p.draw = function(ctx){
    //lessonNode.drawLib.circle(ctx, this.position.x, this.position.y, 10, "red");
    //draw the image, shadow if hovered
    ctx.save();
    if(button.hovered){
        //ctx.shadowOffsetX = 10;
        //ctx.shadowOffsetY = 10;
        ctx.shadowColor = 'blue';
        ctx.shadowBlur = 30;
    }
    ctx.drawImage(image, position.x - (width*scaleFactor)/2, position.y - (height*scaleFactor)/2, width * scaleFactor, height * scaleFactor)
    
    
    ctx.restore();
};

module.exports = lessonNode;
},{"./button.js":5}],11:[function(require,module,exports){
//keeps track of mouse related variables.
//calculated in main and passed to game
//contains up state
//position
//relative position
//on canvas
"use strict";
function mouseState(pPosition, pRelativePosition, pMousedown){
    this.position = pPosition;
    this.relativePosition = pRelativePosition;
    this.mouseDown = pMousedown;
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkYXRhL2xlc3NvbnMuanNvbiIsImpzL21haW4uanMiLCJqcy9tYWluT0xELmpzIiwianMvbW9kdWxlcy9ib2FyZC5qcyIsImpzL21vZHVsZXMvYnV0dG9uLmpzIiwianMvbW9kdWxlcy9kYXRhT2JqZWN0LmpzIiwianMvbW9kdWxlcy9kcmF3TGliLmpzIiwianMvbW9kdWxlcy9nYW1lLmpzIiwianMvbW9kdWxlcy9sZXNzb25Ob2RlLmpzIiwianMvbW9kdWxlcy9tb3VzZVN0YXRlLmpzIiwianMvbW9kdWxlcy9wb2ludC5qcyIsImpzL21vZHVsZXMvdXRpbGl0aWVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHM9e1xyXG4gICAgXCJsZXNzb25zXCI6W1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgXCJ4XCI6IFwiMFwiLFxyXG4gICAgICAgICAgICBcInlcIjogXCIwXCIsXHJcbiAgICAgICAgICAgIFwiaW1hZ2VcIjogXCJkb2cuanBlZ1wiXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFwieFwiOiBcIjEwMFwiLFxyXG4gICAgICAgICAgICBcInlcIjogXCIxMDBcIixcclxuICAgICAgICAgICAgXCJpbWFnZVwiOiBcImRvZy5qcGVnXCJcclxuICAgICAgICB9XHJcbiAgICBdXHJcbn0iLCJcInVzZSBzdHJpY3RcIjtcclxuLy9pbXBvcnRzXHJcbnZhciBHYW1lID0gcmVxdWlyZSgnLi9tb2R1bGVzL2dhbWUuanMnKTtcclxudmFyIFBvaW50ID0gcmVxdWlyZSgnLi9tb2R1bGVzL3BvaW50LmpzJyk7XHJcbnZhciBNb3VzZVN0YXRlID0gcmVxdWlyZSgnLi9tb2R1bGVzL21vdXNlU3RhdGUuanMnKTtcclxuXHJcbi8vdmFyaWFibGVzXHJcbnZhciBnYW1lO1xyXG52YXIgY2FudmFzO1xyXG52YXIgY3R4O1xyXG5cclxudmFyIGhlYWRlcjtcclxudmFyIGFjdGl2ZUhlaWdodDtcclxudmFyIGNlbnRlcjtcclxuXHJcbnZhciBtb3VzZVBvc2l0aW9uO1xyXG52YXIgcmVsYXRpdmVNb3VzZVBvc2l0aW9uO1xyXG52YXIgbW91c2VEb3duO1xyXG52YXIgbW91c2VJbjtcclxuLyphcHAuSU1BR0VTID0ge1xyXG4gICAgdGVzdEltYWdlOiBcImltYWdlcy9kb2cucG5nXCJcclxuIH07Ki9cclxuXHJcbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbihlKXtcclxuICAgIGluaXRpYWxpemVWYXJpYWJsZXMoKTtcclxuICAgIFxyXG4gICAgbG9vcCgpO1xyXG5cdC8qYXBwLm1haW4uYXBwID0gYXBwO1xyXG4gICAgXHJcblx0YXBwLm1haW4udXRpbGl0aWVzID0gYXBwLnV0aWxpdGllcztcclxuXHRhcHAubWFpbi5kcmF3TGliID0gYXBwLmRyYXdMaWI7XHJcbiAgICBhcHAubWFpbi5kYXRhT2JqZWN0ID0gbmV3IGFwcC5kYXRhT2JqZWN0KCk7XHJcbiAgICBhcHAuYm9hcmQuZHJhd0xpYiA9IGFwcC5kcmF3TGliO1xyXG4gICAgYXBwLmxlc3Nvbk5vZGUuZHJhd0xpYiA9IGFwcC5kcmF3TGliO1xyXG4gICAgYXBwLmJvYXJkQnV0dG9uLmRyYXdMaWIgPSBhcHAuZHJhd0xpYjtcclxuICAgIFxyXG5cdGFwcC5xdWV1ZSA9IG5ldyBjcmVhdGVqcy5Mb2FkUXVldWUoZmFsc2UpO1xyXG5cdGFwcC5xdWV1ZS5vbihcImNvbXBsZXRlXCIsIGZ1bmN0aW9uKCl7XHJcblx0XHRhcHAubWFpbi5pbml0KCk7XHJcblx0fSk7XHJcbiAgICBhcHAucXVldWUubG9hZE1hbmlmZXN0KFtcclxuICAgICAgICB7aWQ6IFwiZXhhbXBsZUltYWdlXCIsIHNyYzpcImltYWdlcy9kb2cuanBnXCJ9LFxyXG5cdF0pO1xyXG4gICAgXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIGFwcC5tYWluLmNhbnZhcy53aWR0aCA9IGFwcC5tYWluLmNhbnZhcy5vZmZzZXRXaWR0aDtcclxuICAgICAgICBhcHAubWFpbi5jYW52YXMuaGVpZ2h0ID0gYXBwLm1haW4uY2FudmFzLm9mZnNldEhlaWdodDtcclxuICAgICAgICBhcHAubWFpbi5hY3RpdmVIZWlnaHQgPSBhcHAubWFpbi5jYW52YXMuaGVpZ2h0IC0gYXBwLm1haW4uaGVhZGVyLm9mZnNldEhlaWdodDtcclxuICAgICAgICBhcHAubWFpbi5jZW50ZXIgPSBuZXcgYXBwLnBvaW50KGFwcC5tYWluLmNhbnZhcy53aWR0aCAvIDIsIGFwcC5tYWluLmFjdGl2ZUhlaWdodCAvIDIgKyBhcHAubWFpbi5oZWFkZXIub2Zmc2V0SGVpZ2h0KVxyXG5cdH0pOyovXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRpYWxpemVWYXJpYWJsZXMoKXtcclxuICAgIGNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2NhbnZhcycpO1xyXG4gICAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICBjYW52YXMud2lkdGggPSBjYW52YXMub2Zmc2V0V2lkdGg7XHJcbiAgICBjYW52YXMuaGVpZ2h0ID0gY2FudmFzLm9mZnNldEhlaWdodDtcclxuICAgIGNvbnNvbGUubG9nKFwiQ2FudmFzIERpbWVuc2lvbnM6IFwiICsgY2FudmFzLndpZHRoICsgXCIsIFwiICsgY2FudmFzLmhlaWdodCk7XHJcbiAgICBcclxuICAgIGhlYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2hlYWRlcicpO1xyXG4gICAgYWN0aXZlSGVpZ2h0ID0gY2FudmFzLm9mZnNldEhlaWdodCAtIGhlYWRlci5vZmZzZXRIZWlnaHQ7XHJcbiAgICBjZW50ZXIgPSBuZXcgUG9pbnQoY2FudmFzLndpZHRoLzIsIGFjdGl2ZUhlaWdodC8yICsgaGVhZGVyLm9mZnNldEhlaWdodCk7XHJcbiAgICBcclxuICAgIG1vdXNlUG9zaXRpb24gPSBuZXcgUG9pbnQoMCwwKTtcclxuICAgIHJlbGF0aXZlTW91c2VQb3NpdGlvbiA9IG5ldyBQb2ludCgwLDApO1xyXG4gICAgXHJcbiAgICAvL2V2ZW50IGxpc3RlbmVyIGZvciB3aGVuIHRoZSBtb3VzZSBtb3ZlcyBvdmVyIHRoZSBjYW52YXNcclxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIHZhciBib3VuZFJlY3QgPSBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgbW91c2VQb3NpdGlvbiA9IG5ldyBQb2ludChlLmNsaWVudFggLSBib3VuZFJlY3QubGVmdCwgZS5jbGllbnRZIC0gYm91bmRSZWN0LnRvcCk7XHJcbiAgICAgICAgcmVsYXRpdmVNb3VzZVBvc2l0aW9uID0gbmV3IFBvaW50KG1vdXNlUG9zaXRpb24ueCAtIChjYW52YXMub2Zmc2V0V2lkdGgvMi4wKSwgbW91c2VQb3NpdGlvbi55IC0gKGhlYWRlci5vZmZzZXRIZWlnaHQgKyBhY3RpdmVIZWlnaHQvMi4wKSk7ICAgICAgICBcclxuICAgIH0pO1xyXG4gICAgbW91c2VEb3duID0gZmFsc2U7XHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBmdW5jdGlvbihlKXtcclxuICAgICAgICBtb3VzZURvd24gPSB0cnVlO1xyXG4gICAgfSk7XHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgbW91c2VEb3duID0gdHJ1ZTtcclxuICAgIH0pO1xyXG4gICAgbW91c2VJbiA9IGZhbHNlO1xyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJvbm1vdXNlb3ZlclwiLCBmdW5jdGlvbihlKXtcclxuICAgICAgICBtb3VzZUluID0gdHJ1ZTtcclxuICAgIH0pO1xyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJvbm1vdXNlb3V0XCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIG1vdXNlb3V0ID0gZmFsc2U7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgZ2FtZSA9IG5ldyBHYW1lKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxvb3AoKXtcclxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobG9vcC5iaW5kKHRoaXMpKTtcclxuICAgIGdhbWUudXBkYXRlKGN0eCwgY2FudmFzLCAwLCBjZW50ZXIsIGFjdGl2ZUhlaWdodCwgbmV3IE1vdXNlU3RhdGUobW91c2VQb3NpdGlvbiwgcmVsYXRpdmVNb3VzZVBvc2l0aW9uLCBtb3VzZURvd24pKTtcclxufVxyXG5cclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgZnVuY3Rpb24oZSl7XHJcbiAgICBjYW52YXMud2lkdGggPSBjYW52YXMub2Zmc2V0V2lkdGg7XHJcbiAgICBjYW52YXMuaGVpZ2h0ID0gY2FudmFzLm9mZnNldEhlaWdodDtcclxuICAgIGFjdGl2ZUhlaWdodCA9IGNhbnZhcy5oZWlnaHQgLSBoZWFkZXIub2Zmc2V0SGVpZ2h0O1xyXG4gICAgY2VudGVyID0gbmV3IFBvaW50KGNhbnZhcy53aWR0aCAvIDIsIGFjdGl2ZUhlaWdodCAvIDIgKyBoZWFkZXIub2Zmc2V0SGVpZ2h0KVxyXG4gICAgXHJcbiAgICBjb25zb2xlLmxvZyhcIkNhbnZhcyBEaW1lbnNpb25zOiBcIiArIGNhbnZhcy53aWR0aCArIFwiLCBcIiArIGNhbnZhcy5oZWlnaHQpO1xyXG59KTtcclxuXHJcblxyXG5cclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG4vL3ZhciB1dGlsaXRpZXMgPSByZXF1aXJlKCcuL3V0aWxpdGllcy5qcycpO1xyXG52YXIgYXBwID0gYXBwIHx8IHt9O1xyXG5cclxuYXBwLm1haW4gPSB7ICAgIFxyXG4gICAgLy92YXJpYWJsZXNcclxuICAgIGNhbnZhczogdW5kZWZpbmVkLFxyXG4gICAgY3R4OiB1bmRlZmluZWQsXHJcbiAgICBhcHA6IHVuZGVmaW5lZCxcclxuICAgIHV0aWxpdGllczogdW5kZWZpbmVkLFxyXG4gICAgZHJhd0xpYjogdW5kZWZpbmVkLFxyXG4gICAgXHJcbiAgICBtb3VzZVBvc2l0aW9uOiB1bmRlZmluZWQsXHJcbiAgICBsYXN0TW91c2VQb3NpdGlvbjogdW5kZWZpbmVkLFxyXG4gICAgcmVsYXRpdmVNb3VzZVBvc2l0aW9uOiB1bmRlZmluZWQsXHJcbiAgICBhbmltYXRpb25JRDogMCxcclxuXHRsYXN0VGltZTogMCxcclxuICAgIFxyXG4gICAgaGVhZGVyOiB1bmRlZmluZWQsXHJcbiAgICBhY3RpdmVIZWlnaHQ6IHVuZGVmaW5lZCxcclxuICAgIGNlbnRlcjogdW5kZWZpbmVkLFxyXG4gICAgYm9hcmQ6IHVuZGVmaW5lZCxcclxuICAgIFxyXG4gICAgZHJhZ2dpbmc6IHVuZGVmaW5lZCxcclxuICAgIGN1cnNvcjogdW5kZWZpbmVkLFxyXG4gICAgXHJcbiAgICAvL2RhdGFPYmplY3Q6IHJlcXVpcmUoJy4vb2JqZWN0cy9kYXRhT2JqZWN0LmpzJyksXHJcbiAgICBcclxuICAgIC8vZW51bWVyYXRpb25cclxuICAgIEdBTUVfU1RBVEU6IE9iamVjdC5mcmVlemUoe1x0XHJcblx0XHRCT0FSRF9WSUVXOiAwLFxyXG5cdFx0Rk9DVVNfVklFVzogMVxyXG5cdH0pLFxyXG4gICAgXHJcbiAgICBpbml0IDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy90aGlzLmRlYnVnTGluZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNkZWJ1Z0xpbmUnKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2NhbnZhcycpO1xyXG4gICAgICAgIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgICAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMuY2FudmFzLm9mZnNldFdpZHRoO1xyXG4gICAgICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuY2FudmFzLm9mZnNldEhlaWdodDtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm1vdXNlUG9zaXRpb24gPSBuZXcgYXBwLnBvaW50KHRoaXMuY2FudmFzLndpZHRoLzIsIHRoaXMuY2FudmFzLmhlaWdodC8yKTtcclxuICAgICAgICB0aGlzLmxhc3RNb3VzZVBvc2l0aW9uID0gdGhpcy5tb3VzZVBvc2l0aW9uO1xyXG4gICAgICAgIHRoaXMucmVsYXRpdmVNb3VzZVBvc2l0aW9uID0gdGhpcy5tb3VzZVBvc2l0aW9uO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuaGVhZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaGVhZGVyJyk7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVIZWlnaHQgPSB0aGlzLmNhbnZhcy5oZWlnaHQgLSB0aGlzLmhlYWRlci5vZmZzZXRIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5jZW50ZXIgPSBuZXcgYXBwLnBvaW50KHRoaXMuY2FudmFzLndpZHRoLzIsIHRoaXMuYWN0aXZlSGVpZ2h0IC8gMiArIHRoaXMuaGVhZGVyLm9mZnNldEhlaWdodCk7XHJcbiAgICAgICAgLy9nZXQgbGlzdHYgb2Ygbm9kZXMgZnJvbSBkYXRhXHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIHRlbXBMZXNzb25Ob2RlQXJyYXkgPSBbXTtcclxuICAgICAgICB0ZW1wTGVzc29uTm9kZUFycmF5LnB1c2gobmV3IGFwcC5sZXNzb25Ob2RlKG5ldyBhcHAucG9pbnQoMCwwKSkpO1xyXG4gICAgICAgIHRlbXBMZXNzb25Ob2RlQXJyYXkucHVzaChuZXcgYXBwLmxlc3Nvbk5vZGUobmV3IGFwcC5wb2ludCgzMDAsMzAwKSkpO1xyXG4gICAgICAgIHRlbXBMZXNzb25Ob2RlQXJyYXkucHVzaChuZXcgYXBwLmxlc3Nvbk5vZGUobmV3IGFwcC5wb2ludCgzMDAsLTMwMCkpKTtcclxuICAgICAgICB0aGlzLmJvYXJkID0gbmV3IGFwcC5ib2FyZChuZXcgYXBwLnBvaW50KDAsMCksIHRlbXBMZXNzb25Ob2RlQXJyYXkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmN1cnNvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibXlQXCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciB0ZXN0ZXRlc3QgPSB0aGlzLmRhdGFPYmplY3QuaW5mb0FycmF5O1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vZGVub3RlcyBnYW1lcGxheSBzdGF0ZVxyXG4gICAgICAgIHRoaXMuZ2FtZV9zdGF0ZSA9IHRoaXMuR0FNRV9TVEFURS5CT0FSRF9WSUVXO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vY29ubmVjdGluZyBldmVudHNcclxuICAgICAgICB0aGlzLmNhbnZhcy5vbm1vdXNlbW92ZSA9IHRoaXMuZ2V0TW91c2VQb3NpdGlvbi5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuY2FudmFzLm9ubW91c2Vkb3duID0gdGhpcy5kb01vdXNlRG93bi5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuY2FudmFzLm9ubW91c2V1cCA9IHRoaXMuZG9Nb3VzZVVwLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNld2hlZWxcIiwgdGhpcy5kb1doZWVsLmJpbmQodGhpcykpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vc3RhcnQgdGhlIGxvb3BcclxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgfSxcclxuICAgIFxyXG4gICAgLy9sb29wIGZ1bmN0aW9uc1xyXG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvL2NhbGwgdGhlIGxvb3BcclxuICAgICAgICB0aGlzLmFuaW1hdGlvbklEID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMudXBkYXRlLmJpbmQodGhpcykpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vY2FsY3VsYXRlIGRlbHRhIHRpbWVcclxuICAgICAgICB2YXIgZHQgPSB0aGlzLmNhbGN1bGF0ZURlbHRhVGltZSgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vY2xlYXIgdGhlIGNhbnZhc1xyXG4gICAgICAgIHRoaXMuZHJhd0xpYi5jbGVhcih0aGlzLmN0eCwwLDAsdGhpcy5jYW52YXMub2Zmc2V0V2lkdGgsdGhpcy5jYW52YXMub2Zmc2V0SGVpZ2h0KTtcclxuICAgICAgICB0aGlzLmRyYXdMaWIucmVjdCh0aGlzLmN0eCwgMCwgMCwgdGhpcy5jYW52YXMub2Zmc2V0V2lkdGgsIHRoaXMuY2FudmFzLm9mZnNldEhlaWdodCwgXCJXaGl0ZVwiKTtcclxuICAgICAgICBcclxuICAgICAgICAvL3VwZGF0ZVxyXG4gICAgICAgIGlmKHRoaXMuZ2FtZV9zdGF0ZSA9PSB0aGlzLkdBTUVfU1RBVEUuQk9BUkRfVklFVyl7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvL2RyYXcgZ2FtZSBzY3JlZW5cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmRDb2xsaXNpb25IYW5kbGluZygpO1xyXG4gICAgICAgICAgICB0aGlzLmJvYXJkLmRyYXcodGhpcy5jdHgsIHRoaXMuY2VudGVyLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5hY3RpdmVIZWlnaHQpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5kcmF3TGliLmNpcmNsZSh0aGlzLmN0eCwgdGhpcy5tb3VzZVBvc2l0aW9uLngsIHRoaXMubW91c2VQb3NpdGlvbi55LCAxMCwgXCJSb3lhbEJsdWVcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYodGhpcy5nYW1lX3N0YXRlID09IHRoaXMuR0FNRV9TVEFURS5USVRMRSl7XHJcbiAgICAgICAgICAgIC8vZHJhdyB0aXRsZSBzY3JlZW5cclxuICAgICAgICB9XHJcbiAgICAgICAgLy9jdXJzb3IgaGFuZGxpbmdcclxuICAgICAgICB0aGlzLmN1cnNvckhhbmRsZXIoKTtcclxuICAgICAgICB0aGlzLmRlYnVnSHVkKHRoaXMuY3R4LCBkdCk7XHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICBjYWxjdWxhdGVEZWx0YVRpbWU6IGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgbm93O1xyXG4gICAgICAgIHZhciBmcHM7XHJcblx0XHRub3cgPSAoKyBuZXcgRGF0ZSk7IFxyXG5cdFx0ZnBzID0gMTAwMCAvIChub3cgLSB0aGlzLmxhc3RUaW1lKTtcclxuXHRcdGZwcyA9IGFwcC51dGlsaXRpZXMuY2xhbXAoZnBzLCAxMiwgNjApO1xyXG5cdFx0dGhpcy5sYXN0VGltZSA9IG5vdzsgXHJcblx0XHRyZXR1cm4gMS9mcHM7XHJcblx0fSxcclxuICAgIFxyXG4gICAgLy9oZWxwZXIgZXZlbnQgZnVuY3Rpb25zXHJcbiAgICBnZXRNb3VzZVBvc2l0aW9uOiBmdW5jdGlvbihlKXtcclxuXHRcdHRoaXMubGFzdE1vdXNlUG9zaXRpb24gPSB0aGlzLm1vdXNlUG9zaXRpb247XHJcbiAgICAgICAgdGhpcy5tb3VzZVBvc2l0aW9uID0gYXBwLnV0aWxpdGllcy5nZXRNb3VzZShlLCB0aGlzLmNhbnZhcy5vZmZzZXRXaWR0aCwgdGhpcy5jYW52YXMub2Zmc2V0SGVpZ2h0KTtcclxuICAgICAgICB0aGlzLnJlbGF0aXZlTW91c2VQb3NpdGlvbiA9IG5ldyBhcHAucG9pbnQodGhpcy5tb3VzZVBvc2l0aW9uLnggLSB0aGlzLmNhbnZhcy53aWR0aC8yICsgdGhpcy5ib2FyZC5wb3NpdGlvbi54LCB0aGlzLm1vdXNlUG9zaXRpb24ueSAtIHRoaXMuYWN0aXZlSGVpZ2h0LzIgKyB0aGlzLmJvYXJkLnBvc2l0aW9uLnkgLSB0aGlzLmhlYWRlci5vZmZzZXRIZWlnaHQpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKHRoaXMuZHJhZ2dpbmcpe1xyXG4gICAgICAgICAgICAvL3RoZSBwb3NpdGlvbmFsIGRpZmZlcmVuY2UgYmV0d2VlbiBsYXN0IGxvb3AgYW5kIHRoaXNcclxuICAgICAgICAgICAgdGhpcy5ib2FyZC5tb3ZlKHRoaXMubGFzdE1vdXNlUG9zaXRpb24ueCAtIHRoaXMubW91c2VQb3NpdGlvbi54LCB0aGlzLmxhc3RNb3VzZVBvc2l0aW9uLnkgLSB0aGlzLm1vdXNlUG9zaXRpb24ueSk7XHJcbiAgICAgICAgfVxyXG5cdH0sXHJcbiAgICBkb01vdXNlRG93biA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICB0aGlzLmRyYWdnaW5nID0gdHJ1ZTtcclxuICAgIH0sXHJcbiAgICBkb01vdXNlVXAgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZyA9IGZhbHNlO1xyXG4gICAgfSxcclxuICAgIGRvV2hlZWwgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgdGhpcy5ib2FyZC56b29tKHRoaXMuY3R4LCB0aGlzLmNlbnRlciwgZS5kZWx0YVkpO1xyXG4gICAgfSxcclxuICAgIFxyXG4gICAgY3Vyc29ySGFuZGxlciA6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgLy9pcyBpdCBob3ZlcmluZyBvdmVyIHRoZSBjYW52YXM/XHJcbiAgICAgICAgLy9pcyBpdCBkcmFnZ2luZz9cclxuICAgICAgICBpZih0aGlzLmRyYWdnaW5nKXtcclxuICAgICAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUuY3Vyc29yID0gXCItd2Via2l0LWdyYWJiaW5nXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLmN1cnNvciA9IFwiZGVmYXVsdFwiO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcclxuICAgIGJvYXJkQ29sbGlzaW9uSGFuZGxpbmcgOiBmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciBhY3RpdmVOb2RlO1xyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmJvYXJkLmxlc3Nvbk5vZGVBcnJheS5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgIGFjdGl2ZU5vZGUgPSB0aGlzLmJvYXJkLmxlc3Nvbk5vZGVBcnJheVtpXTtcclxuICAgICAgICAgICAgaWYodGhpcy5yZWxhdGl2ZU1vdXNlUG9zaXRpb24ueCA+IGFjdGl2ZU5vZGUucG9zaXRpb24ueCAtIGFjdGl2ZU5vZGUud2lkdGgvMiAmJiB0aGlzLnJlbGF0aXZlTW91c2VQb3NpdGlvbi54IDwgYWN0aXZlTm9kZS5wb3NpdGlvbi54ICsgYWN0aXZlTm9kZS53aWR0aC8yKXtcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMucmVsYXRpdmVNb3VzZVBvc2l0aW9uLnkgPiBhY3RpdmVOb2RlLnBvc2l0aW9uLnkgLSBhY3RpdmVOb2RlLmhlaWdodC8yICYmIHRoaXMucmVsYXRpdmVNb3VzZVBvc2l0aW9uLnkgPCBhY3RpdmVOb2RlLnBvc2l0aW9uLnkgKyBhY3RpdmVOb2RlLmhlaWdodC8yKXtcclxuICAgICAgICAgICAgICAgICAgICBhY3RpdmVOb2RlLmJvYXJkQnV0dG9uLmhvdmVyZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICBhY3RpdmVOb2RlLmJvYXJkQnV0dG9uLmhvdmVyZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgYWN0aXZlTm9kZS5ib2FyZEJ1dHRvbi5ob3ZlcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICAvL2RlYnVnXHJcbiAgICBkZWJ1Z0h1ZDogZnVuY3Rpb24oY3R4LCBkdCkge1xyXG4gICAgICAgIGN0eC5zYXZlKCk7XHJcbiAgICAgICAgdGhpcy5maWxsVGV4dChjdHgsIFwibW91c2VQb3NpdGlvbjogXCIgKyB0aGlzLm1vdXNlUG9zaXRpb24ueCArIFwiLCBcIiArIHRoaXMubW91c2VQb3NpdGlvbi55LCA1MCwgdGhpcy5jYW52YXMuaGVpZ2h0IC0gMTAsIFwiMTJwdCBvc3dhbGRcIiwgXCJCbGFja1wiKTtcclxuICAgICAgICB0aGlzLmZpbGxUZXh0KGN0eCxcIlJlbE1vdXNlUG9zaXRpb246IFwiK3RoaXMucmVsYXRpdmVNb3VzZVBvc2l0aW9uLnggKyBcIiwgXCIgKyB0aGlzLnJlbGF0aXZlTW91c2VQb3NpdGlvbi55LCB0aGlzLmNhbnZhcy53aWR0aC8yLCB0aGlzLmNhbnZhcy5oZWlnaHQgLSAxMCxcIjEycHQgb3N3YWxkXCIsXCJCbGFja1wiKTtcclxuICAgICAgICB0aGlzLmZpbGxUZXh0KGN0eCwgXCJkdDogXCIgKyBkdC50b0ZpeGVkKDMpLCB0aGlzLmNhbnZhcy53aWR0aCAtIDE1MCwgdGhpcy5jYW52YXMuaGVpZ2h0IC0gMTAsIFwiMTJwdCBvc3dhbGRcIiwgXCJibGFja1wiKTtcclxuICAgICAgICB0aGlzLmRyYXdMaWIubGluZShjdHgsIHRoaXMuY2VudGVyLngsIHRoaXMuY2VudGVyLnkgLSB0aGlzLmFjdGl2ZUhlaWdodC8yLCB0aGlzLmNlbnRlci54LCB0aGlzLmNlbnRlci55ICsgdGhpcy5hY3RpdmVIZWlnaHQvMiwgMiwgXCJMaWdodGdyYXlcIik7XHJcbiAgICAgICAgdGhpcy5kcmF3TGliLmxpbmUoY3R4LCAwLCB0aGlzLmNlbnRlci55LCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jZW50ZXIueSwgMiwgXCJMaWdodGdyYXlcIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5maWxsVGV4dChjdHgsIHRoaXMuYm9hcmQubGVzc29uTm9kZUFycmF5WzBdLmJvYXJkQnV0dG9uLmhvdmVyZWQsIHRoaXMuY2FudmFzLndpZHRoLzIsIHRoaXMuY2FudmFzLmhlaWdodCAtIDMwLCBcIjEycHQgb3N3YWxkXCIsIFwiYmxhY2tcIik7XHJcbiAgICAgICAgdGhpcy5maWxsVGV4dChjdHgsIHRoaXMuYm9hcmQubGVzc29uTm9kZUFycmF5WzFdLmJvYXJkQnV0dG9uLmhvdmVyZWQsIHRoaXMuY2FudmFzLndpZHRoLzIsIHRoaXMuY2FudmFzLmhlaWdodCAtIDUwLCBcIjEycHQgb3N3YWxkXCIsIFwiYmxhY2tcIik7XHJcbiAgICAgICAgdGhpcy5maWxsVGV4dChjdHgsIHRoaXMuYm9hcmQubGVzc29uTm9kZUFycmF5WzJdLmJvYXJkQnV0dG9uLmhvdmVyZWQsIHRoaXMuY2FudmFzLndpZHRoLzIsIHRoaXMuY2FudmFzLmhlaWdodCAtIDcwLCBcIjEycHQgb3N3YWxkXCIsIFwiYmxhY2tcIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuICAgIH0sXHJcbiAgICBmaWxsVGV4dDogZnVuY3Rpb24oY3R4LCBzdHJpbmcsIHgsIHksIGNzcywgY29sb3IpIHtcclxuXHRcdGN0eC5zYXZlKCk7XHJcblx0XHQvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9DU1MvZm9udFxyXG5cdFx0dGhpcy5jdHguZm9udCA9IGNzcztcclxuXHRcdHRoaXMuY3R4LmZpbGxTdHlsZSA9IGNvbG9yO1xyXG5cdFx0dGhpcy5jdHguZmlsbFRleHQoc3RyaW5nLCB4LCB5KTtcclxuXHRcdGN0eC5yZXN0b3JlKCk7XHJcblx0fSxcclxufTsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIHBvc2l0aW9uO1xyXG52YXIgbGVzc29uTm9kZUFycmF5O1xyXG5cclxuLy9wYXJhbWV0ZXIgaXMgYSBwb2ludCB0aGF0IGRlbm90ZXMgc3RhcnRpbmcgcG9zaXRpb25cclxuZnVuY3Rpb24gYm9hcmQoc3RhcnRQb3NpdGlvbiwgbGVzc29uTm9kZXMpe1xyXG4gICAgcG9zaXRpb24gPSBzdGFydFBvc2l0aW9uO1xyXG4gICAgbGVzc29uTm9kZUFycmF5ID0gbGVzc29uTm9kZXM7XHJcbn1cclxuXHJcbmJvYXJkLmRyYXdMaWIgPSB1bmRlZmluZWQ7XHJcblxyXG4vL2hlbHBlclxyXG5mdW5jdGlvbiBjYWxjdWxhdGVCb3VuZHMoKXtcclxuICAgIGlmKHRoaXMubGVzc29uTm9kZUFycmF5Lmxlbmd0aCA+IDApe1xyXG4gICAgICAgIHRoaXMuYm91bmRMZWZ0ID0gdGhpcy5sZXNzb25Ob2RlQXJyYXlbMF0ucG9zaXRpb24ueDtcclxuICAgICAgICB0aGlzLmJvdW5kUmlnaHQgPSB0aGlzLmxlc3Nvbk5vZGVBcnJheVswXS5wb3NpdGlvbi54O1xyXG4gICAgICAgIHRoaXMuYm91bmRUb3AgPSB0aGlzLmxlc3Nvbk5vZGVBcnJheVswXS5wb3NpdGlvbi55O1xyXG4gICAgICAgIHRoaXMuYm91bmRCb3R0b20gPSB0aGlzLmxlc3Nvbk5vZGVBcnJheVswXS5wb3NpdGlvbi55O1xyXG4gICAgICAgIGZvcih2YXIgaSA9IDE7IGkgPCB0aGlzLmxlc3Nvbk5vZGVBcnJheS5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuYm91bmRMZWZ0ID4gdGhpcy5sZXNzb25Ob2RlQXJyYXlbaV0ucG9zaXRpb24ueCl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvdW5kTGVmdCA9IHRoaXMubGVzc29uTm9kZUFycmF5W2ldLnBvc2l0aW9uLng7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZih0aGlzLmJvdW5kUmlnaHQgPCB0aGlzLmxlc3Nvbk5vZGVBcnJheVtpXS5wb3NpdGlvbi54KXtcclxuICAgICAgICAgICAgICAgIHRoaXMuYm91bmRSaWdodCA+IHRoaXMubGVzc29uTm9kZUFycmF5W2ldLnBvc2l0aW9uLng7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYodGhpcy5ib3VuZFRvcCA+IHRoaXMubGVzc29uTm9kZUFycmF5W2ldLnBvc2l0aW9uLnkpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib3VuZFRvcCA9IHRoaXMubGVzc29uTm9kZUFycmF5W2ldLnBvc2l0aW9uLnk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZih0aGlzLmJvdW5kQm90dG9tIDwgdGhpcy5sZXNzb25Ob2RlQXJyYXlbaV0ucG9zaXRpb24ueSl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvdW5kQm90dG9tID0gdGhpcy5sZXNzb25Ob2RlQXJyYXlbaV0ucG9zaXRpb24ueTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuXHJcbi8vcHJvdG90eXBlXHJcbnZhciBwID0gYm9hcmQucHJvdG90eXBlO1xyXG5cclxucC5tb3ZlID0gZnVuY3Rpb24ocFgsIHBZKXtcclxuICAgIHRoaXMucG9zaXRpb24ueCArPSBwWDtcclxuICAgIHRoaXMucG9zaXRpb24ueSArPSBwWTtcclxufTtcclxuXHJcbnAuZHJhdyA9IGZ1bmN0aW9uKGN0eCwgY2VudGVyLCBhY3RpdmVIZWlnaHQpe1xyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIC8vdHJhbnNsYXRlIHRvIHRoZSBjZW50ZXIgb2YgdGhlIHNjcmVlblxyXG4gICAgY3R4LnRyYW5zbGF0ZShjZW50ZXIueCAtIHBvc2l0aW9uLngsIGNlbnRlci55IC0gcG9zaXRpb24ueSk7XHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgbGVzc29uTm9kZUFycmF5Lmxlbmd0aDsgaSsrKXtcclxuICAgICAgICBsZXNzb25Ob2RlQXJyYXlbaV0uZHJhdyhjdHgpO1xyXG4gICAgfVxyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gYm9hcmQ7XHJcblxyXG4vL3RoaXMgaXMgYW4gb2JqZWN0IG5hbWVkIEJvYXJkIGFuZCB0aGlzIGlzIGl0cyBqYXZhc2NyaXB0XHJcbi8vdmFyIEJvYXJkID0gcmVxdWlyZSgnLi9vYmplY3RzL2JvYXJkLmpzJyk7XHJcbi8vdmFyIGIgPSBuZXcgQm9hcmQoKTtcclxuICAgICIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgcG9zaXRpb247XHJcbnZhciB3aWR0aDtcclxudmFyIGhlaWdodDtcclxudmFyIGNsaWNrZWQ7XHJcbnZhciBob3ZlcmVkO1xyXG5cclxuLy9wYXJhbWV0ZXIgaXMgYSBwb2ludCB0aGF0IGRlbm90ZXMgc3RhcnRpbmcgcG9zaXRpb25cclxuZnVuY3Rpb24gYnV0dG9uKHN0YXJ0UG9zaXRpb24sIHdpZHRoLCBoZWlnaHQpe1xyXG4gICAgdGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICB0aGlzLmNsaWNrZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuaG92ZXJlZCA9IGZhbHNlO1xyXG59XHJcbmJ1dHRvbi5kcmF3TGliID0gdW5kZWZpbmVkO1xyXG5cclxudmFyIHAgPSBidXR0b24ucHJvdG90eXBlO1xyXG5cclxucC5kcmF3ID0gZnVuY3Rpb24oY3R4KXtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICB2YXIgY29sO1xyXG4gICAgaWYodGhpcy5ob3ZlcmVkKXtcclxuICAgICAgICBjb2wgPSBcImRvZGdlcmJsdWVcIjtcclxuICAgIH1cclxuICAgIGVsc2V7XHJcbiAgICAgICAgY29sID0gXCJsaWdodGJsdWVcIjtcclxuICAgIH1cclxuICAgIC8vZHJhdyByb3VuZGVkIGNvbnRhaW5lclxyXG4gICAgYm9hcmRCdXR0b24uZHJhd0xpYi5yZWN0KGN0eCwgdGhpcy5wb3NpdGlvbi54IC0gdGhpcy53aWR0aC8yLCB0aGlzLnBvc2l0aW9uLnkgLSB0aGlzLmhlaWdodC8yLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgY29sKTtcclxuXHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBidXR0b247IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vdGhlIGpzb24gaXMgbG9jYWwsIG5vIG5lZWQgZm9yIHhociB3aGVuIHVzaW5nIHRoaXMgbW9kdWxlIHBhdHRlcm5cclxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9kYXRhL2xlc3NvbnMuanNvbicpO1xyXG4vKlxyXG52YXIgeGhyID0gcmVxdWlyZSgneGhyJyk7XHJcblxyXG52YXIgYXBwID0gYXBwIHx8IHt9O1xyXG5cclxudmFyIGluZm9BcnJheSA9IHVuZGVmaW5lZDtcclxuXHJcbnhocih7XHJcbiAgICB1cmk6IFwiZGF0YS9sZXNzb25zLmpzb25cIixcclxuICAgIGhlYWRlcnM6IHtcclxuICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuICAgICAgICBcIklmLU1vZGlmaWVkLVNpbmNlXCI6IFwiU2F0LCAxIEphbiAyMDEwIDAwOjAwOjAwIEdNVFwiXHJcbiAgICB9XHJcbn0sIGZ1bmN0aW9uIChlcnIsIHJlc3AsIGJvZHkpIHtcclxuICAgIHZhciBteUpTT04gPSBKU09OLnBhcnNlKGJvZHkpO1xyXG4gICAgaW5mb0FycmF5ID0gbXlKU09OLmxlc3NvbnM7XHJcbn0pO1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gaW5mb0FycmF5O1xyXG4qLyIsIlwidXNlIHN0cmljdFwiO1xyXG5mdW5jdGlvbiBkcmF3TGliKCl7XHJcbiAgICBcclxufVxyXG5cclxudmFyIHAgPSBkcmF3TGliLnByb3RvdHlwZTtcclxuXHJcbnAuY2xlYXIgPSBmdW5jdGlvbihjdHgsIHgsIHksIHcsIGgpIHtcclxuICAgIGN0eC5jbGVhclJlY3QoeCwgeSwgdywgaCk7XHJcbn1cclxuXHJcbnAucmVjdCA9IGZ1bmN0aW9uKGN0eCwgeCwgeSwgdywgaCwgY29sKSB7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IGNvbDtcclxuICAgIGN0eC5maWxsUmVjdCh4LCB5LCB3LCBoKTtcclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbn1cclxuXHJcbnAubGluZSA9IGZ1bmN0aW9uKGN0eCwgeDEsIHkxLCB4MiwgeTIsIHRoaWNrbmVzcywgY29sb3IpIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHgubW92ZVRvKHgxLCB5MSk7XHJcbiAgICBjdHgubGluZVRvKHgyLCB5Mik7XHJcbiAgICBjdHgubGluZVdpZHRoID0gdGhpY2tuZXNzO1xyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gY29sb3I7XHJcbiAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG59XHJcblxyXG5wLmNpcmNsZSA9IGZ1bmN0aW9uKGN0eCwgeCwgeSwgcmFkaXVzLCBjb2xvcil7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgY3R4LmFyYyh4LHksIHJhZGl1cywgMCwgMiAqIE1hdGguUEksIGZhbHNlKTtcclxuICAgIGN0eC5maWxsU3R5bGUgPSBjb2xvcjtcclxuICAgIGN0eC5maWxsKCk7XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBib2FyZEJ1dHRvbihjdHgsIHBvc2l0aW9uLCB3aWR0aCwgaGVpZ2h0LCBob3ZlcmVkKXtcclxuICAgIC8vY3R4LnNhdmUoKTtcclxuICAgIGlmKGhvdmVyZWQpe1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBcImRvZGdlcmJsdWVcIjtcclxuICAgIH1cclxuICAgIGVsc2V7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwibGlnaHRibHVlXCI7XHJcbiAgICB9XHJcbiAgICAvL2RyYXcgcm91bmRlZCBjb250YWluZXJcclxuICAgIGN0eC5yZWN0KHBvc2l0aW9uLnggLSB3aWR0aC8yLCBwb3NpdGlvbi55IC0gaGVpZ2h0LzIsIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgY3R4LmxpbmVXaWR0aCA9IDU7XHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBcImJsYWNrXCI7XHJcbiAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICBjdHguZmlsbCgpO1xyXG4gICAgLy9jdHgucmVzdG9yZSgpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGRyYXdMaWI7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBCb2FyZCA9IHJlcXVpcmUoJy4vYm9hcmQuanMnKTtcclxudmFyIFBvaW50ID0gcmVxdWlyZSgnLi9wb2ludC5qcycpO1xyXG52YXIgRHJhd0xpYiA9IHJlcXVpcmUoJy4vZHJhd0xpYi5qcycpO1xyXG52YXIgTGVzc29uTm9kZSA9IHJlcXVpcmUoJy4vbGVzc29uTm9kZS5qcycpO1xyXG52YXIgVXRpbGl0aWVzID0gcmVxdWlyZSgnLi91dGlsaXRpZXMuanMnKTtcclxuXHJcbnZhciBib2FyZEFycmF5O1xyXG52YXIgcGFpbnRlcjtcclxuXHJcbnZhciBtb3VzZVN0YXRlO1xyXG5cclxuZnVuY3Rpb24gZ2FtZSgpe1xyXG4gICAgcGFpbnRlciA9IG5ldyBEcmF3TGliKCk7XHJcbiAgICBcclxuICAgIFxyXG4gICAgdmFyIHRlc3RMZXNzb25Ob2RlQXJyYXkgPSBbXTtcclxuICAgIHRlc3RMZXNzb25Ob2RlQXJyYXkucHVzaChuZXcgTGVzc29uTm9kZShuZXcgUG9pbnQoMCwwKSwgXCJpbWFnZXMvZG9nLnBuZ1wiKSk7XHJcbiAgICBcclxuICAgIGJvYXJkQXJyYXkgPSBbXTtcclxuICAgIGJvYXJkQXJyYXkucHVzaChuZXcgQm9hcmQobmV3IFBvaW50KDAsMCksIHRlc3RMZXNzb25Ob2RlQXJyYXkpKTtcclxuICAgIFxyXG4gICAgXHJcbn1cclxuXHJcbnZhciBwID0gZ2FtZS5wcm90b3R5cGU7XHJcblxyXG5wLnVwZGF0ZSA9IGZ1bmN0aW9uKGN0eCwgY2FudmFzLCBkdCwgY2VudGVyLCBhY3RpdmVIZWlnaHQsIHBNb3VzZVN0YXRlKXtcclxuICAgIC8vdXBkYXRlIHN0dWZmXHJcbiAgICBwLmFjdChwTW91c2VTdGF0ZSk7XHJcbiAgICAvL2RyYXcgc3R1ZmZcclxuICAgIHAuZHJhdyhjdHgsIGNhbnZhcywgY2VudGVyLCBhY3RpdmVIZWlnaHQpO1xyXG59XHJcblxyXG5wLmFjdCA9IGZ1bmN0aW9uKHBNb3VzZVN0YXRlKXtcclxuICAgIG1vdXNlU3RhdGUgPSBwTW91c2VTdGF0ZTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNkZWJ1Z0xpbmUnKS5pbm5lckhUTUwgPSBcIm1vdXNlUG9zaXRpb246IHggPSBcIiArIG1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbi54ICsgXCIsIHkgPSBcIiArIG1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbi55O1xyXG59XHJcblxyXG5wLmRyYXcgPSBmdW5jdGlvbihjdHgsIGNhbnZhcywgY2VudGVyLCBhY3RpdmVIZWlnaHQpe1xyXG4gICAgLy9kcmF3IGJvYXJkXHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgcGFpbnRlci5jbGVhcihjdHgsIDAsIDAsIGNhbnZhcy5vZmZzZXRXaWR0aCwgY2FudmFzLm9mZnNldEhlaWdodCk7XHJcbiAgICBwYWludGVyLnJlY3QoY3R4LCAwLCAwLCBjYW52YXMub2Zmc2V0V2lkdGgsIGNhbnZhcy5vZmZzZXRIZWlnaHQsIFwid2hpdGVcIik7XHJcbiAgICBwYWludGVyLmxpbmUoY3R4LCBjYW52YXMub2Zmc2V0V2lkdGgvMiwgY2VudGVyLnkgLSBhY3RpdmVIZWlnaHQvMiwgY2FudmFzLm9mZnNldFdpZHRoLzIsIGNhbnZhcy5vZmZzZXRIZWlnaHQsIDIsIFwibGlnaHRncmF5XCIpO1xyXG4gICAgcGFpbnRlci5saW5lKGN0eCwgMCwgY2VudGVyLnksIGNhbnZhcy5vZmZzZXRXaWR0aCwgY2VudGVyLnksIDIsIFwibGlnaHRHcmF5XCIpO1xyXG4gICAgXHJcbiAgICAvL2RyYXdpbmcgbGVzc29uIG5vZGVzXHJcbiAgICBib2FyZEFycmF5WzBdLmRyYXcoY3R4LCBjZW50ZXIsIGFjdGl2ZUhlaWdodCk7XHJcbiAgICBcclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZ2FtZTsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIEJ1dHRvbiA9IHJlcXVpcmUoJy4vYnV0dG9uLmpzJyk7XHJcblxyXG52YXIgcG9zaXRpb247XHJcbnZhciB3aWR0aDtcclxudmFyIGhlaWdodDtcclxudmFyIGJ1dHRvbjtcclxudmFyIGltYWdlO1xyXG52YXIgc2NhbGVGYWN0b3I7XHJcblxyXG4vL3BhcmFtZXRlciBpcyBhIHBvaW50IHRoYXQgZGVub3RlcyBzdGFydGluZyBwb3NpdGlvblxyXG5mdW5jdGlvbiBsZXNzb25Ob2RlKHN0YXJ0UG9zaXRpb24sIGltYWdlUGF0aCl7XHJcbiAgICBwb3NpdGlvbiA9IHN0YXJ0UG9zaXRpb247XHJcbiAgICB3aWR0aCA9IDEwMDtcclxuICAgIGhlaWdodCA9IDEwMDtcclxuICAgIGJ1dHRvbiA9IG5ldyBCdXR0b24ocG9zaXRpb24sIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgXHJcbiAgICAvL2ltYWdlIGxvYWRpbmdcclxuICAgIHZhciB0ZW1wSW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuICAgIHRyeXtcclxuICAgICAgICB0ZW1wSW1hZ2Uuc3JjID0gaW1hZ2VQYXRoO1xyXG4gICAgICAgIGltYWdlID0gdGVtcEltYWdlO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICB0ZW1wSW1hZ2Uuc3JjID0gXCJpbWFnZXMvZG9nLnBuZ1wiO1xyXG4gICAgICAgIGltYWdlID0gdGVtcEltYWdlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzY2FsZUZhY3RvciA9IDI7XHJcbn1cclxuXHJcbmxlc3Nvbk5vZGUuZHJhd0xpYiA9IHVuZGVmaW5lZDtcclxuXHJcbnZhciBwID0gbGVzc29uTm9kZS5wcm90b3R5cGU7XHJcblxyXG5wLmRyYXcgPSBmdW5jdGlvbihjdHgpe1xyXG4gICAgLy9sZXNzb25Ob2RlLmRyYXdMaWIuY2lyY2xlKGN0eCwgdGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnksIDEwLCBcInJlZFwiKTtcclxuICAgIC8vZHJhdyB0aGUgaW1hZ2UsIHNoYWRvdyBpZiBob3ZlcmVkXHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgaWYoYnV0dG9uLmhvdmVyZWQpe1xyXG4gICAgICAgIC8vY3R4LnNoYWRvd09mZnNldFggPSAxMDtcclxuICAgICAgICAvL2N0eC5zaGFkb3dPZmZzZXRZID0gMTA7XHJcbiAgICAgICAgY3R4LnNoYWRvd0NvbG9yID0gJ2JsdWUnO1xyXG4gICAgICAgIGN0eC5zaGFkb3dCbHVyID0gMzA7XHJcbiAgICB9XHJcbiAgICBjdHguZHJhd0ltYWdlKGltYWdlLCBwb3NpdGlvbi54IC0gKHdpZHRoKnNjYWxlRmFjdG9yKS8yLCBwb3NpdGlvbi55IC0gKGhlaWdodCpzY2FsZUZhY3RvcikvMiwgd2lkdGggKiBzY2FsZUZhY3RvciwgaGVpZ2h0ICogc2NhbGVGYWN0b3IpXHJcbiAgICBcclxuICAgIFxyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbGVzc29uTm9kZTsiLCIvL2tlZXBzIHRyYWNrIG9mIG1vdXNlIHJlbGF0ZWQgdmFyaWFibGVzLlxyXG4vL2NhbGN1bGF0ZWQgaW4gbWFpbiBhbmQgcGFzc2VkIHRvIGdhbWVcclxuLy9jb250YWlucyB1cCBzdGF0ZVxyXG4vL3Bvc2l0aW9uXHJcbi8vcmVsYXRpdmUgcG9zaXRpb25cclxuLy9vbiBjYW52YXNcclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbmZ1bmN0aW9uIG1vdXNlU3RhdGUocFBvc2l0aW9uLCBwUmVsYXRpdmVQb3NpdGlvbiwgcE1vdXNlZG93bil7XHJcbiAgICB0aGlzLnBvc2l0aW9uID0gcFBvc2l0aW9uO1xyXG4gICAgdGhpcy5yZWxhdGl2ZVBvc2l0aW9uID0gcFJlbGF0aXZlUG9zaXRpb247XHJcbiAgICB0aGlzLm1vdXNlRG93biA9IHBNb3VzZWRvd247XHJcbn1cclxuXHJcbnZhciBwID0gbW91c2VTdGF0ZS5wcm90b3R5cGU7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG1vdXNlU3RhdGU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmZ1bmN0aW9uIHBvaW50KHBYLCBwWSl7XHJcbiAgICB0aGlzLnggPSBwWDtcclxuICAgIHRoaXMueSA9IHBZO1xyXG59XHJcblxyXG52YXIgcCA9IHBvaW50LnByb3RvdHlwZTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gcG9pbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4vcG9pbnQuanMnKTtcclxuXHJcbmZ1bmN0aW9uIHV0aWxpdGllcygpe1xyXG59XHJcblxyXG52YXIgcCA9IHV0aWxpdGllcy5wcm90b3R5cGU7XHJcbi8vIHJldHVybnMgbW91c2UgcG9zaXRpb24gaW4gbG9jYWwgY29vcmRpbmF0ZSBzeXN0ZW0gb2YgZWxlbWVudFxyXG5wLmdldE1vdXNlID0gZnVuY3Rpb24oZSl7XHJcbiAgICAvL3JldHVybiBuZXcgYXBwLlBvaW50KChlLnBhZ2VYIC0gZS50YXJnZXQub2Zmc2V0TGVmdCkgKiAoYXBwLm1haW4ucmVuZGVyV2lkdGggLyBhY3R1YWxDYW52YXNXaWR0aCksIChlLnBhZ2VZIC0gZS50YXJnZXQub2Zmc2V0VG9wKSAqIChhcHAubWFpbi5yZW5kZXJIZWlnaHQgLyBhY3R1YWxDYW52YXNIZWlnaHQpKTtcclxuICAgIHJldHVybiBuZXcgUG9pbnQoKGUucGFnZVggLSBlLnRhcmdldC5vZmZzZXRMZWZ0KSwgKGUucGFnZVkgLSBlLnRhcmdldC5vZmZzZXRUb3ApKTtcclxufVxyXG5cclxucC5tYXAgPSBmdW5jdGlvbih2YWx1ZSwgbWluMSwgbWF4MSwgbWluMiwgbWF4Mil7XHJcbiAgICAvL3JldHVybiBtaW4yICsgKG1heDIgLSBtaW4yKSAqICgodmFsdWUgLSBtaW4xKSAvIChtYXgxIC0gbWluMSkpO1xyXG59XHJcblxyXG5wLmNsYW1wID0gZnVuY3Rpb24odmFsdWUsIG1pbiwgbWF4KXtcclxuICAgIC8vcmV0dXJuIE1hdGgubWF4KG1pbiwgTWF0aC5taW4obWF4LCB2YWx1ZSkpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHV0aWxpdGllczsiXX0=
