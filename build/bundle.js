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
function clear(ctx, x, y, w, h) {
    ctx.clearRect(x, y, w, h);
}

function rect(ctx, x, y, w, h, col) {
    ctx.save();
    ctx.fillStyle = col;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
}

function line(ctx, x1, y1, x2, y2, thickness, color) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.restore();
}

function circle(ctx, x, y, radius, color){
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

module.exports = {
    clear : clear,
    rect: rect,
    line: line,
    circle: circle,
    boardButton: boardButton
};
},{}],3:[function(require,module,exports){
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
    activeHeight = canvas.height - header.offsetHeight;
    center = new Point(canvas.width/2, activeHeight / 2 + header.offsetHeight);
    
    game = new Game();
}

function loop(){
    //window.requestAnimationFrame(loop());
    game.update();
}

window.addEventListener("resize", function(e){
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    
    console.log("Canvas Dimensions: " + canvas.width + ", " + canvas.height);
});
},{"./modules/game.js":8,"./modules/point.js":10}],4:[function(require,module,exports){
'use strict';
var utilities = require('./utilities.js');
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
},{"./utilities.js":11}],5:[function(require,module,exports){
"use strict";
//parameter is a point that denotes starting position
function board(startPosition, lessonNodes){
    this.position = startPosition;

    this.boundLeft = 0;
    this.boundRight = 0;
    this.boundTop = 0;
    this.boundBottom = 0;

    this.zoomFactor = 1;


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


p.zoom = function(ctx, center, delta){
    /*
    if(delta > 0){
        this.zoomFactor -= .1;
        if(this.zoomFactor < .5){
            this.zoomFactor = .5;
        }
    }
    else{
        this.zoomFactor += .1;
        if(this.zoomFactor > 1.5){
            this.zoomFactor = 1.5;
        }
    }
    */
    //nudge this in the direction of the mouse
    //this.move((center.x - mousePosition.x)/10, (center.y - mousePosition.y)/10);
    //ctx.translate(center.x, center.y);
    //ctx.scale(this.zoomFactor, this.zoomFactor);
    //ctx.translate(-center.x, -center.y);
};

p.draw = function(ctx, center, activeWidth, activeHeight){
    ctx.save();
    //translate to the center of the screen
    ctx.translate(center.x - this.position.x, center.y - this.position.y);
    for(var i = 0; i < this.lessonNodeArray.length; i++){
        this.lessonNodeArray[i].draw(ctx, this.zoomFactor);
    }
    ctx.restore();
};

module.exports = board;

//this is an object named Board and this is its javascript
//var Board = require('./objects/board.js');
//var b = new Board();
    
},{}],6:[function(require,module,exports){
"use strict";

//parameter is a point that denotes starting position
function boardButton(startPosition, width, height){
    this.position = startPosition;
    this.width = width;
    this.height = height;
    this.clicked = false;
    this.hovered = false;
}
boardButton.drawLib = undefined;

var p = boardButton.prototype;

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

module.exports = boardButton;
},{}],7:[function(require,module,exports){
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
},{"../../data/lessons.json":1}],8:[function(require,module,exports){
function game(){
}

var p = game.prototype;

p.update = function(){
    //update stuff
    p.act();
    //draw stuff
    p.draw();
}

p.act = function(){
    console.log("ACT");
}

p.draw = function(){
    console.log("DRAW");
}

module.exports = game;
},{}],9:[function(require,module,exports){
"use strict";
//parameter is a point that denotes starting position
function lessonNode(startPosition, imagePath){
    this.position = startPosition;
    this.width = 100;
    this.height = 100;
    this.boardButton = new app.boardButton(this.position, this.width,this.height);

    //image loading
    var tempImage = new Image();
    try{
        tempImage.src = imagePath;
        this.image = tempImage;
    }
    catch (e) {
        image.src = this.app.Images['exampleImage'];
        this.image = tempImage;
    }
}

lessonNode.drawLib = undefined;

var p = lessonNode.prototype;

p.draw = function(ctx, scaleFactor){
    //lessonNode.drawLib.circle(ctx, this.position.x, this.position.y, 10, "red");
    this.boardButton.draw(ctx);
};

module.exports = lessonNode;
},{}],10:[function(require,module,exports){
"use strict";
var x;
var y;
function point(pX, pY){
    x = pX;
    y = pY;
}

module.exports = point;
},{}],11:[function(require,module,exports){
"use strict";

// returns mouse position in local coordinate system of element
function getMouse(e, actualCanvasWidth, actualCanvasHeight){
    //return new app.Point((e.pageX - e.target.offsetLeft) * (app.main.renderWidth / actualCanvasWidth), (e.pageY - e.target.offsetTop) * (app.main.renderHeight / actualCanvasHeight));
    return new app.point((e.pageX - e.target.offsetLeft), (e.pageY - e.target.offsetTop));
}

function map(value, min1, max1, min2, max2){
    return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
}

function clamp(value, min, max){
    return Math.max(min, Math.min(max, value));
}

module.exports = {
    getMouse : getMouse,
    clamp: clamp,
    map: map    
};
},{}]},{},[2,3,4,5,6,7,8,9,10,11])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkYXRhL2xlc3NvbnMuanNvbiIsImpzL2RyYXdsaWIuanMiLCJqcy9tYWluLmpzIiwianMvbWFpbk9MRC5qcyIsImpzL21vZHVsZXMvYm9hcmQuanMiLCJqcy9tb2R1bGVzL2JvYXJkQnV0dG9uLmpzIiwianMvbW9kdWxlcy9kYXRhT2JqZWN0LmpzIiwianMvbW9kdWxlcy9nYW1lLmpzIiwianMvbW9kdWxlcy9sZXNzb25Ob2RlLmpzIiwianMvbW9kdWxlcy9wb2ludC5qcyIsImpzL3V0aWxpdGllcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHM9e1xyXG4gICAgXCJsZXNzb25zXCI6W1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgXCJ4XCI6IFwiMFwiLFxyXG4gICAgICAgICAgICBcInlcIjogXCIwXCIsXHJcbiAgICAgICAgICAgIFwiaW1hZ2VcIjogXCJkb2cuanBlZ1wiXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFwieFwiOiBcIjEwMFwiLFxyXG4gICAgICAgICAgICBcInlcIjogXCIxMDBcIixcclxuICAgICAgICAgICAgXCJpbWFnZVwiOiBcImRvZy5qcGVnXCJcclxuICAgICAgICB9XHJcbiAgICBdXHJcbn0iLCJcInVzZSBzdHJpY3RcIjtcclxuZnVuY3Rpb24gY2xlYXIoY3R4LCB4LCB5LCB3LCBoKSB7XHJcbiAgICBjdHguY2xlYXJSZWN0KHgsIHksIHcsIGgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZWN0KGN0eCwgeCwgeSwgdywgaCwgY29sKSB7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IGNvbDtcclxuICAgIGN0eC5maWxsUmVjdCh4LCB5LCB3LCBoKTtcclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxpbmUoY3R4LCB4MSwgeTEsIHgyLCB5MiwgdGhpY2tuZXNzLCBjb2xvcikge1xyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIGN0eC5tb3ZlVG8oeDEsIHkxKTtcclxuICAgIGN0eC5saW5lVG8oeDIsIHkyKTtcclxuICAgIGN0eC5saW5lV2lkdGggPSB0aGlja25lc3M7XHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBjb2xvcjtcclxuICAgIGN0eC5zdHJva2UoKTtcclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNpcmNsZShjdHgsIHgsIHksIHJhZGl1cywgY29sb3Ipe1xyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIGN0eC5hcmMoeCx5LCByYWRpdXMsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSk7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gY29sb3I7XHJcbiAgICBjdHguZmlsbCgpO1xyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gYm9hcmRCdXR0b24oY3R4LCBwb3NpdGlvbiwgd2lkdGgsIGhlaWdodCwgaG92ZXJlZCl7XHJcbiAgICAvL2N0eC5zYXZlKCk7XHJcbiAgICBpZihob3ZlcmVkKXtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJkb2RnZXJibHVlXCI7XHJcbiAgICB9XHJcbiAgICBlbHNle1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBcImxpZ2h0Ymx1ZVwiO1xyXG4gICAgfVxyXG4gICAgLy9kcmF3IHJvdW5kZWQgY29udGFpbmVyXHJcbiAgICBjdHgucmVjdChwb3NpdGlvbi54IC0gd2lkdGgvMiwgcG9zaXRpb24ueSAtIGhlaWdodC8yLCB3aWR0aCwgaGVpZ2h0KTtcclxuICAgIGN0eC5saW5lV2lkdGggPSA1O1xyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gXCJibGFja1wiO1xyXG4gICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgY3R4LmZpbGwoKTtcclxuICAgIC8vY3R4LnJlc3RvcmUoKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBjbGVhciA6IGNsZWFyLFxyXG4gICAgcmVjdDogcmVjdCxcclxuICAgIGxpbmU6IGxpbmUsXHJcbiAgICBjaXJjbGU6IGNpcmNsZSxcclxuICAgIGJvYXJkQnV0dG9uOiBib2FyZEJ1dHRvblxyXG59OyIsIlwidXNlIHN0cmljdFwiO1xyXG4vL2ltcG9ydHNcclxudmFyIEdhbWUgPSByZXF1aXJlKCcuL21vZHVsZXMvZ2FtZS5qcycpO1xyXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuL21vZHVsZXMvcG9pbnQuanMnKTtcclxuXHJcbi8vdmFyaWFibGVzXHJcbnZhciBnYW1lO1xyXG52YXIgY2FudmFzO1xyXG52YXIgY3R4O1xyXG5cclxudmFyIGhlYWRlcjtcclxudmFyIGFjdGl2ZUhlaWdodDtcclxudmFyIGNlbnRlcjtcclxuLyphcHAuSU1BR0VTID0ge1xyXG4gICAgdGVzdEltYWdlOiBcImltYWdlcy9kb2cucG5nXCJcclxuIH07Ki9cclxuXHJcbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbihlKXtcclxuICAgIGluaXRpYWxpemVWYXJpYWJsZXMoKTtcclxuICAgIFxyXG4gICAgbG9vcCgpO1xyXG5cdC8qYXBwLm1haW4uYXBwID0gYXBwO1xyXG4gICAgXHJcblx0YXBwLm1haW4udXRpbGl0aWVzID0gYXBwLnV0aWxpdGllcztcclxuXHRhcHAubWFpbi5kcmF3TGliID0gYXBwLmRyYXdMaWI7XHJcbiAgICBhcHAubWFpbi5kYXRhT2JqZWN0ID0gbmV3IGFwcC5kYXRhT2JqZWN0KCk7XHJcbiAgICBhcHAuYm9hcmQuZHJhd0xpYiA9IGFwcC5kcmF3TGliO1xyXG4gICAgYXBwLmxlc3Nvbk5vZGUuZHJhd0xpYiA9IGFwcC5kcmF3TGliO1xyXG4gICAgYXBwLmJvYXJkQnV0dG9uLmRyYXdMaWIgPSBhcHAuZHJhd0xpYjtcclxuICAgIFxyXG5cdGFwcC5xdWV1ZSA9IG5ldyBjcmVhdGVqcy5Mb2FkUXVldWUoZmFsc2UpO1xyXG5cdGFwcC5xdWV1ZS5vbihcImNvbXBsZXRlXCIsIGZ1bmN0aW9uKCl7XHJcblx0XHRhcHAubWFpbi5pbml0KCk7XHJcblx0fSk7XHJcbiAgICBhcHAucXVldWUubG9hZE1hbmlmZXN0KFtcclxuICAgICAgICB7aWQ6IFwiZXhhbXBsZUltYWdlXCIsIHNyYzpcImltYWdlcy9kb2cuanBnXCJ9LFxyXG5cdF0pO1xyXG4gICAgXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIGFwcC5tYWluLmNhbnZhcy53aWR0aCA9IGFwcC5tYWluLmNhbnZhcy5vZmZzZXRXaWR0aDtcclxuICAgICAgICBhcHAubWFpbi5jYW52YXMuaGVpZ2h0ID0gYXBwLm1haW4uY2FudmFzLm9mZnNldEhlaWdodDtcclxuICAgICAgICBhcHAubWFpbi5hY3RpdmVIZWlnaHQgPSBhcHAubWFpbi5jYW52YXMuaGVpZ2h0IC0gYXBwLm1haW4uaGVhZGVyLm9mZnNldEhlaWdodDtcclxuICAgICAgICBhcHAubWFpbi5jZW50ZXIgPSBuZXcgYXBwLnBvaW50KGFwcC5tYWluLmNhbnZhcy53aWR0aCAvIDIsIGFwcC5tYWluLmFjdGl2ZUhlaWdodCAvIDIgKyBhcHAubWFpbi5oZWFkZXIub2Zmc2V0SGVpZ2h0KVxyXG5cdH0pOyovXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRpYWxpemVWYXJpYWJsZXMoKXtcclxuICAgIGNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2NhbnZhcycpO1xyXG4gICAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICBjYW52YXMud2lkdGggPSBjYW52YXMub2Zmc2V0V2lkdGg7XHJcbiAgICBjYW52YXMuaGVpZ2h0ID0gY2FudmFzLm9mZnNldEhlaWdodDtcclxuICAgIGNvbnNvbGUubG9nKFwiQ2FudmFzIERpbWVuc2lvbnM6IFwiICsgY2FudmFzLndpZHRoICsgXCIsIFwiICsgY2FudmFzLmhlaWdodCk7XHJcbiAgICBcclxuICAgIGhlYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2hlYWRlcicpO1xyXG4gICAgYWN0aXZlSGVpZ2h0ID0gY2FudmFzLmhlaWdodCAtIGhlYWRlci5vZmZzZXRIZWlnaHQ7XHJcbiAgICBjZW50ZXIgPSBuZXcgUG9pbnQoY2FudmFzLndpZHRoLzIsIGFjdGl2ZUhlaWdodCAvIDIgKyBoZWFkZXIub2Zmc2V0SGVpZ2h0KTtcclxuICAgIFxyXG4gICAgZ2FtZSA9IG5ldyBHYW1lKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxvb3AoKXtcclxuICAgIC8vd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShsb29wKCkpO1xyXG4gICAgZ2FtZS51cGRhdGUoKTtcclxufVxyXG5cclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgZnVuY3Rpb24oZSl7XHJcbiAgICBjYW52YXMud2lkdGggPSBjYW52YXMub2Zmc2V0V2lkdGg7XHJcbiAgICBjYW52YXMuaGVpZ2h0ID0gY2FudmFzLm9mZnNldEhlaWdodDtcclxuICAgIFxyXG4gICAgXHJcbiAgICBjb25zb2xlLmxvZyhcIkNhbnZhcyBEaW1lbnNpb25zOiBcIiArIGNhbnZhcy53aWR0aCArIFwiLCBcIiArIGNhbnZhcy5oZWlnaHQpO1xyXG59KTsiLCIndXNlIHN0cmljdCc7XHJcbnZhciB1dGlsaXRpZXMgPSByZXF1aXJlKCcuL3V0aWxpdGllcy5qcycpO1xyXG52YXIgYXBwID0gYXBwIHx8IHt9O1xyXG5cclxuYXBwLm1haW4gPSB7ICAgIFxyXG4gICAgLy92YXJpYWJsZXNcclxuICAgIGNhbnZhczogdW5kZWZpbmVkLFxyXG4gICAgY3R4OiB1bmRlZmluZWQsXHJcbiAgICBhcHA6IHVuZGVmaW5lZCxcclxuICAgIHV0aWxpdGllczogdW5kZWZpbmVkLFxyXG4gICAgZHJhd0xpYjogdW5kZWZpbmVkLFxyXG4gICAgXHJcbiAgICBtb3VzZVBvc2l0aW9uOiB1bmRlZmluZWQsXHJcbiAgICBsYXN0TW91c2VQb3NpdGlvbjogdW5kZWZpbmVkLFxyXG4gICAgcmVsYXRpdmVNb3VzZVBvc2l0aW9uOiB1bmRlZmluZWQsXHJcbiAgICBhbmltYXRpb25JRDogMCxcclxuXHRsYXN0VGltZTogMCxcclxuICAgIFxyXG4gICAgaGVhZGVyOiB1bmRlZmluZWQsXHJcbiAgICBhY3RpdmVIZWlnaHQ6IHVuZGVmaW5lZCxcclxuICAgIGNlbnRlcjogdW5kZWZpbmVkLFxyXG4gICAgYm9hcmQ6IHVuZGVmaW5lZCxcclxuICAgIFxyXG4gICAgZHJhZ2dpbmc6IHVuZGVmaW5lZCxcclxuICAgIGN1cnNvcjogdW5kZWZpbmVkLFxyXG4gICAgXHJcbiAgICAvL2RhdGFPYmplY3Q6IHJlcXVpcmUoJy4vb2JqZWN0cy9kYXRhT2JqZWN0LmpzJyksXHJcbiAgICBcclxuICAgIC8vZW51bWVyYXRpb25cclxuICAgIEdBTUVfU1RBVEU6IE9iamVjdC5mcmVlemUoe1x0XHJcblx0XHRCT0FSRF9WSUVXOiAwLFxyXG5cdFx0Rk9DVVNfVklFVzogMVxyXG5cdH0pLFxyXG4gICAgXHJcbiAgICBpbml0IDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy90aGlzLmRlYnVnTGluZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNkZWJ1Z0xpbmUnKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2NhbnZhcycpO1xyXG4gICAgICAgIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgICAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMuY2FudmFzLm9mZnNldFdpZHRoO1xyXG4gICAgICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuY2FudmFzLm9mZnNldEhlaWdodDtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm1vdXNlUG9zaXRpb24gPSBuZXcgYXBwLnBvaW50KHRoaXMuY2FudmFzLndpZHRoLzIsIHRoaXMuY2FudmFzLmhlaWdodC8yKTtcclxuICAgICAgICB0aGlzLmxhc3RNb3VzZVBvc2l0aW9uID0gdGhpcy5tb3VzZVBvc2l0aW9uO1xyXG4gICAgICAgIHRoaXMucmVsYXRpdmVNb3VzZVBvc2l0aW9uID0gdGhpcy5tb3VzZVBvc2l0aW9uO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuaGVhZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaGVhZGVyJyk7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVIZWlnaHQgPSB0aGlzLmNhbnZhcy5oZWlnaHQgLSB0aGlzLmhlYWRlci5vZmZzZXRIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5jZW50ZXIgPSBuZXcgYXBwLnBvaW50KHRoaXMuY2FudmFzLndpZHRoLzIsIHRoaXMuYWN0aXZlSGVpZ2h0IC8gMiArIHRoaXMuaGVhZGVyLm9mZnNldEhlaWdodCk7XHJcbiAgICAgICAgLy9nZXQgbGlzdHYgb2Ygbm9kZXMgZnJvbSBkYXRhXHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIHRlbXBMZXNzb25Ob2RlQXJyYXkgPSBbXTtcclxuICAgICAgICB0ZW1wTGVzc29uTm9kZUFycmF5LnB1c2gobmV3IGFwcC5sZXNzb25Ob2RlKG5ldyBhcHAucG9pbnQoMCwwKSkpO1xyXG4gICAgICAgIHRlbXBMZXNzb25Ob2RlQXJyYXkucHVzaChuZXcgYXBwLmxlc3Nvbk5vZGUobmV3IGFwcC5wb2ludCgzMDAsMzAwKSkpO1xyXG4gICAgICAgIHRlbXBMZXNzb25Ob2RlQXJyYXkucHVzaChuZXcgYXBwLmxlc3Nvbk5vZGUobmV3IGFwcC5wb2ludCgzMDAsLTMwMCkpKTtcclxuICAgICAgICB0aGlzLmJvYXJkID0gbmV3IGFwcC5ib2FyZChuZXcgYXBwLnBvaW50KDAsMCksIHRlbXBMZXNzb25Ob2RlQXJyYXkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmN1cnNvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibXlQXCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciB0ZXN0ZXRlc3QgPSB0aGlzLmRhdGFPYmplY3QuaW5mb0FycmF5O1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vZGVub3RlcyBnYW1lcGxheSBzdGF0ZVxyXG4gICAgICAgIHRoaXMuZ2FtZV9zdGF0ZSA9IHRoaXMuR0FNRV9TVEFURS5CT0FSRF9WSUVXO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vY29ubmVjdGluZyBldmVudHNcclxuICAgICAgICB0aGlzLmNhbnZhcy5vbm1vdXNlbW92ZSA9IHRoaXMuZ2V0TW91c2VQb3NpdGlvbi5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuY2FudmFzLm9ubW91c2Vkb3duID0gdGhpcy5kb01vdXNlRG93bi5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuY2FudmFzLm9ubW91c2V1cCA9IHRoaXMuZG9Nb3VzZVVwLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNld2hlZWxcIiwgdGhpcy5kb1doZWVsLmJpbmQodGhpcykpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vc3RhcnQgdGhlIGxvb3BcclxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgfSxcclxuICAgIFxyXG4gICAgLy9sb29wIGZ1bmN0aW9uc1xyXG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvL2NhbGwgdGhlIGxvb3BcclxuICAgICAgICB0aGlzLmFuaW1hdGlvbklEID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMudXBkYXRlLmJpbmQodGhpcykpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vY2FsY3VsYXRlIGRlbHRhIHRpbWVcclxuICAgICAgICB2YXIgZHQgPSB0aGlzLmNhbGN1bGF0ZURlbHRhVGltZSgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vY2xlYXIgdGhlIGNhbnZhc1xyXG4gICAgICAgIHRoaXMuZHJhd0xpYi5jbGVhcih0aGlzLmN0eCwwLDAsdGhpcy5jYW52YXMub2Zmc2V0V2lkdGgsdGhpcy5jYW52YXMub2Zmc2V0SGVpZ2h0KTtcclxuICAgICAgICB0aGlzLmRyYXdMaWIucmVjdCh0aGlzLmN0eCwgMCwgMCwgdGhpcy5jYW52YXMub2Zmc2V0V2lkdGgsIHRoaXMuY2FudmFzLm9mZnNldEhlaWdodCwgXCJXaGl0ZVwiKTtcclxuICAgICAgICBcclxuICAgICAgICAvL3VwZGF0ZVxyXG4gICAgICAgIGlmKHRoaXMuZ2FtZV9zdGF0ZSA9PSB0aGlzLkdBTUVfU1RBVEUuQk9BUkRfVklFVyl7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvL2RyYXcgZ2FtZSBzY3JlZW5cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmRDb2xsaXNpb25IYW5kbGluZygpO1xyXG4gICAgICAgICAgICB0aGlzLmJvYXJkLmRyYXcodGhpcy5jdHgsIHRoaXMuY2VudGVyLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5hY3RpdmVIZWlnaHQpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5kcmF3TGliLmNpcmNsZSh0aGlzLmN0eCwgdGhpcy5tb3VzZVBvc2l0aW9uLngsIHRoaXMubW91c2VQb3NpdGlvbi55LCAxMCwgXCJSb3lhbEJsdWVcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYodGhpcy5nYW1lX3N0YXRlID09IHRoaXMuR0FNRV9TVEFURS5USVRMRSl7XHJcbiAgICAgICAgICAgIC8vZHJhdyB0aXRsZSBzY3JlZW5cclxuICAgICAgICB9XHJcbiAgICAgICAgLy9jdXJzb3IgaGFuZGxpbmdcclxuICAgICAgICB0aGlzLmN1cnNvckhhbmRsZXIoKTtcclxuICAgICAgICB0aGlzLmRlYnVnSHVkKHRoaXMuY3R4LCBkdCk7XHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICBjYWxjdWxhdGVEZWx0YVRpbWU6IGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgbm93O1xyXG4gICAgICAgIHZhciBmcHM7XHJcblx0XHRub3cgPSAoKyBuZXcgRGF0ZSk7IFxyXG5cdFx0ZnBzID0gMTAwMCAvIChub3cgLSB0aGlzLmxhc3RUaW1lKTtcclxuXHRcdGZwcyA9IGFwcC51dGlsaXRpZXMuY2xhbXAoZnBzLCAxMiwgNjApO1xyXG5cdFx0dGhpcy5sYXN0VGltZSA9IG5vdzsgXHJcblx0XHRyZXR1cm4gMS9mcHM7XHJcblx0fSxcclxuICAgIFxyXG4gICAgLy9oZWxwZXIgZXZlbnQgZnVuY3Rpb25zXHJcbiAgICBnZXRNb3VzZVBvc2l0aW9uOiBmdW5jdGlvbihlKXtcclxuXHRcdHRoaXMubGFzdE1vdXNlUG9zaXRpb24gPSB0aGlzLm1vdXNlUG9zaXRpb247XHJcbiAgICAgICAgdGhpcy5tb3VzZVBvc2l0aW9uID0gYXBwLnV0aWxpdGllcy5nZXRNb3VzZShlLCB0aGlzLmNhbnZhcy5vZmZzZXRXaWR0aCwgdGhpcy5jYW52YXMub2Zmc2V0SGVpZ2h0KTtcclxuICAgICAgICB0aGlzLnJlbGF0aXZlTW91c2VQb3NpdGlvbiA9IG5ldyBhcHAucG9pbnQodGhpcy5tb3VzZVBvc2l0aW9uLnggLSB0aGlzLmNhbnZhcy53aWR0aC8yICsgdGhpcy5ib2FyZC5wb3NpdGlvbi54LCB0aGlzLm1vdXNlUG9zaXRpb24ueSAtIHRoaXMuYWN0aXZlSGVpZ2h0LzIgKyB0aGlzLmJvYXJkLnBvc2l0aW9uLnkgLSB0aGlzLmhlYWRlci5vZmZzZXRIZWlnaHQpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKHRoaXMuZHJhZ2dpbmcpe1xyXG4gICAgICAgICAgICAvL3RoZSBwb3NpdGlvbmFsIGRpZmZlcmVuY2UgYmV0d2VlbiBsYXN0IGxvb3AgYW5kIHRoaXNcclxuICAgICAgICAgICAgdGhpcy5ib2FyZC5tb3ZlKHRoaXMubGFzdE1vdXNlUG9zaXRpb24ueCAtIHRoaXMubW91c2VQb3NpdGlvbi54LCB0aGlzLmxhc3RNb3VzZVBvc2l0aW9uLnkgLSB0aGlzLm1vdXNlUG9zaXRpb24ueSk7XHJcbiAgICAgICAgfVxyXG5cdH0sXHJcbiAgICBkb01vdXNlRG93biA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICB0aGlzLmRyYWdnaW5nID0gdHJ1ZTtcclxuICAgIH0sXHJcbiAgICBkb01vdXNlVXAgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZyA9IGZhbHNlO1xyXG4gICAgfSxcclxuICAgIGRvV2hlZWwgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgdGhpcy5ib2FyZC56b29tKHRoaXMuY3R4LCB0aGlzLmNlbnRlciwgZS5kZWx0YVkpO1xyXG4gICAgfSxcclxuICAgIFxyXG4gICAgY3Vyc29ySGFuZGxlciA6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgLy9pcyBpdCBob3ZlcmluZyBvdmVyIHRoZSBjYW52YXM/XHJcbiAgICAgICAgLy9pcyBpdCBkcmFnZ2luZz9cclxuICAgICAgICBpZih0aGlzLmRyYWdnaW5nKXtcclxuICAgICAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUuY3Vyc29yID0gXCItd2Via2l0LWdyYWJiaW5nXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLmN1cnNvciA9IFwiZGVmYXVsdFwiO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcclxuICAgIGJvYXJkQ29sbGlzaW9uSGFuZGxpbmcgOiBmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciBhY3RpdmVOb2RlO1xyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmJvYXJkLmxlc3Nvbk5vZGVBcnJheS5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgIGFjdGl2ZU5vZGUgPSB0aGlzLmJvYXJkLmxlc3Nvbk5vZGVBcnJheVtpXTtcclxuICAgICAgICAgICAgaWYodGhpcy5yZWxhdGl2ZU1vdXNlUG9zaXRpb24ueCA+IGFjdGl2ZU5vZGUucG9zaXRpb24ueCAtIGFjdGl2ZU5vZGUud2lkdGgvMiAmJiB0aGlzLnJlbGF0aXZlTW91c2VQb3NpdGlvbi54IDwgYWN0aXZlTm9kZS5wb3NpdGlvbi54ICsgYWN0aXZlTm9kZS53aWR0aC8yKXtcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMucmVsYXRpdmVNb3VzZVBvc2l0aW9uLnkgPiBhY3RpdmVOb2RlLnBvc2l0aW9uLnkgLSBhY3RpdmVOb2RlLmhlaWdodC8yICYmIHRoaXMucmVsYXRpdmVNb3VzZVBvc2l0aW9uLnkgPCBhY3RpdmVOb2RlLnBvc2l0aW9uLnkgKyBhY3RpdmVOb2RlLmhlaWdodC8yKXtcclxuICAgICAgICAgICAgICAgICAgICBhY3RpdmVOb2RlLmJvYXJkQnV0dG9uLmhvdmVyZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICBhY3RpdmVOb2RlLmJvYXJkQnV0dG9uLmhvdmVyZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgYWN0aXZlTm9kZS5ib2FyZEJ1dHRvbi5ob3ZlcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICAvL2RlYnVnXHJcbiAgICBkZWJ1Z0h1ZDogZnVuY3Rpb24oY3R4LCBkdCkge1xyXG4gICAgICAgIGN0eC5zYXZlKCk7XHJcbiAgICAgICAgdGhpcy5maWxsVGV4dChjdHgsIFwibW91c2VQb3NpdGlvbjogXCIgKyB0aGlzLm1vdXNlUG9zaXRpb24ueCArIFwiLCBcIiArIHRoaXMubW91c2VQb3NpdGlvbi55LCA1MCwgdGhpcy5jYW52YXMuaGVpZ2h0IC0gMTAsIFwiMTJwdCBvc3dhbGRcIiwgXCJCbGFja1wiKTtcclxuICAgICAgICB0aGlzLmZpbGxUZXh0KGN0eCxcIlJlbE1vdXNlUG9zaXRpb246IFwiK3RoaXMucmVsYXRpdmVNb3VzZVBvc2l0aW9uLnggKyBcIiwgXCIgKyB0aGlzLnJlbGF0aXZlTW91c2VQb3NpdGlvbi55LCB0aGlzLmNhbnZhcy53aWR0aC8yLCB0aGlzLmNhbnZhcy5oZWlnaHQgLSAxMCxcIjEycHQgb3N3YWxkXCIsXCJCbGFja1wiKTtcclxuICAgICAgICB0aGlzLmZpbGxUZXh0KGN0eCwgXCJkdDogXCIgKyBkdC50b0ZpeGVkKDMpLCB0aGlzLmNhbnZhcy53aWR0aCAtIDE1MCwgdGhpcy5jYW52YXMuaGVpZ2h0IC0gMTAsIFwiMTJwdCBvc3dhbGRcIiwgXCJibGFja1wiKTtcclxuICAgICAgICB0aGlzLmRyYXdMaWIubGluZShjdHgsIHRoaXMuY2VudGVyLngsIHRoaXMuY2VudGVyLnkgLSB0aGlzLmFjdGl2ZUhlaWdodC8yLCB0aGlzLmNlbnRlci54LCB0aGlzLmNlbnRlci55ICsgdGhpcy5hY3RpdmVIZWlnaHQvMiwgMiwgXCJMaWdodGdyYXlcIik7XHJcbiAgICAgICAgdGhpcy5kcmF3TGliLmxpbmUoY3R4LCAwLCB0aGlzLmNlbnRlci55LCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jZW50ZXIueSwgMiwgXCJMaWdodGdyYXlcIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5maWxsVGV4dChjdHgsIHRoaXMuYm9hcmQubGVzc29uTm9kZUFycmF5WzBdLmJvYXJkQnV0dG9uLmhvdmVyZWQsIHRoaXMuY2FudmFzLndpZHRoLzIsIHRoaXMuY2FudmFzLmhlaWdodCAtIDMwLCBcIjEycHQgb3N3YWxkXCIsIFwiYmxhY2tcIik7XHJcbiAgICAgICAgdGhpcy5maWxsVGV4dChjdHgsIHRoaXMuYm9hcmQubGVzc29uTm9kZUFycmF5WzFdLmJvYXJkQnV0dG9uLmhvdmVyZWQsIHRoaXMuY2FudmFzLndpZHRoLzIsIHRoaXMuY2FudmFzLmhlaWdodCAtIDUwLCBcIjEycHQgb3N3YWxkXCIsIFwiYmxhY2tcIik7XHJcbiAgICAgICAgdGhpcy5maWxsVGV4dChjdHgsIHRoaXMuYm9hcmQubGVzc29uTm9kZUFycmF5WzJdLmJvYXJkQnV0dG9uLmhvdmVyZWQsIHRoaXMuY2FudmFzLndpZHRoLzIsIHRoaXMuY2FudmFzLmhlaWdodCAtIDcwLCBcIjEycHQgb3N3YWxkXCIsIFwiYmxhY2tcIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuICAgIH0sXHJcbiAgICBmaWxsVGV4dDogZnVuY3Rpb24oY3R4LCBzdHJpbmcsIHgsIHksIGNzcywgY29sb3IpIHtcclxuXHRcdGN0eC5zYXZlKCk7XHJcblx0XHQvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9DU1MvZm9udFxyXG5cdFx0dGhpcy5jdHguZm9udCA9IGNzcztcclxuXHRcdHRoaXMuY3R4LmZpbGxTdHlsZSA9IGNvbG9yO1xyXG5cdFx0dGhpcy5jdHguZmlsbFRleHQoc3RyaW5nLCB4LCB5KTtcclxuXHRcdGN0eC5yZXN0b3JlKCk7XHJcblx0fSxcclxufTsiLCJcInVzZSBzdHJpY3RcIjtcclxuLy9wYXJhbWV0ZXIgaXMgYSBwb2ludCB0aGF0IGRlbm90ZXMgc3RhcnRpbmcgcG9zaXRpb25cclxuZnVuY3Rpb24gYm9hcmQoc3RhcnRQb3NpdGlvbiwgbGVzc29uTm9kZXMpe1xyXG4gICAgdGhpcy5wb3NpdGlvbiA9IHN0YXJ0UG9zaXRpb247XHJcblxyXG4gICAgdGhpcy5ib3VuZExlZnQgPSAwO1xyXG4gICAgdGhpcy5ib3VuZFJpZ2h0ID0gMDtcclxuICAgIHRoaXMuYm91bmRUb3AgPSAwO1xyXG4gICAgdGhpcy5ib3VuZEJvdHRvbSA9IDA7XHJcblxyXG4gICAgdGhpcy56b29tRmFjdG9yID0gMTtcclxuXHJcblxyXG4gICAgdGhpcy5sZXNzb25Ob2RlQXJyYXkgPSBsZXNzb25Ob2RlcztcclxufVxyXG5cclxuYm9hcmQuZHJhd0xpYiA9IHVuZGVmaW5lZDtcclxuXHJcbi8vaGVscGVyXHJcbmZ1bmN0aW9uIGNhbGN1bGF0ZUJvdW5kcygpe1xyXG4gICAgaWYodGhpcy5sZXNzb25Ob2RlQXJyYXkubGVuZ3RoID4gMCl7XHJcbiAgICAgICAgdGhpcy5ib3VuZExlZnQgPSB0aGlzLmxlc3Nvbk5vZGVBcnJheVswXS5wb3NpdGlvbi54O1xyXG4gICAgICAgIHRoaXMuYm91bmRSaWdodCA9IHRoaXMubGVzc29uTm9kZUFycmF5WzBdLnBvc2l0aW9uLng7XHJcbiAgICAgICAgdGhpcy5ib3VuZFRvcCA9IHRoaXMubGVzc29uTm9kZUFycmF5WzBdLnBvc2l0aW9uLnk7XHJcbiAgICAgICAgdGhpcy5ib3VuZEJvdHRvbSA9IHRoaXMubGVzc29uTm9kZUFycmF5WzBdLnBvc2l0aW9uLnk7XHJcbiAgICAgICAgZm9yKHZhciBpID0gMTsgaSA8IHRoaXMubGVzc29uTm9kZUFycmF5Lmxlbmd0aDsgaSsrKXtcclxuICAgICAgICAgICAgaWYodGhpcy5ib3VuZExlZnQgPiB0aGlzLmxlc3Nvbk5vZGVBcnJheVtpXS5wb3NpdGlvbi54KXtcclxuICAgICAgICAgICAgICAgIHRoaXMuYm91bmRMZWZ0ID0gdGhpcy5sZXNzb25Ob2RlQXJyYXlbaV0ucG9zaXRpb24ueDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmKHRoaXMuYm91bmRSaWdodCA8IHRoaXMubGVzc29uTm9kZUFycmF5W2ldLnBvc2l0aW9uLngpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib3VuZFJpZ2h0ID4gdGhpcy5sZXNzb25Ob2RlQXJyYXlbaV0ucG9zaXRpb24ueDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZih0aGlzLmJvdW5kVG9wID4gdGhpcy5sZXNzb25Ob2RlQXJyYXlbaV0ucG9zaXRpb24ueSl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvdW5kVG9wID0gdGhpcy5sZXNzb25Ob2RlQXJyYXlbaV0ucG9zaXRpb24ueTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmKHRoaXMuYm91bmRCb3R0b20gPCB0aGlzLmxlc3Nvbk5vZGVBcnJheVtpXS5wb3NpdGlvbi55KXtcclxuICAgICAgICAgICAgICAgIHRoaXMuYm91bmRCb3R0b20gPSB0aGlzLmxlc3Nvbk5vZGVBcnJheVtpXS5wb3NpdGlvbi55O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5cclxuLy9wcm90b3R5cGVcclxudmFyIHAgPSBib2FyZC5wcm90b3R5cGU7XHJcblxyXG5wLm1vdmUgPSBmdW5jdGlvbihwWCwgcFkpe1xyXG4gICAgdGhpcy5wb3NpdGlvbi54ICs9IHBYO1xyXG4gICAgdGhpcy5wb3NpdGlvbi55ICs9IHBZO1xyXG59O1xyXG5cclxuXHJcbnAuem9vbSA9IGZ1bmN0aW9uKGN0eCwgY2VudGVyLCBkZWx0YSl7XHJcbiAgICAvKlxyXG4gICAgaWYoZGVsdGEgPiAwKXtcclxuICAgICAgICB0aGlzLnpvb21GYWN0b3IgLT0gLjE7XHJcbiAgICAgICAgaWYodGhpcy56b29tRmFjdG9yIDwgLjUpe1xyXG4gICAgICAgICAgICB0aGlzLnpvb21GYWN0b3IgPSAuNTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNle1xyXG4gICAgICAgIHRoaXMuem9vbUZhY3RvciArPSAuMTtcclxuICAgICAgICBpZih0aGlzLnpvb21GYWN0b3IgPiAxLjUpe1xyXG4gICAgICAgICAgICB0aGlzLnpvb21GYWN0b3IgPSAxLjU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgKi9cclxuICAgIC8vbnVkZ2UgdGhpcyBpbiB0aGUgZGlyZWN0aW9uIG9mIHRoZSBtb3VzZVxyXG4gICAgLy90aGlzLm1vdmUoKGNlbnRlci54IC0gbW91c2VQb3NpdGlvbi54KS8xMCwgKGNlbnRlci55IC0gbW91c2VQb3NpdGlvbi55KS8xMCk7XHJcbiAgICAvL2N0eC50cmFuc2xhdGUoY2VudGVyLngsIGNlbnRlci55KTtcclxuICAgIC8vY3R4LnNjYWxlKHRoaXMuem9vbUZhY3RvciwgdGhpcy56b29tRmFjdG9yKTtcclxuICAgIC8vY3R4LnRyYW5zbGF0ZSgtY2VudGVyLngsIC1jZW50ZXIueSk7XHJcbn07XHJcblxyXG5wLmRyYXcgPSBmdW5jdGlvbihjdHgsIGNlbnRlciwgYWN0aXZlV2lkdGgsIGFjdGl2ZUhlaWdodCl7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgLy90cmFuc2xhdGUgdG8gdGhlIGNlbnRlciBvZiB0aGUgc2NyZWVuXHJcbiAgICBjdHgudHJhbnNsYXRlKGNlbnRlci54IC0gdGhpcy5wb3NpdGlvbi54LCBjZW50ZXIueSAtIHRoaXMucG9zaXRpb24ueSk7XHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5sZXNzb25Ob2RlQXJyYXkubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgIHRoaXMubGVzc29uTm9kZUFycmF5W2ldLmRyYXcoY3R4LCB0aGlzLnpvb21GYWN0b3IpO1xyXG4gICAgfVxyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gYm9hcmQ7XHJcblxyXG4vL3RoaXMgaXMgYW4gb2JqZWN0IG5hbWVkIEJvYXJkIGFuZCB0aGlzIGlzIGl0cyBqYXZhc2NyaXB0XHJcbi8vdmFyIEJvYXJkID0gcmVxdWlyZSgnLi9vYmplY3RzL2JvYXJkLmpzJyk7XHJcbi8vdmFyIGIgPSBuZXcgQm9hcmQoKTtcclxuICAgICIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuLy9wYXJhbWV0ZXIgaXMgYSBwb2ludCB0aGF0IGRlbm90ZXMgc3RhcnRpbmcgcG9zaXRpb25cclxuZnVuY3Rpb24gYm9hcmRCdXR0b24oc3RhcnRQb3NpdGlvbiwgd2lkdGgsIGhlaWdodCl7XHJcbiAgICB0aGlzLnBvc2l0aW9uID0gc3RhcnRQb3NpdGlvbjtcclxuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgdGhpcy5jbGlja2VkID0gZmFsc2U7XHJcbiAgICB0aGlzLmhvdmVyZWQgPSBmYWxzZTtcclxufVxyXG5ib2FyZEJ1dHRvbi5kcmF3TGliID0gdW5kZWZpbmVkO1xyXG5cclxudmFyIHAgPSBib2FyZEJ1dHRvbi5wcm90b3R5cGU7XHJcblxyXG5wLmRyYXcgPSBmdW5jdGlvbihjdHgpe1xyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIHZhciBjb2w7XHJcbiAgICBpZih0aGlzLmhvdmVyZWQpe1xyXG4gICAgICAgIGNvbCA9IFwiZG9kZ2VyYmx1ZVwiO1xyXG4gICAgfVxyXG4gICAgZWxzZXtcclxuICAgICAgICBjb2wgPSBcImxpZ2h0Ymx1ZVwiO1xyXG4gICAgfVxyXG4gICAgLy9kcmF3IHJvdW5kZWQgY29udGFpbmVyXHJcbiAgICBib2FyZEJ1dHRvbi5kcmF3TGliLnJlY3QoY3R4LCB0aGlzLnBvc2l0aW9uLnggLSB0aGlzLndpZHRoLzIsIHRoaXMucG9zaXRpb24ueSAtIHRoaXMuaGVpZ2h0LzIsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCBjb2wpO1xyXG5cclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGJvYXJkQnV0dG9uOyIsIlwidXNlIHN0cmljdFwiO1xyXG4vL3RoZSBqc29uIGlzIGxvY2FsLCBubyBuZWVkIGZvciB4aHIgd2hlbiB1c2luZyB0aGlzIG1vZHVsZSBwYXR0ZXJuXHJcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vLi4vZGF0YS9sZXNzb25zLmpzb24nKTtcclxuLypcclxudmFyIHhociA9IHJlcXVpcmUoJ3hocicpO1xyXG5cclxudmFyIGFwcCA9IGFwcCB8fCB7fTtcclxuXHJcbnZhciBpbmZvQXJyYXkgPSB1bmRlZmluZWQ7XHJcblxyXG54aHIoe1xyXG4gICAgdXJpOiBcImRhdGEvbGVzc29ucy5qc29uXCIsXHJcbiAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICAgICAgXCJJZi1Nb2RpZmllZC1TaW5jZVwiOiBcIlNhdCwgMSBKYW4gMjAxMCAwMDowMDowMCBHTVRcIlxyXG4gICAgfVxyXG59LCBmdW5jdGlvbiAoZXJyLCByZXNwLCBib2R5KSB7XHJcbiAgICB2YXIgbXlKU09OID0gSlNPTi5wYXJzZShib2R5KTtcclxuICAgIGluZm9BcnJheSA9IG15SlNPTi5sZXNzb25zO1xyXG59KTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGluZm9BcnJheTtcclxuKi8iLCJmdW5jdGlvbiBnYW1lKCl7XHJcbn1cclxuXHJcbnZhciBwID0gZ2FtZS5wcm90b3R5cGU7XHJcblxyXG5wLnVwZGF0ZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAvL3VwZGF0ZSBzdHVmZlxyXG4gICAgcC5hY3QoKTtcclxuICAgIC8vZHJhdyBzdHVmZlxyXG4gICAgcC5kcmF3KCk7XHJcbn1cclxuXHJcbnAuYWN0ID0gZnVuY3Rpb24oKXtcclxuICAgIGNvbnNvbGUubG9nKFwiQUNUXCIpO1xyXG59XHJcblxyXG5wLmRyYXcgPSBmdW5jdGlvbigpe1xyXG4gICAgY29uc29sZS5sb2coXCJEUkFXXCIpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGdhbWU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vcGFyYW1ldGVyIGlzIGEgcG9pbnQgdGhhdCBkZW5vdGVzIHN0YXJ0aW5nIHBvc2l0aW9uXHJcbmZ1bmN0aW9uIGxlc3Nvbk5vZGUoc3RhcnRQb3NpdGlvbiwgaW1hZ2VQYXRoKXtcclxuICAgIHRoaXMucG9zaXRpb24gPSBzdGFydFBvc2l0aW9uO1xyXG4gICAgdGhpcy53aWR0aCA9IDEwMDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gMTAwO1xyXG4gICAgdGhpcy5ib2FyZEJ1dHRvbiA9IG5ldyBhcHAuYm9hcmRCdXR0b24odGhpcy5wb3NpdGlvbiwgdGhpcy53aWR0aCx0aGlzLmhlaWdodCk7XHJcblxyXG4gICAgLy9pbWFnZSBsb2FkaW5nXHJcbiAgICB2YXIgdGVtcEltYWdlID0gbmV3IEltYWdlKCk7XHJcbiAgICB0cnl7XHJcbiAgICAgICAgdGVtcEltYWdlLnNyYyA9IGltYWdlUGF0aDtcclxuICAgICAgICB0aGlzLmltYWdlID0gdGVtcEltYWdlO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICBpbWFnZS5zcmMgPSB0aGlzLmFwcC5JbWFnZXNbJ2V4YW1wbGVJbWFnZSddO1xyXG4gICAgICAgIHRoaXMuaW1hZ2UgPSB0ZW1wSW1hZ2U7XHJcbiAgICB9XHJcbn1cclxuXHJcbmxlc3Nvbk5vZGUuZHJhd0xpYiA9IHVuZGVmaW5lZDtcclxuXHJcbnZhciBwID0gbGVzc29uTm9kZS5wcm90b3R5cGU7XHJcblxyXG5wLmRyYXcgPSBmdW5jdGlvbihjdHgsIHNjYWxlRmFjdG9yKXtcclxuICAgIC8vbGVzc29uTm9kZS5kcmF3TGliLmNpcmNsZShjdHgsIHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55LCAxMCwgXCJyZWRcIik7XHJcbiAgICB0aGlzLmJvYXJkQnV0dG9uLmRyYXcoY3R4KTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbGVzc29uTm9kZTsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIHg7XHJcbnZhciB5O1xyXG5mdW5jdGlvbiBwb2ludChwWCwgcFkpe1xyXG4gICAgeCA9IHBYO1xyXG4gICAgeSA9IHBZO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHBvaW50OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuLy8gcmV0dXJucyBtb3VzZSBwb3NpdGlvbiBpbiBsb2NhbCBjb29yZGluYXRlIHN5c3RlbSBvZiBlbGVtZW50XHJcbmZ1bmN0aW9uIGdldE1vdXNlKGUsIGFjdHVhbENhbnZhc1dpZHRoLCBhY3R1YWxDYW52YXNIZWlnaHQpe1xyXG4gICAgLy9yZXR1cm4gbmV3IGFwcC5Qb2ludCgoZS5wYWdlWCAtIGUudGFyZ2V0Lm9mZnNldExlZnQpICogKGFwcC5tYWluLnJlbmRlcldpZHRoIC8gYWN0dWFsQ2FudmFzV2lkdGgpLCAoZS5wYWdlWSAtIGUudGFyZ2V0Lm9mZnNldFRvcCkgKiAoYXBwLm1haW4ucmVuZGVySGVpZ2h0IC8gYWN0dWFsQ2FudmFzSGVpZ2h0KSk7XHJcbiAgICByZXR1cm4gbmV3IGFwcC5wb2ludCgoZS5wYWdlWCAtIGUudGFyZ2V0Lm9mZnNldExlZnQpLCAoZS5wYWdlWSAtIGUudGFyZ2V0Lm9mZnNldFRvcCkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBtYXAodmFsdWUsIG1pbjEsIG1heDEsIG1pbjIsIG1heDIpe1xyXG4gICAgcmV0dXJuIG1pbjIgKyAobWF4MiAtIG1pbjIpICogKCh2YWx1ZSAtIG1pbjEpIC8gKG1heDEgLSBtaW4xKSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNsYW1wKHZhbHVlLCBtaW4sIG1heCl7XHJcbiAgICByZXR1cm4gTWF0aC5tYXgobWluLCBNYXRoLm1pbihtYXgsIHZhbHVlKSk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgZ2V0TW91c2UgOiBnZXRNb3VzZSxcclxuICAgIGNsYW1wOiBjbGFtcCxcclxuICAgIG1hcDogbWFwICAgIFxyXG59OyJdfQ==
