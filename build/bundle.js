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
    document.querySelector('#debugLine').innerHTML = "mousePosition: x = " + mouseState.relativePosition.x + ", y = " + mouseState.relativePosition.y + 
    "<br>Clicked = " + mouseState.mouseDown + 
    "<br>Over Canvas = " + mouseState.mouseIn;
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkYXRhL2xlc3NvbnMuanNvbiIsImpzL21haW4uanMiLCJqcy9tYWluT0xELmpzIiwianMvbW9kdWxlcy9ib2FyZC5qcyIsImpzL21vZHVsZXMvYnV0dG9uLmpzIiwianMvbW9kdWxlcy9kYXRhT2JqZWN0LmpzIiwianMvbW9kdWxlcy9kcmF3TGliLmpzIiwianMvbW9kdWxlcy9nYW1lLmpzIiwianMvbW9kdWxlcy9sZXNzb25Ob2RlLmpzIiwianMvbW9kdWxlcy9tb3VzZVN0YXRlLmpzIiwianMvbW9kdWxlcy9wb2ludC5qcyIsImpzL21vZHVsZXMvdXRpbGl0aWVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHM9e1xyXG4gICAgXCJsZXNzb25zXCI6W1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgXCJ4XCI6IFwiMFwiLFxyXG4gICAgICAgICAgICBcInlcIjogXCIwXCIsXHJcbiAgICAgICAgICAgIFwiaW1hZ2VcIjogXCJkb2cuanBlZ1wiXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFwieFwiOiBcIjEwMFwiLFxyXG4gICAgICAgICAgICBcInlcIjogXCIxMDBcIixcclxuICAgICAgICAgICAgXCJpbWFnZVwiOiBcImRvZy5qcGVnXCJcclxuICAgICAgICB9XHJcbiAgICBdXHJcbn0iLCJcInVzZSBzdHJpY3RcIjtcclxuLy9pbXBvcnRzXHJcbnZhciBHYW1lID0gcmVxdWlyZSgnLi9tb2R1bGVzL2dhbWUuanMnKTtcclxudmFyIFBvaW50ID0gcmVxdWlyZSgnLi9tb2R1bGVzL3BvaW50LmpzJyk7XHJcbnZhciBNb3VzZVN0YXRlID0gcmVxdWlyZSgnLi9tb2R1bGVzL21vdXNlU3RhdGUuanMnKTtcclxuXHJcbi8vdmFyaWFibGVzXHJcbnZhciBnYW1lO1xyXG52YXIgY2FudmFzO1xyXG52YXIgY3R4O1xyXG5cclxudmFyIGhlYWRlcjtcclxudmFyIGFjdGl2ZUhlaWdodDtcclxudmFyIGNlbnRlcjtcclxuXHJcbnZhciBtb3VzZVBvc2l0aW9uO1xyXG52YXIgcmVsYXRpdmVNb3VzZVBvc2l0aW9uO1xyXG52YXIgbW91c2VEb3duO1xyXG52YXIgbW91c2VJbjtcclxuLyphcHAuSU1BR0VTID0ge1xyXG4gICAgdGVzdEltYWdlOiBcImltYWdlcy9kb2cucG5nXCJcclxuIH07Ki9cclxuXHJcbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbihlKXtcclxuICAgIGluaXRpYWxpemVWYXJpYWJsZXMoKTtcclxuICAgIFxyXG4gICAgbG9vcCgpO1xyXG5cdC8qYXBwLm1haW4uYXBwID0gYXBwO1xyXG4gICAgXHJcblx0YXBwLm1haW4udXRpbGl0aWVzID0gYXBwLnV0aWxpdGllcztcclxuXHRhcHAubWFpbi5kcmF3TGliID0gYXBwLmRyYXdMaWI7XHJcbiAgICBhcHAubWFpbi5kYXRhT2JqZWN0ID0gbmV3IGFwcC5kYXRhT2JqZWN0KCk7XHJcbiAgICBhcHAuYm9hcmQuZHJhd0xpYiA9IGFwcC5kcmF3TGliO1xyXG4gICAgYXBwLmxlc3Nvbk5vZGUuZHJhd0xpYiA9IGFwcC5kcmF3TGliO1xyXG4gICAgYXBwLmJvYXJkQnV0dG9uLmRyYXdMaWIgPSBhcHAuZHJhd0xpYjtcclxuICAgIFxyXG5cdGFwcC5xdWV1ZSA9IG5ldyBjcmVhdGVqcy5Mb2FkUXVldWUoZmFsc2UpO1xyXG5cdGFwcC5xdWV1ZS5vbihcImNvbXBsZXRlXCIsIGZ1bmN0aW9uKCl7XHJcblx0XHRhcHAubWFpbi5pbml0KCk7XHJcblx0fSk7XHJcbiAgICBhcHAucXVldWUubG9hZE1hbmlmZXN0KFtcclxuICAgICAgICB7aWQ6IFwiZXhhbXBsZUltYWdlXCIsIHNyYzpcImltYWdlcy9kb2cuanBnXCJ9LFxyXG5cdF0pO1xyXG4gICAgXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIGFwcC5tYWluLmNhbnZhcy53aWR0aCA9IGFwcC5tYWluLmNhbnZhcy5vZmZzZXRXaWR0aDtcclxuICAgICAgICBhcHAubWFpbi5jYW52YXMuaGVpZ2h0ID0gYXBwLm1haW4uY2FudmFzLm9mZnNldEhlaWdodDtcclxuICAgICAgICBhcHAubWFpbi5hY3RpdmVIZWlnaHQgPSBhcHAubWFpbi5jYW52YXMuaGVpZ2h0IC0gYXBwLm1haW4uaGVhZGVyLm9mZnNldEhlaWdodDtcclxuICAgICAgICBhcHAubWFpbi5jZW50ZXIgPSBuZXcgYXBwLnBvaW50KGFwcC5tYWluLmNhbnZhcy53aWR0aCAvIDIsIGFwcC5tYWluLmFjdGl2ZUhlaWdodCAvIDIgKyBhcHAubWFpbi5oZWFkZXIub2Zmc2V0SGVpZ2h0KVxyXG5cdH0pOyovXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRpYWxpemVWYXJpYWJsZXMoKXtcclxuICAgIGNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2NhbnZhcycpO1xyXG4gICAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICBjYW52YXMud2lkdGggPSBjYW52YXMub2Zmc2V0V2lkdGg7XHJcbiAgICBjYW52YXMuaGVpZ2h0ID0gY2FudmFzLm9mZnNldEhlaWdodDtcclxuICAgIGNvbnNvbGUubG9nKFwiQ2FudmFzIERpbWVuc2lvbnM6IFwiICsgY2FudmFzLndpZHRoICsgXCIsIFwiICsgY2FudmFzLmhlaWdodCk7XHJcbiAgICBcclxuICAgIGhlYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2hlYWRlcicpO1xyXG4gICAgYWN0aXZlSGVpZ2h0ID0gY2FudmFzLm9mZnNldEhlaWdodCAtIGhlYWRlci5vZmZzZXRIZWlnaHQ7XHJcbiAgICBjZW50ZXIgPSBuZXcgUG9pbnQoY2FudmFzLndpZHRoLzIsIGFjdGl2ZUhlaWdodC8yICsgaGVhZGVyLm9mZnNldEhlaWdodCk7XHJcbiAgICBcclxuICAgIG1vdXNlUG9zaXRpb24gPSBuZXcgUG9pbnQoMCwwKTtcclxuICAgIHJlbGF0aXZlTW91c2VQb3NpdGlvbiA9IG5ldyBQb2ludCgwLDApO1xyXG4gICAgXHJcbiAgICAvL2V2ZW50IGxpc3RlbmVyIGZvciB3aGVuIHRoZSBtb3VzZSBtb3ZlcyBvdmVyIHRoZSBjYW52YXNcclxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIHZhciBib3VuZFJlY3QgPSBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgbW91c2VQb3NpdGlvbiA9IG5ldyBQb2ludChlLmNsaWVudFggLSBib3VuZFJlY3QubGVmdCwgZS5jbGllbnRZIC0gYm91bmRSZWN0LnRvcCk7XHJcbiAgICAgICAgcmVsYXRpdmVNb3VzZVBvc2l0aW9uID0gbmV3IFBvaW50KG1vdXNlUG9zaXRpb24ueCAtIChjYW52YXMub2Zmc2V0V2lkdGgvMi4wKSwgbW91c2VQb3NpdGlvbi55IC0gKGhlYWRlci5vZmZzZXRIZWlnaHQgKyBhY3RpdmVIZWlnaHQvMi4wKSk7ICAgICAgICBcclxuICAgIH0pO1xyXG4gICAgbW91c2VEb3duID0gZmFsc2U7XHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBmdW5jdGlvbihlKXtcclxuICAgICAgICBtb3VzZURvd24gPSB0cnVlO1xyXG4gICAgfSk7XHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgbW91c2VEb3duID0gZmFsc2U7XHJcbiAgICB9KTtcclxuICAgIG1vdXNlSW4gPSBmYWxzZTtcclxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VvdmVyXCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIG1vdXNlSW4gPSB0cnVlO1xyXG4gICAgfSk7XHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3V0XCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIG1vdXNlSW4gPSBmYWxzZTtcclxuICAgICAgICBtb3VzZURvd24gPSBmYWxzZTtcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICBnYW1lID0gbmV3IEdhbWUoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gbG9vcCgpe1xyXG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShsb29wLmJpbmQodGhpcykpO1xyXG4gICAgZ2FtZS51cGRhdGUoY3R4LCBjYW52YXMsIDAsIGNlbnRlciwgYWN0aXZlSGVpZ2h0LCBuZXcgTW91c2VTdGF0ZShtb3VzZVBvc2l0aW9uLCByZWxhdGl2ZU1vdXNlUG9zaXRpb24sIG1vdXNlRG93biwgbW91c2VJbikpO1xyXG59XHJcblxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBmdW5jdGlvbihlKXtcclxuICAgIGNhbnZhcy53aWR0aCA9IGNhbnZhcy5vZmZzZXRXaWR0aDtcclxuICAgIGNhbnZhcy5oZWlnaHQgPSBjYW52YXMub2Zmc2V0SGVpZ2h0O1xyXG4gICAgYWN0aXZlSGVpZ2h0ID0gY2FudmFzLmhlaWdodCAtIGhlYWRlci5vZmZzZXRIZWlnaHQ7XHJcbiAgICBjZW50ZXIgPSBuZXcgUG9pbnQoY2FudmFzLndpZHRoIC8gMiwgYWN0aXZlSGVpZ2h0IC8gMiArIGhlYWRlci5vZmZzZXRIZWlnaHQpXHJcbiAgICBcclxuICAgIGNvbnNvbGUubG9nKFwiQ2FudmFzIERpbWVuc2lvbnM6IFwiICsgY2FudmFzLndpZHRoICsgXCIsIFwiICsgY2FudmFzLmhlaWdodCk7XHJcbn0pO1xyXG5cclxuXHJcblxyXG4iLCIndXNlIHN0cmljdCc7XHJcbi8vdmFyIHV0aWxpdGllcyA9IHJlcXVpcmUoJy4vdXRpbGl0aWVzLmpzJyk7XHJcbnZhciBhcHAgPSBhcHAgfHwge307XHJcblxyXG5hcHAubWFpbiA9IHsgICAgXHJcbiAgICAvL3ZhcmlhYmxlc1xyXG4gICAgY2FudmFzOiB1bmRlZmluZWQsXHJcbiAgICBjdHg6IHVuZGVmaW5lZCxcclxuICAgIGFwcDogdW5kZWZpbmVkLFxyXG4gICAgdXRpbGl0aWVzOiB1bmRlZmluZWQsXHJcbiAgICBkcmF3TGliOiB1bmRlZmluZWQsXHJcbiAgICBcclxuICAgIG1vdXNlUG9zaXRpb246IHVuZGVmaW5lZCxcclxuICAgIGxhc3RNb3VzZVBvc2l0aW9uOiB1bmRlZmluZWQsXHJcbiAgICByZWxhdGl2ZU1vdXNlUG9zaXRpb246IHVuZGVmaW5lZCxcclxuICAgIGFuaW1hdGlvbklEOiAwLFxyXG5cdGxhc3RUaW1lOiAwLFxyXG4gICAgXHJcbiAgICBoZWFkZXI6IHVuZGVmaW5lZCxcclxuICAgIGFjdGl2ZUhlaWdodDogdW5kZWZpbmVkLFxyXG4gICAgY2VudGVyOiB1bmRlZmluZWQsXHJcbiAgICBib2FyZDogdW5kZWZpbmVkLFxyXG4gICAgXHJcbiAgICBkcmFnZ2luZzogdW5kZWZpbmVkLFxyXG4gICAgY3Vyc29yOiB1bmRlZmluZWQsXHJcbiAgICBcclxuICAgIC8vZGF0YU9iamVjdDogcmVxdWlyZSgnLi9vYmplY3RzL2RhdGFPYmplY3QuanMnKSxcclxuICAgIFxyXG4gICAgLy9lbnVtZXJhdGlvblxyXG4gICAgR0FNRV9TVEFURTogT2JqZWN0LmZyZWV6ZSh7XHRcclxuXHRcdEJPQVJEX1ZJRVc6IDAsXHJcblx0XHRGT0NVU19WSUVXOiAxXHJcblx0fSksXHJcbiAgICBcclxuICAgIGluaXQgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvL3RoaXMuZGVidWdMaW5lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2RlYnVnTGluZScpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignY2FudmFzJyk7XHJcbiAgICAgICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gdGhpcy5jYW52YXMub2Zmc2V0V2lkdGg7XHJcbiAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5jYW52YXMub2Zmc2V0SGVpZ2h0O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubW91c2VQb3NpdGlvbiA9IG5ldyBhcHAucG9pbnQodGhpcy5jYW52YXMud2lkdGgvMiwgdGhpcy5jYW52YXMuaGVpZ2h0LzIpO1xyXG4gICAgICAgIHRoaXMubGFzdE1vdXNlUG9zaXRpb24gPSB0aGlzLm1vdXNlUG9zaXRpb247XHJcbiAgICAgICAgdGhpcy5yZWxhdGl2ZU1vdXNlUG9zaXRpb24gPSB0aGlzLm1vdXNlUG9zaXRpb247XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5oZWFkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdoZWFkZXInKTtcclxuICAgICAgICB0aGlzLmFjdGl2ZUhlaWdodCA9IHRoaXMuY2FudmFzLmhlaWdodCAtIHRoaXMuaGVhZGVyLm9mZnNldEhlaWdodDtcclxuICAgICAgICB0aGlzLmNlbnRlciA9IG5ldyBhcHAucG9pbnQodGhpcy5jYW52YXMud2lkdGgvMiwgdGhpcy5hY3RpdmVIZWlnaHQgLyAyICsgdGhpcy5oZWFkZXIub2Zmc2V0SGVpZ2h0KTtcclxuICAgICAgICAvL2dldCBsaXN0diBvZiBub2RlcyBmcm9tIGRhdGFcclxuICAgICAgICBcclxuICAgICAgICB2YXIgdGVtcExlc3Nvbk5vZGVBcnJheSA9IFtdO1xyXG4gICAgICAgIHRlbXBMZXNzb25Ob2RlQXJyYXkucHVzaChuZXcgYXBwLmxlc3Nvbk5vZGUobmV3IGFwcC5wb2ludCgwLDApKSk7XHJcbiAgICAgICAgdGVtcExlc3Nvbk5vZGVBcnJheS5wdXNoKG5ldyBhcHAubGVzc29uTm9kZShuZXcgYXBwLnBvaW50KDMwMCwzMDApKSk7XHJcbiAgICAgICAgdGVtcExlc3Nvbk5vZGVBcnJheS5wdXNoKG5ldyBhcHAubGVzc29uTm9kZShuZXcgYXBwLnBvaW50KDMwMCwtMzAwKSkpO1xyXG4gICAgICAgIHRoaXMuYm9hcmQgPSBuZXcgYXBwLmJvYXJkKG5ldyBhcHAucG9pbnQoMCwwKSwgdGVtcExlc3Nvbk5vZGVBcnJheSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuY3Vyc29yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJteVBcIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIHRlc3RldGVzdCA9IHRoaXMuZGF0YU9iamVjdC5pbmZvQXJyYXk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9kZW5vdGVzIGdhbWVwbGF5IHN0YXRlXHJcbiAgICAgICAgdGhpcy5nYW1lX3N0YXRlID0gdGhpcy5HQU1FX1NUQVRFLkJPQVJEX1ZJRVc7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9jb25uZWN0aW5nIGV2ZW50c1xyXG4gICAgICAgIHRoaXMuY2FudmFzLm9ubW91c2Vtb3ZlID0gdGhpcy5nZXRNb3VzZVBvc2l0aW9uLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5jYW52YXMub25tb3VzZWRvd24gPSB0aGlzLmRvTW91c2VEb3duLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5jYW52YXMub25tb3VzZXVwID0gdGhpcy5kb01vdXNlVXAuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V3aGVlbFwiLCB0aGlzLmRvV2hlZWwuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9zdGFydCB0aGUgbG9vcFxyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICAvL2xvb3AgZnVuY3Rpb25zXHJcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vY2FsbCB0aGUgbG9vcFxyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uSUQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy51cGRhdGUuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9jYWxjdWxhdGUgZGVsdGEgdGltZVxyXG4gICAgICAgIHZhciBkdCA9IHRoaXMuY2FsY3VsYXRlRGVsdGFUaW1lKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9jbGVhciB0aGUgY2FudmFzXHJcbiAgICAgICAgdGhpcy5kcmF3TGliLmNsZWFyKHRoaXMuY3R4LDAsMCx0aGlzLmNhbnZhcy5vZmZzZXRXaWR0aCx0aGlzLmNhbnZhcy5vZmZzZXRIZWlnaHQpO1xyXG4gICAgICAgIHRoaXMuZHJhd0xpYi5yZWN0KHRoaXMuY3R4LCAwLCAwLCB0aGlzLmNhbnZhcy5vZmZzZXRXaWR0aCwgdGhpcy5jYW52YXMub2Zmc2V0SGVpZ2h0LCBcIldoaXRlXCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vdXBkYXRlXHJcbiAgICAgICAgaWYodGhpcy5nYW1lX3N0YXRlID09IHRoaXMuR0FNRV9TVEFURS5CT0FSRF9WSUVXKXtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vZHJhdyBnYW1lIHNjcmVlblxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5ib2FyZENvbGxpc2lvbkhhbmRsaW5nKCk7XHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmQuZHJhdyh0aGlzLmN0eCwgdGhpcy5jZW50ZXIsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmFjdGl2ZUhlaWdodCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLmRyYXdMaWIuY2lyY2xlKHRoaXMuY3R4LCB0aGlzLm1vdXNlUG9zaXRpb24ueCwgdGhpcy5tb3VzZVBvc2l0aW9uLnksIDEwLCBcIlJveWFsQmx1ZVwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZih0aGlzLmdhbWVfc3RhdGUgPT0gdGhpcy5HQU1FX1NUQVRFLlRJVExFKXtcclxuICAgICAgICAgICAgLy9kcmF3IHRpdGxlIHNjcmVlblxyXG4gICAgICAgIH1cclxuICAgICAgICAvL2N1cnNvciBoYW5kbGluZ1xyXG4gICAgICAgIHRoaXMuY3Vyc29ySGFuZGxlcigpO1xyXG4gICAgICAgIHRoaXMuZGVidWdIdWQodGhpcy5jdHgsIGR0KTtcclxuICAgIH0sXHJcbiAgICBcclxuICAgIGNhbGN1bGF0ZURlbHRhVGltZTogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBub3c7XHJcbiAgICAgICAgdmFyIGZwcztcclxuXHRcdG5vdyA9ICgrIG5ldyBEYXRlKTsgXHJcblx0XHRmcHMgPSAxMDAwIC8gKG5vdyAtIHRoaXMubGFzdFRpbWUpO1xyXG5cdFx0ZnBzID0gYXBwLnV0aWxpdGllcy5jbGFtcChmcHMsIDEyLCA2MCk7XHJcblx0XHR0aGlzLmxhc3RUaW1lID0gbm93OyBcclxuXHRcdHJldHVybiAxL2ZwcztcclxuXHR9LFxyXG4gICAgXHJcbiAgICAvL2hlbHBlciBldmVudCBmdW5jdGlvbnNcclxuICAgIGdldE1vdXNlUG9zaXRpb246IGZ1bmN0aW9uKGUpe1xyXG5cdFx0dGhpcy5sYXN0TW91c2VQb3NpdGlvbiA9IHRoaXMubW91c2VQb3NpdGlvbjtcclxuICAgICAgICB0aGlzLm1vdXNlUG9zaXRpb24gPSBhcHAudXRpbGl0aWVzLmdldE1vdXNlKGUsIHRoaXMuY2FudmFzLm9mZnNldFdpZHRoLCB0aGlzLmNhbnZhcy5vZmZzZXRIZWlnaHQpO1xyXG4gICAgICAgIHRoaXMucmVsYXRpdmVNb3VzZVBvc2l0aW9uID0gbmV3IGFwcC5wb2ludCh0aGlzLm1vdXNlUG9zaXRpb24ueCAtIHRoaXMuY2FudmFzLndpZHRoLzIgKyB0aGlzLmJvYXJkLnBvc2l0aW9uLngsIHRoaXMubW91c2VQb3NpdGlvbi55IC0gdGhpcy5hY3RpdmVIZWlnaHQvMiArIHRoaXMuYm9hcmQucG9zaXRpb24ueSAtIHRoaXMuaGVhZGVyLm9mZnNldEhlaWdodCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYodGhpcy5kcmFnZ2luZyl7XHJcbiAgICAgICAgICAgIC8vdGhlIHBvc2l0aW9uYWwgZGlmZmVyZW5jZSBiZXR3ZWVuIGxhc3QgbG9vcCBhbmQgdGhpc1xyXG4gICAgICAgICAgICB0aGlzLmJvYXJkLm1vdmUodGhpcy5sYXN0TW91c2VQb3NpdGlvbi54IC0gdGhpcy5tb3VzZVBvc2l0aW9uLngsIHRoaXMubGFzdE1vdXNlUG9zaXRpb24ueSAtIHRoaXMubW91c2VQb3NpdGlvbi55KTtcclxuICAgICAgICB9XHJcblx0fSxcclxuICAgIGRvTW91c2VEb3duIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcgPSB0cnVlO1xyXG4gICAgfSxcclxuICAgIGRvTW91c2VVcCA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICB0aGlzLmRyYWdnaW5nID0gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgZG9XaGVlbCA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICB0aGlzLmJvYXJkLnpvb20odGhpcy5jdHgsIHRoaXMuY2VudGVyLCBlLmRlbHRhWSk7XHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICBjdXJzb3JIYW5kbGVyIDogZnVuY3Rpb24oKXtcclxuICAgICAgICAvL2lzIGl0IGhvdmVyaW5nIG92ZXIgdGhlIGNhbnZhcz9cclxuICAgICAgICAvL2lzIGl0IGRyYWdnaW5nP1xyXG4gICAgICAgIGlmKHRoaXMuZHJhZ2dpbmcpe1xyXG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS5jdXJzb3IgPSBcIi13ZWJraXQtZ3JhYmJpbmdcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUuY3Vyc29yID0gXCJkZWZhdWx0XCI7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFxyXG4gICAgYm9hcmRDb2xsaXNpb25IYW5kbGluZyA6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyIGFjdGl2ZU5vZGU7XHJcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMuYm9hcmQubGVzc29uTm9kZUFycmF5Lmxlbmd0aDsgaSsrKXtcclxuICAgICAgICAgICAgYWN0aXZlTm9kZSA9IHRoaXMuYm9hcmQubGVzc29uTm9kZUFycmF5W2ldO1xyXG4gICAgICAgICAgICBpZih0aGlzLnJlbGF0aXZlTW91c2VQb3NpdGlvbi54ID4gYWN0aXZlTm9kZS5wb3NpdGlvbi54IC0gYWN0aXZlTm9kZS53aWR0aC8yICYmIHRoaXMucmVsYXRpdmVNb3VzZVBvc2l0aW9uLnggPCBhY3RpdmVOb2RlLnBvc2l0aW9uLnggKyBhY3RpdmVOb2RlLndpZHRoLzIpe1xyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5yZWxhdGl2ZU1vdXNlUG9zaXRpb24ueSA+IGFjdGl2ZU5vZGUucG9zaXRpb24ueSAtIGFjdGl2ZU5vZGUuaGVpZ2h0LzIgJiYgdGhpcy5yZWxhdGl2ZU1vdXNlUG9zaXRpb24ueSA8IGFjdGl2ZU5vZGUucG9zaXRpb24ueSArIGFjdGl2ZU5vZGUuaGVpZ2h0LzIpe1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZU5vZGUuYm9hcmRCdXR0b24uaG92ZXJlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZU5vZGUuYm9hcmRCdXR0b24uaG92ZXJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICBhY3RpdmVOb2RlLmJvYXJkQnV0dG9uLmhvdmVyZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcclxuICAgIC8vZGVidWdcclxuICAgIGRlYnVnSHVkOiBmdW5jdGlvbihjdHgsIGR0KSB7XHJcbiAgICAgICAgY3R4LnNhdmUoKTtcclxuICAgICAgICB0aGlzLmZpbGxUZXh0KGN0eCwgXCJtb3VzZVBvc2l0aW9uOiBcIiArIHRoaXMubW91c2VQb3NpdGlvbi54ICsgXCIsIFwiICsgdGhpcy5tb3VzZVBvc2l0aW9uLnksIDUwLCB0aGlzLmNhbnZhcy5oZWlnaHQgLSAxMCwgXCIxMnB0IG9zd2FsZFwiLCBcIkJsYWNrXCIpO1xyXG4gICAgICAgIHRoaXMuZmlsbFRleHQoY3R4LFwiUmVsTW91c2VQb3NpdGlvbjogXCIrdGhpcy5yZWxhdGl2ZU1vdXNlUG9zaXRpb24ueCArIFwiLCBcIiArIHRoaXMucmVsYXRpdmVNb3VzZVBvc2l0aW9uLnksIHRoaXMuY2FudmFzLndpZHRoLzIsIHRoaXMuY2FudmFzLmhlaWdodCAtIDEwLFwiMTJwdCBvc3dhbGRcIixcIkJsYWNrXCIpO1xyXG4gICAgICAgIHRoaXMuZmlsbFRleHQoY3R4LCBcImR0OiBcIiArIGR0LnRvRml4ZWQoMyksIHRoaXMuY2FudmFzLndpZHRoIC0gMTUwLCB0aGlzLmNhbnZhcy5oZWlnaHQgLSAxMCwgXCIxMnB0IG9zd2FsZFwiLCBcImJsYWNrXCIpO1xyXG4gICAgICAgIHRoaXMuZHJhd0xpYi5saW5lKGN0eCwgdGhpcy5jZW50ZXIueCwgdGhpcy5jZW50ZXIueSAtIHRoaXMuYWN0aXZlSGVpZ2h0LzIsIHRoaXMuY2VudGVyLngsIHRoaXMuY2VudGVyLnkgKyB0aGlzLmFjdGl2ZUhlaWdodC8yLCAyLCBcIkxpZ2h0Z3JheVwiKTtcclxuICAgICAgICB0aGlzLmRyYXdMaWIubGluZShjdHgsIDAsIHRoaXMuY2VudGVyLnksIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNlbnRlci55LCAyLCBcIkxpZ2h0Z3JheVwiKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmZpbGxUZXh0KGN0eCwgdGhpcy5ib2FyZC5sZXNzb25Ob2RlQXJyYXlbMF0uYm9hcmRCdXR0b24uaG92ZXJlZCwgdGhpcy5jYW52YXMud2lkdGgvMiwgdGhpcy5jYW52YXMuaGVpZ2h0IC0gMzAsIFwiMTJwdCBvc3dhbGRcIiwgXCJibGFja1wiKTtcclxuICAgICAgICB0aGlzLmZpbGxUZXh0KGN0eCwgdGhpcy5ib2FyZC5sZXNzb25Ob2RlQXJyYXlbMV0uYm9hcmRCdXR0b24uaG92ZXJlZCwgdGhpcy5jYW52YXMud2lkdGgvMiwgdGhpcy5jYW52YXMuaGVpZ2h0IC0gNTAsIFwiMTJwdCBvc3dhbGRcIiwgXCJibGFja1wiKTtcclxuICAgICAgICB0aGlzLmZpbGxUZXh0KGN0eCwgdGhpcy5ib2FyZC5sZXNzb25Ob2RlQXJyYXlbMl0uYm9hcmRCdXR0b24uaG92ZXJlZCwgdGhpcy5jYW52YXMud2lkdGgvMiwgdGhpcy5jYW52YXMuaGVpZ2h0IC0gNzAsIFwiMTJwdCBvc3dhbGRcIiwgXCJibGFja1wiKTtcclxuICAgICAgICBcclxuICAgICAgICBjdHgucmVzdG9yZSgpO1xyXG4gICAgfSxcclxuICAgIGZpbGxUZXh0OiBmdW5jdGlvbihjdHgsIHN0cmluZywgeCwgeSwgY3NzLCBjb2xvcikge1xyXG5cdFx0Y3R4LnNhdmUoKTtcclxuXHRcdC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0NTUy9mb250XHJcblx0XHR0aGlzLmN0eC5mb250ID0gY3NzO1xyXG5cdFx0dGhpcy5jdHguZmlsbFN0eWxlID0gY29sb3I7XHJcblx0XHR0aGlzLmN0eC5maWxsVGV4dChzdHJpbmcsIHgsIHkpO1xyXG5cdFx0Y3R4LnJlc3RvcmUoKTtcclxuXHR9LFxyXG59OyIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgcG9zaXRpb247XHJcbnZhciBsZXNzb25Ob2RlQXJyYXk7XHJcblxyXG4vL3BhcmFtZXRlciBpcyBhIHBvaW50IHRoYXQgZGVub3RlcyBzdGFydGluZyBwb3NpdGlvblxyXG5mdW5jdGlvbiBib2FyZChzdGFydFBvc2l0aW9uLCBsZXNzb25Ob2Rlcyl7XHJcbiAgICBwb3NpdGlvbiA9IHN0YXJ0UG9zaXRpb247XHJcbiAgICBsZXNzb25Ob2RlQXJyYXkgPSBsZXNzb25Ob2RlcztcclxufVxyXG5cclxuYm9hcmQuZHJhd0xpYiA9IHVuZGVmaW5lZDtcclxuXHJcbi8vaGVscGVyXHJcbmZ1bmN0aW9uIGNhbGN1bGF0ZUJvdW5kcygpe1xyXG4gICAgaWYodGhpcy5sZXNzb25Ob2RlQXJyYXkubGVuZ3RoID4gMCl7XHJcbiAgICAgICAgdGhpcy5ib3VuZExlZnQgPSB0aGlzLmxlc3Nvbk5vZGVBcnJheVswXS5wb3NpdGlvbi54O1xyXG4gICAgICAgIHRoaXMuYm91bmRSaWdodCA9IHRoaXMubGVzc29uTm9kZUFycmF5WzBdLnBvc2l0aW9uLng7XHJcbiAgICAgICAgdGhpcy5ib3VuZFRvcCA9IHRoaXMubGVzc29uTm9kZUFycmF5WzBdLnBvc2l0aW9uLnk7XHJcbiAgICAgICAgdGhpcy5ib3VuZEJvdHRvbSA9IHRoaXMubGVzc29uTm9kZUFycmF5WzBdLnBvc2l0aW9uLnk7XHJcbiAgICAgICAgZm9yKHZhciBpID0gMTsgaSA8IHRoaXMubGVzc29uTm9kZUFycmF5Lmxlbmd0aDsgaSsrKXtcclxuICAgICAgICAgICAgaWYodGhpcy5ib3VuZExlZnQgPiB0aGlzLmxlc3Nvbk5vZGVBcnJheVtpXS5wb3NpdGlvbi54KXtcclxuICAgICAgICAgICAgICAgIHRoaXMuYm91bmRMZWZ0ID0gdGhpcy5sZXNzb25Ob2RlQXJyYXlbaV0ucG9zaXRpb24ueDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmKHRoaXMuYm91bmRSaWdodCA8IHRoaXMubGVzc29uTm9kZUFycmF5W2ldLnBvc2l0aW9uLngpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib3VuZFJpZ2h0ID4gdGhpcy5sZXNzb25Ob2RlQXJyYXlbaV0ucG9zaXRpb24ueDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZih0aGlzLmJvdW5kVG9wID4gdGhpcy5sZXNzb25Ob2RlQXJyYXlbaV0ucG9zaXRpb24ueSl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvdW5kVG9wID0gdGhpcy5sZXNzb25Ob2RlQXJyYXlbaV0ucG9zaXRpb24ueTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmKHRoaXMuYm91bmRCb3R0b20gPCB0aGlzLmxlc3Nvbk5vZGVBcnJheVtpXS5wb3NpdGlvbi55KXtcclxuICAgICAgICAgICAgICAgIHRoaXMuYm91bmRCb3R0b20gPSB0aGlzLmxlc3Nvbk5vZGVBcnJheVtpXS5wb3NpdGlvbi55O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5cclxuLy9wcm90b3R5cGVcclxudmFyIHAgPSBib2FyZC5wcm90b3R5cGU7XHJcblxyXG5wLm1vdmUgPSBmdW5jdGlvbihwWCwgcFkpe1xyXG4gICAgdGhpcy5wb3NpdGlvbi54ICs9IHBYO1xyXG4gICAgdGhpcy5wb3NpdGlvbi55ICs9IHBZO1xyXG59O1xyXG5cclxucC5kcmF3ID0gZnVuY3Rpb24oY3R4LCBjZW50ZXIsIGFjdGl2ZUhlaWdodCl7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgLy90cmFuc2xhdGUgdG8gdGhlIGNlbnRlciBvZiB0aGUgc2NyZWVuXHJcbiAgICBjdHgudHJhbnNsYXRlKGNlbnRlci54IC0gcG9zaXRpb24ueCwgY2VudGVyLnkgLSBwb3NpdGlvbi55KTtcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBsZXNzb25Ob2RlQXJyYXkubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgIGxlc3Nvbk5vZGVBcnJheVtpXS5kcmF3KGN0eCk7XHJcbiAgICB9XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBib2FyZDtcclxuXHJcbi8vdGhpcyBpcyBhbiBvYmplY3QgbmFtZWQgQm9hcmQgYW5kIHRoaXMgaXMgaXRzIGphdmFzY3JpcHRcclxuLy92YXIgQm9hcmQgPSByZXF1aXJlKCcuL29iamVjdHMvYm9hcmQuanMnKTtcclxuLy92YXIgYiA9IG5ldyBCb2FyZCgpO1xyXG4gICAgIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBwb3NpdGlvbjtcclxudmFyIHdpZHRoO1xyXG52YXIgaGVpZ2h0O1xyXG52YXIgY2xpY2tlZDtcclxudmFyIGhvdmVyZWQ7XHJcblxyXG4vL3BhcmFtZXRlciBpcyBhIHBvaW50IHRoYXQgZGVub3RlcyBzdGFydGluZyBwb3NpdGlvblxyXG5mdW5jdGlvbiBidXR0b24oc3RhcnRQb3NpdGlvbiwgd2lkdGgsIGhlaWdodCl7XHJcbiAgICB0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XHJcbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XHJcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcclxuICAgIHRoaXMuY2xpY2tlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5ob3ZlcmVkID0gZmFsc2U7XHJcbn1cclxuYnV0dG9uLmRyYXdMaWIgPSB1bmRlZmluZWQ7XHJcblxyXG52YXIgcCA9IGJ1dHRvbi5wcm90b3R5cGU7XHJcblxyXG5wLmRyYXcgPSBmdW5jdGlvbihjdHgpe1xyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIHZhciBjb2w7XHJcbiAgICBpZih0aGlzLmhvdmVyZWQpe1xyXG4gICAgICAgIGNvbCA9IFwiZG9kZ2VyYmx1ZVwiO1xyXG4gICAgfVxyXG4gICAgZWxzZXtcclxuICAgICAgICBjb2wgPSBcImxpZ2h0Ymx1ZVwiO1xyXG4gICAgfVxyXG4gICAgLy9kcmF3IHJvdW5kZWQgY29udGFpbmVyXHJcbiAgICBib2FyZEJ1dHRvbi5kcmF3TGliLnJlY3QoY3R4LCB0aGlzLnBvc2l0aW9uLnggLSB0aGlzLndpZHRoLzIsIHRoaXMucG9zaXRpb24ueSAtIHRoaXMuaGVpZ2h0LzIsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCBjb2wpO1xyXG5cclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGJ1dHRvbjsiLCJcInVzZSBzdHJpY3RcIjtcclxuLy90aGUganNvbiBpcyBsb2NhbCwgbm8gbmVlZCBmb3IgeGhyIHdoZW4gdXNpbmcgdGhpcyBtb2R1bGUgcGF0dGVyblxyXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL2RhdGEvbGVzc29ucy5qc29uJyk7XHJcbi8qXHJcbnZhciB4aHIgPSByZXF1aXJlKCd4aHInKTtcclxuXHJcbnZhciBhcHAgPSBhcHAgfHwge307XHJcblxyXG52YXIgaW5mb0FycmF5ID0gdW5kZWZpbmVkO1xyXG5cclxueGhyKHtcclxuICAgIHVyaTogXCJkYXRhL2xlc3NvbnMuanNvblwiLFxyXG4gICAgaGVhZGVyczoge1xyXG4gICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgIFwiSWYtTW9kaWZpZWQtU2luY2VcIjogXCJTYXQsIDEgSmFuIDIwMTAgMDA6MDA6MDAgR01UXCJcclxuICAgIH1cclxufSwgZnVuY3Rpb24gKGVyciwgcmVzcCwgYm9keSkge1xyXG4gICAgdmFyIG15SlNPTiA9IEpTT04ucGFyc2UoYm9keSk7XHJcbiAgICBpbmZvQXJyYXkgPSBteUpTT04ubGVzc29ucztcclxufSk7XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBpbmZvQXJyYXk7XHJcbiovIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmZ1bmN0aW9uIGRyYXdMaWIoKXtcclxuICAgIFxyXG59XHJcblxyXG52YXIgcCA9IGRyYXdMaWIucHJvdG90eXBlO1xyXG5cclxucC5jbGVhciA9IGZ1bmN0aW9uKGN0eCwgeCwgeSwgdywgaCkge1xyXG4gICAgY3R4LmNsZWFyUmVjdCh4LCB5LCB3LCBoKTtcclxufVxyXG5cclxucC5yZWN0ID0gZnVuY3Rpb24oY3R4LCB4LCB5LCB3LCBoLCBjb2wpIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gY29sO1xyXG4gICAgY3R4LmZpbGxSZWN0KHgsIHksIHcsIGgpO1xyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxufVxyXG5cclxucC5saW5lID0gZnVuY3Rpb24oY3R4LCB4MSwgeTEsIHgyLCB5MiwgdGhpY2tuZXNzLCBjb2xvcikge1xyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIGN0eC5tb3ZlVG8oeDEsIHkxKTtcclxuICAgIGN0eC5saW5lVG8oeDIsIHkyKTtcclxuICAgIGN0eC5saW5lV2lkdGggPSB0aGlja25lc3M7XHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBjb2xvcjtcclxuICAgIGN0eC5zdHJva2UoKTtcclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbn1cclxuXHJcbnAuY2lyY2xlID0gZnVuY3Rpb24oY3R4LCB4LCB5LCByYWRpdXMsIGNvbG9yKXtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHguYXJjKHgseSwgcmFkaXVzLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IGNvbG9yO1xyXG4gICAgY3R4LmZpbGwoKTtcclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGJvYXJkQnV0dG9uKGN0eCwgcG9zaXRpb24sIHdpZHRoLCBoZWlnaHQsIGhvdmVyZWQpe1xyXG4gICAgLy9jdHguc2F2ZSgpO1xyXG4gICAgaWYoaG92ZXJlZCl7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwiZG9kZ2VyYmx1ZVwiO1xyXG4gICAgfVxyXG4gICAgZWxzZXtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJsaWdodGJsdWVcIjtcclxuICAgIH1cclxuICAgIC8vZHJhdyByb3VuZGVkIGNvbnRhaW5lclxyXG4gICAgY3R4LnJlY3QocG9zaXRpb24ueCAtIHdpZHRoLzIsIHBvc2l0aW9uLnkgLSBoZWlnaHQvMiwgd2lkdGgsIGhlaWdodCk7XHJcbiAgICBjdHgubGluZVdpZHRoID0gNTtcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9IFwiYmxhY2tcIjtcclxuICAgIGN0eC5zdHJva2UoKTtcclxuICAgIGN0eC5maWxsKCk7XHJcbiAgICAvL2N0eC5yZXN0b3JlKCk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZHJhd0xpYjsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIEJvYXJkID0gcmVxdWlyZSgnLi9ib2FyZC5qcycpO1xyXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuL3BvaW50LmpzJyk7XHJcbnZhciBEcmF3TGliID0gcmVxdWlyZSgnLi9kcmF3TGliLmpzJyk7XHJcbnZhciBMZXNzb25Ob2RlID0gcmVxdWlyZSgnLi9sZXNzb25Ob2RlLmpzJyk7XHJcbnZhciBVdGlsaXRpZXMgPSByZXF1aXJlKCcuL3V0aWxpdGllcy5qcycpO1xyXG5cclxudmFyIGJvYXJkQXJyYXk7XHJcbnZhciBwYWludGVyO1xyXG5cclxudmFyIG1vdXNlU3RhdGU7XHJcblxyXG5mdW5jdGlvbiBnYW1lKCl7XHJcbiAgICBwYWludGVyID0gbmV3IERyYXdMaWIoKTtcclxuICAgIFxyXG4gICAgXHJcbiAgICB2YXIgdGVzdExlc3Nvbk5vZGVBcnJheSA9IFtdO1xyXG4gICAgdGVzdExlc3Nvbk5vZGVBcnJheS5wdXNoKG5ldyBMZXNzb25Ob2RlKG5ldyBQb2ludCgwLDApLCBcImltYWdlcy9kb2cucG5nXCIpKTtcclxuICAgIFxyXG4gICAgYm9hcmRBcnJheSA9IFtdO1xyXG4gICAgYm9hcmRBcnJheS5wdXNoKG5ldyBCb2FyZChuZXcgUG9pbnQoMCwwKSwgdGVzdExlc3Nvbk5vZGVBcnJheSkpO1xyXG4gICAgXHJcbiAgICBcclxufVxyXG5cclxudmFyIHAgPSBnYW1lLnByb3RvdHlwZTtcclxuXHJcbnAudXBkYXRlID0gZnVuY3Rpb24oY3R4LCBjYW52YXMsIGR0LCBjZW50ZXIsIGFjdGl2ZUhlaWdodCwgcE1vdXNlU3RhdGUpe1xyXG4gICAgLy91cGRhdGUgc3R1ZmZcclxuICAgIHAuYWN0KHBNb3VzZVN0YXRlKTtcclxuICAgIC8vZHJhdyBzdHVmZlxyXG4gICAgcC5kcmF3KGN0eCwgY2FudmFzLCBjZW50ZXIsIGFjdGl2ZUhlaWdodCk7XHJcbn1cclxuXHJcbnAuYWN0ID0gZnVuY3Rpb24ocE1vdXNlU3RhdGUpe1xyXG4gICAgbW91c2VTdGF0ZSA9IHBNb3VzZVN0YXRlO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2RlYnVnTGluZScpLmlubmVySFRNTCA9IFwibW91c2VQb3NpdGlvbjogeCA9IFwiICsgbW91c2VTdGF0ZS5yZWxhdGl2ZVBvc2l0aW9uLnggKyBcIiwgeSA9IFwiICsgbW91c2VTdGF0ZS5yZWxhdGl2ZVBvc2l0aW9uLnkgKyBcclxuICAgIFwiPGJyPkNsaWNrZWQgPSBcIiArIG1vdXNlU3RhdGUubW91c2VEb3duICsgXHJcbiAgICBcIjxicj5PdmVyIENhbnZhcyA9IFwiICsgbW91c2VTdGF0ZS5tb3VzZUluO1xyXG59XHJcblxyXG5wLmRyYXcgPSBmdW5jdGlvbihjdHgsIGNhbnZhcywgY2VudGVyLCBhY3RpdmVIZWlnaHQpe1xyXG4gICAgLy9kcmF3IGJvYXJkXHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgcGFpbnRlci5jbGVhcihjdHgsIDAsIDAsIGNhbnZhcy5vZmZzZXRXaWR0aCwgY2FudmFzLm9mZnNldEhlaWdodCk7XHJcbiAgICBwYWludGVyLnJlY3QoY3R4LCAwLCAwLCBjYW52YXMub2Zmc2V0V2lkdGgsIGNhbnZhcy5vZmZzZXRIZWlnaHQsIFwid2hpdGVcIik7XHJcbiAgICBwYWludGVyLmxpbmUoY3R4LCBjYW52YXMub2Zmc2V0V2lkdGgvMiwgY2VudGVyLnkgLSBhY3RpdmVIZWlnaHQvMiwgY2FudmFzLm9mZnNldFdpZHRoLzIsIGNhbnZhcy5vZmZzZXRIZWlnaHQsIDIsIFwibGlnaHRncmF5XCIpO1xyXG4gICAgcGFpbnRlci5saW5lKGN0eCwgMCwgY2VudGVyLnksIGNhbnZhcy5vZmZzZXRXaWR0aCwgY2VudGVyLnksIDIsIFwibGlnaHRHcmF5XCIpO1xyXG4gICAgXHJcbiAgICAvL2RyYXdpbmcgbGVzc29uIG5vZGVzXHJcbiAgICBib2FyZEFycmF5WzBdLmRyYXcoY3R4LCBjZW50ZXIsIGFjdGl2ZUhlaWdodCk7XHJcbiAgICBcclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZ2FtZTsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIEJ1dHRvbiA9IHJlcXVpcmUoJy4vYnV0dG9uLmpzJyk7XHJcblxyXG52YXIgcG9zaXRpb247XHJcbnZhciB3aWR0aDtcclxudmFyIGhlaWdodDtcclxudmFyIGJ1dHRvbjtcclxudmFyIGltYWdlO1xyXG52YXIgc2NhbGVGYWN0b3I7XHJcblxyXG4vL3BhcmFtZXRlciBpcyBhIHBvaW50IHRoYXQgZGVub3RlcyBzdGFydGluZyBwb3NpdGlvblxyXG5mdW5jdGlvbiBsZXNzb25Ob2RlKHN0YXJ0UG9zaXRpb24sIGltYWdlUGF0aCl7XHJcbiAgICBwb3NpdGlvbiA9IHN0YXJ0UG9zaXRpb247XHJcbiAgICB3aWR0aCA9IDEwMDtcclxuICAgIGhlaWdodCA9IDEwMDtcclxuICAgIGJ1dHRvbiA9IG5ldyBCdXR0b24ocG9zaXRpb24sIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgXHJcbiAgICAvL2ltYWdlIGxvYWRpbmdcclxuICAgIHZhciB0ZW1wSW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuICAgIHRyeXtcclxuICAgICAgICB0ZW1wSW1hZ2Uuc3JjID0gaW1hZ2VQYXRoO1xyXG4gICAgICAgIGltYWdlID0gdGVtcEltYWdlO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICB0ZW1wSW1hZ2Uuc3JjID0gXCJpbWFnZXMvZG9nLnBuZ1wiO1xyXG4gICAgICAgIGltYWdlID0gdGVtcEltYWdlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzY2FsZUZhY3RvciA9IDI7XHJcbn1cclxuXHJcbmxlc3Nvbk5vZGUuZHJhd0xpYiA9IHVuZGVmaW5lZDtcclxuXHJcbnZhciBwID0gbGVzc29uTm9kZS5wcm90b3R5cGU7XHJcblxyXG5wLmRyYXcgPSBmdW5jdGlvbihjdHgpe1xyXG4gICAgLy9sZXNzb25Ob2RlLmRyYXdMaWIuY2lyY2xlKGN0eCwgdGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnksIDEwLCBcInJlZFwiKTtcclxuICAgIC8vZHJhdyB0aGUgaW1hZ2UsIHNoYWRvdyBpZiBob3ZlcmVkXHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgaWYoYnV0dG9uLmhvdmVyZWQpe1xyXG4gICAgICAgIC8vY3R4LnNoYWRvd09mZnNldFggPSAxMDtcclxuICAgICAgICAvL2N0eC5zaGFkb3dPZmZzZXRZID0gMTA7XHJcbiAgICAgICAgY3R4LnNoYWRvd0NvbG9yID0gJ2JsdWUnO1xyXG4gICAgICAgIGN0eC5zaGFkb3dCbHVyID0gMzA7XHJcbiAgICB9XHJcbiAgICBjdHguZHJhd0ltYWdlKGltYWdlLCBwb3NpdGlvbi54IC0gKHdpZHRoKnNjYWxlRmFjdG9yKS8yLCBwb3NpdGlvbi55IC0gKGhlaWdodCpzY2FsZUZhY3RvcikvMiwgd2lkdGggKiBzY2FsZUZhY3RvciwgaGVpZ2h0ICogc2NhbGVGYWN0b3IpXHJcbiAgICBcclxuICAgIFxyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbGVzc29uTm9kZTsiLCIvL2tlZXBzIHRyYWNrIG9mIG1vdXNlIHJlbGF0ZWQgdmFyaWFibGVzLlxyXG4vL2NhbGN1bGF0ZWQgaW4gbWFpbiBhbmQgcGFzc2VkIHRvIGdhbWVcclxuLy9jb250YWlucyB1cCBzdGF0ZVxyXG4vL3Bvc2l0aW9uXHJcbi8vcmVsYXRpdmUgcG9zaXRpb25cclxuLy9vbiBjYW52YXNcclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbmZ1bmN0aW9uIG1vdXNlU3RhdGUocFBvc2l0aW9uLCBwUmVsYXRpdmVQb3NpdGlvbiwgcE1vdXNlZG93biwgcE1vdXNlSW4pe1xyXG4gICAgdGhpcy5wb3NpdGlvbiA9IHBQb3NpdGlvbjtcclxuICAgIHRoaXMucmVsYXRpdmVQb3NpdGlvbiA9IHBSZWxhdGl2ZVBvc2l0aW9uO1xyXG4gICAgdGhpcy5tb3VzZURvd24gPSBwTW91c2Vkb3duO1xyXG4gICAgdGhpcy5tb3VzZUluID0gcE1vdXNlSW47XHJcbn1cclxuXHJcbnZhciBwID0gbW91c2VTdGF0ZS5wcm90b3R5cGU7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG1vdXNlU3RhdGU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmZ1bmN0aW9uIHBvaW50KHBYLCBwWSl7XHJcbiAgICB0aGlzLnggPSBwWDtcclxuICAgIHRoaXMueSA9IHBZO1xyXG59XHJcblxyXG52YXIgcCA9IHBvaW50LnByb3RvdHlwZTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gcG9pbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4vcG9pbnQuanMnKTtcclxuXHJcbmZ1bmN0aW9uIHV0aWxpdGllcygpe1xyXG59XHJcblxyXG52YXIgcCA9IHV0aWxpdGllcy5wcm90b3R5cGU7XHJcbi8vIHJldHVybnMgbW91c2UgcG9zaXRpb24gaW4gbG9jYWwgY29vcmRpbmF0ZSBzeXN0ZW0gb2YgZWxlbWVudFxyXG5wLmdldE1vdXNlID0gZnVuY3Rpb24oZSl7XHJcbiAgICAvL3JldHVybiBuZXcgYXBwLlBvaW50KChlLnBhZ2VYIC0gZS50YXJnZXQub2Zmc2V0TGVmdCkgKiAoYXBwLm1haW4ucmVuZGVyV2lkdGggLyBhY3R1YWxDYW52YXNXaWR0aCksIChlLnBhZ2VZIC0gZS50YXJnZXQub2Zmc2V0VG9wKSAqIChhcHAubWFpbi5yZW5kZXJIZWlnaHQgLyBhY3R1YWxDYW52YXNIZWlnaHQpKTtcclxuICAgIHJldHVybiBuZXcgUG9pbnQoKGUucGFnZVggLSBlLnRhcmdldC5vZmZzZXRMZWZ0KSwgKGUucGFnZVkgLSBlLnRhcmdldC5vZmZzZXRUb3ApKTtcclxufVxyXG5cclxucC5tYXAgPSBmdW5jdGlvbih2YWx1ZSwgbWluMSwgbWF4MSwgbWluMiwgbWF4Mil7XHJcbiAgICAvL3JldHVybiBtaW4yICsgKG1heDIgLSBtaW4yKSAqICgodmFsdWUgLSBtaW4xKSAvIChtYXgxIC0gbWluMSkpO1xyXG59XHJcblxyXG5wLmNsYW1wID0gZnVuY3Rpb24odmFsdWUsIG1pbiwgbWF4KXtcclxuICAgIC8vcmV0dXJuIE1hdGgubWF4KG1pbiwgTWF0aC5taW4obWF4LCB2YWx1ZSkpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHV0aWxpdGllczsiXX0=
