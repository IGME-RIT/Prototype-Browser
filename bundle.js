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
    
    //variable and loop initialization
    initializeVariables();
    loop();
}

//initialization for variables, mouse events, and game "class"
function initializeVariables(){
    //camvas initialization
    canvas = document.querySelector('canvas');
    ctx = canvas.getContext('2d');
    
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
},{"./libraries/Drawlib.js":9,"./libraries/Utilities.js":10,"./phases/graphPhase/GraphPhase.js":13}],3:[function(require,module,exports){
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
},{"./libraries/Drawlib.js":9,"./libraries/Utilities.js":10,"./phases/graphPhase/GraphPhase.js":13,"dup":2}],9:[function(require,module,exports){
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
},{"../common/Point.js":3}],11:[function(require,module,exports){
"use strict"

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
    
    html += "<ul id='tags'>";
    if(this.data.tags.length != 0) {
        for(var i = 0; i < this.data.tags.length; i++) {
            html += "<li style='background-color:" + TutorialTags[this.data.tags[i]] + "'>" + this.data.tags[i] + "</li>";
        }
    }
    html+= "</ul>"
    
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
},{}],12:[function(require,module,exports){
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
        this.activeNodes[i].currentLayerDepth = 0;
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
},{"../../common/Point.js":3,"../../libraries/Drawlib.js":9,"./DetailsPanel.js":11,"./SearchPanel.js":16,"./TutorialNode.js":17}],13:[function(require,module,exports){
"use strict";
var Parser = require('../graphPhase/Parser.js');
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
},{"../graphPhase/Parser.js":15,"./Graph.js":12}],14:[function(require,module,exports){
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
},{"../../common/Point.js":3,"../../containers/Button.js":4,"./TutorialNode.js":17}],15:[function(require,module,exports){
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
},{}],16:[function(require,module,exports){
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
},{}],17:[function(require,module,exports){
"use strict";

var Point = require('../../common/Point.js');
var NodeLabel = require('./NodeLabel.js');
var Button = require('../../containers/Button.js');

var horizontalSpacing = 180;
var baseSize = 24;

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
    if(this.currentLayerDepth > 0 && this.currentLayerDepth < layerDepth) {
        return;
    }
    
    this.currentLayerDepth = layerDepth;
    
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
        this.currentHeight = baseSize * 5;
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
        this.currentHeight = baseSize * 5;
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
},{"../../common/Point.js":3,"../../containers/Button.js":4,"./NodeLabel.js":14}]},{},[1,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9tYWluLmpzIiwianMvbW9kdWxlcy9HYW1lLmpzIiwianMvbW9kdWxlcy9jb21tb24vUG9pbnQuanMiLCJqcy9tb2R1bGVzL2NvbnRhaW5lcnMvQnV0dG9uLmpzIiwianMvbW9kdWxlcy9jb250YWluZXJzL0NhbnZhc1N0YXRlLmpzIiwianMvbW9kdWxlcy9jb250YWluZXJzL01vdXNlU3RhdGUuanMiLCJqcy9tb2R1bGVzL2NvbnRhaW5lcnMvVGltZS5qcyIsImpzL21vZHVsZXMvbGlicmFyaWVzL0RyYXdsaWIuanMiLCJqcy9tb2R1bGVzL2xpYnJhcmllcy9VdGlsaXRpZXMuanMiLCJqcy9tb2R1bGVzL3BoYXNlcy9ncmFwaFBoYXNlL0RldGFpbHNQYW5lbC5qcyIsImpzL21vZHVsZXMvcGhhc2VzL2dyYXBoUGhhc2UvR3JhcGguanMiLCJqcy9tb2R1bGVzL3BoYXNlcy9ncmFwaFBoYXNlL0dyYXBoUGhhc2UuanMiLCJqcy9tb2R1bGVzL3BoYXNlcy9ncmFwaFBoYXNlL05vZGVMYWJlbC5qcyIsImpzL21vZHVsZXMvcGhhc2VzL2dyYXBoUGhhc2UvUGFyc2VyLmpzIiwianMvbW9kdWxlcy9waGFzZXMvZ3JhcGhQaGFzZS9TZWFyY2hQYW5lbC5qcyIsImpzL21vZHVsZXMvcGhhc2VzL2dyYXBoUGhhc2UvVHV0b3JpYWxOb2RlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDektBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xyXG4vL2ltcG9ydHNcclxudmFyIEdhbWUgPSByZXF1aXJlKCcuL21vZHVsZXMvR2FtZS5qcycpO1xyXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuL21vZHVsZXMvY29tbW9uL1BvaW50LmpzJyk7XHJcbnZhciBUaW1lID0gcmVxdWlyZSgnLi9tb2R1bGVzL2NvbnRhaW5lcnMvVGltZS5qcycpO1xyXG52YXIgTW91c2VTdGF0ZSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9jb250YWluZXJzL01vdXNlU3RhdGUuanMnKTtcclxudmFyIENhbnZhc1N0YXRlID0gcmVxdWlyZSgnLi9tb2R1bGVzL2NvbnRhaW5lcnMvQ2FudmFzU3RhdGUuanMnKTtcclxuXHJcbi8vZ2FtZSBvYmplY3RzXHJcbnZhciBnYW1lO1xyXG52YXIgY2FudmFzO1xyXG52YXIgY3R4O1xyXG52YXIgdGltZTtcclxuXHJcbi8vcmVzcG9uc2l2ZW5lc3NcclxudmFyIGhlYWRlcjtcclxudmFyIGNlbnRlcjtcclxudmFyIHNjYWxlO1xyXG5cclxuLy9tb3VzZSBoYW5kbGluZ1xyXG52YXIgbW91c2VQb3NpdGlvbjtcclxudmFyIHJlbGF0aXZlTW91c2VQb3NpdGlvbjtcclxudmFyIG1vdXNlRG93bjtcclxudmFyIG1vdXNlSW47XHJcbnZhciB3aGVlbERlbHRhO1xyXG5cclxuLy9wYXNzYWJsZSBzdGF0ZXNcclxudmFyIG1vdXNlU3RhdGU7XHJcbnZhciBjYW52YXNTdGF0ZTtcclxuXHJcbi8vZmlyZXMgd2hlbiB0aGUgd2luZG93IGxvYWRzXHJcbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbihlKXtcclxuICAgIC8vZGVidWcgYnV0dG9uIGRlc2lnbmVkIHRvIGNsZWFyIHByb2dyZXNzIGRhdGFcclxuICAgIFxyXG4gICAgLy92YXJpYWJsZSBhbmQgbG9vcCBpbml0aWFsaXphdGlvblxyXG4gICAgaW5pdGlhbGl6ZVZhcmlhYmxlcygpO1xyXG4gICAgbG9vcCgpO1xyXG59XHJcblxyXG4vL2luaXRpYWxpemF0aW9uIGZvciB2YXJpYWJsZXMsIG1vdXNlIGV2ZW50cywgYW5kIGdhbWUgXCJjbGFzc1wiXHJcbmZ1bmN0aW9uIGluaXRpYWxpemVWYXJpYWJsZXMoKXtcclxuICAgIC8vY2FtdmFzIGluaXRpYWxpemF0aW9uXHJcbiAgICBjYW52YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdjYW52YXMnKTtcclxuICAgIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgXHJcbiAgICB0aW1lID0gbmV3IFRpbWUoKTtcclxuICAgIFxyXG4gICAgXHJcbiAgICAvL21vdXNlIHZhcmlhYmxlIGluaXRpYWxpemF0aW9uXHJcbiAgICBtb3VzZVBvc2l0aW9uID0gbmV3IFBvaW50KDAsMCk7XHJcbiAgICByZWxhdGl2ZU1vdXNlUG9zaXRpb24gPSBuZXcgUG9pbnQoMCwwKTtcclxuICAgIFxyXG4gICAgXHJcbiAgICBcclxuICAgIFxyXG4gICAgXHJcbiAgICAvL2V2ZW50IGxpc3RlbmVycyBmb3IgbW91c2UgaW50ZXJhY3Rpb25zIHdpdGggdGhlIGNhbnZhc1xyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIHZhciBib3VuZFJlY3QgPSBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgbW91c2VQb3NpdGlvbiA9IG5ldyBQb2ludChlLmNsaWVudFggLSBib3VuZFJlY3QubGVmdCwgZS5jbGllbnRZIC0gYm91bmRSZWN0LnRvcCk7XHJcbiAgICAgICAgcmVsYXRpdmVNb3VzZVBvc2l0aW9uID0gbmV3IFBvaW50KG1vdXNlUG9zaXRpb24ueCAtIGNhbnZhcy5vZmZzZXRXaWR0aCAvIDIsIG1vdXNlUG9zaXRpb24ueSAtIGNhbnZhcy5vZmZzZXRIZWlnaHQgLyAyKTtcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICBtb3VzZURvd24gPSBmYWxzZTtcclxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIG1vdXNlRG93biA9IHRydWU7XHJcbiAgICB9KTtcclxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBmdW5jdGlvbihlKXtcclxuICAgICAgICBtb3VzZURvd24gPSBmYWxzZTtcclxuICAgIH0pO1xyXG4gICAgbW91c2VJbiA9IGZhbHNlO1xyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW92ZXJcIiwgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgbW91c2VJbiA9IHRydWU7XHJcbiAgICB9KTtcclxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VvdXRcIiwgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgbW91c2VJbiA9IGZhbHNlO1xyXG4gICAgICAgIG1vdXNlRG93biA9IGZhbHNlO1xyXG4gICAgfSk7XHJcbiAgICB3aGVlbERlbHRhID0gMDtcclxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V3aGVlbFwiLCBmdW5jdGlvbihlKXtcclxuICAgICAgICB3aGVlbERlbHRhID0gZS53aGVlbERlbHRhO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIFxyXG4gICAgXHJcbiAgICBcclxuICAgIC8vc3RhdGUgdmFyaWFibGUgaW5pdGlhbGl6YXRpb25cclxuICAgIG1vdXNlU3RhdGUgPSBuZXcgTW91c2VTdGF0ZShtb3VzZVBvc2l0aW9uLCByZWxhdGl2ZU1vdXNlUG9zaXRpb24sIG1vdXNlRG93biwgbW91c2VJbiwgd2hlZWxEZWx0YSk7XHJcbiAgICBjYW52YXNTdGF0ZSA9IG5ldyBDYW52YXNTdGF0ZShjYW52YXMsIGN0eCk7XHJcbiAgICBcclxuICAgIC8vbG9jYWwgc3RvcmFnZSBoYW5kbGluZyBmb3IgYWN0aXZlIG5vZGUgcmVjb3JkIGFuZCBwcm9ncmVzc1xyXG4gICAgaWYobG9jYWxTdG9yYWdlLmFjdGl2ZU5vZGUgPT09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgbG9jYWxTdG9yYWdlLmFjdGl2ZU5vZGUgPSAwO1xyXG4gICAgfVxyXG4gICAgaWYobG9jYWxTdG9yYWdlLnByb2dyZXNzID09PSB1bmRlZmluZWQpe1xyXG4gICAgICAgIGxvY2FsU3RvcmFnZS5wcm9ncmVzcyA9IFwiXCI7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vY3JlYXRlcyB0aGUgZ2FtZSBvYmplY3QgZnJvbSB3aGljaCBtb3N0IGludGVyYWN0aW9uIGlzIG1hbmFnZWRcclxuICAgIGdhbWUgPSBuZXcgR2FtZSgpO1xyXG59XHJcblxyXG4vL2ZpcmVzIG9uY2UgcGVyIGZyYW1lXHJcbmZ1bmN0aW9uIGxvb3AoKSB7XHJcbiAgICAvL2JpbmRzIGxvb3AgdG8gZnJhbWVzXHJcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGxvb3AuYmluZCh0aGlzKSk7XHJcbiAgICBcclxuICAgIHRpbWUudXBkYXRlKC4wMTY3KTtcclxuICAgIFxyXG4gICAgLy9mZWVkIGN1cnJlbnQgbW91c2UgdmFyaWFibGVzIGJhY2sgaW50byBtb3VzZSBzdGF0ZVxyXG4gICAgbW91c2VTdGF0ZS51cGRhdGUobW91c2VQb3NpdGlvbiwgcmVsYXRpdmVNb3VzZVBvc2l0aW9uLCBtb3VzZURvd24sIG1vdXNlSW4sIHdoZWVsRGVsdGEpO1xyXG4gICAgLy9yZXNldHRpbmcgd2hlZWwgZGVsdGFcclxuICAgIHdoZWVsRGVsdGEgPSAwO1xyXG4gICAgXHJcbiAgICAvL3VwZGF0ZSBnYW1lJ3MgdmFyaWFibGVzOiBwYXNzaW5nIGNvbnRleHQsIGNhbnZhcywgdGltZSwgY2VudGVyIHBvaW50LCB1c2FibGUgaGVpZ2h0LCBtb3VzZSBzdGF0ZVxyXG4gICAgXHJcbiAgICBnYW1lLnVwZGF0ZShtb3VzZVN0YXRlLCBjYW52YXNTdGF0ZSwgdGltZSk7XHJcbn07XHJcblxyXG4vL2xpc3RlbnMgZm9yIGNoYW5nZXMgaW4gc2l6ZSBvZiB3aW5kb3cgYW5kIGFkanVzdHMgdmFyaWFibGVzIGFjY29yZGluZ2x5XHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgY2FudmFzU3RhdGUudXBkYXRlKCk7XHJcbn0pO1xyXG5cclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG4vL2ltcG9ydGVkIG9iamVjdHNcclxudmFyIEdyYXBoUGhhc2UgPSByZXF1aXJlKCcuL3BoYXNlcy9ncmFwaFBoYXNlL0dyYXBoUGhhc2UuanMnKTtcclxudmFyIERyYXdMaWIgPSByZXF1aXJlKCcuL2xpYnJhcmllcy9EcmF3bGliLmpzJyk7XHJcbnZhciBVdGlsaXRpZXMgPSByZXF1aXJlKCcuL2xpYnJhcmllcy9VdGlsaXRpZXMuanMnKTtcclxuXHJcbnZhciBhY3RpdmVQaGFzZTtcclxudmFyIHBhaW50ZXI7XHJcbnZhciB1dGlsaXR5O1xyXG5cclxudmFyIG1vdXNlU3RhdGVcclxuXHJcbmZ1bmN0aW9uIEdhbWUoKXsgICAgXHJcbiAgICBwYWludGVyID0gbmV3IERyYXdMaWIoKTtcclxuICAgIHV0aWxpdHkgPSBuZXcgVXRpbGl0aWVzKCk7XHJcbiAgICBcclxuICAgIC8vaW5zdGFudGlhdGUgdGhlIGdyYXBoXHJcbiAgICBhY3RpdmVQaGFzZSA9IG5ldyBHcmFwaFBoYXNlKFwiaHR0cHM6Ly9hdGxhcy1iYWNrZW5kLmhlcm9rdWFwcC5jb20vcmVwb3NcIik7IC8vYWN0dWFsIGJhY2tlbmQgYXBwXHJcbiAgICAvL2FjdGl2ZVBoYXNlID0gbmV3IEdyYXBoUGhhc2UoXCJodHRwOi8vbG9jYWxob3N0OjUwMDAvcmVwb3NcIik7IC8vZm9yIHRlc3RpbmdcclxuICAgIFxyXG4gICAgLy9naXZlIG1vdXNlU3RhdGUgYSB2YWx1ZSBmcm9tIHRoZSBzdGFydCBzbyBpdCBkb2Vzbid0IHBhc3MgdW5kZWZpbmVkIHRvIHByZXZpb3VzXHJcbiAgICBtb3VzZVN0YXRlID0gMDtcclxufVxyXG5cclxuLy9wYXNzaW5nIGNvbnRleHQsIGNhbnZhcywgZGVsdGEgdGltZSwgY2VudGVyIHBvaW50LCBtb3VzZSBzdGF0ZVxyXG5HYW1lLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihtb3VzZVN0YXRlLCBjYW52YXNTdGF0ZSwgdGltZSkge1xyXG4gICAgXHJcbiAgICBcclxuICAgIC8vdXBkYXRlIGtleSB2YXJpYWJsZXMgaW4gdGhlIGFjdGl2ZSBwaGFzZVxyXG4gICAgYWN0aXZlUGhhc2UudXBkYXRlKG1vdXNlU3RhdGUsIGNhbnZhc1N0YXRlLCB0aW1lKTtcclxuICAgIFxyXG4gICAgLy9kcmF3IGJhY2tncm91bmQgYW5kIHRoZW4gYWN0aXZlIHBoYXNlXHJcbiAgICBjYW52YXNTdGF0ZS5jdHguc2F2ZSgpO1xyXG4gICAgcGFpbnRlci5yZWN0KGNhbnZhc1N0YXRlLmN0eCwgMCwgMCwgY2FudmFzU3RhdGUud2lkdGgsIGNhbnZhc1N0YXRlLmhlaWdodCwgXCIjMjIyXCIpO1xyXG4gICAgY2FudmFzU3RhdGUuY3R4LnJlc3RvcmUoKTtcclxuICAgIGFjdGl2ZVBoYXNlLmRyYXcoY2FudmFzU3RhdGUpO1xyXG4gICAgXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuZnVuY3Rpb24gUG9pbnQocFgsIHBZKXtcclxuICAgIHRoaXMueCA9IHBYO1xyXG4gICAgdGhpcy55ID0gcFk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBvaW50OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIFBvaW50ID0gcmVxdWlyZSgnLi4vY29tbW9uL1BvaW50LmpzJyk7XHJcblxyXG5mdW5jdGlvbiBCdXR0b24ocG9zaXRpb24sIHNpemUsIHRleHQsIGNvbG9yKSB7XHJcbiAgICB0aGlzLnBvc2l0aW9uID0gbmV3IFBvaW50KHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpO1xyXG4gICAgdGhpcy5zaXplID0gbmV3IFBvaW50KHNpemUueCwgc2l6ZS55KTtcclxuICAgIHRoaXMudGV4dCA9IHRleHQ7XHJcbiAgICB0aGlzLm1vdXNlT3ZlciA9IGZhbHNlO1xyXG4gICAgdGhpcy5jb2xvciA9IGNvbG9yO1xyXG4gICAgdGhpcy5vdXRsaW5lV2lkdGggPSAxO1xyXG59O1xyXG5cclxuLy91cGRhdGVzIGJ1dHRvbiwgcmV0dXJucyB0cnVlIGlmIGNsaWNrZWRcclxuQnV0dG9uLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihwTW91c2VTdGF0ZSkge1xyXG4gICAgXHJcbiAgICB2YXIgbSA9IHBNb3VzZVN0YXRlLnJlbGF0aXZlUG9zaXRpb247XHJcbiAgICBpZiggbS54IDwgdGhpcy5wb3NpdGlvbi54IHx8IG0ueCA+IHRoaXMucG9zaXRpb24ueCArIHRoaXMuc2l6ZS54IHx8XHJcbiAgICAgICAgbS55IDwgdGhpcy5wb3NpdGlvbi55IHx8IG0ueSA+IHRoaXMucG9zaXRpb24ueSArIHRoaXMuc2l6ZS55KSB7XHJcbiAgICAgICAgdGhpcy5tb3VzZU92ZXIgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMubW91c2VPdmVyID0gdHJ1ZTtcclxuICAgICAgICBpZihwTW91c2VTdGF0ZS5tb3VzZURvd24gJiYgIXBNb3VzZVN0YXRlLmxhc3RNb3VzZURvd24pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59O1xyXG5cclxuQnV0dG9uLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24ocENhbnZhc1N0YXRlLCBwUGFpbnRlcikge1xyXG4gICAgLy9kcmF3IGJhc2UgYnV0dG9uXHJcbiAgICBpZih0aGlzLm1vdXNlT3Zlcikge1xyXG4gICAgICAgIHRoaXMub3V0bGluZVdpZHRoID0gMjtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMub3V0bGluZVdpZHRoID0gMTtcclxuICAgIH1cclxuICAgIHBQYWludGVyLnJlY3QocENhbnZhc1N0YXRlLmN0eCxcclxuICAgICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi54IC0gdGhpcy5vdXRsaW5lV2lkdGgsXHJcbiAgICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueSAtIHRoaXMub3V0bGluZVdpZHRoLFxyXG4gICAgICAgICAgICAgICAgICB0aGlzLnNpemUueCArIDIgKiB0aGlzLm91dGxpbmVXaWR0aCxcclxuICAgICAgICAgICAgICAgICAgdGhpcy5zaXplLnkgKyAyICogdGhpcy5vdXRsaW5lV2lkdGgsIFwiI2ZmZlwiKTtcclxuXHJcbiAgICBwUGFpbnRlci5yZWN0KHBDYW52YXNTdGF0ZS5jdHgsIHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55LCB0aGlzLnNpemUueCwgdGhpcy5zaXplLnksIHRoaXMuY29sb3IpO1xyXG4gICAgXHJcbiAgICAvL2RyYXcgdGV4dCBvZiBidXR0b25cclxuICAgIHBDYW52YXNTdGF0ZS5jdHguc2F2ZSgpO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5mb250ID0gXCIxNnB4IEFyaWFsXCI7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LmZpbGxTdHlsZSA9IFwiI2ZmZlwiO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC50ZXh0QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5maWxsVGV4dCh0aGlzLnRleHQsIHRoaXMucG9zaXRpb24ueCArIHRoaXMuc2l6ZS54IC8gMiwgdGhpcy5wb3NpdGlvbi55ICsgdGhpcy5zaXplLnkgLyAyKTtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHgucmVzdG9yZSgpO1xyXG4gICAgXHJcbiAgICBcclxufTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJ1dHRvbjsiLCIvL0NvbnRhaW5zIGNhbnZhcyByZWxhdGVkIHZhcmlhYmxlcyBpbiBhIHNpbmdsZSBlYXN5LXRvLXBhc3Mgb2JqZWN0XHJcblwidXNlIHN0cmljdFwiO1xyXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuLi9jb21tb24vUG9pbnQuanMnKTtcclxuXHJcblxyXG5mdW5jdGlvbiBDYW52YXNTdGF0ZShjYW52YXMsIGN0eCkge1xyXG4gICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XHJcbiAgICB0aGlzLmN0eCA9IGN0eDtcclxuICAgIHRoaXMudXBkYXRlKCk7XHJcbn1cclxuXHJcbkNhbnZhc1N0YXRlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMud2lkdGggPSB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMuY2FudmFzLm9mZnNldFdpZHRoO1xyXG4gICAgdGhpcy5oZWlnaHQgPSB0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmNhbnZhcy5vZmZzZXRIZWlnaHQ7XHJcbiAgICB0aGlzLmNlbnRlciA9IG5ldyBQb2ludCh0aGlzLmNhbnZhcy53aWR0aCAvIDIsIHRoaXMuY2FudmFzLmhlaWdodCAvIDIpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENhbnZhc1N0YXRlOyIsIi8va2VlcHMgdHJhY2sgb2YgbW91c2UgcmVsYXRlZCB2YXJpYWJsZXMuXHJcbi8vY2FsY3VsYXRlZCBpbiBtYWluIGFuZCBwYXNzZWQgdG8gZ2FtZVxyXG4vL2NvbnRhaW5zIHVwIHN0YXRlXHJcbi8vcG9zaXRpb25cclxuLy9yZWxhdGl2ZSBwb3NpdGlvblxyXG4vL29uIGNhbnZhc1xyXG5cInVzZSBzdHJpY3RcIjtcclxuZnVuY3Rpb24gTW91c2VTdGF0ZShwUG9zaXRpb24sIHBSZWxhdGl2ZVBvc2l0aW9uLCBwTW91c2VEb3duLCBwTW91c2VJbiwgcFdoZWVsRGVsdGEpe1xyXG4gICAgdGhpcy5wb3NpdGlvbiA9IHBQb3NpdGlvbjtcclxuICAgIHRoaXMucmVsYXRpdmVQb3NpdGlvbiA9IHBSZWxhdGl2ZVBvc2l0aW9uO1xyXG4gICAgdGhpcy5tb3VzZURvd24gPSBwTW91c2VEb3duO1xyXG4gICAgdGhpcy5tb3VzZUluID0gcE1vdXNlSW47XHJcbiAgICB0aGlzLndoZWVsRGVsdGEgPSBwV2hlZWxEZWx0YTtcclxuICAgIFxyXG4gICAgLy90cmFja2luZyBwcmV2aW91cyBtb3VzZSBzdGF0ZXNcclxuICAgIHRoaXMubGFzdFBvc2l0aW9uID0gcFBvc2l0aW9uO1xyXG4gICAgdGhpcy5sYXN0UmVsYXRpdmVQb3NpdGlvbiA9IHBSZWxhdGl2ZVBvc2l0aW9uO1xyXG4gICAgdGhpcy5sYXN0TW91c2VEb3duID0gcE1vdXNlRG93bjtcclxuICAgIHRoaXMubGFzdE1vdXNlSW4gPSBwTW91c2VJbjtcclxuICAgIHRoaXMubGFzdFdoZWVsRGVsdGEgPSBwV2hlZWxEZWx0YVxyXG59XHJcblxyXG5Nb3VzZVN0YXRlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihwUG9zaXRpb24sIHBSZWxhdGl2ZVBvc2l0aW9uLCBwTW91c2VEb3duLCBwTW91c2VJbiwgcFdoZWVsRGVsdGEpe1xyXG4gICAgdGhpcy5sYXN0UG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uO1xyXG4gICAgdGhpcy5sYXN0UmVsYXRpdmVQb3NpdGlvbiA9IHRoaXMucmVsYXRpdmVQb3NpdGlvbjtcclxuICAgIHRoaXMubGFzdE1vdXNlRG93biA9IHRoaXMubW91c2VEb3duO1xyXG4gICAgdGhpcy5sYXN0TW91c2VJbiA9IHRoaXMubW91c2VJbjtcclxuICAgIHRoaXMubGFzdFdoZWVsRGVsdGEgPSB0aGlzLndoZWVsRGVsdGE7XHJcbiAgICBcclxuICAgIFxyXG4gICAgdGhpcy5wb3NpdGlvbiA9IHBQb3NpdGlvbjtcclxuICAgIHRoaXMucmVsYXRpdmVQb3NpdGlvbiA9IHBSZWxhdGl2ZVBvc2l0aW9uO1xyXG4gICAgdGhpcy5tb3VzZURvd24gPSBwTW91c2VEb3duO1xyXG4gICAgdGhpcy5tb3VzZUluID0gcE1vdXNlSW47XHJcbiAgICB0aGlzLndoZWVsRGVsdGEgPSBwV2hlZWxEZWx0YTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNb3VzZVN0YXRlOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuZnVuY3Rpb24gVGltZSAoKSB7XHJcbiAgICB0aGlzLnRvdGFsVGltZSA9IDA7XHJcbiAgICB0aGlzLmRlbHRhVGltZSA9IDA7XHJcbn07XHJcblxyXG5UaW1lLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihkdCkge1xyXG4gICAgdGhpcy50b3RhbFRpbWUgKz0gZHQ7XHJcbiAgICB0aGlzLmRlbHRhVGltZSA9IGR0O1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUaW1lOyIsIlwidXNlIHN0cmljdFwiO1xyXG5mdW5jdGlvbiBEcmF3bGliKCl7XHJcbn07XHJcblxyXG5EcmF3bGliLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKGN0eCwgeCwgeSwgdywgaCkge1xyXG4gICAgY3R4LmNsZWFyUmVjdCh4LCB5LCB3LCBoKTtcclxufTtcclxuXHJcbkRyYXdsaWIucHJvdG90eXBlLnJlY3QgPSBmdW5jdGlvbihjdHgsIHgsIHksIHcsIGgsIGNvbCkge1xyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIGN0eC5maWxsU3R5bGUgPSBjb2w7XHJcbiAgICBjdHguZmlsbFJlY3QoeCwgeSwgdywgaCk7XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG59O1xyXG5cclxuRHJhd2xpYi5wcm90b3R5cGUucm91bmRlZFJlY3QgPSBmdW5jdGlvbihjdHgsIHgsIHksIHcsIGgsIHJhZCwgZmlsbCwgZmlsbENvbG9yLCBvdXRsaW5lLCBvdXRsaW5lQ29sb3IsIG91dGxpbmVXaWR0aCkge1xyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIGN0eC5tb3ZlVG8oeCwgeSAtIHJhZCk7IC8vMTEgbyBjbG9ja1xyXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgY3R4LmxpbmVUbyh4ICsgdywgeSAtIHJhZCk7IC8vMSBvIGNsb2NrXHJcbiAgICBjdHguYXJjVG8oeCArIHcgKyByYWQsIHkgLSByYWQsIHggKyB3ICsgcmFkLCB5LCByYWQpOyAvLyAyIG8gY2xvY2tcclxuICAgIGN0eC5saW5lVG8oeCArIHcgKyByYWQsIHkgKyBoKTsgLy8gNCBvIGNsb2NrXHJcbiAgICBjdHguYXJjVG8oeCArIHcgKyByYWQsIHkgKyBoICsgcmFkLCB4ICsgdywgeSArIGggKyByYWQsIHJhZCkgLy81IG8gY2xvY2tcclxuICAgIGN0eC5saW5lVG8oeCwgeSArIGggKyByYWQpOyAvLyA3IG8gY2xvY2tcclxuICAgIGN0eC5hcmNUbyh4IC0gcmFkLCB5ICsgaCArIHJhZCwgeCAtIHJhZCwgeSArIGgsIHJhZCkgLy84IG8gY2xvY2tcclxuICAgIGN0eC5saW5lVG8oeCAtIHJhZCwgeSk7IC8vIDEwIG8gY2xvY2tcclxuICAgIGN0eC5hcmNUbyh4IC0gcmFkLCB5IC0gcmFkLCB4LCB5IC1yYWQsIHJhZCkgLy8xMSBvIGNsb2NrXHJcbiAgICBjdHguY2xvc2VQYXRoKCk7XHJcbiAgICBpZihmaWxsKSB7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGZpbGxDb2xvcjtcclxuICAgICAgICBjdHguZmlsbCgpO1xyXG4gICAgfVxyXG4gICAgaWYob3V0bGluZSkge1xyXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IG91dGxpbmVDb2xvcjtcclxuICAgICAgICBjdHgubGluZVdpZHRoID0gb3V0bGluZVdpZHRoO1xyXG4gICAgICAgIGN0eC5zdHJva2UoKTtcclxuICAgIH1cclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbn1cclxuXHJcbkRyYXdsaWIucHJvdG90eXBlLmxpbmUgPSBmdW5jdGlvbihjdHgsIHgxLCB5MSwgeDIsIHkyLCB0aGlja25lc3MsIGNvbG9yKSB7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgY3R4Lm1vdmVUbyh4MSwgeTEpO1xyXG4gICAgY3R4LmxpbmVUbyh4MiwgeTIpO1xyXG4gICAgY3R4LmxpbmVXaWR0aCA9IHRoaWNrbmVzcztcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9IGNvbG9yO1xyXG4gICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxufTtcclxuXHJcbkRyYXdsaWIucHJvdG90eXBlLmNpcmNsZSA9IGZ1bmN0aW9uKGN0eCwgeCwgeSwgcmFkaXVzLCBmaWxsLCBmaWxsQ29sb3IsIG91dGxpbmUsIG91dGxpbmVDb2xvciwgb3V0bGluZVdpZHRoKSB7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgY3R4LmFyYyh4LHksIHJhZGl1cywgMCwgMiAqIE1hdGguUEksIGZhbHNlKTtcclxuICAgIGN0eC5jbG9zZVBhdGgoKTtcclxuICAgIGlmKGZpbGwpIHtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gZmlsbENvbG9yO1xyXG4gICAgICAgIGN0eC5maWxsKCk7XHJcbiAgICB9XHJcbiAgICBpZihvdXRsaW5lKSB7XHJcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gb3V0bGluZUNvbG9yO1xyXG4gICAgICAgIGN0eC5saW5lV2lkdGggPSBvdXRsaW5lV2lkdGg7XHJcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgfVxyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxufTtcclxuXHJcbkRyYXdsaWIucHJvdG90eXBlLnRleHRUb0xpbmVzID0gZnVuY3Rpb24oY3R4LCB0ZXh0LCBmb250LCB3aWR0aCkge1xyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIGN0eC5mb250ID0gZm9udDtcclxuICAgIFxyXG4gICAgdmFyIGxpbmVzID0gW107XHJcbiAgICBcclxuICAgIHdoaWxlICh0ZXh0Lmxlbmd0aCkge1xyXG4gICAgICAgIHZhciBpLCBqO1xyXG4gICAgICAgIGZvcihpID0gdGV4dC5sZW5ndGg7IGN0eC5tZWFzdXJlVGV4dCh0ZXh0LnN1YnN0cigwLCBpKSkud2lkdGggPiB3aWR0aDsgaS0tKTtcclxuXHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IHRleHQuc3Vic3RyKDAsaSk7XHJcblxyXG4gICAgICAgIGlmIChpICE9PSB0ZXh0Lmxlbmd0aClcclxuICAgICAgICAgICAgZm9yKHZhciBqID0gMDsgcmVzdWx0LmluZGV4T2YoXCIgXCIsIGopICE9PSAtMTsgaiA9IHJlc3VsdC5pbmRleE9mKFwiIFwiLCBqKSArIDEpO1xyXG5cclxuICAgICAgICBsaW5lcy5wdXNoKHJlc3VsdC5zdWJzdHIoMCwgaiB8fCByZXN1bHQubGVuZ3RoKSk7XHJcbiAgICAgICAgd2lkdGggPSBNYXRoLm1heCh3aWR0aCwgY3R4Lm1lYXN1cmVUZXh0KGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdKS53aWR0aCk7XHJcbiAgICAgICAgdGV4dCAgPSB0ZXh0LnN1YnN0cihsaW5lc1tsaW5lcy5sZW5ndGggLSAxXS5sZW5ndGgsIHRleHQubGVuZ3RoKTtcclxuICAgIH1cclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbiAgICByZXR1cm4gbGluZXM7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IERyYXdsaWI7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4uL2NvbW1vbi9Qb2ludC5qcycpO1xyXG5cclxuZnVuY3Rpb24gVXRpbGl0aWVzKCl7XHJcbn1cclxuXHJcbi8vQk9BUkRQSEFTRSAtIHNldCBhIHN0YXR1cyB2YWx1ZSBvZiBhIG5vZGUgaW4gbG9jYWxTdG9yYWdlIGJhc2VkIG9uIElEXHJcblV0aWxpdGllcy5wcm90b3R5cGUuc2V0UHJvZ3Jlc3MgPSBmdW5jdGlvbihwT2JqZWN0KXtcclxuICAgIHZhciBwcm9ncmVzc1N0cmluZyA9IGxvY2FsU3RvcmFnZS5wcm9ncmVzcztcclxuICAgIFxyXG4gICAgdmFyIHRhcmdldE9iamVjdCA9IHBPYmplY3Q7XHJcbiAgICAvL21ha2UgYWNjb21vZGF0aW9ucyBpZiB0aGlzIGlzIGFuIGV4dGVuc2lvbiBub2RlXHJcbiAgICB2YXIgZXh0ZW5zaW9uZmxhZyA9IHRydWU7XHJcbiAgICB3aGlsZShleHRlbnNpb25mbGFnKXtcclxuICAgICAgICBpZih0YXJnZXRPYmplY3QudHlwZSA9PT0gXCJleHRlbnNpb25cIil7XHJcbiAgICAgICAgICAgIHRhcmdldE9iamVjdCA9IHRhcmdldE9iamVjdC5jb25uZWN0aW9uRm9yd2FyZFswXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgZXh0ZW5zaW9uZmxhZyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgdmFyIG9iamVjdElEID0gdGFyZ2V0T2JqZWN0LmRhdGEuX2lkO1xyXG4gICAgdmFyIG9iamVjdFN0YXR1cyA9IHRhcmdldE9iamVjdC5zdGF0dXM7XHJcbiAgICBcclxuICAgIC8vc2VhcmNoIHRoZSBwcm9ncmVzc1N0cmluZyBmb3IgdGhlIGN1cnJlbnQgSURcclxuICAgIHZhciBpZEluZGV4ID0gcHJvZ3Jlc3NTdHJpbmcuaW5kZXhPZihvYmplY3RJRCk7XHJcbiAgICBcclxuICAgIC8vaWYgaXQncyBub3QgYWRkIGl0IHRvIHRoZSBlbmRcclxuICAgIGlmKGlkSW5kZXggPT09IC0xKXtcclxuICAgICAgICBwcm9ncmVzc1N0cmluZyArPSBvYmplY3RJRCArIFwiXCIgKyBvYmplY3RTdGF0dXMgKyBcIixcIjtcclxuICAgIH1cclxuICAgIC8vb3RoZXJ3aXNlIG1vZGlmeSB0aGUgc3RhdHVzIHZhbHVlXHJcbiAgICBlbHNle1xyXG4gICAgICAgIHByb2dyZXNzU3RyaW5nID0gcHJvZ3Jlc3NTdHJpbmcuc3Vic3RyKDAsIG9iamVjdElELmxlbmd0aCArIGlkSW5kZXgpICsgb2JqZWN0U3RhdHVzICsgcHJvZ3Jlc3NTdHJpbmcuc3Vic3RyKG9iamVjdElELmxlbmd0aCArIDEgKyBpZEluZGV4LCBwcm9ncmVzc1N0cmluZy5sZW5ndGgpICsgXCJcIjtcclxuICAgIH1cclxuICAgIGxvY2FsU3RvcmFnZS5wcm9ncmVzcyA9IHByb2dyZXNzU3RyaW5nO1xyXG59XHJcblxyXG4vL3JldHVybnMgbW91c2UgcG9zaXRpb24gaW4gbG9jYWwgY29vcmRpbmF0ZSBzeXN0ZW0gb2YgZWxlbWVudFxyXG5VdGlsaXRpZXMucHJvdG90eXBlLmdldE1vdXNlID0gZnVuY3Rpb24oZSl7XHJcbiAgICByZXR1cm4gbmV3IFBvaW50KChlLnBhZ2VYIC0gZS50YXJnZXQub2Zmc2V0TGVmdCksIChlLnBhZ2VZIC0gZS50YXJnZXQub2Zmc2V0VG9wKSk7XHJcbn1cclxuXHJcblV0aWxpdGllcy5wcm90b3R5cGUubWFwID0gZnVuY3Rpb24odmFsdWUsIG1pbjEsIG1heDEsIG1pbjIsIG1heDIpe1xyXG4gICAgcmV0dXJuIG1pbjIgKyAobWF4MiAtIG1pbjIpICogKCh2YWx1ZSAtIG1pbjEpIC8gKG1heDEgLSBtaW4xKSk7XHJcbn1cclxuXHJcbi8vbGltaXRzIHRoZSB1cHBlciBhbmQgbG93ZXIgbGltaXRzIG9mIHRoZSBwYXJhbWV0ZXIgdmFsdWVcclxuVXRpbGl0aWVzLnByb3RvdHlwZS5jbGFtcCA9IGZ1bmN0aW9uKHZhbHVlLCBtaW4sIG1heCl7XHJcbiAgICByZXR1cm4gTWF0aC5tYXgobWluLCBNYXRoLm1pbihtYXgsIHZhbHVlKSk7XHJcbn1cclxuXHJcbi8vY2hlY2tzIG1vdXNlIGNvbGxpc2lvbiBvbiBjYW52YXNcclxuVXRpbGl0aWVzLnByb3RvdHlwZS5tb3VzZUludGVyc2VjdCA9IGZ1bmN0aW9uKHBNb3VzZVN0YXRlLCBwRWxlbWVudCwgcE9mZnNldHRlciwgcFNjYWxlKXtcclxuICAgIC8vaWYgdGhlIHggcG9zaXRpb24gY29sbGlkZXNcclxuICAgIGlmKHBFbGVtZW50LnN0YXR1cyAhPT0gXCIwXCIpe1xyXG4gICAgICAgIGlmKHBNb3VzZVN0YXRlLnJlbGF0aXZlUG9zaXRpb24ueCArIHBPZmZzZXR0ZXIueCA+IChwRWxlbWVudC5wb3NpdGlvbi54IC0gKHBFbGVtZW50LndpZHRoKS8yKSAmJiBwTW91c2VTdGF0ZS5yZWxhdGl2ZVBvc2l0aW9uLnggKyBwT2Zmc2V0dGVyLnggPCAocEVsZW1lbnQucG9zaXRpb24ueCArIChwRWxlbWVudC53aWR0aCkvMikpe1xyXG4gICAgICAgICAgICAvL2lmIHRoZSB5IHBvc2l0aW9uIGNvbGxpZGVzXHJcbiAgICAgICAgICAgIGlmKHBNb3VzZVN0YXRlLnJlbGF0aXZlUG9zaXRpb24ueSArIHBPZmZzZXR0ZXIueSA+IChwRWxlbWVudC5wb3NpdGlvbi55IC0gKHBFbGVtZW50LmhlaWdodCkvMikgJiYgcE1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbi55ICsgcE9mZnNldHRlci55IDwgKHBFbGVtZW50LnBvc2l0aW9uLnkgKyAocEVsZW1lbnQuaGVpZ2h0KS8yKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgcEVsZW1lbnQubW91c2VPdmVyID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgcEVsZW1lbnQubW91c2VPdmVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgcEVsZW1lbnQubW91c2VPdmVyID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFV0aWxpdGllczsiLCJcInVzZSBzdHJpY3RcIlxyXG5cclxudmFyIFR1dG9yaWFsVGFncyA9IHtcclxuICAgIFwiQUlcIjogXCIjODA0XCIsXHJcbiAgICBcIkF1ZGlvXCI6IFwiIzA0OFwiLFxyXG4gICAgXCJDb21wdXRlciBTY2llbmNlXCI6IFwiIzExMVwiLFxyXG4gICAgXCJDb3JlXCI6IFwiIzMzM1wiLFxyXG4gICAgXCJHcmFwaGljc1wiOiBcIiNjMGNcIixcclxuICAgIFwiSW5wdXRcIjogXCIjODgwXCIsXHJcbiAgICBcIk1hdGhcIjogXCIjNDg0XCIsXHJcbiAgICBcIk5ldHdvcmtpbmdcIjogXCIjYzYwXCIsXHJcbiAgICBcIk9wdGltaXphdGlvblwiOiBcIiMyODJcIixcclxuICAgIFwiUGh5c2ljc1wiOiBcIiMwNDhcIixcclxuICAgIFwiU2NyaXB0aW5nXCI6IFwiIzA4OFwiLFxyXG4gICAgXCJTb2Z0d2FyZUVuZ2luZWVyaW5nXCI6IFwiIzg0NFwiXHJcbn07XHJcblxyXG5cclxuZnVuY3Rpb24gRGV0YWlsc1BhbmVsKGdyYXBoKSB7XHJcbiAgICB0aGlzLmdyYXBoID0gZ3JhcGg7XHJcbiAgICB0aGlzLm5vZGUgPSBudWxsO1xyXG4gICAgdGhpcy5kYXRhID0gbnVsbDtcclxuICAgIHRoaXMudHJhbnNpdGlvbk9uID0gZmFsc2U7XHJcbiAgICB0aGlzLnRyYW5zaXRpb25UaW1lID0gMDtcclxuICAgIHRoaXMuZGF0YURpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmlnaHRCYXJcIik7XHJcbn07XHJcblxyXG5EZXRhaWxzUGFuZWwucHJvdG90eXBlLmVuYWJsZSA9IGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgIHRoaXMubm9kZSA9IG5vZGU7XHJcbiAgICB0aGlzLmRhdGEgPSBub2RlLmRhdGE7XHJcbiAgICB0aGlzLnRyYW5zaXRpb25PbiA9IHRydWVcclxufTtcclxuXHJcbkRldGFpbHNQYW5lbC5wcm90b3R5cGUuZGlzYWJsZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5kYXRhRGl2LmlubmVySFRNTCA9IFwiXCI7XHJcbiAgICB0aGlzLnRyYW5zaXRpb25PbiA9IGZhbHNlO1xyXG59O1xyXG5cclxuRGV0YWlsc1BhbmVsLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihjYW52YXNTdGF0ZSwgdGltZSwgbm9kZSkge1xyXG4gICAgXHJcbiAgICAvL3VwZGF0ZSBub2RlIGlmIGl0cyBub3QgdGhlIHNhbWUgYW55bW9yZVxyXG4gICAgaWYodGhpcy5ub2RlICE9IG5vZGUpIHtcclxuICAgICAgICB0aGlzLm5vZGUgPSBub2RlO1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IG5vZGUuZGF0YTtcclxuICAgICAgICB0aGlzLmRhdGFEaXYuaW5uZXJIVE1MID0gdGhpcy5HZW5lcmF0ZURPTSgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBcclxuICAgIC8vdHJhbnNpdGlvbiBvblxyXG4gICAgaWYodGhpcy50cmFuc2l0aW9uT24pIHtcclxuICAgICAgICBpZih0aGlzLnRyYW5zaXRpb25UaW1lIDwgMSkge1xyXG4gICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25UaW1lICs9IHRpbWUuZGVsdGFUaW1lICogMztcclxuICAgICAgICAgICAgaWYodGhpcy50cmFuc2l0aW9uVGltZSA+PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAvL2RvbmUgdHJhbnNpdGlvbmluZ1xyXG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9uVGltZSA9IDE7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFEaXYuaW5uZXJIVE1MID0gdGhpcy5HZW5lcmF0ZURPTSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy90cmFuc2l0aW9uIG9mZlxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgaWYodGhpcy50cmFuc2l0aW9uVGltZSA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9uVGltZSAtPSB0aW1lLmRlbHRhVGltZSAqIDM7XHJcbiAgICAgICAgICAgIGlmKHRoaXMudHJhbnNpdGlvblRpbWUgPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgLy9kb25lIHRyYW5zaXRpb25pbmdcclxuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvblRpbWUgPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YSA9IG51bGw7IFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuRGV0YWlsc1BhbmVsLnByb3RvdHlwZS5HZW5lcmF0ZURPTSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGh0bWwgPSBcIjxoMT5cIit0aGlzLmRhdGEuc2VyaWVzK1wiOjwvaDE+PGgxPjxhIGhyZWY9XCIgKyB0aGlzLmRhdGEubGluayArIFwiPlwiK3RoaXMuZGF0YS50aXRsZStcIjwvYT48L2gxPlwiO1xyXG4gICAgaHRtbCArPSBcIjxhIGhyZWY9XCIgKyB0aGlzLmRhdGEubGluayArIFwiPjxpbWcgc3JjPWh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9JR01FLVJJVC9cIiArIHRoaXMuZGF0YS5uYW1lICtcclxuICAgICAgICBcIi9tYXN0ZXIvaWdtZV90aHVtYm5haWwucG5nIGFsdD1cIiArIHRoaXMuZGF0YS5saW5rICsgXCI+PC9hPlwiO1xyXG4gICAgXHJcbiAgICBodG1sICs9IFwiPHVsIGlkPSd0YWdzJz5cIjtcclxuICAgIGlmKHRoaXMuZGF0YS50YWdzLmxlbmd0aCAhPSAwKSB7XHJcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMuZGF0YS50YWdzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCI8bGkgc3R5bGU9J2JhY2tncm91bmQtY29sb3I6XCIgKyBUdXRvcmlhbFRhZ3NbdGhpcy5kYXRhLnRhZ3NbaV1dICsgXCInPlwiICsgdGhpcy5kYXRhLnRhZ3NbaV0gKyBcIjwvbGk+XCI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaHRtbCs9IFwiPC91bD5cIlxyXG4gICAgXHJcbiAgICBodG1sICs9IFwiPHA+XCIgKyB0aGlzLmRhdGEuZGVzY3JpcHRpb24gKyBcIjwvcD5cIjtcclxuICAgIC8vY29uc29sZS5sb2codGhpcy5kYXRhKTtcclxuICAgIGlmKHRoaXMuZGF0YS5leHRyYV9yZXNvdXJjZXMubGVuZ3RoICE9IDApIHtcclxuICAgICAgICBodG1sICs9IFwiPGgyPkFkZGl0aW9uYWwgUmVzb3VyY2VzOjwvaDI+XCI7XHJcbiAgICAgICAgaHRtbCArPSBcIjx1bD5cIjtcclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5kYXRhLmV4dHJhX3Jlc291cmNlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBodG1sICs9IFwiPGxpPjxhIGhyZWY9XCIgKyB0aGlzLmRhdGEuZXh0cmFfcmVzb3VyY2VzW2ldLmxpbmsgKyBcIj5cIiArIHRoaXMuZGF0YS5leHRyYV9yZXNvdXJjZXNbaV0udGl0bGUgKyBcIjwvYT48L2xpPlwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBodG1sICs9IFwiPC91bD5cIjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcmV0dXJuIGh0bWw7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IERldGFpbHNQYW5lbDsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIERyYXdMaWIgPSByZXF1aXJlKCcuLi8uLi9saWJyYXJpZXMvRHJhd2xpYi5qcycpO1xyXG52YXIgU2VhcmNoUGFuZWwgPSByZXF1aXJlKCcuL1NlYXJjaFBhbmVsLmpzJyk7XHJcbnZhciBEZXRhaWxzUGFuZWwgPSByZXF1aXJlKCcuL0RldGFpbHNQYW5lbC5qcycpO1xyXG52YXIgVHV0b3JpYWxOb2RlID0gcmVxdWlyZSgnLi9UdXRvcmlhbE5vZGUuanMnKTtcclxudmFyIFBvaW50ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL1BvaW50LmpzJyk7XHJcblxyXG5cclxudmFyIHBhaW50ZXI7XHJcbnZhciBleHBhbmQgPSAzO1xyXG52YXIgZGVidWdNb2RlID0gZmFsc2U7XHJcblxyXG5mdW5jdGlvbiBHcmFwaChwSlNPTkRhdGEpIHtcclxuICAgICAgICBcclxuICAgIHRoaXMuc2VhcmNoUGFuZWwgPSBuZXcgU2VhcmNoUGFuZWwodGhpcyk7XHJcbiAgICB0aGlzLmRldGFpbHNQYW5lbCA9IG5ldyBEZXRhaWxzUGFuZWwodGhpcyk7XHJcbiAgICB0aGlzLnNlYXJjaFBhbmVsQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJPcHRpb25zQnV0dG9uXCIpO1xyXG4gICAgdGhpcy5zZWFyY2hEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxlZnRCYXJcIik7XHJcbiAgICB0aGlzLmRhdGFEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJpZ2h0QmFyXCIpO1xyXG4gICAgdGhpcy5jYW52YXNEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1pZGRsZUJhclwiKTtcclxuICAgIHBhaW50ZXIgPSBuZXcgRHJhd0xpYigpO1xyXG4gICAgXHJcbiAgICB0aGlzLm5vZGVzID0gW107XHJcbiAgICB0aGlzLmFjdGl2ZU5vZGVzID0gW107XHJcbiAgICBcclxuICAgIC8vcG9wdWxhdGUgdGhlIGFycmF5XHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgcEpTT05EYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGRhdGEgPSBwSlNPTkRhdGFbaV07XHJcbiAgICAgICAgLy9lbnN1cmVzIHRoYXQgdGhlIGNodW5rIGNvbnRhaW5zIGEgbGlua1xyXG4gICAgICAgIGlmKGRhdGEudGFncy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgaWYoZGVidWdNb2RlKSBjb25zb2xlLmxvZyhcIlJlcG8gbm90IHRhZ2dlZDogXCIgKyBkYXRhLm5hbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKGRhdGEuaW1hZ2UgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBpZihkZWJ1Z01vZGUpIGNvbnNvbGUubG9nKFwiUmVwbyB5YW1sIG91dCBvZiBkYXRlOiBcIiArIGRhdGEubmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgbm9kZSA9IG5ldyBUdXRvcmlhbE5vZGUoZGF0YSk7XHJcbiAgICAgICAgICAgIHRoaXMubm9kZXMucHVzaChub2RlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vc2V0IGRpcmVjdCBvYmplY3QgY29ubmVjdGlvbnMgdG8gcmVsYXRlZCBub2RlcyBmb3IgcmVmZXJlbmNpbmdcclxuICAgIC8vcGFyc2UgZW50aXJlIGxpc3RcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLm5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgLy9sb29wIG92ZXIgbGlzdGVkIGNvbm5lY3Rpb25zXHJcbiAgICAgICAgZm9yKHZhciBrID0gMDsgayA8IHRoaXMubm9kZXNbaV0uZGF0YS5jb25uZWN0aW9ucy5sZW5ndGg7IGsrKykge1xyXG4gICAgICAgICAgICAvL3NlYXJjaCBmb3Igc2ltaWxhciBub2Rlc1xyXG4gICAgICAgICAgICBmb3IodmFyIGogPSAwOyBqIDwgdGhpcy5ub2Rlcy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5ub2Rlc1tqXS5kYXRhLnNlcmllcyA9PT0gdGhpcy5ub2Rlc1tpXS5kYXRhLmNvbm5lY3Rpb25zW2tdLnNlcmllcyAmJlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubm9kZXNbal0uZGF0YS50aXRsZSA9PT0gdGhpcy5ub2Rlc1tpXS5kYXRhLmNvbm5lY3Rpb25zW2tdLnRpdGxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2Rlc1tpXS5wcmV2aW91c05vZGVzLnB1c2godGhpcy5ub2Rlc1tqXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2Rlc1tqXS5uZXh0Tm9kZXMucHVzaCh0aGlzLm5vZGVzW2ldKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgdGhpcy50cmFuc2l0aW9uVGltZSA9IDA7XHJcbiAgICB0aGlzLkZvY3VzTm9kZSh0aGlzLm5vZGVzWzBdKTtcclxuICAgIFxyXG4gICAgXHJcbiAgICBmdW5jdGlvbiB4IChzZWFyY2gpIHtcclxuICAgICAgICBpZihzZWFyY2gub3BlbiA9PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHNlYXJjaC50cmFuc2l0aW9uT24gPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNlYXJjaC50cmFuc2l0aW9uT24gPSB0cnVlO1xyXG4gICAgICAgICAgICBzZWFyY2gub3BlbiA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICB0aGlzLnNlYXJjaFBhbmVsQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB4LmJpbmQodGhpcy5zZWFyY2hQYW5lbEJ1dHRvbiwgdGhpcy5zZWFyY2hQYW5lbCkpO1xyXG59O1xyXG5cclxuXHJcblxyXG5cclxuR3JhcGgucHJvdG90eXBlLkZvY3VzTm9kZSA9IGZ1bmN0aW9uKGNlbnRlck5vZGUpIHtcclxuICAgIHRoaXMuZm9jdXNlZE5vZGUgPSBjZW50ZXJOb2RlO1xyXG4gICAgXHJcbiAgICB2YXIgbmV3Tm9kZXMgPSBbXTtcclxuICAgIFxyXG4gICAgLy9nZXQgbm9kZXMgdG8gZGVwdGhcclxuICAgIFxyXG4gICAgdmFyIHByZXZpb3VzTm9kZXMgPSB0aGlzLmZvY3VzZWROb2RlLmdldFByZXZpb3VzKGV4cGFuZCk7XHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgcHJldmlvdXNOb2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIG5ld05vZGVzLnB1c2gocHJldmlvdXNOb2Rlc1tpXSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHZhciBuZXh0Tm9kZXMgPSB0aGlzLmZvY3VzZWROb2RlLmdldE5leHQoZXhwYW5kKTtcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBuZXh0Tm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBuZXdOb2Rlcy5wdXNoKG5leHROb2Rlc1tpXSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHZhciB0ZW1wID0gW107XHJcbiAgICBcclxuICAgIC8vcmVtb3ZlIHJlZHVuZGFuY2llc1xyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IG5ld05vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGFscmVhZHlFeGlzdHMgPSBmYWxzZTtcclxuICAgICAgICBmb3IodmFyIGogPSAwOyBqIDwgdGVtcC5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICBpZihuZXdOb2Rlc1tpXSA9PSB0ZW1wW2pdKSB7XHJcbiAgICAgICAgICAgICAgICBhbHJlYWR5RXhpc3RzID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZighYWxyZWFkeUV4aXN0cykge1xyXG4gICAgICAgICAgICB0ZW1wLnB1c2gobmV3Tm9kZXNbaV0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgbmV3Tm9kZXMgPSB0ZW1wO1xyXG4gICAgXHJcbiAgICAvL2NoZWNrIGlmIGFueSBvZiB0aGUgbm9kZXMgd2VyZSBwcmV2aW91c2x5IG9uIHNjcmVlblxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMuYWN0aXZlTm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB0aGlzLmFjdGl2ZU5vZGVzW2ldLndhc1ByZXZpb3VzbHlPblNjcmVlbiA9IGZhbHNlO1xyXG4gICAgICAgIGZvcih2YXIgaiA9IDA7IGogPCBuZXdOb2Rlcy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICBpZih0aGlzLmFjdGl2ZU5vZGVzW2ldID09IG5ld05vZGVzW2pdKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZU5vZGVzW2ldLndhc1ByZXZpb3VzbHlPblNjcmVlbiA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRoaXMuYWN0aXZlTm9kZXMgPSBuZXdOb2RlcztcclxuICAgIFxyXG4gICAgLy9jbGVhciB0aGVpciBwYXJlbnQgZGF0YSBmb3IgbmV3IG5vZGVcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmFjdGl2ZU5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVOb2Rlc1tpXS5jdXJyZW50TGF5ZXJEZXB0aCA9IDA7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVOb2Rlc1tpXS5wYXJlbnQgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBcclxuICAgIHRoaXMudHJhbnNpdGlvblRpbWUgPSAxO1xyXG4gICAgXHJcbiAgICB0aGlzLmZvY3VzZWROb2RlLnNldFRyYW5zaXRpb24oZXhwYW5kLCBudWxsLCAwLCBuZXcgUG9pbnQoMCwgMCkpO1xyXG59O1xyXG5cclxuR3JhcGgucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKG1vdXNlU3RhdGUsIGNhbnZhc1N0YXRlLCB0aW1lKSB7XHJcbiAgICBcclxuICAgIGlmKHRoaXMudHJhbnNpdGlvblRpbWUgPiAwKSB7XHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uVGltZSAtPSB0aW1lLmRlbHRhVGltZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvblRpbWUgPSAwO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB2YXIgbW91c2VPdmVyTm9kZSA9IG51bGw7XHJcbiAgICBcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmFjdGl2ZU5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGlzTWFpbiA9ICh0aGlzLmFjdGl2ZU5vZGVzW2ldID09IHRoaXMuZm9jdXNlZE5vZGUpO1xyXG4gICAgICAgIHRoaXMuYWN0aXZlTm9kZXNbaV0udXBkYXRlKG1vdXNlU3RhdGUsIHRpbWUsIHRoaXMudHJhbnNpdGlvblRpbWUsIGlzTWFpbik7XHJcbiAgICAgICAgaWYodGhpcy5hY3RpdmVOb2Rlc1tpXS5tb3VzZU92ZXIpIHtcclxuICAgICAgICAgICAgbW91c2VPdmVyTm9kZSA9IHRoaXMuYWN0aXZlTm9kZXNbaV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvL2lmIGN1c2VyIGNsaWNrc1xyXG4gICAgaWYobW91c2VTdGF0ZS5tb3VzZURvd24gJiYgIW1vdXNlU3RhdGUubGFzdE1vdXNlRG93bikge1xyXG4gICAgICAgIC8vZm9jdXMgbm9kZSBpZiBjbGlja2VkXHJcbiAgICAgICAgaWYobW91c2VPdmVyTm9kZSkge1xyXG4gICAgICAgICAgICB0aGlzLkZvY3VzTm9kZShtb3VzZU92ZXJOb2RlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy9zaG93IGRldGFpbHMgZm9yIG5vZGUgaWYgYnV0dG9uIGNsaWNrZWRcclxuICAgICAgICBpZih0aGlzLmZvY3VzZWROb2RlLmRldGFpbHNCdXR0b24ubW91c2VPdmVyKSB7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuZGV0YWlsc1BhbmVsLm5vZGUgPT0gbnVsbCkgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGV0YWlsc1BhbmVsLmVuYWJsZSh0aGlzLmZvY3VzZWROb2RlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGV0YWlsc1BhbmVsLmRpc2FibGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYodGhpcy5zZWFyY2hQYW5lbC5vcGVuID09IHRydWUpIHtcclxuICAgICAgICB0aGlzLnNlYXJjaFBhbmVsLnVwZGF0ZShjYW52YXNTdGF0ZSwgdGltZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIFxyXG4gICAgaWYodGhpcy5kZXRhaWxzUGFuZWwubm9kZSAhPSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy5kZXRhaWxzUGFuZWwudXBkYXRlKGNhbnZhc1N0YXRlLCB0aW1lLCB0aGlzLmZvY3VzZWROb2RlKTtcclxuICAgICAgICB0aGlzLmZvY3VzZWROb2RlLmRldGFpbHNCdXR0b24udGV4dCA9IFwiTGVzc1wiO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5mb2N1c2VkTm9kZS5kZXRhaWxzQnV0dG9uLnRleHQgPSBcIk1vcmVcIjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgXHJcbiAgICB2YXIgdDEgPSAoMSAtIE1hdGguY29zKHRoaXMuc2VhcmNoUGFuZWwudHJhbnNpdGlvblRpbWUgKiBNYXRoLlBJKSkvMjtcclxuICAgIHZhciB0MiA9ICgxIC0gTWF0aC5jb3ModGhpcy5kZXRhaWxzUGFuZWwudHJhbnNpdGlvblRpbWUgKiBNYXRoLlBJKSkvMjtcclxuICAgIFxyXG4gICAgdGhpcy5zZWFyY2hEaXYuc3R5bGUud2lkdGggPSAzMCAqIHQxICsgXCJ2d1wiO1xyXG4gICAgdGhpcy5kYXRhRGl2LnN0eWxlLndpZHRoID0gMzAgKiB0MiArIFwidndcIjtcclxuICAgIHRoaXMuY2FudmFzRGl2LnN0eWxlLndpZHRoID0gMTAwIC0gMzAgKiAodDEgKyB0MikgKyBcInZ3XCI7ICAgIFxyXG4gICAgXHJcbiAgICB0aGlzLnNlYXJjaFBhbmVsQnV0dG9uLnN0eWxlLmxlZnQgPSBcImNhbGMoXCIgKyAzMCAqIHQxICsgXCJ2dyArIDEycHgpXCI7XHJcbiAgICBcclxuICAgIGNhbnZhc1N0YXRlLnVwZGF0ZSgpO1xyXG59O1xyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuR3JhcGgucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjYW52YXNTdGF0ZSkge1xyXG4gICAgY2FudmFzU3RhdGUuY3R4LnNhdmUoKTtcclxuICAgIFxyXG4gICAgLy90cmFuc2xhdGUgdG8gdGhlIGNlbnRlciBvZiB0aGUgc2NyZWVuXHJcbiAgICBjYW52YXNTdGF0ZS5jdHgudHJhbnNsYXRlKGNhbnZhc1N0YXRlLmNlbnRlci54LCBjYW52YXNTdGF0ZS5jZW50ZXIueSk7XHJcbiAgICAvL2NvbnNvbGUubG9nKGNhbnZhc1N0YXRlLmNlbnRlcik7XHJcbiAgICAvL2NvbnNvbGUubG9nKGNhbnZhc1N0YXRlKTtcclxuICAgIC8vZHJhdyBub2Rlc1xyXG4gICAgdGhpcy5mb2N1c2VkTm9kZS5kcmF3KGNhbnZhc1N0YXRlLCBwYWludGVyLCBudWxsLCAwLCBleHBhbmQpO1xyXG4gICAgXHJcbiAgICBjYW52YXNTdGF0ZS5jdHgucmVzdG9yZSgpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHcmFwaDsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIFBhcnNlciA9IHJlcXVpcmUoJy4uL2dyYXBoUGhhc2UvUGFyc2VyLmpzJyk7XHJcbnZhciBHcmFwaCA9IHJlcXVpcmUoJy4vR3JhcGguanMnKTtcclxuXHJcbnZhciBncmFwaExvYWRlZDtcclxuXHJcbnZhciBtb3VzZVRhcmdldDtcclxudmFyIGdyYXBoO1xyXG5cclxuZnVuY3Rpb24gR3JhcGhQaGFzZShwVGFyZ2V0VVJMKXtcclxuICAgIC8vaW5pdGlhbGl6ZSBiYXNlIHZhbHVlc1xyXG4gICAgZ3JhcGhMb2FkZWQgPSBmYWxzZTtcclxuICAgIG1vdXNlVGFyZ2V0ID0gMDtcclxuICAgIFxyXG4gICAgXHJcbiAgICAvL3JlcXVlc3QgZ3JhcGggZGF0YSBhbmQgd2FpdCB0byBiZWdpbiBwYXJzaW5nXHJcbiAgICBQYXJzZXIocFRhcmdldFVSTCwgZnVuY3Rpb24ocEpTT05FbGVtZW50cyl7XHJcbiAgICAgICAgZ3JhcGggPSBuZXcgR3JhcGgocEpTT05FbGVtZW50cyk7XHJcbiAgICAgICAgZ3JhcGhMb2FkZWQgPSB0cnVlO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbkdyYXBoUGhhc2UucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKG1vdXNlU3RhdGUsIGNhbnZhc1N0YXRlLCB0aW1lKSB7XHJcbiAgICBpZihncmFwaExvYWRlZCkge1xyXG4gICAgICAgIGdyYXBoLnVwZGF0ZShtb3VzZVN0YXRlLCBjYW52YXNTdGF0ZSwgdGltZSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbkdyYXBoUGhhc2UucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjYW52YXNTdGF0ZSkge1xyXG4gICAgaWYoZ3JhcGhMb2FkZWQpIHtcclxuICAgICAgICBncmFwaC5kcmF3KGNhbnZhc1N0YXRlKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIC8vaWYgd2UgaGF2ZW50IGxvYWRlZCB0aGUgZGF0YSwgZGlzcGxheSBsb2FkaW5nLCBhbmQgd2FpdFxyXG4gICAgICAgIGNhbnZhc1N0YXRlLmN0eC5zYXZlKCk7XHJcbiAgICAgICAgY2FudmFzU3RhdGUuY3R4LmZvbnQgPSBcIjQwcHggQXJpYWxcIjtcclxuICAgICAgICBjYW52YXNTdGF0ZS5jdHguZmlsbFN0eWxlID0gXCIjZmZmXCI7XHJcbiAgICAgICAgY2FudmFzU3RhdGUuY3R4LnRleHRCYXNlbGluZSA9IFwibWlkZGxlXCI7XHJcbiAgICAgICAgY2FudmFzU3RhdGUuY3R4LnRleHRBbGlnbiA9IFwiY2VudGVyXCI7XHJcbiAgICAgICAgY2FudmFzU3RhdGUuY3R4LmZpbGxUZXh0KFwiTG9hZGluZy4uLlwiLCBjYW52YXNTdGF0ZS5jZW50ZXIueCwgY2FudmFzU3RhdGUuY2VudGVyLnkpO1xyXG4gICAgICAgIGNhbnZhc1N0YXRlLmN0eC5yZXN0b3JlKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdyYXBoUGhhc2U7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vUG9pbnQuanMnKTtcclxudmFyIEJ1dHRvbiA9IHJlcXVpcmUoXCIuLi8uLi9jb250YWluZXJzL0J1dHRvbi5qc1wiKTtcclxudmFyIFR1dG9yaWFsTm9kZSA9IHJlcXVpcmUoJy4vVHV0b3JpYWxOb2RlLmpzJyk7XHJcblxyXG52YXIgbGFiZWxDb3JuZXJTaXplID0gNjtcclxuXHJcbnZhciB0aXRsZUZvbnRTaXplID0gMTI7XHJcbnZhciB0aXRsZUZvbnQgPSB0aXRsZUZvbnRTaXplK1wicHggQXJpYWxcIjtcclxuXHJcbnZhciBkZXNjcmlwdG9yRm9udFNpemUgPSAxMjtcclxudmFyIGRlc2NyaXB0b3JGb250ID0gZGVzY3JpcHRvckZvbnRTaXplK1wicHggQXJpYWxcIjtcclxuXHJcbnZhciBsaW5lQnJlYWsgPSA2O1xyXG5cclxuLy9jcmVhdGUgYSBsYWJlbCB0byBwYWlyIHdpdGggYSBub2RlXHJcbmZ1bmN0aW9uIE5vZGVMYWJlbChwVHV0b3JpYWxOb2RlKSB7XHJcbiAgICB0aGlzLm5vZGUgPSBwVHV0b3JpYWxOb2RlO1xyXG4gICAgXHJcbiAgICB0aGlzLnNlcmllcyA9IHRoaXMubm9kZS5kYXRhLnNlcmllcztcclxuICAgIHRoaXMudGl0bGUgPSB0aGlzLm5vZGUuZGF0YS50aXRsZTtcclxuICAgIHRoaXMuZGVzY3JpcHRpb24gPSB0aGlzLm5vZGUuZGF0YS5kZXNjcmlwdGlvbjtcclxuICAgIHRoaXMuZGVzY3JpcHRpb25MaW5lcyA9IG51bGw7XHJcbiAgICBcclxuICAgIHRoaXMucG9zaXRpb24gPSBuZXcgUG9pbnQoXHJcbiAgICAgICAgdGhpcy5ub2RlLnBvc2l0aW9uLngsXHJcbiAgICAgICAgdGhpcy5ub2RlLnBvc2l0aW9uLnkgLSB0aGlzLm5vZGUuc2l6ZSAtIDEwKTtcclxuICAgIFxyXG4gICAgdGhpcy5kaXNwbGF5RnVsbERhdGEgPSBmYWxzZTtcclxufTtcclxuXHJcbk5vZGVMYWJlbC5wcm90b3R5cGUuY2FsY3VsYXRlVGV4dEZpdCA9IGZ1bmN0aW9uKGN0eCwgcFBhaW50ZXIpIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHguZm9udCA9IHRpdGxlRm9udDtcclxuICAgIHZhciBzZXJpZXNTaXplID0gY3R4Lm1lYXN1cmVUZXh0KHRoaXMuc2VyaWVzKTtcclxuICAgIHZhciB0aXRsZVNpemUgPSBjdHgubWVhc3VyZVRleHQodGhpcy50aXRsZSk7XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG5cclxuICAgIHRoaXMuc2l6ZSA9IG5ldyBQb2ludChNYXRoLm1heChzZXJpZXNTaXplLndpZHRoLCB0aXRsZVNpemUud2lkdGgpLCB0aXRsZUZvbnRTaXplICogMik7XHJcbiAgICBcclxuICAgIFxyXG5cclxuICAgIGlmKHRoaXMuZGlzcGxheUZ1bGxEYXRhKSB7XHJcbiAgICAgICAgdGhpcy5zaXplLnggPSBNYXRoLm1heCgyNDAsIE1hdGgubWF4KHNlcmllc1NpemUud2lkdGgsIHRpdGxlU2l6ZS53aWR0aCkpO1xyXG4gICAgICAgIHRoaXMuZGVzY3JpcHRpb25MaW5lcyA9IHBQYWludGVyLnRleHRUb0xpbmVzKGN0eCwgdGhpcy5kZXNjcmlwdGlvbiwgZGVzY3JpcHRvckZvbnQsIHRoaXMuc2l6ZS54KTtcclxuICAgICAgICB0aGlzLnNpemUueSArPSBsaW5lQnJlYWsgKyB0aGlzLmRlc2NyaXB0aW9uTGluZXMubGVuZ3RoICogZGVzY3JpcHRvckZvbnRTaXplO1xyXG4gICAgfVxyXG59O1xyXG5cclxuXHJcblxyXG5Ob2RlTGFiZWwucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChwTW91c2VTdGF0ZSwgdGltZSwgZGlzcGxheUJyaWVmKSB7XHJcbiAgICBcclxuICAgIFxyXG4gICAgLy9kaXJlY3RseSBhYm92ZSBub2RlXHJcbiAgICB0aGlzLmRlc2lyZWRQb3NpdGlvbiA9IG5ldyBQb2ludChcclxuICAgICAgICB0aGlzLm5vZGUucG9zaXRpb24ueCxcclxuICAgICAgICB0aGlzLm5vZGUucG9zaXRpb24ueSAtIHRoaXMubm9kZS5zaXplIC0gMTIgLSBsYWJlbENvcm5lclNpemUpO1xyXG4gICAgXHJcbiAgICBpZih0aGlzLmRlc2lyZWRQb3NpdGlvbi54ICE9IHRoaXMucG9zaXRpb24ueCB8fCB0aGlzLmRlc2lyZWRQb3NpdGlvbi55ICE9IHRoaXMucG9zaXRpb24ueSkge1xyXG4gICAgICAgIC8vbW92ZSB0b3dhcmRzIGRlc2lyZWRQb3NpdGlvblxyXG4gICAgICAgIHZhciBkaWYgPSBuZXcgUG9pbnQoXHJcbiAgICAgICAgICAgIHRoaXMuZGVzaXJlZFBvc2l0aW9uLnggLSB0aGlzLnBvc2l0aW9uLngsXHJcbiAgICAgICAgICAgIHRoaXMuZGVzaXJlZFBvc2l0aW9uLnkgLSB0aGlzLnBvc2l0aW9uLnkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBzcGVlZFNjYWxhciA9IE1hdGguc3FydChkaWYueCAqIGRpZi54ICsgZGlmLnkgKiBkaWYueSkgKiB0aW1lLmRlbHRhVGltZTtcclxuXHJcbiAgICAgICAgdmFyIHZlbG9jaXR5ID0gbmV3IFBvaW50KGRpZi54ICogc3BlZWRTY2FsYXIsIGRpZi55ICogc3BlZWRTY2FsYXIpO1xyXG4gICAgICAgIGlmKHZlbG9jaXR5LnggKiB2ZWxvY2l0eS54IDwgZGlmLnggKiBkaWYueCkge1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnggKz0gdmVsb2NpdHkueDtcclxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi55ICs9IHZlbG9jaXR5Lnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnggPSB0aGlzLmRlc2lyZWRQb3NpdGlvbi54O1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnkgPSB0aGlzLmRlc2lyZWRQb3NpdGlvbi55O1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgXHJcbiAgICAvL2lmIHRoaXMgaXMgdGhlIHByaW1hcnkgbm9kZSwgZGlzcGxheSBkZXNjcmlwdGlvblxyXG4gICAgaWYoZGlzcGxheUJyaWVmKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYodGhpcy5kaXNwbGF5RnVsbERhdGEgPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgdGhpcy5zaXplID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheUZ1bGxEYXRhID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICh0aGlzLmRpc3BsYXlGdWxsRGF0YSA9PSB0cnVlKSB7XHJcbiAgICAgICAgdGhpcy5idXR0b25DbGlja2VkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zaXplID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5kaXNwbGF5RnVsbERhdGEgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIFxyXG59XHJcblxyXG5Ob2RlTGFiZWwucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihwQ2FudmFzU3RhdGUsIHBQYWludGVyKSB7XHJcbiAgICBcclxuICAgIGlmKCF0aGlzLnNpemUpIHtcclxuICAgICAgICB0aGlzLmNhbGN1bGF0ZVRleHRGaXQocENhbnZhc1N0YXRlLmN0eCwgcFBhaW50ZXIpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvL2RyYXcgbGluZSBmcm9tIG5vZGUgdG8gbGFiZWxcclxuICAgIHBDYW52YXNTdGF0ZS5jdHguc2F2ZSgpO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5zdHJva2VTdHlsZSA9IFwiI2ZmZlwiO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5saW5lV2lkdGggPSAyO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5iZWdpblBhdGgoKTtcclxuICAgIFxyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5tb3ZlVG8oXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi54LFxyXG4gICAgICAgIHRoaXMucG9zaXRpb24ueSk7XHJcbiAgICBcclxuICAgIHBDYW52YXNTdGF0ZS5jdHgubGluZVRvKFxyXG4gICAgICAgIHRoaXMubm9kZS5wb3NpdGlvbi54LFxyXG4gICAgICAgIHRoaXMubm9kZS5wb3NpdGlvbi55IC0gdGhpcy5ub2RlLnNpemUpO1xyXG4gICAgXHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LmNsb3NlUGF0aCgpO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5zdHJva2UoKTtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHgucmVzdG9yZSgpO1xyXG4gICAgXHJcbiAgICAvL2RyYXcgbGFiZWxcclxuICAgIHBQYWludGVyLnJvdW5kZWRSZWN0KFxyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHgsXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi54IC0gKHRoaXMuc2l6ZS54IC8gMiksXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi55IC0gdGhpcy5zaXplLnksXHJcbiAgICAgICAgdGhpcy5zaXplLngsXHJcbiAgICAgICAgdGhpcy5zaXplLnksXHJcbiAgICAgICAgbGFiZWxDb3JuZXJTaXplLFxyXG4gICAgICAgIHRydWUsIHRoaXMubm9kZS5jb2xvcixcclxuICAgICAgICB0cnVlLCBcIiNmZmZcIiwgMik7XHJcbiAgICBcclxuICAgIFxyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5zYXZlKCk7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LmZpbGxTdHlsZSA9IFwiI2ZmZlwiO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5mb250ID0gdGl0bGVGb250O1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC50ZXh0QmFzZWxpbmUgPSBcInRvcFwiO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5maWxsVGV4dChcclxuICAgICAgICB0aGlzLnNlcmllcyxcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLngsXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi55IC0gdGhpcy5zaXplLnkpO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5maWxsVGV4dChcclxuICAgICAgICB0aGlzLnRpdGxlLFxyXG4gICAgICAgIHRoaXMucG9zaXRpb24ueCxcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnkgLSB0aGlzLnNpemUueSArIHRpdGxlRm9udFNpemUpO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5yZXN0b3JlKCk7XHJcbiAgICBcclxuICAgIFxyXG4gICAgaWYodGhpcy5kaXNwbGF5RnVsbERhdGEpIHtcclxuICAgICAgICBcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LnNhdmUoKTtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LmZpbGxTdHlsZSA9IFwiI2ZmZlwiO1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHguZm9udCA9IGRlc2NyaXB0b3JGb250O1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHgudGV4dEJhc2VsaW5lID0gXCJ0b3BcIjtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LnRleHRBbGlnbiA9IFwibGVmdFwiO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmRlc2NyaXB0aW9uTGluZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5maWxsVGV4dChcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVzY3JpcHRpb25MaW5lc1tpXSxcclxuICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueCAtIHRoaXMuc2l6ZS54IC8gMixcclxuICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueSAtIHRoaXMuc2l6ZS55ICsgdGl0bGVGb250U2l6ZSAqIDIgKyBsaW5lQnJlYWsgKyBpICogZGVzY3JpcHRvckZvbnRTaXplKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5yZXN0b3JlKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzICA9IE5vZGVMYWJlbDsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbi8vcGFyYW1ldGVyIGlzIGEgcG9pbnQgdGhhdCBkZW5vdGVzIHN0YXJ0aW5nIHBvc2l0aW9uXHJcbmZ1bmN0aW9uIFBhcnNlcihwVGFyZ2V0VVJMLCBjYWxsYmFjayl7XHJcbiAgICB2YXIgSlNPTk9iamVjdDtcclxuICAgIHZhciBsZXNzb25BcnJheSA9IFtdO1xyXG4gICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgSlNPTk9iamVjdCA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCk7XHJcblxyXG4gICAgICAgIC8vcGFzcyBsZXNzb24gZGF0YSBiYWNrXHJcbiAgICAgICAgY2FsbGJhY2soSlNPTk9iamVjdCk7XHJcbiAgICB9XHJcblxyXG4gICAgeGhyLm9wZW4oJ0dFVCcsIHBUYXJnZXRVUkwsIHRydWUpO1xyXG4gICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoXCJJZi1Nb2RpZmllZC1TaW5jZVwiLCBcIlNhdCwgMSBKYW4gMjAxMCAwMDowMDowMCBHTTBUXCIpO1xyXG4gICAgeGhyLnNlbmQoKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQYXJzZXI7IiwiXCJ1c2Ugc3RyaWN0XCJcclxuXHJcbnZhciBxdWVyeURhdGEgPSBbXTtcclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZVF1ZXJ5RGF0YSgpIHtcclxuICAgIHZhciBsaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJRdWVyeUxpc3REYXRhXCIpO1xyXG4gICAgbGlzdC5pbm5lckhUTUwgPSBcIlwiO1xyXG4gICAgaWYocXVlcnlEYXRhLmxlbmd0aCA+IDApIHtcclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgcXVlcnlEYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxpc3QuaW5uZXJIVE1MICs9IFwiPGxpPlwiICsgcXVlcnlEYXRhW2ldLnR5cGUgKyBcIjogXCIgKyBxdWVyeURhdGFbaV0udmFsdWUgKyBcIjwvbGk+XCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2xlYXJxdWVyeWJ1dHRvblwiKS5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmVcIjtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2xlYXJxdWVyeWJ1dHRvblwiKS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICB9XHJcbn07XHJcblxyXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlYXJjaHRleHRidXR0b25cIikub25jbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHF1ZXJ5ID0ge1xyXG4gICAgICAgIHR5cGU6IFwiVGV4dFwiLFxyXG4gICAgICAgIHZhbHVlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlYXJjaHRleHRmaWVsZFwiKS52YWx1ZVxyXG4gICAgfTtcclxuICAgIGlmKHF1ZXJ5LnZhbHVlID09IFwiXCIpXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgcXVlcnlEYXRhLnB1c2gocXVlcnkpO1xyXG4gICAgdXBkYXRlUXVlcnlEYXRhKCk7XHJcbn07XHJcblxyXG5cclxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZWFyY2hsYW5ndWFnZWJ1dHRvblwiKS5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcXVlcnkgPSB7XHJcbiAgICAgICAgdHlwZTogXCJMYW5ndWFnZVwiLFxyXG4gICAgICAgIHZhbHVlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlYXJjaGxhbmd1YWdlZmllbGRcIikudmFsdWVcclxuICAgIH07XHJcbiAgICBpZihxdWVyeS52YWx1ZSA9PSBcIkFueVwiKVxyXG4gICAgICAgIHJldHVybjtcclxuICAgIHF1ZXJ5RGF0YS5wdXNoKHF1ZXJ5KTtcclxuICAgIHVwZGF0ZVF1ZXJ5RGF0YSgpO1xyXG59O1xyXG5cclxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZWFyY2h0YWdidXR0b25cIikub25jbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHF1ZXJ5ID0ge1xyXG4gICAgICAgIHR5cGU6IFwiVGFnXCIsXHJcbiAgICAgICAgdmFsdWU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2VhcmNodGFnZmllbGRcIikudmFsdWVcclxuICAgIH07XHJcbiAgICBpZihxdWVyeS52YWx1ZSA9PSBcIkFueVwiKVxyXG4gICAgICAgIHJldHVybjtcclxuICAgIHF1ZXJ5RGF0YS5wdXNoKHF1ZXJ5KTtcclxuICAgIHVwZGF0ZVF1ZXJ5RGF0YSgpO1xyXG59O1xyXG5cclxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjbGVhcnF1ZXJ5YnV0dG9uXCIpLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcclxuICAgIHF1ZXJ5RGF0YSA9IFtdO1xyXG4gICAgdXBkYXRlUXVlcnlEYXRhKCk7XHJcbn07XHJcblxyXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlYXJjaGJ1dHRvblwiKS5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICBcclxufTtcclxuXHJcblxyXG5mdW5jdGlvbiBTZWFyY2hQYW5lbChncmFwaCkge1xyXG4gICAgdGhpcy5ncmFwaCA9IGdyYXBoO1xyXG4gICAgdGhpcy5vcGVuID0gZmFsc2U7XHJcbiAgICB0aGlzLnRyYW5zaXRpb25PbiA9IGZhbHNlO1xyXG4gICAgdGhpcy50cmFuc2l0aW9uVGltZSA9IDA7XHJcbiAgICB0aGlzLm9wdGlvbnNEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxlZnRCYXJcIik7XHJcbiAgICBcclxuICAgIHRoaXMuc2VhcmNoQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZWFyY2hidXR0b25cIik7XHJcbiAgICBcclxuICAgIFxyXG4gICAgdGhpcy5zZWFyY2hCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uICh0aGF0KSB7XHJcbiAgICAgICAgLy9wYXJzZSBkYXRhIHRvIGZpbmQgbWF0Y2hpbmcgcmVzdWx0c1xyXG4gICAgICAgIHZhciBzZWFyY2hSZXN1bHRzID0gdGhhdC5zZWFyY2gocXVlcnlEYXRhLCB0aGF0LmdyYXBoLm5vZGVzKTtcclxuICAgICAgICBcclxuICAgICAgICAvL2Rpc3BsYXkgcmVzdWx0c1xyXG4gICAgICAgIHZhciBkaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlYXJjaHJlc3VsdHNcIik7XHJcbiAgICAgICAgaWYoc2VhcmNoUmVzdWx0cy5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICBkaXYuaW5uZXJIVE1MID0gXCJObyBNYXRjaGluZyBSZXN1bHRzIEZvdW5kLlwiO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGRpdi5pbm5lckhUTUwgPSBcIlwiO1xyXG4gICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBzZWFyY2hSZXN1bHRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIC8vY3JlYXRlIGxpc3QgdGFnXHJcbiAgICAgICAgICAgIHZhciBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKTtcclxuICAgICAgICAgICAgLy9zZXQgdGl0bGUgYXMgdGV4dFxyXG4gICAgICAgICAgICBsaS5pbm5lckhUTUwgPSBzZWFyY2hSZXN1bHRzW2ldLmRhdGEudGl0bGU7XHJcbiAgICAgICAgICAgIC8vYWRkIGV2ZW50IHRvIGZvY3VzIHRoZSBub2RlIGlmIGl0cyBjbGlja2VkXHJcbiAgICAgICAgICAgIGxpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbih0aGF0LCBub2RlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmdyYXBoLkZvY3VzTm9kZShub2RlKTtcclxuICAgICAgICAgICAgfS5iaW5kKGxpLCB0aGF0LCBzZWFyY2hSZXN1bHRzW2ldKSk7XHJcbiAgICAgICAgICAgIC8vYWRkIHRoZSB0YWcgdG8gdGhlIHBhZ2VcclxuICAgICAgICAgICAgZGl2LmFwcGVuZENoaWxkKGxpKTtcclxuICAgICAgICB9XHJcbiAgICB9LmJpbmQodGhpcy5zZWFyY2hCdXR0b24sIHRoaXMpKTtcclxufTtcclxuXHJcblxyXG5cclxuXHJcblNlYXJjaFBhbmVsLnByb3RvdHlwZS5zZWFyY2ggPSBmdW5jdGlvbihxdWVyeSwgbm9kZXMpIHtcclxuICAgIHZhciByZXN1bHRzID0gW107XHJcbiAgICBcclxuICAgIFxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG5vZGUgPSBub2Rlc1tpXS5kYXRhO1xyXG4gICAgICAgIHZhciBtYXRjaCA9IHRydWU7XHJcbiAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IHF1ZXJ5Lmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIGlmKHF1ZXJ5W2pdLnR5cGUgPT09IFwiVGV4dFwiKSB7XHJcbiAgICAgICAgICAgICAgICBpZihub2RlLnRpdGxlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihxdWVyeVtqXS52YWx1ZS50b0xvd2VyQ2FzZSgpKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZihub2RlLnNlcmllcy50b0xvd2VyQ2FzZSgpLmluZGV4T2YocXVlcnlbal0udmFsdWUudG9Mb3dlckNhc2UoKSkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKG5vZGUuZGVzY3JpcHRpb24udG9Mb3dlckNhc2UoKS5pbmRleE9mKHF1ZXJ5W2pdLnZhbHVlLnRvTG93ZXJDYXNlKCkpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2ggPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYocXVlcnlbal0udHlwZSA9PT0gXCJMYW5ndWFnZVwiKSB7XHJcbiAgICAgICAgICAgICAgICBpZihub2RlLmxhbmd1YWdlICE9PSBxdWVyeVtqXS52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1hdGNoID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdGFnTWF0Y2ggPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGZvcih2YXIgayA9IDA7IGsgPCBub2RlLnRhZ3MubGVuZ3RoOyBrKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZihub2RlLnRhZ3Nba10gPT0gcXVlcnlbal0udmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFnTWF0Y2ggPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmKHRhZ01hdGNoID09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2ggPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvL2lmIHdlIHBhc3NlZCBhbGwgdGhhdCBjcmFwLCB3ZSBoYXZlIGEgbWF0Y2ghXHJcbiAgICAgICAgaWYobWF0Y2ggPT09IHRydWUpIHsgXHJcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaChub2Rlc1tpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZXR1cm4gcmVzdWx0cztcclxufTtcclxuXHJcblxyXG5TZWFyY2hQYW5lbC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oY2FudmFzU3RhdGUsIHRpbWUpIHtcclxuICAgIFxyXG4gICAgLy90cmFuc2l0aW9uIG9uXHJcbiAgICBpZih0aGlzLnRyYW5zaXRpb25Pbikge1xyXG4gICAgICAgIGlmKHRoaXMudHJhbnNpdGlvblRpbWUgPCAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvblRpbWUgKz0gdGltZS5kZWx0YVRpbWUgKiAzO1xyXG4gICAgICAgICAgICBpZih0aGlzLnRyYW5zaXRpb25UaW1lID49IDEpIHtcclxuICAgICAgICAgICAgICAgIC8vZG9uZSB0cmFuc2l0aW9uaW5nXHJcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25UaW1lID0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vdHJhbnNpdGlvbiBvZmZcclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGlmKHRoaXMudHJhbnNpdGlvblRpbWUgPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvblRpbWUgLT0gdGltZS5kZWx0YVRpbWUgKiAzO1xyXG4gICAgICAgICAgICBpZih0aGlzLnRyYW5zaXRpb25UaW1lIDw9IDApIHtcclxuICAgICAgICAgICAgICAgIC8vZG9uZSB0cmFuc2l0aW9uaW5nXHJcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25UaW1lID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMub3BlbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNlYXJjaFBhbmVsOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIFBvaW50ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL1BvaW50LmpzJyk7XHJcbnZhciBOb2RlTGFiZWwgPSByZXF1aXJlKCcuL05vZGVMYWJlbC5qcycpO1xyXG52YXIgQnV0dG9uID0gcmVxdWlyZSgnLi4vLi4vY29udGFpbmVycy9CdXR0b24uanMnKTtcclxuXHJcbnZhciBob3Jpem9udGFsU3BhY2luZyA9IDE4MDtcclxudmFyIGJhc2VTaXplID0gMjQ7XHJcblxyXG52YXIgVHV0b3JpYWxTdGF0ZSA9IHtcclxuICAgIExvY2tlZDogMCxcclxuICAgIFVubG9ja2VkOiAxLFxyXG4gICAgQ29tcGxldGVkOiAyXHJcbn07XHJcblxyXG52YXIgVHV0b3JpYWxUYWdzID0ge1xyXG4gICAgXCJBSVwiOiBcIiM4MDRcIixcclxuICAgIFwiQXVkaW9cIjogXCIjMDQ4XCIsXHJcbiAgICBcIkNvbXB1dGVyIFNjaWVuY2VcIjogXCIjMTExXCIsXHJcbiAgICBcIkNvcmVcIjogXCIjMzMzXCIsXHJcbiAgICBcIkdyYXBoaWNzXCI6IFwiI2MwY1wiLFxyXG4gICAgXCJJbnB1dFwiOiBcIiM4ODBcIixcclxuICAgIFwiTWF0aFwiOiBcIiM0ODRcIixcclxuICAgIFwiTmV0d29ya2luZ1wiOiBcIiNjNjBcIixcclxuICAgIFwiT3B0aW1pemF0aW9uXCI6IFwiIzI4MlwiLFxyXG4gICAgXCJQaHlzaWNzXCI6IFwiIzA0OFwiLFxyXG4gICAgXCJTY3JpcHRpbmdcIjogXCIjMDg4XCIsXHJcbiAgICBcIlNvZnR3YXJlRW5naW5lZXJpbmdcIjogXCIjODQ0XCJcclxufTtcclxuXHJcblxyXG4vL21ha2UgYSBub2RlIHdpdGggc29tZSBkYXRhXHJcbmZ1bmN0aW9uIFR1dG9yaWFsTm9kZShKU09OQ2h1bmspIHtcclxuICAgIHRoaXMuZGF0YSA9IEpTT05DaHVuaztcclxuICAgIHRoaXMucHJpbWFyeVRhZyA9IHRoaXMuZGF0YS50YWdzWzBdO1xyXG4gICAgdGhpcy5jb2xvciA9IFR1dG9yaWFsVGFnc1t0aGlzLnByaW1hcnlUYWddO1xyXG4gICAgXHJcbiAgICB0aGlzLnN0YXRlID0gVHV0b3JpYWxTdGF0ZS5Mb2NrZWQ7XHJcbiAgICB0aGlzLm1vdXNlT3ZlciA9IGZhbHNlO1xyXG4gICAgXHJcbiAgICBcclxuICAgIHRoaXMucG9zaXRpb24gPSBuZXcgUG9pbnQoMCwgMCk7XHJcbiAgICB0aGlzLnByZXZpb3VzUG9zaXRpb24gPSBuZXcgUG9pbnQoMCwgMCk7XHJcbiAgICB0aGlzLm5leHRQb3NpdGlvbiA9IG5ldyBQb2ludCgwLCAwKTtcclxuICAgIFxyXG4gICAgdGhpcy5zaXplID0gMjQ7XHJcbiAgICB0aGlzLmxhYmVsID0gbmV3IE5vZGVMYWJlbCh0aGlzKTtcclxuICAgICAgICBcclxuICAgIHRoaXMubmV4dE5vZGVzID0gW107XHJcbiAgICB0aGlzLnByZXZpb3VzTm9kZXMgPSBbXTtcclxuICAgIFxyXG4gICAgdGhpcy5kZXRhaWxzQnV0dG9uID0gbmV3IEJ1dHRvbihuZXcgUG9pbnQoMCwgMCksIG5ldyBQb2ludCg3MiwgMzYpLCBcIk1vcmVcIiwgdGhpcy5jb2xvcik7XHJcbiAgICBcclxufTtcclxuXHJcbi8vcmVjdXJzaXZlIGZ1bmN0aW9uIHRvIGdldCBwcmV2aW91cyBub2Rlc1xyXG5UdXRvcmlhbE5vZGUucHJvdG90eXBlLmdldFByZXZpb3VzID0gZnVuY3Rpb24oZGVwdGgpIHtcclxuICAgIHZhciByZXN1bHQgPSBbXTtcclxuICAgIHJlc3VsdC5wdXNoKHRoaXMpO1xyXG4gICAgaWYoZGVwdGggPiAwKSB7XHJcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMucHJldmlvdXNOb2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgcHJldmlvdXMgPSB0aGlzLnByZXZpb3VzTm9kZXNbaV0uZ2V0UHJldmlvdXMoZGVwdGgtMSk7XHJcbiAgICAgICAgICAgIGZvcih2YXIgaiA9IDA7IGogPCBwcmV2aW91cy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gocHJldmlvdXNbal0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufTtcclxuXHJcblxyXG5cclxuLy9yZWN1cnNpdmUgZnVuY3Rpb24gdG8gZ2V0IG5leHQgbm9kZXNcclxuVHV0b3JpYWxOb2RlLnByb3RvdHlwZS5nZXROZXh0ID0gZnVuY3Rpb24oZGVwdGgpIHtcclxuICAgIHZhciByZXN1bHQgPSBbXTtcclxuICAgIHJlc3VsdC5wdXNoKHRoaXMpO1xyXG4gICAgaWYoZGVwdGggPiAwKSB7XHJcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMubmV4dE5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBwcmV2aW91cyA9IHRoaXMubmV4dE5vZGVzW2ldLmdldE5leHQoZGVwdGgtMSk7XHJcbiAgICAgICAgICAgIGZvcih2YXIgaiA9IDA7IGogPCBwcmV2aW91cy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gocHJldmlvdXNbal0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufTtcclxuXHJcbi8vZGlyZWN0aW9uIGlzIHRoZSBzaWRlIG9mIHRoZSBwYXJlbnQgdGhpcyBub2RlIGV4aXN0cyBvblxyXG4vL2xheWVyIGRlcHRoIGlzIGhvdyBtYW55IGxheWVycyB0byByZW5kZXIgb3V0XHJcblR1dG9yaWFsTm9kZS5wcm90b3R5cGUucmVjdXJzaXZlVXBkYXRlID0gZnVuY3Rpb24oZGlyZWN0aW9uLCBkZXB0aCkge1xyXG4gICAgaWYoZGVwdGggPiAwKSB7XHJcbiAgICAgICAgaWYoZGlyZWN0aW9uIDwgMSkge1xyXG4gICAgICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5wcmV2aW91c05vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByZXZpb3VzTm9kZXNbaV0ucmVjdXJzaXZlVXBkYXRlKC0xLCBkZXB0aCAtIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKGRpcmVjdGlvbiA+IC0xKSB7XHJcbiAgICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLm5leHROb2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uZXh0Tm9kZXNbaV0ucmVjdXJzaXZlVXBkYXRlKDEsIGRlcHRoIC0gMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vL3VwZGF0ZXMgYSBub2RlXHJcbi8vdHJhbnNpdGlvbiB0aW1lIGlzIDEtMCwgd2l0aCAwIGJlaW5nIHRoZSBmaW5hbCBsb2NhdGlvblxyXG5UdXRvcmlhbE5vZGUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKG1vdXNlU3RhdGUsIHRpbWUsIHRyYW5zaXRpb25UaW1lLCBpc0ZvY3VzZWQpIHtcclxuICAgIFxyXG4gICAgLy9tb3ZlIHRoZSBub2RlXHJcbiAgICBpZih0aGlzLnBvc2l0aW9uICE9IHRoaXMubmV4dFBvc2l0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi54ID0gKHRoaXMucHJldmlvdXNQb3NpdGlvbi54ICogdHJhbnNpdGlvblRpbWUpICsgKHRoaXMubmV4dFBvc2l0aW9uLnggKiAoMSAtIHRyYW5zaXRpb25UaW1lKSk7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi55ID0gKHRoaXMucHJldmlvdXNQb3NpdGlvbi55ICogdHJhbnNpdGlvblRpbWUpICsgKHRoaXMubmV4dFBvc2l0aW9uLnkgKiAoMSAtIHRyYW5zaXRpb25UaW1lKSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGlmKGlzRm9jdXNlZCkge1xyXG4gICAgICAgIHRoaXMuc2l6ZSA9IDM2O1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgLy90ZXN0IGlmIG1vdXNlIGlzIGluc2lkZSBjaXJjbGVcclxuICAgICAgICB2YXIgZHggPSBtb3VzZVN0YXRlLnJlbGF0aXZlUG9zaXRpb24ueCAtIHRoaXMucG9zaXRpb24ueDtcclxuICAgICAgICB2YXIgZHkgPSBtb3VzZVN0YXRlLnJlbGF0aXZlUG9zaXRpb24ueSAtIHRoaXMucG9zaXRpb24ueTtcclxuICAgICAgICBpZigoZHggKiBkeCkgKyAoZHkgKiBkeSkgPCB0aGlzLnNpemUgKiB0aGlzLnNpemUpIHtcclxuICAgICAgICAgICAgdGhpcy5zaXplID0gMzA7XHJcbiAgICAgICAgICAgIHRoaXMubW91c2VPdmVyID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2l6ZSA9IDI0O1xyXG4gICAgICAgICAgICB0aGlzLm1vdXNlT3ZlciA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgXHJcbiAgICBcclxuICAgIHRoaXMubGFiZWwudXBkYXRlKG1vdXNlU3RhdGUsIHRpbWUsIGlzRm9jdXNlZCk7XHJcbiAgICBcclxuICAgIGlmKGlzRm9jdXNlZCkge1xyXG4gICAgICAgIHRoaXMuZGV0YWlsc0J1dHRvbi5wb3NpdGlvbi54ID0gdGhpcy5wb3NpdGlvbi54IC0gdGhpcy5kZXRhaWxzQnV0dG9uLnNpemUueCAvIDIgLSAzO1xyXG4gICAgICAgIHRoaXMuZGV0YWlsc0J1dHRvbi5wb3NpdGlvbi55ID0gdGhpcy5wb3NpdGlvbi55ICsgdGhpcy5zaXplICsgMTI7XHJcbiAgICAgICAgdGhpcy5kZXRhaWxzQnV0dG9uLnVwZGF0ZShtb3VzZVN0YXRlKTtcclxuICAgIH1cclxufTtcclxuXHJcblxyXG5UdXRvcmlhbE5vZGUucHJvdG90eXBlLnNldFRyYW5zaXRpb24gPSBmdW5jdGlvbihsYXllckRlcHRoLCBwYXJlbnQsIGRpcmVjdGlvbiwgdGFyZ2V0UG9zaXRpb24pIHtcclxuICAgIFxyXG4gICAgXHJcbiAgICAvL2RvbnQgbWVzcyB3aXRoIG5vZGUgcG9zaXRpb24gaWYgaXQgYWxyZWFkeSBleGlzdHMgaW4gdGhlIGdyYXBoXHJcbiAgICBpZih0aGlzLmN1cnJlbnRMYXllckRlcHRoID4gMCAmJiB0aGlzLmN1cnJlbnRMYXllckRlcHRoIDwgbGF5ZXJEZXB0aCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgdGhpcy5jdXJyZW50TGF5ZXJEZXB0aCA9IGxheWVyRGVwdGg7XHJcbiAgICBcclxuICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xyXG4gICAgdGhpcy5wcmV2aW91c1Bvc2l0aW9uID0gdGhpcy5wb3NpdGlvbjtcclxuICAgIHRoaXMubmV4dFBvc2l0aW9uID0gdGFyZ2V0UG9zaXRpb247XHJcbiAgICBcclxuICAgIC8vZmlndXJlIG91dCBzaXplIG9mIGNoaWxkcmVuIHRvIHNwYWNlIHRoZW0gb3V0IGFwcHJvcHJpYXRlbHlcclxuICAgIGlmKGxheWVyRGVwdGggPiAwKSB7XHJcbiAgICAgICAgdmFyIHhQb3NpdGlvbjtcclxuICAgICAgICB2YXIgeVBvc2l0aW9uO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vbGVmdCBvciBtaWRkbGVcclxuICAgICAgICBpZihkaXJlY3Rpb24gPCAxKSB7XHJcbiAgICAgICAgICAgIHZhciB0b3RhbExlZnRIZWlnaHQgPSB0aGlzLmdldFByZXZpb3VzSGVpZ2h0KGxheWVyRGVwdGgpO1xyXG4gICAgICAgICAgICB4UG9zaXRpb24gPSB0YXJnZXRQb3NpdGlvbi54IC0gaG9yaXpvbnRhbFNwYWNpbmc7XHJcbiAgICAgICAgICAgIGlmKGRpcmVjdGlvbiA9PSAwKSB4UG9zaXRpb24gLT0gNjA7XHJcbiAgICAgICAgICAgIHlQb3NpdGlvbiA9IHRhcmdldFBvc2l0aW9uLnkgLSAodG90YWxMZWZ0SGVpZ2h0IC8gMik7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5wcmV2aW91c05vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcGxhY2VtZW50ID0gbmV3IFBvaW50KHhQb3NpdGlvbiwgeVBvc2l0aW9uICsgdGhpcy5wcmV2aW91c05vZGVzW2ldLmN1cnJlbnRIZWlnaHQgLyAyKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJldmlvdXNOb2Rlc1tpXS5zZXRUcmFuc2l0aW9uKGxheWVyRGVwdGggLSAxLCB0aGlzLCAtMSwgcGxhY2VtZW50KTtcclxuICAgICAgICAgICAgICAgIC8qaWYoIXRoaXMud2FzUHJldmlvdXNseU9uU2NyZWVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcmV2aW91c05vZGVzW2ldLnBvc2l0aW9uID0gbmV3IFBvaW50KC0xMDAwLCBwbGFjZW1lbnQueSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcmV2aW91c05vZGVzW2ldLnByZXZpb3VzUG9zaXRpb24gPSBuZXcgUG9pbnQoLTEwMDAsIHBsYWNlbWVudC55KTtcclxuICAgICAgICAgICAgICAgIH0qL1xyXG4gICAgICAgICAgICAgICAgeVBvc2l0aW9uICs9IHRoaXMucHJldmlvdXNOb2Rlc1tpXS5jdXJyZW50SGVpZ2h0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vcmlnaHQgb3IgbWlkZGxlXHJcbiAgICAgICAgaWYoZGlyZWN0aW9uID4gLTEpIHtcclxuICAgICAgICAgICAgdmFyIHRvdGFsUmlnaHRIZWlnaHQgPSB0aGlzLmdldE5leHRIZWlnaHQobGF5ZXJEZXB0aCk7XHJcbiAgICAgICAgICAgIHhQb3NpdGlvbiA9IHRhcmdldFBvc2l0aW9uLnggKyBob3Jpem9udGFsU3BhY2luZztcclxuICAgICAgICAgICAgaWYoZGlyZWN0aW9uID09IDApIHhQb3NpdGlvbiArPSA2MDtcclxuICAgICAgICAgICAgeVBvc2l0aW9uID0gdGFyZ2V0UG9zaXRpb24ueSAtICh0b3RhbFJpZ2h0SGVpZ2h0IC8gMik7XHJcblxyXG4gICAgICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5uZXh0Tm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBwbGFjZW1lbnQgPSBuZXcgUG9pbnQoeFBvc2l0aW9uLCB5UG9zaXRpb24gKyB0aGlzLm5leHROb2Rlc1tpXS5jdXJyZW50SGVpZ2h0IC8gMik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5leHROb2Rlc1tpXS5zZXRUcmFuc2l0aW9uKGxheWVyRGVwdGggLSAxLCB0aGlzLCAxLCBwbGFjZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgLyppZighdGhpcy53YXNQcmV2aW91c2x5T25TY3JlZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5leHROb2Rlc1tpXS5wb3NpdGlvbiA9IG5ldyBQb2ludCgxMDAwLCBwbGFjZW1lbnQueSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXh0Tm9kZXNbaV0ucHJldmlvdXNQb3NpdGlvbiA9IG5ldyBQb2ludCgxMDAwLCBwbGFjZW1lbnQueSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJ0aHJvdyB0aGUgc3dpdGNoIVwiKTtcclxuICAgICAgICAgICAgICAgIH0qL1xyXG4gICAgICAgICAgICAgICAgeVBvc2l0aW9uICs9IHRoaXMubmV4dE5vZGVzW2ldLmN1cnJlbnRIZWlnaHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5UdXRvcmlhbE5vZGUucHJvdG90eXBlLmdldFByZXZpb3VzSGVpZ2h0ID0gZnVuY3Rpb24obGF5ZXJEZXB0aCkge1xyXG4gICAgdGhpcy5jdXJyZW50SGVpZ2h0ID0gMDtcclxuICAgIGlmKGxheWVyRGVwdGggPiAwICYmIHRoaXMucHJldmlvdXNOb2Rlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMucHJldmlvdXNOb2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRIZWlnaHQgKz0gdGhpcy5wcmV2aW91c05vZGVzW2ldLmdldFByZXZpb3VzSGVpZ2h0KGxheWVyRGVwdGggLSAxKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRIZWlnaHQgPSBiYXNlU2l6ZSAqIDU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJldHVybiB0aGlzLmN1cnJlbnRIZWlnaHQ7XHJcbn07XHJcblxyXG5UdXRvcmlhbE5vZGUucHJvdG90eXBlLmdldE5leHRIZWlnaHQgPSBmdW5jdGlvbihsYXllckRlcHRoKSB7XHJcbiAgICB0aGlzLmN1cnJlbnRIZWlnaHQgPSAwO1xyXG4gICAgaWYobGF5ZXJEZXB0aCA+IDAgJiYgdGhpcy5uZXh0Tm9kZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLm5leHROb2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRIZWlnaHQgKz0gdGhpcy5uZXh0Tm9kZXNbaV0uZ2V0TmV4dEhlaWdodChsYXllckRlcHRoIC0gMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50SGVpZ2h0ID0gYmFzZVNpemUgKiA1O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50SGVpZ2h0O1xyXG59O1xyXG5cclxuXHJcblR1dG9yaWFsTm9kZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKHBDYW52YXNTdGF0ZSwgcFBhaW50ZXIsIHBhcmVudENhbGxlciwgZGlyZWN0aW9uLCBsYXllckRlcHRoKSB7XHJcbiAgICAvL2RyYXcgbGluZSB0byBwYXJlbnQgaWYgcG9zc2libGVcclxuICAgIGlmKHBhcmVudENhbGxlciAmJiBwYXJlbnRDYWxsZXIgPT0gdGhpcy5wYXJlbnQpIHtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LnNhdmUoKTtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LmxpbmVXaWR0aCA9IDI7XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5zdHJva2VTdHlsZSA9IFwiI2ZmZlwiO1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy92YXIgYmV0d2VlbiA9IG5ldyBQb2ludCh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSk7XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5tb3ZlVG8odGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnkpO1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHgubGluZVRvKHBhcmVudENhbGxlci5wb3NpdGlvbi54LCBwYXJlbnRDYWxsZXIucG9zaXRpb24ueSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5jbG9zZVBhdGgoKTtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LnN0cm9rZSgpO1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHgucmVzdG9yZSgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvL2RyYXcgY2hpbGQgbm9kZXNcclxuICAgIGlmKGxheWVyRGVwdGggPiAwKXtcclxuICAgICAgICBpZihkaXJlY3Rpb24gPCAxKSB7XHJcbiAgICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLnByZXZpb3VzTm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJldmlvdXNOb2Rlc1tpXS5kcmF3KHBDYW52YXNTdGF0ZSwgcFBhaW50ZXIsIHRoaXMsIC0xLCBsYXllckRlcHRoIC0gMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoZGlyZWN0aW9uID4gLTEpIHtcclxuICAgICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMubmV4dE5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5leHROb2Rlc1tpXS5kcmF3KHBDYW52YXNTdGF0ZSwgcFBhaW50ZXIsIHRoaXMsIDEsIGxheWVyRGVwdGggLSAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgLy9kcmF3IGNpcmNsZVxyXG4gICAgcFBhaW50ZXIuY2lyY2xlKHBDYW52YXNTdGF0ZS5jdHgsIHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55LCB0aGlzLnNpemUsIHRydWUsIHRoaXMuY29sb3IsIHRydWUsIFwiI2ZmZlwiLCAyKTtcclxuICAgIFxyXG4gICAgdGhpcy5sYWJlbC5kcmF3KHBDYW52YXNTdGF0ZSwgcFBhaW50ZXIpO1xyXG4gICAgaWYoZGlyZWN0aW9uID09IDApIHtcclxuICAgICAgICB0aGlzLmRldGFpbHNCdXR0b24uZHJhdyhwQ2FudmFzU3RhdGUsIHBQYWludGVyKTtcclxuICAgIH1cclxufTtcclxuXHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUdXRvcmlhbE5vZGU7Il19
