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
},{"../../common/Point.js":3,"../../containers/Button.js":4,"./NodeLabel.js":14}]},{},[1,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9tYWluLmpzIiwianMvbW9kdWxlcy9HYW1lLmpzIiwianMvbW9kdWxlcy9jb21tb24vUG9pbnQuanMiLCJqcy9tb2R1bGVzL2NvbnRhaW5lcnMvQnV0dG9uLmpzIiwianMvbW9kdWxlcy9jb250YWluZXJzL0NhbnZhc1N0YXRlLmpzIiwianMvbW9kdWxlcy9jb250YWluZXJzL01vdXNlU3RhdGUuanMiLCJqcy9tb2R1bGVzL2NvbnRhaW5lcnMvVGltZS5qcyIsImpzL21vZHVsZXMvbGlicmFyaWVzL0RyYXdsaWIuanMiLCJqcy9tb2R1bGVzL2xpYnJhcmllcy9VdGlsaXRpZXMuanMiLCJqcy9tb2R1bGVzL3BoYXNlcy9ncmFwaFBoYXNlL0RldGFpbHNQYW5lbC5qcyIsImpzL21vZHVsZXMvcGhhc2VzL2dyYXBoUGhhc2UvR3JhcGguanMiLCJqcy9tb2R1bGVzL3BoYXNlcy9ncmFwaFBoYXNlL0dyYXBoUGhhc2UuanMiLCJqcy9tb2R1bGVzL3BoYXNlcy9ncmFwaFBoYXNlL05vZGVMYWJlbC5qcyIsImpzL21vZHVsZXMvcGhhc2VzL2dyYXBoUGhhc2UvUGFyc2VyLmpzIiwianMvbW9kdWxlcy9waGFzZXMvZ3JhcGhQaGFzZS9TZWFyY2hQYW5lbC5qcyIsImpzL21vZHVsZXMvcGhhc2VzL2dyYXBoUGhhc2UvVHV0b3JpYWxOb2RlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDektBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcclxuLy9pbXBvcnRzXHJcbnZhciBHYW1lID0gcmVxdWlyZSgnLi9tb2R1bGVzL0dhbWUuanMnKTtcclxudmFyIFBvaW50ID0gcmVxdWlyZSgnLi9tb2R1bGVzL2NvbW1vbi9Qb2ludC5qcycpO1xyXG52YXIgVGltZSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9jb250YWluZXJzL1RpbWUuanMnKTtcclxudmFyIE1vdXNlU3RhdGUgPSByZXF1aXJlKCcuL21vZHVsZXMvY29udGFpbmVycy9Nb3VzZVN0YXRlLmpzJyk7XHJcbnZhciBDYW52YXNTdGF0ZSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9jb250YWluZXJzL0NhbnZhc1N0YXRlLmpzJyk7XHJcblxyXG4vL2dhbWUgb2JqZWN0c1xyXG52YXIgZ2FtZTtcclxudmFyIGNhbnZhcztcclxudmFyIGN0eDtcclxudmFyIHRpbWU7XHJcblxyXG4vL3Jlc3BvbnNpdmVuZXNzXHJcbnZhciBoZWFkZXI7XHJcbnZhciBjZW50ZXI7XHJcbnZhciBzY2FsZTtcclxuXHJcbi8vbW91c2UgaGFuZGxpbmdcclxudmFyIG1vdXNlUG9zaXRpb247XHJcbnZhciByZWxhdGl2ZU1vdXNlUG9zaXRpb247XHJcbnZhciBtb3VzZURvd247XHJcbnZhciBtb3VzZUluO1xyXG52YXIgd2hlZWxEZWx0YTtcclxuXHJcbi8vcGFzc2FibGUgc3RhdGVzXHJcbnZhciBtb3VzZVN0YXRlO1xyXG52YXIgY2FudmFzU3RhdGU7XHJcblxyXG4vL2ZpcmVzIHdoZW4gdGhlIHdpbmRvdyBsb2Fkc1xyXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24oZSl7XHJcbiAgICAvL2RlYnVnIGJ1dHRvbiBkZXNpZ25lZCB0byBjbGVhciBwcm9ncmVzcyBkYXRhXHJcbiAgICBcclxuICAgIC8vdmFyaWFibGUgYW5kIGxvb3AgaW5pdGlhbGl6YXRpb25cclxuICAgIGluaXRpYWxpemVWYXJpYWJsZXMoKTtcclxuICAgIGxvb3AoKTtcclxufVxyXG5cclxuLy9pbml0aWFsaXphdGlvbiBmb3IgdmFyaWFibGVzLCBtb3VzZSBldmVudHMsIGFuZCBnYW1lIFwiY2xhc3NcIlxyXG5mdW5jdGlvbiBpbml0aWFsaXplVmFyaWFibGVzKCl7XHJcbiAgICAvL2NhbXZhcyBpbml0aWFsaXphdGlvblxyXG4gICAgY2FudmFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignY2FudmFzJyk7XHJcbiAgICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgIFxyXG4gICAgdGltZSA9IG5ldyBUaW1lKCk7XHJcbiAgICBcclxuICAgIFxyXG4gICAgLy9tb3VzZSB2YXJpYWJsZSBpbml0aWFsaXphdGlvblxyXG4gICAgbW91c2VQb3NpdGlvbiA9IG5ldyBQb2ludCgwLDApO1xyXG4gICAgcmVsYXRpdmVNb3VzZVBvc2l0aW9uID0gbmV3IFBvaW50KDAsMCk7XHJcbiAgICBcclxuICAgIFxyXG4gICAgXHJcbiAgICBcclxuICAgIFxyXG4gICAgLy9ldmVudCBsaXN0ZW5lcnMgZm9yIG1vdXNlIGludGVyYWN0aW9ucyB3aXRoIHRoZSBjYW52YXNcclxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICB2YXIgYm91bmRSZWN0ID0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIG1vdXNlUG9zaXRpb24gPSBuZXcgUG9pbnQoZS5jbGllbnRYIC0gYm91bmRSZWN0LmxlZnQsIGUuY2xpZW50WSAtIGJvdW5kUmVjdC50b3ApO1xyXG4gICAgICAgIHJlbGF0aXZlTW91c2VQb3NpdGlvbiA9IG5ldyBQb2ludChtb3VzZVBvc2l0aW9uLnggLSBjYW52YXMub2Zmc2V0V2lkdGggLyAyLCBtb3VzZVBvc2l0aW9uLnkgLSBjYW52YXMub2Zmc2V0SGVpZ2h0IC8gMik7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgbW91c2VEb3duID0gZmFsc2U7XHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBmdW5jdGlvbihlKXtcclxuICAgICAgICBtb3VzZURvd24gPSB0cnVlO1xyXG4gICAgfSk7XHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgbW91c2VEb3duID0gZmFsc2U7XHJcbiAgICB9KTtcclxuICAgIG1vdXNlSW4gPSBmYWxzZTtcclxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VvdmVyXCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIG1vdXNlSW4gPSB0cnVlO1xyXG4gICAgfSk7XHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3V0XCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIG1vdXNlSW4gPSBmYWxzZTtcclxuICAgICAgICBtb3VzZURvd24gPSBmYWxzZTtcclxuICAgIH0pO1xyXG4gICAgd2hlZWxEZWx0YSA9IDA7XHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNld2hlZWxcIiwgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgd2hlZWxEZWx0YSA9IGUud2hlZWxEZWx0YTtcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICBcclxuICAgIFxyXG4gICAgXHJcbiAgICAvL3N0YXRlIHZhcmlhYmxlIGluaXRpYWxpemF0aW9uXHJcbiAgICBtb3VzZVN0YXRlID0gbmV3IE1vdXNlU3RhdGUobW91c2VQb3NpdGlvbiwgcmVsYXRpdmVNb3VzZVBvc2l0aW9uLCBtb3VzZURvd24sIG1vdXNlSW4sIHdoZWVsRGVsdGEpO1xyXG4gICAgY2FudmFzU3RhdGUgPSBuZXcgQ2FudmFzU3RhdGUoY2FudmFzLCBjdHgpO1xyXG4gICAgXHJcbiAgICAvL2xvY2FsIHN0b3JhZ2UgaGFuZGxpbmcgZm9yIGFjdGl2ZSBub2RlIHJlY29yZCBhbmQgcHJvZ3Jlc3NcclxuICAgIGlmKGxvY2FsU3RvcmFnZS5hY3RpdmVOb2RlID09PSB1bmRlZmluZWQpe1xyXG4gICAgICAgIGxvY2FsU3RvcmFnZS5hY3RpdmVOb2RlID0gMDtcclxuICAgIH1cclxuICAgIGlmKGxvY2FsU3RvcmFnZS5wcm9ncmVzcyA9PT0gdW5kZWZpbmVkKXtcclxuICAgICAgICBsb2NhbFN0b3JhZ2UucHJvZ3Jlc3MgPSBcIlwiO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvL2NyZWF0ZXMgdGhlIGdhbWUgb2JqZWN0IGZyb20gd2hpY2ggbW9zdCBpbnRlcmFjdGlvbiBpcyBtYW5hZ2VkXHJcbiAgICBnYW1lID0gbmV3IEdhbWUoKTtcclxufVxyXG5cclxuLy9maXJlcyBvbmNlIHBlciBmcmFtZVxyXG5mdW5jdGlvbiBsb29wKCkge1xyXG4gICAgLy9iaW5kcyBsb29wIHRvIGZyYW1lc1xyXG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShsb29wLmJpbmQodGhpcykpO1xyXG4gICAgXHJcbiAgICB0aW1lLnVwZGF0ZSguMDE2Nyk7XHJcbiAgICBcclxuICAgIC8vZmVlZCBjdXJyZW50IG1vdXNlIHZhcmlhYmxlcyBiYWNrIGludG8gbW91c2Ugc3RhdGVcclxuICAgIG1vdXNlU3RhdGUudXBkYXRlKG1vdXNlUG9zaXRpb24sIHJlbGF0aXZlTW91c2VQb3NpdGlvbiwgbW91c2VEb3duLCBtb3VzZUluLCB3aGVlbERlbHRhKTtcclxuICAgIC8vcmVzZXR0aW5nIHdoZWVsIGRlbHRhXHJcbiAgICB3aGVlbERlbHRhID0gMDtcclxuICAgIFxyXG4gICAgLy91cGRhdGUgZ2FtZSdzIHZhcmlhYmxlczogcGFzc2luZyBjb250ZXh0LCBjYW52YXMsIHRpbWUsIGNlbnRlciBwb2ludCwgdXNhYmxlIGhlaWdodCwgbW91c2Ugc3RhdGVcclxuICAgIFxyXG4gICAgZ2FtZS51cGRhdGUobW91c2VTdGF0ZSwgY2FudmFzU3RhdGUsIHRpbWUpO1xyXG59O1xyXG5cclxuLy9saXN0ZW5zIGZvciBjaGFuZ2VzIGluIHNpemUgb2Ygd2luZG93IGFuZCBhZGp1c3RzIHZhcmlhYmxlcyBhY2NvcmRpbmdseVxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBmdW5jdGlvbihlKXtcclxuICAgIGNhbnZhc1N0YXRlLnVwZGF0ZSgpO1xyXG59KTtcclxuXHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuLy9pbXBvcnRlZCBvYmplY3RzXHJcbnZhciBHcmFwaFBoYXNlID0gcmVxdWlyZSgnLi9waGFzZXMvZ3JhcGhQaGFzZS9HcmFwaFBoYXNlLmpzJyk7XHJcbnZhciBEcmF3TGliID0gcmVxdWlyZSgnLi9saWJyYXJpZXMvRHJhd2xpYi5qcycpO1xyXG52YXIgVXRpbGl0aWVzID0gcmVxdWlyZSgnLi9saWJyYXJpZXMvVXRpbGl0aWVzLmpzJyk7XHJcblxyXG52YXIgYWN0aXZlUGhhc2U7XHJcbnZhciBwYWludGVyO1xyXG52YXIgdXRpbGl0eTtcclxuXHJcbnZhciBtb3VzZVN0YXRlXHJcblxyXG5mdW5jdGlvbiBHYW1lKCl7ICAgIFxyXG4gICAgcGFpbnRlciA9IG5ldyBEcmF3TGliKCk7XHJcbiAgICB1dGlsaXR5ID0gbmV3IFV0aWxpdGllcygpO1xyXG4gICAgXHJcbiAgICAvL2luc3RhbnRpYXRlIHRoZSBncmFwaFxyXG4gICAgYWN0aXZlUGhhc2UgPSBuZXcgR3JhcGhQaGFzZShcImh0dHBzOi8vYXRsYXMtYmFja2VuZC5oZXJva3VhcHAuY29tL3JlcG9zXCIpOyAvL2FjdHVhbCBiYWNrZW5kIGFwcFxyXG4gICAgLy9hY3RpdmVQaGFzZSA9IG5ldyBHcmFwaFBoYXNlKFwiaHR0cDovL2xvY2FsaG9zdDo1MDAwL3JlcG9zXCIpOyAvL2ZvciB0ZXN0aW5nXHJcbiAgICBcclxuICAgIC8vZ2l2ZSBtb3VzZVN0YXRlIGEgdmFsdWUgZnJvbSB0aGUgc3RhcnQgc28gaXQgZG9lc24ndCBwYXNzIHVuZGVmaW5lZCB0byBwcmV2aW91c1xyXG4gICAgbW91c2VTdGF0ZSA9IDA7XHJcbn1cclxuXHJcbi8vcGFzc2luZyBjb250ZXh0LCBjYW52YXMsIGRlbHRhIHRpbWUsIGNlbnRlciBwb2ludCwgbW91c2Ugc3RhdGVcclxuR2FtZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24obW91c2VTdGF0ZSwgY2FudmFzU3RhdGUsIHRpbWUpIHtcclxuICAgIFxyXG4gICAgXHJcbiAgICAvL3VwZGF0ZSBrZXkgdmFyaWFibGVzIGluIHRoZSBhY3RpdmUgcGhhc2VcclxuICAgIGFjdGl2ZVBoYXNlLnVwZGF0ZShtb3VzZVN0YXRlLCBjYW52YXNTdGF0ZSwgdGltZSk7XHJcbiAgICBcclxuICAgIC8vZHJhdyBiYWNrZ3JvdW5kIGFuZCB0aGVuIGFjdGl2ZSBwaGFzZVxyXG4gICAgY2FudmFzU3RhdGUuY3R4LnNhdmUoKTtcclxuICAgIHBhaW50ZXIucmVjdChjYW52YXNTdGF0ZS5jdHgsIDAsIDAsIGNhbnZhc1N0YXRlLndpZHRoLCBjYW52YXNTdGF0ZS5oZWlnaHQsIFwiIzIyMlwiKTtcclxuICAgIGNhbnZhc1N0YXRlLmN0eC5yZXN0b3JlKCk7XHJcbiAgICBhY3RpdmVQaGFzZS5kcmF3KGNhbnZhc1N0YXRlKTtcclxuICAgIFxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmZ1bmN0aW9uIFBvaW50KHBYLCBwWSl7XHJcbiAgICB0aGlzLnggPSBwWDtcclxuICAgIHRoaXMueSA9IHBZO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQb2ludDsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4uL2NvbW1vbi9Qb2ludC5qcycpO1xyXG5cclxuZnVuY3Rpb24gQnV0dG9uKHBvc2l0aW9uLCBzaXplLCB0ZXh0LCBjb2xvcikge1xyXG4gICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBQb2ludChwb3NpdGlvbi54LCBwb3NpdGlvbi55KTtcclxuICAgIHRoaXMuc2l6ZSA9IG5ldyBQb2ludChzaXplLngsIHNpemUueSk7XHJcbiAgICB0aGlzLnRleHQgPSB0ZXh0O1xyXG4gICAgdGhpcy5tb3VzZU92ZXIgPSBmYWxzZTtcclxuICAgIHRoaXMuY29sb3IgPSBjb2xvcjtcclxuICAgIHRoaXMub3V0bGluZVdpZHRoID0gMTtcclxufTtcclxuXHJcbi8vdXBkYXRlcyBidXR0b24sIHJldHVybnMgdHJ1ZSBpZiBjbGlja2VkXHJcbkJ1dHRvbi5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24ocE1vdXNlU3RhdGUpIHtcclxuICAgIFxyXG4gICAgdmFyIG0gPSBwTW91c2VTdGF0ZS5yZWxhdGl2ZVBvc2l0aW9uO1xyXG4gICAgaWYoIG0ueCA8IHRoaXMucG9zaXRpb24ueCB8fCBtLnggPiB0aGlzLnBvc2l0aW9uLnggKyB0aGlzLnNpemUueCB8fFxyXG4gICAgICAgIG0ueSA8IHRoaXMucG9zaXRpb24ueSB8fCBtLnkgPiB0aGlzLnBvc2l0aW9uLnkgKyB0aGlzLnNpemUueSkge1xyXG4gICAgICAgIHRoaXMubW91c2VPdmVyID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLm1vdXNlT3ZlciA9IHRydWU7XHJcbiAgICAgICAgaWYocE1vdXNlU3RhdGUubW91c2VEb3duICYmICFwTW91c2VTdGF0ZS5sYXN0TW91c2VEb3duKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcbkJ1dHRvbi5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKHBDYW52YXNTdGF0ZSwgcFBhaW50ZXIpIHtcclxuICAgIC8vZHJhdyBiYXNlIGJ1dHRvblxyXG4gICAgaWYodGhpcy5tb3VzZU92ZXIpIHtcclxuICAgICAgICB0aGlzLm91dGxpbmVXaWR0aCA9IDI7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLm91dGxpbmVXaWR0aCA9IDE7XHJcbiAgICB9XHJcbiAgICBwUGFpbnRlci5yZWN0KHBDYW52YXNTdGF0ZS5jdHgsXHJcbiAgICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueCAtIHRoaXMub3V0bGluZVdpZHRoLFxyXG4gICAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnkgLSB0aGlzLm91dGxpbmVXaWR0aCxcclxuICAgICAgICAgICAgICAgICAgdGhpcy5zaXplLnggKyAyICogdGhpcy5vdXRsaW5lV2lkdGgsXHJcbiAgICAgICAgICAgICAgICAgIHRoaXMuc2l6ZS55ICsgMiAqIHRoaXMub3V0bGluZVdpZHRoLCBcIiNmZmZcIik7XHJcblxyXG4gICAgcFBhaW50ZXIucmVjdChwQ2FudmFzU3RhdGUuY3R4LCB0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSwgdGhpcy5zaXplLngsIHRoaXMuc2l6ZS55LCB0aGlzLmNvbG9yKTtcclxuICAgIFxyXG4gICAgLy9kcmF3IHRleHQgb2YgYnV0dG9uXHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LnNhdmUoKTtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHguZm9udCA9IFwiMTZweCBBcmlhbFwiO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5maWxsU3R5bGUgPSBcIiNmZmZcIjtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHgudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHgudGV4dEJhc2VsaW5lID0gXCJtaWRkbGVcIjtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHguZmlsbFRleHQodGhpcy50ZXh0LCB0aGlzLnBvc2l0aW9uLnggKyB0aGlzLnNpemUueCAvIDIsIHRoaXMucG9zaXRpb24ueSArIHRoaXMuc2l6ZS55IC8gMik7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LnJlc3RvcmUoKTtcclxuICAgIFxyXG4gICAgXHJcbn07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCdXR0b247IiwiLy9Db250YWlucyBjYW52YXMgcmVsYXRlZCB2YXJpYWJsZXMgaW4gYSBzaW5nbGUgZWFzeS10by1wYXNzIG9iamVjdFxyXG5cInVzZSBzdHJpY3RcIjtcclxudmFyIFBvaW50ID0gcmVxdWlyZSgnLi4vY29tbW9uL1BvaW50LmpzJyk7XHJcblxyXG5cclxuZnVuY3Rpb24gQ2FudmFzU3RhdGUoY2FudmFzLCBjdHgpIHtcclxuICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xyXG4gICAgdGhpcy5jdHggPSBjdHg7XHJcbiAgICB0aGlzLnVwZGF0ZSgpO1xyXG59XHJcblxyXG5DYW52YXNTdGF0ZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLndpZHRoID0gdGhpcy5jYW52YXMud2lkdGggPSB0aGlzLmNhbnZhcy5vZmZzZXRXaWR0aDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5jYW52YXMub2Zmc2V0SGVpZ2h0O1xyXG4gICAgdGhpcy5jZW50ZXIgPSBuZXcgUG9pbnQodGhpcy5jYW52YXMud2lkdGggLyAyLCB0aGlzLmNhbnZhcy5oZWlnaHQgLyAyKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDYW52YXNTdGF0ZTsiLCIvL2tlZXBzIHRyYWNrIG9mIG1vdXNlIHJlbGF0ZWQgdmFyaWFibGVzLlxyXG4vL2NhbGN1bGF0ZWQgaW4gbWFpbiBhbmQgcGFzc2VkIHRvIGdhbWVcclxuLy9jb250YWlucyB1cCBzdGF0ZVxyXG4vL3Bvc2l0aW9uXHJcbi8vcmVsYXRpdmUgcG9zaXRpb25cclxuLy9vbiBjYW52YXNcclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbmZ1bmN0aW9uIE1vdXNlU3RhdGUocFBvc2l0aW9uLCBwUmVsYXRpdmVQb3NpdGlvbiwgcE1vdXNlRG93biwgcE1vdXNlSW4sIHBXaGVlbERlbHRhKXtcclxuICAgIHRoaXMucG9zaXRpb24gPSBwUG9zaXRpb247XHJcbiAgICB0aGlzLnJlbGF0aXZlUG9zaXRpb24gPSBwUmVsYXRpdmVQb3NpdGlvbjtcclxuICAgIHRoaXMubW91c2VEb3duID0gcE1vdXNlRG93bjtcclxuICAgIHRoaXMubW91c2VJbiA9IHBNb3VzZUluO1xyXG4gICAgdGhpcy53aGVlbERlbHRhID0gcFdoZWVsRGVsdGE7XHJcbiAgICBcclxuICAgIC8vdHJhY2tpbmcgcHJldmlvdXMgbW91c2Ugc3RhdGVzXHJcbiAgICB0aGlzLmxhc3RQb3NpdGlvbiA9IHBQb3NpdGlvbjtcclxuICAgIHRoaXMubGFzdFJlbGF0aXZlUG9zaXRpb24gPSBwUmVsYXRpdmVQb3NpdGlvbjtcclxuICAgIHRoaXMubGFzdE1vdXNlRG93biA9IHBNb3VzZURvd247XHJcbiAgICB0aGlzLmxhc3RNb3VzZUluID0gcE1vdXNlSW47XHJcbiAgICB0aGlzLmxhc3RXaGVlbERlbHRhID0gcFdoZWVsRGVsdGFcclxufVxyXG5cclxuTW91c2VTdGF0ZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24ocFBvc2l0aW9uLCBwUmVsYXRpdmVQb3NpdGlvbiwgcE1vdXNlRG93biwgcE1vdXNlSW4sIHBXaGVlbERlbHRhKXtcclxuICAgIHRoaXMubGFzdFBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbjtcclxuICAgIHRoaXMubGFzdFJlbGF0aXZlUG9zaXRpb24gPSB0aGlzLnJlbGF0aXZlUG9zaXRpb247XHJcbiAgICB0aGlzLmxhc3RNb3VzZURvd24gPSB0aGlzLm1vdXNlRG93bjtcclxuICAgIHRoaXMubGFzdE1vdXNlSW4gPSB0aGlzLm1vdXNlSW47XHJcbiAgICB0aGlzLmxhc3RXaGVlbERlbHRhID0gdGhpcy53aGVlbERlbHRhO1xyXG4gICAgXHJcbiAgICBcclxuICAgIHRoaXMucG9zaXRpb24gPSBwUG9zaXRpb247XHJcbiAgICB0aGlzLnJlbGF0aXZlUG9zaXRpb24gPSBwUmVsYXRpdmVQb3NpdGlvbjtcclxuICAgIHRoaXMubW91c2VEb3duID0gcE1vdXNlRG93bjtcclxuICAgIHRoaXMubW91c2VJbiA9IHBNb3VzZUluO1xyXG4gICAgdGhpcy53aGVlbERlbHRhID0gcFdoZWVsRGVsdGE7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTW91c2VTdGF0ZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmZ1bmN0aW9uIFRpbWUgKCkge1xyXG4gICAgdGhpcy50b3RhbFRpbWUgPSAwO1xyXG4gICAgdGhpcy5kZWx0YVRpbWUgPSAwO1xyXG59O1xyXG5cclxuVGltZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQpIHtcclxuICAgIHRoaXMudG90YWxUaW1lICs9IGR0O1xyXG4gICAgdGhpcy5kZWx0YVRpbWUgPSBkdDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGltZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuZnVuY3Rpb24gRHJhd2xpYigpe1xyXG59O1xyXG5cclxuRHJhd2xpYi5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbihjdHgsIHgsIHksIHcsIGgpIHtcclxuICAgIGN0eC5jbGVhclJlY3QoeCwgeSwgdywgaCk7XHJcbn07XHJcblxyXG5EcmF3bGliLnByb3RvdHlwZS5yZWN0ID0gZnVuY3Rpb24oY3R4LCB4LCB5LCB3LCBoLCBjb2wpIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gY29sO1xyXG4gICAgY3R4LmZpbGxSZWN0KHgsIHksIHcsIGgpO1xyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxufTtcclxuXHJcbkRyYXdsaWIucHJvdG90eXBlLnJvdW5kZWRSZWN0ID0gZnVuY3Rpb24oY3R4LCB4LCB5LCB3LCBoLCByYWQsIGZpbGwsIGZpbGxDb2xvciwgb3V0bGluZSwgb3V0bGluZUNvbG9yLCBvdXRsaW5lV2lkdGgpIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHgubW92ZVRvKHgsIHkgLSByYWQpOyAvLzExIG8gY2xvY2tcclxuICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIGN0eC5saW5lVG8oeCArIHcsIHkgLSByYWQpOyAvLzEgbyBjbG9ja1xyXG4gICAgY3R4LmFyY1RvKHggKyB3ICsgcmFkLCB5IC0gcmFkLCB4ICsgdyArIHJhZCwgeSwgcmFkKTsgLy8gMiBvIGNsb2NrXHJcbiAgICBjdHgubGluZVRvKHggKyB3ICsgcmFkLCB5ICsgaCk7IC8vIDQgbyBjbG9ja1xyXG4gICAgY3R4LmFyY1RvKHggKyB3ICsgcmFkLCB5ICsgaCArIHJhZCwgeCArIHcsIHkgKyBoICsgcmFkLCByYWQpIC8vNSBvIGNsb2NrXHJcbiAgICBjdHgubGluZVRvKHgsIHkgKyBoICsgcmFkKTsgLy8gNyBvIGNsb2NrXHJcbiAgICBjdHguYXJjVG8oeCAtIHJhZCwgeSArIGggKyByYWQsIHggLSByYWQsIHkgKyBoLCByYWQpIC8vOCBvIGNsb2NrXHJcbiAgICBjdHgubGluZVRvKHggLSByYWQsIHkpOyAvLyAxMCBvIGNsb2NrXHJcbiAgICBjdHguYXJjVG8oeCAtIHJhZCwgeSAtIHJhZCwgeCwgeSAtcmFkLCByYWQpIC8vMTEgbyBjbG9ja1xyXG4gICAgY3R4LmNsb3NlUGF0aCgpO1xyXG4gICAgaWYoZmlsbCkge1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBmaWxsQ29sb3I7XHJcbiAgICAgICAgY3R4LmZpbGwoKTtcclxuICAgIH1cclxuICAgIGlmKG91dGxpbmUpIHtcclxuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBvdXRsaW5lQ29sb3I7XHJcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IG91dGxpbmVXaWR0aDtcclxuICAgICAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICB9XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG59XHJcblxyXG5EcmF3bGliLnByb3RvdHlwZS5saW5lID0gZnVuY3Rpb24oY3R4LCB4MSwgeTEsIHgyLCB5MiwgdGhpY2tuZXNzLCBjb2xvcikge1xyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIGN0eC5tb3ZlVG8oeDEsIHkxKTtcclxuICAgIGN0eC5saW5lVG8oeDIsIHkyKTtcclxuICAgIGN0eC5saW5lV2lkdGggPSB0aGlja25lc3M7XHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBjb2xvcjtcclxuICAgIGN0eC5zdHJva2UoKTtcclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbn07XHJcblxyXG5EcmF3bGliLnByb3RvdHlwZS5jaXJjbGUgPSBmdW5jdGlvbihjdHgsIHgsIHksIHJhZGl1cywgZmlsbCwgZmlsbENvbG9yLCBvdXRsaW5lLCBvdXRsaW5lQ29sb3IsIG91dGxpbmVXaWR0aCkge1xyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIGN0eC5hcmMoeCx5LCByYWRpdXMsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSk7XHJcbiAgICBjdHguY2xvc2VQYXRoKCk7XHJcbiAgICBpZihmaWxsKSB7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGZpbGxDb2xvcjtcclxuICAgICAgICBjdHguZmlsbCgpO1xyXG4gICAgfVxyXG4gICAgaWYob3V0bGluZSkge1xyXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IG91dGxpbmVDb2xvcjtcclxuICAgICAgICBjdHgubGluZVdpZHRoID0gb3V0bGluZVdpZHRoO1xyXG4gICAgICAgIGN0eC5zdHJva2UoKTtcclxuICAgIH1cclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbn07XHJcblxyXG5EcmF3bGliLnByb3RvdHlwZS50ZXh0VG9MaW5lcyA9IGZ1bmN0aW9uKGN0eCwgdGV4dCwgZm9udCwgd2lkdGgpIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHguZm9udCA9IGZvbnQ7XHJcbiAgICBcclxuICAgIHZhciBsaW5lcyA9IFtdO1xyXG4gICAgXHJcbiAgICB3aGlsZSAodGV4dC5sZW5ndGgpIHtcclxuICAgICAgICB2YXIgaSwgajtcclxuICAgICAgICBmb3IoaSA9IHRleHQubGVuZ3RoOyBjdHgubWVhc3VyZVRleHQodGV4dC5zdWJzdHIoMCwgaSkpLndpZHRoID4gd2lkdGg7IGktLSk7XHJcblxyXG4gICAgICAgIHZhciByZXN1bHQgPSB0ZXh0LnN1YnN0cigwLGkpO1xyXG5cclxuICAgICAgICBpZiAoaSAhPT0gdGV4dC5sZW5ndGgpXHJcbiAgICAgICAgICAgIGZvcih2YXIgaiA9IDA7IHJlc3VsdC5pbmRleE9mKFwiIFwiLCBqKSAhPT0gLTE7IGogPSByZXN1bHQuaW5kZXhPZihcIiBcIiwgaikgKyAxKTtcclxuXHJcbiAgICAgICAgbGluZXMucHVzaChyZXN1bHQuc3Vic3RyKDAsIGogfHwgcmVzdWx0Lmxlbmd0aCkpO1xyXG4gICAgICAgIHdpZHRoID0gTWF0aC5tYXgod2lkdGgsIGN0eC5tZWFzdXJlVGV4dChsaW5lc1tsaW5lcy5sZW5ndGggLSAxXSkud2lkdGgpO1xyXG4gICAgICAgIHRleHQgID0gdGV4dC5zdWJzdHIobGluZXNbbGluZXMubGVuZ3RoIC0gMV0ubGVuZ3RoLCB0ZXh0Lmxlbmd0aCk7XHJcbiAgICB9XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG4gICAgcmV0dXJuIGxpbmVzO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBEcmF3bGliOyIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuLi9jb21tb24vUG9pbnQuanMnKTtcclxuXHJcbmZ1bmN0aW9uIFV0aWxpdGllcygpe1xyXG59XHJcblxyXG4vL0JPQVJEUEhBU0UgLSBzZXQgYSBzdGF0dXMgdmFsdWUgb2YgYSBub2RlIGluIGxvY2FsU3RvcmFnZSBiYXNlZCBvbiBJRFxyXG5VdGlsaXRpZXMucHJvdG90eXBlLnNldFByb2dyZXNzID0gZnVuY3Rpb24ocE9iamVjdCl7XHJcbiAgICB2YXIgcHJvZ3Jlc3NTdHJpbmcgPSBsb2NhbFN0b3JhZ2UucHJvZ3Jlc3M7XHJcbiAgICBcclxuICAgIHZhciB0YXJnZXRPYmplY3QgPSBwT2JqZWN0O1xyXG4gICAgLy9tYWtlIGFjY29tb2RhdGlvbnMgaWYgdGhpcyBpcyBhbiBleHRlbnNpb24gbm9kZVxyXG4gICAgdmFyIGV4dGVuc2lvbmZsYWcgPSB0cnVlO1xyXG4gICAgd2hpbGUoZXh0ZW5zaW9uZmxhZyl7XHJcbiAgICAgICAgaWYodGFyZ2V0T2JqZWN0LnR5cGUgPT09IFwiZXh0ZW5zaW9uXCIpe1xyXG4gICAgICAgICAgICB0YXJnZXRPYmplY3QgPSB0YXJnZXRPYmplY3QuY29ubmVjdGlvbkZvcndhcmRbMF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIGV4dGVuc2lvbmZsYWcgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHZhciBvYmplY3RJRCA9IHRhcmdldE9iamVjdC5kYXRhLl9pZDtcclxuICAgIHZhciBvYmplY3RTdGF0dXMgPSB0YXJnZXRPYmplY3Quc3RhdHVzO1xyXG4gICAgXHJcbiAgICAvL3NlYXJjaCB0aGUgcHJvZ3Jlc3NTdHJpbmcgZm9yIHRoZSBjdXJyZW50IElEXHJcbiAgICB2YXIgaWRJbmRleCA9IHByb2dyZXNzU3RyaW5nLmluZGV4T2Yob2JqZWN0SUQpO1xyXG4gICAgXHJcbiAgICAvL2lmIGl0J3Mgbm90IGFkZCBpdCB0byB0aGUgZW5kXHJcbiAgICBpZihpZEluZGV4ID09PSAtMSl7XHJcbiAgICAgICAgcHJvZ3Jlc3NTdHJpbmcgKz0gb2JqZWN0SUQgKyBcIlwiICsgb2JqZWN0U3RhdHVzICsgXCIsXCI7XHJcbiAgICB9XHJcbiAgICAvL290aGVyd2lzZSBtb2RpZnkgdGhlIHN0YXR1cyB2YWx1ZVxyXG4gICAgZWxzZXtcclxuICAgICAgICBwcm9ncmVzc1N0cmluZyA9IHByb2dyZXNzU3RyaW5nLnN1YnN0cigwLCBvYmplY3RJRC5sZW5ndGggKyBpZEluZGV4KSArIG9iamVjdFN0YXR1cyArIHByb2dyZXNzU3RyaW5nLnN1YnN0cihvYmplY3RJRC5sZW5ndGggKyAxICsgaWRJbmRleCwgcHJvZ3Jlc3NTdHJpbmcubGVuZ3RoKSArIFwiXCI7XHJcbiAgICB9XHJcbiAgICBsb2NhbFN0b3JhZ2UucHJvZ3Jlc3MgPSBwcm9ncmVzc1N0cmluZztcclxufVxyXG5cclxuLy9yZXR1cm5zIG1vdXNlIHBvc2l0aW9uIGluIGxvY2FsIGNvb3JkaW5hdGUgc3lzdGVtIG9mIGVsZW1lbnRcclxuVXRpbGl0aWVzLnByb3RvdHlwZS5nZXRNb3VzZSA9IGZ1bmN0aW9uKGUpe1xyXG4gICAgcmV0dXJuIG5ldyBQb2ludCgoZS5wYWdlWCAtIGUudGFyZ2V0Lm9mZnNldExlZnQpLCAoZS5wYWdlWSAtIGUudGFyZ2V0Lm9mZnNldFRvcCkpO1xyXG59XHJcblxyXG5VdGlsaXRpZXMucHJvdG90eXBlLm1hcCA9IGZ1bmN0aW9uKHZhbHVlLCBtaW4xLCBtYXgxLCBtaW4yLCBtYXgyKXtcclxuICAgIHJldHVybiBtaW4yICsgKG1heDIgLSBtaW4yKSAqICgodmFsdWUgLSBtaW4xKSAvIChtYXgxIC0gbWluMSkpO1xyXG59XHJcblxyXG4vL2xpbWl0cyB0aGUgdXBwZXIgYW5kIGxvd2VyIGxpbWl0cyBvZiB0aGUgcGFyYW1ldGVyIHZhbHVlXHJcblV0aWxpdGllcy5wcm90b3R5cGUuY2xhbXAgPSBmdW5jdGlvbih2YWx1ZSwgbWluLCBtYXgpe1xyXG4gICAgcmV0dXJuIE1hdGgubWF4KG1pbiwgTWF0aC5taW4obWF4LCB2YWx1ZSkpO1xyXG59XHJcblxyXG4vL2NoZWNrcyBtb3VzZSBjb2xsaXNpb24gb24gY2FudmFzXHJcblV0aWxpdGllcy5wcm90b3R5cGUubW91c2VJbnRlcnNlY3QgPSBmdW5jdGlvbihwTW91c2VTdGF0ZSwgcEVsZW1lbnQsIHBPZmZzZXR0ZXIsIHBTY2FsZSl7XHJcbiAgICAvL2lmIHRoZSB4IHBvc2l0aW9uIGNvbGxpZGVzXHJcbiAgICBpZihwRWxlbWVudC5zdGF0dXMgIT09IFwiMFwiKXtcclxuICAgICAgICBpZihwTW91c2VTdGF0ZS5yZWxhdGl2ZVBvc2l0aW9uLnggKyBwT2Zmc2V0dGVyLnggPiAocEVsZW1lbnQucG9zaXRpb24ueCAtIChwRWxlbWVudC53aWR0aCkvMikgJiYgcE1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbi54ICsgcE9mZnNldHRlci54IDwgKHBFbGVtZW50LnBvc2l0aW9uLnggKyAocEVsZW1lbnQud2lkdGgpLzIpKXtcclxuICAgICAgICAgICAgLy9pZiB0aGUgeSBwb3NpdGlvbiBjb2xsaWRlc1xyXG4gICAgICAgICAgICBpZihwTW91c2VTdGF0ZS5yZWxhdGl2ZVBvc2l0aW9uLnkgKyBwT2Zmc2V0dGVyLnkgPiAocEVsZW1lbnQucG9zaXRpb24ueSAtIChwRWxlbWVudC5oZWlnaHQpLzIpICYmIHBNb3VzZVN0YXRlLnJlbGF0aXZlUG9zaXRpb24ueSArIHBPZmZzZXR0ZXIueSA8IChwRWxlbWVudC5wb3NpdGlvbi55ICsgKHBFbGVtZW50LmhlaWdodCkvMikpe1xyXG4gICAgICAgICAgICAgICAgICAgIHBFbGVtZW50Lm1vdXNlT3ZlciA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgIHBFbGVtZW50Lm1vdXNlT3ZlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIHBFbGVtZW50Lm1vdXNlT3ZlciA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBVdGlsaXRpZXM7IiwiXCJ1c2Ugc3RyaWN0XCJcclxuXHJcbnZhciBUdXRvcmlhbFRhZ3MgPSB7XHJcbiAgICBcIkFJXCI6IFwiIzgwNFwiLFxyXG4gICAgXCJBdWRpb1wiOiBcIiMwNDhcIixcclxuICAgIFwiQ29tcHV0ZXIgU2NpZW5jZVwiOiBcIiMxMTFcIixcclxuICAgIFwiQ29yZVwiOiBcIiMzMzNcIixcclxuICAgIFwiR3JhcGhpY3NcIjogXCIjYzBjXCIsXHJcbiAgICBcIklucHV0XCI6IFwiIzg4MFwiLFxyXG4gICAgXCJNYXRoXCI6IFwiIzQ4NFwiLFxyXG4gICAgXCJOZXR3b3JraW5nXCI6IFwiI2M2MFwiLFxyXG4gICAgXCJPcHRpbWl6YXRpb25cIjogXCIjMjgyXCIsXHJcbiAgICBcIlBoeXNpY3NcIjogXCIjMDQ4XCIsXHJcbiAgICBcIlNjcmlwdGluZ1wiOiBcIiMwODhcIixcclxuICAgIFwiU29mdHdhcmVFbmdpbmVlcmluZ1wiOiBcIiM4NDRcIlxyXG59O1xyXG5cclxuXHJcbmZ1bmN0aW9uIERldGFpbHNQYW5lbChncmFwaCkge1xyXG4gICAgdGhpcy5ncmFwaCA9IGdyYXBoO1xyXG4gICAgdGhpcy5ub2RlID0gbnVsbDtcclxuICAgIHRoaXMuZGF0YSA9IG51bGw7XHJcbiAgICB0aGlzLnRyYW5zaXRpb25PbiA9IGZhbHNlO1xyXG4gICAgdGhpcy50cmFuc2l0aW9uVGltZSA9IDA7XHJcbiAgICB0aGlzLmRhdGFEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJpZ2h0QmFyXCIpO1xyXG59O1xyXG5cclxuRGV0YWlsc1BhbmVsLnByb3RvdHlwZS5lbmFibGUgPSBmdW5jdGlvbihub2RlKSB7XHJcbiAgICB0aGlzLm5vZGUgPSBub2RlO1xyXG4gICAgdGhpcy5kYXRhID0gbm9kZS5kYXRhO1xyXG4gICAgdGhpcy50cmFuc2l0aW9uT24gPSB0cnVlXHJcbn07XHJcblxyXG5EZXRhaWxzUGFuZWwucHJvdG90eXBlLmRpc2FibGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZGF0YURpdi5pbm5lckhUTUwgPSBcIlwiO1xyXG4gICAgdGhpcy50cmFuc2l0aW9uT24gPSBmYWxzZTtcclxufTtcclxuXHJcbkRldGFpbHNQYW5lbC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oY2FudmFzU3RhdGUsIHRpbWUsIG5vZGUpIHtcclxuICAgIFxyXG4gICAgLy91cGRhdGUgbm9kZSBpZiBpdHMgbm90IHRoZSBzYW1lIGFueW1vcmVcclxuICAgIGlmKHRoaXMubm9kZSAhPSBub2RlKSB7XHJcbiAgICAgICAgdGhpcy5ub2RlID0gbm9kZTtcclxuICAgICAgICB0aGlzLmRhdGEgPSBub2RlLmRhdGE7XHJcbiAgICAgICAgdGhpcy5kYXRhRGl2LmlubmVySFRNTCA9IHRoaXMuR2VuZXJhdGVET00oKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgXHJcbiAgICAvL3RyYW5zaXRpb24gb25cclxuICAgIGlmKHRoaXMudHJhbnNpdGlvbk9uKSB7XHJcbiAgICAgICAgaWYodGhpcy50cmFuc2l0aW9uVGltZSA8IDEpIHtcclxuICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9uVGltZSArPSB0aW1lLmRlbHRhVGltZSAqIDM7XHJcbiAgICAgICAgICAgIGlmKHRoaXMudHJhbnNpdGlvblRpbWUgPj0gMSkge1xyXG4gICAgICAgICAgICAgICAgLy9kb25lIHRyYW5zaXRpb25pbmdcclxuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvblRpbWUgPSAxO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhRGl2LmlubmVySFRNTCA9IHRoaXMuR2VuZXJhdGVET00oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vdHJhbnNpdGlvbiBvZmZcclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGlmKHRoaXMudHJhbnNpdGlvblRpbWUgPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvblRpbWUgLT0gdGltZS5kZWx0YVRpbWUgKiAzO1xyXG4gICAgICAgICAgICBpZih0aGlzLnRyYW5zaXRpb25UaW1lIDw9IDApIHtcclxuICAgICAgICAgICAgICAgIC8vZG9uZSB0cmFuc2l0aW9uaW5nXHJcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25UaW1lID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMubm9kZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGEgPSBudWxsOyBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbkRldGFpbHNQYW5lbC5wcm90b3R5cGUuR2VuZXJhdGVET00gPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBodG1sID0gXCI8aDE+XCIrdGhpcy5kYXRhLnNlcmllcytcIjo8L2gxPjxoMT48YSBocmVmPVwiICsgdGhpcy5kYXRhLmxpbmsgKyBcIj5cIit0aGlzLmRhdGEudGl0bGUrXCI8L2E+PC9oMT5cIjtcclxuICAgIGh0bWwgKz0gXCI8YSBocmVmPVwiICsgdGhpcy5kYXRhLmxpbmsgKyBcIj48aW1nIHNyYz1odHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vSUdNRS1SSVQvXCIgKyB0aGlzLmRhdGEubmFtZSArXHJcbiAgICAgICAgXCIvbWFzdGVyL2lnbWVfdGh1bWJuYWlsLnBuZyBhbHQ9XCIgKyB0aGlzLmRhdGEubGluayArIFwiPjwvYT5cIjtcclxuICAgIFxyXG4gICAgaHRtbCArPSBcIjx1bCBpZD0ndGFncyc+XCI7XHJcbiAgICBpZih0aGlzLmRhdGEudGFncy5sZW5ndGggIT0gMCkge1xyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGEudGFncy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBodG1sICs9IFwiPGxpIHN0eWxlPSdiYWNrZ3JvdW5kLWNvbG9yOlwiICsgVHV0b3JpYWxUYWdzW3RoaXMuZGF0YS50YWdzW2ldXSArIFwiJz5cIiArIHRoaXMuZGF0YS50YWdzW2ldICsgXCI8L2xpPlwiO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGh0bWwrPSBcIjwvdWw+XCJcclxuICAgIFxyXG4gICAgaHRtbCArPSBcIjxwPlwiICsgdGhpcy5kYXRhLmRlc2NyaXB0aW9uICsgXCI8L3A+XCI7XHJcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuZGF0YSk7XHJcbiAgICBpZih0aGlzLmRhdGEuZXh0cmFfcmVzb3VyY2VzLmxlbmd0aCAhPSAwKSB7XHJcbiAgICAgICAgaHRtbCArPSBcIjxoMj5BZGRpdGlvbmFsIFJlc291cmNlczo8L2gyPlwiO1xyXG4gICAgICAgIGh0bWwgKz0gXCI8dWw+XCI7XHJcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMuZGF0YS5leHRyYV9yZXNvdXJjZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaHRtbCArPSBcIjxsaT48YSBocmVmPVwiICsgdGhpcy5kYXRhLmV4dHJhX3Jlc291cmNlc1tpXS5saW5rICsgXCI+XCIgKyB0aGlzLmRhdGEuZXh0cmFfcmVzb3VyY2VzW2ldLnRpdGxlICsgXCI8L2E+PC9saT5cIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaHRtbCArPSBcIjwvdWw+XCI7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJldHVybiBodG1sO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBEZXRhaWxzUGFuZWw7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBEcmF3TGliID0gcmVxdWlyZSgnLi4vLi4vbGlicmFyaWVzL0RyYXdsaWIuanMnKTtcclxudmFyIFNlYXJjaFBhbmVsID0gcmVxdWlyZSgnLi9TZWFyY2hQYW5lbC5qcycpO1xyXG52YXIgRGV0YWlsc1BhbmVsID0gcmVxdWlyZSgnLi9EZXRhaWxzUGFuZWwuanMnKTtcclxudmFyIFR1dG9yaWFsTm9kZSA9IHJlcXVpcmUoJy4vVHV0b3JpYWxOb2RlLmpzJyk7XHJcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9Qb2ludC5qcycpO1xyXG5cclxuXHJcbnZhciBwYWludGVyO1xyXG52YXIgZXhwYW5kID0gMztcclxudmFyIGRlYnVnTW9kZSA9IGZhbHNlO1xyXG5cclxuZnVuY3Rpb24gR3JhcGgocEpTT05EYXRhKSB7XHJcbiAgICAgICAgXHJcbiAgICB0aGlzLnNlYXJjaFBhbmVsID0gbmV3IFNlYXJjaFBhbmVsKHRoaXMpO1xyXG4gICAgdGhpcy5kZXRhaWxzUGFuZWwgPSBuZXcgRGV0YWlsc1BhbmVsKHRoaXMpO1xyXG4gICAgdGhpcy5zZWFyY2hQYW5lbEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiT3B0aW9uc0J1dHRvblwiKTtcclxuICAgIHRoaXMuc2VhcmNoRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsZWZ0QmFyXCIpO1xyXG4gICAgdGhpcy5kYXRhRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyaWdodEJhclwiKTtcclxuICAgIHRoaXMuY2FudmFzRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtaWRkbGVCYXJcIik7XHJcbiAgICBwYWludGVyID0gbmV3IERyYXdMaWIoKTtcclxuICAgIFxyXG4gICAgdGhpcy5ub2RlcyA9IFtdO1xyXG4gICAgdGhpcy5hY3RpdmVOb2RlcyA9IFtdO1xyXG4gICAgXHJcbiAgICAvL3BvcHVsYXRlIHRoZSBhcnJheVxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHBKU09ORGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBkYXRhID0gcEpTT05EYXRhW2ldO1xyXG4gICAgICAgIC8vZW5zdXJlcyB0aGF0IHRoZSBjaHVuayBjb250YWlucyBhIGxpbmtcclxuICAgICAgICBpZihkYXRhLnRhZ3MubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIGlmKGRlYnVnTW9kZSkgY29uc29sZS5sb2coXCJSZXBvIG5vdCB0YWdnZWQ6IFwiICsgZGF0YS5uYW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZihkYXRhLmltYWdlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgaWYoZGVidWdNb2RlKSBjb25zb2xlLmxvZyhcIlJlcG8geWFtbCBvdXQgb2YgZGF0ZTogXCIgKyBkYXRhLm5hbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIG5vZGUgPSBuZXcgVHV0b3JpYWxOb2RlKGRhdGEpO1xyXG4gICAgICAgICAgICB0aGlzLm5vZGVzLnB1c2gobm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvL3NldCBkaXJlY3Qgb2JqZWN0IGNvbm5lY3Rpb25zIHRvIHJlbGF0ZWQgbm9kZXMgZm9yIHJlZmVyZW5jaW5nXHJcbiAgICAvL3BhcnNlIGVudGlyZSBsaXN0XHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5ub2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIC8vbG9vcCBvdmVyIGxpc3RlZCBjb25uZWN0aW9uc1xyXG4gICAgICAgIGZvcih2YXIgayA9IDA7IGsgPCB0aGlzLm5vZGVzW2ldLmRhdGEuY29ubmVjdGlvbnMubGVuZ3RoOyBrKyspIHtcclxuICAgICAgICAgICAgLy9zZWFyY2ggZm9yIHNpbWlsYXIgbm9kZXNcclxuICAgICAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IHRoaXMubm9kZXMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMubm9kZXNbal0uZGF0YS5zZXJpZXMgPT09IHRoaXMubm9kZXNbaV0uZGF0YS5jb25uZWN0aW9uc1trXS5zZXJpZXMgJiZcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5vZGVzW2pdLmRhdGEudGl0bGUgPT09IHRoaXMubm9kZXNbaV0uZGF0YS5jb25uZWN0aW9uc1trXS50aXRsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubm9kZXNbaV0ucHJldmlvdXNOb2Rlcy5wdXNoKHRoaXMubm9kZXNbal0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubm9kZXNbal0ubmV4dE5vZGVzLnB1c2godGhpcy5ub2Rlc1tpXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRoaXMudHJhbnNpdGlvblRpbWUgPSAwO1xyXG4gICAgdGhpcy5Gb2N1c05vZGUodGhpcy5ub2Rlc1swXSk7XHJcbiAgICBcclxuICAgIFxyXG4gICAgZnVuY3Rpb24geCAoc2VhcmNoKSB7XHJcbiAgICAgICAgaWYoc2VhcmNoLm9wZW4gPT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBzZWFyY2gudHJhbnNpdGlvbk9uID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBzZWFyY2gudHJhbnNpdGlvbk9uID0gdHJ1ZTtcclxuICAgICAgICAgICAgc2VhcmNoLm9wZW4gPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgdGhpcy5zZWFyY2hQYW5lbEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgeC5iaW5kKHRoaXMuc2VhcmNoUGFuZWxCdXR0b24sIHRoaXMuc2VhcmNoUGFuZWwpKTtcclxufTtcclxuXHJcblxyXG5cclxuXHJcbkdyYXBoLnByb3RvdHlwZS5Gb2N1c05vZGUgPSBmdW5jdGlvbihjZW50ZXJOb2RlKSB7XHJcbiAgICB0aGlzLmZvY3VzZWROb2RlID0gY2VudGVyTm9kZTtcclxuICAgIFxyXG4gICAgdmFyIG5ld05vZGVzID0gW107XHJcbiAgICBcclxuICAgIC8vZ2V0IG5vZGVzIHRvIGRlcHRoXHJcbiAgICBcclxuICAgIHZhciBwcmV2aW91c05vZGVzID0gdGhpcy5mb2N1c2VkTm9kZS5nZXRQcmV2aW91cyhleHBhbmQpO1xyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHByZXZpb3VzTm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBuZXdOb2Rlcy5wdXNoKHByZXZpb3VzTm9kZXNbaV0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB2YXIgbmV4dE5vZGVzID0gdGhpcy5mb2N1c2VkTm9kZS5nZXROZXh0KGV4cGFuZCk7XHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgbmV4dE5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgbmV3Tm9kZXMucHVzaChuZXh0Tm9kZXNbaV0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB2YXIgdGVtcCA9IFtdO1xyXG4gICAgXHJcbiAgICAvL3JlbW92ZSByZWR1bmRhbmNpZXNcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBuZXdOb2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBhbHJlYWR5RXhpc3RzID0gZmFsc2U7XHJcbiAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IHRlbXAubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgaWYobmV3Tm9kZXNbaV0gPT0gdGVtcFtqXSkge1xyXG4gICAgICAgICAgICAgICAgYWxyZWFkeUV4aXN0cyA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoIWFscmVhZHlFeGlzdHMpIHtcclxuICAgICAgICAgICAgdGVtcC5wdXNoKG5ld05vZGVzW2ldKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIG5ld05vZGVzID0gdGVtcDtcclxuICAgIFxyXG4gICAgLy9jaGVjayBpZiBhbnkgb2YgdGhlIG5vZGVzIHdlcmUgcHJldmlvdXNseSBvbiBzY3JlZW5cclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmFjdGl2ZU5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVOb2Rlc1tpXS53YXNQcmV2aW91c2x5T25TY3JlZW4gPSBmYWxzZTtcclxuICAgICAgICBmb3IodmFyIGogPSAwOyBqIDwgbmV3Tm9kZXMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgaWYodGhpcy5hY3RpdmVOb2Rlc1tpXSA9PSBuZXdOb2Rlc1tqXSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVOb2Rlc1tpXS53YXNQcmV2aW91c2x5T25TY3JlZW4gPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICB0aGlzLmFjdGl2ZU5vZGVzID0gbmV3Tm9kZXM7XHJcbiAgICBcclxuICAgIC8vY2xlYXIgdGhlaXIgcGFyZW50IGRhdGEgZm9yIG5ldyBub2RlXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5hY3RpdmVOb2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHRoaXMuYWN0aXZlTm9kZXNbaV0udXNlZEluR3JhcGggPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmFjdGl2ZU5vZGVzW2ldLnBhcmVudCA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIFxyXG4gICAgdGhpcy50cmFuc2l0aW9uVGltZSA9IDE7XHJcbiAgICBcclxuICAgIHRoaXMuZm9jdXNlZE5vZGUuc2V0VHJhbnNpdGlvbihleHBhbmQsIG51bGwsIDAsIG5ldyBQb2ludCgwLCAwKSk7XHJcbn07XHJcblxyXG5HcmFwaC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24obW91c2VTdGF0ZSwgY2FudmFzU3RhdGUsIHRpbWUpIHtcclxuICAgIFxyXG4gICAgaWYodGhpcy50cmFuc2l0aW9uVGltZSA+IDApIHtcclxuICAgICAgICB0aGlzLnRyYW5zaXRpb25UaW1lIC09IHRpbWUuZGVsdGFUaW1lO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uVGltZSA9IDA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHZhciBtb3VzZU92ZXJOb2RlID0gbnVsbDtcclxuICAgIFxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMuYWN0aXZlTm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgaXNNYWluID0gKHRoaXMuYWN0aXZlTm9kZXNbaV0gPT0gdGhpcy5mb2N1c2VkTm9kZSk7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVOb2Rlc1tpXS51cGRhdGUobW91c2VTdGF0ZSwgdGltZSwgdGhpcy50cmFuc2l0aW9uVGltZSwgaXNNYWluKTtcclxuICAgICAgICBpZih0aGlzLmFjdGl2ZU5vZGVzW2ldLm1vdXNlT3Zlcikge1xyXG4gICAgICAgICAgICBtb3VzZU92ZXJOb2RlID0gdGhpcy5hY3RpdmVOb2Rlc1tpXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vaWYgY3VzZXIgY2xpY2tzXHJcbiAgICBpZihtb3VzZVN0YXRlLm1vdXNlRG93biAmJiAhbW91c2VTdGF0ZS5sYXN0TW91c2VEb3duKSB7XHJcbiAgICAgICAgLy9mb2N1cyBub2RlIGlmIGNsaWNrZWRcclxuICAgICAgICBpZihtb3VzZU92ZXJOb2RlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuRm9jdXNOb2RlKG1vdXNlT3Zlck5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL3Nob3cgZGV0YWlscyBmb3Igbm9kZSBpZiBidXR0b24gY2xpY2tlZFxyXG4gICAgICAgIGlmKHRoaXMuZm9jdXNlZE5vZGUuZGV0YWlsc0J1dHRvbi5tb3VzZU92ZXIpIHtcclxuICAgICAgICAgICAgaWYodGhpcy5kZXRhaWxzUGFuZWwubm9kZSA9PSBudWxsKSAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXRhaWxzUGFuZWwuZW5hYmxlKHRoaXMuZm9jdXNlZE5vZGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXRhaWxzUGFuZWwuZGlzYWJsZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZih0aGlzLnNlYXJjaFBhbmVsLm9wZW4gPT0gdHJ1ZSkge1xyXG4gICAgICAgIHRoaXMuc2VhcmNoUGFuZWwudXBkYXRlKGNhbnZhc1N0YXRlLCB0aW1lKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgXHJcbiAgICBpZih0aGlzLmRldGFpbHNQYW5lbC5ub2RlICE9IG51bGwpIHtcclxuICAgICAgICB0aGlzLmRldGFpbHNQYW5lbC51cGRhdGUoY2FudmFzU3RhdGUsIHRpbWUsIHRoaXMuZm9jdXNlZE5vZGUpO1xyXG4gICAgICAgIHRoaXMuZm9jdXNlZE5vZGUuZGV0YWlsc0J1dHRvbi50ZXh0ID0gXCJMZXNzXCI7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLmZvY3VzZWROb2RlLmRldGFpbHNCdXR0b24udGV4dCA9IFwiTW9yZVwiO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBcclxuICAgIHZhciB0MSA9ICgxIC0gTWF0aC5jb3ModGhpcy5zZWFyY2hQYW5lbC50cmFuc2l0aW9uVGltZSAqIE1hdGguUEkpKS8yO1xyXG4gICAgdmFyIHQyID0gKDEgLSBNYXRoLmNvcyh0aGlzLmRldGFpbHNQYW5lbC50cmFuc2l0aW9uVGltZSAqIE1hdGguUEkpKS8yO1xyXG4gICAgXHJcbiAgICB0aGlzLnNlYXJjaERpdi5zdHlsZS53aWR0aCA9IDMwICogdDEgKyBcInZ3XCI7XHJcbiAgICB0aGlzLmRhdGFEaXYuc3R5bGUud2lkdGggPSAzMCAqIHQyICsgXCJ2d1wiO1xyXG4gICAgdGhpcy5jYW52YXNEaXYuc3R5bGUud2lkdGggPSAxMDAgLSAzMCAqICh0MSArIHQyKSArIFwidndcIjsgICAgXHJcbiAgICBcclxuICAgIHRoaXMuc2VhcmNoUGFuZWxCdXR0b24uc3R5bGUubGVmdCA9IFwiY2FsYyhcIiArIDMwICogdDEgKyBcInZ3ICsgMTJweClcIjtcclxuICAgIFxyXG4gICAgY2FudmFzU3RhdGUudXBkYXRlKCk7XHJcbn07XHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5HcmFwaC5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNhbnZhc1N0YXRlKSB7XHJcbiAgICBjYW52YXNTdGF0ZS5jdHguc2F2ZSgpO1xyXG4gICAgXHJcbiAgICAvL3RyYW5zbGF0ZSB0byB0aGUgY2VudGVyIG9mIHRoZSBzY3JlZW5cclxuICAgIGNhbnZhc1N0YXRlLmN0eC50cmFuc2xhdGUoY2FudmFzU3RhdGUuY2VudGVyLngsIGNhbnZhc1N0YXRlLmNlbnRlci55KTtcclxuICAgIC8vY29uc29sZS5sb2coY2FudmFzU3RhdGUuY2VudGVyKTtcclxuICAgIC8vY29uc29sZS5sb2coY2FudmFzU3RhdGUpO1xyXG4gICAgLy9kcmF3IG5vZGVzXHJcbiAgICB0aGlzLmZvY3VzZWROb2RlLmRyYXcoY2FudmFzU3RhdGUsIHBhaW50ZXIsIG51bGwsIDAsIGV4cGFuZCk7XHJcbiAgICBcclxuICAgIGNhbnZhc1N0YXRlLmN0eC5yZXN0b3JlKCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdyYXBoOyIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgUGFyc2VyID0gcmVxdWlyZSgnLi4vZ3JhcGhQaGFzZS9QYXJzZXIuanMnKTtcclxudmFyIEdyYXBoID0gcmVxdWlyZSgnLi9HcmFwaC5qcycpO1xyXG5cclxudmFyIGdyYXBoTG9hZGVkO1xyXG5cclxudmFyIG1vdXNlVGFyZ2V0O1xyXG52YXIgZ3JhcGg7XHJcblxyXG5mdW5jdGlvbiBHcmFwaFBoYXNlKHBUYXJnZXRVUkwpe1xyXG4gICAgLy9pbml0aWFsaXplIGJhc2UgdmFsdWVzXHJcbiAgICBncmFwaExvYWRlZCA9IGZhbHNlO1xyXG4gICAgbW91c2VUYXJnZXQgPSAwO1xyXG4gICAgXHJcbiAgICBcclxuICAgIC8vcmVxdWVzdCBncmFwaCBkYXRhIGFuZCB3YWl0IHRvIGJlZ2luIHBhcnNpbmdcclxuICAgIFBhcnNlcihwVGFyZ2V0VVJMLCBmdW5jdGlvbihwSlNPTkVsZW1lbnRzKXtcclxuICAgICAgICBncmFwaCA9IG5ldyBHcmFwaChwSlNPTkVsZW1lbnRzKTtcclxuICAgICAgICBncmFwaExvYWRlZCA9IHRydWU7XHJcbiAgICB9KTtcclxufVxyXG5cclxuR3JhcGhQaGFzZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24obW91c2VTdGF0ZSwgY2FudmFzU3RhdGUsIHRpbWUpIHtcclxuICAgIGlmKGdyYXBoTG9hZGVkKSB7XHJcbiAgICAgICAgZ3JhcGgudXBkYXRlKG1vdXNlU3RhdGUsIGNhbnZhc1N0YXRlLCB0aW1lKTtcclxuICAgIH1cclxufVxyXG5cclxuR3JhcGhQaGFzZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNhbnZhc1N0YXRlKSB7XHJcbiAgICBpZihncmFwaExvYWRlZCkge1xyXG4gICAgICAgIGdyYXBoLmRyYXcoY2FudmFzU3RhdGUpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgLy9pZiB3ZSBoYXZlbnQgbG9hZGVkIHRoZSBkYXRhLCBkaXNwbGF5IGxvYWRpbmcsIGFuZCB3YWl0XHJcbiAgICAgICAgY2FudmFzU3RhdGUuY3R4LnNhdmUoKTtcclxuICAgICAgICBjYW52YXNTdGF0ZS5jdHguZm9udCA9IFwiNDBweCBBcmlhbFwiO1xyXG4gICAgICAgIGNhbnZhc1N0YXRlLmN0eC5maWxsU3R5bGUgPSBcIiNmZmZcIjtcclxuICAgICAgICBjYW52YXNTdGF0ZS5jdHgudGV4dEJhc2VsaW5lID0gXCJtaWRkbGVcIjtcclxuICAgICAgICBjYW52YXNTdGF0ZS5jdHgudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcclxuICAgICAgICBjYW52YXNTdGF0ZS5jdHguZmlsbFRleHQoXCJMb2FkaW5nLi4uXCIsIGNhbnZhc1N0YXRlLmNlbnRlci54LCBjYW52YXNTdGF0ZS5jZW50ZXIueSk7XHJcbiAgICAgICAgY2FudmFzU3RhdGUuY3R4LnJlc3RvcmUoKTtcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR3JhcGhQaGFzZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9Qb2ludC5qcycpO1xyXG52YXIgQnV0dG9uID0gcmVxdWlyZShcIi4uLy4uL2NvbnRhaW5lcnMvQnV0dG9uLmpzXCIpO1xyXG52YXIgVHV0b3JpYWxOb2RlID0gcmVxdWlyZSgnLi9UdXRvcmlhbE5vZGUuanMnKTtcclxuXHJcbnZhciBsYWJlbENvcm5lclNpemUgPSA2O1xyXG5cclxudmFyIHRpdGxlRm9udFNpemUgPSAxMjtcclxudmFyIHRpdGxlRm9udCA9IHRpdGxlRm9udFNpemUrXCJweCBBcmlhbFwiO1xyXG5cclxudmFyIGRlc2NyaXB0b3JGb250U2l6ZSA9IDEyO1xyXG52YXIgZGVzY3JpcHRvckZvbnQgPSBkZXNjcmlwdG9yRm9udFNpemUrXCJweCBBcmlhbFwiO1xyXG5cclxudmFyIGxpbmVCcmVhayA9IDY7XHJcblxyXG4vL2NyZWF0ZSBhIGxhYmVsIHRvIHBhaXIgd2l0aCBhIG5vZGVcclxuZnVuY3Rpb24gTm9kZUxhYmVsKHBUdXRvcmlhbE5vZGUpIHtcclxuICAgIHRoaXMubm9kZSA9IHBUdXRvcmlhbE5vZGU7XHJcbiAgICBcclxuICAgIHRoaXMuc2VyaWVzID0gdGhpcy5ub2RlLmRhdGEuc2VyaWVzO1xyXG4gICAgdGhpcy50aXRsZSA9IHRoaXMubm9kZS5kYXRhLnRpdGxlO1xyXG4gICAgdGhpcy5kZXNjcmlwdGlvbiA9IHRoaXMubm9kZS5kYXRhLmRlc2NyaXB0aW9uO1xyXG4gICAgdGhpcy5kZXNjcmlwdGlvbkxpbmVzID0gbnVsbDtcclxuICAgIFxyXG4gICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBQb2ludChcclxuICAgICAgICB0aGlzLm5vZGUucG9zaXRpb24ueCxcclxuICAgICAgICB0aGlzLm5vZGUucG9zaXRpb24ueSAtIHRoaXMubm9kZS5zaXplIC0gMTApO1xyXG4gICAgXHJcbiAgICB0aGlzLmRpc3BsYXlGdWxsRGF0YSA9IGZhbHNlO1xyXG59O1xyXG5cclxuTm9kZUxhYmVsLnByb3RvdHlwZS5jYWxjdWxhdGVUZXh0Rml0ID0gZnVuY3Rpb24oY3R4LCBwUGFpbnRlcikge1xyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIGN0eC5mb250ID0gdGl0bGVGb250O1xyXG4gICAgdmFyIHNlcmllc1NpemUgPSBjdHgubWVhc3VyZVRleHQodGhpcy5zZXJpZXMpO1xyXG4gICAgdmFyIHRpdGxlU2l6ZSA9IGN0eC5tZWFzdXJlVGV4dCh0aGlzLnRpdGxlKTtcclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcblxyXG4gICAgdGhpcy5zaXplID0gbmV3IFBvaW50KE1hdGgubWF4KHNlcmllc1NpemUud2lkdGgsIHRpdGxlU2l6ZS53aWR0aCksIHRpdGxlRm9udFNpemUgKiAyKTtcclxuICAgIFxyXG4gICAgXHJcblxyXG4gICAgaWYodGhpcy5kaXNwbGF5RnVsbERhdGEpIHtcclxuICAgICAgICB0aGlzLnNpemUueCA9IE1hdGgubWF4KDI0MCwgTWF0aC5tYXgoc2VyaWVzU2l6ZS53aWR0aCwgdGl0bGVTaXplLndpZHRoKSk7XHJcbiAgICAgICAgdGhpcy5kZXNjcmlwdGlvbkxpbmVzID0gcFBhaW50ZXIudGV4dFRvTGluZXMoY3R4LCB0aGlzLmRlc2NyaXB0aW9uLCBkZXNjcmlwdG9yRm9udCwgdGhpcy5zaXplLngpO1xyXG4gICAgICAgIHRoaXMuc2l6ZS55ICs9IGxpbmVCcmVhayArIHRoaXMuZGVzY3JpcHRpb25MaW5lcy5sZW5ndGggKiBkZXNjcmlwdG9yRm9udFNpemU7XHJcbiAgICB9XHJcbn07XHJcblxyXG5cclxuXHJcbk5vZGVMYWJlbC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKHBNb3VzZVN0YXRlLCB0aW1lLCBkaXNwbGF5QnJpZWYpIHtcclxuICAgIFxyXG4gICAgXHJcbiAgICAvL2RpcmVjdGx5IGFib3ZlIG5vZGVcclxuICAgIHRoaXMuZGVzaXJlZFBvc2l0aW9uID0gbmV3IFBvaW50KFxyXG4gICAgICAgIHRoaXMubm9kZS5wb3NpdGlvbi54LFxyXG4gICAgICAgIHRoaXMubm9kZS5wb3NpdGlvbi55IC0gdGhpcy5ub2RlLnNpemUgLSAxMiAtIGxhYmVsQ29ybmVyU2l6ZSk7XHJcbiAgICBcclxuICAgIGlmKHRoaXMuZGVzaXJlZFBvc2l0aW9uLnggIT0gdGhpcy5wb3NpdGlvbi54IHx8IHRoaXMuZGVzaXJlZFBvc2l0aW9uLnkgIT0gdGhpcy5wb3NpdGlvbi55KSB7XHJcbiAgICAgICAgLy9tb3ZlIHRvd2FyZHMgZGVzaXJlZFBvc2l0aW9uXHJcbiAgICAgICAgdmFyIGRpZiA9IG5ldyBQb2ludChcclxuICAgICAgICAgICAgdGhpcy5kZXNpcmVkUG9zaXRpb24ueCAtIHRoaXMucG9zaXRpb24ueCxcclxuICAgICAgICAgICAgdGhpcy5kZXNpcmVkUG9zaXRpb24ueSAtIHRoaXMucG9zaXRpb24ueSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIHNwZWVkU2NhbGFyID0gTWF0aC5zcXJ0KGRpZi54ICogZGlmLnggKyBkaWYueSAqIGRpZi55KSAqIHRpbWUuZGVsdGFUaW1lO1xyXG5cclxuICAgICAgICB2YXIgdmVsb2NpdHkgPSBuZXcgUG9pbnQoZGlmLnggKiBzcGVlZFNjYWxhciwgZGlmLnkgKiBzcGVlZFNjYWxhcik7XHJcbiAgICAgICAgaWYodmVsb2NpdHkueCAqIHZlbG9jaXR5LnggPCBkaWYueCAqIGRpZi54KSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueCArPSB2ZWxvY2l0eS54O1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnkgKz0gdmVsb2NpdHkueTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueCA9IHRoaXMuZGVzaXJlZFBvc2l0aW9uLng7XHJcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueSA9IHRoaXMuZGVzaXJlZFBvc2l0aW9uLnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBcclxuICAgIC8vaWYgdGhpcyBpcyB0aGUgcHJpbWFyeSBub2RlLCBkaXNwbGF5IGRlc2NyaXB0aW9uXHJcbiAgICBpZihkaXNwbGF5QnJpZWYpIHtcclxuICAgICAgICBcclxuICAgICAgICBpZih0aGlzLmRpc3BsYXlGdWxsRGF0YSA9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICB0aGlzLnNpemUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5kaXNwbGF5RnVsbERhdGEgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2UgaWYgKHRoaXMuZGlzcGxheUZ1bGxEYXRhID09IHRydWUpIHtcclxuICAgICAgICB0aGlzLmJ1dHRvbkNsaWNrZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnNpemUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmRpc3BsYXlGdWxsRGF0YSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgXHJcbn1cclxuXHJcbk5vZGVMYWJlbC5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKHBDYW52YXNTdGF0ZSwgcFBhaW50ZXIpIHtcclxuICAgIFxyXG4gICAgaWYoIXRoaXMuc2l6ZSkge1xyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlVGV4dEZpdChwQ2FudmFzU3RhdGUuY3R4LCBwUGFpbnRlcik7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vZHJhdyBsaW5lIGZyb20gbm9kZSB0byBsYWJlbFxyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5zYXZlKCk7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LnN0cm9rZVN0eWxlID0gXCIjZmZmXCI7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LmxpbmVXaWR0aCA9IDI7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgXHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4Lm1vdmVUbyhcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLngsXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi55KTtcclxuICAgIFxyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5saW5lVG8oXHJcbiAgICAgICAgdGhpcy5ub2RlLnBvc2l0aW9uLngsXHJcbiAgICAgICAgdGhpcy5ub2RlLnBvc2l0aW9uLnkgLSB0aGlzLm5vZGUuc2l6ZSk7XHJcbiAgICBcclxuICAgIHBDYW52YXNTdGF0ZS5jdHguY2xvc2VQYXRoKCk7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LnN0cm9rZSgpO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5yZXN0b3JlKCk7XHJcbiAgICBcclxuICAgIC8vZHJhdyBsYWJlbFxyXG4gICAgcFBhaW50ZXIucm91bmRlZFJlY3QoXHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eCxcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnggLSAodGhpcy5zaXplLnggLyAyKSxcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnkgLSB0aGlzLnNpemUueSxcclxuICAgICAgICB0aGlzLnNpemUueCxcclxuICAgICAgICB0aGlzLnNpemUueSxcclxuICAgICAgICBsYWJlbENvcm5lclNpemUsXHJcbiAgICAgICAgdHJ1ZSwgdGhpcy5ub2RlLmNvbG9yLFxyXG4gICAgICAgIHRydWUsIFwiI2ZmZlwiLCAyKTtcclxuICAgIFxyXG4gICAgXHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LnNhdmUoKTtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHguZmlsbFN0eWxlID0gXCIjZmZmXCI7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LmZvbnQgPSB0aXRsZUZvbnQ7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LnRleHRCYXNlbGluZSA9IFwidG9wXCI7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LnRleHRBbGlnbiA9IFwiY2VudGVyXCI7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LmZpbGxUZXh0KFxyXG4gICAgICAgIHRoaXMuc2VyaWVzLFxyXG4gICAgICAgIHRoaXMucG9zaXRpb24ueCxcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnkgLSB0aGlzLnNpemUueSk7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LmZpbGxUZXh0KFxyXG4gICAgICAgIHRoaXMudGl0bGUsXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi54LFxyXG4gICAgICAgIHRoaXMucG9zaXRpb24ueSAtIHRoaXMuc2l6ZS55ICsgdGl0bGVGb250U2l6ZSk7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LnJlc3RvcmUoKTtcclxuICAgIFxyXG4gICAgXHJcbiAgICBpZih0aGlzLmRpc3BsYXlGdWxsRGF0YSkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHguc2F2ZSgpO1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHguZmlsbFN0eWxlID0gXCIjZmZmXCI7XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5mb250ID0gZGVzY3JpcHRvckZvbnQ7XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC50ZXh0QmFzZWxpbmUgPSBcInRvcFwiO1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHgudGV4dEFsaWduID0gXCJsZWZ0XCI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMuZGVzY3JpcHRpb25MaW5lcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LmZpbGxUZXh0KFxyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXNjcmlwdGlvbkxpbmVzW2ldLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi54IC0gdGhpcy5zaXplLnggLyAyLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi55IC0gdGhpcy5zaXplLnkgKyB0aXRsZUZvbnRTaXplICogMiArIGxpbmVCcmVhayArIGkgKiBkZXNjcmlwdG9yRm9udFNpemUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LnJlc3RvcmUoKTtcclxuICAgIH1cclxufTtcclxuXHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgID0gTm9kZUxhYmVsOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuLy9wYXJhbWV0ZXIgaXMgYSBwb2ludCB0aGF0IGRlbm90ZXMgc3RhcnRpbmcgcG9zaXRpb25cclxuZnVuY3Rpb24gUGFyc2VyKHBUYXJnZXRVUkwsIGNhbGxiYWNrKXtcclxuICAgIHZhciBKU09OT2JqZWN0O1xyXG4gICAgdmFyIGxlc3NvbkFycmF5ID0gW107XHJcbiAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKXtcclxuICAgICAgICBKU09OT2JqZWN0ID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KTtcclxuXHJcbiAgICAgICAgLy9wYXNzIGxlc3NvbiBkYXRhIGJhY2tcclxuICAgICAgICBjYWxsYmFjayhKU09OT2JqZWN0KTtcclxuICAgIH1cclxuXHJcbiAgICB4aHIub3BlbignR0VUJywgcFRhcmdldFVSTCwgdHJ1ZSk7XHJcbiAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihcIklmLU1vZGlmaWVkLVNpbmNlXCIsIFwiU2F0LCAxIEphbiAyMDEwIDAwOjAwOjAwIEdNMFRcIik7XHJcbiAgICB4aHIuc2VuZCgpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnNlcjsiLCJcInVzZSBzdHJpY3RcIlxyXG5cclxudmFyIHF1ZXJ5RGF0YSA9IFtdO1xyXG5cclxuZnVuY3Rpb24gdXBkYXRlUXVlcnlEYXRhKCkge1xyXG4gICAgdmFyIGxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIlF1ZXJ5TGlzdERhdGFcIik7XHJcbiAgICBsaXN0LmlubmVySFRNTCA9IFwiXCI7XHJcbiAgICBpZihxdWVyeURhdGEubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBxdWVyeURhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGlzdC5pbm5lckhUTUwgKz0gXCI8bGk+XCIgKyBxdWVyeURhdGFbaV0udHlwZSArIFwiOiBcIiArIHF1ZXJ5RGF0YVtpXS52YWx1ZSArIFwiPC9saT5cIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjbGVhcnF1ZXJ5YnV0dG9uXCIpLnN0eWxlLmRpc3BsYXkgPSBcImlubGluZVwiO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjbGVhcnF1ZXJ5YnV0dG9uXCIpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgIH1cclxufTtcclxuXHJcbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2VhcmNodGV4dGJ1dHRvblwiKS5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcXVlcnkgPSB7XHJcbiAgICAgICAgdHlwZTogXCJUZXh0XCIsXHJcbiAgICAgICAgdmFsdWU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2VhcmNodGV4dGZpZWxkXCIpLnZhbHVlXHJcbiAgICB9O1xyXG4gICAgaWYocXVlcnkudmFsdWUgPT0gXCJcIilcclxuICAgICAgICByZXR1cm47XHJcbiAgICBxdWVyeURhdGEucHVzaChxdWVyeSk7XHJcbiAgICB1cGRhdGVRdWVyeURhdGEoKTtcclxufTtcclxuXHJcblxyXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlYXJjaGxhbmd1YWdlYnV0dG9uXCIpLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBxdWVyeSA9IHtcclxuICAgICAgICB0eXBlOiBcIkxhbmd1YWdlXCIsXHJcbiAgICAgICAgdmFsdWU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2VhcmNobGFuZ3VhZ2VmaWVsZFwiKS52YWx1ZVxyXG4gICAgfTtcclxuICAgIGlmKHF1ZXJ5LnZhbHVlID09IFwiQW55XCIpXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgcXVlcnlEYXRhLnB1c2gocXVlcnkpO1xyXG4gICAgdXBkYXRlUXVlcnlEYXRhKCk7XHJcbn07XHJcblxyXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlYXJjaHRhZ2J1dHRvblwiKS5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcXVlcnkgPSB7XHJcbiAgICAgICAgdHlwZTogXCJUYWdcIixcclxuICAgICAgICB2YWx1ZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZWFyY2h0YWdmaWVsZFwiKS52YWx1ZVxyXG4gICAgfTtcclxuICAgIGlmKHF1ZXJ5LnZhbHVlID09IFwiQW55XCIpXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgcXVlcnlEYXRhLnB1c2gocXVlcnkpO1xyXG4gICAgdXBkYXRlUXVlcnlEYXRhKCk7XHJcbn07XHJcblxyXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNsZWFycXVlcnlidXR0b25cIikub25jbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcXVlcnlEYXRhID0gW107XHJcbiAgICB1cGRhdGVRdWVyeURhdGEoKTtcclxufTtcclxuXHJcbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2VhcmNoYnV0dG9uXCIpLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcclxuICAgIFxyXG59O1xyXG5cclxuXHJcbmZ1bmN0aW9uIFNlYXJjaFBhbmVsKGdyYXBoKSB7XHJcbiAgICB0aGlzLmdyYXBoID0gZ3JhcGg7XHJcbiAgICB0aGlzLm9wZW4gPSBmYWxzZTtcclxuICAgIHRoaXMudHJhbnNpdGlvbk9uID0gZmFsc2U7XHJcbiAgICB0aGlzLnRyYW5zaXRpb25UaW1lID0gMDtcclxuICAgIHRoaXMub3B0aW9uc0RpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGVmdEJhclwiKTtcclxuICAgIFxyXG4gICAgdGhpcy5zZWFyY2hCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlYXJjaGJ1dHRvblwiKTtcclxuICAgIFxyXG4gICAgXHJcbiAgICB0aGlzLnNlYXJjaEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24gKHRoYXQpIHtcclxuICAgICAgICAvL3BhcnNlIGRhdGEgdG8gZmluZCBtYXRjaGluZyByZXN1bHRzXHJcbiAgICAgICAgdmFyIHNlYXJjaFJlc3VsdHMgPSB0aGF0LnNlYXJjaChxdWVyeURhdGEsIHRoYXQuZ3JhcGgubm9kZXMpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vZGlzcGxheSByZXN1bHRzXHJcbiAgICAgICAgdmFyIGRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2VhcmNocmVzdWx0c1wiKTtcclxuICAgICAgICBpZihzZWFyY2hSZXN1bHRzLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgIGRpdi5pbm5lckhUTUwgPSBcIk5vIE1hdGNoaW5nIFJlc3VsdHMgRm91bmQuXCI7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgZGl2LmlubmVySFRNTCA9IFwiXCI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHNlYXJjaFJlc3VsdHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgLy9jcmVhdGUgbGlzdCB0YWdcclxuICAgICAgICAgICAgdmFyIGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpO1xyXG4gICAgICAgICAgICAvL3NldCB0aXRsZSBhcyB0ZXh0XHJcbiAgICAgICAgICAgIGxpLmlubmVySFRNTCA9IHNlYXJjaFJlc3VsdHNbaV0uZGF0YS50aXRsZTtcclxuICAgICAgICAgICAgLy9hZGQgZXZlbnQgdG8gZm9jdXMgdGhlIG5vZGUgaWYgaXRzIGNsaWNrZWRcclxuICAgICAgICAgICAgbGkuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKHRoYXQsIG5vZGUpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuZ3JhcGguRm9jdXNOb2RlKG5vZGUpO1xyXG4gICAgICAgICAgICB9LmJpbmQobGksIHRoYXQsIHNlYXJjaFJlc3VsdHNbaV0pKTtcclxuICAgICAgICAgICAgLy9hZGQgdGhlIHRhZyB0byB0aGUgcGFnZVxyXG4gICAgICAgICAgICBkaXYuYXBwZW5kQ2hpbGQobGkpO1xyXG4gICAgICAgIH1cclxuICAgIH0uYmluZCh0aGlzLnNlYXJjaEJ1dHRvbiwgdGhpcykpO1xyXG59O1xyXG5cclxuXHJcblxyXG5cclxuU2VhcmNoUGFuZWwucHJvdG90eXBlLnNlYXJjaCA9IGZ1bmN0aW9uKHF1ZXJ5LCBub2Rlcykge1xyXG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcclxuICAgIFxyXG4gICAgXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgbm9kZSA9IG5vZGVzW2ldLmRhdGE7XHJcbiAgICAgICAgdmFyIG1hdGNoID0gdHJ1ZTtcclxuICAgICAgICBmb3IodmFyIGogPSAwOyBqIDwgcXVlcnkubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgaWYocXVlcnlbal0udHlwZSA9PT0gXCJUZXh0XCIpIHtcclxuICAgICAgICAgICAgICAgIGlmKG5vZGUudGl0bGUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHF1ZXJ5W2pdLnZhbHVlLnRvTG93ZXJDYXNlKCkpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKG5vZGUuc2VyaWVzLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihxdWVyeVtqXS52YWx1ZS50b0xvd2VyQ2FzZSgpKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYobm9kZS5kZXNjcmlwdGlvbi50b0xvd2VyQ2FzZSgpLmluZGV4T2YocXVlcnlbal0udmFsdWUudG9Mb3dlckNhc2UoKSkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZihxdWVyeVtqXS50eXBlID09PSBcIkxhbmd1YWdlXCIpIHtcclxuICAgICAgICAgICAgICAgIGlmKG5vZGUubGFuZ3VhZ2UgIT09IHF1ZXJ5W2pdLnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2ggPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHZhciB0YWdNYXRjaCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgZm9yKHZhciBrID0gMDsgayA8IG5vZGUudGFncy5sZW5ndGg7IGsrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKG5vZGUudGFnc1trXSA9PSBxdWVyeVtqXS52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWdNYXRjaCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYodGFnTWF0Y2ggPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXRjaCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vaWYgd2UgcGFzc2VkIGFsbCB0aGF0IGNyYXAsIHdlIGhhdmUgYSBtYXRjaCFcclxuICAgICAgICBpZihtYXRjaCA9PT0gdHJ1ZSkgeyBcclxuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKG5vZGVzW2ldKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJldHVybiByZXN1bHRzO1xyXG59O1xyXG5cclxuXHJcblNlYXJjaFBhbmVsLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihjYW52YXNTdGF0ZSwgdGltZSkge1xyXG4gICAgXHJcbiAgICAvL3RyYW5zaXRpb24gb25cclxuICAgIGlmKHRoaXMudHJhbnNpdGlvbk9uKSB7XHJcbiAgICAgICAgaWYodGhpcy50cmFuc2l0aW9uVGltZSA8IDEpIHtcclxuICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9uVGltZSArPSB0aW1lLmRlbHRhVGltZSAqIDM7XHJcbiAgICAgICAgICAgIGlmKHRoaXMudHJhbnNpdGlvblRpbWUgPj0gMSkge1xyXG4gICAgICAgICAgICAgICAgLy9kb25lIHRyYW5zaXRpb25pbmdcclxuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvblRpbWUgPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy90cmFuc2l0aW9uIG9mZlxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgaWYodGhpcy50cmFuc2l0aW9uVGltZSA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9uVGltZSAtPSB0aW1lLmRlbHRhVGltZSAqIDM7XHJcbiAgICAgICAgICAgIGlmKHRoaXMudHJhbnNpdGlvblRpbWUgPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgLy9kb25lIHRyYW5zaXRpb25pbmdcclxuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvblRpbWUgPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2VhcmNoUGFuZWw7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vUG9pbnQuanMnKTtcclxudmFyIE5vZGVMYWJlbCA9IHJlcXVpcmUoJy4vTm9kZUxhYmVsLmpzJyk7XHJcbnZhciBCdXR0b24gPSByZXF1aXJlKCcuLi8uLi9jb250YWluZXJzL0J1dHRvbi5qcycpO1xyXG5cclxudmFyIGhvcml6b250YWxTcGFjaW5nID0gMTgwO1xyXG5cclxudmFyIFR1dG9yaWFsU3RhdGUgPSB7XHJcbiAgICBMb2NrZWQ6IDAsXHJcbiAgICBVbmxvY2tlZDogMSxcclxuICAgIENvbXBsZXRlZDogMlxyXG59O1xyXG5cclxudmFyIFR1dG9yaWFsVGFncyA9IHtcclxuICAgIFwiQUlcIjogXCIjODA0XCIsXHJcbiAgICBcIkF1ZGlvXCI6IFwiIzA0OFwiLFxyXG4gICAgXCJDb21wdXRlciBTY2llbmNlXCI6IFwiIzExMVwiLFxyXG4gICAgXCJDb3JlXCI6IFwiIzMzM1wiLFxyXG4gICAgXCJHcmFwaGljc1wiOiBcIiNjMGNcIixcclxuICAgIFwiSW5wdXRcIjogXCIjODgwXCIsXHJcbiAgICBcIk1hdGhcIjogXCIjNDg0XCIsXHJcbiAgICBcIk5ldHdvcmtpbmdcIjogXCIjYzYwXCIsXHJcbiAgICBcIk9wdGltaXphdGlvblwiOiBcIiMyODJcIixcclxuICAgIFwiUGh5c2ljc1wiOiBcIiMwNDhcIixcclxuICAgIFwiU2NyaXB0aW5nXCI6IFwiIzA4OFwiLFxyXG4gICAgXCJTb2Z0d2FyZUVuZ2luZWVyaW5nXCI6IFwiIzg0NFwiXHJcbn07XHJcblxyXG5cclxuLy9tYWtlIGEgbm9kZSB3aXRoIHNvbWUgZGF0YVxyXG5mdW5jdGlvbiBUdXRvcmlhbE5vZGUoSlNPTkNodW5rKSB7XHJcbiAgICB0aGlzLmRhdGEgPSBKU09OQ2h1bms7XHJcbiAgICB0aGlzLnByaW1hcnlUYWcgPSB0aGlzLmRhdGEudGFnc1swXTtcclxuICAgIHRoaXMuY29sb3IgPSBUdXRvcmlhbFRhZ3NbdGhpcy5wcmltYXJ5VGFnXTtcclxuICAgIFxyXG4gICAgdGhpcy5zdGF0ZSA9IFR1dG9yaWFsU3RhdGUuTG9ja2VkO1xyXG4gICAgdGhpcy5tb3VzZU92ZXIgPSBmYWxzZTtcclxuICAgIFxyXG4gICAgXHJcbiAgICB0aGlzLnBvc2l0aW9uID0gbmV3IFBvaW50KDAsIDApO1xyXG4gICAgdGhpcy5wcmV2aW91c1Bvc2l0aW9uID0gbmV3IFBvaW50KDAsIDApO1xyXG4gICAgdGhpcy5uZXh0UG9zaXRpb24gPSBuZXcgUG9pbnQoMCwgMCk7XHJcbiAgICBcclxuICAgIHRoaXMuc2l6ZSA9IDI0O1xyXG4gICAgdGhpcy5sYWJlbCA9IG5ldyBOb2RlTGFiZWwodGhpcyk7XHJcbiAgICAgICAgXHJcbiAgICB0aGlzLm5leHROb2RlcyA9IFtdO1xyXG4gICAgdGhpcy5wcmV2aW91c05vZGVzID0gW107XHJcbiAgICBcclxuICAgIHRoaXMuZGV0YWlsc0J1dHRvbiA9IG5ldyBCdXR0b24obmV3IFBvaW50KDAsIDApLCBuZXcgUG9pbnQoNzIsIDM2KSwgXCJNb3JlXCIsIHRoaXMuY29sb3IpO1xyXG4gICAgXHJcbn07XHJcblxyXG4vL3JlY3Vyc2l2ZSBmdW5jdGlvbiB0byBnZXQgcHJldmlvdXMgbm9kZXNcclxuVHV0b3JpYWxOb2RlLnByb3RvdHlwZS5nZXRQcmV2aW91cyA9IGZ1bmN0aW9uKGRlcHRoKSB7XHJcbiAgICB2YXIgcmVzdWx0ID0gW107XHJcbiAgICByZXN1bHQucHVzaCh0aGlzKTtcclxuICAgIGlmKGRlcHRoID4gMCkge1xyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLnByZXZpb3VzTm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIHByZXZpb3VzID0gdGhpcy5wcmV2aW91c05vZGVzW2ldLmdldFByZXZpb3VzKGRlcHRoLTEpO1xyXG4gICAgICAgICAgICBmb3IodmFyIGogPSAwOyBqIDwgcHJldmlvdXMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHByZXZpb3VzW2pdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn07XHJcblxyXG5cclxuXHJcbi8vcmVjdXJzaXZlIGZ1bmN0aW9uIHRvIGdldCBuZXh0IG5vZGVzXHJcblR1dG9yaWFsTm9kZS5wcm90b3R5cGUuZ2V0TmV4dCA9IGZ1bmN0aW9uKGRlcHRoKSB7XHJcbiAgICB2YXIgcmVzdWx0ID0gW107XHJcbiAgICByZXN1bHQucHVzaCh0aGlzKTtcclxuICAgIGlmKGRlcHRoID4gMCkge1xyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLm5leHROb2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgcHJldmlvdXMgPSB0aGlzLm5leHROb2Rlc1tpXS5nZXROZXh0KGRlcHRoLTEpO1xyXG4gICAgICAgICAgICBmb3IodmFyIGogPSAwOyBqIDwgcHJldmlvdXMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHByZXZpb3VzW2pdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn07XHJcblxyXG4vL2RpcmVjdGlvbiBpcyB0aGUgc2lkZSBvZiB0aGUgcGFyZW50IHRoaXMgbm9kZSBleGlzdHMgb25cclxuLy9sYXllciBkZXB0aCBpcyBob3cgbWFueSBsYXllcnMgdG8gcmVuZGVyIG91dFxyXG5UdXRvcmlhbE5vZGUucHJvdG90eXBlLnJlY3Vyc2l2ZVVwZGF0ZSA9IGZ1bmN0aW9uKGRpcmVjdGlvbiwgZGVwdGgpIHtcclxuICAgIGlmKGRlcHRoID4gMCkge1xyXG4gICAgICAgIGlmKGRpcmVjdGlvbiA8IDEpIHtcclxuICAgICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMucHJldmlvdXNOb2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcmV2aW91c05vZGVzW2ldLnJlY3Vyc2l2ZVVwZGF0ZSgtMSwgZGVwdGggLSAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZihkaXJlY3Rpb24gPiAtMSkge1xyXG4gICAgICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5uZXh0Tm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubmV4dE5vZGVzW2ldLnJlY3Vyc2l2ZVVwZGF0ZSgxLCBkZXB0aCAtIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLy91cGRhdGVzIGEgbm9kZVxyXG4vL3RyYW5zaXRpb24gdGltZSBpcyAxLTAsIHdpdGggMCBiZWluZyB0aGUgZmluYWwgbG9jYXRpb25cclxuVHV0b3JpYWxOb2RlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihtb3VzZVN0YXRlLCB0aW1lLCB0cmFuc2l0aW9uVGltZSwgaXNGb2N1c2VkKSB7XHJcbiAgICBcclxuICAgIC8vbW92ZSB0aGUgbm9kZVxyXG4gICAgaWYodGhpcy5wb3NpdGlvbiAhPSB0aGlzLm5leHRQb3NpdGlvbikge1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24ueCA9ICh0aGlzLnByZXZpb3VzUG9zaXRpb24ueCAqIHRyYW5zaXRpb25UaW1lKSArICh0aGlzLm5leHRQb3NpdGlvbi54ICogKDEgLSB0cmFuc2l0aW9uVGltZSkpO1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24ueSA9ICh0aGlzLnByZXZpb3VzUG9zaXRpb24ueSAqIHRyYW5zaXRpb25UaW1lKSArICh0aGlzLm5leHRQb3NpdGlvbi55ICogKDEgLSB0cmFuc2l0aW9uVGltZSkpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZihpc0ZvY3VzZWQpIHtcclxuICAgICAgICB0aGlzLnNpemUgPSAzNjtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIC8vdGVzdCBpZiBtb3VzZSBpcyBpbnNpZGUgY2lyY2xlXHJcbiAgICAgICAgdmFyIGR4ID0gbW91c2VTdGF0ZS5yZWxhdGl2ZVBvc2l0aW9uLnggLSB0aGlzLnBvc2l0aW9uLng7XHJcbiAgICAgICAgdmFyIGR5ID0gbW91c2VTdGF0ZS5yZWxhdGl2ZVBvc2l0aW9uLnkgLSB0aGlzLnBvc2l0aW9uLnk7XHJcbiAgICAgICAgaWYoKGR4ICogZHgpICsgKGR5ICogZHkpIDwgdGhpcy5zaXplICogdGhpcy5zaXplKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2l6ZSA9IDMwO1xyXG4gICAgICAgICAgICB0aGlzLm1vdXNlT3ZlciA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNpemUgPSAyNDtcclxuICAgICAgICAgICAgdGhpcy5tb3VzZU92ZXIgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIFxyXG4gICAgXHJcbiAgICB0aGlzLmxhYmVsLnVwZGF0ZShtb3VzZVN0YXRlLCB0aW1lLCBpc0ZvY3VzZWQpO1xyXG4gICAgXHJcbiAgICBpZihpc0ZvY3VzZWQpIHtcclxuICAgICAgICB0aGlzLmRldGFpbHNCdXR0b24ucG9zaXRpb24ueCA9IHRoaXMucG9zaXRpb24ueCAtIHRoaXMuZGV0YWlsc0J1dHRvbi5zaXplLnggLyAyIC0gMztcclxuICAgICAgICB0aGlzLmRldGFpbHNCdXR0b24ucG9zaXRpb24ueSA9IHRoaXMucG9zaXRpb24ueSArIHRoaXMuc2l6ZSArIDEyO1xyXG4gICAgICAgIHRoaXMuZGV0YWlsc0J1dHRvbi51cGRhdGUobW91c2VTdGF0ZSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5cclxuVHV0b3JpYWxOb2RlLnByb3RvdHlwZS5zZXRUcmFuc2l0aW9uID0gZnVuY3Rpb24obGF5ZXJEZXB0aCwgcGFyZW50LCBkaXJlY3Rpb24sIHRhcmdldFBvc2l0aW9uKSB7XHJcbiAgICBcclxuICAgIC8vZG9udCBtZXNzIHdpdGggbm9kZSBwb3NpdGlvbiBpZiBpdCBhbHJlYWR5IGV4aXN0cyBpbiB0aGUgZ3JhcGhcclxuICAgIGlmKHRoaXMudXNlZEluR3JhcGgpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRoaXMudXNlZEluR3JhcGggPSB0cnVlO1xyXG4gICAgXHJcbiAgICBcclxuICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xyXG4gICAgdGhpcy5wcmV2aW91c1Bvc2l0aW9uID0gdGhpcy5wb3NpdGlvbjtcclxuICAgIHRoaXMubmV4dFBvc2l0aW9uID0gdGFyZ2V0UG9zaXRpb247XHJcbiAgICBcclxuICAgIC8vZmlndXJlIG91dCBzaXplIG9mIGNoaWxkcmVuIHRvIHNwYWNlIHRoZW0gb3V0IGFwcHJvcHJpYXRlbHlcclxuICAgIGlmKGxheWVyRGVwdGggPiAwKSB7XHJcbiAgICAgICAgdmFyIHhQb3NpdGlvbjtcclxuICAgICAgICB2YXIgeVBvc2l0aW9uO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vbGVmdCBvciBtaWRkbGVcclxuICAgICAgICBpZihkaXJlY3Rpb24gPCAxKSB7XHJcbiAgICAgICAgICAgIHZhciB0b3RhbExlZnRIZWlnaHQgPSB0aGlzLmdldFByZXZpb3VzSGVpZ2h0KGxheWVyRGVwdGgpO1xyXG4gICAgICAgICAgICB4UG9zaXRpb24gPSB0YXJnZXRQb3NpdGlvbi54IC0gaG9yaXpvbnRhbFNwYWNpbmc7XHJcbiAgICAgICAgICAgIGlmKGRpcmVjdGlvbiA9PSAwKSB4UG9zaXRpb24gLT0gNjA7XHJcbiAgICAgICAgICAgIHlQb3NpdGlvbiA9IHRhcmdldFBvc2l0aW9uLnkgLSAodG90YWxMZWZ0SGVpZ2h0IC8gMik7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5wcmV2aW91c05vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcGxhY2VtZW50ID0gbmV3IFBvaW50KHhQb3NpdGlvbiwgeVBvc2l0aW9uICsgdGhpcy5wcmV2aW91c05vZGVzW2ldLmN1cnJlbnRIZWlnaHQgLyAyKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJldmlvdXNOb2Rlc1tpXS5zZXRUcmFuc2l0aW9uKGxheWVyRGVwdGggLSAxLCB0aGlzLCAtMSwgcGxhY2VtZW50KTtcclxuICAgICAgICAgICAgICAgIC8qaWYoIXRoaXMud2FzUHJldmlvdXNseU9uU2NyZWVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcmV2aW91c05vZGVzW2ldLnBvc2l0aW9uID0gbmV3IFBvaW50KC0xMDAwLCBwbGFjZW1lbnQueSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcmV2aW91c05vZGVzW2ldLnByZXZpb3VzUG9zaXRpb24gPSBuZXcgUG9pbnQoLTEwMDAsIHBsYWNlbWVudC55KTtcclxuICAgICAgICAgICAgICAgIH0qL1xyXG4gICAgICAgICAgICAgICAgeVBvc2l0aW9uICs9IHRoaXMucHJldmlvdXNOb2Rlc1tpXS5jdXJyZW50SGVpZ2h0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vcmlnaHQgb3IgbWlkZGxlXHJcbiAgICAgICAgaWYoZGlyZWN0aW9uID4gLTEpIHtcclxuICAgICAgICAgICAgdmFyIHRvdGFsUmlnaHRIZWlnaHQgPSB0aGlzLmdldE5leHRIZWlnaHQobGF5ZXJEZXB0aCk7XHJcbiAgICAgICAgICAgIHhQb3NpdGlvbiA9IHRhcmdldFBvc2l0aW9uLnggKyBob3Jpem9udGFsU3BhY2luZztcclxuICAgICAgICAgICAgaWYoZGlyZWN0aW9uID09IDApIHhQb3NpdGlvbiArPSA2MDtcclxuICAgICAgICAgICAgeVBvc2l0aW9uID0gdGFyZ2V0UG9zaXRpb24ueSAtICh0b3RhbFJpZ2h0SGVpZ2h0IC8gMik7XHJcblxyXG4gICAgICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5uZXh0Tm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBwbGFjZW1lbnQgPSBuZXcgUG9pbnQoeFBvc2l0aW9uLCB5UG9zaXRpb24gKyB0aGlzLm5leHROb2Rlc1tpXS5jdXJyZW50SGVpZ2h0IC8gMik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5leHROb2Rlc1tpXS5zZXRUcmFuc2l0aW9uKGxheWVyRGVwdGggLSAxLCB0aGlzLCAxLCBwbGFjZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgLyppZighdGhpcy53YXNQcmV2aW91c2x5T25TY3JlZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5leHROb2Rlc1tpXS5wb3NpdGlvbiA9IG5ldyBQb2ludCgxMDAwLCBwbGFjZW1lbnQueSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXh0Tm9kZXNbaV0ucHJldmlvdXNQb3NpdGlvbiA9IG5ldyBQb2ludCgxMDAwLCBwbGFjZW1lbnQueSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJ0aHJvdyB0aGUgc3dpdGNoIVwiKTtcclxuICAgICAgICAgICAgICAgIH0qL1xyXG4gICAgICAgICAgICAgICAgeVBvc2l0aW9uICs9IHRoaXMubmV4dE5vZGVzW2ldLmN1cnJlbnRIZWlnaHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5UdXRvcmlhbE5vZGUucHJvdG90eXBlLmdldFByZXZpb3VzSGVpZ2h0ID0gZnVuY3Rpb24obGF5ZXJEZXB0aCkge1xyXG4gICAgdGhpcy5jdXJyZW50SGVpZ2h0ID0gMDtcclxuICAgIGlmKGxheWVyRGVwdGggPiAwICYmIHRoaXMucHJldmlvdXNOb2Rlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMucHJldmlvdXNOb2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRIZWlnaHQgKz0gdGhpcy5wcmV2aW91c05vZGVzW2ldLmdldFByZXZpb3VzSGVpZ2h0KGxheWVyRGVwdGggLSAxKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRIZWlnaHQgPSAyNCAqIDU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJldHVybiB0aGlzLmN1cnJlbnRIZWlnaHQ7XHJcbn07XHJcblxyXG5UdXRvcmlhbE5vZGUucHJvdG90eXBlLmdldE5leHRIZWlnaHQgPSBmdW5jdGlvbihsYXllckRlcHRoKSB7XHJcbiAgICB0aGlzLmN1cnJlbnRIZWlnaHQgPSAwO1xyXG4gICAgaWYobGF5ZXJEZXB0aCA+IDAgJiYgdGhpcy5uZXh0Tm9kZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLm5leHROb2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRIZWlnaHQgKz0gdGhpcy5uZXh0Tm9kZXNbaV0uZ2V0TmV4dEhlaWdodChsYXllckRlcHRoIC0gMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50SGVpZ2h0ID0gdGhpcy5zaXplICogNTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcmV0dXJuIHRoaXMuY3VycmVudEhlaWdodDtcclxufTtcclxuXHJcblxyXG5UdXRvcmlhbE5vZGUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihwQ2FudmFzU3RhdGUsIHBQYWludGVyLCBwYXJlbnRDYWxsZXIsIGRpcmVjdGlvbiwgbGF5ZXJEZXB0aCkge1xyXG4gICAgLy9kcmF3IGxpbmUgdG8gcGFyZW50IGlmIHBvc3NpYmxlXHJcbiAgICBpZihwYXJlbnRDYWxsZXIgJiYgcGFyZW50Q2FsbGVyID09IHRoaXMucGFyZW50KSB7XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5zYXZlKCk7XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5saW5lV2lkdGggPSAyO1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHguc3Ryb2tlU3R5bGUgPSBcIiNmZmZcIjtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vdmFyIGJldHdlZW4gPSBuZXcgUG9pbnQodGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnkpO1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHgubW92ZVRvKHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55KTtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LmxpbmVUbyhwYXJlbnRDYWxsZXIucG9zaXRpb24ueCwgcGFyZW50Q2FsbGVyLnBvc2l0aW9uLnkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHguY2xvc2VQYXRoKCk7XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5zdHJva2UoKTtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LnJlc3RvcmUoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy9kcmF3IGNoaWxkIG5vZGVzXHJcbiAgICBpZihsYXllckRlcHRoID4gMCl7XHJcbiAgICAgICAgaWYoZGlyZWN0aW9uIDwgMSkge1xyXG4gICAgICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5wcmV2aW91c05vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByZXZpb3VzTm9kZXNbaV0uZHJhdyhwQ2FudmFzU3RhdGUsIHBQYWludGVyLCB0aGlzLCAtMSwgbGF5ZXJEZXB0aCAtIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKGRpcmVjdGlvbiA+IC0xKSB7XHJcbiAgICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLm5leHROb2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uZXh0Tm9kZXNbaV0uZHJhdyhwQ2FudmFzU3RhdGUsIHBQYWludGVyLCB0aGlzLCAxLCBsYXllckRlcHRoIC0gMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vZHJhdyBjaXJjbGVcclxuICAgIHBQYWludGVyLmNpcmNsZShwQ2FudmFzU3RhdGUuY3R4LCB0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSwgdGhpcy5zaXplLCB0cnVlLCB0aGlzLmNvbG9yLCB0cnVlLCBcIiNmZmZcIiwgMik7XHJcbiAgICBcclxuICAgIHRoaXMubGFiZWwuZHJhdyhwQ2FudmFzU3RhdGUsIHBQYWludGVyKTtcclxuICAgIGlmKGRpcmVjdGlvbiA9PSAwKSB7XHJcbiAgICAgICAgdGhpcy5kZXRhaWxzQnV0dG9uLmRyYXcocENhbnZhc1N0YXRlLCBwUGFpbnRlcik7XHJcbiAgICB9XHJcbn07XHJcblxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVHV0b3JpYWxOb2RlOyJdfQ==
