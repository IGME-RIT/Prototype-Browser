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

//variables
var game;
var canvas;
var ctx;

var header;
var activeHeight;
var center;

var mousePosition;
var relativeMousePosition;
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
    
    game = new Game();
}

function loop(){
    window.requestAnimationFrame(loop.bind(this));
    game.update(ctx, canvas, 0, center, activeHeight, mousePosition, relativeMousePosition);
}

window.addEventListener("resize", function(e){
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    activeHeight = canvas.height - header.offsetHeight;
    center = new Point(canvas.width / 2, activeHeight / 2 + header.offsetHeight)
    
    console.log("Canvas Dimensions: " + canvas.width + ", " + canvas.height);
});


},{"./modules/game.js":9,"./modules/point.js":12}],3:[function(require,module,exports){
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

var mousePosition;
var relativeMousePosition;
var mouseDown;

function game(){
    painter = new DrawLib();
    
    mouseDown = false;
    
    var testLessonNodeArray = [];
    testLessonNodeArray.push(new LessonNode(new Point(0,0), "images/dog.png"));
    
    boardArray = [];
    boardArray.push(new Board(new Point(0,0), testLessonNodeArray));
    
    
}

var p = game.prototype;

p.update = function(ctx, canvas, dt, center, activeHeight, pMousePosition, pRelativeMousePosition){
    //update stuff
    p.act(pMousePosition, pRelativeMousePosition);
    //draw stuff
    p.draw(ctx, canvas, center, activeHeight);
}

p.act = function(pMousePosition, pRelativeMousePosition){
    mousePosition = pMousePosition;
    relativeMousePosition = pRelativeMousePosition;
    document.querySelector('#debugLine').innerHTML = "mousePosition: x = " + relativeMousePosition.x + ", y = " + relativeMousePosition.y;
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkYXRhL2xlc3NvbnMuanNvbiIsImpzL21haW4uanMiLCJqcy9tYWluT0xELmpzIiwianMvbW9kdWxlcy9ib2FyZC5qcyIsImpzL21vZHVsZXMvYnV0dG9uLmpzIiwianMvbW9kdWxlcy9kYXRhT2JqZWN0LmpzIiwianMvbW9kdWxlcy9kcmF3TGliLmpzIiwianMvbW9kdWxlcy9nYW1lLmpzIiwianMvbW9kdWxlcy9sZXNzb25Ob2RlLmpzIiwianMvbW9kdWxlcy9tb3VzZVN0YXRlLmpzIiwianMvbW9kdWxlcy9wb2ludC5qcyIsImpzL21vZHVsZXMvdXRpbGl0aWVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzPXtcclxuICAgIFwibGVzc29uc1wiOltcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFwieFwiOiBcIjBcIixcclxuICAgICAgICAgICAgXCJ5XCI6IFwiMFwiLFxyXG4gICAgICAgICAgICBcImltYWdlXCI6IFwiZG9nLmpwZWdcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBcInhcIjogXCIxMDBcIixcclxuICAgICAgICAgICAgXCJ5XCI6IFwiMTAwXCIsXHJcbiAgICAgICAgICAgIFwiaW1hZ2VcIjogXCJkb2cuanBlZ1wiXHJcbiAgICAgICAgfVxyXG4gICAgXVxyXG59IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vaW1wb3J0c1xyXG52YXIgR2FtZSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9nYW1lLmpzJyk7XHJcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4vbW9kdWxlcy9wb2ludC5qcycpO1xyXG5cclxuLy92YXJpYWJsZXNcclxudmFyIGdhbWU7XHJcbnZhciBjYW52YXM7XHJcbnZhciBjdHg7XHJcblxyXG52YXIgaGVhZGVyO1xyXG52YXIgYWN0aXZlSGVpZ2h0O1xyXG52YXIgY2VudGVyO1xyXG5cclxudmFyIG1vdXNlUG9zaXRpb247XHJcbnZhciByZWxhdGl2ZU1vdXNlUG9zaXRpb247XHJcbi8qYXBwLklNQUdFUyA9IHtcclxuICAgIHRlc3RJbWFnZTogXCJpbWFnZXMvZG9nLnBuZ1wiXHJcbiB9OyovXHJcblxyXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24oZSl7XHJcbiAgICBpbml0aWFsaXplVmFyaWFibGVzKCk7XHJcbiAgICBcclxuICAgIGxvb3AoKTtcclxuXHQvKmFwcC5tYWluLmFwcCA9IGFwcDtcclxuICAgIFxyXG5cdGFwcC5tYWluLnV0aWxpdGllcyA9IGFwcC51dGlsaXRpZXM7XHJcblx0YXBwLm1haW4uZHJhd0xpYiA9IGFwcC5kcmF3TGliO1xyXG4gICAgYXBwLm1haW4uZGF0YU9iamVjdCA9IG5ldyBhcHAuZGF0YU9iamVjdCgpO1xyXG4gICAgYXBwLmJvYXJkLmRyYXdMaWIgPSBhcHAuZHJhd0xpYjtcclxuICAgIGFwcC5sZXNzb25Ob2RlLmRyYXdMaWIgPSBhcHAuZHJhd0xpYjtcclxuICAgIGFwcC5ib2FyZEJ1dHRvbi5kcmF3TGliID0gYXBwLmRyYXdMaWI7XHJcbiAgICBcclxuXHRhcHAucXVldWUgPSBuZXcgY3JlYXRlanMuTG9hZFF1ZXVlKGZhbHNlKTtcclxuXHRhcHAucXVldWUub24oXCJjb21wbGV0ZVwiLCBmdW5jdGlvbigpe1xyXG5cdFx0YXBwLm1haW4uaW5pdCgpO1xyXG5cdH0pO1xyXG4gICAgYXBwLnF1ZXVlLmxvYWRNYW5pZmVzdChbXHJcbiAgICAgICAge2lkOiBcImV4YW1wbGVJbWFnZVwiLCBzcmM6XCJpbWFnZXMvZG9nLmpwZ1wifSxcclxuXHRdKTtcclxuICAgIFxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIixmdW5jdGlvbihlKXtcclxuICAgICAgICBhcHAubWFpbi5jYW52YXMud2lkdGggPSBhcHAubWFpbi5jYW52YXMub2Zmc2V0V2lkdGg7XHJcbiAgICAgICAgYXBwLm1haW4uY2FudmFzLmhlaWdodCA9IGFwcC5tYWluLmNhbnZhcy5vZmZzZXRIZWlnaHQ7XHJcbiAgICAgICAgYXBwLm1haW4uYWN0aXZlSGVpZ2h0ID0gYXBwLm1haW4uY2FudmFzLmhlaWdodCAtIGFwcC5tYWluLmhlYWRlci5vZmZzZXRIZWlnaHQ7XHJcbiAgICAgICAgYXBwLm1haW4uY2VudGVyID0gbmV3IGFwcC5wb2ludChhcHAubWFpbi5jYW52YXMud2lkdGggLyAyLCBhcHAubWFpbi5hY3RpdmVIZWlnaHQgLyAyICsgYXBwLm1haW4uaGVhZGVyLm9mZnNldEhlaWdodClcclxuXHR9KTsqL1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0aWFsaXplVmFyaWFibGVzKCl7XHJcbiAgICBjYW52YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdjYW52YXMnKTtcclxuICAgIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgY2FudmFzLndpZHRoID0gY2FudmFzLm9mZnNldFdpZHRoO1xyXG4gICAgY2FudmFzLmhlaWdodCA9IGNhbnZhcy5vZmZzZXRIZWlnaHQ7XHJcbiAgICBjb25zb2xlLmxvZyhcIkNhbnZhcyBEaW1lbnNpb25zOiBcIiArIGNhbnZhcy53aWR0aCArIFwiLCBcIiArIGNhbnZhcy5oZWlnaHQpO1xyXG4gICAgXHJcbiAgICBoZWFkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdoZWFkZXInKTtcclxuICAgIGFjdGl2ZUhlaWdodCA9IGNhbnZhcy5vZmZzZXRIZWlnaHQgLSBoZWFkZXIub2Zmc2V0SGVpZ2h0O1xyXG4gICAgY2VudGVyID0gbmV3IFBvaW50KGNhbnZhcy53aWR0aC8yLCBhY3RpdmVIZWlnaHQvMiArIGhlYWRlci5vZmZzZXRIZWlnaHQpO1xyXG4gICAgXHJcbiAgICBtb3VzZVBvc2l0aW9uID0gbmV3IFBvaW50KDAsMCk7XHJcbiAgICByZWxhdGl2ZU1vdXNlUG9zaXRpb24gPSBuZXcgUG9pbnQoMCwwKTtcclxuICAgIFxyXG4gICAgLy9ldmVudCBsaXN0ZW5lciBmb3Igd2hlbiB0aGUgbW91c2UgbW92ZXMgb3ZlciB0aGUgY2FudmFzXHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBmdW5jdGlvbihlKXtcclxuICAgICAgICB2YXIgYm91bmRSZWN0ID0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIG1vdXNlUG9zaXRpb24gPSBuZXcgUG9pbnQoZS5jbGllbnRYIC0gYm91bmRSZWN0LmxlZnQsIGUuY2xpZW50WSAtIGJvdW5kUmVjdC50b3ApO1xyXG4gICAgICAgIHJlbGF0aXZlTW91c2VQb3NpdGlvbiA9IG5ldyBQb2ludChtb3VzZVBvc2l0aW9uLnggLSAoY2FudmFzLm9mZnNldFdpZHRoLzIuMCksIG1vdXNlUG9zaXRpb24ueSAtIChoZWFkZXIub2Zmc2V0SGVpZ2h0ICsgYWN0aXZlSGVpZ2h0LzIuMCkpOyAgICAgICAgXHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgZ2FtZSA9IG5ldyBHYW1lKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxvb3AoKXtcclxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobG9vcC5iaW5kKHRoaXMpKTtcclxuICAgIGdhbWUudXBkYXRlKGN0eCwgY2FudmFzLCAwLCBjZW50ZXIsIGFjdGl2ZUhlaWdodCwgbW91c2VQb3NpdGlvbiwgcmVsYXRpdmVNb3VzZVBvc2l0aW9uKTtcclxufVxyXG5cclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgZnVuY3Rpb24oZSl7XHJcbiAgICBjYW52YXMud2lkdGggPSBjYW52YXMub2Zmc2V0V2lkdGg7XHJcbiAgICBjYW52YXMuaGVpZ2h0ID0gY2FudmFzLm9mZnNldEhlaWdodDtcclxuICAgIGFjdGl2ZUhlaWdodCA9IGNhbnZhcy5oZWlnaHQgLSBoZWFkZXIub2Zmc2V0SGVpZ2h0O1xyXG4gICAgY2VudGVyID0gbmV3IFBvaW50KGNhbnZhcy53aWR0aCAvIDIsIGFjdGl2ZUhlaWdodCAvIDIgKyBoZWFkZXIub2Zmc2V0SGVpZ2h0KVxyXG4gICAgXHJcbiAgICBjb25zb2xlLmxvZyhcIkNhbnZhcyBEaW1lbnNpb25zOiBcIiArIGNhbnZhcy53aWR0aCArIFwiLCBcIiArIGNhbnZhcy5oZWlnaHQpO1xyXG59KTtcclxuXHJcbiIsIid1c2Ugc3RyaWN0JztcclxuLy92YXIgdXRpbGl0aWVzID0gcmVxdWlyZSgnLi91dGlsaXRpZXMuanMnKTtcclxudmFyIGFwcCA9IGFwcCB8fCB7fTtcclxuXHJcbmFwcC5tYWluID0geyAgICBcclxuICAgIC8vdmFyaWFibGVzXHJcbiAgICBjYW52YXM6IHVuZGVmaW5lZCxcclxuICAgIGN0eDogdW5kZWZpbmVkLFxyXG4gICAgYXBwOiB1bmRlZmluZWQsXHJcbiAgICB1dGlsaXRpZXM6IHVuZGVmaW5lZCxcclxuICAgIGRyYXdMaWI6IHVuZGVmaW5lZCxcclxuICAgIFxyXG4gICAgbW91c2VQb3NpdGlvbjogdW5kZWZpbmVkLFxyXG4gICAgbGFzdE1vdXNlUG9zaXRpb246IHVuZGVmaW5lZCxcclxuICAgIHJlbGF0aXZlTW91c2VQb3NpdGlvbjogdW5kZWZpbmVkLFxyXG4gICAgYW5pbWF0aW9uSUQ6IDAsXHJcblx0bGFzdFRpbWU6IDAsXHJcbiAgICBcclxuICAgIGhlYWRlcjogdW5kZWZpbmVkLFxyXG4gICAgYWN0aXZlSGVpZ2h0OiB1bmRlZmluZWQsXHJcbiAgICBjZW50ZXI6IHVuZGVmaW5lZCxcclxuICAgIGJvYXJkOiB1bmRlZmluZWQsXHJcbiAgICBcclxuICAgIGRyYWdnaW5nOiB1bmRlZmluZWQsXHJcbiAgICBjdXJzb3I6IHVuZGVmaW5lZCxcclxuICAgIFxyXG4gICAgLy9kYXRhT2JqZWN0OiByZXF1aXJlKCcuL29iamVjdHMvZGF0YU9iamVjdC5qcycpLFxyXG4gICAgXHJcbiAgICAvL2VudW1lcmF0aW9uXHJcbiAgICBHQU1FX1NUQVRFOiBPYmplY3QuZnJlZXplKHtcdFxyXG5cdFx0Qk9BUkRfVklFVzogMCxcclxuXHRcdEZPQ1VTX1ZJRVc6IDFcclxuXHR9KSxcclxuICAgIFxyXG4gICAgaW5pdCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vdGhpcy5kZWJ1Z0xpbmUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZGVidWdMaW5lJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdjYW52YXMnKTtcclxuICAgICAgICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICAgICAgdGhpcy5jYW52YXMud2lkdGggPSB0aGlzLmNhbnZhcy5vZmZzZXRXaWR0aDtcclxuICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmNhbnZhcy5vZmZzZXRIZWlnaHQ7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5tb3VzZVBvc2l0aW9uID0gbmV3IGFwcC5wb2ludCh0aGlzLmNhbnZhcy53aWR0aC8yLCB0aGlzLmNhbnZhcy5oZWlnaHQvMik7XHJcbiAgICAgICAgdGhpcy5sYXN0TW91c2VQb3NpdGlvbiA9IHRoaXMubW91c2VQb3NpdGlvbjtcclxuICAgICAgICB0aGlzLnJlbGF0aXZlTW91c2VQb3NpdGlvbiA9IHRoaXMubW91c2VQb3NpdGlvbjtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmhlYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2hlYWRlcicpO1xyXG4gICAgICAgIHRoaXMuYWN0aXZlSGVpZ2h0ID0gdGhpcy5jYW52YXMuaGVpZ2h0IC0gdGhpcy5oZWFkZXIub2Zmc2V0SGVpZ2h0O1xyXG4gICAgICAgIHRoaXMuY2VudGVyID0gbmV3IGFwcC5wb2ludCh0aGlzLmNhbnZhcy53aWR0aC8yLCB0aGlzLmFjdGl2ZUhlaWdodCAvIDIgKyB0aGlzLmhlYWRlci5vZmZzZXRIZWlnaHQpO1xyXG4gICAgICAgIC8vZ2V0IGxpc3R2IG9mIG5vZGVzIGZyb20gZGF0YVxyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciB0ZW1wTGVzc29uTm9kZUFycmF5ID0gW107XHJcbiAgICAgICAgdGVtcExlc3Nvbk5vZGVBcnJheS5wdXNoKG5ldyBhcHAubGVzc29uTm9kZShuZXcgYXBwLnBvaW50KDAsMCkpKTtcclxuICAgICAgICB0ZW1wTGVzc29uTm9kZUFycmF5LnB1c2gobmV3IGFwcC5sZXNzb25Ob2RlKG5ldyBhcHAucG9pbnQoMzAwLDMwMCkpKTtcclxuICAgICAgICB0ZW1wTGVzc29uTm9kZUFycmF5LnB1c2gobmV3IGFwcC5sZXNzb25Ob2RlKG5ldyBhcHAucG9pbnQoMzAwLC0zMDApKSk7XHJcbiAgICAgICAgdGhpcy5ib2FyZCA9IG5ldyBhcHAuYm9hcmQobmV3IGFwcC5wb2ludCgwLDApLCB0ZW1wTGVzc29uTm9kZUFycmF5KTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmRyYWdnaW5nID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5jdXJzb3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm15UFwiKTtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgdGVzdGV0ZXN0ID0gdGhpcy5kYXRhT2JqZWN0LmluZm9BcnJheTtcclxuICAgICAgICBcclxuICAgICAgICAvL2Rlbm90ZXMgZ2FtZXBsYXkgc3RhdGVcclxuICAgICAgICB0aGlzLmdhbWVfc3RhdGUgPSB0aGlzLkdBTUVfU1RBVEUuQk9BUkRfVklFVztcclxuICAgICAgICBcclxuICAgICAgICAvL2Nvbm5lY3RpbmcgZXZlbnRzXHJcbiAgICAgICAgdGhpcy5jYW52YXMub25tb3VzZW1vdmUgPSB0aGlzLmdldE1vdXNlUG9zaXRpb24uYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLmNhbnZhcy5vbm1vdXNlZG93biA9IHRoaXMuZG9Nb3VzZURvd24uYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLmNhbnZhcy5vbm1vdXNldXAgPSB0aGlzLmRvTW91c2VVcC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXdoZWVsXCIsIHRoaXMuZG9XaGVlbC5iaW5kKHRoaXMpKTtcclxuICAgICAgICBcclxuICAgICAgICAvL3N0YXJ0IHRoZSBsb29wXHJcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuICAgIH0sXHJcbiAgICBcclxuICAgIC8vbG9vcCBmdW5jdGlvbnNcclxuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy9jYWxsIHRoZSBsb29wXHJcbiAgICAgICAgdGhpcy5hbmltYXRpb25JRCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpKTtcclxuICAgICAgICBcclxuICAgICAgICAvL2NhbGN1bGF0ZSBkZWx0YSB0aW1lXHJcbiAgICAgICAgdmFyIGR0ID0gdGhpcy5jYWxjdWxhdGVEZWx0YVRpbWUoKTtcclxuICAgICAgICBcclxuICAgICAgICAvL2NsZWFyIHRoZSBjYW52YXNcclxuICAgICAgICB0aGlzLmRyYXdMaWIuY2xlYXIodGhpcy5jdHgsMCwwLHRoaXMuY2FudmFzLm9mZnNldFdpZHRoLHRoaXMuY2FudmFzLm9mZnNldEhlaWdodCk7XHJcbiAgICAgICAgdGhpcy5kcmF3TGliLnJlY3QodGhpcy5jdHgsIDAsIDAsIHRoaXMuY2FudmFzLm9mZnNldFdpZHRoLCB0aGlzLmNhbnZhcy5vZmZzZXRIZWlnaHQsIFwiV2hpdGVcIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy91cGRhdGVcclxuICAgICAgICBpZih0aGlzLmdhbWVfc3RhdGUgPT0gdGhpcy5HQU1FX1NUQVRFLkJPQVJEX1ZJRVcpe1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy9kcmF3IGdhbWUgc2NyZWVuXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLmJvYXJkQ29sbGlzaW9uSGFuZGxpbmcoKTtcclxuICAgICAgICAgICAgdGhpcy5ib2FyZC5kcmF3KHRoaXMuY3R4LCB0aGlzLmNlbnRlciwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuYWN0aXZlSGVpZ2h0KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuZHJhd0xpYi5jaXJjbGUodGhpcy5jdHgsIHRoaXMubW91c2VQb3NpdGlvbi54LCB0aGlzLm1vdXNlUG9zaXRpb24ueSwgMTAsIFwiUm95YWxCbHVlXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKHRoaXMuZ2FtZV9zdGF0ZSA9PSB0aGlzLkdBTUVfU1RBVEUuVElUTEUpe1xyXG4gICAgICAgICAgICAvL2RyYXcgdGl0bGUgc2NyZWVuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vY3Vyc29yIGhhbmRsaW5nXHJcbiAgICAgICAgdGhpcy5jdXJzb3JIYW5kbGVyKCk7XHJcbiAgICAgICAgdGhpcy5kZWJ1Z0h1ZCh0aGlzLmN0eCwgZHQpO1xyXG4gICAgfSxcclxuICAgIFxyXG4gICAgY2FsY3VsYXRlRGVsdGFUaW1lOiBmdW5jdGlvbigpe1xyXG5cdFx0dmFyIG5vdztcclxuICAgICAgICB2YXIgZnBzO1xyXG5cdFx0bm93ID0gKCsgbmV3IERhdGUpOyBcclxuXHRcdGZwcyA9IDEwMDAgLyAobm93IC0gdGhpcy5sYXN0VGltZSk7XHJcblx0XHRmcHMgPSBhcHAudXRpbGl0aWVzLmNsYW1wKGZwcywgMTIsIDYwKTtcclxuXHRcdHRoaXMubGFzdFRpbWUgPSBub3c7IFxyXG5cdFx0cmV0dXJuIDEvZnBzO1xyXG5cdH0sXHJcbiAgICBcclxuICAgIC8vaGVscGVyIGV2ZW50IGZ1bmN0aW9uc1xyXG4gICAgZ2V0TW91c2VQb3NpdGlvbjogZnVuY3Rpb24oZSl7XHJcblx0XHR0aGlzLmxhc3RNb3VzZVBvc2l0aW9uID0gdGhpcy5tb3VzZVBvc2l0aW9uO1xyXG4gICAgICAgIHRoaXMubW91c2VQb3NpdGlvbiA9IGFwcC51dGlsaXRpZXMuZ2V0TW91c2UoZSwgdGhpcy5jYW52YXMub2Zmc2V0V2lkdGgsIHRoaXMuY2FudmFzLm9mZnNldEhlaWdodCk7XHJcbiAgICAgICAgdGhpcy5yZWxhdGl2ZU1vdXNlUG9zaXRpb24gPSBuZXcgYXBwLnBvaW50KHRoaXMubW91c2VQb3NpdGlvbi54IC0gdGhpcy5jYW52YXMud2lkdGgvMiArIHRoaXMuYm9hcmQucG9zaXRpb24ueCwgdGhpcy5tb3VzZVBvc2l0aW9uLnkgLSB0aGlzLmFjdGl2ZUhlaWdodC8yICsgdGhpcy5ib2FyZC5wb3NpdGlvbi55IC0gdGhpcy5oZWFkZXIub2Zmc2V0SGVpZ2h0KTtcclxuICAgICAgICBcclxuICAgICAgICBpZih0aGlzLmRyYWdnaW5nKXtcclxuICAgICAgICAgICAgLy90aGUgcG9zaXRpb25hbCBkaWZmZXJlbmNlIGJldHdlZW4gbGFzdCBsb29wIGFuZCB0aGlzXHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmQubW92ZSh0aGlzLmxhc3RNb3VzZVBvc2l0aW9uLnggLSB0aGlzLm1vdXNlUG9zaXRpb24ueCwgdGhpcy5sYXN0TW91c2VQb3NpdGlvbi55IC0gdGhpcy5tb3VzZVBvc2l0aW9uLnkpO1xyXG4gICAgICAgIH1cclxuXHR9LFxyXG4gICAgZG9Nb3VzZURvd24gOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZyA9IHRydWU7XHJcbiAgICB9LFxyXG4gICAgZG9Nb3VzZVVwIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcgPSBmYWxzZTtcclxuICAgIH0sXHJcbiAgICBkb1doZWVsIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIHRoaXMuYm9hcmQuem9vbSh0aGlzLmN0eCwgdGhpcy5jZW50ZXIsIGUuZGVsdGFZKTtcclxuICAgIH0sXHJcbiAgICBcclxuICAgIGN1cnNvckhhbmRsZXIgOiBmdW5jdGlvbigpe1xyXG4gICAgICAgIC8vaXMgaXQgaG92ZXJpbmcgb3ZlciB0aGUgY2FudmFzP1xyXG4gICAgICAgIC8vaXMgaXQgZHJhZ2dpbmc/XHJcbiAgICAgICAgaWYodGhpcy5kcmFnZ2luZyl7XHJcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLmN1cnNvciA9IFwiLXdlYmtpdC1ncmFiYmluZ1wiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS5jdXJzb3IgPSBcImRlZmF1bHRcIjtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICBib2FyZENvbGxpc2lvbkhhbmRsaW5nIDogZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgYWN0aXZlTm9kZTtcclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5ib2FyZC5sZXNzb25Ob2RlQXJyYXkubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgICAgICBhY3RpdmVOb2RlID0gdGhpcy5ib2FyZC5sZXNzb25Ob2RlQXJyYXlbaV07XHJcbiAgICAgICAgICAgIGlmKHRoaXMucmVsYXRpdmVNb3VzZVBvc2l0aW9uLnggPiBhY3RpdmVOb2RlLnBvc2l0aW9uLnggLSBhY3RpdmVOb2RlLndpZHRoLzIgJiYgdGhpcy5yZWxhdGl2ZU1vdXNlUG9zaXRpb24ueCA8IGFjdGl2ZU5vZGUucG9zaXRpb24ueCArIGFjdGl2ZU5vZGUud2lkdGgvMil7XHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLnJlbGF0aXZlTW91c2VQb3NpdGlvbi55ID4gYWN0aXZlTm9kZS5wb3NpdGlvbi55IC0gYWN0aXZlTm9kZS5oZWlnaHQvMiAmJiB0aGlzLnJlbGF0aXZlTW91c2VQb3NpdGlvbi55IDwgYWN0aXZlTm9kZS5wb3NpdGlvbi55ICsgYWN0aXZlTm9kZS5oZWlnaHQvMil7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlTm9kZS5ib2FyZEJ1dHRvbi5ob3ZlcmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlTm9kZS5ib2FyZEJ1dHRvbi5ob3ZlcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgIGFjdGl2ZU5vZGUuYm9hcmRCdXR0b24uaG92ZXJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFxyXG4gICAgLy9kZWJ1Z1xyXG4gICAgZGVidWdIdWQ6IGZ1bmN0aW9uKGN0eCwgZHQpIHtcclxuICAgICAgICBjdHguc2F2ZSgpO1xyXG4gICAgICAgIHRoaXMuZmlsbFRleHQoY3R4LCBcIm1vdXNlUG9zaXRpb246IFwiICsgdGhpcy5tb3VzZVBvc2l0aW9uLnggKyBcIiwgXCIgKyB0aGlzLm1vdXNlUG9zaXRpb24ueSwgNTAsIHRoaXMuY2FudmFzLmhlaWdodCAtIDEwLCBcIjEycHQgb3N3YWxkXCIsIFwiQmxhY2tcIik7XHJcbiAgICAgICAgdGhpcy5maWxsVGV4dChjdHgsXCJSZWxNb3VzZVBvc2l0aW9uOiBcIit0aGlzLnJlbGF0aXZlTW91c2VQb3NpdGlvbi54ICsgXCIsIFwiICsgdGhpcy5yZWxhdGl2ZU1vdXNlUG9zaXRpb24ueSwgdGhpcy5jYW52YXMud2lkdGgvMiwgdGhpcy5jYW52YXMuaGVpZ2h0IC0gMTAsXCIxMnB0IG9zd2FsZFwiLFwiQmxhY2tcIik7XHJcbiAgICAgICAgdGhpcy5maWxsVGV4dChjdHgsIFwiZHQ6IFwiICsgZHQudG9GaXhlZCgzKSwgdGhpcy5jYW52YXMud2lkdGggLSAxNTAsIHRoaXMuY2FudmFzLmhlaWdodCAtIDEwLCBcIjEycHQgb3N3YWxkXCIsIFwiYmxhY2tcIik7XHJcbiAgICAgICAgdGhpcy5kcmF3TGliLmxpbmUoY3R4LCB0aGlzLmNlbnRlci54LCB0aGlzLmNlbnRlci55IC0gdGhpcy5hY3RpdmVIZWlnaHQvMiwgdGhpcy5jZW50ZXIueCwgdGhpcy5jZW50ZXIueSArIHRoaXMuYWN0aXZlSGVpZ2h0LzIsIDIsIFwiTGlnaHRncmF5XCIpO1xyXG4gICAgICAgIHRoaXMuZHJhd0xpYi5saW5lKGN0eCwgMCwgdGhpcy5jZW50ZXIueSwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2VudGVyLnksIDIsIFwiTGlnaHRncmF5XCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuZmlsbFRleHQoY3R4LCB0aGlzLmJvYXJkLmxlc3Nvbk5vZGVBcnJheVswXS5ib2FyZEJ1dHRvbi5ob3ZlcmVkLCB0aGlzLmNhbnZhcy53aWR0aC8yLCB0aGlzLmNhbnZhcy5oZWlnaHQgLSAzMCwgXCIxMnB0IG9zd2FsZFwiLCBcImJsYWNrXCIpO1xyXG4gICAgICAgIHRoaXMuZmlsbFRleHQoY3R4LCB0aGlzLmJvYXJkLmxlc3Nvbk5vZGVBcnJheVsxXS5ib2FyZEJ1dHRvbi5ob3ZlcmVkLCB0aGlzLmNhbnZhcy53aWR0aC8yLCB0aGlzLmNhbnZhcy5oZWlnaHQgLSA1MCwgXCIxMnB0IG9zd2FsZFwiLCBcImJsYWNrXCIpO1xyXG4gICAgICAgIHRoaXMuZmlsbFRleHQoY3R4LCB0aGlzLmJvYXJkLmxlc3Nvbk5vZGVBcnJheVsyXS5ib2FyZEJ1dHRvbi5ob3ZlcmVkLCB0aGlzLmNhbnZhcy53aWR0aC8yLCB0aGlzLmNhbnZhcy5oZWlnaHQgLSA3MCwgXCIxMnB0IG9zd2FsZFwiLCBcImJsYWNrXCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGN0eC5yZXN0b3JlKCk7XHJcbiAgICB9LFxyXG4gICAgZmlsbFRleHQ6IGZ1bmN0aW9uKGN0eCwgc3RyaW5nLCB4LCB5LCBjc3MsIGNvbG9yKSB7XHJcblx0XHRjdHguc2F2ZSgpO1xyXG5cdFx0Ly8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQ1NTL2ZvbnRcclxuXHRcdHRoaXMuY3R4LmZvbnQgPSBjc3M7XHJcblx0XHR0aGlzLmN0eC5maWxsU3R5bGUgPSBjb2xvcjtcclxuXHRcdHRoaXMuY3R4LmZpbGxUZXh0KHN0cmluZywgeCwgeSk7XHJcblx0XHRjdHgucmVzdG9yZSgpO1xyXG5cdH0sXHJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBwb3NpdGlvbjtcclxudmFyIGxlc3Nvbk5vZGVBcnJheTtcclxuXHJcbi8vcGFyYW1ldGVyIGlzIGEgcG9pbnQgdGhhdCBkZW5vdGVzIHN0YXJ0aW5nIHBvc2l0aW9uXHJcbmZ1bmN0aW9uIGJvYXJkKHN0YXJ0UG9zaXRpb24sIGxlc3Nvbk5vZGVzKXtcclxuICAgIHBvc2l0aW9uID0gc3RhcnRQb3NpdGlvbjtcclxuICAgIGxlc3Nvbk5vZGVBcnJheSA9IGxlc3Nvbk5vZGVzO1xyXG59XHJcblxyXG5ib2FyZC5kcmF3TGliID0gdW5kZWZpbmVkO1xyXG5cclxuLy9oZWxwZXJcclxuZnVuY3Rpb24gY2FsY3VsYXRlQm91bmRzKCl7XHJcbiAgICBpZih0aGlzLmxlc3Nvbk5vZGVBcnJheS5sZW5ndGggPiAwKXtcclxuICAgICAgICB0aGlzLmJvdW5kTGVmdCA9IHRoaXMubGVzc29uTm9kZUFycmF5WzBdLnBvc2l0aW9uLng7XHJcbiAgICAgICAgdGhpcy5ib3VuZFJpZ2h0ID0gdGhpcy5sZXNzb25Ob2RlQXJyYXlbMF0ucG9zaXRpb24ueDtcclxuICAgICAgICB0aGlzLmJvdW5kVG9wID0gdGhpcy5sZXNzb25Ob2RlQXJyYXlbMF0ucG9zaXRpb24ueTtcclxuICAgICAgICB0aGlzLmJvdW5kQm90dG9tID0gdGhpcy5sZXNzb25Ob2RlQXJyYXlbMF0ucG9zaXRpb24ueTtcclxuICAgICAgICBmb3IodmFyIGkgPSAxOyBpIDwgdGhpcy5sZXNzb25Ob2RlQXJyYXkubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgICAgICBpZih0aGlzLmJvdW5kTGVmdCA+IHRoaXMubGVzc29uTm9kZUFycmF5W2ldLnBvc2l0aW9uLngpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib3VuZExlZnQgPSB0aGlzLmxlc3Nvbk5vZGVBcnJheVtpXS5wb3NpdGlvbi54O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYodGhpcy5ib3VuZFJpZ2h0IDwgdGhpcy5sZXNzb25Ob2RlQXJyYXlbaV0ucG9zaXRpb24ueCl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvdW5kUmlnaHQgPiB0aGlzLmxlc3Nvbk5vZGVBcnJheVtpXS5wb3NpdGlvbi54O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKHRoaXMuYm91bmRUb3AgPiB0aGlzLmxlc3Nvbk5vZGVBcnJheVtpXS5wb3NpdGlvbi55KXtcclxuICAgICAgICAgICAgICAgIHRoaXMuYm91bmRUb3AgPSB0aGlzLmxlc3Nvbk5vZGVBcnJheVtpXS5wb3NpdGlvbi55O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYodGhpcy5ib3VuZEJvdHRvbSA8IHRoaXMubGVzc29uTm9kZUFycmF5W2ldLnBvc2l0aW9uLnkpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib3VuZEJvdHRvbSA9IHRoaXMubGVzc29uTm9kZUFycmF5W2ldLnBvc2l0aW9uLnk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG4vL3Byb3RvdHlwZVxyXG52YXIgcCA9IGJvYXJkLnByb3RvdHlwZTtcclxuXHJcbnAubW92ZSA9IGZ1bmN0aW9uKHBYLCBwWSl7XHJcbiAgICB0aGlzLnBvc2l0aW9uLnggKz0gcFg7XHJcbiAgICB0aGlzLnBvc2l0aW9uLnkgKz0gcFk7XHJcbn07XHJcblxyXG5wLmRyYXcgPSBmdW5jdGlvbihjdHgsIGNlbnRlciwgYWN0aXZlSGVpZ2h0KXtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICAvL3RyYW5zbGF0ZSB0byB0aGUgY2VudGVyIG9mIHRoZSBzY3JlZW5cclxuICAgIGN0eC50cmFuc2xhdGUoY2VudGVyLnggLSBwb3NpdGlvbi54LCBjZW50ZXIueSAtIHBvc2l0aW9uLnkpO1xyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGxlc3Nvbk5vZGVBcnJheS5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgbGVzc29uTm9kZUFycmF5W2ldLmRyYXcoY3R4KTtcclxuICAgIH1cclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGJvYXJkO1xyXG5cclxuLy90aGlzIGlzIGFuIG9iamVjdCBuYW1lZCBCb2FyZCBhbmQgdGhpcyBpcyBpdHMgamF2YXNjcmlwdFxyXG4vL3ZhciBCb2FyZCA9IHJlcXVpcmUoJy4vb2JqZWN0cy9ib2FyZC5qcycpO1xyXG4vL3ZhciBiID0gbmV3IEJvYXJkKCk7XHJcbiAgICAiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIHBvc2l0aW9uO1xyXG52YXIgd2lkdGg7XHJcbnZhciBoZWlnaHQ7XHJcbnZhciBjbGlja2VkO1xyXG52YXIgaG92ZXJlZDtcclxuXHJcbi8vcGFyYW1ldGVyIGlzIGEgcG9pbnQgdGhhdCBkZW5vdGVzIHN0YXJ0aW5nIHBvc2l0aW9uXHJcbmZ1bmN0aW9uIGJ1dHRvbihzdGFydFBvc2l0aW9uLCB3aWR0aCwgaGVpZ2h0KXtcclxuICAgIHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcclxuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgdGhpcy5jbGlja2VkID0gZmFsc2U7XHJcbiAgICB0aGlzLmhvdmVyZWQgPSBmYWxzZTtcclxufVxyXG5idXR0b24uZHJhd0xpYiA9IHVuZGVmaW5lZDtcclxuXHJcbnZhciBwID0gYnV0dG9uLnByb3RvdHlwZTtcclxuXHJcbnAuZHJhdyA9IGZ1bmN0aW9uKGN0eCl7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgdmFyIGNvbDtcclxuICAgIGlmKHRoaXMuaG92ZXJlZCl7XHJcbiAgICAgICAgY29sID0gXCJkb2RnZXJibHVlXCI7XHJcbiAgICB9XHJcbiAgICBlbHNle1xyXG4gICAgICAgIGNvbCA9IFwibGlnaHRibHVlXCI7XHJcbiAgICB9XHJcbiAgICAvL2RyYXcgcm91bmRlZCBjb250YWluZXJcclxuICAgIGJvYXJkQnV0dG9uLmRyYXdMaWIucmVjdChjdHgsIHRoaXMucG9zaXRpb24ueCAtIHRoaXMud2lkdGgvMiwgdGhpcy5wb3NpdGlvbi55IC0gdGhpcy5oZWlnaHQvMiwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIGNvbCk7XHJcblxyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gYnV0dG9uOyIsIlwidXNlIHN0cmljdFwiO1xyXG4vL3RoZSBqc29uIGlzIGxvY2FsLCBubyBuZWVkIGZvciB4aHIgd2hlbiB1c2luZyB0aGlzIG1vZHVsZSBwYXR0ZXJuXHJcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vLi4vZGF0YS9sZXNzb25zLmpzb24nKTtcclxuLypcclxudmFyIHhociA9IHJlcXVpcmUoJ3hocicpO1xyXG5cclxudmFyIGFwcCA9IGFwcCB8fCB7fTtcclxuXHJcbnZhciBpbmZvQXJyYXkgPSB1bmRlZmluZWQ7XHJcblxyXG54aHIoe1xyXG4gICAgdXJpOiBcImRhdGEvbGVzc29ucy5qc29uXCIsXHJcbiAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICAgICAgXCJJZi1Nb2RpZmllZC1TaW5jZVwiOiBcIlNhdCwgMSBKYW4gMjAxMCAwMDowMDowMCBHTVRcIlxyXG4gICAgfVxyXG59LCBmdW5jdGlvbiAoZXJyLCByZXNwLCBib2R5KSB7XHJcbiAgICB2YXIgbXlKU09OID0gSlNPTi5wYXJzZShib2R5KTtcclxuICAgIGluZm9BcnJheSA9IG15SlNPTi5sZXNzb25zO1xyXG59KTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGluZm9BcnJheTtcclxuKi8iLCJcInVzZSBzdHJpY3RcIjtcclxuZnVuY3Rpb24gZHJhd0xpYigpe1xyXG4gICAgXHJcbn1cclxuXHJcbnZhciBwID0gZHJhd0xpYi5wcm90b3R5cGU7XHJcblxyXG5wLmNsZWFyID0gZnVuY3Rpb24oY3R4LCB4LCB5LCB3LCBoKSB7XHJcbiAgICBjdHguY2xlYXJSZWN0KHgsIHksIHcsIGgpO1xyXG59XHJcblxyXG5wLnJlY3QgPSBmdW5jdGlvbihjdHgsIHgsIHksIHcsIGgsIGNvbCkge1xyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIGN0eC5maWxsU3R5bGUgPSBjb2w7XHJcbiAgICBjdHguZmlsbFJlY3QoeCwgeSwgdywgaCk7XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG59XHJcblxyXG5wLmxpbmUgPSBmdW5jdGlvbihjdHgsIHgxLCB5MSwgeDIsIHkyLCB0aGlja25lc3MsIGNvbG9yKSB7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgY3R4Lm1vdmVUbyh4MSwgeTEpO1xyXG4gICAgY3R4LmxpbmVUbyh4MiwgeTIpO1xyXG4gICAgY3R4LmxpbmVXaWR0aCA9IHRoaWNrbmVzcztcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9IGNvbG9yO1xyXG4gICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxufVxyXG5cclxucC5jaXJjbGUgPSBmdW5jdGlvbihjdHgsIHgsIHksIHJhZGl1cywgY29sb3Ipe1xyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIGN0eC5hcmMoeCx5LCByYWRpdXMsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSk7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gY29sb3I7XHJcbiAgICBjdHguZmlsbCgpO1xyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gYm9hcmRCdXR0b24oY3R4LCBwb3NpdGlvbiwgd2lkdGgsIGhlaWdodCwgaG92ZXJlZCl7XHJcbiAgICAvL2N0eC5zYXZlKCk7XHJcbiAgICBpZihob3ZlcmVkKXtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJkb2RnZXJibHVlXCI7XHJcbiAgICB9XHJcbiAgICBlbHNle1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBcImxpZ2h0Ymx1ZVwiO1xyXG4gICAgfVxyXG4gICAgLy9kcmF3IHJvdW5kZWQgY29udGFpbmVyXHJcbiAgICBjdHgucmVjdChwb3NpdGlvbi54IC0gd2lkdGgvMiwgcG9zaXRpb24ueSAtIGhlaWdodC8yLCB3aWR0aCwgaGVpZ2h0KTtcclxuICAgIGN0eC5saW5lV2lkdGggPSA1O1xyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gXCJibGFja1wiO1xyXG4gICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgY3R4LmZpbGwoKTtcclxuICAgIC8vY3R4LnJlc3RvcmUoKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBkcmF3TGliOyIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgQm9hcmQgPSByZXF1aXJlKCcuL2JvYXJkLmpzJyk7XHJcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4vcG9pbnQuanMnKTtcclxudmFyIERyYXdMaWIgPSByZXF1aXJlKCcuL2RyYXdMaWIuanMnKTtcclxudmFyIExlc3Nvbk5vZGUgPSByZXF1aXJlKCcuL2xlc3Nvbk5vZGUuanMnKTtcclxudmFyIFV0aWxpdGllcyA9IHJlcXVpcmUoJy4vdXRpbGl0aWVzLmpzJyk7XHJcblxyXG52YXIgYm9hcmRBcnJheTtcclxudmFyIHBhaW50ZXI7XHJcblxyXG52YXIgbW91c2VQb3NpdGlvbjtcclxudmFyIHJlbGF0aXZlTW91c2VQb3NpdGlvbjtcclxudmFyIG1vdXNlRG93bjtcclxuXHJcbmZ1bmN0aW9uIGdhbWUoKXtcclxuICAgIHBhaW50ZXIgPSBuZXcgRHJhd0xpYigpO1xyXG4gICAgXHJcbiAgICBtb3VzZURvd24gPSBmYWxzZTtcclxuICAgIFxyXG4gICAgdmFyIHRlc3RMZXNzb25Ob2RlQXJyYXkgPSBbXTtcclxuICAgIHRlc3RMZXNzb25Ob2RlQXJyYXkucHVzaChuZXcgTGVzc29uTm9kZShuZXcgUG9pbnQoMCwwKSwgXCJpbWFnZXMvZG9nLnBuZ1wiKSk7XHJcbiAgICBcclxuICAgIGJvYXJkQXJyYXkgPSBbXTtcclxuICAgIGJvYXJkQXJyYXkucHVzaChuZXcgQm9hcmQobmV3IFBvaW50KDAsMCksIHRlc3RMZXNzb25Ob2RlQXJyYXkpKTtcclxuICAgIFxyXG4gICAgXHJcbn1cclxuXHJcbnZhciBwID0gZ2FtZS5wcm90b3R5cGU7XHJcblxyXG5wLnVwZGF0ZSA9IGZ1bmN0aW9uKGN0eCwgY2FudmFzLCBkdCwgY2VudGVyLCBhY3RpdmVIZWlnaHQsIHBNb3VzZVBvc2l0aW9uLCBwUmVsYXRpdmVNb3VzZVBvc2l0aW9uKXtcclxuICAgIC8vdXBkYXRlIHN0dWZmXHJcbiAgICBwLmFjdChwTW91c2VQb3NpdGlvbiwgcFJlbGF0aXZlTW91c2VQb3NpdGlvbik7XHJcbiAgICAvL2RyYXcgc3R1ZmZcclxuICAgIHAuZHJhdyhjdHgsIGNhbnZhcywgY2VudGVyLCBhY3RpdmVIZWlnaHQpO1xyXG59XHJcblxyXG5wLmFjdCA9IGZ1bmN0aW9uKHBNb3VzZVBvc2l0aW9uLCBwUmVsYXRpdmVNb3VzZVBvc2l0aW9uKXtcclxuICAgIG1vdXNlUG9zaXRpb24gPSBwTW91c2VQb3NpdGlvbjtcclxuICAgIHJlbGF0aXZlTW91c2VQb3NpdGlvbiA9IHBSZWxhdGl2ZU1vdXNlUG9zaXRpb247XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZGVidWdMaW5lJykuaW5uZXJIVE1MID0gXCJtb3VzZVBvc2l0aW9uOiB4ID0gXCIgKyByZWxhdGl2ZU1vdXNlUG9zaXRpb24ueCArIFwiLCB5ID0gXCIgKyByZWxhdGl2ZU1vdXNlUG9zaXRpb24ueTtcclxufVxyXG5cclxucC5kcmF3ID0gZnVuY3Rpb24oY3R4LCBjYW52YXMsIGNlbnRlciwgYWN0aXZlSGVpZ2h0KXtcclxuICAgIC8vZHJhdyBib2FyZFxyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIHBhaW50ZXIuY2xlYXIoY3R4LCAwLCAwLCBjYW52YXMub2Zmc2V0V2lkdGgsIGNhbnZhcy5vZmZzZXRIZWlnaHQpO1xyXG4gICAgcGFpbnRlci5yZWN0KGN0eCwgMCwgMCwgY2FudmFzLm9mZnNldFdpZHRoLCBjYW52YXMub2Zmc2V0SGVpZ2h0LCBcIndoaXRlXCIpO1xyXG4gICAgcGFpbnRlci5saW5lKGN0eCwgY2FudmFzLm9mZnNldFdpZHRoLzIsIGNlbnRlci55IC0gYWN0aXZlSGVpZ2h0LzIsIGNhbnZhcy5vZmZzZXRXaWR0aC8yLCBjYW52YXMub2Zmc2V0SGVpZ2h0LCAyLCBcImxpZ2h0Z3JheVwiKTtcclxuICAgIHBhaW50ZXIubGluZShjdHgsIDAsIGNlbnRlci55LCBjYW52YXMub2Zmc2V0V2lkdGgsIGNlbnRlci55LCAyLCBcImxpZ2h0R3JheVwiKTtcclxuICAgIFxyXG4gICAgLy9kcmF3aW5nIGxlc3NvbiBub2Rlc1xyXG4gICAgYm9hcmRBcnJheVswXS5kcmF3KGN0eCwgY2VudGVyLCBhY3RpdmVIZWlnaHQpO1xyXG4gICAgXHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGdhbWU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBCdXR0b24gPSByZXF1aXJlKCcuL2J1dHRvbi5qcycpO1xyXG5cclxudmFyIHBvc2l0aW9uO1xyXG52YXIgd2lkdGg7XHJcbnZhciBoZWlnaHQ7XHJcbnZhciBidXR0b247XHJcbnZhciBpbWFnZTtcclxudmFyIHNjYWxlRmFjdG9yO1xyXG5cclxuLy9wYXJhbWV0ZXIgaXMgYSBwb2ludCB0aGF0IGRlbm90ZXMgc3RhcnRpbmcgcG9zaXRpb25cclxuZnVuY3Rpb24gbGVzc29uTm9kZShzdGFydFBvc2l0aW9uLCBpbWFnZVBhdGgpe1xyXG4gICAgcG9zaXRpb24gPSBzdGFydFBvc2l0aW9uO1xyXG4gICAgd2lkdGggPSAxMDA7XHJcbiAgICBoZWlnaHQgPSAxMDA7XHJcbiAgICBidXR0b24gPSBuZXcgQnV0dG9uKHBvc2l0aW9uLCB3aWR0aCwgaGVpZ2h0KTtcclxuICAgIFxyXG4gICAgLy9pbWFnZSBsb2FkaW5nXHJcbiAgICB2YXIgdGVtcEltYWdlID0gbmV3IEltYWdlKCk7XHJcbiAgICB0cnl7XHJcbiAgICAgICAgdGVtcEltYWdlLnNyYyA9IGltYWdlUGF0aDtcclxuICAgICAgICBpbWFnZSA9IHRlbXBJbWFnZTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgdGVtcEltYWdlLnNyYyA9IFwiaW1hZ2VzL2RvZy5wbmdcIjtcclxuICAgICAgICBpbWFnZSA9IHRlbXBJbWFnZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc2NhbGVGYWN0b3IgPSAyO1xyXG59XHJcblxyXG5sZXNzb25Ob2RlLmRyYXdMaWIgPSB1bmRlZmluZWQ7XHJcblxyXG52YXIgcCA9IGxlc3Nvbk5vZGUucHJvdG90eXBlO1xyXG5cclxucC5kcmF3ID0gZnVuY3Rpb24oY3R4KXtcclxuICAgIC8vbGVzc29uTm9kZS5kcmF3TGliLmNpcmNsZShjdHgsIHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55LCAxMCwgXCJyZWRcIik7XHJcbiAgICAvL2RyYXcgdGhlIGltYWdlLCBzaGFkb3cgaWYgaG92ZXJlZFxyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIGlmKGJ1dHRvbi5ob3ZlcmVkKXtcclxuICAgICAgICAvL2N0eC5zaGFkb3dPZmZzZXRYID0gMTA7XHJcbiAgICAgICAgLy9jdHguc2hhZG93T2Zmc2V0WSA9IDEwO1xyXG4gICAgICAgIGN0eC5zaGFkb3dDb2xvciA9ICdibHVlJztcclxuICAgICAgICBjdHguc2hhZG93Qmx1ciA9IDMwO1xyXG4gICAgfVxyXG4gICAgY3R4LmRyYXdJbWFnZShpbWFnZSwgcG9zaXRpb24ueCAtICh3aWR0aCpzY2FsZUZhY3RvcikvMiwgcG9zaXRpb24ueSAtIChoZWlnaHQqc2NhbGVGYWN0b3IpLzIsIHdpZHRoICogc2NhbGVGYWN0b3IsIGhlaWdodCAqIHNjYWxlRmFjdG9yKVxyXG4gICAgXHJcbiAgICBcclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGxlc3Nvbk5vZGU7IiwiLy9rZWVwcyB0cmFjayBvZiBtb3VzZSByZWxhdGVkIHZhcmlhYmxlcy5cclxuLy9jYWxjdWxhdGVkIGluIG1haW4gYW5kIHBhc3NlZCB0byBnYW1lXHJcbi8vY29udGFpbnMgdXAgc3RhdGVcclxuLy9wb3NpdGlvblxyXG4vL3JlbGF0aXZlIHBvc2l0aW9uXHJcbi8vb24gY2FudmFzIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmZ1bmN0aW9uIHBvaW50KHBYLCBwWSl7XHJcbiAgICB0aGlzLnggPSBwWDtcclxuICAgIHRoaXMueSA9IHBZO1xyXG59XHJcblxyXG52YXIgcCA9IHBvaW50LnByb3RvdHlwZTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gcG9pbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4vcG9pbnQuanMnKTtcclxuXHJcbmZ1bmN0aW9uIHV0aWxpdGllcygpe1xyXG59XHJcblxyXG52YXIgcCA9IHV0aWxpdGllcy5wcm90b3R5cGU7XHJcbi8vIHJldHVybnMgbW91c2UgcG9zaXRpb24gaW4gbG9jYWwgY29vcmRpbmF0ZSBzeXN0ZW0gb2YgZWxlbWVudFxyXG5wLmdldE1vdXNlID0gZnVuY3Rpb24oZSl7XHJcbiAgICAvL3JldHVybiBuZXcgYXBwLlBvaW50KChlLnBhZ2VYIC0gZS50YXJnZXQub2Zmc2V0TGVmdCkgKiAoYXBwLm1haW4ucmVuZGVyV2lkdGggLyBhY3R1YWxDYW52YXNXaWR0aCksIChlLnBhZ2VZIC0gZS50YXJnZXQub2Zmc2V0VG9wKSAqIChhcHAubWFpbi5yZW5kZXJIZWlnaHQgLyBhY3R1YWxDYW52YXNIZWlnaHQpKTtcclxuICAgIHJldHVybiBuZXcgUG9pbnQoKGUucGFnZVggLSBlLnRhcmdldC5vZmZzZXRMZWZ0KSwgKGUucGFnZVkgLSBlLnRhcmdldC5vZmZzZXRUb3ApKTtcclxufVxyXG5cclxucC5tYXAgPSBmdW5jdGlvbih2YWx1ZSwgbWluMSwgbWF4MSwgbWluMiwgbWF4Mil7XHJcbiAgICAvL3JldHVybiBtaW4yICsgKG1heDIgLSBtaW4yKSAqICgodmFsdWUgLSBtaW4xKSAvIChtYXgxIC0gbWluMSkpO1xyXG59XHJcblxyXG5wLmNsYW1wID0gZnVuY3Rpb24odmFsdWUsIG1pbiwgbWF4KXtcclxuICAgIC8vcmV0dXJuIE1hdGgubWF4KG1pbiwgTWF0aC5taW4obWF4LCB2YWx1ZSkpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHV0aWxpdGllczsiXX0=
