(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
//imports
var Game = require('./modules/Game.js');
var Point = require('./modules/common/Point.js');
var Time = require('./modules/containers/Time.js');
var MouseState = require('./modules/containers/MouseState.js');
var CanvasState = require('./modules/containers/CanvasState.js');

//game objects
var game;
var canvas;
var ctx;
var time;

//responsiveness
var header;
var center;
var scale;

//mouse handling
var mousePosition;
var relativeMousePosition;
var mouseDown;
var mouseIn;
var wheelDelta;

//passable states
var mouseState;
var canvasState;

//fires when the window loads
window.onload = function(e){
    //debug button designed to clear progress data
    /*
    var resetButton = document.querySelector("#resetButton");
    resetButton.addEventListener("click", function(e){
        localStorage.progress = "";
    });*/
    
    //variable and loop initialization
    initializeVariables();
    loop();
}

//initialization for variables, mouse events, and game "class"
function initializeVariables(){
    //camvas initialization
    canvas = document.querySelector('canvas');
    ctx = canvas.getContext('2d');
    //console.log("Canvas Dimensions: " + canvas.offsetWidth + ", " + canvas.offsetHeight);
    
    time = new Time();
    
    
    //mouse variable initialization
    mousePosition = new Point(0,0);
    relativeMousePosition = new Point(0,0);
    
    
    
    
    
    //event listeners for mouse interactions with the canvas
    canvas.addEventListener("mousemove", function(e) {
        var boundRect = canvas.getBoundingClientRect();
        mousePosition = new Point(e.clientX - boundRect.left, e.clientY - boundRect.top);
        relativeMousePosition = new Point(mousePosition.x - canvas.offsetWidth / 2, mousePosition.y - canvas.offsetHeight / 2);
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
    wheelDelta = 0;
    canvas.addEventListener("mousewheel", function(e){
        wheelDelta = e.wheelDelta;
    });
    
    
    
    
    //state variable initialization
    mouseState = new MouseState(mousePosition, relativeMousePosition, mouseDown, mouseIn, wheelDelta);
    canvasState = new CanvasState(canvas, ctx);
    
    //local storage handling for active node record and progress
    if(localStorage.activeNode === undefined){
        localStorage.activeNode = 0;
    }
    if(localStorage.progress === undefined){
        localStorage.progress = "";
    }
    
    //creates the game object from which most interaction is managed
    game = new Game();
}

//fires once per frame
function loop() {
    //binds loop to frames
    window.requestAnimationFrame(loop.bind(this));
    
    time.update(.0167);
    
    //feed current mouse variables back into mouse state
    mouseState.update(mousePosition, relativeMousePosition, mouseDown, mouseIn, wheelDelta);
    //resetting wheel delta
    wheelDelta = 0;
    
    //update game's variables: passing context, canvas, time, center point, usable height, mouse state
    
    game.update(mouseState, canvasState, time);
};

//listens for changes in size of window and adjusts variables accordingly
window.addEventListener("resize", function(e){
    canvasState.update();
});



},{"./modules/Game.js":2,"./modules/common/Point.js":3,"./modules/containers/CanvasState.js":5,"./modules/containers/MouseState.js":6,"./modules/containers/Time.js":7}],2:[function(require,module,exports){
"use strict";
//imported objects
var BoardPhase = require('./phases/boardPhase/BoardPhase.js');
var GraphPhase = require('./phases/graphPhase/GraphPhase.js');
var DrawLib = require('./libraries/Drawlib.js');
var Utilities = require('./libraries/Utilities.js');

var activePhase;
var painter;
var utility;

var mouseState

function Game(){    
    painter = new DrawLib();
    utility = new Utilities();
    
    //instantiate the graph
    activePhase = new GraphPhase("https://atlas-backend.herokuapp.com/repos"); //actual backend app
    //activePhase = new GraphPhase("http://localhost:5000/repos"); //for testing
    
    //give mouseState a value from the start so it doesn't pass undefined to previous
    mouseState = 0;
}

//passing context, canvas, delta time, center point, mouse state
Game.prototype.update = function(mouseState, canvasState, time) {
    
    
    //update key variables in the active phase
    activePhase.update(mouseState, canvasState, time);
    
    //draw background and then active phase
    canvasState.ctx.save();
    painter.rect(canvasState.ctx, 0, 0, canvasState.width, canvasState.height, "#222");
    canvasState.ctx.restore();
    activePhase.draw(canvasState);
    
}

module.exports = Game;
},{"./libraries/Drawlib.js":10,"./libraries/Utilities.js":11,"./phases/boardPhase/BoardPhase.js":13,"./phases/graphPhase/GraphPhase.js":19}],3:[function(require,module,exports){
"use strict";
function Point(pX, pY){
    this.x = pX;
    this.y = pY;
};

module.exports = Point;
},{}],4:[function(require,module,exports){
"use strict";

var Point = require('../common/Point.js');

function Button(position, size, text, color) {
    this.position = new Point(position.x, position.y);
    this.size = new Point(size.x, size.y);
    this.text = text;
    this.mouseOver = false;
    this.color = color;
    this.outlineWidth = 1;
};

//updates button, returns true if clicked
Button.prototype.update = function(pMouseState) {
    
    var m = pMouseState.relativePosition;
    if( m.x < this.position.x || m.x > this.position.x + this.size.x ||
        m.y < this.position.y || m.y > this.position.y + this.size.y) {
        this.mouseOver = false;
    }
    else {
        this.mouseOver = true;
        if(pMouseState.mouseDown && !pMouseState.lastMouseDown) {
            return true;
        }
    }
    return false;
};

Button.prototype.draw = function(pCanvasState, pPainter) {
    //draw base button
    if(this.mouseOver) {
        this.outlineWidth = 2;
    }
    else {
        this.outlineWidth = 1;
    }
    pPainter.rect(pCanvasState.ctx,
                  this.position.x - this.outlineWidth,
                  this.position.y - this.outlineWidth,
                  this.size.x + 2 * this.outlineWidth,
                  this.size.y + 2 * this.outlineWidth, "#fff");

    pPainter.rect(pCanvasState.ctx, this.position.x, this.position.y, this.size.x, this.size.y, this.color);
    
    //draw text of button
    pCanvasState.ctx.save();
    pCanvasState.ctx.font = "16px Arial";
    pCanvasState.ctx.fillStyle = "#fff";
    pCanvasState.ctx.textAlign = "center";
    pCanvasState.ctx.textBaseline = "middle";
    pCanvasState.ctx.fillText(this.text, this.position.x + this.size.x / 2, this.position.y + this.size.y / 2);
    pCanvasState.ctx.restore();
    
    
};


module.exports = Button;
},{"../common/Point.js":3}],5:[function(require,module,exports){
//Contains canvas related variables in a single easy-to-pass object
"use strict";
var Point = require('../common/Point.js');


function CanvasState(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.update();
}

CanvasState.prototype.update = function() {
    this.width = this.canvas.width = this.canvas.offsetWidth;
    this.height = this.canvas.height = this.canvas.offsetHeight;
    this.center = new Point(this.canvas.width / 2, this.canvas.height / 2);
}

module.exports = CanvasState;
},{"../common/Point.js":3}],6:[function(require,module,exports){
//keeps track of mouse related variables.
//calculated in main and passed to game
//contains up state
//position
//relative position
//on canvas
"use strict";
function MouseState(pPosition, pRelativePosition, pMouseDown, pMouseIn, pWheelDelta){
    this.position = pPosition;
    this.relativePosition = pRelativePosition;
    this.mouseDown = pMouseDown;
    this.mouseIn = pMouseIn;
    this.wheelDelta = pWheelDelta;
    
    //tracking previous mouse states
    this.lastPosition = pPosition;
    this.lastRelativePosition = pRelativePosition;
    this.lastMouseDown = pMouseDown;
    this.lastMouseIn = pMouseIn;
    this.lastWheelDelta = pWheelDelta
}

MouseState.prototype.update = function(pPosition, pRelativePosition, pMouseDown, pMouseIn, pWheelDelta){
    this.lastPosition = this.position;
    this.lastRelativePosition = this.relativePosition;
    this.lastMouseDown = this.mouseDown;
    this.lastMouseIn = this.mouseIn;
    this.lastWheelDelta = this.wheelDelta;
    
    
    this.position = pPosition;
    this.relativePosition = pRelativePosition;
    this.mouseDown = pMouseDown;
    this.mouseIn = pMouseIn;
    this.wheelDelta = pWheelDelta;
}

module.exports = MouseState;
},{}],7:[function(require,module,exports){
"use strict";

function Time () {
    this.totalTime = 0;
    this.deltaTime = 0;
};

Time.prototype.update = function(dt) {
    this.totalTime += dt;
    this.deltaTime = dt;
};

module.exports = Time;
},{}],8:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"./libraries/Drawlib.js":10,"./libraries/Utilities.js":11,"./phases/boardPhase/BoardPhase.js":13,"./phases/graphPhase/GraphPhase.js":19,"dup":2}],9:[function(require,module,exports){
"use strict";
function Drawlib(){
};

Drawlib.prototype.clear = function(ctx, x, y, w, h) {
    ctx.clearRect(x, y, w, h);
};

Drawlib.prototype.rect = function(ctx, x, y, w, h, col) {
    ctx.save();
    ctx.fillStyle = col;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
};

Drawlib.prototype.roundedRect = function(ctx, x, y, w, h, rad, fill, fillColor, outline, outlineColor, outlineWidth) {
    ctx.save();
    ctx.moveTo(x, y - rad); //11 o clock
    ctx.beginPath();
    ctx.lineTo(x + w, y - rad); //1 o clock
    ctx.arcTo(x + w + rad, y - rad, x + w + rad, y, rad); // 2 o clock
    ctx.lineTo(x + w + rad, y + h); // 4 o clock
    ctx.arcTo(x + w + rad, y + h + rad, x + w, y + h + rad, rad) //5 o clock
    ctx.lineTo(x, y + h + rad); // 7 o clock
    ctx.arcTo(x - rad, y + h + rad, x - rad, y + h, rad) //8 o clock
    ctx.lineTo(x - rad, y); // 10 o clock
    ctx.arcTo(x - rad, y - rad, x, y -rad, rad) //11 o clock
    ctx.closePath();
    if(fill) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }
    if(outline) {
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = outlineWidth;
        ctx.stroke();
    }
    ctx.restore();
}

Drawlib.prototype.line = function(ctx, x1, y1, x2, y2, thickness, color) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.restore();
};

Drawlib.prototype.circle = function(ctx, x, y, radius, fill, fillColor, outline, outlineColor, outlineWidth) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x,y, radius, 0, 2 * Math.PI, false);
    ctx.closePath();
    if(fill) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }
    if(outline) {
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = outlineWidth;
        ctx.stroke();
    }
    ctx.restore();
};

Drawlib.prototype.textToLines = function(ctx, text, font, width) {
    ctx.save();
    ctx.font = font;
    
    var lines = [];
    
    while (text.length) {
        var i, j;
        for(i = text.length; ctx.measureText(text.substr(0, i)).width > width; i--);

        var result = text.substr(0,i);

        if (i !== text.length)
            for(var j = 0; result.indexOf(" ", j) !== -1; j = result.indexOf(" ", j) + 1);

        lines.push(result.substr(0, j || result.length));
        width = Math.max(width, ctx.measureText(lines[lines.length - 1]).width);
        text  = text.substr(lines[lines.length - 1].length, text.length);
    }
    ctx.restore();
    return lines;
};

module.exports = Drawlib;
},{}],10:[function(require,module,exports){
arguments[4][9][0].apply(exports,arguments)
},{"dup":9}],11:[function(require,module,exports){
"use strict";
var Point = require('../common/Point.js');

function Utilities(){
}

//BOARDPHASE - set a status value of a node in localStorage based on ID
Utilities.prototype.setProgress = function(pObject){
    var progressString = localStorage.progress;
    
    var targetObject = pObject;
    //make accomodations if this is an extension node
    var extensionflag = true;
    while(extensionflag){
        if(targetObject.type === "extension"){
            targetObject = targetObject.connectionForward[0];
        }
        else{
            extensionflag = false;
        }
    }
    
    var objectID = targetObject.data._id;
    var objectStatus = targetObject.status;
    
    //search the progressString for the current ID
    var idIndex = progressString.indexOf(objectID);
    
    //if it's not add it to the end
    if(idIndex === -1){
        progressString += objectID + "" + objectStatus + ",";
    }
    //otherwise modify the status value
    else{
        progressString = progressString.substr(0, objectID.length + idIndex) + objectStatus + progressString.substr(objectID.length + 1 + idIndex, progressString.length) + "";
    }
    localStorage.progress = progressString;
}

//returns mouse position in local coordinate system of element
Utilities.prototype.getMouse = function(e){
    return new Point((e.pageX - e.target.offsetLeft), (e.pageY - e.target.offsetTop));
}

Utilities.prototype.map = function(value, min1, max1, min2, max2){
    return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
}

//limits the upper and lower limits of the parameter value
Utilities.prototype.clamp = function(value, min, max){
    return Math.max(min, Math.min(max, value));
}

//checks mouse collision on canvas
Utilities.prototype.mouseIntersect = function(pMouseState, pElement, pOffsetter, pScale){
    //if the x position collides
    if(pElement.status !== "0"){
        if(pMouseState.relativePosition.x + pOffsetter.x > (pElement.position.x - (pElement.width)/2) && pMouseState.relativePosition.x + pOffsetter.x < (pElement.position.x + (pElement.width)/2)){
            //if the y position collides
            if(pMouseState.relativePosition.y + pOffsetter.y > (pElement.position.y - (pElement.height)/2) && pMouseState.relativePosition.y + pOffsetter.y < (pElement.position.y + (pElement.height)/2)){
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
}

module.exports = Utilities;
},{"../common/Point.js":3}],12:[function(require,module,exports){
"use strict";
var DrawLib = require('../../libraries/Drawlib.js');
var LessonNode = require('./LessonNode.js');
var Point = require('../../common/Point.js');
var ExtensionNode = require('./ExtensionNode.js');

var painter;

//parameter is a point that denotes starting position
function Board(pStartPosition, pJSONData){
    this.position = pStartPosition;
    
    var stagingArray = [];
    
    //populate the array
    for(var i = 0; i < pJSONData.length; i++){
        //ensures that the chunk contains image data
        if(pJSONData[i].image !== undefined){
            var testread = pJSONData[i].image;
            stagingArray.push(new LessonNode(new Point(0, 0), pJSONData[i]));
        }
    }
    
    //find and label the start points
    for(var i = 0; i < stagingArray.length; i++){
        //if a node has no connections, it must be a starting node
        if(stagingArray[i].data.connections.length === 0){
            stagingArray[i].placement = 0;
        }
        else{
            stagingArray[i].placement = -1;
        }
    }
    
    //set direct object connections to related nodes for referencing
    //parse entire list
    for(var i = 0; i < stagingArray.length; i++){
        var debugText = stagingArray[i].data.name;
        stagingArray[i].connectionForward = [];
        stagingArray[i].connectionBackward = [];
        //compare against every other node
        for(var j = 0; j < stagingArray.length; j++){
            var debugText2 = stagingArray[j].data.name;
            //compare against every connection
            for(var k = 0; k < stagingArray[j].data.connections.length; k++){
                if(stagingArray[j].data.connections[k] === stagingArray[i].data.name){
                    stagingArray[i].connectionForward.push(stagingArray[j]);
                }
            }
            //backwards
            for(var k = 0; k < stagingArray[i].data.connections.length; k++){
                if(stagingArray[j].data.name === stagingArray[i].data.connections[k]){
                    stagingArray[i].connectionBackward.push(stagingArray[j]);
                }
            }
        }
    }
    
    //assign placements to each node based on the connections they make to one another
    var completionFlag = false;
    var debugCounter = 0;
    while(!completionFlag){
        completionFlag = true;
        //iterate through every node
        for(var i = 0; i < stagingArray.length; i++){
            //go through that node's forward connections
            var debugName = stagingArray[i].data.title;
            for(var j = 0; j < stagingArray[i].connectionForward.length; j++){
                //if that forward node's placement has a value of -1, it has not been assigned a placement value yet
                //also checks to ensure that the current node has a value
                if(stagingArray[i].connectionForward[j].placement === -1 && stagingArray[i].placement !== -1){
                    //does the forward node have multiple backwards connections?
                    if(stagingArray[i].connectionForward[j].connectionBackward.length > 1){
                        //if the forward node has multiple backwards connections yes, ensure that each is fulfilled before assigning values
                        var fulfilledFlag = true;
                        //used to store the highest placement value of backwards connections
                        var highestValue = 0;
                        for(k = 0; k < stagingArray[i].connectionForward[j].connectionBackward.length; k++){
                            //-1 denotes that it has not yet been assigned a placement
                            if(stagingArray[i].connectionForward[j].connectionBackward[k].placement === -1){
                                fulfilledFlag = false;
                                break;
                            }
                            //assigns the highest placement variable in the set of the backwards connections to highest value variable
                            if(stagingArray[i].connectionForward[j].connectionBackward[k].placement > highestValue){
                                highestValue = stagingArray[i].connectionForward[j].connectionBackward[k].placement;
                            }
                        }
                        //if the flag remains true at this point, it is safe to assign a placement value
                        if(fulfilledFlag){
                            //the highest valued placement of backwards connections will be used
                            stagingArray[i].connectionForward[j].placement = highestValue + 1;
                        }
                    }
                    //if the forward node does not have multiple backward connections, everything is clear to assign a value
                    else{
                        //the current node's placement +1 is given
                        stagingArray[i].connectionForward[j].placement = stagingArray[i].placement + 1;
                    }
                }
            }
            //a node with a placement of -1 has not yet had an assignment
            if(stagingArray[i].placement === -1){
                //this is designed to catch "bad nodes" caused by improperly entered data. Doesn't count "bad" nodes against completion
                if(stagingArray[i].connectionForward.length !== 0 && stagingArray[i].connectionBackward.length !== 0){
                    completionFlag = false;
                }
            }
        }
        //will leave as a catch so that it will pass instead of crashing if there is a data error
        debugCounter++;
        if(debugCounter > 100000){
            completionFlag = true;
        }
    }
    
    //determine furthest placement
    var furthestPlacement = 0;
    for(var i = 0; i < stagingArray.length; i++){
        if(stagingArray[i].placement > furthestPlacement){
            furthestPlacement = stagingArray[i].placement;
        }
    }
    
    //create and populate 2d array based on staging array data
    var nodeArray = [];
    for(var i = 0; i < furthestPlacement + 1; i++){
        var subArray = [];
        for(var j = 0; j < stagingArray.length; j++){
            if(stagingArray[j].placement === i){
                subArray.push(stagingArray[j]);
            }
        }
        nodeArray[i] = subArray;
    }
    
    //add extensionNodes that will be used for nodes that connect to a node not directly subsequent
    //parse through every node
    for(var i = 0; i < nodeArray.length - 1; i++){
        var subArray = nodeArray[i];
        for(var j = 0; j < subArray.length; j++){
            //parse through each forward connection
            for(var k = 0; k < subArray[j].connectionForward.length; k++){
                var nextArray = nodeArray[i + 1];
                var extend = true;
                //parse through the next array
                for(var l = 0; l < nextArray.length; l++){
                    if(subArray[j].connectionForward[k].data.name === nextArray[l].data.name){
                        extend = false;
                        break;
                    }
                }
                //assuming that there was no match for this connection, add an extension node to the nextArray
                if(extend){
                    var nextExtension = new ExtensionNode(subArray[j].connectionForward[k].data.name, subArray[j].connectionForward[k], subArray[j]);
                    nextArray.push(nextExtension);
                    //change the current node's forward connection to this extension node
                    subArray[j].connectionForward[k] = nextExtension;
                }
            }
        }
    }
    
    //alphabetize the arrays using string sorting array method
    for(var i = 0; i < nodeArray.length; i++){
        nodeArray[i].sort(function compare(a,b) {
            if (a.data.title < b.data.title) { return -1; }
            else if (a.data.title > b.data.title) { return 1; }
            else {return 0;}
        });
    }
    
    //sort the array to increase visual efficiency, parse through each subArray
    for(var i = 0; i < nodeArray.length - 1; i++){
        var subArray = nodeArray[i];
        var insertIndex = 0;
        //parse through each element vertically
        for(var j = 0; j < subArray.length; j++){
            var debugText1 = subArray[j].data.name;
            //parse through next Array
            var nextArray = nodeArray[i + 1];
            for(var k = insertIndex; k < nextArray.length; k++){
                var debugText2 = nextArray[k].data.name;
                //parse through forwardConnection
                for(var l = 0; l < subArray[j].connectionForward.length; l++){
                    var debugText3 = subArray[j].connectionForward[l].data.name
                    //if there's a match
                    if(subArray[j].connectionForward[l].data.name === nextArray[k].data.name){
                        //swap indices
                        var swapHolder = nextArray[insertIndex];
                        nextArray[insertIndex] = nextArray[k];
                        nextArray[k] = swapHolder;
                        insertIndex++;
                    }
                }
            }
        }
    }
    
    //assign pixel point positions based on placement in the 2d array
    for(var i = 0; i < nodeArray.length; i++){
        var subArray = nodeArray[i];
        for(var j = 0; j < subArray.length; j++){
            //assign position values
            nodeArray[i][j].position = new Point(i * 300, j * 200 - (((subArray.length - 1) * 200) / 2));
        }
    }
    
    //process localStorage data and format into an array
    var progressString = localStorage.progress;
    
    //keep track of which chunks are leftover 
    var saveDataList = localStorage.progress;
    //load status from localStorage, iterate through every node
    for(var i = 0; i < nodeArray.length; i++){
        var subArray = nodeArray[i];
        for(var j = 0; j < subArray.length; j++){
            //process extensions separately
            if(subArray[j].type === "extension"){}
            else{
                //get position of the id in localStorage
                var idIndex = progressString.indexOf(subArray[j].data._id);
                //if the node id cannot be found in localStorage
                if(idIndex === -1){
                    //if it's a start node
                    if(i === 0){
                        subArray[j].status = "1";
                    }
                    //not a start node
                    else{
                        subArray[j].status = "0";
                    }
                }
                //node id exists in localStorage, get and apply the status
                else{
                    subArray[j].status = progressString[(idIndex + subArray[j].data._id.length)];
                    //does this node have extensions? What measures should be taken to ensure that they draw correctly?
                    //iterate though each forward connection
                    for(var k = 0; k < subArray[j].connectionForward.length; k++){
                        var targetNode = subArray[j].connectionForward[k];
                        while(targetNode.type === "extension"){
                            targetNode.status = subArray[j].status;
                            targetNode = targetNode.connectionForward[0];
                        }
                    }
                    
                    //at this point the current save data chunk is confirmed to be present, excise from the progress tring
                    saveDataList = saveDataList.replace(subArray[j].data._id + subArray[j].status + ",", "");
                }
            }
        }
    }
    
    var progressmarker = progressString;
    //split the save data list string and parse through localStorage
    if(saveDataList !== ""){
        saveDataList = saveDataList.substring(0, saveDataList.length - 1);
    }
    var splitExtras = saveDataList.split(",");
    for(var i = 0; i < splitExtras.length; i++){
        progressString = progressString.replace(splitExtras[i] + ",", "");
    }
    
    localStorage.progress = progressString;
    
    
    this.nodeArray = nodeArray;
    
    
    painter = new DrawLib();
    
    //move this board based on saved cookie data
    if(localStorage.activeNode !== "0"){
        for(var i = 0; i < nodeArray.length; i++){
            var subArray = nodeArray[i];
            for(var j = 0; j < subArray.length; j++){
                if(subArray[j].data._id === localStorage.activeNode){
                    this.move(subArray[j].position.x, subArray[j].position.y);
                    break;
                }
            }
        }
    }
};

var _generateNodeArray = function (pStagingArray, pStartArray) {
    var nodeArrayExport;
    
    for(var i = 0; i < pStartArray.length; i++){
        _connect(pStagingArray[i], nodeArrayExport);
    }
    
    
    return nodeArrayExport;
};

Board.prototype.move = function(pX, pY){
    this.position.x += pX;
    this.position.y += pY;
};

//context, center point, usable height
Board.prototype.draw = function(canvasState){
    canvasState.ctx.save();
    //translate to the center of the screen
    canvasState.ctx.translate(canvasState.center.x - this.position.x, canvasState.center.y - this.position.y);
    //draw nodes
    for(var i = 0; i < this.nodeArray.length; i++){
        var subArray = this.nodeArray[i];
        for(var j = 0; j < subArray.length; j++){
            this.nodeArray[i][j].draw(canvasState);
        }
    }
    canvasState.ctx.restore();
};

module.exports = Board; 
},{"../../common/Point.js":3,"../../libraries/Drawlib.js":10,"./ExtensionNode.js":14,"./LessonNode.js":15}],13:[function(require,module,exports){
"use strict";
var Board = require('./Board.js');
var Point = require('../../common/Point.js');
var DrawLib = require('../../libraries/DrawLib.js');
var LessonNode = require('./LessonNode.js');
var Parser = require('./Parser.js');
var Utilities = require('../../libraries/Utilities.js');

var utility;
var painter;
var parser;

var activeBoard;
var boardLoaded;

var mouseTarget;

var nodeArray;


function BoardPhase(pTargetURL){
    //
    boardLoaded = false;
    mouseTarget = 0;
    
    //instantiate libraries
    painter = new DrawLib();
    utility = new Utilities();
    
    //reads data from target URL and connects callback
    parser = new Parser(pTargetURL, boardLoadedCallback);
    
    
    //insert html
    populateDynamicContent();
}

//sets activeBoard and gives the go ahead for the loop to execute
function boardLoadedCallback(pJSONElements){
    activeBoard = new Board(new Point(0,0), pJSONElements);
    boardLoaded = true;
}

//populate the dynamic content div in index with this phase's specific html
function populateDynamicContent(){
    document.getElementById("dynamicContent").innerHTML = "<div id=\"detailLayer\" class=\"hiddenLayer\"><div id=\"detailBlinder\"></div><div id=\"detailWindow\" class=\"hiddenWindow\"><div id=\"dwBanner\"><img id=\"dwBannerImage\" src=\"\"><div id=\"dwBannerDarker\"></div><p id=\"dwBannerTitle\">Test</p></div><div id=\"dwTags\"></div><div id=\"dwDescription\"><p id=\"dwDescriptionText\">Test</p></div><div id=\"dwResources\"></div><div id=\"dwLauncher\"></div><p id=\"detailX\">x</p></div><div id=\"lockWindow\" class=\"hiddenWindow\"><div id=\"lockDivTop\"><h2 id=\"lockTitle\"></h2><p id=\"lockX\">x</p></div><div id=\"lockDivBottom\"><p id=\"lockList\"></p></div></div></div>";
    
    //assign a click event to the detail blinder element that is used to darken the screen when information is being displayed
    document.getElementById("detailBlinder").onmousedown = function() { document.getElementById("detailLayer").className = "hiddenLayer"; }
}

//passing context, canvas, delta time, center point, usable height, mouse state
BoardPhase.prototype.update = function(mouseState, canvasState){
    if(boardLoaded){
        this.act(mouseState);
        //context, center point, usable height
        this.draw(canvasState);
    }
    else{
        canvasState.ctx.save();
        canvasState.ctx.font = "40px Arial";
        canvasState.ctx.textBaseline = "middle";
        canvasState.ctx.textAlign = "center";
        canvasState.ctx.fillText("Loading...", canvasState.center.x, canvasState.center.y);
        canvasState.ctx.restore();
    }
}

BoardPhase.prototype.act = function(mouseState){
    var broken = false;
    //mouse handling for target calculation
    for(var i = 0; i < activeBoard.nodeArray.length; i++){
        
        if(broken){
            broken = false;
            break;
        }
        var subArray = activeBoard.nodeArray[i];
        for(var j = 0; j < subArray.length; j++){
            var targetLessonNode = activeBoard.nodeArray[i][j];
            utility.mouseIntersect(mouseState, targetLessonNode, activeBoard.position, 0);
            if(targetLessonNode.mouseOver === true){
                mouseTarget = targetLessonNode;
                broken = true;
                break;
            }
            else{
                mouseTarget = 0;
            } 
        }
    }
    //mouse handling for board movement
    if(mouseState.mouseDown === true && mouseState.lastMouseDown === true){
        activeBoard.move(mouseState.lastPosition.x - mouseState.position.x, mouseState.lastPosition.y - mouseState.position.y);
    }
    //mouse handling for clicking
    if(mouseState.mouseDown === true && mouseState.lastMouseDown === false){
        if(mouseTarget != 0){
            mouseTarget.click();
        }
    }
    
    document.querySelector('#debugLine').innerHTML = "mousePosition: x = " + mouseState.relativePosition.x + ", y = " + mouseState.relativePosition.y + 
    "<br>Current Clicked = " + mouseState.mouseDown + 
    "   Last Clicked = " + mouseState.lastMouseDown + 
    "<br>MouseTarget = " + mouseTarget;
}

BoardPhase.prototype.draw = function(canvasState){
    //draw nodes
    activeBoard.draw(canvasState);
}

module.exports = BoardPhase;
},{"../../common/Point.js":3,"../../libraries/DrawLib.js":9,"../../libraries/Utilities.js":11,"./Board.js":12,"./LessonNode.js":15,"./Parser.js":16}],14:[function(require,module,exports){
"use strict";
var DrawLib = require('../../libraries/Drawlib.js');

var painter;
var sourceNode;

//parameter is a point that denotes starting position
function ExtensionNode(pName, pConnectionForward, pSource){
    painter = new DrawLib();
    sourceNode = pSource;
    
    this.data = {};
    //this.data._id = pSource.data._id;
    this.highlighted = false;
    //this.data.name = pName;
    this.connectionForward = [];
    this.connectionForward.push(pConnectionForward);
    this.connectionBackward = [];
    this.connectionBackward.push(pSource);
    this.type = "extension";
}

ExtensionNode.prototype.setStatus = function(pStatus){
    this.status = this.connectionBackward[0].status;
    this.connectionForward[0].setStatus(pStatus)
}

ExtensionNode.prototype.draw = function(pCanvasState){
    pCanvasState.ctx.save();
        if(this.highlighted){
            pCanvasState.ctx.shadowColor = '#0066ff';
            pCanvasState.ctx.shadowBlur = 7;
            if(this.connectionForward[0].type === "extension"){
                this.connectionForward[0].highlighted = true;
            }
        }
    else{
        if(this.connectionForward[0].type === "extension"){
            this.connectionForward[0].highlighted = false;
        }
    }
    
    if(this.connectionBackward[0].status === "2" || this.connectionBackward[0].status === "4"){
        painter.line(pCanvasState.ctx, this.position.x, this.position.y, this.connectionForward[0].position.x, this.connectionForward[0].position.y, 2, "black");
    }
    
    pCanvasState.ctx.restore();
}

module.exports = ExtensionNode;
},{"../../libraries/Drawlib.js":10}],15:[function(require,module,exports){
"use strict";
var DrawLib = require('../../libraries/Drawlib.js');
var Utilities = require('../../libraries/Utilities.js');

var painter;
var utility;

//parameter is a point that denotes starting position
function LessonNode(startPosition, JSONChunk){    
    this.imageLoaded = false;
    painter = new DrawLib();
    utility = new Utilities();
    
    this.position = startPosition;
    this.mouseOver = false;
    this.highlighted = false;
    this.scaleFactor = 1;
    this.type = "LessonNode";
    this.data = JSONChunk;
    
    this.placement = 1;
    
    //parse JSONChunk for completeness
    
    
    //image loading and resizing
    var tempImage = new Image();
    
    tempImage.addEventListener('load', _loadAction.bind(this), false);
    tempImage.addEventListener('error', _errorAction.bind(this), false);
    
    tempImage.src = JSONChunk.image.icon;
}


var _loadAction = function (e) {
    this.image = e.target;
    this.width = e.target.naturalWidth;
    this.height = e.target.naturalHeight;
    
    var maxDimension = 100;
    
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
    
    this.imageLoaded = true;
};
var _errorAction = function(e){
    //alert("There was an error loading an image.");
    this.image = new Image();
    this.image.src = "../content/ui/missingThumbnail.gif";
    this.width = 100;
    this.height = 100;
    this.imageLoaded = true;
};



var _handleStatus = function (e) {
    //filter through localStorage
    var progressString = localStorage.progress;
    
    
    console.log("This is the status before change: " + this.status);
    //Each status means something different
    //0:not start node
    //1:start node
    //2:
    //3:
    //4:
    
    
    
    //will never occur when 0
    if(this.status === "1"){
        //change to solved status
        this.status = "2";
        
        //iterate through each forward connection and handle accordingly
        for(var i = 0; i < this.connectionForward.length; i++){
            var confirmedClear = true;
            //iterate through that forward connection's backwards connections and make sure that all are in a cleared state
            for(var j = 0; j < this.connectionForward[i].connectionBackward.length; j++){
                var targetStatus = this.connectionForward[i].connectionBackward[j].status;
                //if even a single backwards connection is hidden, unsolved, or locked, it's not ready to be revealed
                if(targetStatus === "0" || targetStatus === "1" || targetStatus === "3"){
                    confirmedClear = false;
                    break;
                }
            }
            //apply the status
            if(confirmedClear){
                this.connectionForward[i].setStatus("1");
            }
            else{
                this.connectionForward[i].setStatus("3");
            }
            //apply connectionForward data to localStorage
            utility.setProgress(this.connectionForward[i]);
        }
        
        //change button appearance
        var toggleButton = document.querySelector("#completionButton");
        toggleButton.innerHTML = "<div id=\"dwLauncherToggle\"><p>Mark Incomplete</p></div>";
        toggleButton.className = "selected";
    }
    else if(this.status === "2"){
        //change to withdrawn completion status
        this.status = "4";
        
        //change button appearance
        var toggleButton = document.querySelector("#completionButton");
        toggleButton.innerHTML = "<div id=\"dwLauncherToggle\"><p>Mark as Complete</p></div>";
        toggleButton.className = "unselected";
    }
    else if(this.status === "3"){
        
    }
    else if(this.status === "4"){
        //change to solved status
        this.status = "2";
        
        //need to check completion here, loops through forward connections
        for(var i = 0; i < this.connectionForward.length; i++){
            var next = this.connectionForward[i];
            
            //if status is either hidden or locked, check to change status
            if(next.status === 0 || next.status === 3){
                var confirmedClear = true;
                //if any backward connections are incomplete, set the confirmedClear flag to show that
                for(var j = 0; j < this.connectionForward[i].connectionBackward.length; j++){
                    var targetStatus = this.connectionForward[i].connectionBackward[j].status;
                    if(targetStatus === "0" || targetStatus === "1" || targetStatus === "3"){
                        confirmedClear = false;
                        break;
                    }
                }
                //apply the status
                if(confirmedClear){
                    this.connectionForward[i].setStatus("1");
                }
                else{
                    this.connectionForward[i].setStatus("3");
                }
                //apply connectionForward data to localStorage
                utility.setProgress(this.connectionForward[i]);
            }
        }
        
        //change button appearance
        var toggleButton = document.querySelector("#completionButton");
        toggleButton.innerHTML = "<div id=\"dwLauncherToggle\"><p>Mark Incomplete</p></div>";
        toggleButton.className = "selected";
    }
    
    utility.setProgress(this);
    
    console.log(localStorage.progress + "\n");
    console.log("This is the status after change: " + this.status);
}

var flagLoaded = false;
var flagImage;
var _drawFlag = function (positionX, positionY, width, height, pCanvasState) {
    if(flagLoaded){
        //draw flag in the upper right
        pCanvasState.ctx.drawImage(flagImage, positionX + width/2 - 1*flagImage.naturalWidth/4, positionY - height/2 - flagImage.naturalHeight/6, 30, 30)
    }
    else{
        //loadImage
        flagImage = new Image();
        flagImage.src = "../../content/ui/iconCheck.png";
        flagLoaded = true;
    }
}

LessonNode.prototype.setStatus = function(pStatus){
    //ensure that a lock is being instead of normal unveil if that's what is supposed to be there
    if(pStatus === "1" && this.status === "0"){
        var confirmedClear = true;
        //check backwards connections completion
        for(var i = 0; i < this.connectionBackward.length; i++){
            var targetStatus = this.connectionBackward[i].status;
            if(targetStatus === "0" || targetStatus === "1" || targetStatus === "3"){
                confirmedClear = false;
                break;
            }
        }
        if(confirmedClear){
            this.status = "1";
        }
        else{
            this.status = "3";
        }
    }
    else{
       this.status = pStatus; 
    }
    
}

LessonNode.prototype.draw = function(pCanvasState){
    if(this.imageLoaded){
        
        
        if(this.status !== "0"){
            pCanvasState.ctx.save();
            if(this.highlighted){
                pCanvasState.ctx.shadowColor = '#0066ff';
                pCanvasState.ctx.shadowBlur = 7;
            }

            //the node is completely solved, draw connection lines
            if(this.status === "2" || this.status === "4"){
                //draw lines as part of the lessonNode
                for(var i = 0; i < this.connectionForward.length; i++){
                    this.connectionForward[i].highlight = true;
                    painter.line(pCanvasState.ctx, this.position.x, this.position.y, this.connectionForward[i].position.x, this.connectionForward[i].position.y, 2, "black");
                }
            }
            
            //is this node's image drawn normally?
            if(this.status === "1" || this.status === "2" || this.status === "4"){
                pCanvasState.ctx.drawImage(this.image, this.position.x - (this.width*this.scaleFactor)/2, this.position.y - (this.height*this.scaleFactor)/2, this.width * this.scaleFactor, this.height * this.scaleFactor);
            }
            //draw locked image
            else if(this.status === "3"){
                //!!!!!use painter to draw lock stuff, below is placeholder
                pCanvasState.ctx.save();
                pCanvasState.ctx.fillStyle = "gray";
                pCanvasState.ctx.strokeStyle = "gray";
                pCanvasState.ctx.lineWidth = 10;
                pCanvasState.ctx.beginPath();
                pCanvasState.ctx.arc(this.position.x,this.position.y - 10,20,Math.PI,0);
                pCanvasState.ctx.stroke();
                pCanvasState.ctx.fillRect(this.position.x - 30, this.position.y - 10, 60*this.scaleFactor, 40 * this.scaleFactor);
                pCanvasState.ctx.restore();
                
            }
            
            pCanvasState.ctx.font = "20px Arial";
            pCanvasState.ctx.textBaseline = "hanging";
            pCanvasState.ctx.textAlign = "center";
            pCanvasState.ctx.strokeText(this.data.title, this.position.x, this.position.y + 5 + this.height/2);
                
            //draw completion flag
            if(this.status === "2"){
                _drawFlag(this.position.x, this.position.y, this.height, this.width, pCanvasState);
            }
            
            pCanvasState.ctx.restore();


            //draw the image, shadow if hovered
            if(this.mouseOver){
                this.highlighted = true;
                if(this.connectionForward[0] !== undefined){
                    if(this.connectionForward[0].type === "extension"){
                        this.connectionForward[0].highlighted = true;
                    }
                }
            }
            else{
                this.highlighted = false;
                if(this.connectionForward[0] !== undefined){
                    if(this.connectionForward[0].type === "extension"){
                        this.connectionForward[0].highlighted = false;
                    }
                }
            }
        }
    }
    
};



//populates the detailWindow based on the sender
LessonNode.prototype.click = function(){
    
    if(this.status === "3"){
        document.getElementById("detailLayer").className = "visible";
        document.getElementById("detailWindow").className = "hiddenWindow";
        document.getElementById("lockWindow").className = "";
        
        document.getElementById("lockTitle").innerHTML = this.data.title + " will be unlocked when the following are completed: ";
        
        var combinedList = "";
        for(var i = 0; i < this.connectionBackward.length; i++){
            combinedList += "• " + this.connectionBackward[i].data.title  + "<br>";
        }
        document.getElementById("lockList").innerHTML = combinedList;
    }
    else{
        //set detailWindow values here
        document.getElementById("detailLayer").className = "visible";
        document.getElementById("detailWindow").className = "";
        document.getElementById("lockWindow").className = "hiddenWindow";
        
        document.getElementById("dwBannerTitle").innerHTML = this.data.title;
        document.getElementById("dwBannerImage").src = this.data.image.banner;

        var tagText = "";
        for(var i = 0; i < this.data.tags.length; i++){
            tagText += "<div class=\"dwTag\"><p>" + this.data.tags[i] + "</p></div>";
        }

        document.getElementById("dwTags").innerHTML = tagText;
        document.getElementById("dwDescriptionText").innerHTML = this.data.description;

        var conglomerate = "";
        if(this.data.extra_resources[0] !== null){
            for(var i = 0; i < this.data.extra_resources.length; i++){
                var snippet = this.data.extra_resources[i];
                var headerSnippet = "";
                var footerSnippet = "";
                //removes / from the end since it will be used as an marker for cutting
                if(snippet.substring(snippet.length - 1, snippet.length) === "/"){
                    snippet = snippet.substring(0, snippet.length - 1);
                }
                //remove the http:// or https:// header
                if(snippet.substring(0, 8) === "https://"){
                    snippet = snippet.substring(8, snippet.length);
                }
                if(snippet.substring(0, 7) === "http://"){
                    snippet = snippet.substring(7, snippet.length);
                }
                if(snippet.substring(0, 4) === "www."){
                    snippet = snippet.substring(4, snippet.length);
                }
                //if the snippet contains / parse based on it
                if(snippet.indexOf('/') !== "-1"){
                    var counter = 0;
                    for(var k = 0; k < snippet.length; k++){
                        if(snippet[k] !== "/"){
                            counter++;
                        }
                        else{
                            break;
                        }
                    }
                    headerSnippet += snippet.substring(0, counter);
                    headerSnippet += ":";

                    counter = snippet.length;
                    for(var k = snippet.length - 1; k > 0; k--){
                        if(snippet[k] !== "/"){
                            counter--;
                        }
                        else{
                            break;
                        }
                    }
                    footerSnippet += snippet.substring(counter, snippet.length);
                    var temporarySnippet = "";
                    for(var k = 0; k < footerSnippet.length; k++){
                        if(footerSnippet[k] === '-' || footerSnippet[k] === '_' || footerSnippet[k] === '~'){
                            temporarySnippet += ' ';
                        }
                        else{
                            temporarySnippet += footerSnippet[k];
                        }
                    }
                    footerSnippet = temporarySnippet;
                }

                conglomerate += "<a href=\"" + this.data.extra_resources[i] + "\" target=\"_blank\"><div class=\"dwResource\"><div class=\"dwResourceContent\"><p class=\"dwResourceP1\">";
                conglomerate += headerSnippet;
                conglomerate += "</p><p class=\"dwResourceP2\">" + footerSnippet +"</p></div></div></a>";
            }

        }
        document.getElementById("dwResources").innerHTML = conglomerate;


        var dwLauncherReference = document.getElementById("dwLauncher");
        dwLauncherReference.innerHTML = "<a href=\"" + this.data.link + "\" target=\"_blank\"><div id=\"dwLauncherLaunch\"><p>Open Lesson</p></div></a>";
        if(this.status === "1" || this.status === "4"){
            dwLauncherReference.innerHTML += "<button id=\"completionButton\" class=\"unselected\"><div id=\"dwLauncherToggle\"><p>Mark as Complete</p></div></button>";
        }
        else{
            dwLauncherReference.innerHTML += "<button id=\"completionButton\" class=\"selected\"><div id=\"dwLauncherToggle\"><p>Mark Incomplete</p></div></button>";
        }


        //set cookie data
        localStorage.activeNode = this.data._id;

        //attach click event to button
        var dwCompletionButton = document.querySelector("#completionButton");
        dwCompletionButton.addEventListener('click', _handleStatus.bind(this), false);
    }
};

module.exports = LessonNode;
},{"../../libraries/Drawlib.js":10,"../../libraries/Utilities.js":11}],16:[function(require,module,exports){
"use strict";

//parameter is a point that denotes starting position
function Parser(pTargetURL, callback){
    var JSONObject;
    var lessonArray = [];
    var xhr = new XMLHttpRequest();
    xhr.onload = function(){
        JSONObject = JSON.parse(xhr.responseText);

        //pass lesson data back
        callback(JSONObject);
    }

    xhr.open('GET', pTargetURL, true);
    xhr.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2010 00:00:00 GM0T");
    xhr.send();
}

module.exports = Parser;
},{}],17:[function(require,module,exports){
"use strict"


function DetailsPanel(graph) {
    this.graph = graph;
    this.node = null;
    this.data = null;
    this.transitionOn = false;
    this.transitionTime = 0;
    this.dataDiv = document.getElementById("rightBar");
};

DetailsPanel.prototype.enable = function(node) {
    this.node = node;
    this.data = node.data;
    this.transitionOn = true
};

DetailsPanel.prototype.disable = function() {
    this.dataDiv.innerHTML = "";
    this.transitionOn = false;
};

DetailsPanel.prototype.update = function(canvasState, time, node) {
    
    //update node if its not the same anymore
    if(this.node != node) {
        this.node = node;
        this.data = node.data;
        this.dataDiv.innerHTML = this.GenerateDOM();
    }
    
    
    //transition on
    if(this.transitionOn) {
        if(this.transitionTime < 1) {
            this.transitionTime += time.deltaTime * 3;
            if(this.transitionTime >= 1) {
                //done transitioning
                this.transitionTime = 1;
                this.dataDiv.innerHTML = this.GenerateDOM();
            }
        }
    }
    //transition off
    else {
        if(this.transitionTime > 0) {
            this.transitionTime -= time.deltaTime * 3;
            if(this.transitionTime <= 0) {
                //done transitioning
                this.transitionTime = 0;
                this.node = null;
                this.data = null; 
            }
        }
    }
};

DetailsPanel.prototype.GenerateDOM = function() {
    var html = "<h1>"+this.data.series+":</h1><h1><a href=" + this.data.link + ">"+this.data.title+"</a></h1>";
    html += "<a href=" + this.data.link + "><img src=https://raw.githubusercontent.com/IGME-RIT/" + this.data.name +
        "/master/igme_thumbnail.png alt=" + this.data.link + "></a>";
    html += "<p>" + this.data.description + "</p>";
    //console.log(this.data);
    if(this.data.extra_resources.length != 0) {
        html += "<h2>Additional Resources:</h2>";
        html += "<ul>";
        for(var i = 0; i < this.data.extra_resources.length; i++) {
            html += "<li><a href=" + this.data.extra_resources[i].link + ">" + this.data.extra_resources[i].title + "</a></li>";
        }
        html += "</ul>";
    }
    
    return html;
};

module.exports = DetailsPanel;
},{}],18:[function(require,module,exports){
"use strict";
var DrawLib = require('../../libraries/Drawlib.js');
var SearchPanel = require('./SearchPanel.js');
var DetailsPanel = require('./DetailsPanel.js');
var TutorialNode = require('./TutorialNode.js');
var Point = require('../../common/Point.js');


var painter;
var expand = 3;
var debugMode = false;

function Graph(pJSONData) {
        
    this.searchPanel = new SearchPanel(this);
    this.detailsPanel = new DetailsPanel(this);
    this.searchPanelButton = document.getElementById("OptionsButton");
    this.searchDiv = document.getElementById("leftBar");
    this.dataDiv = document.getElementById("rightBar");
    this.canvasDiv = document.getElementById("middleBar");
    painter = new DrawLib();
    
    this.nodes = [];
    this.activeNodes = [];
    
    //populate the array
    for(var i = 0; i < pJSONData.length; i++) {
        var data = pJSONData[i];
        //ensures that the chunk contains a link
        if(data.tags.length === 0) {
            if(debugMode) console.log("Repo not tagged: " + data.name);
        }
        else if(data.image !== undefined) {
            if(debugMode) console.log("Repo yaml out of date: " + data.name);
        }
        else {
            var node = new TutorialNode(data);
            this.nodes.push(node);
        }
    }
    
    //set direct object connections to related nodes for referencing
    //parse entire list
    for(var i = 0; i < this.nodes.length; i++) {
        //loop over listed connections
        for(var k = 0; k < this.nodes[i].data.connections.length; k++) {
            //search for similar nodes
            for(var j = 0; j < this.nodes.length; j++) {
                if(this.nodes[j].data.series === this.nodes[i].data.connections[k].series &&
                    this.nodes[j].data.title === this.nodes[i].data.connections[k].title) {
                    this.nodes[i].previousNodes.push(this.nodes[j]);
                    this.nodes[j].nextNodes.push(this.nodes[i]);
                }
            }
        }
    }
    
    this.transitionTime = 0;
    this.FocusNode(this.nodes[0]);
    
    
    function x (search) {
        if(search.open == true) {
            search.transitionOn = false;
        }
        else {
            search.transitionOn = true;
            search.open = true;
        }
    }
    
    this.searchPanelButton.addEventListener("click", x.bind(this.searchPanelButton, this.searchPanel));
};




Graph.prototype.FocusNode = function(centerNode) {
    this.focusedNode = centerNode;
    
    var newNodes = [];
    
    //get nodes to depth
    
    var previousNodes = this.focusedNode.getPrevious(expand);
    for(var i = 0; i < previousNodes.length; i++) {
        newNodes.push(previousNodes[i]);
    }
    
    var nextNodes = this.focusedNode.getNext(expand);
    for(var i = 0; i < nextNodes.length; i++) {
        newNodes.push(nextNodes[i]);
    }
    
    var temp = [];
    
    //remove redundancies
    for(var i = 0; i < newNodes.length; i++) {
        var alreadyExists = false;
        for(var j = 0; j < temp.length; j++) {
            if(newNodes[i] == temp[j]) {
                alreadyExists = true;
            }
        }
        if(!alreadyExists) {
            temp.push(newNodes[i]);
        }
    }
    
    newNodes = temp;
    
    //check if any of the nodes were previously on screen
    for(var i = 0; i < this.activeNodes.length; i++) {
        this.activeNodes[i].wasPreviouslyOnScreen = false;
        for(var j = 0; j < newNodes.length; j++) {
            if(this.activeNodes[i] == newNodes[j]) {
                this.activeNodes[i].wasPreviouslyOnScreen = true;
            }
        }
    }
    
    this.activeNodes = newNodes;
    
    //clear their parent data for new node
    for(var i = 0; i < this.activeNodes.length; i++) {
        this.activeNodes[i].usedInGraph = false;
        this.activeNodes[i].parent = null;
    }
    
    
    this.transitionTime = 1;
    
    this.focusedNode.setTransition(expand, null, 0, new Point(0, 0));
};

Graph.prototype.update = function(mouseState, canvasState, time) {
    
    if(this.transitionTime > 0) {
        this.transitionTime -= time.deltaTime;
    }
    else {
        this.transitionTime = 0;
    }
    
    var mouseOverNode = null;
    
    for(var i = 0; i < this.activeNodes.length; i++) {
        var isMain = (this.activeNodes[i] == this.focusedNode);
        this.activeNodes[i].update(mouseState, time, this.transitionTime, isMain);
        if(this.activeNodes[i].mouseOver) {
            mouseOverNode = this.activeNodes[i];
        }
    }
    
    //if cuser clicks
    if(mouseState.mouseDown && !mouseState.lastMouseDown) {
        //focus node if clicked
        if(mouseOverNode) {
            this.FocusNode(mouseOverNode);
        }
        //show details for node if button clicked
        if(this.focusedNode.detailsButton.mouseOver) {
            if(this.detailsPanel.node == null)  {
                this.detailsPanel.enable(this.focusedNode);
            }
            else {
                this.detailsPanel.disable();
            }
        }
    }
    
    if(this.searchPanel.open == true) {
        this.searchPanel.update(canvasState, time);
    }
    
    
    if(this.detailsPanel.node != null) {
        this.detailsPanel.update(canvasState, time, this.focusedNode);
        this.focusedNode.detailsButton.text = "Less";
    }
    else {
        this.focusedNode.detailsButton.text = "More";
    }
    
    
    var t1 = (1 - Math.cos(this.searchPanel.transitionTime * Math.PI))/2;
    var t2 = (1 - Math.cos(this.detailsPanel.transitionTime * Math.PI))/2;
    
    this.searchDiv.style.width = 30 * t1 + "vw";
    this.dataDiv.style.width = 30 * t2 + "vw";
    this.canvasDiv.style.width = 100 - 30 * (t1 + t2) + "vw";    
    
    this.searchPanelButton.style.left = "calc(" + 30 * t1 + "vw + 12px)";
    
    canvasState.update();
};







Graph.prototype.draw = function(canvasState) {
    canvasState.ctx.save();
    
    //translate to the center of the screen
    canvasState.ctx.translate(canvasState.center.x, canvasState.center.y);
    //console.log(canvasState.center);
    //console.log(canvasState);
    //draw nodes
    this.focusedNode.draw(canvasState, painter, null, 0, expand);
    
    canvasState.ctx.restore();
};

module.exports = Graph;
},{"../../common/Point.js":3,"../../libraries/Drawlib.js":10,"./DetailsPanel.js":17,"./SearchPanel.js":21,"./TutorialNode.js":22}],19:[function(require,module,exports){
"use strict";
var Parser = require('../boardPhase/Parser.js');
var Graph = require('./Graph.js');

var graphLoaded;

var mouseTarget;
var graph;

function GraphPhase(pTargetURL){
    //initialize base values
    graphLoaded = false;
    mouseTarget = 0;
    
    
    //request graph data and wait to begin parsing
    Parser(pTargetURL, function(pJSONElements){
        graph = new Graph(pJSONElements);
        graphLoaded = true;
    });
}

GraphPhase.prototype.update = function(mouseState, canvasState, time) {
    if(graphLoaded) {
        graph.update(mouseState, canvasState, time);
    }
}

GraphPhase.prototype.draw = function(canvasState) {
    if(graphLoaded) {
        graph.draw(canvasState);
    }
    else {
        //if we havent loaded the data, display loading, and wait
        canvasState.ctx.save();
        canvasState.ctx.font = "40px Arial";
        canvasState.ctx.fillStyle = "#fff";
        canvasState.ctx.textBaseline = "middle";
        canvasState.ctx.textAlign = "center";
        canvasState.ctx.fillText("Loading...", canvasState.center.x, canvasState.center.y);
        canvasState.ctx.restore();
    }
};

module.exports = GraphPhase;
},{"../boardPhase/Parser.js":16,"./Graph.js":18}],20:[function(require,module,exports){
"use strict";

var Point = require('../../common/Point.js');
var Button = require("../../containers/Button.js");
var TutorialNode = require('./TutorialNode.js');

var labelCornerSize = 6;

var titleFontSize = 12;
var titleFont = titleFontSize+"px Arial";

var descriptorFontSize = 12;
var descriptorFont = descriptorFontSize+"px Arial";

var lineBreak = 6;

//create a label to pair with a node
function NodeLabel(pTutorialNode) {
    this.node = pTutorialNode;
    
    this.series = this.node.data.series;
    this.title = this.node.data.title;
    this.description = this.node.data.description;
    this.descriptionLines = null;
    
    this.position = new Point(
        this.node.position.x,
        this.node.position.y - this.node.size - 10);
    
    this.displayFullData = false;
};

NodeLabel.prototype.calculateTextFit = function(ctx, pPainter) {
    ctx.save();
    ctx.font = titleFont;
    var seriesSize = ctx.measureText(this.series);
    var titleSize = ctx.measureText(this.title);
    ctx.restore();

    this.size = new Point(Math.max(seriesSize.width, titleSize.width), titleFontSize * 2);
    
    

    if(this.displayFullData) {
        this.size.x = Math.max(240, Math.max(seriesSize.width, titleSize.width));
        this.descriptionLines = pPainter.textToLines(ctx, this.description, descriptorFont, this.size.x);
        this.size.y += lineBreak + this.descriptionLines.length * descriptorFontSize;
    }
};



NodeLabel.prototype.update = function (pMouseState, time, displayBrief) {
    
    
    //directly above node
    this.desiredPosition = new Point(
        this.node.position.x,
        this.node.position.y - this.node.size - 12 - labelCornerSize);
    
    if(this.desiredPosition.x != this.position.x || this.desiredPosition.y != this.position.y) {
        //move towards desiredPosition
        var dif = new Point(
            this.desiredPosition.x - this.position.x,
            this.desiredPosition.y - this.position.y);
        
        var speedScalar = Math.sqrt(dif.x * dif.x + dif.y * dif.y) * time.deltaTime;

        var velocity = new Point(dif.x * speedScalar, dif.y * speedScalar);
        if(velocity.x * velocity.x < dif.x * dif.x) {
            this.position.x += velocity.x;
            this.position.y += velocity.y;
        }
        else {
            this.position.x = this.desiredPosition.x;
            this.position.y = this.desiredPosition.y;
        }
        
    }
    
    
    //if this is the primary node, display description
    if(displayBrief) {
        
        if(this.displayFullData == false) {
            this.size = false;
            this.displayFullData = true;
        }
    }
    else if (this.displayFullData == true) {
        this.buttonClicked = false;
        this.size = false;
        this.displayFullData = false;
    }
    
}

NodeLabel.prototype.draw = function(pCanvasState, pPainter) {
    
    if(!this.size) {
        this.calculateTextFit(pCanvasState.ctx, pPainter);
    }
    
    //draw line from node to label
    pCanvasState.ctx.save();
    pCanvasState.ctx.strokeStyle = "#fff";
    pCanvasState.ctx.lineWidth = 2;
    pCanvasState.ctx.beginPath();
    
    pCanvasState.ctx.moveTo(
        this.position.x,
        this.position.y);
    
    pCanvasState.ctx.lineTo(
        this.node.position.x,
        this.node.position.y - this.node.size);
    
    pCanvasState.ctx.closePath();
    pCanvasState.ctx.stroke();
    pCanvasState.ctx.restore();
    
    //draw label
    pPainter.roundedRect(
        pCanvasState.ctx,
        this.position.x - (this.size.x / 2),
        this.position.y - this.size.y,
        this.size.x,
        this.size.y,
        labelCornerSize,
        true, this.node.color,
        true, "#fff", 2);
    
    
    pCanvasState.ctx.save();
    pCanvasState.ctx.fillStyle = "#fff";
    pCanvasState.ctx.font = titleFont;
    pCanvasState.ctx.textBaseline = "top";
    pCanvasState.ctx.textAlign = "center";
    pCanvasState.ctx.fillText(
        this.series,
        this.position.x,
        this.position.y - this.size.y);
    pCanvasState.ctx.fillText(
        this.title,
        this.position.x,
        this.position.y - this.size.y + titleFontSize);
    pCanvasState.ctx.restore();
    
    
    if(this.displayFullData) {
        
        pCanvasState.ctx.save();
        pCanvasState.ctx.fillStyle = "#fff";
        pCanvasState.ctx.font = descriptorFont;
        pCanvasState.ctx.textBaseline = "top";
        pCanvasState.ctx.textAlign = "left";
        
        for(var i = 0; i < this.descriptionLines.length; i++) {
            pCanvasState.ctx.fillText(
                this.descriptionLines[i],
                this.position.x - this.size.x / 2,
                this.position.y - this.size.y + titleFontSize * 2 + lineBreak + i * descriptorFontSize);
        }
        pCanvasState.ctx.restore();
    }
};



module.exports  = NodeLabel;
},{"../../common/Point.js":3,"../../containers/Button.js":4,"./TutorialNode.js":22}],21:[function(require,module,exports){
"use strict"

var queryData = [];

function updateQueryData() {
    var list = document.getElementById("QueryListData");
    list.innerHTML = "";
    if(queryData.length > 0) {
        for(var i = 0; i < queryData.length; i++) {
            list.innerHTML += "<li>" + queryData[i].type + ": " + queryData[i].value + "</li>";
        }
        document.getElementById("clearquerybutton").style.display = "inline";
    }
    else {
        document.getElementById("clearquerybutton").style.display = "none";
    }
};

document.getElementById("searchtextbutton").onclick = function() {
    var query = {
        type: "Text",
        value: document.getElementById("searchtextfield").value
    };
    if(query.value == "")
        return;
    queryData.push(query);
    updateQueryData();
};


document.getElementById("searchlanguagebutton").onclick = function() {
    var query = {
        type: "Language",
        value: document.getElementById("searchlanguagefield").value
    };
    if(query.value == "Any")
        return;
    queryData.push(query);
    updateQueryData();
};

document.getElementById("searchtagbutton").onclick = function() {
    var query = {
        type: "Tag",
        value: document.getElementById("searchtagfield").value
    };
    if(query.value == "Any")
        return;
    queryData.push(query);
    updateQueryData();
};

document.getElementById("clearquerybutton").onclick = function() {
    queryData = [];
    updateQueryData();
};

document.getElementById("searchbutton").onclick = function() {
    
};


function SearchPanel(graph) {
    this.graph = graph;
    this.open = false;
    this.transitionOn = false;
    this.transitionTime = 0;
    this.optionsDiv = document.getElementById("leftBar");
    
    this.searchButton = document.getElementById("searchbutton");
    
    
    this.searchButton.addEventListener("click", function (that) {
        //parse data to find matching results
        var searchResults = that.search(queryData, that.graph.nodes);
        
        //display results
        var div = document.getElementById("searchresults");
        if(searchResults.length == 0) {
            div.innerHTML = "No Matching Results Found.";
            return;
        }
        
        div.innerHTML = "";
        
        
        for(var i = 0; i < searchResults.length; i++) {
            //create list tag
            var li = document.createElement("li");
            //set title as text
            li.innerHTML = searchResults[i].data.title;
            //add event to focus the node if its clicked
            li.addEventListener("click", function(that, node) {
                that.graph.FocusNode(node);
            }.bind(li, that, searchResults[i]));
            //add the tag to the page
            div.appendChild(li);
        }
    }.bind(this.searchButton, this));
};




SearchPanel.prototype.search = function(query, nodes) {
    var results = [];
    
    
    for(var i = 0; i < nodes.length; i++) {
        var node = nodes[i].data;
        var match = true;
        for(var j = 0; j < query.length; j++) {
            if(query[j].type === "Text") {
                if(node.title.toLowerCase().indexOf(query[j].value.toLowerCase()) === -1) {
                    if(node.series.toLowerCase().indexOf(query[j].value.toLowerCase()) === -1) {
                        if(node.description.toLowerCase().indexOf(query[j].value.toLowerCase()) === -1) {
                            match = false;
                            break;
                        }
                    }
                }
            }
            else if(query[j].type === "Language") {
                if(node.language !== query[j].value) {
                    match = false;
                    break;
                }
            }
            else {
                var tagMatch = false;
                for(var k = 0; k < node.tags.length; k++) {
                    if(node.tags[k] == query[j].value) {
                        tagMatch = true;
                    }
                }
                if(tagMatch == false) {
                    match = false;
                    break;
                }
            }
        }
        //if we passed all that crap, we have a match!
        if(match === true) { 
            results.push(nodes[i]);
        }
    }
    
    return results;
};


SearchPanel.prototype.update = function(canvasState, time) {
    
    //transition on
    if(this.transitionOn) {
        if(this.transitionTime < 1) {
            this.transitionTime += time.deltaTime * 3;
            if(this.transitionTime >= 1) {
                //done transitioning
                this.transitionTime = 1;
            }
        }
    }
    //transition off
    else {
        if(this.transitionTime > 0) {
            this.transitionTime -= time.deltaTime * 3;
            if(this.transitionTime <= 0) {
                //done transitioning
                this.transitionTime = 0;
                this.open = false;
            }
        }
    }
};



module.exports = SearchPanel;
},{}],22:[function(require,module,exports){
"use strict";

var Point = require('../../common/Point.js');
var NodeLabel = require('./NodeLabel.js');
var Button = require('../../containers/Button.js');

var horizontalSpacing = 180;

var TutorialState = {
    Locked: 0,
    Unlocked: 1,
    Completed: 2
};

var TutorialTags = {
    "AI": "#804",
    "Audio": "#048",
    "Computer Science": "#111",
    "Core": "#333",
    "Graphics": "#c0c",
    "Input": "#880",
    "Math": "#484",
    "Networking": "#c60",
    "Optimization": "#282",
    "Physics": "#048",
    "Scripting": "#088",
    "SoftwareEngineering": "#844"
};


//make a node with some data
function TutorialNode(JSONChunk) {
    this.data = JSONChunk;
    this.primaryTag = this.data.tags[0];
    this.color = TutorialTags[this.primaryTag];
    
    this.state = TutorialState.Locked;
    this.mouseOver = false;
    
    
    this.position = new Point(0, 0);
    this.previousPosition = new Point(0, 0);
    this.nextPosition = new Point(0, 0);
    
    this.size = 24;
    this.label = new NodeLabel(this);
        
    this.nextNodes = [];
    this.previousNodes = [];
    
    this.detailsButton = new Button(new Point(0, 0), new Point(72, 36), "More", this.color);
    
};

//recursive function to get previous nodes
TutorialNode.prototype.getPrevious = function(depth) {
    var result = [];
    result.push(this);
    if(depth > 0) {
        for(var i = 0; i < this.previousNodes.length; i++) {
            var previous = this.previousNodes[i].getPrevious(depth-1);
            for(var j = 0; j < previous.length; j++) {
                result.push(previous[j]);
            }
        }
    }
    return result;
};



//recursive function to get next nodes
TutorialNode.prototype.getNext = function(depth) {
    var result = [];
    result.push(this);
    if(depth > 0) {
        for(var i = 0; i < this.nextNodes.length; i++) {
            var previous = this.nextNodes[i].getNext(depth-1);
            for(var j = 0; j < previous.length; j++) {
                result.push(previous[j]);
            }
        }
    }
    return result;
};

//direction is the side of the parent this node exists on
//layer depth is how many layers to render out
TutorialNode.prototype.recursiveUpdate = function(direction, depth) {
    if(depth > 0) {
        if(direction < 1) {
            for(var i = 0; i < this.previousNodes.length; i++) {
                this.previousNodes[i].recursiveUpdate(-1, depth - 1);
            }
        }
        if(direction > -1) {
            for(var i = 0; i < this.nextNodes.length; i++) {
                this.nextNodes[i].recursiveUpdate(1, depth - 1);
            }
        }
    }
};

//updates a node
//transition time is 1-0, with 0 being the final location
TutorialNode.prototype.update = function(mouseState, time, transitionTime, isFocused) {
    
    //move the node
    if(this.position != this.nextPosition) {
        this.position.x = (this.previousPosition.x * transitionTime) + (this.nextPosition.x * (1 - transitionTime));
        this.position.y = (this.previousPosition.y * transitionTime) + (this.nextPosition.y * (1 - transitionTime));
    }
    
    if(isFocused) {
        this.size = 36;
    }
    else {
        //test if mouse is inside circle
        var dx = mouseState.relativePosition.x - this.position.x;
        var dy = mouseState.relativePosition.y - this.position.y;
        if((dx * dx) + (dy * dy) < this.size * this.size) {
            this.size = 30;
            this.mouseOver = true;
        }
        else {
            this.size = 24;
            this.mouseOver = false;
        }
    }
    
    
    
    this.label.update(mouseState, time, isFocused);
    
    if(isFocused) {
        this.detailsButton.position.x = this.position.x - this.detailsButton.size.x / 2 - 3;
        this.detailsButton.position.y = this.position.y + this.size + 12;
        this.detailsButton.update(mouseState);
    }
};


TutorialNode.prototype.setTransition = function(layerDepth, parent, direction, targetPosition) {
    
    //dont mess with node position if it already exists in the graph
    if(this.usedInGraph) {
        return;
    }
    
    this.usedInGraph = true;
    
    
    this.parent = parent;
    this.previousPosition = this.position;
    this.nextPosition = targetPosition;
    
    //figure out size of children to space them out appropriately
    if(layerDepth > 0) {
        var xPosition;
        var yPosition;
        
        //left or middle
        if(direction < 1) {
            var totalLeftHeight = this.getPreviousHeight(layerDepth);
            xPosition = targetPosition.x - horizontalSpacing;
            if(direction == 0) xPosition -= 60;
            yPosition = targetPosition.y - (totalLeftHeight / 2);
            
            for(var i = 0; i < this.previousNodes.length; i++) {
                var placement = new Point(xPosition, yPosition + this.previousNodes[i].currentHeight / 2);
                this.previousNodes[i].setTransition(layerDepth - 1, this, -1, placement);
                /*if(!this.wasPreviouslyOnScreen) {
                    this.previousNodes[i].position = new Point(-1000, placement.y);
                    this.previousNodes[i].previousPosition = new Point(-1000, placement.y);
                }*/
                yPosition += this.previousNodes[i].currentHeight;
            }
        }
        
        //right or middle
        if(direction > -1) {
            var totalRightHeight = this.getNextHeight(layerDepth);
            xPosition = targetPosition.x + horizontalSpacing;
            if(direction == 0) xPosition += 60;
            yPosition = targetPosition.y - (totalRightHeight / 2);

            for(var i = 0; i < this.nextNodes.length; i++) {
                var placement = new Point(xPosition, yPosition + this.nextNodes[i].currentHeight / 2);
                this.nextNodes[i].setTransition(layerDepth - 1, this, 1, placement);
                /*if(!this.wasPreviouslyOnScreen) {
                    this.nextNodes[i].position = new Point(1000, placement.y);
                    this.nextNodes[i].previousPosition = new Point(1000, placement.y);
                    console.log("throw the switch!");
                }*/
                yPosition += this.nextNodes[i].currentHeight;
            }
        }
    }
};

TutorialNode.prototype.getPreviousHeight = function(layerDepth) {
    this.currentHeight = 0;
    if(layerDepth > 0 && this.previousNodes.length > 0) {
        for(var i = 0; i < this.previousNodes.length; i++) {
            this.currentHeight += this.previousNodes[i].getPreviousHeight(layerDepth - 1);
        }
    }
    else {
        this.currentHeight = 24 * 5;
    }
    
    return this.currentHeight;
};

TutorialNode.prototype.getNextHeight = function(layerDepth) {
    this.currentHeight = 0;
    if(layerDepth > 0 && this.nextNodes.length > 0) {
        for(var i = 0; i < this.nextNodes.length; i++) {
            this.currentHeight += this.nextNodes[i].getNextHeight(layerDepth - 1);
        }
    }
    else {
        this.currentHeight = this.size * 5;
    }
    
    return this.currentHeight;
};


TutorialNode.prototype.draw = function(pCanvasState, pPainter, parentCaller, direction, layerDepth) {
    //draw line to parent if possible
    if(parentCaller && parentCaller == this.parent) {
        pCanvasState.ctx.save();
        pCanvasState.ctx.lineWidth = 2;
        pCanvasState.ctx.strokeStyle = "#fff";
        pCanvasState.ctx.beginPath();
        
        //var between = new Point(this.position.x, this.position.y);
        pCanvasState.ctx.moveTo(this.position.x, this.position.y);
        pCanvasState.ctx.lineTo(parentCaller.position.x, parentCaller.position.y);
        
        
        pCanvasState.ctx.closePath();
        pCanvasState.ctx.stroke();
        pCanvasState.ctx.restore();
    }
    
    //draw child nodes
    if(layerDepth > 0){
        if(direction < 1) {
            for(var i = 0; i < this.previousNodes.length; i++) {
                this.previousNodes[i].draw(pCanvasState, pPainter, this, -1, layerDepth - 1);
            }
        }
        if(direction > -1) {
            for(var i = 0; i < this.nextNodes.length; i++) {
                this.nextNodes[i].draw(pCanvasState, pPainter, this, 1, layerDepth - 1);
            }
        }
    }
    
    //draw circle
    pPainter.circle(pCanvasState.ctx, this.position.x, this.position.y, this.size, true, this.color, true, "#fff", 2);
    
    this.label.draw(pCanvasState, pPainter);
    if(direction == 0) {
        this.detailsButton.draw(pCanvasState, pPainter);
    }
};



module.exports = TutorialNode;
},{"../../common/Point.js":3,"../../containers/Button.js":4,"./NodeLabel.js":20}],23:[function(require,module,exports){
"use strict";

function SelectPhase(pTargetURL){
    //
    boardLoaded = false;
    mouseTarget = 0;
    
    //instantiate libraries
    painter = new DrawLib();
    utility = new Utilities();
    
    //reads data from target URL and connects callback
    parser = new Parser(pTargetURL, boardLoadedCallback);
    
    
    //insert html
    populateDynamicContent();
}

SelectPhase.prototype.act = function(){
    
}

SelectPhase.prototype.draw = function(){
    
}

module.exports = SelectPhase;
},{}]},{},[1,3,4,5,6,7,8,10,11,12,13,14,15,16,17,18,19,20,21,22,23])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9tYWluLmpzIiwianMvbW9kdWxlcy9HYW1lLmpzIiwianMvbW9kdWxlcy9jb21tb24vUG9pbnQuanMiLCJqcy9tb2R1bGVzL2NvbnRhaW5lcnMvQnV0dG9uLmpzIiwianMvbW9kdWxlcy9jb250YWluZXJzL0NhbnZhc1N0YXRlLmpzIiwianMvbW9kdWxlcy9jb250YWluZXJzL01vdXNlU3RhdGUuanMiLCJqcy9tb2R1bGVzL2NvbnRhaW5lcnMvVGltZS5qcyIsImpzL21vZHVsZXMvbGlicmFyaWVzL0RyYXdMaWIuanMiLCJqcy9tb2R1bGVzL2xpYnJhcmllcy9VdGlsaXRpZXMuanMiLCJqcy9tb2R1bGVzL3BoYXNlcy9ib2FyZFBoYXNlL0JvYXJkLmpzIiwianMvbW9kdWxlcy9waGFzZXMvYm9hcmRQaGFzZS9Cb2FyZFBoYXNlLmpzIiwianMvbW9kdWxlcy9waGFzZXMvYm9hcmRQaGFzZS9FeHRlbnNpb25Ob2RlLmpzIiwianMvbW9kdWxlcy9waGFzZXMvYm9hcmRQaGFzZS9MZXNzb25Ob2RlLmpzIiwianMvbW9kdWxlcy9waGFzZXMvYm9hcmRQaGFzZS9QYXJzZXIuanMiLCJqcy9tb2R1bGVzL3BoYXNlcy9ncmFwaFBoYXNlL0RldGFpbHNQYW5lbC5qcyIsImpzL21vZHVsZXMvcGhhc2VzL2dyYXBoUGhhc2UvR3JhcGguanMiLCJqcy9tb2R1bGVzL3BoYXNlcy9ncmFwaFBoYXNlL0dyYXBoUGhhc2UuanMiLCJqcy9tb2R1bGVzL3BoYXNlcy9ncmFwaFBoYXNlL05vZGVMYWJlbC5qcyIsImpzL21vZHVsZXMvcGhhc2VzL2dyYXBoUGhhc2UvU2VhcmNoUGFuZWwuanMiLCJqcy9tb2R1bGVzL3BoYXNlcy9ncmFwaFBoYXNlL1R1dG9yaWFsTm9kZS5qcyIsImpzL21vZHVsZXMvcGhhc2VzL3NlbGVjdFBoYXNlL1NlbGVjdFBoYXNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xyXG4vL2ltcG9ydHNcclxudmFyIEdhbWUgPSByZXF1aXJlKCcuL21vZHVsZXMvR2FtZS5qcycpO1xyXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuL21vZHVsZXMvY29tbW9uL1BvaW50LmpzJyk7XHJcbnZhciBUaW1lID0gcmVxdWlyZSgnLi9tb2R1bGVzL2NvbnRhaW5lcnMvVGltZS5qcycpO1xyXG52YXIgTW91c2VTdGF0ZSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9jb250YWluZXJzL01vdXNlU3RhdGUuanMnKTtcclxudmFyIENhbnZhc1N0YXRlID0gcmVxdWlyZSgnLi9tb2R1bGVzL2NvbnRhaW5lcnMvQ2FudmFzU3RhdGUuanMnKTtcclxuXHJcbi8vZ2FtZSBvYmplY3RzXHJcbnZhciBnYW1lO1xyXG52YXIgY2FudmFzO1xyXG52YXIgY3R4O1xyXG52YXIgdGltZTtcclxuXHJcbi8vcmVzcG9uc2l2ZW5lc3NcclxudmFyIGhlYWRlcjtcclxudmFyIGNlbnRlcjtcclxudmFyIHNjYWxlO1xyXG5cclxuLy9tb3VzZSBoYW5kbGluZ1xyXG52YXIgbW91c2VQb3NpdGlvbjtcclxudmFyIHJlbGF0aXZlTW91c2VQb3NpdGlvbjtcclxudmFyIG1vdXNlRG93bjtcclxudmFyIG1vdXNlSW47XHJcbnZhciB3aGVlbERlbHRhO1xyXG5cclxuLy9wYXNzYWJsZSBzdGF0ZXNcclxudmFyIG1vdXNlU3RhdGU7XHJcbnZhciBjYW52YXNTdGF0ZTtcclxuXHJcbi8vZmlyZXMgd2hlbiB0aGUgd2luZG93IGxvYWRzXHJcbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbihlKXtcclxuICAgIC8vZGVidWcgYnV0dG9uIGRlc2lnbmVkIHRvIGNsZWFyIHByb2dyZXNzIGRhdGFcclxuICAgIC8qXHJcbiAgICB2YXIgcmVzZXRCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Jlc2V0QnV0dG9uXCIpO1xyXG4gICAgcmVzZXRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIGxvY2FsU3RvcmFnZS5wcm9ncmVzcyA9IFwiXCI7XHJcbiAgICB9KTsqL1xyXG4gICAgXHJcbiAgICAvL3ZhcmlhYmxlIGFuZCBsb29wIGluaXRpYWxpemF0aW9uXHJcbiAgICBpbml0aWFsaXplVmFyaWFibGVzKCk7XHJcbiAgICBsb29wKCk7XHJcbn1cclxuXHJcbi8vaW5pdGlhbGl6YXRpb24gZm9yIHZhcmlhYmxlcywgbW91c2UgZXZlbnRzLCBhbmQgZ2FtZSBcImNsYXNzXCJcclxuZnVuY3Rpb24gaW5pdGlhbGl6ZVZhcmlhYmxlcygpe1xyXG4gICAgLy9jYW12YXMgaW5pdGlhbGl6YXRpb25cclxuICAgIGNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2NhbnZhcycpO1xyXG4gICAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICAvL2NvbnNvbGUubG9nKFwiQ2FudmFzIERpbWVuc2lvbnM6IFwiICsgY2FudmFzLm9mZnNldFdpZHRoICsgXCIsIFwiICsgY2FudmFzLm9mZnNldEhlaWdodCk7XHJcbiAgICBcclxuICAgIHRpbWUgPSBuZXcgVGltZSgpO1xyXG4gICAgXHJcbiAgICBcclxuICAgIC8vbW91c2UgdmFyaWFibGUgaW5pdGlhbGl6YXRpb25cclxuICAgIG1vdXNlUG9zaXRpb24gPSBuZXcgUG9pbnQoMCwwKTtcclxuICAgIHJlbGF0aXZlTW91c2VQb3NpdGlvbiA9IG5ldyBQb2ludCgwLDApO1xyXG4gICAgXHJcbiAgICBcclxuICAgIFxyXG4gICAgXHJcbiAgICBcclxuICAgIC8vZXZlbnQgbGlzdGVuZXJzIGZvciBtb3VzZSBpbnRlcmFjdGlvbnMgd2l0aCB0aGUgY2FudmFzXHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgdmFyIGJvdW5kUmVjdCA9IGNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICBtb3VzZVBvc2l0aW9uID0gbmV3IFBvaW50KGUuY2xpZW50WCAtIGJvdW5kUmVjdC5sZWZ0LCBlLmNsaWVudFkgLSBib3VuZFJlY3QudG9wKTtcclxuICAgICAgICByZWxhdGl2ZU1vdXNlUG9zaXRpb24gPSBuZXcgUG9pbnQobW91c2VQb3NpdGlvbi54IC0gY2FudmFzLm9mZnNldFdpZHRoIC8gMiwgbW91c2VQb3NpdGlvbi55IC0gY2FudmFzLm9mZnNldEhlaWdodCAvIDIpO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIG1vdXNlRG93biA9IGZhbHNlO1xyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgbW91c2VEb3duID0gdHJ1ZTtcclxuICAgIH0pO1xyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIG1vdXNlRG93biA9IGZhbHNlO1xyXG4gICAgfSk7XHJcbiAgICBtb3VzZUluID0gZmFsc2U7XHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3ZlclwiLCBmdW5jdGlvbihlKXtcclxuICAgICAgICBtb3VzZUluID0gdHJ1ZTtcclxuICAgIH0pO1xyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW91dFwiLCBmdW5jdGlvbihlKXtcclxuICAgICAgICBtb3VzZUluID0gZmFsc2U7XHJcbiAgICAgICAgbW91c2VEb3duID0gZmFsc2U7XHJcbiAgICB9KTtcclxuICAgIHdoZWVsRGVsdGEgPSAwO1xyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXdoZWVsXCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIHdoZWVsRGVsdGEgPSBlLndoZWVsRGVsdGE7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgXHJcbiAgICBcclxuICAgIFxyXG4gICAgLy9zdGF0ZSB2YXJpYWJsZSBpbml0aWFsaXphdGlvblxyXG4gICAgbW91c2VTdGF0ZSA9IG5ldyBNb3VzZVN0YXRlKG1vdXNlUG9zaXRpb24sIHJlbGF0aXZlTW91c2VQb3NpdGlvbiwgbW91c2VEb3duLCBtb3VzZUluLCB3aGVlbERlbHRhKTtcclxuICAgIGNhbnZhc1N0YXRlID0gbmV3IENhbnZhc1N0YXRlKGNhbnZhcywgY3R4KTtcclxuICAgIFxyXG4gICAgLy9sb2NhbCBzdG9yYWdlIGhhbmRsaW5nIGZvciBhY3RpdmUgbm9kZSByZWNvcmQgYW5kIHByb2dyZXNzXHJcbiAgICBpZihsb2NhbFN0b3JhZ2UuYWN0aXZlTm9kZSA9PT0gdW5kZWZpbmVkKXtcclxuICAgICAgICBsb2NhbFN0b3JhZ2UuYWN0aXZlTm9kZSA9IDA7XHJcbiAgICB9XHJcbiAgICBpZihsb2NhbFN0b3JhZ2UucHJvZ3Jlc3MgPT09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgbG9jYWxTdG9yYWdlLnByb2dyZXNzID0gXCJcIjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy9jcmVhdGVzIHRoZSBnYW1lIG9iamVjdCBmcm9tIHdoaWNoIG1vc3QgaW50ZXJhY3Rpb24gaXMgbWFuYWdlZFxyXG4gICAgZ2FtZSA9IG5ldyBHYW1lKCk7XHJcbn1cclxuXHJcbi8vZmlyZXMgb25jZSBwZXIgZnJhbWVcclxuZnVuY3Rpb24gbG9vcCgpIHtcclxuICAgIC8vYmluZHMgbG9vcCB0byBmcmFtZXNcclxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobG9vcC5iaW5kKHRoaXMpKTtcclxuICAgIFxyXG4gICAgdGltZS51cGRhdGUoLjAxNjcpO1xyXG4gICAgXHJcbiAgICAvL2ZlZWQgY3VycmVudCBtb3VzZSB2YXJpYWJsZXMgYmFjayBpbnRvIG1vdXNlIHN0YXRlXHJcbiAgICBtb3VzZVN0YXRlLnVwZGF0ZShtb3VzZVBvc2l0aW9uLCByZWxhdGl2ZU1vdXNlUG9zaXRpb24sIG1vdXNlRG93biwgbW91c2VJbiwgd2hlZWxEZWx0YSk7XHJcbiAgICAvL3Jlc2V0dGluZyB3aGVlbCBkZWx0YVxyXG4gICAgd2hlZWxEZWx0YSA9IDA7XHJcbiAgICBcclxuICAgIC8vdXBkYXRlIGdhbWUncyB2YXJpYWJsZXM6IHBhc3NpbmcgY29udGV4dCwgY2FudmFzLCB0aW1lLCBjZW50ZXIgcG9pbnQsIHVzYWJsZSBoZWlnaHQsIG1vdXNlIHN0YXRlXHJcbiAgICBcclxuICAgIGdhbWUudXBkYXRlKG1vdXNlU3RhdGUsIGNhbnZhc1N0YXRlLCB0aW1lKTtcclxufTtcclxuXHJcbi8vbGlzdGVucyBmb3IgY2hhbmdlcyBpbiBzaXplIG9mIHdpbmRvdyBhbmQgYWRqdXN0cyB2YXJpYWJsZXMgYWNjb3JkaW5nbHlcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgZnVuY3Rpb24oZSl7XHJcbiAgICBjYW52YXNTdGF0ZS51cGRhdGUoKTtcclxufSk7XHJcblxyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vaW1wb3J0ZWQgb2JqZWN0c1xyXG52YXIgQm9hcmRQaGFzZSA9IHJlcXVpcmUoJy4vcGhhc2VzL2JvYXJkUGhhc2UvQm9hcmRQaGFzZS5qcycpO1xyXG52YXIgR3JhcGhQaGFzZSA9IHJlcXVpcmUoJy4vcGhhc2VzL2dyYXBoUGhhc2UvR3JhcGhQaGFzZS5qcycpO1xyXG52YXIgRHJhd0xpYiA9IHJlcXVpcmUoJy4vbGlicmFyaWVzL0RyYXdsaWIuanMnKTtcclxudmFyIFV0aWxpdGllcyA9IHJlcXVpcmUoJy4vbGlicmFyaWVzL1V0aWxpdGllcy5qcycpO1xyXG5cclxudmFyIGFjdGl2ZVBoYXNlO1xyXG52YXIgcGFpbnRlcjtcclxudmFyIHV0aWxpdHk7XHJcblxyXG52YXIgbW91c2VTdGF0ZVxyXG5cclxuZnVuY3Rpb24gR2FtZSgpeyAgICBcclxuICAgIHBhaW50ZXIgPSBuZXcgRHJhd0xpYigpO1xyXG4gICAgdXRpbGl0eSA9IG5ldyBVdGlsaXRpZXMoKTtcclxuICAgIFxyXG4gICAgLy9pbnN0YW50aWF0ZSB0aGUgZ3JhcGhcclxuICAgIGFjdGl2ZVBoYXNlID0gbmV3IEdyYXBoUGhhc2UoXCJodHRwczovL2F0bGFzLWJhY2tlbmQuaGVyb2t1YXBwLmNvbS9yZXBvc1wiKTsgLy9hY3R1YWwgYmFja2VuZCBhcHBcclxuICAgIC8vYWN0aXZlUGhhc2UgPSBuZXcgR3JhcGhQaGFzZShcImh0dHA6Ly9sb2NhbGhvc3Q6NTAwMC9yZXBvc1wiKTsgLy9mb3IgdGVzdGluZ1xyXG4gICAgXHJcbiAgICAvL2dpdmUgbW91c2VTdGF0ZSBhIHZhbHVlIGZyb20gdGhlIHN0YXJ0IHNvIGl0IGRvZXNuJ3QgcGFzcyB1bmRlZmluZWQgdG8gcHJldmlvdXNcclxuICAgIG1vdXNlU3RhdGUgPSAwO1xyXG59XHJcblxyXG4vL3Bhc3NpbmcgY29udGV4dCwgY2FudmFzLCBkZWx0YSB0aW1lLCBjZW50ZXIgcG9pbnQsIG1vdXNlIHN0YXRlXHJcbkdhbWUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKG1vdXNlU3RhdGUsIGNhbnZhc1N0YXRlLCB0aW1lKSB7XHJcbiAgICBcclxuICAgIFxyXG4gICAgLy91cGRhdGUga2V5IHZhcmlhYmxlcyBpbiB0aGUgYWN0aXZlIHBoYXNlXHJcbiAgICBhY3RpdmVQaGFzZS51cGRhdGUobW91c2VTdGF0ZSwgY2FudmFzU3RhdGUsIHRpbWUpO1xyXG4gICAgXHJcbiAgICAvL2RyYXcgYmFja2dyb3VuZCBhbmQgdGhlbiBhY3RpdmUgcGhhc2VcclxuICAgIGNhbnZhc1N0YXRlLmN0eC5zYXZlKCk7XHJcbiAgICBwYWludGVyLnJlY3QoY2FudmFzU3RhdGUuY3R4LCAwLCAwLCBjYW52YXNTdGF0ZS53aWR0aCwgY2FudmFzU3RhdGUuaGVpZ2h0LCBcIiMyMjJcIik7XHJcbiAgICBjYW52YXNTdGF0ZS5jdHgucmVzdG9yZSgpO1xyXG4gICAgYWN0aXZlUGhhc2UuZHJhdyhjYW52YXNTdGF0ZSk7XHJcbiAgICBcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHYW1lOyIsIlwidXNlIHN0cmljdFwiO1xyXG5mdW5jdGlvbiBQb2ludChwWCwgcFkpe1xyXG4gICAgdGhpcy54ID0gcFg7XHJcbiAgICB0aGlzLnkgPSBwWTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUG9pbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuLi9jb21tb24vUG9pbnQuanMnKTtcclxuXHJcbmZ1bmN0aW9uIEJ1dHRvbihwb3NpdGlvbiwgc2l6ZSwgdGV4dCwgY29sb3IpIHtcclxuICAgIHRoaXMucG9zaXRpb24gPSBuZXcgUG9pbnQocG9zaXRpb24ueCwgcG9zaXRpb24ueSk7XHJcbiAgICB0aGlzLnNpemUgPSBuZXcgUG9pbnQoc2l6ZS54LCBzaXplLnkpO1xyXG4gICAgdGhpcy50ZXh0ID0gdGV4dDtcclxuICAgIHRoaXMubW91c2VPdmVyID0gZmFsc2U7XHJcbiAgICB0aGlzLmNvbG9yID0gY29sb3I7XHJcbiAgICB0aGlzLm91dGxpbmVXaWR0aCA9IDE7XHJcbn07XHJcblxyXG4vL3VwZGF0ZXMgYnV0dG9uLCByZXR1cm5zIHRydWUgaWYgY2xpY2tlZFxyXG5CdXR0b24ucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKHBNb3VzZVN0YXRlKSB7XHJcbiAgICBcclxuICAgIHZhciBtID0gcE1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbjtcclxuICAgIGlmKCBtLnggPCB0aGlzLnBvc2l0aW9uLnggfHwgbS54ID4gdGhpcy5wb3NpdGlvbi54ICsgdGhpcy5zaXplLnggfHxcclxuICAgICAgICBtLnkgPCB0aGlzLnBvc2l0aW9uLnkgfHwgbS55ID4gdGhpcy5wb3NpdGlvbi55ICsgdGhpcy5zaXplLnkpIHtcclxuICAgICAgICB0aGlzLm1vdXNlT3ZlciA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5tb3VzZU92ZXIgPSB0cnVlO1xyXG4gICAgICAgIGlmKHBNb3VzZVN0YXRlLm1vdXNlRG93biAmJiAhcE1vdXNlU3RhdGUubGFzdE1vdXNlRG93bikge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5CdXR0b24ucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihwQ2FudmFzU3RhdGUsIHBQYWludGVyKSB7XHJcbiAgICAvL2RyYXcgYmFzZSBidXR0b25cclxuICAgIGlmKHRoaXMubW91c2VPdmVyKSB7XHJcbiAgICAgICAgdGhpcy5vdXRsaW5lV2lkdGggPSAyO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5vdXRsaW5lV2lkdGggPSAxO1xyXG4gICAgfVxyXG4gICAgcFBhaW50ZXIucmVjdChwQ2FudmFzU3RhdGUuY3R4LFxyXG4gICAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnggLSB0aGlzLm91dGxpbmVXaWR0aCxcclxuICAgICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi55IC0gdGhpcy5vdXRsaW5lV2lkdGgsXHJcbiAgICAgICAgICAgICAgICAgIHRoaXMuc2l6ZS54ICsgMiAqIHRoaXMub3V0bGluZVdpZHRoLFxyXG4gICAgICAgICAgICAgICAgICB0aGlzLnNpemUueSArIDIgKiB0aGlzLm91dGxpbmVXaWR0aCwgXCIjZmZmXCIpO1xyXG5cclxuICAgIHBQYWludGVyLnJlY3QocENhbnZhc1N0YXRlLmN0eCwgdGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnksIHRoaXMuc2l6ZS54LCB0aGlzLnNpemUueSwgdGhpcy5jb2xvcik7XHJcbiAgICBcclxuICAgIC8vZHJhdyB0ZXh0IG9mIGJ1dHRvblxyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5zYXZlKCk7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LmZvbnQgPSBcIjE2cHggQXJpYWxcIjtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHguZmlsbFN0eWxlID0gXCIjZmZmXCI7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LnRleHRBbGlnbiA9IFwiY2VudGVyXCI7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LnRleHRCYXNlbGluZSA9IFwibWlkZGxlXCI7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LmZpbGxUZXh0KHRoaXMudGV4dCwgdGhpcy5wb3NpdGlvbi54ICsgdGhpcy5zaXplLnggLyAyLCB0aGlzLnBvc2l0aW9uLnkgKyB0aGlzLnNpemUueSAvIDIpO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5yZXN0b3JlKCk7XHJcbiAgICBcclxuICAgIFxyXG59O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQnV0dG9uOyIsIi8vQ29udGFpbnMgY2FudmFzIHJlbGF0ZWQgdmFyaWFibGVzIGluIGEgc2luZ2xlIGVhc3ktdG8tcGFzcyBvYmplY3RcclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4uL2NvbW1vbi9Qb2ludC5qcycpO1xyXG5cclxuXHJcbmZ1bmN0aW9uIENhbnZhc1N0YXRlKGNhbnZhcywgY3R4KSB7XHJcbiAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcclxuICAgIHRoaXMuY3R4ID0gY3R4O1xyXG4gICAgdGhpcy51cGRhdGUoKTtcclxufVxyXG5cclxuQ2FudmFzU3RhdGUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy53aWR0aCA9IHRoaXMuY2FudmFzLndpZHRoID0gdGhpcy5jYW52YXMub2Zmc2V0V2lkdGg7XHJcbiAgICB0aGlzLmhlaWdodCA9IHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuY2FudmFzLm9mZnNldEhlaWdodDtcclxuICAgIHRoaXMuY2VudGVyID0gbmV3IFBvaW50KHRoaXMuY2FudmFzLndpZHRoIC8gMiwgdGhpcy5jYW52YXMuaGVpZ2h0IC8gMik7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2FudmFzU3RhdGU7IiwiLy9rZWVwcyB0cmFjayBvZiBtb3VzZSByZWxhdGVkIHZhcmlhYmxlcy5cclxuLy9jYWxjdWxhdGVkIGluIG1haW4gYW5kIHBhc3NlZCB0byBnYW1lXHJcbi8vY29udGFpbnMgdXAgc3RhdGVcclxuLy9wb3NpdGlvblxyXG4vL3JlbGF0aXZlIHBvc2l0aW9uXHJcbi8vb24gY2FudmFzXHJcblwidXNlIHN0cmljdFwiO1xyXG5mdW5jdGlvbiBNb3VzZVN0YXRlKHBQb3NpdGlvbiwgcFJlbGF0aXZlUG9zaXRpb24sIHBNb3VzZURvd24sIHBNb3VzZUluLCBwV2hlZWxEZWx0YSl7XHJcbiAgICB0aGlzLnBvc2l0aW9uID0gcFBvc2l0aW9uO1xyXG4gICAgdGhpcy5yZWxhdGl2ZVBvc2l0aW9uID0gcFJlbGF0aXZlUG9zaXRpb247XHJcbiAgICB0aGlzLm1vdXNlRG93biA9IHBNb3VzZURvd247XHJcbiAgICB0aGlzLm1vdXNlSW4gPSBwTW91c2VJbjtcclxuICAgIHRoaXMud2hlZWxEZWx0YSA9IHBXaGVlbERlbHRhO1xyXG4gICAgXHJcbiAgICAvL3RyYWNraW5nIHByZXZpb3VzIG1vdXNlIHN0YXRlc1xyXG4gICAgdGhpcy5sYXN0UG9zaXRpb24gPSBwUG9zaXRpb247XHJcbiAgICB0aGlzLmxhc3RSZWxhdGl2ZVBvc2l0aW9uID0gcFJlbGF0aXZlUG9zaXRpb247XHJcbiAgICB0aGlzLmxhc3RNb3VzZURvd24gPSBwTW91c2VEb3duO1xyXG4gICAgdGhpcy5sYXN0TW91c2VJbiA9IHBNb3VzZUluO1xyXG4gICAgdGhpcy5sYXN0V2hlZWxEZWx0YSA9IHBXaGVlbERlbHRhXHJcbn1cclxuXHJcbk1vdXNlU3RhdGUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKHBQb3NpdGlvbiwgcFJlbGF0aXZlUG9zaXRpb24sIHBNb3VzZURvd24sIHBNb3VzZUluLCBwV2hlZWxEZWx0YSl7XHJcbiAgICB0aGlzLmxhc3RQb3NpdGlvbiA9IHRoaXMucG9zaXRpb247XHJcbiAgICB0aGlzLmxhc3RSZWxhdGl2ZVBvc2l0aW9uID0gdGhpcy5yZWxhdGl2ZVBvc2l0aW9uO1xyXG4gICAgdGhpcy5sYXN0TW91c2VEb3duID0gdGhpcy5tb3VzZURvd247XHJcbiAgICB0aGlzLmxhc3RNb3VzZUluID0gdGhpcy5tb3VzZUluO1xyXG4gICAgdGhpcy5sYXN0V2hlZWxEZWx0YSA9IHRoaXMud2hlZWxEZWx0YTtcclxuICAgIFxyXG4gICAgXHJcbiAgICB0aGlzLnBvc2l0aW9uID0gcFBvc2l0aW9uO1xyXG4gICAgdGhpcy5yZWxhdGl2ZVBvc2l0aW9uID0gcFJlbGF0aXZlUG9zaXRpb247XHJcbiAgICB0aGlzLm1vdXNlRG93biA9IHBNb3VzZURvd247XHJcbiAgICB0aGlzLm1vdXNlSW4gPSBwTW91c2VJbjtcclxuICAgIHRoaXMud2hlZWxEZWx0YSA9IHBXaGVlbERlbHRhO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1vdXNlU3RhdGU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5mdW5jdGlvbiBUaW1lICgpIHtcclxuICAgIHRoaXMudG90YWxUaW1lID0gMDtcclxuICAgIHRoaXMuZGVsdGFUaW1lID0gMDtcclxufTtcclxuXHJcblRpbWUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0KSB7XHJcbiAgICB0aGlzLnRvdGFsVGltZSArPSBkdDtcclxuICAgIHRoaXMuZGVsdGFUaW1lID0gZHQ7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRpbWU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmZ1bmN0aW9uIERyYXdsaWIoKXtcclxufTtcclxuXHJcbkRyYXdsaWIucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oY3R4LCB4LCB5LCB3LCBoKSB7XHJcbiAgICBjdHguY2xlYXJSZWN0KHgsIHksIHcsIGgpO1xyXG59O1xyXG5cclxuRHJhd2xpYi5wcm90b3R5cGUucmVjdCA9IGZ1bmN0aW9uKGN0eCwgeCwgeSwgdywgaCwgY29sKSB7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IGNvbDtcclxuICAgIGN0eC5maWxsUmVjdCh4LCB5LCB3LCBoKTtcclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbn07XHJcblxyXG5EcmF3bGliLnByb3RvdHlwZS5yb3VuZGVkUmVjdCA9IGZ1bmN0aW9uKGN0eCwgeCwgeSwgdywgaCwgcmFkLCBmaWxsLCBmaWxsQ29sb3IsIG91dGxpbmUsIG91dGxpbmVDb2xvciwgb3V0bGluZVdpZHRoKSB7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4Lm1vdmVUbyh4LCB5IC0gcmFkKTsgLy8xMSBvIGNsb2NrXHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHgubGluZVRvKHggKyB3LCB5IC0gcmFkKTsgLy8xIG8gY2xvY2tcclxuICAgIGN0eC5hcmNUbyh4ICsgdyArIHJhZCwgeSAtIHJhZCwgeCArIHcgKyByYWQsIHksIHJhZCk7IC8vIDIgbyBjbG9ja1xyXG4gICAgY3R4LmxpbmVUbyh4ICsgdyArIHJhZCwgeSArIGgpOyAvLyA0IG8gY2xvY2tcclxuICAgIGN0eC5hcmNUbyh4ICsgdyArIHJhZCwgeSArIGggKyByYWQsIHggKyB3LCB5ICsgaCArIHJhZCwgcmFkKSAvLzUgbyBjbG9ja1xyXG4gICAgY3R4LmxpbmVUbyh4LCB5ICsgaCArIHJhZCk7IC8vIDcgbyBjbG9ja1xyXG4gICAgY3R4LmFyY1RvKHggLSByYWQsIHkgKyBoICsgcmFkLCB4IC0gcmFkLCB5ICsgaCwgcmFkKSAvLzggbyBjbG9ja1xyXG4gICAgY3R4LmxpbmVUbyh4IC0gcmFkLCB5KTsgLy8gMTAgbyBjbG9ja1xyXG4gICAgY3R4LmFyY1RvKHggLSByYWQsIHkgLSByYWQsIHgsIHkgLXJhZCwgcmFkKSAvLzExIG8gY2xvY2tcclxuICAgIGN0eC5jbG9zZVBhdGgoKTtcclxuICAgIGlmKGZpbGwpIHtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gZmlsbENvbG9yO1xyXG4gICAgICAgIGN0eC5maWxsKCk7XHJcbiAgICB9XHJcbiAgICBpZihvdXRsaW5lKSB7XHJcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gb3V0bGluZUNvbG9yO1xyXG4gICAgICAgIGN0eC5saW5lV2lkdGggPSBvdXRsaW5lV2lkdGg7XHJcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgfVxyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxufVxyXG5cclxuRHJhd2xpYi5wcm90b3R5cGUubGluZSA9IGZ1bmN0aW9uKGN0eCwgeDEsIHkxLCB4MiwgeTIsIHRoaWNrbmVzcywgY29sb3IpIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHgubW92ZVRvKHgxLCB5MSk7XHJcbiAgICBjdHgubGluZVRvKHgyLCB5Mik7XHJcbiAgICBjdHgubGluZVdpZHRoID0gdGhpY2tuZXNzO1xyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gY29sb3I7XHJcbiAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG59O1xyXG5cclxuRHJhd2xpYi5wcm90b3R5cGUuY2lyY2xlID0gZnVuY3Rpb24oY3R4LCB4LCB5LCByYWRpdXMsIGZpbGwsIGZpbGxDb2xvciwgb3V0bGluZSwgb3V0bGluZUNvbG9yLCBvdXRsaW5lV2lkdGgpIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHguYXJjKHgseSwgcmFkaXVzLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xyXG4gICAgY3R4LmNsb3NlUGF0aCgpO1xyXG4gICAgaWYoZmlsbCkge1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBmaWxsQ29sb3I7XHJcbiAgICAgICAgY3R4LmZpbGwoKTtcclxuICAgIH1cclxuICAgIGlmKG91dGxpbmUpIHtcclxuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBvdXRsaW5lQ29sb3I7XHJcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IG91dGxpbmVXaWR0aDtcclxuICAgICAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICB9XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG59O1xyXG5cclxuRHJhd2xpYi5wcm90b3R5cGUudGV4dFRvTGluZXMgPSBmdW5jdGlvbihjdHgsIHRleHQsIGZvbnQsIHdpZHRoKSB7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4LmZvbnQgPSBmb250O1xyXG4gICAgXHJcbiAgICB2YXIgbGluZXMgPSBbXTtcclxuICAgIFxyXG4gICAgd2hpbGUgKHRleHQubGVuZ3RoKSB7XHJcbiAgICAgICAgdmFyIGksIGo7XHJcbiAgICAgICAgZm9yKGkgPSB0ZXh0Lmxlbmd0aDsgY3R4Lm1lYXN1cmVUZXh0KHRleHQuc3Vic3RyKDAsIGkpKS53aWR0aCA+IHdpZHRoOyBpLS0pO1xyXG5cclxuICAgICAgICB2YXIgcmVzdWx0ID0gdGV4dC5zdWJzdHIoMCxpKTtcclxuXHJcbiAgICAgICAgaWYgKGkgIT09IHRleHQubGVuZ3RoKVxyXG4gICAgICAgICAgICBmb3IodmFyIGogPSAwOyByZXN1bHQuaW5kZXhPZihcIiBcIiwgaikgIT09IC0xOyBqID0gcmVzdWx0LmluZGV4T2YoXCIgXCIsIGopICsgMSk7XHJcblxyXG4gICAgICAgIGxpbmVzLnB1c2gocmVzdWx0LnN1YnN0cigwLCBqIHx8IHJlc3VsdC5sZW5ndGgpKTtcclxuICAgICAgICB3aWR0aCA9IE1hdGgubWF4KHdpZHRoLCBjdHgubWVhc3VyZVRleHQobGluZXNbbGluZXMubGVuZ3RoIC0gMV0pLndpZHRoKTtcclxuICAgICAgICB0ZXh0ICA9IHRleHQuc3Vic3RyKGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdLmxlbmd0aCwgdGV4dC5sZW5ndGgpO1xyXG4gICAgfVxyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxuICAgIHJldHVybiBsaW5lcztcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRHJhd2xpYjsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIFBvaW50ID0gcmVxdWlyZSgnLi4vY29tbW9uL1BvaW50LmpzJyk7XHJcblxyXG5mdW5jdGlvbiBVdGlsaXRpZXMoKXtcclxufVxyXG5cclxuLy9CT0FSRFBIQVNFIC0gc2V0IGEgc3RhdHVzIHZhbHVlIG9mIGEgbm9kZSBpbiBsb2NhbFN0b3JhZ2UgYmFzZWQgb24gSURcclxuVXRpbGl0aWVzLnByb3RvdHlwZS5zZXRQcm9ncmVzcyA9IGZ1bmN0aW9uKHBPYmplY3Qpe1xyXG4gICAgdmFyIHByb2dyZXNzU3RyaW5nID0gbG9jYWxTdG9yYWdlLnByb2dyZXNzO1xyXG4gICAgXHJcbiAgICB2YXIgdGFyZ2V0T2JqZWN0ID0gcE9iamVjdDtcclxuICAgIC8vbWFrZSBhY2NvbW9kYXRpb25zIGlmIHRoaXMgaXMgYW4gZXh0ZW5zaW9uIG5vZGVcclxuICAgIHZhciBleHRlbnNpb25mbGFnID0gdHJ1ZTtcclxuICAgIHdoaWxlKGV4dGVuc2lvbmZsYWcpe1xyXG4gICAgICAgIGlmKHRhcmdldE9iamVjdC50eXBlID09PSBcImV4dGVuc2lvblwiKXtcclxuICAgICAgICAgICAgdGFyZ2V0T2JqZWN0ID0gdGFyZ2V0T2JqZWN0LmNvbm5lY3Rpb25Gb3J3YXJkWzBdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICBleHRlbnNpb25mbGFnID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICB2YXIgb2JqZWN0SUQgPSB0YXJnZXRPYmplY3QuZGF0YS5faWQ7XHJcbiAgICB2YXIgb2JqZWN0U3RhdHVzID0gdGFyZ2V0T2JqZWN0LnN0YXR1cztcclxuICAgIFxyXG4gICAgLy9zZWFyY2ggdGhlIHByb2dyZXNzU3RyaW5nIGZvciB0aGUgY3VycmVudCBJRFxyXG4gICAgdmFyIGlkSW5kZXggPSBwcm9ncmVzc1N0cmluZy5pbmRleE9mKG9iamVjdElEKTtcclxuICAgIFxyXG4gICAgLy9pZiBpdCdzIG5vdCBhZGQgaXQgdG8gdGhlIGVuZFxyXG4gICAgaWYoaWRJbmRleCA9PT0gLTEpe1xyXG4gICAgICAgIHByb2dyZXNzU3RyaW5nICs9IG9iamVjdElEICsgXCJcIiArIG9iamVjdFN0YXR1cyArIFwiLFwiO1xyXG4gICAgfVxyXG4gICAgLy9vdGhlcndpc2UgbW9kaWZ5IHRoZSBzdGF0dXMgdmFsdWVcclxuICAgIGVsc2V7XHJcbiAgICAgICAgcHJvZ3Jlc3NTdHJpbmcgPSBwcm9ncmVzc1N0cmluZy5zdWJzdHIoMCwgb2JqZWN0SUQubGVuZ3RoICsgaWRJbmRleCkgKyBvYmplY3RTdGF0dXMgKyBwcm9ncmVzc1N0cmluZy5zdWJzdHIob2JqZWN0SUQubGVuZ3RoICsgMSArIGlkSW5kZXgsIHByb2dyZXNzU3RyaW5nLmxlbmd0aCkgKyBcIlwiO1xyXG4gICAgfVxyXG4gICAgbG9jYWxTdG9yYWdlLnByb2dyZXNzID0gcHJvZ3Jlc3NTdHJpbmc7XHJcbn1cclxuXHJcbi8vcmV0dXJucyBtb3VzZSBwb3NpdGlvbiBpbiBsb2NhbCBjb29yZGluYXRlIHN5c3RlbSBvZiBlbGVtZW50XHJcblV0aWxpdGllcy5wcm90b3R5cGUuZ2V0TW91c2UgPSBmdW5jdGlvbihlKXtcclxuICAgIHJldHVybiBuZXcgUG9pbnQoKGUucGFnZVggLSBlLnRhcmdldC5vZmZzZXRMZWZ0KSwgKGUucGFnZVkgLSBlLnRhcmdldC5vZmZzZXRUb3ApKTtcclxufVxyXG5cclxuVXRpbGl0aWVzLnByb3RvdHlwZS5tYXAgPSBmdW5jdGlvbih2YWx1ZSwgbWluMSwgbWF4MSwgbWluMiwgbWF4Mil7XHJcbiAgICByZXR1cm4gbWluMiArIChtYXgyIC0gbWluMikgKiAoKHZhbHVlIC0gbWluMSkgLyAobWF4MSAtIG1pbjEpKTtcclxufVxyXG5cclxuLy9saW1pdHMgdGhlIHVwcGVyIGFuZCBsb3dlciBsaW1pdHMgb2YgdGhlIHBhcmFtZXRlciB2YWx1ZVxyXG5VdGlsaXRpZXMucHJvdG90eXBlLmNsYW1wID0gZnVuY3Rpb24odmFsdWUsIG1pbiwgbWF4KXtcclxuICAgIHJldHVybiBNYXRoLm1heChtaW4sIE1hdGgubWluKG1heCwgdmFsdWUpKTtcclxufVxyXG5cclxuLy9jaGVja3MgbW91c2UgY29sbGlzaW9uIG9uIGNhbnZhc1xyXG5VdGlsaXRpZXMucHJvdG90eXBlLm1vdXNlSW50ZXJzZWN0ID0gZnVuY3Rpb24ocE1vdXNlU3RhdGUsIHBFbGVtZW50LCBwT2Zmc2V0dGVyLCBwU2NhbGUpe1xyXG4gICAgLy9pZiB0aGUgeCBwb3NpdGlvbiBjb2xsaWRlc1xyXG4gICAgaWYocEVsZW1lbnQuc3RhdHVzICE9PSBcIjBcIil7XHJcbiAgICAgICAgaWYocE1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbi54ICsgcE9mZnNldHRlci54ID4gKHBFbGVtZW50LnBvc2l0aW9uLnggLSAocEVsZW1lbnQud2lkdGgpLzIpICYmIHBNb3VzZVN0YXRlLnJlbGF0aXZlUG9zaXRpb24ueCArIHBPZmZzZXR0ZXIueCA8IChwRWxlbWVudC5wb3NpdGlvbi54ICsgKHBFbGVtZW50LndpZHRoKS8yKSl7XHJcbiAgICAgICAgICAgIC8vaWYgdGhlIHkgcG9zaXRpb24gY29sbGlkZXNcclxuICAgICAgICAgICAgaWYocE1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbi55ICsgcE9mZnNldHRlci55ID4gKHBFbGVtZW50LnBvc2l0aW9uLnkgLSAocEVsZW1lbnQuaGVpZ2h0KS8yKSAmJiBwTW91c2VTdGF0ZS5yZWxhdGl2ZVBvc2l0aW9uLnkgKyBwT2Zmc2V0dGVyLnkgPCAocEVsZW1lbnQucG9zaXRpb24ueSArIChwRWxlbWVudC5oZWlnaHQpLzIpKXtcclxuICAgICAgICAgICAgICAgICAgICBwRWxlbWVudC5tb3VzZU92ZXIgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICBwRWxlbWVudC5tb3VzZU92ZXIgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICBwRWxlbWVudC5tb3VzZU92ZXIgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVXRpbGl0aWVzOyIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgRHJhd0xpYiA9IHJlcXVpcmUoJy4uLy4uL2xpYnJhcmllcy9EcmF3bGliLmpzJyk7XHJcbnZhciBMZXNzb25Ob2RlID0gcmVxdWlyZSgnLi9MZXNzb25Ob2RlLmpzJyk7XHJcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9Qb2ludC5qcycpO1xyXG52YXIgRXh0ZW5zaW9uTm9kZSA9IHJlcXVpcmUoJy4vRXh0ZW5zaW9uTm9kZS5qcycpO1xyXG5cclxudmFyIHBhaW50ZXI7XHJcblxyXG4vL3BhcmFtZXRlciBpcyBhIHBvaW50IHRoYXQgZGVub3RlcyBzdGFydGluZyBwb3NpdGlvblxyXG5mdW5jdGlvbiBCb2FyZChwU3RhcnRQb3NpdGlvbiwgcEpTT05EYXRhKXtcclxuICAgIHRoaXMucG9zaXRpb24gPSBwU3RhcnRQb3NpdGlvbjtcclxuICAgIFxyXG4gICAgdmFyIHN0YWdpbmdBcnJheSA9IFtdO1xyXG4gICAgXHJcbiAgICAvL3BvcHVsYXRlIHRoZSBhcnJheVxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHBKU09ORGF0YS5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgLy9lbnN1cmVzIHRoYXQgdGhlIGNodW5rIGNvbnRhaW5zIGltYWdlIGRhdGFcclxuICAgICAgICBpZihwSlNPTkRhdGFbaV0uaW1hZ2UgIT09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIHZhciB0ZXN0cmVhZCA9IHBKU09ORGF0YVtpXS5pbWFnZTtcclxuICAgICAgICAgICAgc3RhZ2luZ0FycmF5LnB1c2gobmV3IExlc3Nvbk5vZGUobmV3IFBvaW50KDAsIDApLCBwSlNPTkRhdGFbaV0pKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vZmluZCBhbmQgbGFiZWwgdGhlIHN0YXJ0IHBvaW50c1xyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHN0YWdpbmdBcnJheS5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgLy9pZiBhIG5vZGUgaGFzIG5vIGNvbm5lY3Rpb25zLCBpdCBtdXN0IGJlIGEgc3RhcnRpbmcgbm9kZVxyXG4gICAgICAgIGlmKHN0YWdpbmdBcnJheVtpXS5kYXRhLmNvbm5lY3Rpb25zLmxlbmd0aCA9PT0gMCl7XHJcbiAgICAgICAgICAgIHN0YWdpbmdBcnJheVtpXS5wbGFjZW1lbnQgPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICBzdGFnaW5nQXJyYXlbaV0ucGxhY2VtZW50ID0gLTE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvL3NldCBkaXJlY3Qgb2JqZWN0IGNvbm5lY3Rpb25zIHRvIHJlbGF0ZWQgbm9kZXMgZm9yIHJlZmVyZW5jaW5nXHJcbiAgICAvL3BhcnNlIGVudGlyZSBsaXN0XHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgc3RhZ2luZ0FycmF5Lmxlbmd0aDsgaSsrKXtcclxuICAgICAgICB2YXIgZGVidWdUZXh0ID0gc3RhZ2luZ0FycmF5W2ldLmRhdGEubmFtZTtcclxuICAgICAgICBzdGFnaW5nQXJyYXlbaV0uY29ubmVjdGlvbkZvcndhcmQgPSBbXTtcclxuICAgICAgICBzdGFnaW5nQXJyYXlbaV0uY29ubmVjdGlvbkJhY2t3YXJkID0gW107XHJcbiAgICAgICAgLy9jb21wYXJlIGFnYWluc3QgZXZlcnkgb3RoZXIgbm9kZVxyXG4gICAgICAgIGZvcih2YXIgaiA9IDA7IGogPCBzdGFnaW5nQXJyYXkubGVuZ3RoOyBqKyspe1xyXG4gICAgICAgICAgICB2YXIgZGVidWdUZXh0MiA9IHN0YWdpbmdBcnJheVtqXS5kYXRhLm5hbWU7XHJcbiAgICAgICAgICAgIC8vY29tcGFyZSBhZ2FpbnN0IGV2ZXJ5IGNvbm5lY3Rpb25cclxuICAgICAgICAgICAgZm9yKHZhciBrID0gMDsgayA8IHN0YWdpbmdBcnJheVtqXS5kYXRhLmNvbm5lY3Rpb25zLmxlbmd0aDsgaysrKXtcclxuICAgICAgICAgICAgICAgIGlmKHN0YWdpbmdBcnJheVtqXS5kYXRhLmNvbm5lY3Rpb25zW2tdID09PSBzdGFnaW5nQXJyYXlbaV0uZGF0YS5uYW1lKXtcclxuICAgICAgICAgICAgICAgICAgICBzdGFnaW5nQXJyYXlbaV0uY29ubmVjdGlvbkZvcndhcmQucHVzaChzdGFnaW5nQXJyYXlbal0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vYmFja3dhcmRzXHJcbiAgICAgICAgICAgIGZvcih2YXIgayA9IDA7IGsgPCBzdGFnaW5nQXJyYXlbaV0uZGF0YS5jb25uZWN0aW9ucy5sZW5ndGg7IGsrKyl7XHJcbiAgICAgICAgICAgICAgICBpZihzdGFnaW5nQXJyYXlbal0uZGF0YS5uYW1lID09PSBzdGFnaW5nQXJyYXlbaV0uZGF0YS5jb25uZWN0aW9uc1trXSl7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhZ2luZ0FycmF5W2ldLmNvbm5lY3Rpb25CYWNrd2FyZC5wdXNoKHN0YWdpbmdBcnJheVtqXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vYXNzaWduIHBsYWNlbWVudHMgdG8gZWFjaCBub2RlIGJhc2VkIG9uIHRoZSBjb25uZWN0aW9ucyB0aGV5IG1ha2UgdG8gb25lIGFub3RoZXJcclxuICAgIHZhciBjb21wbGV0aW9uRmxhZyA9IGZhbHNlO1xyXG4gICAgdmFyIGRlYnVnQ291bnRlciA9IDA7XHJcbiAgICB3aGlsZSghY29tcGxldGlvbkZsYWcpe1xyXG4gICAgICAgIGNvbXBsZXRpb25GbGFnID0gdHJ1ZTtcclxuICAgICAgICAvL2l0ZXJhdGUgdGhyb3VnaCBldmVyeSBub2RlXHJcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHN0YWdpbmdBcnJheS5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgIC8vZ28gdGhyb3VnaCB0aGF0IG5vZGUncyBmb3J3YXJkIGNvbm5lY3Rpb25zXHJcbiAgICAgICAgICAgIHZhciBkZWJ1Z05hbWUgPSBzdGFnaW5nQXJyYXlbaV0uZGF0YS50aXRsZTtcclxuICAgICAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IHN0YWdpbmdBcnJheVtpXS5jb25uZWN0aW9uRm9yd2FyZC5sZW5ndGg7IGorKyl7XHJcbiAgICAgICAgICAgICAgICAvL2lmIHRoYXQgZm9yd2FyZCBub2RlJ3MgcGxhY2VtZW50IGhhcyBhIHZhbHVlIG9mIC0xLCBpdCBoYXMgbm90IGJlZW4gYXNzaWduZWQgYSBwbGFjZW1lbnQgdmFsdWUgeWV0XHJcbiAgICAgICAgICAgICAgICAvL2Fsc28gY2hlY2tzIHRvIGVuc3VyZSB0aGF0IHRoZSBjdXJyZW50IG5vZGUgaGFzIGEgdmFsdWVcclxuICAgICAgICAgICAgICAgIGlmKHN0YWdpbmdBcnJheVtpXS5jb25uZWN0aW9uRm9yd2FyZFtqXS5wbGFjZW1lbnQgPT09IC0xICYmIHN0YWdpbmdBcnJheVtpXS5wbGFjZW1lbnQgIT09IC0xKXtcclxuICAgICAgICAgICAgICAgICAgICAvL2RvZXMgdGhlIGZvcndhcmQgbm9kZSBoYXZlIG11bHRpcGxlIGJhY2t3YXJkcyBjb25uZWN0aW9ucz9cclxuICAgICAgICAgICAgICAgICAgICBpZihzdGFnaW5nQXJyYXlbaV0uY29ubmVjdGlvbkZvcndhcmRbal0uY29ubmVjdGlvbkJhY2t3YXJkLmxlbmd0aCA+IDEpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2lmIHRoZSBmb3J3YXJkIG5vZGUgaGFzIG11bHRpcGxlIGJhY2t3YXJkcyBjb25uZWN0aW9ucyB5ZXMsIGVuc3VyZSB0aGF0IGVhY2ggaXMgZnVsZmlsbGVkIGJlZm9yZSBhc3NpZ25pbmcgdmFsdWVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmdWxmaWxsZWRGbGFnID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy91c2VkIHRvIHN0b3JlIHRoZSBoaWdoZXN0IHBsYWNlbWVudCB2YWx1ZSBvZiBiYWNrd2FyZHMgY29ubmVjdGlvbnNcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGhpZ2hlc3RWYWx1ZSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcihrID0gMDsgayA8IHN0YWdpbmdBcnJheVtpXS5jb25uZWN0aW9uRm9yd2FyZFtqXS5jb25uZWN0aW9uQmFja3dhcmQubGVuZ3RoOyBrKyspe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8tMSBkZW5vdGVzIHRoYXQgaXQgaGFzIG5vdCB5ZXQgYmVlbiBhc3NpZ25lZCBhIHBsYWNlbWVudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoc3RhZ2luZ0FycmF5W2ldLmNvbm5lY3Rpb25Gb3J3YXJkW2pdLmNvbm5lY3Rpb25CYWNrd2FyZFtrXS5wbGFjZW1lbnQgPT09IC0xKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdWxmaWxsZWRGbGFnID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2Fzc2lnbnMgdGhlIGhpZ2hlc3QgcGxhY2VtZW50IHZhcmlhYmxlIGluIHRoZSBzZXQgb2YgdGhlIGJhY2t3YXJkcyBjb25uZWN0aW9ucyB0byBoaWdoZXN0IHZhbHVlIHZhcmlhYmxlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihzdGFnaW5nQXJyYXlbaV0uY29ubmVjdGlvbkZvcndhcmRbal0uY29ubmVjdGlvbkJhY2t3YXJkW2tdLnBsYWNlbWVudCA+IGhpZ2hlc3RWYWx1ZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGlnaGVzdFZhbHVlID0gc3RhZ2luZ0FycmF5W2ldLmNvbm5lY3Rpb25Gb3J3YXJkW2pdLmNvbm5lY3Rpb25CYWNrd2FyZFtrXS5wbGFjZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9pZiB0aGUgZmxhZyByZW1haW5zIHRydWUgYXQgdGhpcyBwb2ludCwgaXQgaXMgc2FmZSB0byBhc3NpZ24gYSBwbGFjZW1lbnQgdmFsdWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoZnVsZmlsbGVkRmxhZyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3RoZSBoaWdoZXN0IHZhbHVlZCBwbGFjZW1lbnQgb2YgYmFja3dhcmRzIGNvbm5lY3Rpb25zIHdpbGwgYmUgdXNlZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhZ2luZ0FycmF5W2ldLmNvbm5lY3Rpb25Gb3J3YXJkW2pdLnBsYWNlbWVudCA9IGhpZ2hlc3RWYWx1ZSArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy9pZiB0aGUgZm9yd2FyZCBub2RlIGRvZXMgbm90IGhhdmUgbXVsdGlwbGUgYmFja3dhcmQgY29ubmVjdGlvbnMsIGV2ZXJ5dGhpbmcgaXMgY2xlYXIgdG8gYXNzaWduIGEgdmFsdWVcclxuICAgICAgICAgICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3RoZSBjdXJyZW50IG5vZGUncyBwbGFjZW1lbnQgKzEgaXMgZ2l2ZW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhZ2luZ0FycmF5W2ldLmNvbm5lY3Rpb25Gb3J3YXJkW2pdLnBsYWNlbWVudCA9IHN0YWdpbmdBcnJheVtpXS5wbGFjZW1lbnQgKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL2Egbm9kZSB3aXRoIGEgcGxhY2VtZW50IG9mIC0xIGhhcyBub3QgeWV0IGhhZCBhbiBhc3NpZ25tZW50XHJcbiAgICAgICAgICAgIGlmKHN0YWdpbmdBcnJheVtpXS5wbGFjZW1lbnQgPT09IC0xKXtcclxuICAgICAgICAgICAgICAgIC8vdGhpcyBpcyBkZXNpZ25lZCB0byBjYXRjaCBcImJhZCBub2Rlc1wiIGNhdXNlZCBieSBpbXByb3Blcmx5IGVudGVyZWQgZGF0YS4gRG9lc24ndCBjb3VudCBcImJhZFwiIG5vZGVzIGFnYWluc3QgY29tcGxldGlvblxyXG4gICAgICAgICAgICAgICAgaWYoc3RhZ2luZ0FycmF5W2ldLmNvbm5lY3Rpb25Gb3J3YXJkLmxlbmd0aCAhPT0gMCAmJiBzdGFnaW5nQXJyYXlbaV0uY29ubmVjdGlvbkJhY2t3YXJkLmxlbmd0aCAhPT0gMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGlvbkZsYWcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvL3dpbGwgbGVhdmUgYXMgYSBjYXRjaCBzbyB0aGF0IGl0IHdpbGwgcGFzcyBpbnN0ZWFkIG9mIGNyYXNoaW5nIGlmIHRoZXJlIGlzIGEgZGF0YSBlcnJvclxyXG4gICAgICAgIGRlYnVnQ291bnRlcisrO1xyXG4gICAgICAgIGlmKGRlYnVnQ291bnRlciA+IDEwMDAwMCl7XHJcbiAgICAgICAgICAgIGNvbXBsZXRpb25GbGFnID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vZGV0ZXJtaW5lIGZ1cnRoZXN0IHBsYWNlbWVudFxyXG4gICAgdmFyIGZ1cnRoZXN0UGxhY2VtZW50ID0gMDtcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBzdGFnaW5nQXJyYXkubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgIGlmKHN0YWdpbmdBcnJheVtpXS5wbGFjZW1lbnQgPiBmdXJ0aGVzdFBsYWNlbWVudCl7XHJcbiAgICAgICAgICAgIGZ1cnRoZXN0UGxhY2VtZW50ID0gc3RhZ2luZ0FycmF5W2ldLnBsYWNlbWVudDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vY3JlYXRlIGFuZCBwb3B1bGF0ZSAyZCBhcnJheSBiYXNlZCBvbiBzdGFnaW5nIGFycmF5IGRhdGFcclxuICAgIHZhciBub2RlQXJyYXkgPSBbXTtcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBmdXJ0aGVzdFBsYWNlbWVudCArIDE7IGkrKyl7XHJcbiAgICAgICAgdmFyIHN1YkFycmF5ID0gW107XHJcbiAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IHN0YWdpbmdBcnJheS5sZW5ndGg7IGorKyl7XHJcbiAgICAgICAgICAgIGlmKHN0YWdpbmdBcnJheVtqXS5wbGFjZW1lbnQgPT09IGkpe1xyXG4gICAgICAgICAgICAgICAgc3ViQXJyYXkucHVzaChzdGFnaW5nQXJyYXlbal0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG5vZGVBcnJheVtpXSA9IHN1YkFycmF5O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvL2FkZCBleHRlbnNpb25Ob2RlcyB0aGF0IHdpbGwgYmUgdXNlZCBmb3Igbm9kZXMgdGhhdCBjb25uZWN0IHRvIGEgbm9kZSBub3QgZGlyZWN0bHkgc3Vic2VxdWVudFxyXG4gICAgLy9wYXJzZSB0aHJvdWdoIGV2ZXJ5IG5vZGVcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBub2RlQXJyYXkubGVuZ3RoIC0gMTsgaSsrKXtcclxuICAgICAgICB2YXIgc3ViQXJyYXkgPSBub2RlQXJyYXlbaV07XHJcbiAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IHN1YkFycmF5Lmxlbmd0aDsgaisrKXtcclxuICAgICAgICAgICAgLy9wYXJzZSB0aHJvdWdoIGVhY2ggZm9yd2FyZCBjb25uZWN0aW9uXHJcbiAgICAgICAgICAgIGZvcih2YXIgayA9IDA7IGsgPCBzdWJBcnJheVtqXS5jb25uZWN0aW9uRm9yd2FyZC5sZW5ndGg7IGsrKyl7XHJcbiAgICAgICAgICAgICAgICB2YXIgbmV4dEFycmF5ID0gbm9kZUFycmF5W2kgKyAxXTtcclxuICAgICAgICAgICAgICAgIHZhciBleHRlbmQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgLy9wYXJzZSB0aHJvdWdoIHRoZSBuZXh0IGFycmF5XHJcbiAgICAgICAgICAgICAgICBmb3IodmFyIGwgPSAwOyBsIDwgbmV4dEFycmF5Lmxlbmd0aDsgbCsrKXtcclxuICAgICAgICAgICAgICAgICAgICBpZihzdWJBcnJheVtqXS5jb25uZWN0aW9uRm9yd2FyZFtrXS5kYXRhLm5hbWUgPT09IG5leHRBcnJheVtsXS5kYXRhLm5hbWUpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBleHRlbmQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy9hc3N1bWluZyB0aGF0IHRoZXJlIHdhcyBubyBtYXRjaCBmb3IgdGhpcyBjb25uZWN0aW9uLCBhZGQgYW4gZXh0ZW5zaW9uIG5vZGUgdG8gdGhlIG5leHRBcnJheVxyXG4gICAgICAgICAgICAgICAgaWYoZXh0ZW5kKXtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV4dEV4dGVuc2lvbiA9IG5ldyBFeHRlbnNpb25Ob2RlKHN1YkFycmF5W2pdLmNvbm5lY3Rpb25Gb3J3YXJkW2tdLmRhdGEubmFtZSwgc3ViQXJyYXlbal0uY29ubmVjdGlvbkZvcndhcmRba10sIHN1YkFycmF5W2pdKTtcclxuICAgICAgICAgICAgICAgICAgICBuZXh0QXJyYXkucHVzaChuZXh0RXh0ZW5zaW9uKTtcclxuICAgICAgICAgICAgICAgICAgICAvL2NoYW5nZSB0aGUgY3VycmVudCBub2RlJ3MgZm9yd2FyZCBjb25uZWN0aW9uIHRvIHRoaXMgZXh0ZW5zaW9uIG5vZGVcclxuICAgICAgICAgICAgICAgICAgICBzdWJBcnJheVtqXS5jb25uZWN0aW9uRm9yd2FyZFtrXSA9IG5leHRFeHRlbnNpb247XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vYWxwaGFiZXRpemUgdGhlIGFycmF5cyB1c2luZyBzdHJpbmcgc29ydGluZyBhcnJheSBtZXRob2RcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBub2RlQXJyYXkubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgIG5vZGVBcnJheVtpXS5zb3J0KGZ1bmN0aW9uIGNvbXBhcmUoYSxiKSB7XHJcbiAgICAgICAgICAgIGlmIChhLmRhdGEudGl0bGUgPCBiLmRhdGEudGl0bGUpIHsgcmV0dXJuIC0xOyB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGEuZGF0YS50aXRsZSA+IGIuZGF0YS50aXRsZSkgeyByZXR1cm4gMTsgfVxyXG4gICAgICAgICAgICBlbHNlIHtyZXR1cm4gMDt9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vc29ydCB0aGUgYXJyYXkgdG8gaW5jcmVhc2UgdmlzdWFsIGVmZmljaWVuY3ksIHBhcnNlIHRocm91Z2ggZWFjaCBzdWJBcnJheVxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IG5vZGVBcnJheS5sZW5ndGggLSAxOyBpKyspe1xyXG4gICAgICAgIHZhciBzdWJBcnJheSA9IG5vZGVBcnJheVtpXTtcclxuICAgICAgICB2YXIgaW5zZXJ0SW5kZXggPSAwO1xyXG4gICAgICAgIC8vcGFyc2UgdGhyb3VnaCBlYWNoIGVsZW1lbnQgdmVydGljYWxseVxyXG4gICAgICAgIGZvcih2YXIgaiA9IDA7IGogPCBzdWJBcnJheS5sZW5ndGg7IGorKyl7XHJcbiAgICAgICAgICAgIHZhciBkZWJ1Z1RleHQxID0gc3ViQXJyYXlbal0uZGF0YS5uYW1lO1xyXG4gICAgICAgICAgICAvL3BhcnNlIHRocm91Z2ggbmV4dCBBcnJheVxyXG4gICAgICAgICAgICB2YXIgbmV4dEFycmF5ID0gbm9kZUFycmF5W2kgKyAxXTtcclxuICAgICAgICAgICAgZm9yKHZhciBrID0gaW5zZXJ0SW5kZXg7IGsgPCBuZXh0QXJyYXkubGVuZ3RoOyBrKyspe1xyXG4gICAgICAgICAgICAgICAgdmFyIGRlYnVnVGV4dDIgPSBuZXh0QXJyYXlba10uZGF0YS5uYW1lO1xyXG4gICAgICAgICAgICAgICAgLy9wYXJzZSB0aHJvdWdoIGZvcndhcmRDb25uZWN0aW9uXHJcbiAgICAgICAgICAgICAgICBmb3IodmFyIGwgPSAwOyBsIDwgc3ViQXJyYXlbal0uY29ubmVjdGlvbkZvcndhcmQubGVuZ3RoOyBsKyspe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkZWJ1Z1RleHQzID0gc3ViQXJyYXlbal0uY29ubmVjdGlvbkZvcndhcmRbbF0uZGF0YS5uYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgLy9pZiB0aGVyZSdzIGEgbWF0Y2hcclxuICAgICAgICAgICAgICAgICAgICBpZihzdWJBcnJheVtqXS5jb25uZWN0aW9uRm9yd2FyZFtsXS5kYXRhLm5hbWUgPT09IG5leHRBcnJheVtrXS5kYXRhLm5hbWUpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3N3YXAgaW5kaWNlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3dhcEhvbGRlciA9IG5leHRBcnJheVtpbnNlcnRJbmRleF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRBcnJheVtpbnNlcnRJbmRleF0gPSBuZXh0QXJyYXlba107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRBcnJheVtrXSA9IHN3YXBIb2xkZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydEluZGV4Kys7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvL2Fzc2lnbiBwaXhlbCBwb2ludCBwb3NpdGlvbnMgYmFzZWQgb24gcGxhY2VtZW50IGluIHRoZSAyZCBhcnJheVxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IG5vZGVBcnJheS5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgdmFyIHN1YkFycmF5ID0gbm9kZUFycmF5W2ldO1xyXG4gICAgICAgIGZvcih2YXIgaiA9IDA7IGogPCBzdWJBcnJheS5sZW5ndGg7IGorKyl7XHJcbiAgICAgICAgICAgIC8vYXNzaWduIHBvc2l0aW9uIHZhbHVlc1xyXG4gICAgICAgICAgICBub2RlQXJyYXlbaV1bal0ucG9zaXRpb24gPSBuZXcgUG9pbnQoaSAqIDMwMCwgaiAqIDIwMCAtICgoKHN1YkFycmF5Lmxlbmd0aCAtIDEpICogMjAwKSAvIDIpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vcHJvY2VzcyBsb2NhbFN0b3JhZ2UgZGF0YSBhbmQgZm9ybWF0IGludG8gYW4gYXJyYXlcclxuICAgIHZhciBwcm9ncmVzc1N0cmluZyA9IGxvY2FsU3RvcmFnZS5wcm9ncmVzcztcclxuICAgIFxyXG4gICAgLy9rZWVwIHRyYWNrIG9mIHdoaWNoIGNodW5rcyBhcmUgbGVmdG92ZXIgXHJcbiAgICB2YXIgc2F2ZURhdGFMaXN0ID0gbG9jYWxTdG9yYWdlLnByb2dyZXNzO1xyXG4gICAgLy9sb2FkIHN0YXR1cyBmcm9tIGxvY2FsU3RvcmFnZSwgaXRlcmF0ZSB0aHJvdWdoIGV2ZXJ5IG5vZGVcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBub2RlQXJyYXkubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgIHZhciBzdWJBcnJheSA9IG5vZGVBcnJheVtpXTtcclxuICAgICAgICBmb3IodmFyIGogPSAwOyBqIDwgc3ViQXJyYXkubGVuZ3RoOyBqKyspe1xyXG4gICAgICAgICAgICAvL3Byb2Nlc3MgZXh0ZW5zaW9ucyBzZXBhcmF0ZWx5XHJcbiAgICAgICAgICAgIGlmKHN1YkFycmF5W2pdLnR5cGUgPT09IFwiZXh0ZW5zaW9uXCIpe31cclxuICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgIC8vZ2V0IHBvc2l0aW9uIG9mIHRoZSBpZCBpbiBsb2NhbFN0b3JhZ2VcclxuICAgICAgICAgICAgICAgIHZhciBpZEluZGV4ID0gcHJvZ3Jlc3NTdHJpbmcuaW5kZXhPZihzdWJBcnJheVtqXS5kYXRhLl9pZCk7XHJcbiAgICAgICAgICAgICAgICAvL2lmIHRoZSBub2RlIGlkIGNhbm5vdCBiZSBmb3VuZCBpbiBsb2NhbFN0b3JhZ2VcclxuICAgICAgICAgICAgICAgIGlmKGlkSW5kZXggPT09IC0xKXtcclxuICAgICAgICAgICAgICAgICAgICAvL2lmIGl0J3MgYSBzdGFydCBub2RlXHJcbiAgICAgICAgICAgICAgICAgICAgaWYoaSA9PT0gMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YkFycmF5W2pdLnN0YXR1cyA9IFwiMVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvL25vdCBhIHN0YXJ0IG5vZGVcclxuICAgICAgICAgICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJBcnJheVtqXS5zdGF0dXMgPSBcIjBcIjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvL25vZGUgaWQgZXhpc3RzIGluIGxvY2FsU3RvcmFnZSwgZ2V0IGFuZCBhcHBseSB0aGUgc3RhdHVzXHJcbiAgICAgICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIHN1YkFycmF5W2pdLnN0YXR1cyA9IHByb2dyZXNzU3RyaW5nWyhpZEluZGV4ICsgc3ViQXJyYXlbal0uZGF0YS5faWQubGVuZ3RoKV07XHJcbiAgICAgICAgICAgICAgICAgICAgLy9kb2VzIHRoaXMgbm9kZSBoYXZlIGV4dGVuc2lvbnM/IFdoYXQgbWVhc3VyZXMgc2hvdWxkIGJlIHRha2VuIHRvIGVuc3VyZSB0aGF0IHRoZXkgZHJhdyBjb3JyZWN0bHk/XHJcbiAgICAgICAgICAgICAgICAgICAgLy9pdGVyYXRlIHRob3VnaCBlYWNoIGZvcndhcmQgY29ubmVjdGlvblxyXG4gICAgICAgICAgICAgICAgICAgIGZvcih2YXIgayA9IDA7IGsgPCBzdWJBcnJheVtqXS5jb25uZWN0aW9uRm9yd2FyZC5sZW5ndGg7IGsrKyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0YXJnZXROb2RlID0gc3ViQXJyYXlbal0uY29ubmVjdGlvbkZvcndhcmRba107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlKHRhcmdldE5vZGUudHlwZSA9PT0gXCJleHRlbnNpb25cIil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXROb2RlLnN0YXR1cyA9IHN1YkFycmF5W2pdLnN0YXR1cztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldE5vZGUgPSB0YXJnZXROb2RlLmNvbm5lY3Rpb25Gb3J3YXJkWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIC8vYXQgdGhpcyBwb2ludCB0aGUgY3VycmVudCBzYXZlIGRhdGEgY2h1bmsgaXMgY29uZmlybWVkIHRvIGJlIHByZXNlbnQsIGV4Y2lzZSBmcm9tIHRoZSBwcm9ncmVzcyB0cmluZ1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVEYXRhTGlzdCA9IHNhdmVEYXRhTGlzdC5yZXBsYWNlKHN1YkFycmF5W2pdLmRhdGEuX2lkICsgc3ViQXJyYXlbal0uc3RhdHVzICsgXCIsXCIsIFwiXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICB2YXIgcHJvZ3Jlc3NtYXJrZXIgPSBwcm9ncmVzc1N0cmluZztcclxuICAgIC8vc3BsaXQgdGhlIHNhdmUgZGF0YSBsaXN0IHN0cmluZyBhbmQgcGFyc2UgdGhyb3VnaCBsb2NhbFN0b3JhZ2VcclxuICAgIGlmKHNhdmVEYXRhTGlzdCAhPT0gXCJcIil7XHJcbiAgICAgICAgc2F2ZURhdGFMaXN0ID0gc2F2ZURhdGFMaXN0LnN1YnN0cmluZygwLCBzYXZlRGF0YUxpc3QubGVuZ3RoIC0gMSk7XHJcbiAgICB9XHJcbiAgICB2YXIgc3BsaXRFeHRyYXMgPSBzYXZlRGF0YUxpc3Quc3BsaXQoXCIsXCIpO1xyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHNwbGl0RXh0cmFzLmxlbmd0aDsgaSsrKXtcclxuICAgICAgICBwcm9ncmVzc1N0cmluZyA9IHByb2dyZXNzU3RyaW5nLnJlcGxhY2Uoc3BsaXRFeHRyYXNbaV0gKyBcIixcIiwgXCJcIik7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxvY2FsU3RvcmFnZS5wcm9ncmVzcyA9IHByb2dyZXNzU3RyaW5nO1xyXG4gICAgXHJcbiAgICBcclxuICAgIHRoaXMubm9kZUFycmF5ID0gbm9kZUFycmF5O1xyXG4gICAgXHJcbiAgICBcclxuICAgIHBhaW50ZXIgPSBuZXcgRHJhd0xpYigpO1xyXG4gICAgXHJcbiAgICAvL21vdmUgdGhpcyBib2FyZCBiYXNlZCBvbiBzYXZlZCBjb29raWUgZGF0YVxyXG4gICAgaWYobG9jYWxTdG9yYWdlLmFjdGl2ZU5vZGUgIT09IFwiMFwiKXtcclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgbm9kZUFycmF5Lmxlbmd0aDsgaSsrKXtcclxuICAgICAgICAgICAgdmFyIHN1YkFycmF5ID0gbm9kZUFycmF5W2ldO1xyXG4gICAgICAgICAgICBmb3IodmFyIGogPSAwOyBqIDwgc3ViQXJyYXkubGVuZ3RoOyBqKyspe1xyXG4gICAgICAgICAgICAgICAgaWYoc3ViQXJyYXlbal0uZGF0YS5faWQgPT09IGxvY2FsU3RvcmFnZS5hY3RpdmVOb2RlKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdmUoc3ViQXJyYXlbal0ucG9zaXRpb24ueCwgc3ViQXJyYXlbal0ucG9zaXRpb24ueSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG52YXIgX2dlbmVyYXRlTm9kZUFycmF5ID0gZnVuY3Rpb24gKHBTdGFnaW5nQXJyYXksIHBTdGFydEFycmF5KSB7XHJcbiAgICB2YXIgbm9kZUFycmF5RXhwb3J0O1xyXG4gICAgXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgcFN0YXJ0QXJyYXkubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgIF9jb25uZWN0KHBTdGFnaW5nQXJyYXlbaV0sIG5vZGVBcnJheUV4cG9ydCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIFxyXG4gICAgcmV0dXJuIG5vZGVBcnJheUV4cG9ydDtcclxufTtcclxuXHJcbkJvYXJkLnByb3RvdHlwZS5tb3ZlID0gZnVuY3Rpb24ocFgsIHBZKXtcclxuICAgIHRoaXMucG9zaXRpb24ueCArPSBwWDtcclxuICAgIHRoaXMucG9zaXRpb24ueSArPSBwWTtcclxufTtcclxuXHJcbi8vY29udGV4dCwgY2VudGVyIHBvaW50LCB1c2FibGUgaGVpZ2h0XHJcbkJvYXJkLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY2FudmFzU3RhdGUpe1xyXG4gICAgY2FudmFzU3RhdGUuY3R4LnNhdmUoKTtcclxuICAgIC8vdHJhbnNsYXRlIHRvIHRoZSBjZW50ZXIgb2YgdGhlIHNjcmVlblxyXG4gICAgY2FudmFzU3RhdGUuY3R4LnRyYW5zbGF0ZShjYW52YXNTdGF0ZS5jZW50ZXIueCAtIHRoaXMucG9zaXRpb24ueCwgY2FudmFzU3RhdGUuY2VudGVyLnkgLSB0aGlzLnBvc2l0aW9uLnkpO1xyXG4gICAgLy9kcmF3IG5vZGVzXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5ub2RlQXJyYXkubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgIHZhciBzdWJBcnJheSA9IHRoaXMubm9kZUFycmF5W2ldO1xyXG4gICAgICAgIGZvcih2YXIgaiA9IDA7IGogPCBzdWJBcnJheS5sZW5ndGg7IGorKyl7XHJcbiAgICAgICAgICAgIHRoaXMubm9kZUFycmF5W2ldW2pdLmRyYXcoY2FudmFzU3RhdGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGNhbnZhc1N0YXRlLmN0eC5yZXN0b3JlKCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJvYXJkOyAiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIEJvYXJkID0gcmVxdWlyZSgnLi9Cb2FyZC5qcycpO1xyXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vUG9pbnQuanMnKTtcclxudmFyIERyYXdMaWIgPSByZXF1aXJlKCcuLi8uLi9saWJyYXJpZXMvRHJhd0xpYi5qcycpO1xyXG52YXIgTGVzc29uTm9kZSA9IHJlcXVpcmUoJy4vTGVzc29uTm9kZS5qcycpO1xyXG52YXIgUGFyc2VyID0gcmVxdWlyZSgnLi9QYXJzZXIuanMnKTtcclxudmFyIFV0aWxpdGllcyA9IHJlcXVpcmUoJy4uLy4uL2xpYnJhcmllcy9VdGlsaXRpZXMuanMnKTtcclxuXHJcbnZhciB1dGlsaXR5O1xyXG52YXIgcGFpbnRlcjtcclxudmFyIHBhcnNlcjtcclxuXHJcbnZhciBhY3RpdmVCb2FyZDtcclxudmFyIGJvYXJkTG9hZGVkO1xyXG5cclxudmFyIG1vdXNlVGFyZ2V0O1xyXG5cclxudmFyIG5vZGVBcnJheTtcclxuXHJcblxyXG5mdW5jdGlvbiBCb2FyZFBoYXNlKHBUYXJnZXRVUkwpe1xyXG4gICAgLy9cclxuICAgIGJvYXJkTG9hZGVkID0gZmFsc2U7XHJcbiAgICBtb3VzZVRhcmdldCA9IDA7XHJcbiAgICBcclxuICAgIC8vaW5zdGFudGlhdGUgbGlicmFyaWVzXHJcbiAgICBwYWludGVyID0gbmV3IERyYXdMaWIoKTtcclxuICAgIHV0aWxpdHkgPSBuZXcgVXRpbGl0aWVzKCk7XHJcbiAgICBcclxuICAgIC8vcmVhZHMgZGF0YSBmcm9tIHRhcmdldCBVUkwgYW5kIGNvbm5lY3RzIGNhbGxiYWNrXHJcbiAgICBwYXJzZXIgPSBuZXcgUGFyc2VyKHBUYXJnZXRVUkwsIGJvYXJkTG9hZGVkQ2FsbGJhY2spO1xyXG4gICAgXHJcbiAgICBcclxuICAgIC8vaW5zZXJ0IGh0bWxcclxuICAgIHBvcHVsYXRlRHluYW1pY0NvbnRlbnQoKTtcclxufVxyXG5cclxuLy9zZXRzIGFjdGl2ZUJvYXJkIGFuZCBnaXZlcyB0aGUgZ28gYWhlYWQgZm9yIHRoZSBsb29wIHRvIGV4ZWN1dGVcclxuZnVuY3Rpb24gYm9hcmRMb2FkZWRDYWxsYmFjayhwSlNPTkVsZW1lbnRzKXtcclxuICAgIGFjdGl2ZUJvYXJkID0gbmV3IEJvYXJkKG5ldyBQb2ludCgwLDApLCBwSlNPTkVsZW1lbnRzKTtcclxuICAgIGJvYXJkTG9hZGVkID0gdHJ1ZTtcclxufVxyXG5cclxuLy9wb3B1bGF0ZSB0aGUgZHluYW1pYyBjb250ZW50IGRpdiBpbiBpbmRleCB3aXRoIHRoaXMgcGhhc2UncyBzcGVjaWZpYyBodG1sXHJcbmZ1bmN0aW9uIHBvcHVsYXRlRHluYW1pY0NvbnRlbnQoKXtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZHluYW1pY0NvbnRlbnRcIikuaW5uZXJIVE1MID0gXCI8ZGl2IGlkPVxcXCJkZXRhaWxMYXllclxcXCIgY2xhc3M9XFxcImhpZGRlbkxheWVyXFxcIj48ZGl2IGlkPVxcXCJkZXRhaWxCbGluZGVyXFxcIj48L2Rpdj48ZGl2IGlkPVxcXCJkZXRhaWxXaW5kb3dcXFwiIGNsYXNzPVxcXCJoaWRkZW5XaW5kb3dcXFwiPjxkaXYgaWQ9XFxcImR3QmFubmVyXFxcIj48aW1nIGlkPVxcXCJkd0Jhbm5lckltYWdlXFxcIiBzcmM9XFxcIlxcXCI+PGRpdiBpZD1cXFwiZHdCYW5uZXJEYXJrZXJcXFwiPjwvZGl2PjxwIGlkPVxcXCJkd0Jhbm5lclRpdGxlXFxcIj5UZXN0PC9wPjwvZGl2PjxkaXYgaWQ9XFxcImR3VGFnc1xcXCI+PC9kaXY+PGRpdiBpZD1cXFwiZHdEZXNjcmlwdGlvblxcXCI+PHAgaWQ9XFxcImR3RGVzY3JpcHRpb25UZXh0XFxcIj5UZXN0PC9wPjwvZGl2PjxkaXYgaWQ9XFxcImR3UmVzb3VyY2VzXFxcIj48L2Rpdj48ZGl2IGlkPVxcXCJkd0xhdW5jaGVyXFxcIj48L2Rpdj48cCBpZD1cXFwiZGV0YWlsWFxcXCI+eDwvcD48L2Rpdj48ZGl2IGlkPVxcXCJsb2NrV2luZG93XFxcIiBjbGFzcz1cXFwiaGlkZGVuV2luZG93XFxcIj48ZGl2IGlkPVxcXCJsb2NrRGl2VG9wXFxcIj48aDIgaWQ9XFxcImxvY2tUaXRsZVxcXCI+PC9oMj48cCBpZD1cXFwibG9ja1hcXFwiPng8L3A+PC9kaXY+PGRpdiBpZD1cXFwibG9ja0RpdkJvdHRvbVxcXCI+PHAgaWQ9XFxcImxvY2tMaXN0XFxcIj48L3A+PC9kaXY+PC9kaXY+PC9kaXY+XCI7XHJcbiAgICBcclxuICAgIC8vYXNzaWduIGEgY2xpY2sgZXZlbnQgdG8gdGhlIGRldGFpbCBibGluZGVyIGVsZW1lbnQgdGhhdCBpcyB1c2VkIHRvIGRhcmtlbiB0aGUgc2NyZWVuIHdoZW4gaW5mb3JtYXRpb24gaXMgYmVpbmcgZGlzcGxheWVkXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRldGFpbEJsaW5kZXJcIikub25tb3VzZWRvd24gPSBmdW5jdGlvbigpIHsgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZXRhaWxMYXllclwiKS5jbGFzc05hbWUgPSBcImhpZGRlbkxheWVyXCI7IH1cclxufVxyXG5cclxuLy9wYXNzaW5nIGNvbnRleHQsIGNhbnZhcywgZGVsdGEgdGltZSwgY2VudGVyIHBvaW50LCB1c2FibGUgaGVpZ2h0LCBtb3VzZSBzdGF0ZVxyXG5Cb2FyZFBoYXNlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihtb3VzZVN0YXRlLCBjYW52YXNTdGF0ZSl7XHJcbiAgICBpZihib2FyZExvYWRlZCl7XHJcbiAgICAgICAgdGhpcy5hY3QobW91c2VTdGF0ZSk7XHJcbiAgICAgICAgLy9jb250ZXh0LCBjZW50ZXIgcG9pbnQsIHVzYWJsZSBoZWlnaHRcclxuICAgICAgICB0aGlzLmRyYXcoY2FudmFzU3RhdGUpO1xyXG4gICAgfVxyXG4gICAgZWxzZXtcclxuICAgICAgICBjYW52YXNTdGF0ZS5jdHguc2F2ZSgpO1xyXG4gICAgICAgIGNhbnZhc1N0YXRlLmN0eC5mb250ID0gXCI0MHB4IEFyaWFsXCI7XHJcbiAgICAgICAgY2FudmFzU3RhdGUuY3R4LnRleHRCYXNlbGluZSA9IFwibWlkZGxlXCI7XHJcbiAgICAgICAgY2FudmFzU3RhdGUuY3R4LnRleHRBbGlnbiA9IFwiY2VudGVyXCI7XHJcbiAgICAgICAgY2FudmFzU3RhdGUuY3R4LmZpbGxUZXh0KFwiTG9hZGluZy4uLlwiLCBjYW52YXNTdGF0ZS5jZW50ZXIueCwgY2FudmFzU3RhdGUuY2VudGVyLnkpO1xyXG4gICAgICAgIGNhbnZhc1N0YXRlLmN0eC5yZXN0b3JlKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbkJvYXJkUGhhc2UucHJvdG90eXBlLmFjdCA9IGZ1bmN0aW9uKG1vdXNlU3RhdGUpe1xyXG4gICAgdmFyIGJyb2tlbiA9IGZhbHNlO1xyXG4gICAgLy9tb3VzZSBoYW5kbGluZyBmb3IgdGFyZ2V0IGNhbGN1bGF0aW9uXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgYWN0aXZlQm9hcmQubm9kZUFycmF5Lmxlbmd0aDsgaSsrKXtcclxuICAgICAgICBcclxuICAgICAgICBpZihicm9rZW4pe1xyXG4gICAgICAgICAgICBicm9rZW4gPSBmYWxzZTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBzdWJBcnJheSA9IGFjdGl2ZUJvYXJkLm5vZGVBcnJheVtpXTtcclxuICAgICAgICBmb3IodmFyIGogPSAwOyBqIDwgc3ViQXJyYXkubGVuZ3RoOyBqKyspe1xyXG4gICAgICAgICAgICB2YXIgdGFyZ2V0TGVzc29uTm9kZSA9IGFjdGl2ZUJvYXJkLm5vZGVBcnJheVtpXVtqXTtcclxuICAgICAgICAgICAgdXRpbGl0eS5tb3VzZUludGVyc2VjdChtb3VzZVN0YXRlLCB0YXJnZXRMZXNzb25Ob2RlLCBhY3RpdmVCb2FyZC5wb3NpdGlvbiwgMCk7XHJcbiAgICAgICAgICAgIGlmKHRhcmdldExlc3Nvbk5vZGUubW91c2VPdmVyID09PSB0cnVlKXtcclxuICAgICAgICAgICAgICAgIG1vdXNlVGFyZ2V0ID0gdGFyZ2V0TGVzc29uTm9kZTtcclxuICAgICAgICAgICAgICAgIGJyb2tlbiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgbW91c2VUYXJnZXQgPSAwO1xyXG4gICAgICAgICAgICB9IFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vbW91c2UgaGFuZGxpbmcgZm9yIGJvYXJkIG1vdmVtZW50XHJcbiAgICBpZihtb3VzZVN0YXRlLm1vdXNlRG93biA9PT0gdHJ1ZSAmJiBtb3VzZVN0YXRlLmxhc3RNb3VzZURvd24gPT09IHRydWUpe1xyXG4gICAgICAgIGFjdGl2ZUJvYXJkLm1vdmUobW91c2VTdGF0ZS5sYXN0UG9zaXRpb24ueCAtIG1vdXNlU3RhdGUucG9zaXRpb24ueCwgbW91c2VTdGF0ZS5sYXN0UG9zaXRpb24ueSAtIG1vdXNlU3RhdGUucG9zaXRpb24ueSk7XHJcbiAgICB9XHJcbiAgICAvL21vdXNlIGhhbmRsaW5nIGZvciBjbGlja2luZ1xyXG4gICAgaWYobW91c2VTdGF0ZS5tb3VzZURvd24gPT09IHRydWUgJiYgbW91c2VTdGF0ZS5sYXN0TW91c2VEb3duID09PSBmYWxzZSl7XHJcbiAgICAgICAgaWYobW91c2VUYXJnZXQgIT0gMCl7XHJcbiAgICAgICAgICAgIG1vdXNlVGFyZ2V0LmNsaWNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZGVidWdMaW5lJykuaW5uZXJIVE1MID0gXCJtb3VzZVBvc2l0aW9uOiB4ID0gXCIgKyBtb3VzZVN0YXRlLnJlbGF0aXZlUG9zaXRpb24ueCArIFwiLCB5ID0gXCIgKyBtb3VzZVN0YXRlLnJlbGF0aXZlUG9zaXRpb24ueSArIFxyXG4gICAgXCI8YnI+Q3VycmVudCBDbGlja2VkID0gXCIgKyBtb3VzZVN0YXRlLm1vdXNlRG93biArIFxyXG4gICAgXCIgICBMYXN0IENsaWNrZWQgPSBcIiArIG1vdXNlU3RhdGUubGFzdE1vdXNlRG93biArIFxyXG4gICAgXCI8YnI+TW91c2VUYXJnZXQgPSBcIiArIG1vdXNlVGFyZ2V0O1xyXG59XHJcblxyXG5Cb2FyZFBoYXNlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY2FudmFzU3RhdGUpe1xyXG4gICAgLy9kcmF3IG5vZGVzXHJcbiAgICBhY3RpdmVCb2FyZC5kcmF3KGNhbnZhc1N0YXRlKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCb2FyZFBoYXNlOyIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgRHJhd0xpYiA9IHJlcXVpcmUoJy4uLy4uL2xpYnJhcmllcy9EcmF3bGliLmpzJyk7XHJcblxyXG52YXIgcGFpbnRlcjtcclxudmFyIHNvdXJjZU5vZGU7XHJcblxyXG4vL3BhcmFtZXRlciBpcyBhIHBvaW50IHRoYXQgZGVub3RlcyBzdGFydGluZyBwb3NpdGlvblxyXG5mdW5jdGlvbiBFeHRlbnNpb25Ob2RlKHBOYW1lLCBwQ29ubmVjdGlvbkZvcndhcmQsIHBTb3VyY2Upe1xyXG4gICAgcGFpbnRlciA9IG5ldyBEcmF3TGliKCk7XHJcbiAgICBzb3VyY2VOb2RlID0gcFNvdXJjZTtcclxuICAgIFxyXG4gICAgdGhpcy5kYXRhID0ge307XHJcbiAgICAvL3RoaXMuZGF0YS5faWQgPSBwU291cmNlLmRhdGEuX2lkO1xyXG4gICAgdGhpcy5oaWdobGlnaHRlZCA9IGZhbHNlO1xyXG4gICAgLy90aGlzLmRhdGEubmFtZSA9IHBOYW1lO1xyXG4gICAgdGhpcy5jb25uZWN0aW9uRm9yd2FyZCA9IFtdO1xyXG4gICAgdGhpcy5jb25uZWN0aW9uRm9yd2FyZC5wdXNoKHBDb25uZWN0aW9uRm9yd2FyZCk7XHJcbiAgICB0aGlzLmNvbm5lY3Rpb25CYWNrd2FyZCA9IFtdO1xyXG4gICAgdGhpcy5jb25uZWN0aW9uQmFja3dhcmQucHVzaChwU291cmNlKTtcclxuICAgIHRoaXMudHlwZSA9IFwiZXh0ZW5zaW9uXCI7XHJcbn1cclxuXHJcbkV4dGVuc2lvbk5vZGUucHJvdG90eXBlLnNldFN0YXR1cyA9IGZ1bmN0aW9uKHBTdGF0dXMpe1xyXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLmNvbm5lY3Rpb25CYWNrd2FyZFswXS5zdGF0dXM7XHJcbiAgICB0aGlzLmNvbm5lY3Rpb25Gb3J3YXJkWzBdLnNldFN0YXR1cyhwU3RhdHVzKVxyXG59XHJcblxyXG5FeHRlbnNpb25Ob2RlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24ocENhbnZhc1N0YXRlKXtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHguc2F2ZSgpO1xyXG4gICAgICAgIGlmKHRoaXMuaGlnaGxpZ2h0ZWQpe1xyXG4gICAgICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LnNoYWRvd0NvbG9yID0gJyMwMDY2ZmYnO1xyXG4gICAgICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LnNoYWRvd0JsdXIgPSA3O1xyXG4gICAgICAgICAgICBpZih0aGlzLmNvbm5lY3Rpb25Gb3J3YXJkWzBdLnR5cGUgPT09IFwiZXh0ZW5zaW9uXCIpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25uZWN0aW9uRm9yd2FyZFswXS5oaWdobGlnaHRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICBlbHNle1xyXG4gICAgICAgIGlmKHRoaXMuY29ubmVjdGlvbkZvcndhcmRbMF0udHlwZSA9PT0gXCJleHRlbnNpb25cIil7XHJcbiAgICAgICAgICAgIHRoaXMuY29ubmVjdGlvbkZvcndhcmRbMF0uaGlnaGxpZ2h0ZWQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGlmKHRoaXMuY29ubmVjdGlvbkJhY2t3YXJkWzBdLnN0YXR1cyA9PT0gXCIyXCIgfHwgdGhpcy5jb25uZWN0aW9uQmFja3dhcmRbMF0uc3RhdHVzID09PSBcIjRcIil7XHJcbiAgICAgICAgcGFpbnRlci5saW5lKHBDYW52YXNTdGF0ZS5jdHgsIHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55LCB0aGlzLmNvbm5lY3Rpb25Gb3J3YXJkWzBdLnBvc2l0aW9uLngsIHRoaXMuY29ubmVjdGlvbkZvcndhcmRbMF0ucG9zaXRpb24ueSwgMiwgXCJibGFja1wiKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5yZXN0b3JlKCk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRXh0ZW5zaW9uTm9kZTsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIERyYXdMaWIgPSByZXF1aXJlKCcuLi8uLi9saWJyYXJpZXMvRHJhd2xpYi5qcycpO1xyXG52YXIgVXRpbGl0aWVzID0gcmVxdWlyZSgnLi4vLi4vbGlicmFyaWVzL1V0aWxpdGllcy5qcycpO1xyXG5cclxudmFyIHBhaW50ZXI7XHJcbnZhciB1dGlsaXR5O1xyXG5cclxuLy9wYXJhbWV0ZXIgaXMgYSBwb2ludCB0aGF0IGRlbm90ZXMgc3RhcnRpbmcgcG9zaXRpb25cclxuZnVuY3Rpb24gTGVzc29uTm9kZShzdGFydFBvc2l0aW9uLCBKU09OQ2h1bmspeyAgICBcclxuICAgIHRoaXMuaW1hZ2VMb2FkZWQgPSBmYWxzZTtcclxuICAgIHBhaW50ZXIgPSBuZXcgRHJhd0xpYigpO1xyXG4gICAgdXRpbGl0eSA9IG5ldyBVdGlsaXRpZXMoKTtcclxuICAgIFxyXG4gICAgdGhpcy5wb3NpdGlvbiA9IHN0YXJ0UG9zaXRpb247XHJcbiAgICB0aGlzLm1vdXNlT3ZlciA9IGZhbHNlO1xyXG4gICAgdGhpcy5oaWdobGlnaHRlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5zY2FsZUZhY3RvciA9IDE7XHJcbiAgICB0aGlzLnR5cGUgPSBcIkxlc3Nvbk5vZGVcIjtcclxuICAgIHRoaXMuZGF0YSA9IEpTT05DaHVuaztcclxuICAgIFxyXG4gICAgdGhpcy5wbGFjZW1lbnQgPSAxO1xyXG4gICAgXHJcbiAgICAvL3BhcnNlIEpTT05DaHVuayBmb3IgY29tcGxldGVuZXNzXHJcbiAgICBcclxuICAgIFxyXG4gICAgLy9pbWFnZSBsb2FkaW5nIGFuZCByZXNpemluZ1xyXG4gICAgdmFyIHRlbXBJbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG4gICAgXHJcbiAgICB0ZW1wSW1hZ2UuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIF9sb2FkQWN0aW9uLmJpbmQodGhpcyksIGZhbHNlKTtcclxuICAgIHRlbXBJbWFnZS5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIF9lcnJvckFjdGlvbi5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcbiAgICBcclxuICAgIHRlbXBJbWFnZS5zcmMgPSBKU09OQ2h1bmsuaW1hZ2UuaWNvbjtcclxufVxyXG5cclxuXHJcbnZhciBfbG9hZEFjdGlvbiA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICB0aGlzLmltYWdlID0gZS50YXJnZXQ7XHJcbiAgICB0aGlzLndpZHRoID0gZS50YXJnZXQubmF0dXJhbFdpZHRoO1xyXG4gICAgdGhpcy5oZWlnaHQgPSBlLnRhcmdldC5uYXR1cmFsSGVpZ2h0O1xyXG4gICAgXHJcbiAgICB2YXIgbWF4RGltZW5zaW9uID0gMTAwO1xyXG4gICAgXHJcbiAgICBpZih0aGlzLndpZHRoIDwgbWF4RGltZW5zaW9uICYmIHRoaXMuaGVpZ2h0IDwgbWF4RGltZW5zaW9uKXtcclxuICAgICAgICB2YXIgeDtcclxuICAgICAgICBpZih0aGlzLndpZHRoID4gdGhpcy5oZWlnaHQpe1xyXG4gICAgICAgICAgICB4ID0gbWF4RGltZW5zaW9uIC8gdGhpcy53aWR0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgeCA9IG1heERpbWVuc2lvbiAvIHRoaXMuaGVpZ2h0O1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLndpZHRoID0gdGhpcy53aWR0aCAqIHg7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSB0aGlzLmhlaWdodCAqIHg7XHJcbiAgICB9XHJcbiAgICBpZih0aGlzLndpZHRoID4gbWF4RGltZW5zaW9uIHx8IHRoaXMuaGVpZ2h0ID4gbWF4RGltZW5zaW9uKXtcclxuICAgICAgICB2YXIgeDtcclxuICAgICAgICBpZih0aGlzLndpZHRoID4gdGhpcy5oZWlnaHQpe1xyXG4gICAgICAgICAgICB4ID0gdGhpcy53aWR0aCAvIG1heERpbWVuc2lvbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgeCA9IHRoaXMuaGVpZ2h0IC8gbWF4RGltZW5zaW9uO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLndpZHRoID0gdGhpcy53aWR0aCAvIHg7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSB0aGlzLmhlaWdodCAvIHg7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRoaXMuaW1hZ2VMb2FkZWQgPSB0cnVlO1xyXG59O1xyXG52YXIgX2Vycm9yQWN0aW9uID0gZnVuY3Rpb24oZSl7XHJcbiAgICAvL2FsZXJ0KFwiVGhlcmUgd2FzIGFuIGVycm9yIGxvYWRpbmcgYW4gaW1hZ2UuXCIpO1xyXG4gICAgdGhpcy5pbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG4gICAgdGhpcy5pbWFnZS5zcmMgPSBcIi4uL2NvbnRlbnQvdWkvbWlzc2luZ1RodW1ibmFpbC5naWZcIjtcclxuICAgIHRoaXMud2lkdGggPSAxMDA7XHJcbiAgICB0aGlzLmhlaWdodCA9IDEwMDtcclxuICAgIHRoaXMuaW1hZ2VMb2FkZWQgPSB0cnVlO1xyXG59O1xyXG5cclxuXHJcblxyXG52YXIgX2hhbmRsZVN0YXR1cyA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAvL2ZpbHRlciB0aHJvdWdoIGxvY2FsU3RvcmFnZVxyXG4gICAgdmFyIHByb2dyZXNzU3RyaW5nID0gbG9jYWxTdG9yYWdlLnByb2dyZXNzO1xyXG4gICAgXHJcbiAgICBcclxuICAgIGNvbnNvbGUubG9nKFwiVGhpcyBpcyB0aGUgc3RhdHVzIGJlZm9yZSBjaGFuZ2U6IFwiICsgdGhpcy5zdGF0dXMpO1xyXG4gICAgLy9FYWNoIHN0YXR1cyBtZWFucyBzb21ldGhpbmcgZGlmZmVyZW50XHJcbiAgICAvLzA6bm90IHN0YXJ0IG5vZGVcclxuICAgIC8vMTpzdGFydCBub2RlXHJcbiAgICAvLzI6XHJcbiAgICAvLzM6XHJcbiAgICAvLzQ6XHJcbiAgICBcclxuICAgIFxyXG4gICAgXHJcbiAgICAvL3dpbGwgbmV2ZXIgb2NjdXIgd2hlbiAwXHJcbiAgICBpZih0aGlzLnN0YXR1cyA9PT0gXCIxXCIpe1xyXG4gICAgICAgIC8vY2hhbmdlIHRvIHNvbHZlZCBzdGF0dXNcclxuICAgICAgICB0aGlzLnN0YXR1cyA9IFwiMlwiO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vaXRlcmF0ZSB0aHJvdWdoIGVhY2ggZm9yd2FyZCBjb25uZWN0aW9uIGFuZCBoYW5kbGUgYWNjb3JkaW5nbHlcclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5jb25uZWN0aW9uRm9yd2FyZC5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgIHZhciBjb25maXJtZWRDbGVhciA9IHRydWU7XHJcbiAgICAgICAgICAgIC8vaXRlcmF0ZSB0aHJvdWdoIHRoYXQgZm9yd2FyZCBjb25uZWN0aW9uJ3MgYmFja3dhcmRzIGNvbm5lY3Rpb25zIGFuZCBtYWtlIHN1cmUgdGhhdCBhbGwgYXJlIGluIGEgY2xlYXJlZCBzdGF0ZVxyXG4gICAgICAgICAgICBmb3IodmFyIGogPSAwOyBqIDwgdGhpcy5jb25uZWN0aW9uRm9yd2FyZFtpXS5jb25uZWN0aW9uQmFja3dhcmQubGVuZ3RoOyBqKyspe1xyXG4gICAgICAgICAgICAgICAgdmFyIHRhcmdldFN0YXR1cyA9IHRoaXMuY29ubmVjdGlvbkZvcndhcmRbaV0uY29ubmVjdGlvbkJhY2t3YXJkW2pdLnN0YXR1cztcclxuICAgICAgICAgICAgICAgIC8vaWYgZXZlbiBhIHNpbmdsZSBiYWNrd2FyZHMgY29ubmVjdGlvbiBpcyBoaWRkZW4sIHVuc29sdmVkLCBvciBsb2NrZWQsIGl0J3Mgbm90IHJlYWR5IHRvIGJlIHJldmVhbGVkXHJcbiAgICAgICAgICAgICAgICBpZih0YXJnZXRTdGF0dXMgPT09IFwiMFwiIHx8IHRhcmdldFN0YXR1cyA9PT0gXCIxXCIgfHwgdGFyZ2V0U3RhdHVzID09PSBcIjNcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uZmlybWVkQ2xlYXIgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL2FwcGx5IHRoZSBzdGF0dXNcclxuICAgICAgICAgICAgaWYoY29uZmlybWVkQ2xlYXIpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25uZWN0aW9uRm9yd2FyZFtpXS5zZXRTdGF0dXMoXCIxXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbm5lY3Rpb25Gb3J3YXJkW2ldLnNldFN0YXR1cyhcIjNcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9hcHBseSBjb25uZWN0aW9uRm9yd2FyZCBkYXRhIHRvIGxvY2FsU3RvcmFnZVxyXG4gICAgICAgICAgICB1dGlsaXR5LnNldFByb2dyZXNzKHRoaXMuY29ubmVjdGlvbkZvcndhcmRbaV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvL2NoYW5nZSBidXR0b24gYXBwZWFyYW5jZVxyXG4gICAgICAgIHZhciB0b2dnbGVCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NvbXBsZXRpb25CdXR0b25cIik7XHJcbiAgICAgICAgdG9nZ2xlQnV0dG9uLmlubmVySFRNTCA9IFwiPGRpdiBpZD1cXFwiZHdMYXVuY2hlclRvZ2dsZVxcXCI+PHA+TWFyayBJbmNvbXBsZXRlPC9wPjwvZGl2PlwiO1xyXG4gICAgICAgIHRvZ2dsZUJ1dHRvbi5jbGFzc05hbWUgPSBcInNlbGVjdGVkXCI7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmKHRoaXMuc3RhdHVzID09PSBcIjJcIil7XHJcbiAgICAgICAgLy9jaGFuZ2UgdG8gd2l0aGRyYXduIGNvbXBsZXRpb24gc3RhdHVzXHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBcIjRcIjtcclxuICAgICAgICBcclxuICAgICAgICAvL2NoYW5nZSBidXR0b24gYXBwZWFyYW5jZVxyXG4gICAgICAgIHZhciB0b2dnbGVCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NvbXBsZXRpb25CdXR0b25cIik7XHJcbiAgICAgICAgdG9nZ2xlQnV0dG9uLmlubmVySFRNTCA9IFwiPGRpdiBpZD1cXFwiZHdMYXVuY2hlclRvZ2dsZVxcXCI+PHA+TWFyayBhcyBDb21wbGV0ZTwvcD48L2Rpdj5cIjtcclxuICAgICAgICB0b2dnbGVCdXR0b24uY2xhc3NOYW1lID0gXCJ1bnNlbGVjdGVkXCI7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmKHRoaXMuc3RhdHVzID09PSBcIjNcIil7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgICBlbHNlIGlmKHRoaXMuc3RhdHVzID09PSBcIjRcIil7XHJcbiAgICAgICAgLy9jaGFuZ2UgdG8gc29sdmVkIHN0YXR1c1xyXG4gICAgICAgIHRoaXMuc3RhdHVzID0gXCIyXCI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9uZWVkIHRvIGNoZWNrIGNvbXBsZXRpb24gaGVyZSwgbG9vcHMgdGhyb3VnaCBmb3J3YXJkIGNvbm5lY3Rpb25zXHJcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMuY29ubmVjdGlvbkZvcndhcmQubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgICAgICB2YXIgbmV4dCA9IHRoaXMuY29ubmVjdGlvbkZvcndhcmRbaV07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvL2lmIHN0YXR1cyBpcyBlaXRoZXIgaGlkZGVuIG9yIGxvY2tlZCwgY2hlY2sgdG8gY2hhbmdlIHN0YXR1c1xyXG4gICAgICAgICAgICBpZihuZXh0LnN0YXR1cyA9PT0gMCB8fCBuZXh0LnN0YXR1cyA9PT0gMyl7XHJcbiAgICAgICAgICAgICAgICB2YXIgY29uZmlybWVkQ2xlYXIgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgLy9pZiBhbnkgYmFja3dhcmQgY29ubmVjdGlvbnMgYXJlIGluY29tcGxldGUsIHNldCB0aGUgY29uZmlybWVkQ2xlYXIgZmxhZyB0byBzaG93IHRoYXRcclxuICAgICAgICAgICAgICAgIGZvcih2YXIgaiA9IDA7IGogPCB0aGlzLmNvbm5lY3Rpb25Gb3J3YXJkW2ldLmNvbm5lY3Rpb25CYWNrd2FyZC5sZW5ndGg7IGorKyl7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRhcmdldFN0YXR1cyA9IHRoaXMuY29ubmVjdGlvbkZvcndhcmRbaV0uY29ubmVjdGlvbkJhY2t3YXJkW2pdLnN0YXR1cztcclxuICAgICAgICAgICAgICAgICAgICBpZih0YXJnZXRTdGF0dXMgPT09IFwiMFwiIHx8IHRhcmdldFN0YXR1cyA9PT0gXCIxXCIgfHwgdGFyZ2V0U3RhdHVzID09PSBcIjNcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpcm1lZENsZWFyID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vYXBwbHkgdGhlIHN0YXR1c1xyXG4gICAgICAgICAgICAgICAgaWYoY29uZmlybWVkQ2xlYXIpe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29ubmVjdGlvbkZvcndhcmRbaV0uc2V0U3RhdHVzKFwiMVwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25uZWN0aW9uRm9yd2FyZFtpXS5zZXRTdGF0dXMoXCIzXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy9hcHBseSBjb25uZWN0aW9uRm9yd2FyZCBkYXRhIHRvIGxvY2FsU3RvcmFnZVxyXG4gICAgICAgICAgICAgICAgdXRpbGl0eS5zZXRQcm9ncmVzcyh0aGlzLmNvbm5lY3Rpb25Gb3J3YXJkW2ldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvL2NoYW5nZSBidXR0b24gYXBwZWFyYW5jZVxyXG4gICAgICAgIHZhciB0b2dnbGVCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NvbXBsZXRpb25CdXR0b25cIik7XHJcbiAgICAgICAgdG9nZ2xlQnV0dG9uLmlubmVySFRNTCA9IFwiPGRpdiBpZD1cXFwiZHdMYXVuY2hlclRvZ2dsZVxcXCI+PHA+TWFyayBJbmNvbXBsZXRlPC9wPjwvZGl2PlwiO1xyXG4gICAgICAgIHRvZ2dsZUJ1dHRvbi5jbGFzc05hbWUgPSBcInNlbGVjdGVkXCI7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHV0aWxpdHkuc2V0UHJvZ3Jlc3ModGhpcyk7XHJcbiAgICBcclxuICAgIGNvbnNvbGUubG9nKGxvY2FsU3RvcmFnZS5wcm9ncmVzcyArIFwiXFxuXCIpO1xyXG4gICAgY29uc29sZS5sb2coXCJUaGlzIGlzIHRoZSBzdGF0dXMgYWZ0ZXIgY2hhbmdlOiBcIiArIHRoaXMuc3RhdHVzKTtcclxufVxyXG5cclxudmFyIGZsYWdMb2FkZWQgPSBmYWxzZTtcclxudmFyIGZsYWdJbWFnZTtcclxudmFyIF9kcmF3RmxhZyA9IGZ1bmN0aW9uIChwb3NpdGlvblgsIHBvc2l0aW9uWSwgd2lkdGgsIGhlaWdodCwgcENhbnZhc1N0YXRlKSB7XHJcbiAgICBpZihmbGFnTG9hZGVkKXtcclxuICAgICAgICAvL2RyYXcgZmxhZyBpbiB0aGUgdXBwZXIgcmlnaHRcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LmRyYXdJbWFnZShmbGFnSW1hZ2UsIHBvc2l0aW9uWCArIHdpZHRoLzIgLSAxKmZsYWdJbWFnZS5uYXR1cmFsV2lkdGgvNCwgcG9zaXRpb25ZIC0gaGVpZ2h0LzIgLSBmbGFnSW1hZ2UubmF0dXJhbEhlaWdodC82LCAzMCwgMzApXHJcbiAgICB9XHJcbiAgICBlbHNle1xyXG4gICAgICAgIC8vbG9hZEltYWdlXHJcbiAgICAgICAgZmxhZ0ltYWdlID0gbmV3IEltYWdlKCk7XHJcbiAgICAgICAgZmxhZ0ltYWdlLnNyYyA9IFwiLi4vLi4vY29udGVudC91aS9pY29uQ2hlY2sucG5nXCI7XHJcbiAgICAgICAgZmxhZ0xvYWRlZCA9IHRydWU7XHJcbiAgICB9XHJcbn1cclxuXHJcbkxlc3Nvbk5vZGUucHJvdG90eXBlLnNldFN0YXR1cyA9IGZ1bmN0aW9uKHBTdGF0dXMpe1xyXG4gICAgLy9lbnN1cmUgdGhhdCBhIGxvY2sgaXMgYmVpbmcgaW5zdGVhZCBvZiBub3JtYWwgdW52ZWlsIGlmIHRoYXQncyB3aGF0IGlzIHN1cHBvc2VkIHRvIGJlIHRoZXJlXHJcbiAgICBpZihwU3RhdHVzID09PSBcIjFcIiAmJiB0aGlzLnN0YXR1cyA9PT0gXCIwXCIpe1xyXG4gICAgICAgIHZhciBjb25maXJtZWRDbGVhciA9IHRydWU7XHJcbiAgICAgICAgLy9jaGVjayBiYWNrd2FyZHMgY29ubmVjdGlvbnMgY29tcGxldGlvblxyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbm5lY3Rpb25CYWNrd2FyZC5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgIHZhciB0YXJnZXRTdGF0dXMgPSB0aGlzLmNvbm5lY3Rpb25CYWNrd2FyZFtpXS5zdGF0dXM7XHJcbiAgICAgICAgICAgIGlmKHRhcmdldFN0YXR1cyA9PT0gXCIwXCIgfHwgdGFyZ2V0U3RhdHVzID09PSBcIjFcIiB8fCB0YXJnZXRTdGF0dXMgPT09IFwiM1wiKXtcclxuICAgICAgICAgICAgICAgIGNvbmZpcm1lZENsZWFyID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZihjb25maXJtZWRDbGVhcil7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzID0gXCIxXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzID0gXCIzXCI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZXtcclxuICAgICAgIHRoaXMuc3RhdHVzID0gcFN0YXR1czsgXHJcbiAgICB9XHJcbiAgICBcclxufVxyXG5cclxuTGVzc29uTm9kZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKHBDYW52YXNTdGF0ZSl7XHJcbiAgICBpZih0aGlzLmltYWdlTG9hZGVkKXtcclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICBpZih0aGlzLnN0YXR1cyAhPT0gXCIwXCIpe1xyXG4gICAgICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LnNhdmUoKTtcclxuICAgICAgICAgICAgaWYodGhpcy5oaWdobGlnaHRlZCl7XHJcbiAgICAgICAgICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LnNoYWRvd0NvbG9yID0gJyMwMDY2ZmYnO1xyXG4gICAgICAgICAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5zaGFkb3dCbHVyID0gNztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy90aGUgbm9kZSBpcyBjb21wbGV0ZWx5IHNvbHZlZCwgZHJhdyBjb25uZWN0aW9uIGxpbmVzXHJcbiAgICAgICAgICAgIGlmKHRoaXMuc3RhdHVzID09PSBcIjJcIiB8fCB0aGlzLnN0YXR1cyA9PT0gXCI0XCIpe1xyXG4gICAgICAgICAgICAgICAgLy9kcmF3IGxpbmVzIGFzIHBhcnQgb2YgdGhlIGxlc3Nvbk5vZGVcclxuICAgICAgICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbm5lY3Rpb25Gb3J3YXJkLmxlbmd0aDsgaSsrKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbm5lY3Rpb25Gb3J3YXJkW2ldLmhpZ2hsaWdodCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFpbnRlci5saW5lKHBDYW52YXNTdGF0ZS5jdHgsIHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55LCB0aGlzLmNvbm5lY3Rpb25Gb3J3YXJkW2ldLnBvc2l0aW9uLngsIHRoaXMuY29ubmVjdGlvbkZvcndhcmRbaV0ucG9zaXRpb24ueSwgMiwgXCJibGFja1wiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy9pcyB0aGlzIG5vZGUncyBpbWFnZSBkcmF3biBub3JtYWxseT9cclxuICAgICAgICAgICAgaWYodGhpcy5zdGF0dXMgPT09IFwiMVwiIHx8IHRoaXMuc3RhdHVzID09PSBcIjJcIiB8fCB0aGlzLnN0YXR1cyA9PT0gXCI0XCIpe1xyXG4gICAgICAgICAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5kcmF3SW1hZ2UodGhpcy5pbWFnZSwgdGhpcy5wb3NpdGlvbi54IC0gKHRoaXMud2lkdGgqdGhpcy5zY2FsZUZhY3RvcikvMiwgdGhpcy5wb3NpdGlvbi55IC0gKHRoaXMuaGVpZ2h0KnRoaXMuc2NhbGVGYWN0b3IpLzIsIHRoaXMud2lkdGggKiB0aGlzLnNjYWxlRmFjdG9yLCB0aGlzLmhlaWdodCAqIHRoaXMuc2NhbGVGYWN0b3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vZHJhdyBsb2NrZWQgaW1hZ2VcclxuICAgICAgICAgICAgZWxzZSBpZih0aGlzLnN0YXR1cyA9PT0gXCIzXCIpe1xyXG4gICAgICAgICAgICAgICAgLy8hISEhIXVzZSBwYWludGVyIHRvIGRyYXcgbG9jayBzdHVmZiwgYmVsb3cgaXMgcGxhY2Vob2xkZXJcclxuICAgICAgICAgICAgICAgIHBDYW52YXNTdGF0ZS5jdHguc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5maWxsU3R5bGUgPSBcImdyYXlcIjtcclxuICAgICAgICAgICAgICAgIHBDYW52YXNTdGF0ZS5jdHguc3Ryb2tlU3R5bGUgPSBcImdyYXlcIjtcclxuICAgICAgICAgICAgICAgIHBDYW52YXNTdGF0ZS5jdHgubGluZVdpZHRoID0gMTA7XHJcbiAgICAgICAgICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5hcmModGhpcy5wb3NpdGlvbi54LHRoaXMucG9zaXRpb24ueSAtIDEwLDIwLE1hdGguUEksMCk7XHJcbiAgICAgICAgICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LnN0cm9rZSgpO1xyXG4gICAgICAgICAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5maWxsUmVjdCh0aGlzLnBvc2l0aW9uLnggLSAzMCwgdGhpcy5wb3NpdGlvbi55IC0gMTAsIDYwKnRoaXMuc2NhbGVGYWN0b3IsIDQwICogdGhpcy5zY2FsZUZhY3Rvcik7XHJcbiAgICAgICAgICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LnJlc3RvcmUoKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LmZvbnQgPSBcIjIwcHggQXJpYWxcIjtcclxuICAgICAgICAgICAgcENhbnZhc1N0YXRlLmN0eC50ZXh0QmFzZWxpbmUgPSBcImhhbmdpbmdcIjtcclxuICAgICAgICAgICAgcENhbnZhc1N0YXRlLmN0eC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xyXG4gICAgICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LnN0cm9rZVRleHQodGhpcy5kYXRhLnRpdGxlLCB0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSArIDUgKyB0aGlzLmhlaWdodC8yKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvL2RyYXcgY29tcGxldGlvbiBmbGFnXHJcbiAgICAgICAgICAgIGlmKHRoaXMuc3RhdHVzID09PSBcIjJcIil7XHJcbiAgICAgICAgICAgICAgICBfZHJhd0ZsYWcodGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnksIHRoaXMuaGVpZ2h0LCB0aGlzLndpZHRoLCBwQ2FudmFzU3RhdGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LnJlc3RvcmUoKTtcclxuXHJcblxyXG4gICAgICAgICAgICAvL2RyYXcgdGhlIGltYWdlLCBzaGFkb3cgaWYgaG92ZXJlZFxyXG4gICAgICAgICAgICBpZih0aGlzLm1vdXNlT3Zlcil7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpZ2hsaWdodGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMuY29ubmVjdGlvbkZvcndhcmRbMF0gIT09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5jb25uZWN0aW9uRm9yd2FyZFswXS50eXBlID09PSBcImV4dGVuc2lvblwiKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25uZWN0aW9uRm9yd2FyZFswXS5oaWdobGlnaHRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpZ2hsaWdodGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLmNvbm5lY3Rpb25Gb3J3YXJkWzBdICE9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuY29ubmVjdGlvbkZvcndhcmRbMF0udHlwZSA9PT0gXCJleHRlbnNpb25cIil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29ubmVjdGlvbkZvcndhcmRbMF0uaGlnaGxpZ2h0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxufTtcclxuXHJcblxyXG5cclxuLy9wb3B1bGF0ZXMgdGhlIGRldGFpbFdpbmRvdyBiYXNlZCBvbiB0aGUgc2VuZGVyXHJcbkxlc3Nvbk5vZGUucHJvdG90eXBlLmNsaWNrID0gZnVuY3Rpb24oKXtcclxuICAgIFxyXG4gICAgaWYodGhpcy5zdGF0dXMgPT09IFwiM1wiKXtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRldGFpbExheWVyXCIpLmNsYXNzTmFtZSA9IFwidmlzaWJsZVwiO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGV0YWlsV2luZG93XCIpLmNsYXNzTmFtZSA9IFwiaGlkZGVuV2luZG93XCI7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2NrV2luZG93XCIpLmNsYXNzTmFtZSA9IFwiXCI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2NrVGl0bGVcIikuaW5uZXJIVE1MID0gdGhpcy5kYXRhLnRpdGxlICsgXCIgd2lsbCBiZSB1bmxvY2tlZCB3aGVuIHRoZSBmb2xsb3dpbmcgYXJlIGNvbXBsZXRlZDogXCI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIGNvbWJpbmVkTGlzdCA9IFwiXCI7XHJcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMuY29ubmVjdGlvbkJhY2t3YXJkLmxlbmd0aDsgaSsrKXtcclxuICAgICAgICAgICAgY29tYmluZWRMaXN0ICs9IFwi4oCiIFwiICsgdGhpcy5jb25uZWN0aW9uQmFja3dhcmRbaV0uZGF0YS50aXRsZSAgKyBcIjxicj5cIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2NrTGlzdFwiKS5pbm5lckhUTUwgPSBjb21iaW5lZExpc3Q7XHJcbiAgICB9XHJcbiAgICBlbHNle1xyXG4gICAgICAgIC8vc2V0IGRldGFpbFdpbmRvdyB2YWx1ZXMgaGVyZVxyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGV0YWlsTGF5ZXJcIikuY2xhc3NOYW1lID0gXCJ2aXNpYmxlXCI7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZXRhaWxXaW5kb3dcIikuY2xhc3NOYW1lID0gXCJcIjtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvY2tXaW5kb3dcIikuY2xhc3NOYW1lID0gXCJoaWRkZW5XaW5kb3dcIjtcclxuICAgICAgICBcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImR3QmFubmVyVGl0bGVcIikuaW5uZXJIVE1MID0gdGhpcy5kYXRhLnRpdGxlO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZHdCYW5uZXJJbWFnZVwiKS5zcmMgPSB0aGlzLmRhdGEuaW1hZ2UuYmFubmVyO1xyXG5cclxuICAgICAgICB2YXIgdGFnVGV4dCA9IFwiXCI7XHJcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMuZGF0YS50YWdzLmxlbmd0aDsgaSsrKXtcclxuICAgICAgICAgICAgdGFnVGV4dCArPSBcIjxkaXYgY2xhc3M9XFxcImR3VGFnXFxcIj48cD5cIiArIHRoaXMuZGF0YS50YWdzW2ldICsgXCI8L3A+PC9kaXY+XCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImR3VGFnc1wiKS5pbm5lckhUTUwgPSB0YWdUZXh0O1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZHdEZXNjcmlwdGlvblRleHRcIikuaW5uZXJIVE1MID0gdGhpcy5kYXRhLmRlc2NyaXB0aW9uO1xyXG5cclxuICAgICAgICB2YXIgY29uZ2xvbWVyYXRlID0gXCJcIjtcclxuICAgICAgICBpZih0aGlzLmRhdGEuZXh0cmFfcmVzb3VyY2VzWzBdICE9PSBudWxsKXtcclxuICAgICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMuZGF0YS5leHRyYV9yZXNvdXJjZXMubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgICAgICAgICAgdmFyIHNuaXBwZXQgPSB0aGlzLmRhdGEuZXh0cmFfcmVzb3VyY2VzW2ldO1xyXG4gICAgICAgICAgICAgICAgdmFyIGhlYWRlclNuaXBwZXQgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgdmFyIGZvb3RlclNuaXBwZXQgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgLy9yZW1vdmVzIC8gZnJvbSB0aGUgZW5kIHNpbmNlIGl0IHdpbGwgYmUgdXNlZCBhcyBhbiBtYXJrZXIgZm9yIGN1dHRpbmdcclxuICAgICAgICAgICAgICAgIGlmKHNuaXBwZXQuc3Vic3RyaW5nKHNuaXBwZXQubGVuZ3RoIC0gMSwgc25pcHBldC5sZW5ndGgpID09PSBcIi9cIil7XHJcbiAgICAgICAgICAgICAgICAgICAgc25pcHBldCA9IHNuaXBwZXQuc3Vic3RyaW5nKDAsIHNuaXBwZXQubGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvL3JlbW92ZSB0aGUgaHR0cDovLyBvciBodHRwczovLyBoZWFkZXJcclxuICAgICAgICAgICAgICAgIGlmKHNuaXBwZXQuc3Vic3RyaW5nKDAsIDgpID09PSBcImh0dHBzOi8vXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgIHNuaXBwZXQgPSBzbmlwcGV0LnN1YnN0cmluZyg4LCBzbmlwcGV0Lmxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZihzbmlwcGV0LnN1YnN0cmluZygwLCA3KSA9PT0gXCJodHRwOi8vXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgIHNuaXBwZXQgPSBzbmlwcGV0LnN1YnN0cmluZyg3LCBzbmlwcGV0Lmxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZihzbmlwcGV0LnN1YnN0cmluZygwLCA0KSA9PT0gXCJ3d3cuXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgIHNuaXBwZXQgPSBzbmlwcGV0LnN1YnN0cmluZyg0LCBzbmlwcGV0Lmxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvL2lmIHRoZSBzbmlwcGV0IGNvbnRhaW5zIC8gcGFyc2UgYmFzZWQgb24gaXRcclxuICAgICAgICAgICAgICAgIGlmKHNuaXBwZXQuaW5kZXhPZignLycpICE9PSBcIi0xXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjb3VudGVyID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGsgPSAwOyBrIDwgc25pcHBldC5sZW5ndGg7IGsrKyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHNuaXBwZXRba10gIT09IFwiL1wiKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ZXIrKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyU25pcHBldCArPSBzbmlwcGV0LnN1YnN0cmluZygwLCBjb3VudGVyKTtcclxuICAgICAgICAgICAgICAgICAgICBoZWFkZXJTbmlwcGV0ICs9IFwiOlwiO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb3VudGVyID0gc25pcHBldC5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBrID0gc25pcHBldC5sZW5ndGggLSAxOyBrID4gMDsgay0tKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoc25pcHBldFtrXSAhPT0gXCIvXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnRlci0tO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBmb290ZXJTbmlwcGV0ICs9IHNuaXBwZXQuc3Vic3RyaW5nKGNvdW50ZXIsIHNuaXBwZXQubGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdGVtcG9yYXJ5U25pcHBldCA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBrID0gMDsgayA8IGZvb3RlclNuaXBwZXQubGVuZ3RoOyBrKyspe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihmb290ZXJTbmlwcGV0W2tdID09PSAnLScgfHwgZm9vdGVyU25pcHBldFtrXSA9PT0gJ18nIHx8IGZvb3RlclNuaXBwZXRba10gPT09ICd+Jyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wb3JhcnlTbmlwcGV0ICs9ICcgJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcG9yYXJ5U25pcHBldCArPSBmb290ZXJTbmlwcGV0W2tdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGZvb3RlclNuaXBwZXQgPSB0ZW1wb3JhcnlTbmlwcGV0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbmdsb21lcmF0ZSArPSBcIjxhIGhyZWY9XFxcIlwiICsgdGhpcy5kYXRhLmV4dHJhX3Jlc291cmNlc1tpXSArIFwiXFxcIiB0YXJnZXQ9XFxcIl9ibGFua1xcXCI+PGRpdiBjbGFzcz1cXFwiZHdSZXNvdXJjZVxcXCI+PGRpdiBjbGFzcz1cXFwiZHdSZXNvdXJjZUNvbnRlbnRcXFwiPjxwIGNsYXNzPVxcXCJkd1Jlc291cmNlUDFcXFwiPlwiO1xyXG4gICAgICAgICAgICAgICAgY29uZ2xvbWVyYXRlICs9IGhlYWRlclNuaXBwZXQ7XHJcbiAgICAgICAgICAgICAgICBjb25nbG9tZXJhdGUgKz0gXCI8L3A+PHAgY2xhc3M9XFxcImR3UmVzb3VyY2VQMlxcXCI+XCIgKyBmb290ZXJTbmlwcGV0ICtcIjwvcD48L2Rpdj48L2Rpdj48L2E+XCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZHdSZXNvdXJjZXNcIikuaW5uZXJIVE1MID0gY29uZ2xvbWVyYXRlO1xyXG5cclxuXHJcbiAgICAgICAgdmFyIGR3TGF1bmNoZXJSZWZlcmVuY2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImR3TGF1bmNoZXJcIik7XHJcbiAgICAgICAgZHdMYXVuY2hlclJlZmVyZW5jZS5pbm5lckhUTUwgPSBcIjxhIGhyZWY9XFxcIlwiICsgdGhpcy5kYXRhLmxpbmsgKyBcIlxcXCIgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiPjxkaXYgaWQ9XFxcImR3TGF1bmNoZXJMYXVuY2hcXFwiPjxwPk9wZW4gTGVzc29uPC9wPjwvZGl2PjwvYT5cIjtcclxuICAgICAgICBpZih0aGlzLnN0YXR1cyA9PT0gXCIxXCIgfHwgdGhpcy5zdGF0dXMgPT09IFwiNFwiKXtcclxuICAgICAgICAgICAgZHdMYXVuY2hlclJlZmVyZW5jZS5pbm5lckhUTUwgKz0gXCI8YnV0dG9uIGlkPVxcXCJjb21wbGV0aW9uQnV0dG9uXFxcIiBjbGFzcz1cXFwidW5zZWxlY3RlZFxcXCI+PGRpdiBpZD1cXFwiZHdMYXVuY2hlclRvZ2dsZVxcXCI+PHA+TWFyayBhcyBDb21wbGV0ZTwvcD48L2Rpdj48L2J1dHRvbj5cIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgZHdMYXVuY2hlclJlZmVyZW5jZS5pbm5lckhUTUwgKz0gXCI8YnV0dG9uIGlkPVxcXCJjb21wbGV0aW9uQnV0dG9uXFxcIiBjbGFzcz1cXFwic2VsZWN0ZWRcXFwiPjxkaXYgaWQ9XFxcImR3TGF1bmNoZXJUb2dnbGVcXFwiPjxwPk1hcmsgSW5jb21wbGV0ZTwvcD48L2Rpdj48L2J1dHRvbj5cIjtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvL3NldCBjb29raWUgZGF0YVxyXG4gICAgICAgIGxvY2FsU3RvcmFnZS5hY3RpdmVOb2RlID0gdGhpcy5kYXRhLl9pZDtcclxuXHJcbiAgICAgICAgLy9hdHRhY2ggY2xpY2sgZXZlbnQgdG8gYnV0dG9uXHJcbiAgICAgICAgdmFyIGR3Q29tcGxldGlvbkJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY29tcGxldGlvbkJ1dHRvblwiKTtcclxuICAgICAgICBkd0NvbXBsZXRpb25CdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBfaGFuZGxlU3RhdHVzLmJpbmQodGhpcyksIGZhbHNlKTtcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTGVzc29uTm9kZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbi8vcGFyYW1ldGVyIGlzIGEgcG9pbnQgdGhhdCBkZW5vdGVzIHN0YXJ0aW5nIHBvc2l0aW9uXHJcbmZ1bmN0aW9uIFBhcnNlcihwVGFyZ2V0VVJMLCBjYWxsYmFjayl7XHJcbiAgICB2YXIgSlNPTk9iamVjdDtcclxuICAgIHZhciBsZXNzb25BcnJheSA9IFtdO1xyXG4gICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgSlNPTk9iamVjdCA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCk7XHJcblxyXG4gICAgICAgIC8vcGFzcyBsZXNzb24gZGF0YSBiYWNrXHJcbiAgICAgICAgY2FsbGJhY2soSlNPTk9iamVjdCk7XHJcbiAgICB9XHJcblxyXG4gICAgeGhyLm9wZW4oJ0dFVCcsIHBUYXJnZXRVUkwsIHRydWUpO1xyXG4gICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoXCJJZi1Nb2RpZmllZC1TaW5jZVwiLCBcIlNhdCwgMSBKYW4gMjAxMCAwMDowMDowMCBHTTBUXCIpO1xyXG4gICAgeGhyLnNlbmQoKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQYXJzZXI7IiwiXCJ1c2Ugc3RyaWN0XCJcclxuXHJcblxyXG5mdW5jdGlvbiBEZXRhaWxzUGFuZWwoZ3JhcGgpIHtcclxuICAgIHRoaXMuZ3JhcGggPSBncmFwaDtcclxuICAgIHRoaXMubm9kZSA9IG51bGw7XHJcbiAgICB0aGlzLmRhdGEgPSBudWxsO1xyXG4gICAgdGhpcy50cmFuc2l0aW9uT24gPSBmYWxzZTtcclxuICAgIHRoaXMudHJhbnNpdGlvblRpbWUgPSAwO1xyXG4gICAgdGhpcy5kYXRhRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyaWdodEJhclwiKTtcclxufTtcclxuXHJcbkRldGFpbHNQYW5lbC5wcm90b3R5cGUuZW5hYmxlID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgdGhpcy5ub2RlID0gbm9kZTtcclxuICAgIHRoaXMuZGF0YSA9IG5vZGUuZGF0YTtcclxuICAgIHRoaXMudHJhbnNpdGlvbk9uID0gdHJ1ZVxyXG59O1xyXG5cclxuRGV0YWlsc1BhbmVsLnByb3RvdHlwZS5kaXNhYmxlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmRhdGFEaXYuaW5uZXJIVE1MID0gXCJcIjtcclxuICAgIHRoaXMudHJhbnNpdGlvbk9uID0gZmFsc2U7XHJcbn07XHJcblxyXG5EZXRhaWxzUGFuZWwucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGNhbnZhc1N0YXRlLCB0aW1lLCBub2RlKSB7XHJcbiAgICBcclxuICAgIC8vdXBkYXRlIG5vZGUgaWYgaXRzIG5vdCB0aGUgc2FtZSBhbnltb3JlXHJcbiAgICBpZih0aGlzLm5vZGUgIT0gbm9kZSkge1xyXG4gICAgICAgIHRoaXMubm9kZSA9IG5vZGU7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gbm9kZS5kYXRhO1xyXG4gICAgICAgIHRoaXMuZGF0YURpdi5pbm5lckhUTUwgPSB0aGlzLkdlbmVyYXRlRE9NKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIFxyXG4gICAgLy90cmFuc2l0aW9uIG9uXHJcbiAgICBpZih0aGlzLnRyYW5zaXRpb25Pbikge1xyXG4gICAgICAgIGlmKHRoaXMudHJhbnNpdGlvblRpbWUgPCAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvblRpbWUgKz0gdGltZS5kZWx0YVRpbWUgKiAzO1xyXG4gICAgICAgICAgICBpZih0aGlzLnRyYW5zaXRpb25UaW1lID49IDEpIHtcclxuICAgICAgICAgICAgICAgIC8vZG9uZSB0cmFuc2l0aW9uaW5nXHJcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25UaW1lID0gMTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YURpdi5pbm5lckhUTUwgPSB0aGlzLkdlbmVyYXRlRE9NKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvL3RyYW5zaXRpb24gb2ZmXHJcbiAgICBlbHNlIHtcclxuICAgICAgICBpZih0aGlzLnRyYW5zaXRpb25UaW1lID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25UaW1lIC09IHRpbWUuZGVsdGFUaW1lICogMztcclxuICAgICAgICAgICAgaWYodGhpcy50cmFuc2l0aW9uVGltZSA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAvL2RvbmUgdHJhbnNpdGlvbmluZ1xyXG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9uVGltZSA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5vZGUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhID0gbnVsbDsgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5EZXRhaWxzUGFuZWwucHJvdG90eXBlLkdlbmVyYXRlRE9NID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgaHRtbCA9IFwiPGgxPlwiK3RoaXMuZGF0YS5zZXJpZXMrXCI6PC9oMT48aDE+PGEgaHJlZj1cIiArIHRoaXMuZGF0YS5saW5rICsgXCI+XCIrdGhpcy5kYXRhLnRpdGxlK1wiPC9hPjwvaDE+XCI7XHJcbiAgICBodG1sICs9IFwiPGEgaHJlZj1cIiArIHRoaXMuZGF0YS5saW5rICsgXCI+PGltZyBzcmM9aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0lHTUUtUklUL1wiICsgdGhpcy5kYXRhLm5hbWUgK1xyXG4gICAgICAgIFwiL21hc3Rlci9pZ21lX3RodW1ibmFpbC5wbmcgYWx0PVwiICsgdGhpcy5kYXRhLmxpbmsgKyBcIj48L2E+XCI7XHJcbiAgICBodG1sICs9IFwiPHA+XCIgKyB0aGlzLmRhdGEuZGVzY3JpcHRpb24gKyBcIjwvcD5cIjtcclxuICAgIC8vY29uc29sZS5sb2codGhpcy5kYXRhKTtcclxuICAgIGlmKHRoaXMuZGF0YS5leHRyYV9yZXNvdXJjZXMubGVuZ3RoICE9IDApIHtcclxuICAgICAgICBodG1sICs9IFwiPGgyPkFkZGl0aW9uYWwgUmVzb3VyY2VzOjwvaDI+XCI7XHJcbiAgICAgICAgaHRtbCArPSBcIjx1bD5cIjtcclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5kYXRhLmV4dHJhX3Jlc291cmNlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBodG1sICs9IFwiPGxpPjxhIGhyZWY9XCIgKyB0aGlzLmRhdGEuZXh0cmFfcmVzb3VyY2VzW2ldLmxpbmsgKyBcIj5cIiArIHRoaXMuZGF0YS5leHRyYV9yZXNvdXJjZXNbaV0udGl0bGUgKyBcIjwvYT48L2xpPlwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBodG1sICs9IFwiPC91bD5cIjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcmV0dXJuIGh0bWw7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IERldGFpbHNQYW5lbDsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIERyYXdMaWIgPSByZXF1aXJlKCcuLi8uLi9saWJyYXJpZXMvRHJhd2xpYi5qcycpO1xyXG52YXIgU2VhcmNoUGFuZWwgPSByZXF1aXJlKCcuL1NlYXJjaFBhbmVsLmpzJyk7XHJcbnZhciBEZXRhaWxzUGFuZWwgPSByZXF1aXJlKCcuL0RldGFpbHNQYW5lbC5qcycpO1xyXG52YXIgVHV0b3JpYWxOb2RlID0gcmVxdWlyZSgnLi9UdXRvcmlhbE5vZGUuanMnKTtcclxudmFyIFBvaW50ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL1BvaW50LmpzJyk7XHJcblxyXG5cclxudmFyIHBhaW50ZXI7XHJcbnZhciBleHBhbmQgPSAzO1xyXG52YXIgZGVidWdNb2RlID0gZmFsc2U7XHJcblxyXG5mdW5jdGlvbiBHcmFwaChwSlNPTkRhdGEpIHtcclxuICAgICAgICBcclxuICAgIHRoaXMuc2VhcmNoUGFuZWwgPSBuZXcgU2VhcmNoUGFuZWwodGhpcyk7XHJcbiAgICB0aGlzLmRldGFpbHNQYW5lbCA9IG5ldyBEZXRhaWxzUGFuZWwodGhpcyk7XHJcbiAgICB0aGlzLnNlYXJjaFBhbmVsQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJPcHRpb25zQnV0dG9uXCIpO1xyXG4gICAgdGhpcy5zZWFyY2hEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxlZnRCYXJcIik7XHJcbiAgICB0aGlzLmRhdGFEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJpZ2h0QmFyXCIpO1xyXG4gICAgdGhpcy5jYW52YXNEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1pZGRsZUJhclwiKTtcclxuICAgIHBhaW50ZXIgPSBuZXcgRHJhd0xpYigpO1xyXG4gICAgXHJcbiAgICB0aGlzLm5vZGVzID0gW107XHJcbiAgICB0aGlzLmFjdGl2ZU5vZGVzID0gW107XHJcbiAgICBcclxuICAgIC8vcG9wdWxhdGUgdGhlIGFycmF5XHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgcEpTT05EYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGRhdGEgPSBwSlNPTkRhdGFbaV07XHJcbiAgICAgICAgLy9lbnN1cmVzIHRoYXQgdGhlIGNodW5rIGNvbnRhaW5zIGEgbGlua1xyXG4gICAgICAgIGlmKGRhdGEudGFncy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgaWYoZGVidWdNb2RlKSBjb25zb2xlLmxvZyhcIlJlcG8gbm90IHRhZ2dlZDogXCIgKyBkYXRhLm5hbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKGRhdGEuaW1hZ2UgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBpZihkZWJ1Z01vZGUpIGNvbnNvbGUubG9nKFwiUmVwbyB5YW1sIG91dCBvZiBkYXRlOiBcIiArIGRhdGEubmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgbm9kZSA9IG5ldyBUdXRvcmlhbE5vZGUoZGF0YSk7XHJcbiAgICAgICAgICAgIHRoaXMubm9kZXMucHVzaChub2RlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vc2V0IGRpcmVjdCBvYmplY3QgY29ubmVjdGlvbnMgdG8gcmVsYXRlZCBub2RlcyBmb3IgcmVmZXJlbmNpbmdcclxuICAgIC8vcGFyc2UgZW50aXJlIGxpc3RcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLm5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgLy9sb29wIG92ZXIgbGlzdGVkIGNvbm5lY3Rpb25zXHJcbiAgICAgICAgZm9yKHZhciBrID0gMDsgayA8IHRoaXMubm9kZXNbaV0uZGF0YS5jb25uZWN0aW9ucy5sZW5ndGg7IGsrKykge1xyXG4gICAgICAgICAgICAvL3NlYXJjaCBmb3Igc2ltaWxhciBub2Rlc1xyXG4gICAgICAgICAgICBmb3IodmFyIGogPSAwOyBqIDwgdGhpcy5ub2Rlcy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5ub2Rlc1tqXS5kYXRhLnNlcmllcyA9PT0gdGhpcy5ub2Rlc1tpXS5kYXRhLmNvbm5lY3Rpb25zW2tdLnNlcmllcyAmJlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubm9kZXNbal0uZGF0YS50aXRsZSA9PT0gdGhpcy5ub2Rlc1tpXS5kYXRhLmNvbm5lY3Rpb25zW2tdLnRpdGxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2Rlc1tpXS5wcmV2aW91c05vZGVzLnB1c2godGhpcy5ub2Rlc1tqXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2Rlc1tqXS5uZXh0Tm9kZXMucHVzaCh0aGlzLm5vZGVzW2ldKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgdGhpcy50cmFuc2l0aW9uVGltZSA9IDA7XHJcbiAgICB0aGlzLkZvY3VzTm9kZSh0aGlzLm5vZGVzWzBdKTtcclxuICAgIFxyXG4gICAgXHJcbiAgICBmdW5jdGlvbiB4IChzZWFyY2gpIHtcclxuICAgICAgICBpZihzZWFyY2gub3BlbiA9PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHNlYXJjaC50cmFuc2l0aW9uT24gPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNlYXJjaC50cmFuc2l0aW9uT24gPSB0cnVlO1xyXG4gICAgICAgICAgICBzZWFyY2gub3BlbiA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICB0aGlzLnNlYXJjaFBhbmVsQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB4LmJpbmQodGhpcy5zZWFyY2hQYW5lbEJ1dHRvbiwgdGhpcy5zZWFyY2hQYW5lbCkpO1xyXG59O1xyXG5cclxuXHJcblxyXG5cclxuR3JhcGgucHJvdG90eXBlLkZvY3VzTm9kZSA9IGZ1bmN0aW9uKGNlbnRlck5vZGUpIHtcclxuICAgIHRoaXMuZm9jdXNlZE5vZGUgPSBjZW50ZXJOb2RlO1xyXG4gICAgXHJcbiAgICB2YXIgbmV3Tm9kZXMgPSBbXTtcclxuICAgIFxyXG4gICAgLy9nZXQgbm9kZXMgdG8gZGVwdGhcclxuICAgIFxyXG4gICAgdmFyIHByZXZpb3VzTm9kZXMgPSB0aGlzLmZvY3VzZWROb2RlLmdldFByZXZpb3VzKGV4cGFuZCk7XHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgcHJldmlvdXNOb2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIG5ld05vZGVzLnB1c2gocHJldmlvdXNOb2Rlc1tpXSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHZhciBuZXh0Tm9kZXMgPSB0aGlzLmZvY3VzZWROb2RlLmdldE5leHQoZXhwYW5kKTtcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBuZXh0Tm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBuZXdOb2Rlcy5wdXNoKG5leHROb2Rlc1tpXSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHZhciB0ZW1wID0gW107XHJcbiAgICBcclxuICAgIC8vcmVtb3ZlIHJlZHVuZGFuY2llc1xyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IG5ld05vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGFscmVhZHlFeGlzdHMgPSBmYWxzZTtcclxuICAgICAgICBmb3IodmFyIGogPSAwOyBqIDwgdGVtcC5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICBpZihuZXdOb2Rlc1tpXSA9PSB0ZW1wW2pdKSB7XHJcbiAgICAgICAgICAgICAgICBhbHJlYWR5RXhpc3RzID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZighYWxyZWFkeUV4aXN0cykge1xyXG4gICAgICAgICAgICB0ZW1wLnB1c2gobmV3Tm9kZXNbaV0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgbmV3Tm9kZXMgPSB0ZW1wO1xyXG4gICAgXHJcbiAgICAvL2NoZWNrIGlmIGFueSBvZiB0aGUgbm9kZXMgd2VyZSBwcmV2aW91c2x5IG9uIHNjcmVlblxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMuYWN0aXZlTm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB0aGlzLmFjdGl2ZU5vZGVzW2ldLndhc1ByZXZpb3VzbHlPblNjcmVlbiA9IGZhbHNlO1xyXG4gICAgICAgIGZvcih2YXIgaiA9IDA7IGogPCBuZXdOb2Rlcy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICBpZih0aGlzLmFjdGl2ZU5vZGVzW2ldID09IG5ld05vZGVzW2pdKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZU5vZGVzW2ldLndhc1ByZXZpb3VzbHlPblNjcmVlbiA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRoaXMuYWN0aXZlTm9kZXMgPSBuZXdOb2RlcztcclxuICAgIFxyXG4gICAgLy9jbGVhciB0aGVpciBwYXJlbnQgZGF0YSBmb3IgbmV3IG5vZGVcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmFjdGl2ZU5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVOb2Rlc1tpXS51c2VkSW5HcmFwaCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYWN0aXZlTm9kZXNbaV0ucGFyZW50ID0gbnVsbDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgXHJcbiAgICB0aGlzLnRyYW5zaXRpb25UaW1lID0gMTtcclxuICAgIFxyXG4gICAgdGhpcy5mb2N1c2VkTm9kZS5zZXRUcmFuc2l0aW9uKGV4cGFuZCwgbnVsbCwgMCwgbmV3IFBvaW50KDAsIDApKTtcclxufTtcclxuXHJcbkdyYXBoLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihtb3VzZVN0YXRlLCBjYW52YXNTdGF0ZSwgdGltZSkge1xyXG4gICAgXHJcbiAgICBpZih0aGlzLnRyYW5zaXRpb25UaW1lID4gMCkge1xyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvblRpbWUgLT0gdGltZS5kZWx0YVRpbWU7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLnRyYW5zaXRpb25UaW1lID0gMDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgdmFyIG1vdXNlT3Zlck5vZGUgPSBudWxsO1xyXG4gICAgXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5hY3RpdmVOb2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBpc01haW4gPSAodGhpcy5hY3RpdmVOb2Rlc1tpXSA9PSB0aGlzLmZvY3VzZWROb2RlKTtcclxuICAgICAgICB0aGlzLmFjdGl2ZU5vZGVzW2ldLnVwZGF0ZShtb3VzZVN0YXRlLCB0aW1lLCB0aGlzLnRyYW5zaXRpb25UaW1lLCBpc01haW4pO1xyXG4gICAgICAgIGlmKHRoaXMuYWN0aXZlTm9kZXNbaV0ubW91c2VPdmVyKSB7XHJcbiAgICAgICAgICAgIG1vdXNlT3Zlck5vZGUgPSB0aGlzLmFjdGl2ZU5vZGVzW2ldO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgLy9pZiBjdXNlciBjbGlja3NcclxuICAgIGlmKG1vdXNlU3RhdGUubW91c2VEb3duICYmICFtb3VzZVN0YXRlLmxhc3RNb3VzZURvd24pIHtcclxuICAgICAgICAvL2ZvY3VzIG5vZGUgaWYgY2xpY2tlZFxyXG4gICAgICAgIGlmKG1vdXNlT3Zlck5vZGUpIHtcclxuICAgICAgICAgICAgdGhpcy5Gb2N1c05vZGUobW91c2VPdmVyTm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vc2hvdyBkZXRhaWxzIGZvciBub2RlIGlmIGJ1dHRvbiBjbGlja2VkXHJcbiAgICAgICAgaWYodGhpcy5mb2N1c2VkTm9kZS5kZXRhaWxzQnV0dG9uLm1vdXNlT3Zlcikge1xyXG4gICAgICAgICAgICBpZih0aGlzLmRldGFpbHNQYW5lbC5ub2RlID09IG51bGwpICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRldGFpbHNQYW5lbC5lbmFibGUodGhpcy5mb2N1c2VkTm9kZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRldGFpbHNQYW5lbC5kaXNhYmxlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGlmKHRoaXMuc2VhcmNoUGFuZWwub3BlbiA9PSB0cnVlKSB7XHJcbiAgICAgICAgdGhpcy5zZWFyY2hQYW5lbC51cGRhdGUoY2FudmFzU3RhdGUsIHRpbWUpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBcclxuICAgIGlmKHRoaXMuZGV0YWlsc1BhbmVsLm5vZGUgIT0gbnVsbCkge1xyXG4gICAgICAgIHRoaXMuZGV0YWlsc1BhbmVsLnVwZGF0ZShjYW52YXNTdGF0ZSwgdGltZSwgdGhpcy5mb2N1c2VkTm9kZSk7XHJcbiAgICAgICAgdGhpcy5mb2N1c2VkTm9kZS5kZXRhaWxzQnV0dG9uLnRleHQgPSBcIkxlc3NcIjtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZm9jdXNlZE5vZGUuZGV0YWlsc0J1dHRvbi50ZXh0ID0gXCJNb3JlXCI7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIFxyXG4gICAgdmFyIHQxID0gKDEgLSBNYXRoLmNvcyh0aGlzLnNlYXJjaFBhbmVsLnRyYW5zaXRpb25UaW1lICogTWF0aC5QSSkpLzI7XHJcbiAgICB2YXIgdDIgPSAoMSAtIE1hdGguY29zKHRoaXMuZGV0YWlsc1BhbmVsLnRyYW5zaXRpb25UaW1lICogTWF0aC5QSSkpLzI7XHJcbiAgICBcclxuICAgIHRoaXMuc2VhcmNoRGl2LnN0eWxlLndpZHRoID0gMzAgKiB0MSArIFwidndcIjtcclxuICAgIHRoaXMuZGF0YURpdi5zdHlsZS53aWR0aCA9IDMwICogdDIgKyBcInZ3XCI7XHJcbiAgICB0aGlzLmNhbnZhc0Rpdi5zdHlsZS53aWR0aCA9IDEwMCAtIDMwICogKHQxICsgdDIpICsgXCJ2d1wiOyAgICBcclxuICAgIFxyXG4gICAgdGhpcy5zZWFyY2hQYW5lbEJ1dHRvbi5zdHlsZS5sZWZ0ID0gXCJjYWxjKFwiICsgMzAgKiB0MSArIFwidncgKyAxMnB4KVwiO1xyXG4gICAgXHJcbiAgICBjYW52YXNTdGF0ZS51cGRhdGUoKTtcclxufTtcclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcbkdyYXBoLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY2FudmFzU3RhdGUpIHtcclxuICAgIGNhbnZhc1N0YXRlLmN0eC5zYXZlKCk7XHJcbiAgICBcclxuICAgIC8vdHJhbnNsYXRlIHRvIHRoZSBjZW50ZXIgb2YgdGhlIHNjcmVlblxyXG4gICAgY2FudmFzU3RhdGUuY3R4LnRyYW5zbGF0ZShjYW52YXNTdGF0ZS5jZW50ZXIueCwgY2FudmFzU3RhdGUuY2VudGVyLnkpO1xyXG4gICAgLy9jb25zb2xlLmxvZyhjYW52YXNTdGF0ZS5jZW50ZXIpO1xyXG4gICAgLy9jb25zb2xlLmxvZyhjYW52YXNTdGF0ZSk7XHJcbiAgICAvL2RyYXcgbm9kZXNcclxuICAgIHRoaXMuZm9jdXNlZE5vZGUuZHJhdyhjYW52YXNTdGF0ZSwgcGFpbnRlciwgbnVsbCwgMCwgZXhwYW5kKTtcclxuICAgIFxyXG4gICAgY2FudmFzU3RhdGUuY3R4LnJlc3RvcmUoKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR3JhcGg7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBQYXJzZXIgPSByZXF1aXJlKCcuLi9ib2FyZFBoYXNlL1BhcnNlci5qcycpO1xyXG52YXIgR3JhcGggPSByZXF1aXJlKCcuL0dyYXBoLmpzJyk7XHJcblxyXG52YXIgZ3JhcGhMb2FkZWQ7XHJcblxyXG52YXIgbW91c2VUYXJnZXQ7XHJcbnZhciBncmFwaDtcclxuXHJcbmZ1bmN0aW9uIEdyYXBoUGhhc2UocFRhcmdldFVSTCl7XHJcbiAgICAvL2luaXRpYWxpemUgYmFzZSB2YWx1ZXNcclxuICAgIGdyYXBoTG9hZGVkID0gZmFsc2U7XHJcbiAgICBtb3VzZVRhcmdldCA9IDA7XHJcbiAgICBcclxuICAgIFxyXG4gICAgLy9yZXF1ZXN0IGdyYXBoIGRhdGEgYW5kIHdhaXQgdG8gYmVnaW4gcGFyc2luZ1xyXG4gICAgUGFyc2VyKHBUYXJnZXRVUkwsIGZ1bmN0aW9uKHBKU09ORWxlbWVudHMpe1xyXG4gICAgICAgIGdyYXBoID0gbmV3IEdyYXBoKHBKU09ORWxlbWVudHMpO1xyXG4gICAgICAgIGdyYXBoTG9hZGVkID0gdHJ1ZTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5HcmFwaFBoYXNlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihtb3VzZVN0YXRlLCBjYW52YXNTdGF0ZSwgdGltZSkge1xyXG4gICAgaWYoZ3JhcGhMb2FkZWQpIHtcclxuICAgICAgICBncmFwaC51cGRhdGUobW91c2VTdGF0ZSwgY2FudmFzU3RhdGUsIHRpbWUpO1xyXG4gICAgfVxyXG59XHJcblxyXG5HcmFwaFBoYXNlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY2FudmFzU3RhdGUpIHtcclxuICAgIGlmKGdyYXBoTG9hZGVkKSB7XHJcbiAgICAgICAgZ3JhcGguZHJhdyhjYW52YXNTdGF0ZSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICAvL2lmIHdlIGhhdmVudCBsb2FkZWQgdGhlIGRhdGEsIGRpc3BsYXkgbG9hZGluZywgYW5kIHdhaXRcclxuICAgICAgICBjYW52YXNTdGF0ZS5jdHguc2F2ZSgpO1xyXG4gICAgICAgIGNhbnZhc1N0YXRlLmN0eC5mb250ID0gXCI0MHB4IEFyaWFsXCI7XHJcbiAgICAgICAgY2FudmFzU3RhdGUuY3R4LmZpbGxTdHlsZSA9IFwiI2ZmZlwiO1xyXG4gICAgICAgIGNhbnZhc1N0YXRlLmN0eC50ZXh0QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xyXG4gICAgICAgIGNhbnZhc1N0YXRlLmN0eC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xyXG4gICAgICAgIGNhbnZhc1N0YXRlLmN0eC5maWxsVGV4dChcIkxvYWRpbmcuLi5cIiwgY2FudmFzU3RhdGUuY2VudGVyLngsIGNhbnZhc1N0YXRlLmNlbnRlci55KTtcclxuICAgICAgICBjYW52YXNTdGF0ZS5jdHgucmVzdG9yZSgpO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHcmFwaFBoYXNlOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIFBvaW50ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL1BvaW50LmpzJyk7XHJcbnZhciBCdXR0b24gPSByZXF1aXJlKFwiLi4vLi4vY29udGFpbmVycy9CdXR0b24uanNcIik7XHJcbnZhciBUdXRvcmlhbE5vZGUgPSByZXF1aXJlKCcuL1R1dG9yaWFsTm9kZS5qcycpO1xyXG5cclxudmFyIGxhYmVsQ29ybmVyU2l6ZSA9IDY7XHJcblxyXG52YXIgdGl0bGVGb250U2l6ZSA9IDEyO1xyXG52YXIgdGl0bGVGb250ID0gdGl0bGVGb250U2l6ZStcInB4IEFyaWFsXCI7XHJcblxyXG52YXIgZGVzY3JpcHRvckZvbnRTaXplID0gMTI7XHJcbnZhciBkZXNjcmlwdG9yRm9udCA9IGRlc2NyaXB0b3JGb250U2l6ZStcInB4IEFyaWFsXCI7XHJcblxyXG52YXIgbGluZUJyZWFrID0gNjtcclxuXHJcbi8vY3JlYXRlIGEgbGFiZWwgdG8gcGFpciB3aXRoIGEgbm9kZVxyXG5mdW5jdGlvbiBOb2RlTGFiZWwocFR1dG9yaWFsTm9kZSkge1xyXG4gICAgdGhpcy5ub2RlID0gcFR1dG9yaWFsTm9kZTtcclxuICAgIFxyXG4gICAgdGhpcy5zZXJpZXMgPSB0aGlzLm5vZGUuZGF0YS5zZXJpZXM7XHJcbiAgICB0aGlzLnRpdGxlID0gdGhpcy5ub2RlLmRhdGEudGl0bGU7XHJcbiAgICB0aGlzLmRlc2NyaXB0aW9uID0gdGhpcy5ub2RlLmRhdGEuZGVzY3JpcHRpb247XHJcbiAgICB0aGlzLmRlc2NyaXB0aW9uTGluZXMgPSBudWxsO1xyXG4gICAgXHJcbiAgICB0aGlzLnBvc2l0aW9uID0gbmV3IFBvaW50KFxyXG4gICAgICAgIHRoaXMubm9kZS5wb3NpdGlvbi54LFxyXG4gICAgICAgIHRoaXMubm9kZS5wb3NpdGlvbi55IC0gdGhpcy5ub2RlLnNpemUgLSAxMCk7XHJcbiAgICBcclxuICAgIHRoaXMuZGlzcGxheUZ1bGxEYXRhID0gZmFsc2U7XHJcbn07XHJcblxyXG5Ob2RlTGFiZWwucHJvdG90eXBlLmNhbGN1bGF0ZVRleHRGaXQgPSBmdW5jdGlvbihjdHgsIHBQYWludGVyKSB7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4LmZvbnQgPSB0aXRsZUZvbnQ7XHJcbiAgICB2YXIgc2VyaWVzU2l6ZSA9IGN0eC5tZWFzdXJlVGV4dCh0aGlzLnNlcmllcyk7XHJcbiAgICB2YXIgdGl0bGVTaXplID0gY3R4Lm1lYXN1cmVUZXh0KHRoaXMudGl0bGUpO1xyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxuXHJcbiAgICB0aGlzLnNpemUgPSBuZXcgUG9pbnQoTWF0aC5tYXgoc2VyaWVzU2l6ZS53aWR0aCwgdGl0bGVTaXplLndpZHRoKSwgdGl0bGVGb250U2l6ZSAqIDIpO1xyXG4gICAgXHJcbiAgICBcclxuXHJcbiAgICBpZih0aGlzLmRpc3BsYXlGdWxsRGF0YSkge1xyXG4gICAgICAgIHRoaXMuc2l6ZS54ID0gTWF0aC5tYXgoMjQwLCBNYXRoLm1heChzZXJpZXNTaXplLndpZHRoLCB0aXRsZVNpemUud2lkdGgpKTtcclxuICAgICAgICB0aGlzLmRlc2NyaXB0aW9uTGluZXMgPSBwUGFpbnRlci50ZXh0VG9MaW5lcyhjdHgsIHRoaXMuZGVzY3JpcHRpb24sIGRlc2NyaXB0b3JGb250LCB0aGlzLnNpemUueCk7XHJcbiAgICAgICAgdGhpcy5zaXplLnkgKz0gbGluZUJyZWFrICsgdGhpcy5kZXNjcmlwdGlvbkxpbmVzLmxlbmd0aCAqIGRlc2NyaXB0b3JGb250U2l6ZTtcclxuICAgIH1cclxufTtcclxuXHJcblxyXG5cclxuTm9kZUxhYmVsLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAocE1vdXNlU3RhdGUsIHRpbWUsIGRpc3BsYXlCcmllZikge1xyXG4gICAgXHJcbiAgICBcclxuICAgIC8vZGlyZWN0bHkgYWJvdmUgbm9kZVxyXG4gICAgdGhpcy5kZXNpcmVkUG9zaXRpb24gPSBuZXcgUG9pbnQoXHJcbiAgICAgICAgdGhpcy5ub2RlLnBvc2l0aW9uLngsXHJcbiAgICAgICAgdGhpcy5ub2RlLnBvc2l0aW9uLnkgLSB0aGlzLm5vZGUuc2l6ZSAtIDEyIC0gbGFiZWxDb3JuZXJTaXplKTtcclxuICAgIFxyXG4gICAgaWYodGhpcy5kZXNpcmVkUG9zaXRpb24ueCAhPSB0aGlzLnBvc2l0aW9uLnggfHwgdGhpcy5kZXNpcmVkUG9zaXRpb24ueSAhPSB0aGlzLnBvc2l0aW9uLnkpIHtcclxuICAgICAgICAvL21vdmUgdG93YXJkcyBkZXNpcmVkUG9zaXRpb25cclxuICAgICAgICB2YXIgZGlmID0gbmV3IFBvaW50KFxyXG4gICAgICAgICAgICB0aGlzLmRlc2lyZWRQb3NpdGlvbi54IC0gdGhpcy5wb3NpdGlvbi54LFxyXG4gICAgICAgICAgICB0aGlzLmRlc2lyZWRQb3NpdGlvbi55IC0gdGhpcy5wb3NpdGlvbi55KTtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgc3BlZWRTY2FsYXIgPSBNYXRoLnNxcnQoZGlmLnggKiBkaWYueCArIGRpZi55ICogZGlmLnkpICogdGltZS5kZWx0YVRpbWU7XHJcblxyXG4gICAgICAgIHZhciB2ZWxvY2l0eSA9IG5ldyBQb2ludChkaWYueCAqIHNwZWVkU2NhbGFyLCBkaWYueSAqIHNwZWVkU2NhbGFyKTtcclxuICAgICAgICBpZih2ZWxvY2l0eS54ICogdmVsb2NpdHkueCA8IGRpZi54ICogZGlmLngpIHtcclxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi54ICs9IHZlbG9jaXR5Lng7XHJcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueSArPSB2ZWxvY2l0eS55O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi54ID0gdGhpcy5kZXNpcmVkUG9zaXRpb24ueDtcclxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi55ID0gdGhpcy5kZXNpcmVkUG9zaXRpb24ueTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIFxyXG4gICAgLy9pZiB0aGlzIGlzIHRoZSBwcmltYXJ5IG5vZGUsIGRpc3BsYXkgZGVzY3JpcHRpb25cclxuICAgIGlmKGRpc3BsYXlCcmllZikge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKHRoaXMuZGlzcGxheUZ1bGxEYXRhID09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2l6ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BsYXlGdWxsRGF0YSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAodGhpcy5kaXNwbGF5RnVsbERhdGEgPT0gdHJ1ZSkge1xyXG4gICAgICAgIHRoaXMuYnV0dG9uQ2xpY2tlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc2l6ZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuZGlzcGxheUZ1bGxEYXRhID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBcclxufVxyXG5cclxuTm9kZUxhYmVsLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24ocENhbnZhc1N0YXRlLCBwUGFpbnRlcikge1xyXG4gICAgXHJcbiAgICBpZighdGhpcy5zaXplKSB7XHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVUZXh0Rml0KHBDYW52YXNTdGF0ZS5jdHgsIHBQYWludGVyKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy9kcmF3IGxpbmUgZnJvbSBub2RlIHRvIGxhYmVsXHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LnNhdmUoKTtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHguc3Ryb2tlU3R5bGUgPSBcIiNmZmZcIjtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHgubGluZVdpZHRoID0gMjtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICBcclxuICAgIHBDYW52YXNTdGF0ZS5jdHgubW92ZVRvKFxyXG4gICAgICAgIHRoaXMucG9zaXRpb24ueCxcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnkpO1xyXG4gICAgXHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LmxpbmVUbyhcclxuICAgICAgICB0aGlzLm5vZGUucG9zaXRpb24ueCxcclxuICAgICAgICB0aGlzLm5vZGUucG9zaXRpb24ueSAtIHRoaXMubm9kZS5zaXplKTtcclxuICAgIFxyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5jbG9zZVBhdGgoKTtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHguc3Ryb2tlKCk7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LnJlc3RvcmUoKTtcclxuICAgIFxyXG4gICAgLy9kcmF3IGxhYmVsXHJcbiAgICBwUGFpbnRlci5yb3VuZGVkUmVjdChcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LFxyXG4gICAgICAgIHRoaXMucG9zaXRpb24ueCAtICh0aGlzLnNpemUueCAvIDIpLFxyXG4gICAgICAgIHRoaXMucG9zaXRpb24ueSAtIHRoaXMuc2l6ZS55LFxyXG4gICAgICAgIHRoaXMuc2l6ZS54LFxyXG4gICAgICAgIHRoaXMuc2l6ZS55LFxyXG4gICAgICAgIGxhYmVsQ29ybmVyU2l6ZSxcclxuICAgICAgICB0cnVlLCB0aGlzLm5vZGUuY29sb3IsXHJcbiAgICAgICAgdHJ1ZSwgXCIjZmZmXCIsIDIpO1xyXG4gICAgXHJcbiAgICBcclxuICAgIHBDYW52YXNTdGF0ZS5jdHguc2F2ZSgpO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5maWxsU3R5bGUgPSBcIiNmZmZcIjtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHguZm9udCA9IHRpdGxlRm9udDtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHgudGV4dEJhc2VsaW5lID0gXCJ0b3BcIjtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHgudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHguZmlsbFRleHQoXHJcbiAgICAgICAgdGhpcy5zZXJpZXMsXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi54LFxyXG4gICAgICAgIHRoaXMucG9zaXRpb24ueSAtIHRoaXMuc2l6ZS55KTtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHguZmlsbFRleHQoXHJcbiAgICAgICAgdGhpcy50aXRsZSxcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLngsXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi55IC0gdGhpcy5zaXplLnkgKyB0aXRsZUZvbnRTaXplKTtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHgucmVzdG9yZSgpO1xyXG4gICAgXHJcbiAgICBcclxuICAgIGlmKHRoaXMuZGlzcGxheUZ1bGxEYXRhKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5zYXZlKCk7XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5maWxsU3R5bGUgPSBcIiNmZmZcIjtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LmZvbnQgPSBkZXNjcmlwdG9yRm9udDtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LnRleHRCYXNlbGluZSA9IFwidG9wXCI7XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC50ZXh0QWxpZ24gPSBcImxlZnRcIjtcclxuICAgICAgICBcclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5kZXNjcmlwdGlvbkxpbmVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHBDYW52YXNTdGF0ZS5jdHguZmlsbFRleHQoXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlc2NyaXB0aW9uTGluZXNbaV0sXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnggLSB0aGlzLnNpemUueCAvIDIsXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnkgLSB0aGlzLnNpemUueSArIHRpdGxlRm9udFNpemUgKiAyICsgbGluZUJyZWFrICsgaSAqIGRlc2NyaXB0b3JGb250U2l6ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHgucmVzdG9yZSgpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyAgPSBOb2RlTGFiZWw7IiwiXCJ1c2Ugc3RyaWN0XCJcclxuXHJcbnZhciBxdWVyeURhdGEgPSBbXTtcclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZVF1ZXJ5RGF0YSgpIHtcclxuICAgIHZhciBsaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJRdWVyeUxpc3REYXRhXCIpO1xyXG4gICAgbGlzdC5pbm5lckhUTUwgPSBcIlwiO1xyXG4gICAgaWYocXVlcnlEYXRhLmxlbmd0aCA+IDApIHtcclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgcXVlcnlEYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxpc3QuaW5uZXJIVE1MICs9IFwiPGxpPlwiICsgcXVlcnlEYXRhW2ldLnR5cGUgKyBcIjogXCIgKyBxdWVyeURhdGFbaV0udmFsdWUgKyBcIjwvbGk+XCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2xlYXJxdWVyeWJ1dHRvblwiKS5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmVcIjtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2xlYXJxdWVyeWJ1dHRvblwiKS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICB9XHJcbn07XHJcblxyXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlYXJjaHRleHRidXR0b25cIikub25jbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHF1ZXJ5ID0ge1xyXG4gICAgICAgIHR5cGU6IFwiVGV4dFwiLFxyXG4gICAgICAgIHZhbHVlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlYXJjaHRleHRmaWVsZFwiKS52YWx1ZVxyXG4gICAgfTtcclxuICAgIGlmKHF1ZXJ5LnZhbHVlID09IFwiXCIpXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgcXVlcnlEYXRhLnB1c2gocXVlcnkpO1xyXG4gICAgdXBkYXRlUXVlcnlEYXRhKCk7XHJcbn07XHJcblxyXG5cclxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZWFyY2hsYW5ndWFnZWJ1dHRvblwiKS5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcXVlcnkgPSB7XHJcbiAgICAgICAgdHlwZTogXCJMYW5ndWFnZVwiLFxyXG4gICAgICAgIHZhbHVlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlYXJjaGxhbmd1YWdlZmllbGRcIikudmFsdWVcclxuICAgIH07XHJcbiAgICBpZihxdWVyeS52YWx1ZSA9PSBcIkFueVwiKVxyXG4gICAgICAgIHJldHVybjtcclxuICAgIHF1ZXJ5RGF0YS5wdXNoKHF1ZXJ5KTtcclxuICAgIHVwZGF0ZVF1ZXJ5RGF0YSgpO1xyXG59O1xyXG5cclxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZWFyY2h0YWdidXR0b25cIikub25jbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHF1ZXJ5ID0ge1xyXG4gICAgICAgIHR5cGU6IFwiVGFnXCIsXHJcbiAgICAgICAgdmFsdWU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2VhcmNodGFnZmllbGRcIikudmFsdWVcclxuICAgIH07XHJcbiAgICBpZihxdWVyeS52YWx1ZSA9PSBcIkFueVwiKVxyXG4gICAgICAgIHJldHVybjtcclxuICAgIHF1ZXJ5RGF0YS5wdXNoKHF1ZXJ5KTtcclxuICAgIHVwZGF0ZVF1ZXJ5RGF0YSgpO1xyXG59O1xyXG5cclxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjbGVhcnF1ZXJ5YnV0dG9uXCIpLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcclxuICAgIHF1ZXJ5RGF0YSA9IFtdO1xyXG4gICAgdXBkYXRlUXVlcnlEYXRhKCk7XHJcbn07XHJcblxyXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlYXJjaGJ1dHRvblwiKS5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICBcclxufTtcclxuXHJcblxyXG5mdW5jdGlvbiBTZWFyY2hQYW5lbChncmFwaCkge1xyXG4gICAgdGhpcy5ncmFwaCA9IGdyYXBoO1xyXG4gICAgdGhpcy5vcGVuID0gZmFsc2U7XHJcbiAgICB0aGlzLnRyYW5zaXRpb25PbiA9IGZhbHNlO1xyXG4gICAgdGhpcy50cmFuc2l0aW9uVGltZSA9IDA7XHJcbiAgICB0aGlzLm9wdGlvbnNEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxlZnRCYXJcIik7XHJcbiAgICBcclxuICAgIHRoaXMuc2VhcmNoQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZWFyY2hidXR0b25cIik7XHJcbiAgICBcclxuICAgIFxyXG4gICAgdGhpcy5zZWFyY2hCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uICh0aGF0KSB7XHJcbiAgICAgICAgLy9wYXJzZSBkYXRhIHRvIGZpbmQgbWF0Y2hpbmcgcmVzdWx0c1xyXG4gICAgICAgIHZhciBzZWFyY2hSZXN1bHRzID0gdGhhdC5zZWFyY2gocXVlcnlEYXRhLCB0aGF0LmdyYXBoLm5vZGVzKTtcclxuICAgICAgICBcclxuICAgICAgICAvL2Rpc3BsYXkgcmVzdWx0c1xyXG4gICAgICAgIHZhciBkaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlYXJjaHJlc3VsdHNcIik7XHJcbiAgICAgICAgaWYoc2VhcmNoUmVzdWx0cy5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICBkaXYuaW5uZXJIVE1MID0gXCJObyBNYXRjaGluZyBSZXN1bHRzIEZvdW5kLlwiO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGRpdi5pbm5lckhUTUwgPSBcIlwiO1xyXG4gICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBzZWFyY2hSZXN1bHRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIC8vY3JlYXRlIGxpc3QgdGFnXHJcbiAgICAgICAgICAgIHZhciBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKTtcclxuICAgICAgICAgICAgLy9zZXQgdGl0bGUgYXMgdGV4dFxyXG4gICAgICAgICAgICBsaS5pbm5lckhUTUwgPSBzZWFyY2hSZXN1bHRzW2ldLmRhdGEudGl0bGU7XHJcbiAgICAgICAgICAgIC8vYWRkIGV2ZW50IHRvIGZvY3VzIHRoZSBub2RlIGlmIGl0cyBjbGlja2VkXHJcbiAgICAgICAgICAgIGxpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbih0aGF0LCBub2RlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmdyYXBoLkZvY3VzTm9kZShub2RlKTtcclxuICAgICAgICAgICAgfS5iaW5kKGxpLCB0aGF0LCBzZWFyY2hSZXN1bHRzW2ldKSk7XHJcbiAgICAgICAgICAgIC8vYWRkIHRoZSB0YWcgdG8gdGhlIHBhZ2VcclxuICAgICAgICAgICAgZGl2LmFwcGVuZENoaWxkKGxpKTtcclxuICAgICAgICB9XHJcbiAgICB9LmJpbmQodGhpcy5zZWFyY2hCdXR0b24sIHRoaXMpKTtcclxufTtcclxuXHJcblxyXG5cclxuXHJcblNlYXJjaFBhbmVsLnByb3RvdHlwZS5zZWFyY2ggPSBmdW5jdGlvbihxdWVyeSwgbm9kZXMpIHtcclxuICAgIHZhciByZXN1bHRzID0gW107XHJcbiAgICBcclxuICAgIFxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG5vZGUgPSBub2Rlc1tpXS5kYXRhO1xyXG4gICAgICAgIHZhciBtYXRjaCA9IHRydWU7XHJcbiAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IHF1ZXJ5Lmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIGlmKHF1ZXJ5W2pdLnR5cGUgPT09IFwiVGV4dFwiKSB7XHJcbiAgICAgICAgICAgICAgICBpZihub2RlLnRpdGxlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihxdWVyeVtqXS52YWx1ZS50b0xvd2VyQ2FzZSgpKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZihub2RlLnNlcmllcy50b0xvd2VyQ2FzZSgpLmluZGV4T2YocXVlcnlbal0udmFsdWUudG9Mb3dlckNhc2UoKSkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKG5vZGUuZGVzY3JpcHRpb24udG9Mb3dlckNhc2UoKS5pbmRleE9mKHF1ZXJ5W2pdLnZhbHVlLnRvTG93ZXJDYXNlKCkpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2ggPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYocXVlcnlbal0udHlwZSA9PT0gXCJMYW5ndWFnZVwiKSB7XHJcbiAgICAgICAgICAgICAgICBpZihub2RlLmxhbmd1YWdlICE9PSBxdWVyeVtqXS52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1hdGNoID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdGFnTWF0Y2ggPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGZvcih2YXIgayA9IDA7IGsgPCBub2RlLnRhZ3MubGVuZ3RoOyBrKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZihub2RlLnRhZ3Nba10gPT0gcXVlcnlbal0udmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFnTWF0Y2ggPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmKHRhZ01hdGNoID09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2ggPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvL2lmIHdlIHBhc3NlZCBhbGwgdGhhdCBjcmFwLCB3ZSBoYXZlIGEgbWF0Y2ghXHJcbiAgICAgICAgaWYobWF0Y2ggPT09IHRydWUpIHsgXHJcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaChub2Rlc1tpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZXR1cm4gcmVzdWx0cztcclxufTtcclxuXHJcblxyXG5TZWFyY2hQYW5lbC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oY2FudmFzU3RhdGUsIHRpbWUpIHtcclxuICAgIFxyXG4gICAgLy90cmFuc2l0aW9uIG9uXHJcbiAgICBpZih0aGlzLnRyYW5zaXRpb25Pbikge1xyXG4gICAgICAgIGlmKHRoaXMudHJhbnNpdGlvblRpbWUgPCAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvblRpbWUgKz0gdGltZS5kZWx0YVRpbWUgKiAzO1xyXG4gICAgICAgICAgICBpZih0aGlzLnRyYW5zaXRpb25UaW1lID49IDEpIHtcclxuICAgICAgICAgICAgICAgIC8vZG9uZSB0cmFuc2l0aW9uaW5nXHJcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25UaW1lID0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vdHJhbnNpdGlvbiBvZmZcclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGlmKHRoaXMudHJhbnNpdGlvblRpbWUgPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvblRpbWUgLT0gdGltZS5kZWx0YVRpbWUgKiAzO1xyXG4gICAgICAgICAgICBpZih0aGlzLnRyYW5zaXRpb25UaW1lIDw9IDApIHtcclxuICAgICAgICAgICAgICAgIC8vZG9uZSB0cmFuc2l0aW9uaW5nXHJcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25UaW1lID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMub3BlbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNlYXJjaFBhbmVsOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIFBvaW50ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL1BvaW50LmpzJyk7XHJcbnZhciBOb2RlTGFiZWwgPSByZXF1aXJlKCcuL05vZGVMYWJlbC5qcycpO1xyXG52YXIgQnV0dG9uID0gcmVxdWlyZSgnLi4vLi4vY29udGFpbmVycy9CdXR0b24uanMnKTtcclxuXHJcbnZhciBob3Jpem9udGFsU3BhY2luZyA9IDE4MDtcclxuXHJcbnZhciBUdXRvcmlhbFN0YXRlID0ge1xyXG4gICAgTG9ja2VkOiAwLFxyXG4gICAgVW5sb2NrZWQ6IDEsXHJcbiAgICBDb21wbGV0ZWQ6IDJcclxufTtcclxuXHJcbnZhciBUdXRvcmlhbFRhZ3MgPSB7XHJcbiAgICBcIkFJXCI6IFwiIzgwNFwiLFxyXG4gICAgXCJBdWRpb1wiOiBcIiMwNDhcIixcclxuICAgIFwiQ29tcHV0ZXIgU2NpZW5jZVwiOiBcIiMxMTFcIixcclxuICAgIFwiQ29yZVwiOiBcIiMzMzNcIixcclxuICAgIFwiR3JhcGhpY3NcIjogXCIjYzBjXCIsXHJcbiAgICBcIklucHV0XCI6IFwiIzg4MFwiLFxyXG4gICAgXCJNYXRoXCI6IFwiIzQ4NFwiLFxyXG4gICAgXCJOZXR3b3JraW5nXCI6IFwiI2M2MFwiLFxyXG4gICAgXCJPcHRpbWl6YXRpb25cIjogXCIjMjgyXCIsXHJcbiAgICBcIlBoeXNpY3NcIjogXCIjMDQ4XCIsXHJcbiAgICBcIlNjcmlwdGluZ1wiOiBcIiMwODhcIixcclxuICAgIFwiU29mdHdhcmVFbmdpbmVlcmluZ1wiOiBcIiM4NDRcIlxyXG59O1xyXG5cclxuXHJcbi8vbWFrZSBhIG5vZGUgd2l0aCBzb21lIGRhdGFcclxuZnVuY3Rpb24gVHV0b3JpYWxOb2RlKEpTT05DaHVuaykge1xyXG4gICAgdGhpcy5kYXRhID0gSlNPTkNodW5rO1xyXG4gICAgdGhpcy5wcmltYXJ5VGFnID0gdGhpcy5kYXRhLnRhZ3NbMF07XHJcbiAgICB0aGlzLmNvbG9yID0gVHV0b3JpYWxUYWdzW3RoaXMucHJpbWFyeVRhZ107XHJcbiAgICBcclxuICAgIHRoaXMuc3RhdGUgPSBUdXRvcmlhbFN0YXRlLkxvY2tlZDtcclxuICAgIHRoaXMubW91c2VPdmVyID0gZmFsc2U7XHJcbiAgICBcclxuICAgIFxyXG4gICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBQb2ludCgwLCAwKTtcclxuICAgIHRoaXMucHJldmlvdXNQb3NpdGlvbiA9IG5ldyBQb2ludCgwLCAwKTtcclxuICAgIHRoaXMubmV4dFBvc2l0aW9uID0gbmV3IFBvaW50KDAsIDApO1xyXG4gICAgXHJcbiAgICB0aGlzLnNpemUgPSAyNDtcclxuICAgIHRoaXMubGFiZWwgPSBuZXcgTm9kZUxhYmVsKHRoaXMpO1xyXG4gICAgICAgIFxyXG4gICAgdGhpcy5uZXh0Tm9kZXMgPSBbXTtcclxuICAgIHRoaXMucHJldmlvdXNOb2RlcyA9IFtdO1xyXG4gICAgXHJcbiAgICB0aGlzLmRldGFpbHNCdXR0b24gPSBuZXcgQnV0dG9uKG5ldyBQb2ludCgwLCAwKSwgbmV3IFBvaW50KDcyLCAzNiksIFwiTW9yZVwiLCB0aGlzLmNvbG9yKTtcclxuICAgIFxyXG59O1xyXG5cclxuLy9yZWN1cnNpdmUgZnVuY3Rpb24gdG8gZ2V0IHByZXZpb3VzIG5vZGVzXHJcblR1dG9yaWFsTm9kZS5wcm90b3R5cGUuZ2V0UHJldmlvdXMgPSBmdW5jdGlvbihkZXB0aCkge1xyXG4gICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgcmVzdWx0LnB1c2godGhpcyk7XHJcbiAgICBpZihkZXB0aCA+IDApIHtcclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5wcmV2aW91c05vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBwcmV2aW91cyA9IHRoaXMucHJldmlvdXNOb2Rlc1tpXS5nZXRQcmV2aW91cyhkZXB0aC0xKTtcclxuICAgICAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IHByZXZpb3VzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChwcmV2aW91c1tqXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59O1xyXG5cclxuXHJcblxyXG4vL3JlY3Vyc2l2ZSBmdW5jdGlvbiB0byBnZXQgbmV4dCBub2Rlc1xyXG5UdXRvcmlhbE5vZGUucHJvdG90eXBlLmdldE5leHQgPSBmdW5jdGlvbihkZXB0aCkge1xyXG4gICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgcmVzdWx0LnB1c2godGhpcyk7XHJcbiAgICBpZihkZXB0aCA+IDApIHtcclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5uZXh0Tm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIHByZXZpb3VzID0gdGhpcy5uZXh0Tm9kZXNbaV0uZ2V0TmV4dChkZXB0aC0xKTtcclxuICAgICAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IHByZXZpb3VzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChwcmV2aW91c1tqXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59O1xyXG5cclxuLy9kaXJlY3Rpb24gaXMgdGhlIHNpZGUgb2YgdGhlIHBhcmVudCB0aGlzIG5vZGUgZXhpc3RzIG9uXHJcbi8vbGF5ZXIgZGVwdGggaXMgaG93IG1hbnkgbGF5ZXJzIHRvIHJlbmRlciBvdXRcclxuVHV0b3JpYWxOb2RlLnByb3RvdHlwZS5yZWN1cnNpdmVVcGRhdGUgPSBmdW5jdGlvbihkaXJlY3Rpb24sIGRlcHRoKSB7XHJcbiAgICBpZihkZXB0aCA+IDApIHtcclxuICAgICAgICBpZihkaXJlY3Rpb24gPCAxKSB7XHJcbiAgICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLnByZXZpb3VzTm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJldmlvdXNOb2Rlc1tpXS5yZWN1cnNpdmVVcGRhdGUoLTEsIGRlcHRoIC0gMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoZGlyZWN0aW9uID4gLTEpIHtcclxuICAgICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMubmV4dE5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5leHROb2Rlc1tpXS5yZWN1cnNpdmVVcGRhdGUoMSwgZGVwdGggLSAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8vdXBkYXRlcyBhIG5vZGVcclxuLy90cmFuc2l0aW9uIHRpbWUgaXMgMS0wLCB3aXRoIDAgYmVpbmcgdGhlIGZpbmFsIGxvY2F0aW9uXHJcblR1dG9yaWFsTm9kZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24obW91c2VTdGF0ZSwgdGltZSwgdHJhbnNpdGlvblRpbWUsIGlzRm9jdXNlZCkge1xyXG4gICAgXHJcbiAgICAvL21vdmUgdGhlIG5vZGVcclxuICAgIGlmKHRoaXMucG9zaXRpb24gIT0gdGhpcy5uZXh0UG9zaXRpb24pIHtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnggPSAodGhpcy5wcmV2aW91c1Bvc2l0aW9uLnggKiB0cmFuc2l0aW9uVGltZSkgKyAodGhpcy5uZXh0UG9zaXRpb24ueCAqICgxIC0gdHJhbnNpdGlvblRpbWUpKTtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnkgPSAodGhpcy5wcmV2aW91c1Bvc2l0aW9uLnkgKiB0cmFuc2l0aW9uVGltZSkgKyAodGhpcy5uZXh0UG9zaXRpb24ueSAqICgxIC0gdHJhbnNpdGlvblRpbWUpKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYoaXNGb2N1c2VkKSB7XHJcbiAgICAgICAgdGhpcy5zaXplID0gMzY7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICAvL3Rlc3QgaWYgbW91c2UgaXMgaW5zaWRlIGNpcmNsZVxyXG4gICAgICAgIHZhciBkeCA9IG1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbi54IC0gdGhpcy5wb3NpdGlvbi54O1xyXG4gICAgICAgIHZhciBkeSA9IG1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbi55IC0gdGhpcy5wb3NpdGlvbi55O1xyXG4gICAgICAgIGlmKChkeCAqIGR4KSArIChkeSAqIGR5KSA8IHRoaXMuc2l6ZSAqIHRoaXMuc2l6ZSkge1xyXG4gICAgICAgICAgICB0aGlzLnNpemUgPSAzMDtcclxuICAgICAgICAgICAgdGhpcy5tb3VzZU92ZXIgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zaXplID0gMjQ7XHJcbiAgICAgICAgICAgIHRoaXMubW91c2VPdmVyID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBcclxuICAgIFxyXG4gICAgdGhpcy5sYWJlbC51cGRhdGUobW91c2VTdGF0ZSwgdGltZSwgaXNGb2N1c2VkKTtcclxuICAgIFxyXG4gICAgaWYoaXNGb2N1c2VkKSB7XHJcbiAgICAgICAgdGhpcy5kZXRhaWxzQnV0dG9uLnBvc2l0aW9uLnggPSB0aGlzLnBvc2l0aW9uLnggLSB0aGlzLmRldGFpbHNCdXR0b24uc2l6ZS54IC8gMiAtIDM7XHJcbiAgICAgICAgdGhpcy5kZXRhaWxzQnV0dG9uLnBvc2l0aW9uLnkgPSB0aGlzLnBvc2l0aW9uLnkgKyB0aGlzLnNpemUgKyAxMjtcclxuICAgICAgICB0aGlzLmRldGFpbHNCdXR0b24udXBkYXRlKG1vdXNlU3RhdGUpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuXHJcblR1dG9yaWFsTm9kZS5wcm90b3R5cGUuc2V0VHJhbnNpdGlvbiA9IGZ1bmN0aW9uKGxheWVyRGVwdGgsIHBhcmVudCwgZGlyZWN0aW9uLCB0YXJnZXRQb3NpdGlvbikge1xyXG4gICAgXHJcbiAgICAvL2RvbnQgbWVzcyB3aXRoIG5vZGUgcG9zaXRpb24gaWYgaXQgYWxyZWFkeSBleGlzdHMgaW4gdGhlIGdyYXBoXHJcbiAgICBpZih0aGlzLnVzZWRJbkdyYXBoKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB0aGlzLnVzZWRJbkdyYXBoID0gdHJ1ZTtcclxuICAgIFxyXG4gICAgXHJcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcclxuICAgIHRoaXMucHJldmlvdXNQb3NpdGlvbiA9IHRoaXMucG9zaXRpb247XHJcbiAgICB0aGlzLm5leHRQb3NpdGlvbiA9IHRhcmdldFBvc2l0aW9uO1xyXG4gICAgXHJcbiAgICAvL2ZpZ3VyZSBvdXQgc2l6ZSBvZiBjaGlsZHJlbiB0byBzcGFjZSB0aGVtIG91dCBhcHByb3ByaWF0ZWx5XHJcbiAgICBpZihsYXllckRlcHRoID4gMCkge1xyXG4gICAgICAgIHZhciB4UG9zaXRpb247XHJcbiAgICAgICAgdmFyIHlQb3NpdGlvbjtcclxuICAgICAgICBcclxuICAgICAgICAvL2xlZnQgb3IgbWlkZGxlXHJcbiAgICAgICAgaWYoZGlyZWN0aW9uIDwgMSkge1xyXG4gICAgICAgICAgICB2YXIgdG90YWxMZWZ0SGVpZ2h0ID0gdGhpcy5nZXRQcmV2aW91c0hlaWdodChsYXllckRlcHRoKTtcclxuICAgICAgICAgICAgeFBvc2l0aW9uID0gdGFyZ2V0UG9zaXRpb24ueCAtIGhvcml6b250YWxTcGFjaW5nO1xyXG4gICAgICAgICAgICBpZihkaXJlY3Rpb24gPT0gMCkgeFBvc2l0aW9uIC09IDYwO1xyXG4gICAgICAgICAgICB5UG9zaXRpb24gPSB0YXJnZXRQb3NpdGlvbi55IC0gKHRvdGFsTGVmdEhlaWdodCAvIDIpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMucHJldmlvdXNOb2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHBsYWNlbWVudCA9IG5ldyBQb2ludCh4UG9zaXRpb24sIHlQb3NpdGlvbiArIHRoaXMucHJldmlvdXNOb2Rlc1tpXS5jdXJyZW50SGVpZ2h0IC8gMik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByZXZpb3VzTm9kZXNbaV0uc2V0VHJhbnNpdGlvbihsYXllckRlcHRoIC0gMSwgdGhpcywgLTEsIHBsYWNlbWVudCk7XHJcbiAgICAgICAgICAgICAgICAvKmlmKCF0aGlzLndhc1ByZXZpb3VzbHlPblNjcmVlbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJldmlvdXNOb2Rlc1tpXS5wb3NpdGlvbiA9IG5ldyBQb2ludCgtMTAwMCwgcGxhY2VtZW50LnkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJldmlvdXNOb2Rlc1tpXS5wcmV2aW91c1Bvc2l0aW9uID0gbmV3IFBvaW50KC0xMDAwLCBwbGFjZW1lbnQueSk7XHJcbiAgICAgICAgICAgICAgICB9Ki9cclxuICAgICAgICAgICAgICAgIHlQb3NpdGlvbiArPSB0aGlzLnByZXZpb3VzTm9kZXNbaV0uY3VycmVudEhlaWdodDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvL3JpZ2h0IG9yIG1pZGRsZVxyXG4gICAgICAgIGlmKGRpcmVjdGlvbiA+IC0xKSB7XHJcbiAgICAgICAgICAgIHZhciB0b3RhbFJpZ2h0SGVpZ2h0ID0gdGhpcy5nZXROZXh0SGVpZ2h0KGxheWVyRGVwdGgpO1xyXG4gICAgICAgICAgICB4UG9zaXRpb24gPSB0YXJnZXRQb3NpdGlvbi54ICsgaG9yaXpvbnRhbFNwYWNpbmc7XHJcbiAgICAgICAgICAgIGlmKGRpcmVjdGlvbiA9PSAwKSB4UG9zaXRpb24gKz0gNjA7XHJcbiAgICAgICAgICAgIHlQb3NpdGlvbiA9IHRhcmdldFBvc2l0aW9uLnkgLSAodG90YWxSaWdodEhlaWdodCAvIDIpO1xyXG5cclxuICAgICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMubmV4dE5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcGxhY2VtZW50ID0gbmV3IFBvaW50KHhQb3NpdGlvbiwgeVBvc2l0aW9uICsgdGhpcy5uZXh0Tm9kZXNbaV0uY3VycmVudEhlaWdodCAvIDIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uZXh0Tm9kZXNbaV0uc2V0VHJhbnNpdGlvbihsYXllckRlcHRoIC0gMSwgdGhpcywgMSwgcGxhY2VtZW50KTtcclxuICAgICAgICAgICAgICAgIC8qaWYoIXRoaXMud2FzUHJldmlvdXNseU9uU2NyZWVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXh0Tm9kZXNbaV0ucG9zaXRpb24gPSBuZXcgUG9pbnQoMTAwMCwgcGxhY2VtZW50LnkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmV4dE5vZGVzW2ldLnByZXZpb3VzUG9zaXRpb24gPSBuZXcgUG9pbnQoMTAwMCwgcGxhY2VtZW50LnkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidGhyb3cgdGhlIHN3aXRjaCFcIik7XHJcbiAgICAgICAgICAgICAgICB9Ki9cclxuICAgICAgICAgICAgICAgIHlQb3NpdGlvbiArPSB0aGlzLm5leHROb2Rlc1tpXS5jdXJyZW50SGVpZ2h0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuVHV0b3JpYWxOb2RlLnByb3RvdHlwZS5nZXRQcmV2aW91c0hlaWdodCA9IGZ1bmN0aW9uKGxheWVyRGVwdGgpIHtcclxuICAgIHRoaXMuY3VycmVudEhlaWdodCA9IDA7XHJcbiAgICBpZihsYXllckRlcHRoID4gMCAmJiB0aGlzLnByZXZpb3VzTm9kZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLnByZXZpb3VzTm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50SGVpZ2h0ICs9IHRoaXMucHJldmlvdXNOb2Rlc1tpXS5nZXRQcmV2aW91c0hlaWdodChsYXllckRlcHRoIC0gMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50SGVpZ2h0ID0gMjQgKiA1O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50SGVpZ2h0O1xyXG59O1xyXG5cclxuVHV0b3JpYWxOb2RlLnByb3RvdHlwZS5nZXROZXh0SGVpZ2h0ID0gZnVuY3Rpb24obGF5ZXJEZXB0aCkge1xyXG4gICAgdGhpcy5jdXJyZW50SGVpZ2h0ID0gMDtcclxuICAgIGlmKGxheWVyRGVwdGggPiAwICYmIHRoaXMubmV4dE5vZGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5uZXh0Tm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50SGVpZ2h0ICs9IHRoaXMubmV4dE5vZGVzW2ldLmdldE5leHRIZWlnaHQobGF5ZXJEZXB0aCAtIDEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMuY3VycmVudEhlaWdodCA9IHRoaXMuc2l6ZSAqIDU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJldHVybiB0aGlzLmN1cnJlbnRIZWlnaHQ7XHJcbn07XHJcblxyXG5cclxuVHV0b3JpYWxOb2RlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24ocENhbnZhc1N0YXRlLCBwUGFpbnRlciwgcGFyZW50Q2FsbGVyLCBkaXJlY3Rpb24sIGxheWVyRGVwdGgpIHtcclxuICAgIC8vZHJhdyBsaW5lIHRvIHBhcmVudCBpZiBwb3NzaWJsZVxyXG4gICAgaWYocGFyZW50Q2FsbGVyICYmIHBhcmVudENhbGxlciA9PSB0aGlzLnBhcmVudCkge1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHguc2F2ZSgpO1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHgubGluZVdpZHRoID0gMjtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LnN0cm9rZVN0eWxlID0gXCIjZmZmXCI7XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICBcclxuICAgICAgICAvL3ZhciBiZXR3ZWVuID0gbmV3IFBvaW50KHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55KTtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4Lm1vdmVUbyh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSk7XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5saW5lVG8ocGFyZW50Q2FsbGVyLnBvc2l0aW9uLngsIHBhcmVudENhbGxlci5wb3NpdGlvbi55KTtcclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LmNsb3NlUGF0aCgpO1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHguc3Ryb2tlKCk7XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5yZXN0b3JlKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vZHJhdyBjaGlsZCBub2Rlc1xyXG4gICAgaWYobGF5ZXJEZXB0aCA+IDApe1xyXG4gICAgICAgIGlmKGRpcmVjdGlvbiA8IDEpIHtcclxuICAgICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMucHJldmlvdXNOb2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcmV2aW91c05vZGVzW2ldLmRyYXcocENhbnZhc1N0YXRlLCBwUGFpbnRlciwgdGhpcywgLTEsIGxheWVyRGVwdGggLSAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZihkaXJlY3Rpb24gPiAtMSkge1xyXG4gICAgICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5uZXh0Tm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubmV4dE5vZGVzW2ldLmRyYXcocENhbnZhc1N0YXRlLCBwUGFpbnRlciwgdGhpcywgMSwgbGF5ZXJEZXB0aCAtIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvL2RyYXcgY2lyY2xlXHJcbiAgICBwUGFpbnRlci5jaXJjbGUocENhbnZhc1N0YXRlLmN0eCwgdGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnksIHRoaXMuc2l6ZSwgdHJ1ZSwgdGhpcy5jb2xvciwgdHJ1ZSwgXCIjZmZmXCIsIDIpO1xyXG4gICAgXHJcbiAgICB0aGlzLmxhYmVsLmRyYXcocENhbnZhc1N0YXRlLCBwUGFpbnRlcik7XHJcbiAgICBpZihkaXJlY3Rpb24gPT0gMCkge1xyXG4gICAgICAgIHRoaXMuZGV0YWlsc0J1dHRvbi5kcmF3KHBDYW52YXNTdGF0ZSwgcFBhaW50ZXIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFR1dG9yaWFsTm9kZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmZ1bmN0aW9uIFNlbGVjdFBoYXNlKHBUYXJnZXRVUkwpe1xyXG4gICAgLy9cclxuICAgIGJvYXJkTG9hZGVkID0gZmFsc2U7XHJcbiAgICBtb3VzZVRhcmdldCA9IDA7XHJcbiAgICBcclxuICAgIC8vaW5zdGFudGlhdGUgbGlicmFyaWVzXHJcbiAgICBwYWludGVyID0gbmV3IERyYXdMaWIoKTtcclxuICAgIHV0aWxpdHkgPSBuZXcgVXRpbGl0aWVzKCk7XHJcbiAgICBcclxuICAgIC8vcmVhZHMgZGF0YSBmcm9tIHRhcmdldCBVUkwgYW5kIGNvbm5lY3RzIGNhbGxiYWNrXHJcbiAgICBwYXJzZXIgPSBuZXcgUGFyc2VyKHBUYXJnZXRVUkwsIGJvYXJkTG9hZGVkQ2FsbGJhY2spO1xyXG4gICAgXHJcbiAgICBcclxuICAgIC8vaW5zZXJ0IGh0bWxcclxuICAgIHBvcHVsYXRlRHluYW1pY0NvbnRlbnQoKTtcclxufVxyXG5cclxuU2VsZWN0UGhhc2UucHJvdG90eXBlLmFjdCA9IGZ1bmN0aW9uKCl7XHJcbiAgICBcclxufVxyXG5cclxuU2VsZWN0UGhhc2UucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbigpe1xyXG4gICAgXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2VsZWN0UGhhc2U7Il19
