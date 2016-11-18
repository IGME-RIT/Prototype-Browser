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
    pCanvasState.ctx.font = "14px Arial";
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


var expand = 2; // how many values to expand to
var debugMode = false;


var TutorialState = {
    Locked: 0,
    Unlocked: 1,
    Completed: 2
};


function Graph(pJSONData) {
    
    this.searchPanel = new SearchPanel(this);
    this.detailsPanel = new DetailsPanel(this);
    this.searchPanelButton = document.getElementById("OptionsButton");
    this.searchDiv = document.getElementById("leftBar");
    this.dataDiv = document.getElementById("rightBar");
    this.canvasDiv = document.getElementById("middleBar");
    
    // load lock image for locked nodes and completed nodes
    this.lockImage = new Image();
    this.lockImage.src = "content/ui/Lock.png";
    this.checkImage = new Image();
    this.checkImage.src = "content/ui/Check.png";
    
    //create painter object to help draw stuff
    this.painter = new DrawLib();
    
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
    
    // loop through nodes and connect them together.
    this.nodes.forEach((node)=>{
        node.data.connections.forEach((connection)=>{
            this.nodes.forEach((otherNode)=>{
                if(otherNode.data.series === connection.series && otherNode.data.title === connection.title) {
                    node.previousNodes.push(otherNode);
                    otherNode.nextNodes.push(node);
                }
            });
        });
    });
    
    
    this.transitionTime = 0;
    this.FocusNode(this.nodes[0]);
    
    
    function x (search) {
        if(search.open == true) {
            search.transitionOn = false;
        }
        else {
            search.transitionOn = true;
            search.open = true;
            document.getElementById("searchtextfield").select();
        }
    }
    
    this.searchPanelButton.addEventListener("click", x.bind(this.searchPanelButton, this.searchPanel));
};




Graph.prototype.FocusNode = function(centerNode) {
    this.focusedNode = centerNode;
    
    var newNodes = [];
    
    //get nodes to depth in both directions, and add them to the new nodes array
    var previousNodes = this.focusedNode.getPrevious(expand);
    newNodes = newNodes.concat(previousNodes);
    
    var nextNodes = this.focusedNode.getNext(expand);
    newNodes = newNodes.concat(nextNodes);
    
    
    //find redundancies from the newNodes, and make a new array without those redundancies.
    var temp = [];
    newNodes.forEach((nodeToCheck)=> {
        if(temp.every((alreadyAddedNode)=>{
            return nodeToCheck != alreadyAddedNode;
        })) {
            temp.push(nodeToCheck);
        }
    });
    newNodes = temp;
    
    
    
    // check if any of the nodes were previously on screen
    // (this is used to determine where they should appear during the transition animation)
    this.activeNodes.forEach((node)=>{
        node.wasPreviouslyOnScreen = newNodes.some((newNode)=>{
            return node == newNode;
        });
    });
    
    this.activeNodes = newNodes;
    
    //clear their parent data for new node
    this.activeNodes.forEach((node)=>{
        node.currentLayerDepth = 0;
        node.parent = null;
    });
    
    // Start animation.
    this.transitionTime = 1;
    // Figure out where everything needs to be.
    this.focusedNode.calculateNodeTree(expand, null, 0);
    this.focusedNode.setTransition(expand, null, 0, new Point(0, 0));
};

Graph.prototype.update = function(mouseState, canvasState, time) {
    
    // update transition time if it needs to be updated.
    if(this.transitionTime > 0) {
        this.transitionTime -= time.deltaTime;
    } else {
        this.transitionTime = 0;
    }
    
    // Find if the mouse is over any nodes.
    var mouseOverNode = null;
    this.activeNodes.forEach((node)=>{
        var isMain = (node == this.focusedNode);
        node.update(mouseState, time, this.transitionTime, isMain);
        if(node.mouseOver) {
            mouseOverNode = node;
        }
    });
    
    
    // If user clicks
    if(mouseState.mouseDown && !mouseState.lastMouseDown) {
        
        // focus node if clicked
        if(mouseOverNode) {
            this.FocusNode(mouseOverNode);
        }
        // show details for node if button clicked
        if(this.focusedNode.detailsButton.mouseOver) {
            if(this.detailsPanel.node == null)  {
                this.detailsPanel.enable(this.focusedNode);
                this.focusedNode.detailsButton.text = "Less";
            }
            else {
                this.detailsPanel.disable();
                this.focusedNode.detailsButton.text = "More";
            }
        }
        // user clicks on completion button
        if(this.focusedNode.completionButton.mouseOver) {
            if(this.focusedNode.state == TutorialState.Unlocked) {
                this.focusedNode.changeState(TutorialState.Completed);
            }
            else if (this.focusedNode.state == TutorialState.Completed) {
                // If resetting, ask for confirmation.
                if (confirm("This will reset your progress on all tutorials after this one. Are you sure you want to do this?")) {
                    this.focusedNode.changeState(TutorialState.Unlocked);
                }
            }
        }
    }
    
    // Update the search panel if it's open.
    if(this.searchPanel.open == true) {
        this.searchPanel.update(canvasState, time);
    }
    
    // Update the details panel if it's open.
    if(this.detailsPanel.node != null) {
        this.detailsPanel.update(canvasState, time, this.focusedNode);
    }
    
    
    // Transition the side bars on and off smoothly
    var t1 = (1 - Math.cos(this.searchPanel.transitionTime * Math.PI))/2;
    var t2 = (1 - Math.cos(this.detailsPanel.transitionTime * Math.PI))/2;
    
    // Change styling to change size of divs
    this.searchDiv.style.width = 30 * t1 + "vw";
    this.dataDiv.style.width = 30 * t2 + "vw";
    this.canvasDiv.style.width = 100 - 30 * (t1 + t2) + "vw";    
    
    this.searchPanelButton.style.left = "calc(" + 30 * t1 + "vw + 12px)";
    
    
    this.searchDiv.style.display = (t1 == 0) ? "none" : "block";
    this.dataDiv.style.display = (t2 == 0) ? "none" : "block";
    
    canvasState.update();
};







Graph.prototype.draw = function(canvasState) {
    canvasState.ctx.save();
    
    //translate to the center of the screen
    canvasState.ctx.translate(canvasState.center.x, canvasState.center.y);
    //console.log(canvasState.center);
    //console.log(canvasState);
    //draw nodes
    this.focusedNode.draw(canvasState, this.painter, this, null, 0, expand);
    
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

function SearchPanel(graph) {
    this.graph = graph;
    this.open = false;
    this.transitionOn = false;
    this.transitionTime = 0;
    this.optionsDiv = document.getElementById("leftBar");
    this.searchButton = document.getElementById("searchbutton");
    
    
    this.searchButton.addEventListener("click", function (that) {
        
        // Collect all information for the query
        var query = [];
        
        // get text input if there is any
        var param1 = {
            type: "Text",
            value: document.getElementById("searchtextfield").value
        };
        if(param1.value != "") {
            query.push(param1);
        }
        
        // get language input if there is any
        var param2 = {
            type: "Language",
            value: document.getElementById("searchlanguagefield").value
        };
        if(param2.value != "Any") {
            query.push(param2);
        }
        
        // get tags input if there is any
        var param3 = {
            type: "Tag",
            value: document.getElementById("searchtagfield").value
        };
        if(param3.value != "Any") {
            query.push(param3);
        }
        
        
        //parse data to find matching results
        var searchResults = that.search(query, that.graph.nodes);
        
        
        
        //display results
        var listElement = document.getElementById("searchresults");
        if(searchResults.length == 0) {
            listElement.innerHTML = "No Matching Results Found.";
            return;
        }
        
        listElement.innerHTML = "";
        
        
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
            listElement.appendChild(li);
        }
    }.bind(this.searchButton, this));
};



// This search supports multiple tags of each type, but the actual search doesn't use that functionality.
// Searches by narrowing down results. Anything that doesn't match all 3 criteria fails the test.
SearchPanel.prototype.search = function(query, nodes) {
    var results = [];
    
    
    for(var i = 0; i < nodes.length; i++) {
        var node = nodes[i].data;
        var match = true;
        for(var j = 0; j < query.length; j++) {
            // Text search compares against any text in the demo
            // If it doesnt find the string anywhere it fails the search immediately
            if(query[j].type === "Text") {
                if(node.title.toLowerCase().indexOf(query[j].value.toLowerCase()) === -1) {
                    if(node.series.toLowerCase().indexOf(query[j].value.toLowerCase()) === -1) {
                        if(node.description.toLowerCase().indexOf(query[j].value.toLowerCase()) === -1) {
                            match = false;
                            break; // no match. don't compare anything else for this repo.
                        }
                    }
                }
            }
            // language must match selected language
            else if(query[j].type === "Language") {
                if(node.language !== query[j].value) {
                    match = false;
                    break;
                }
            }
            // tag must match selected tag
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
var openingTutorialName = "Basic-OpenGL-with-GLFW-Drawing-a-Triangle";

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
    
    
    this.mouseOver = false;
    
    
    this.position = new Point(0, 0);
    this.previousPosition = new Point(0, 0);
    this.nextPosition = new Point(0, 0);
    
    this.size = 24;
    this.label = new NodeLabel(this);
        
    this.nextNodes = [];
    this.previousNodes = [];
    
    // Create sub buttons.
    this.detailsButton = new Button(new Point(0, 0), new Point(120, 24), "More", this.color);
    this.completionButton = new Button(new Point(0, 0), new Point(120, 24), "Mark Uncomplete", this.color);
    
    
    // Set up the status of the node to match that saved in browser memory.
    this.state = localStorage.getItem(this.data.name);
    if(this.state == null || this.state == TutorialState.Locked) {
        this.changeState(TutorialState.Locked);
        if(this.data.name == openingTutorialName) {
            this.changeState(TutorialState.Unlocked);
        }
    }
    
    if(this.state == TutorialState.Completed) {
        this.completionButton.text = "Mark Unomplete";
    }
    else {
        this.completionButton.text = "Mark Complete";
    }
    
};

// Changes the state of this node
TutorialNode.prototype.changeState = function(tutState) {
    if(this.state != tutState)
    {
        this.state = tutState;
        localStorage.setItem(this.data.name, this.state);
        if(this.state == TutorialState.Completed) {
            this.completionButton.text = "Mark Uncomplete";
        }
        else {
            this.completionButton.text = "Mark Complete";
        }
        
        //console.log("Updated " + this.data.name + " to " + tutState);
        
        // also update the state of any later nodes to reflect the changes.
        for(var i = 0; i < this.nextNodes.length; i++)
        {
            this.nextNodes[i].updateState();
        }
    }
}

TutorialNode.prototype.updateState = function()
{
    // Lock if any previous are uncompleted
    var lock = this.previousNodes.some((node)=>{
        return (node.state != TutorialState.Completed);
    });
    
    if(lock) {
        this.changeState(TutorialState.Locked);
    } else {
        this.changeState(TutorialState.Unlocked);
    }
}

//recursive function to get previous nodes
TutorialNode.prototype.getPrevious = function(depth) {
    var result = [this];
    if(depth > 0) {
        this.previousNodes.forEach((node)=>{
            result = result.concat(node.getPrevious(depth-1));
        });
    }
    return result;
};



//recursive function to get next nodes
TutorialNode.prototype.getNext = function(depth) {
    var result = [this];
    if(depth > 0) {
        this.nextNodes.forEach((node)=>{
            result = result.concat(node.getNext(depth-1));
        });
    }
    return result;
};


// Updates all nodes starting with one, and extending outward.
// direction is the side of the parent this node exists on (-1, 0, 1) 0 is both.
// layer depth is how many layers to render out
TutorialNode.prototype.recursiveUpdate = function(direction, depth) {
    if(depth > 0) {
        // left or middle
        if(direction < 1) {
            this.previousNodes.forEach((node)=>{
                node.recursiveUpdate(-1, depth - 1);
            });
        }
        // right or middle
        if(direction > -1) {
            this.nextNodes.forEach((node)=>{
                node.recursiveUpdate(1, depth - 1);
            });
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
        
        this.completionButton.position.x = this.position.x - this.completionButton.size.x / 2 - 3;
        this.completionButton.position.y = this.position.y + this.size + 48;
        this.completionButton.update(mouseState);
    }
};


TutorialNode.prototype.calculateNodeTree = function(layerDepth, parent, direction) {
    
    // If the node already exists in the graph in a better place than this one, dont use it
    if(this.currentLayerDepth > layerDepth) {
        return;
    }
    
    this.currentLayerDepth = layerDepth;
    this.parent = parent;
    
    if(layerDepth > 0) {
        // left or middle
        if(direction < 1) {
            this.previousNodes.forEach((node)=>{
                node.calculateNodeTree(layerDepth - 1, this, -1);
            });
        }
        
        // right or middle
        if(direction > -1) {
            this.nextNodes.forEach((node)=>{
                node.calculateNodeTree(layerDepth - 1, this, 1);
            });
        }
    }
};

TutorialNode.prototype.setTransition = function(layerDepth, parent, direction, targetPosition) {
    
    if(!this.wasPreviouslyOnScreen && parent != null) {
        this.position = new Point(targetPosition.x, targetPosition.y);
        this.position.x *= 1.5;
    }
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
            if(direction == 0) xPosition -= 60; // first space is larger than the others.
            yPosition = targetPosition.y - (totalLeftHeight / 2);   // center node vertically
            
            this.previousNodes.forEach((node)=>{
                if(node.parent == this) {
                    var placement = new Point(xPosition, yPosition + node.currentHeight / 2);
                    node.setTransition(layerDepth - 1, this, -1, placement);
                    yPosition += node.currentHeight;
                }
            });
        }
        
        //right or middle
        if(direction > -1) {
            var totalRightHeight = this.getNextHeight(layerDepth);
            xPosition = targetPosition.x + horizontalSpacing;
            if(direction == 0) xPosition += 60; // first space is larger than the others.
            yPosition = targetPosition.y - (totalRightHeight / 2);  // center node vertically.

            this.nextNodes.forEach((node)=>{
                if(node.parent == this) {
                    var placement = new Point(xPosition, yPosition + node.currentHeight / 2);
                    node.setTransition(layerDepth - 1, this, 1, placement);
                    yPosition += node.currentHeight;
                }
            });
        }
    }
};

TutorialNode.prototype.getPreviousHeight = function(layerDepth) {
    this.currentHeight = 0;
    if(layerDepth > 0 && this.previousNodes.length > 0) {
        this.previousNodes.forEach((node)=>{
            if(node.parent == this) {
                this.currentHeight += node.getPreviousHeight(layerDepth - 1);
            }
        });
    }
    if (this.currentHeight == 0) {
        this.currentHeight = baseSize * 5;
    }
    
    return this.currentHeight;
};

TutorialNode.prototype.getNextHeight = function(layerDepth) {
    this.currentHeight = 0;
    if(layerDepth > 0 && this.nextNodes.length > 0) {
        this.nextNodes.forEach((node)=>{
            if(node.parent == this) {
                this.currentHeight += node.getNextHeight(layerDepth - 1);
            }
        });
    }
    if (this.currentHeight == 0) {
        this.currentHeight = baseSize * 5;
    }
    
    return this.currentHeight;
};


TutorialNode.prototype.draw = function(pCanvasState, pPainter, graph, parentCaller, direction, layerDepth) {
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
    
    // draw child nodes
    if(layerDepth > 0){
        // left and middle
        if(direction < 1) {
            this.previousNodes.forEach((node)=>{
                node.draw(pCanvasState, pPainter, graph, this, -1, layerDepth - 1);
            });
        }
        // right and middle
        if(direction > -1) {
            this.nextNodes.forEach((node)=>{
                node.draw(pCanvasState, pPainter, graph, this, 1, layerDepth - 1);
            });
        }
    }
    
    // draw circle
    pPainter.circle(pCanvasState.ctx, this.position.x, this.position.y, this.size, true, this.color, true, "#fff", 2);
    
    // draw a checkmark
    if(this.state == TutorialState.Completed) {
        pCanvasState.ctx.drawImage(graph.checkImage, this.position.x - 32, this.position.y - 32);
    }
    // draw a lock
    if(this.state == TutorialState.Locked) {
        pCanvasState.ctx.drawImage(graph.lockImage, this.position.x - 32, this.position.y - 32);
    }
    
    // draw the label
    this.label.draw(pCanvasState, pPainter);
    if(direction == 0) {
        this.detailsButton.draw(pCanvasState, pPainter);
        if(this.state != TutorialState.Locked) {
            this.completionButton.draw(pCanvasState, pPainter);
        }
    }
};



module.exports = TutorialNode;
},{"../../common/Point.js":3,"../../containers/Button.js":4,"./NodeLabel.js":14}]},{},[1,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9tYWluLmpzIiwianMvbW9kdWxlcy9HYW1lLmpzIiwianMvbW9kdWxlcy9jb21tb24vUG9pbnQuanMiLCJqcy9tb2R1bGVzL2NvbnRhaW5lcnMvQnV0dG9uLmpzIiwianMvbW9kdWxlcy9jb250YWluZXJzL0NhbnZhc1N0YXRlLmpzIiwianMvbW9kdWxlcy9jb250YWluZXJzL01vdXNlU3RhdGUuanMiLCJqcy9tb2R1bGVzL2NvbnRhaW5lcnMvVGltZS5qcyIsImpzL21vZHVsZXMvbGlicmFyaWVzL0RyYXdsaWIuanMiLCJqcy9tb2R1bGVzL2xpYnJhcmllcy9VdGlsaXRpZXMuanMiLCJqcy9tb2R1bGVzL3BoYXNlcy9ncmFwaFBoYXNlL0RldGFpbHNQYW5lbC5qcyIsImpzL21vZHVsZXMvcGhhc2VzL2dyYXBoUGhhc2UvR3JhcGguanMiLCJqcy9tb2R1bGVzL3BoYXNlcy9ncmFwaFBoYXNlL0dyYXBoUGhhc2UuanMiLCJqcy9tb2R1bGVzL3BoYXNlcy9ncmFwaFBoYXNlL05vZGVMYWJlbC5qcyIsImpzL21vZHVsZXMvcGhhc2VzL2dyYXBoUGhhc2UvUGFyc2VyLmpzIiwianMvbW9kdWxlcy9waGFzZXMvZ3JhcGhQaGFzZS9TZWFyY2hQYW5lbC5qcyIsImpzL21vZHVsZXMvcGhhc2VzL2dyYXBoUGhhc2UvVHV0b3JpYWxOb2RlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vaW1wb3J0c1xyXG52YXIgR2FtZSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9HYW1lLmpzJyk7XHJcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4vbW9kdWxlcy9jb21tb24vUG9pbnQuanMnKTtcclxudmFyIFRpbWUgPSByZXF1aXJlKCcuL21vZHVsZXMvY29udGFpbmVycy9UaW1lLmpzJyk7XHJcbnZhciBNb3VzZVN0YXRlID0gcmVxdWlyZSgnLi9tb2R1bGVzL2NvbnRhaW5lcnMvTW91c2VTdGF0ZS5qcycpO1xyXG52YXIgQ2FudmFzU3RhdGUgPSByZXF1aXJlKCcuL21vZHVsZXMvY29udGFpbmVycy9DYW52YXNTdGF0ZS5qcycpO1xyXG5cclxuLy9nYW1lIG9iamVjdHNcclxudmFyIGdhbWU7XHJcbnZhciBjYW52YXM7XHJcbnZhciBjdHg7XHJcbnZhciB0aW1lO1xyXG5cclxuLy9yZXNwb25zaXZlbmVzc1xyXG52YXIgaGVhZGVyO1xyXG52YXIgY2VudGVyO1xyXG52YXIgc2NhbGU7XHJcblxyXG4vL21vdXNlIGhhbmRsaW5nXHJcbnZhciBtb3VzZVBvc2l0aW9uO1xyXG52YXIgcmVsYXRpdmVNb3VzZVBvc2l0aW9uO1xyXG52YXIgbW91c2VEb3duO1xyXG52YXIgbW91c2VJbjtcclxudmFyIHdoZWVsRGVsdGE7XHJcblxyXG4vL3Bhc3NhYmxlIHN0YXRlc1xyXG52YXIgbW91c2VTdGF0ZTtcclxudmFyIGNhbnZhc1N0YXRlO1xyXG5cclxuLy9maXJlcyB3aGVuIHRoZSB3aW5kb3cgbG9hZHNcclxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKGUpe1xyXG4gICAgLy9kZWJ1ZyBidXR0b24gZGVzaWduZWQgdG8gY2xlYXIgcHJvZ3Jlc3MgZGF0YVxyXG4gICAgXHJcbiAgICAvL3ZhcmlhYmxlIGFuZCBsb29wIGluaXRpYWxpemF0aW9uXHJcbiAgICBpbml0aWFsaXplVmFyaWFibGVzKCk7XHJcbiAgICBsb29wKCk7XHJcbn1cclxuXHJcbi8vaW5pdGlhbGl6YXRpb24gZm9yIHZhcmlhYmxlcywgbW91c2UgZXZlbnRzLCBhbmQgZ2FtZSBcImNsYXNzXCJcclxuZnVuY3Rpb24gaW5pdGlhbGl6ZVZhcmlhYmxlcygpe1xyXG4gICAgLy9jYW12YXMgaW5pdGlhbGl6YXRpb25cclxuICAgIGNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2NhbnZhcycpO1xyXG4gICAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICBcclxuICAgIHRpbWUgPSBuZXcgVGltZSgpO1xyXG4gICAgXHJcbiAgICBcclxuICAgIC8vbW91c2UgdmFyaWFibGUgaW5pdGlhbGl6YXRpb25cclxuICAgIG1vdXNlUG9zaXRpb24gPSBuZXcgUG9pbnQoMCwwKTtcclxuICAgIHJlbGF0aXZlTW91c2VQb3NpdGlvbiA9IG5ldyBQb2ludCgwLDApO1xyXG4gICAgXHJcbiAgICBcclxuICAgIFxyXG4gICAgXHJcbiAgICBcclxuICAgIC8vZXZlbnQgbGlzdGVuZXJzIGZvciBtb3VzZSBpbnRlcmFjdGlvbnMgd2l0aCB0aGUgY2FudmFzXHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgdmFyIGJvdW5kUmVjdCA9IGNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICBtb3VzZVBvc2l0aW9uID0gbmV3IFBvaW50KGUuY2xpZW50WCAtIGJvdW5kUmVjdC5sZWZ0LCBlLmNsaWVudFkgLSBib3VuZFJlY3QudG9wKTtcclxuICAgICAgICByZWxhdGl2ZU1vdXNlUG9zaXRpb24gPSBuZXcgUG9pbnQobW91c2VQb3NpdGlvbi54IC0gY2FudmFzLm9mZnNldFdpZHRoIC8gMiwgbW91c2VQb3NpdGlvbi55IC0gY2FudmFzLm9mZnNldEhlaWdodCAvIDIpO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIG1vdXNlRG93biA9IGZhbHNlO1xyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgbW91c2VEb3duID0gdHJ1ZTtcclxuICAgIH0pO1xyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIG1vdXNlRG93biA9IGZhbHNlO1xyXG4gICAgfSk7XHJcbiAgICBtb3VzZUluID0gZmFsc2U7XHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3ZlclwiLCBmdW5jdGlvbihlKXtcclxuICAgICAgICBtb3VzZUluID0gdHJ1ZTtcclxuICAgIH0pO1xyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW91dFwiLCBmdW5jdGlvbihlKXtcclxuICAgICAgICBtb3VzZUluID0gZmFsc2U7XHJcbiAgICAgICAgbW91c2VEb3duID0gZmFsc2U7XHJcbiAgICB9KTtcclxuICAgIHdoZWVsRGVsdGEgPSAwO1xyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXdoZWVsXCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIHdoZWVsRGVsdGEgPSBlLndoZWVsRGVsdGE7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgXHJcbiAgICBcclxuICAgIFxyXG4gICAgLy9zdGF0ZSB2YXJpYWJsZSBpbml0aWFsaXphdGlvblxyXG4gICAgbW91c2VTdGF0ZSA9IG5ldyBNb3VzZVN0YXRlKG1vdXNlUG9zaXRpb24sIHJlbGF0aXZlTW91c2VQb3NpdGlvbiwgbW91c2VEb3duLCBtb3VzZUluLCB3aGVlbERlbHRhKTtcclxuICAgIGNhbnZhc1N0YXRlID0gbmV3IENhbnZhc1N0YXRlKGNhbnZhcywgY3R4KTtcclxuICAgIFxyXG4gICAgLy9sb2NhbCBzdG9yYWdlIGhhbmRsaW5nIGZvciBhY3RpdmUgbm9kZSByZWNvcmQgYW5kIHByb2dyZXNzXHJcbiAgICBpZihsb2NhbFN0b3JhZ2UuYWN0aXZlTm9kZSA9PT0gdW5kZWZpbmVkKXtcclxuICAgICAgICBsb2NhbFN0b3JhZ2UuYWN0aXZlTm9kZSA9IDA7XHJcbiAgICB9XHJcbiAgICBpZihsb2NhbFN0b3JhZ2UucHJvZ3Jlc3MgPT09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgbG9jYWxTdG9yYWdlLnByb2dyZXNzID0gXCJcIjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy9jcmVhdGVzIHRoZSBnYW1lIG9iamVjdCBmcm9tIHdoaWNoIG1vc3QgaW50ZXJhY3Rpb24gaXMgbWFuYWdlZFxyXG4gICAgZ2FtZSA9IG5ldyBHYW1lKCk7XHJcbn1cclxuXHJcbi8vZmlyZXMgb25jZSBwZXIgZnJhbWVcclxuZnVuY3Rpb24gbG9vcCgpIHtcclxuICAgIC8vYmluZHMgbG9vcCB0byBmcmFtZXNcclxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobG9vcC5iaW5kKHRoaXMpKTtcclxuICAgIFxyXG4gICAgdGltZS51cGRhdGUoLjAxNjcpO1xyXG4gICAgXHJcbiAgICAvL2ZlZWQgY3VycmVudCBtb3VzZSB2YXJpYWJsZXMgYmFjayBpbnRvIG1vdXNlIHN0YXRlXHJcbiAgICBtb3VzZVN0YXRlLnVwZGF0ZShtb3VzZVBvc2l0aW9uLCByZWxhdGl2ZU1vdXNlUG9zaXRpb24sIG1vdXNlRG93biwgbW91c2VJbiwgd2hlZWxEZWx0YSk7XHJcbiAgICAvL3Jlc2V0dGluZyB3aGVlbCBkZWx0YVxyXG4gICAgd2hlZWxEZWx0YSA9IDA7XHJcbiAgICBcclxuICAgIC8vdXBkYXRlIGdhbWUncyB2YXJpYWJsZXM6IHBhc3NpbmcgY29udGV4dCwgY2FudmFzLCB0aW1lLCBjZW50ZXIgcG9pbnQsIHVzYWJsZSBoZWlnaHQsIG1vdXNlIHN0YXRlXHJcbiAgICBcclxuICAgIGdhbWUudXBkYXRlKG1vdXNlU3RhdGUsIGNhbnZhc1N0YXRlLCB0aW1lKTtcclxufTtcclxuXHJcbi8vbGlzdGVucyBmb3IgY2hhbmdlcyBpbiBzaXplIG9mIHdpbmRvdyBhbmQgYWRqdXN0cyB2YXJpYWJsZXMgYWNjb3JkaW5nbHlcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgZnVuY3Rpb24oZSl7XHJcbiAgICBjYW52YXNTdGF0ZS51cGRhdGUoKTtcclxufSk7XHJcblxyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vaW1wb3J0ZWQgb2JqZWN0c1xyXG52YXIgR3JhcGhQaGFzZSA9IHJlcXVpcmUoJy4vcGhhc2VzL2dyYXBoUGhhc2UvR3JhcGhQaGFzZS5qcycpO1xyXG52YXIgRHJhd0xpYiA9IHJlcXVpcmUoJy4vbGlicmFyaWVzL0RyYXdsaWIuanMnKTtcclxudmFyIFV0aWxpdGllcyA9IHJlcXVpcmUoJy4vbGlicmFyaWVzL1V0aWxpdGllcy5qcycpO1xyXG5cclxudmFyIGFjdGl2ZVBoYXNlO1xyXG52YXIgcGFpbnRlcjtcclxudmFyIHV0aWxpdHk7XHJcblxyXG52YXIgbW91c2VTdGF0ZVxyXG5cclxuZnVuY3Rpb24gR2FtZSgpeyAgICBcclxuICAgIHBhaW50ZXIgPSBuZXcgRHJhd0xpYigpO1xyXG4gICAgdXRpbGl0eSA9IG5ldyBVdGlsaXRpZXMoKTtcclxuICAgIFxyXG4gICAgLy9pbnN0YW50aWF0ZSB0aGUgZ3JhcGhcclxuICAgIGFjdGl2ZVBoYXNlID0gbmV3IEdyYXBoUGhhc2UoXCJodHRwczovL2F0bGFzLWJhY2tlbmQuaGVyb2t1YXBwLmNvbS9yZXBvc1wiKTsgLy9hY3R1YWwgYmFja2VuZCBhcHBcclxuICAgIC8vYWN0aXZlUGhhc2UgPSBuZXcgR3JhcGhQaGFzZShcImh0dHA6Ly9sb2NhbGhvc3Q6NTAwMC9yZXBvc1wiKTsgLy9mb3IgdGVzdGluZ1xyXG4gICAgXHJcbiAgICAvL2dpdmUgbW91c2VTdGF0ZSBhIHZhbHVlIGZyb20gdGhlIHN0YXJ0IHNvIGl0IGRvZXNuJ3QgcGFzcyB1bmRlZmluZWQgdG8gcHJldmlvdXNcclxuICAgIG1vdXNlU3RhdGUgPSAwO1xyXG59XHJcblxyXG4vL3Bhc3NpbmcgY29udGV4dCwgY2FudmFzLCBkZWx0YSB0aW1lLCBjZW50ZXIgcG9pbnQsIG1vdXNlIHN0YXRlXHJcbkdhbWUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKG1vdXNlU3RhdGUsIGNhbnZhc1N0YXRlLCB0aW1lKSB7XHJcbiAgICBcclxuICAgIFxyXG4gICAgLy91cGRhdGUga2V5IHZhcmlhYmxlcyBpbiB0aGUgYWN0aXZlIHBoYXNlXHJcbiAgICBhY3RpdmVQaGFzZS51cGRhdGUobW91c2VTdGF0ZSwgY2FudmFzU3RhdGUsIHRpbWUpO1xyXG4gICAgXHJcbiAgICAvL2RyYXcgYmFja2dyb3VuZCBhbmQgdGhlbiBhY3RpdmUgcGhhc2VcclxuICAgIGNhbnZhc1N0YXRlLmN0eC5zYXZlKCk7XHJcbiAgICBwYWludGVyLnJlY3QoY2FudmFzU3RhdGUuY3R4LCAwLCAwLCBjYW52YXNTdGF0ZS53aWR0aCwgY2FudmFzU3RhdGUuaGVpZ2h0LCBcIiMyMjJcIik7XHJcbiAgICBjYW52YXNTdGF0ZS5jdHgucmVzdG9yZSgpO1xyXG4gICAgYWN0aXZlUGhhc2UuZHJhdyhjYW52YXNTdGF0ZSk7XHJcbiAgICBcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHYW1lOyIsIlwidXNlIHN0cmljdFwiO1xyXG5mdW5jdGlvbiBQb2ludChwWCwgcFkpe1xyXG4gICAgdGhpcy54ID0gcFg7XHJcbiAgICB0aGlzLnkgPSBwWTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUG9pbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuLi9jb21tb24vUG9pbnQuanMnKTtcclxuXHJcbmZ1bmN0aW9uIEJ1dHRvbihwb3NpdGlvbiwgc2l6ZSwgdGV4dCwgY29sb3IpIHtcclxuICAgIHRoaXMucG9zaXRpb24gPSBuZXcgUG9pbnQocG9zaXRpb24ueCwgcG9zaXRpb24ueSk7XHJcbiAgICB0aGlzLnNpemUgPSBuZXcgUG9pbnQoc2l6ZS54LCBzaXplLnkpO1xyXG4gICAgdGhpcy50ZXh0ID0gdGV4dDtcclxuICAgIHRoaXMubW91c2VPdmVyID0gZmFsc2U7XHJcbiAgICB0aGlzLmNvbG9yID0gY29sb3I7XHJcbiAgICB0aGlzLm91dGxpbmVXaWR0aCA9IDE7XHJcbn07XHJcblxyXG4vL3VwZGF0ZXMgYnV0dG9uLCByZXR1cm5zIHRydWUgaWYgY2xpY2tlZFxyXG5CdXR0b24ucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKHBNb3VzZVN0YXRlKSB7XHJcbiAgICBcclxuICAgIHZhciBtID0gcE1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbjtcclxuICAgIGlmKCBtLnggPCB0aGlzLnBvc2l0aW9uLnggfHwgbS54ID4gdGhpcy5wb3NpdGlvbi54ICsgdGhpcy5zaXplLnggfHxcclxuICAgICAgICBtLnkgPCB0aGlzLnBvc2l0aW9uLnkgfHwgbS55ID4gdGhpcy5wb3NpdGlvbi55ICsgdGhpcy5zaXplLnkpIHtcclxuICAgICAgICB0aGlzLm1vdXNlT3ZlciA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5tb3VzZU92ZXIgPSB0cnVlO1xyXG4gICAgICAgIGlmKHBNb3VzZVN0YXRlLm1vdXNlRG93biAmJiAhcE1vdXNlU3RhdGUubGFzdE1vdXNlRG93bikge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5CdXR0b24ucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihwQ2FudmFzU3RhdGUsIHBQYWludGVyKSB7XHJcbiAgICAvL2RyYXcgYmFzZSBidXR0b25cclxuICAgIGlmKHRoaXMubW91c2VPdmVyKSB7XHJcbiAgICAgICAgdGhpcy5vdXRsaW5lV2lkdGggPSAyO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5vdXRsaW5lV2lkdGggPSAxO1xyXG4gICAgfVxyXG4gICAgcFBhaW50ZXIucmVjdChwQ2FudmFzU3RhdGUuY3R4LFxyXG4gICAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnggLSB0aGlzLm91dGxpbmVXaWR0aCxcclxuICAgICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi55IC0gdGhpcy5vdXRsaW5lV2lkdGgsXHJcbiAgICAgICAgICAgICAgICAgIHRoaXMuc2l6ZS54ICsgMiAqIHRoaXMub3V0bGluZVdpZHRoLFxyXG4gICAgICAgICAgICAgICAgICB0aGlzLnNpemUueSArIDIgKiB0aGlzLm91dGxpbmVXaWR0aCwgXCIjZmZmXCIpO1xyXG5cclxuICAgIHBQYWludGVyLnJlY3QocENhbnZhc1N0YXRlLmN0eCwgdGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnksIHRoaXMuc2l6ZS54LCB0aGlzLnNpemUueSwgdGhpcy5jb2xvcik7XHJcbiAgICBcclxuICAgIC8vZHJhdyB0ZXh0IG9mIGJ1dHRvblxyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5zYXZlKCk7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LmZvbnQgPSBcIjE0cHggQXJpYWxcIjtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHguZmlsbFN0eWxlID0gXCIjZmZmXCI7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LnRleHRBbGlnbiA9IFwiY2VudGVyXCI7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LnRleHRCYXNlbGluZSA9IFwibWlkZGxlXCI7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LmZpbGxUZXh0KHRoaXMudGV4dCwgdGhpcy5wb3NpdGlvbi54ICsgdGhpcy5zaXplLnggLyAyLCB0aGlzLnBvc2l0aW9uLnkgKyB0aGlzLnNpemUueSAvIDIpO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5yZXN0b3JlKCk7XHJcbiAgICBcclxuICAgIFxyXG59O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQnV0dG9uOyIsIi8vQ29udGFpbnMgY2FudmFzIHJlbGF0ZWQgdmFyaWFibGVzIGluIGEgc2luZ2xlIGVhc3ktdG8tcGFzcyBvYmplY3RcclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4uL2NvbW1vbi9Qb2ludC5qcycpO1xyXG5cclxuXHJcbmZ1bmN0aW9uIENhbnZhc1N0YXRlKGNhbnZhcywgY3R4KSB7XHJcbiAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcclxuICAgIHRoaXMuY3R4ID0gY3R4O1xyXG4gICAgdGhpcy51cGRhdGUoKTtcclxufVxyXG5cclxuQ2FudmFzU3RhdGUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy53aWR0aCA9IHRoaXMuY2FudmFzLndpZHRoID0gdGhpcy5jYW52YXMub2Zmc2V0V2lkdGg7XHJcbiAgICB0aGlzLmhlaWdodCA9IHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuY2FudmFzLm9mZnNldEhlaWdodDtcclxuICAgIHRoaXMuY2VudGVyID0gbmV3IFBvaW50KHRoaXMuY2FudmFzLndpZHRoIC8gMiwgdGhpcy5jYW52YXMuaGVpZ2h0IC8gMik7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2FudmFzU3RhdGU7IiwiLy9rZWVwcyB0cmFjayBvZiBtb3VzZSByZWxhdGVkIHZhcmlhYmxlcy5cclxuLy9jYWxjdWxhdGVkIGluIG1haW4gYW5kIHBhc3NlZCB0byBnYW1lXHJcbi8vY29udGFpbnMgdXAgc3RhdGVcclxuLy9wb3NpdGlvblxyXG4vL3JlbGF0aXZlIHBvc2l0aW9uXHJcbi8vb24gY2FudmFzXHJcblwidXNlIHN0cmljdFwiO1xyXG5mdW5jdGlvbiBNb3VzZVN0YXRlKHBQb3NpdGlvbiwgcFJlbGF0aXZlUG9zaXRpb24sIHBNb3VzZURvd24sIHBNb3VzZUluLCBwV2hlZWxEZWx0YSl7XHJcbiAgICB0aGlzLnBvc2l0aW9uID0gcFBvc2l0aW9uO1xyXG4gICAgdGhpcy5yZWxhdGl2ZVBvc2l0aW9uID0gcFJlbGF0aXZlUG9zaXRpb247XHJcbiAgICB0aGlzLm1vdXNlRG93biA9IHBNb3VzZURvd247XHJcbiAgICB0aGlzLm1vdXNlSW4gPSBwTW91c2VJbjtcclxuICAgIHRoaXMud2hlZWxEZWx0YSA9IHBXaGVlbERlbHRhO1xyXG4gICAgXHJcbiAgICAvL3RyYWNraW5nIHByZXZpb3VzIG1vdXNlIHN0YXRlc1xyXG4gICAgdGhpcy5sYXN0UG9zaXRpb24gPSBwUG9zaXRpb247XHJcbiAgICB0aGlzLmxhc3RSZWxhdGl2ZVBvc2l0aW9uID0gcFJlbGF0aXZlUG9zaXRpb247XHJcbiAgICB0aGlzLmxhc3RNb3VzZURvd24gPSBwTW91c2VEb3duO1xyXG4gICAgdGhpcy5sYXN0TW91c2VJbiA9IHBNb3VzZUluO1xyXG4gICAgdGhpcy5sYXN0V2hlZWxEZWx0YSA9IHBXaGVlbERlbHRhXHJcbn1cclxuXHJcbk1vdXNlU3RhdGUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKHBQb3NpdGlvbiwgcFJlbGF0aXZlUG9zaXRpb24sIHBNb3VzZURvd24sIHBNb3VzZUluLCBwV2hlZWxEZWx0YSl7XHJcbiAgICB0aGlzLmxhc3RQb3NpdGlvbiA9IHRoaXMucG9zaXRpb247XHJcbiAgICB0aGlzLmxhc3RSZWxhdGl2ZVBvc2l0aW9uID0gdGhpcy5yZWxhdGl2ZVBvc2l0aW9uO1xyXG4gICAgdGhpcy5sYXN0TW91c2VEb3duID0gdGhpcy5tb3VzZURvd247XHJcbiAgICB0aGlzLmxhc3RNb3VzZUluID0gdGhpcy5tb3VzZUluO1xyXG4gICAgdGhpcy5sYXN0V2hlZWxEZWx0YSA9IHRoaXMud2hlZWxEZWx0YTtcclxuICAgIFxyXG4gICAgXHJcbiAgICB0aGlzLnBvc2l0aW9uID0gcFBvc2l0aW9uO1xyXG4gICAgdGhpcy5yZWxhdGl2ZVBvc2l0aW9uID0gcFJlbGF0aXZlUG9zaXRpb247XHJcbiAgICB0aGlzLm1vdXNlRG93biA9IHBNb3VzZURvd247XHJcbiAgICB0aGlzLm1vdXNlSW4gPSBwTW91c2VJbjtcclxuICAgIHRoaXMud2hlZWxEZWx0YSA9IHBXaGVlbERlbHRhO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1vdXNlU3RhdGU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5mdW5jdGlvbiBUaW1lICgpIHtcclxuICAgIHRoaXMudG90YWxUaW1lID0gMDtcclxuICAgIHRoaXMuZGVsdGFUaW1lID0gMDtcclxufTtcclxuXHJcblRpbWUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0KSB7XHJcbiAgICB0aGlzLnRvdGFsVGltZSArPSBkdDtcclxuICAgIHRoaXMuZGVsdGFUaW1lID0gZHQ7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRpbWU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmZ1bmN0aW9uIERyYXdsaWIoKXtcclxufTtcclxuXHJcbkRyYXdsaWIucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oY3R4LCB4LCB5LCB3LCBoKSB7XHJcbiAgICBjdHguY2xlYXJSZWN0KHgsIHksIHcsIGgpO1xyXG59O1xyXG5cclxuRHJhd2xpYi5wcm90b3R5cGUucmVjdCA9IGZ1bmN0aW9uKGN0eCwgeCwgeSwgdywgaCwgY29sKSB7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IGNvbDtcclxuICAgIGN0eC5maWxsUmVjdCh4LCB5LCB3LCBoKTtcclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbn07XHJcblxyXG5EcmF3bGliLnByb3RvdHlwZS5yb3VuZGVkUmVjdCA9IGZ1bmN0aW9uKGN0eCwgeCwgeSwgdywgaCwgcmFkLCBmaWxsLCBmaWxsQ29sb3IsIG91dGxpbmUsIG91dGxpbmVDb2xvciwgb3V0bGluZVdpZHRoKSB7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4Lm1vdmVUbyh4LCB5IC0gcmFkKTsgLy8xMSBvIGNsb2NrXHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHgubGluZVRvKHggKyB3LCB5IC0gcmFkKTsgLy8xIG8gY2xvY2tcclxuICAgIGN0eC5hcmNUbyh4ICsgdyArIHJhZCwgeSAtIHJhZCwgeCArIHcgKyByYWQsIHksIHJhZCk7IC8vIDIgbyBjbG9ja1xyXG4gICAgY3R4LmxpbmVUbyh4ICsgdyArIHJhZCwgeSArIGgpOyAvLyA0IG8gY2xvY2tcclxuICAgIGN0eC5hcmNUbyh4ICsgdyArIHJhZCwgeSArIGggKyByYWQsIHggKyB3LCB5ICsgaCArIHJhZCwgcmFkKSAvLzUgbyBjbG9ja1xyXG4gICAgY3R4LmxpbmVUbyh4LCB5ICsgaCArIHJhZCk7IC8vIDcgbyBjbG9ja1xyXG4gICAgY3R4LmFyY1RvKHggLSByYWQsIHkgKyBoICsgcmFkLCB4IC0gcmFkLCB5ICsgaCwgcmFkKSAvLzggbyBjbG9ja1xyXG4gICAgY3R4LmxpbmVUbyh4IC0gcmFkLCB5KTsgLy8gMTAgbyBjbG9ja1xyXG4gICAgY3R4LmFyY1RvKHggLSByYWQsIHkgLSByYWQsIHgsIHkgLXJhZCwgcmFkKSAvLzExIG8gY2xvY2tcclxuICAgIGN0eC5jbG9zZVBhdGgoKTtcclxuICAgIGlmKGZpbGwpIHtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gZmlsbENvbG9yO1xyXG4gICAgICAgIGN0eC5maWxsKCk7XHJcbiAgICB9XHJcbiAgICBpZihvdXRsaW5lKSB7XHJcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gb3V0bGluZUNvbG9yO1xyXG4gICAgICAgIGN0eC5saW5lV2lkdGggPSBvdXRsaW5lV2lkdGg7XHJcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgfVxyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxufVxyXG5cclxuRHJhd2xpYi5wcm90b3R5cGUubGluZSA9IGZ1bmN0aW9uKGN0eCwgeDEsIHkxLCB4MiwgeTIsIHRoaWNrbmVzcywgY29sb3IpIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHgubW92ZVRvKHgxLCB5MSk7XHJcbiAgICBjdHgubGluZVRvKHgyLCB5Mik7XHJcbiAgICBjdHgubGluZVdpZHRoID0gdGhpY2tuZXNzO1xyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gY29sb3I7XHJcbiAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG59O1xyXG5cclxuRHJhd2xpYi5wcm90b3R5cGUuY2lyY2xlID0gZnVuY3Rpb24oY3R4LCB4LCB5LCByYWRpdXMsIGZpbGwsIGZpbGxDb2xvciwgb3V0bGluZSwgb3V0bGluZUNvbG9yLCBvdXRsaW5lV2lkdGgpIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHguYXJjKHgseSwgcmFkaXVzLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xyXG4gICAgY3R4LmNsb3NlUGF0aCgpO1xyXG4gICAgaWYoZmlsbCkge1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBmaWxsQ29sb3I7XHJcbiAgICAgICAgY3R4LmZpbGwoKTtcclxuICAgIH1cclxuICAgIGlmKG91dGxpbmUpIHtcclxuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBvdXRsaW5lQ29sb3I7XHJcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IG91dGxpbmVXaWR0aDtcclxuICAgICAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICB9XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG59O1xyXG5cclxuRHJhd2xpYi5wcm90b3R5cGUudGV4dFRvTGluZXMgPSBmdW5jdGlvbihjdHgsIHRleHQsIGZvbnQsIHdpZHRoKSB7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4LmZvbnQgPSBmb250O1xyXG4gICAgXHJcbiAgICB2YXIgbGluZXMgPSBbXTtcclxuICAgIFxyXG4gICAgd2hpbGUgKHRleHQubGVuZ3RoKSB7XHJcbiAgICAgICAgdmFyIGksIGo7XHJcbiAgICAgICAgZm9yKGkgPSB0ZXh0Lmxlbmd0aDsgY3R4Lm1lYXN1cmVUZXh0KHRleHQuc3Vic3RyKDAsIGkpKS53aWR0aCA+IHdpZHRoOyBpLS0pO1xyXG5cclxuICAgICAgICB2YXIgcmVzdWx0ID0gdGV4dC5zdWJzdHIoMCxpKTtcclxuXHJcbiAgICAgICAgaWYgKGkgIT09IHRleHQubGVuZ3RoKVxyXG4gICAgICAgICAgICBmb3IodmFyIGogPSAwOyByZXN1bHQuaW5kZXhPZihcIiBcIiwgaikgIT09IC0xOyBqID0gcmVzdWx0LmluZGV4T2YoXCIgXCIsIGopICsgMSk7XHJcblxyXG4gICAgICAgIGxpbmVzLnB1c2gocmVzdWx0LnN1YnN0cigwLCBqIHx8IHJlc3VsdC5sZW5ndGgpKTtcclxuICAgICAgICB3aWR0aCA9IE1hdGgubWF4KHdpZHRoLCBjdHgubWVhc3VyZVRleHQobGluZXNbbGluZXMubGVuZ3RoIC0gMV0pLndpZHRoKTtcclxuICAgICAgICB0ZXh0ICA9IHRleHQuc3Vic3RyKGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdLmxlbmd0aCwgdGV4dC5sZW5ndGgpO1xyXG4gICAgfVxyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxuICAgIHJldHVybiBsaW5lcztcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRHJhd2xpYjsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIFBvaW50ID0gcmVxdWlyZSgnLi4vY29tbW9uL1BvaW50LmpzJyk7XHJcblxyXG5mdW5jdGlvbiBVdGlsaXRpZXMoKXtcclxufVxyXG5cclxuLy9CT0FSRFBIQVNFIC0gc2V0IGEgc3RhdHVzIHZhbHVlIG9mIGEgbm9kZSBpbiBsb2NhbFN0b3JhZ2UgYmFzZWQgb24gSURcclxuVXRpbGl0aWVzLnByb3RvdHlwZS5zZXRQcm9ncmVzcyA9IGZ1bmN0aW9uKHBPYmplY3Qpe1xyXG4gICAgdmFyIHByb2dyZXNzU3RyaW5nID0gbG9jYWxTdG9yYWdlLnByb2dyZXNzO1xyXG4gICAgXHJcbiAgICB2YXIgdGFyZ2V0T2JqZWN0ID0gcE9iamVjdDtcclxuICAgIC8vbWFrZSBhY2NvbW9kYXRpb25zIGlmIHRoaXMgaXMgYW4gZXh0ZW5zaW9uIG5vZGVcclxuICAgIHZhciBleHRlbnNpb25mbGFnID0gdHJ1ZTtcclxuICAgIHdoaWxlKGV4dGVuc2lvbmZsYWcpe1xyXG4gICAgICAgIGlmKHRhcmdldE9iamVjdC50eXBlID09PSBcImV4dGVuc2lvblwiKXtcclxuICAgICAgICAgICAgdGFyZ2V0T2JqZWN0ID0gdGFyZ2V0T2JqZWN0LmNvbm5lY3Rpb25Gb3J3YXJkWzBdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICBleHRlbnNpb25mbGFnID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICB2YXIgb2JqZWN0SUQgPSB0YXJnZXRPYmplY3QuZGF0YS5faWQ7XHJcbiAgICB2YXIgb2JqZWN0U3RhdHVzID0gdGFyZ2V0T2JqZWN0LnN0YXR1cztcclxuICAgIFxyXG4gICAgLy9zZWFyY2ggdGhlIHByb2dyZXNzU3RyaW5nIGZvciB0aGUgY3VycmVudCBJRFxyXG4gICAgdmFyIGlkSW5kZXggPSBwcm9ncmVzc1N0cmluZy5pbmRleE9mKG9iamVjdElEKTtcclxuICAgIFxyXG4gICAgLy9pZiBpdCdzIG5vdCBhZGQgaXQgdG8gdGhlIGVuZFxyXG4gICAgaWYoaWRJbmRleCA9PT0gLTEpe1xyXG4gICAgICAgIHByb2dyZXNzU3RyaW5nICs9IG9iamVjdElEICsgXCJcIiArIG9iamVjdFN0YXR1cyArIFwiLFwiO1xyXG4gICAgfVxyXG4gICAgLy9vdGhlcndpc2UgbW9kaWZ5IHRoZSBzdGF0dXMgdmFsdWVcclxuICAgIGVsc2V7XHJcbiAgICAgICAgcHJvZ3Jlc3NTdHJpbmcgPSBwcm9ncmVzc1N0cmluZy5zdWJzdHIoMCwgb2JqZWN0SUQubGVuZ3RoICsgaWRJbmRleCkgKyBvYmplY3RTdGF0dXMgKyBwcm9ncmVzc1N0cmluZy5zdWJzdHIob2JqZWN0SUQubGVuZ3RoICsgMSArIGlkSW5kZXgsIHByb2dyZXNzU3RyaW5nLmxlbmd0aCkgKyBcIlwiO1xyXG4gICAgfVxyXG4gICAgbG9jYWxTdG9yYWdlLnByb2dyZXNzID0gcHJvZ3Jlc3NTdHJpbmc7XHJcbn1cclxuXHJcbi8vcmV0dXJucyBtb3VzZSBwb3NpdGlvbiBpbiBsb2NhbCBjb29yZGluYXRlIHN5c3RlbSBvZiBlbGVtZW50XHJcblV0aWxpdGllcy5wcm90b3R5cGUuZ2V0TW91c2UgPSBmdW5jdGlvbihlKXtcclxuICAgIHJldHVybiBuZXcgUG9pbnQoKGUucGFnZVggLSBlLnRhcmdldC5vZmZzZXRMZWZ0KSwgKGUucGFnZVkgLSBlLnRhcmdldC5vZmZzZXRUb3ApKTtcclxufVxyXG5cclxuVXRpbGl0aWVzLnByb3RvdHlwZS5tYXAgPSBmdW5jdGlvbih2YWx1ZSwgbWluMSwgbWF4MSwgbWluMiwgbWF4Mil7XHJcbiAgICByZXR1cm4gbWluMiArIChtYXgyIC0gbWluMikgKiAoKHZhbHVlIC0gbWluMSkgLyAobWF4MSAtIG1pbjEpKTtcclxufVxyXG5cclxuLy9saW1pdHMgdGhlIHVwcGVyIGFuZCBsb3dlciBsaW1pdHMgb2YgdGhlIHBhcmFtZXRlciB2YWx1ZVxyXG5VdGlsaXRpZXMucHJvdG90eXBlLmNsYW1wID0gZnVuY3Rpb24odmFsdWUsIG1pbiwgbWF4KXtcclxuICAgIHJldHVybiBNYXRoLm1heChtaW4sIE1hdGgubWluKG1heCwgdmFsdWUpKTtcclxufVxyXG5cclxuLy9jaGVja3MgbW91c2UgY29sbGlzaW9uIG9uIGNhbnZhc1xyXG5VdGlsaXRpZXMucHJvdG90eXBlLm1vdXNlSW50ZXJzZWN0ID0gZnVuY3Rpb24ocE1vdXNlU3RhdGUsIHBFbGVtZW50LCBwT2Zmc2V0dGVyLCBwU2NhbGUpe1xyXG4gICAgLy9pZiB0aGUgeCBwb3NpdGlvbiBjb2xsaWRlc1xyXG4gICAgaWYocEVsZW1lbnQuc3RhdHVzICE9PSBcIjBcIil7XHJcbiAgICAgICAgaWYocE1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbi54ICsgcE9mZnNldHRlci54ID4gKHBFbGVtZW50LnBvc2l0aW9uLnggLSAocEVsZW1lbnQud2lkdGgpLzIpICYmIHBNb3VzZVN0YXRlLnJlbGF0aXZlUG9zaXRpb24ueCArIHBPZmZzZXR0ZXIueCA8IChwRWxlbWVudC5wb3NpdGlvbi54ICsgKHBFbGVtZW50LndpZHRoKS8yKSl7XHJcbiAgICAgICAgICAgIC8vaWYgdGhlIHkgcG9zaXRpb24gY29sbGlkZXNcclxuICAgICAgICAgICAgaWYocE1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbi55ICsgcE9mZnNldHRlci55ID4gKHBFbGVtZW50LnBvc2l0aW9uLnkgLSAocEVsZW1lbnQuaGVpZ2h0KS8yKSAmJiBwTW91c2VTdGF0ZS5yZWxhdGl2ZVBvc2l0aW9uLnkgKyBwT2Zmc2V0dGVyLnkgPCAocEVsZW1lbnQucG9zaXRpb24ueSArIChwRWxlbWVudC5oZWlnaHQpLzIpKXtcclxuICAgICAgICAgICAgICAgICAgICBwRWxlbWVudC5tb3VzZU92ZXIgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICBwRWxlbWVudC5tb3VzZU92ZXIgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICBwRWxlbWVudC5tb3VzZU92ZXIgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVXRpbGl0aWVzOyIsIlwidXNlIHN0cmljdFwiXHJcblxyXG52YXIgVHV0b3JpYWxUYWdzID0ge1xyXG4gICAgXCJBSVwiOiBcIiM4MDRcIixcclxuICAgIFwiQXVkaW9cIjogXCIjMDQ4XCIsXHJcbiAgICBcIkNvbXB1dGVyIFNjaWVuY2VcIjogXCIjMTExXCIsXHJcbiAgICBcIkNvcmVcIjogXCIjMzMzXCIsXHJcbiAgICBcIkdyYXBoaWNzXCI6IFwiI2MwY1wiLFxyXG4gICAgXCJJbnB1dFwiOiBcIiM4ODBcIixcclxuICAgIFwiTWF0aFwiOiBcIiM0ODRcIixcclxuICAgIFwiTmV0d29ya2luZ1wiOiBcIiNjNjBcIixcclxuICAgIFwiT3B0aW1pemF0aW9uXCI6IFwiIzI4MlwiLFxyXG4gICAgXCJQaHlzaWNzXCI6IFwiIzA0OFwiLFxyXG4gICAgXCJTY3JpcHRpbmdcIjogXCIjMDg4XCIsXHJcbiAgICBcIlNvZnR3YXJlRW5naW5lZXJpbmdcIjogXCIjODQ0XCJcclxufTtcclxuXHJcblxyXG5mdW5jdGlvbiBEZXRhaWxzUGFuZWwoZ3JhcGgpIHtcclxuICAgIHRoaXMuZ3JhcGggPSBncmFwaDtcclxuICAgIHRoaXMubm9kZSA9IG51bGw7XHJcbiAgICB0aGlzLmRhdGEgPSBudWxsO1xyXG4gICAgdGhpcy50cmFuc2l0aW9uT24gPSBmYWxzZTtcclxuICAgIHRoaXMudHJhbnNpdGlvblRpbWUgPSAwO1xyXG4gICAgdGhpcy5kYXRhRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyaWdodEJhclwiKTtcclxufTtcclxuXHJcbkRldGFpbHNQYW5lbC5wcm90b3R5cGUuZW5hYmxlID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgdGhpcy5ub2RlID0gbm9kZTtcclxuICAgIHRoaXMuZGF0YSA9IG5vZGUuZGF0YTtcclxuICAgIHRoaXMudHJhbnNpdGlvbk9uID0gdHJ1ZVxyXG59O1xyXG5cclxuRGV0YWlsc1BhbmVsLnByb3RvdHlwZS5kaXNhYmxlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmRhdGFEaXYuaW5uZXJIVE1MID0gXCJcIjtcclxuICAgIHRoaXMudHJhbnNpdGlvbk9uID0gZmFsc2U7XHJcbn07XHJcblxyXG5EZXRhaWxzUGFuZWwucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGNhbnZhc1N0YXRlLCB0aW1lLCBub2RlKSB7XHJcbiAgICBcclxuICAgIC8vdXBkYXRlIG5vZGUgaWYgaXRzIG5vdCB0aGUgc2FtZSBhbnltb3JlXHJcbiAgICBpZih0aGlzLm5vZGUgIT0gbm9kZSkge1xyXG4gICAgICAgIHRoaXMubm9kZSA9IG5vZGU7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gbm9kZS5kYXRhO1xyXG4gICAgICAgIHRoaXMuZGF0YURpdi5pbm5lckhUTUwgPSB0aGlzLkdlbmVyYXRlRE9NKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIFxyXG4gICAgLy90cmFuc2l0aW9uIG9uXHJcbiAgICBpZih0aGlzLnRyYW5zaXRpb25Pbikge1xyXG4gICAgICAgIGlmKHRoaXMudHJhbnNpdGlvblRpbWUgPCAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvblRpbWUgKz0gdGltZS5kZWx0YVRpbWUgKiAzO1xyXG4gICAgICAgICAgICBpZih0aGlzLnRyYW5zaXRpb25UaW1lID49IDEpIHtcclxuICAgICAgICAgICAgICAgIC8vZG9uZSB0cmFuc2l0aW9uaW5nXHJcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25UaW1lID0gMTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YURpdi5pbm5lckhUTUwgPSB0aGlzLkdlbmVyYXRlRE9NKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvL3RyYW5zaXRpb24gb2ZmXHJcbiAgICBlbHNlIHtcclxuICAgICAgICBpZih0aGlzLnRyYW5zaXRpb25UaW1lID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25UaW1lIC09IHRpbWUuZGVsdGFUaW1lICogMztcclxuICAgICAgICAgICAgaWYodGhpcy50cmFuc2l0aW9uVGltZSA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAvL2RvbmUgdHJhbnNpdGlvbmluZ1xyXG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9uVGltZSA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5vZGUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhID0gbnVsbDsgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5EZXRhaWxzUGFuZWwucHJvdG90eXBlLkdlbmVyYXRlRE9NID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgaHRtbCA9IFwiPGgxPlwiK3RoaXMuZGF0YS5zZXJpZXMrXCI6PC9oMT48aDE+PGEgaHJlZj1cIiArIHRoaXMuZGF0YS5saW5rICsgXCI+XCIrdGhpcy5kYXRhLnRpdGxlK1wiPC9hPjwvaDE+XCI7XHJcbiAgICBodG1sICs9IFwiPGEgaHJlZj1cIiArIHRoaXMuZGF0YS5saW5rICsgXCI+PGltZyBzcmM9aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0lHTUUtUklUL1wiICsgdGhpcy5kYXRhLm5hbWUgK1xyXG4gICAgICAgIFwiL21hc3Rlci9pZ21lX3RodW1ibmFpbC5wbmcgYWx0PVwiICsgdGhpcy5kYXRhLmxpbmsgKyBcIj48L2E+XCI7XHJcbiAgICBcclxuICAgIGh0bWwgKz0gXCI8dWwgaWQ9J3RhZ3MnPlwiO1xyXG4gICAgaWYodGhpcy5kYXRhLnRhZ3MubGVuZ3RoICE9IDApIHtcclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5kYXRhLnRhZ3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaHRtbCArPSBcIjxsaSBzdHlsZT0nYmFja2dyb3VuZC1jb2xvcjpcIiArIFR1dG9yaWFsVGFnc1t0aGlzLmRhdGEudGFnc1tpXV0gKyBcIic+XCIgKyB0aGlzLmRhdGEudGFnc1tpXSArIFwiPC9saT5cIjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBodG1sKz0gXCI8L3VsPlwiXHJcbiAgICBcclxuICAgIGh0bWwgKz0gXCI8cD5cIiArIHRoaXMuZGF0YS5kZXNjcmlwdGlvbiArIFwiPC9wPlwiO1xyXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLmRhdGEpO1xyXG4gICAgaWYodGhpcy5kYXRhLmV4dHJhX3Jlc291cmNlcy5sZW5ndGggIT0gMCkge1xyXG4gICAgICAgIGh0bWwgKz0gXCI8aDI+QWRkaXRpb25hbCBSZXNvdXJjZXM6PC9oMj5cIjtcclxuICAgICAgICBodG1sICs9IFwiPHVsPlwiO1xyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGEuZXh0cmFfcmVzb3VyY2VzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCI8bGk+PGEgaHJlZj1cIiArIHRoaXMuZGF0YS5leHRyYV9yZXNvdXJjZXNbaV0ubGluayArIFwiPlwiICsgdGhpcy5kYXRhLmV4dHJhX3Jlc291cmNlc1tpXS50aXRsZSArIFwiPC9hPjwvbGk+XCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGh0bWwgKz0gXCI8L3VsPlwiO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZXR1cm4gaHRtbDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRGV0YWlsc1BhbmVsOyIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgRHJhd0xpYiA9IHJlcXVpcmUoJy4uLy4uL2xpYnJhcmllcy9EcmF3bGliLmpzJyk7XHJcbnZhciBTZWFyY2hQYW5lbCA9IHJlcXVpcmUoJy4vU2VhcmNoUGFuZWwuanMnKTtcclxudmFyIERldGFpbHNQYW5lbCA9IHJlcXVpcmUoJy4vRGV0YWlsc1BhbmVsLmpzJyk7XHJcbnZhciBUdXRvcmlhbE5vZGUgPSByZXF1aXJlKCcuL1R1dG9yaWFsTm9kZS5qcycpO1xyXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vUG9pbnQuanMnKTtcclxuXHJcblxyXG52YXIgZXhwYW5kID0gMjsgLy8gaG93IG1hbnkgdmFsdWVzIHRvIGV4cGFuZCB0b1xyXG52YXIgZGVidWdNb2RlID0gZmFsc2U7XHJcblxyXG5cclxudmFyIFR1dG9yaWFsU3RhdGUgPSB7XHJcbiAgICBMb2NrZWQ6IDAsXHJcbiAgICBVbmxvY2tlZDogMSxcclxuICAgIENvbXBsZXRlZDogMlxyXG59O1xyXG5cclxuXHJcbmZ1bmN0aW9uIEdyYXBoKHBKU09ORGF0YSkge1xyXG4gICAgXHJcbiAgICB0aGlzLnNlYXJjaFBhbmVsID0gbmV3IFNlYXJjaFBhbmVsKHRoaXMpO1xyXG4gICAgdGhpcy5kZXRhaWxzUGFuZWwgPSBuZXcgRGV0YWlsc1BhbmVsKHRoaXMpO1xyXG4gICAgdGhpcy5zZWFyY2hQYW5lbEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiT3B0aW9uc0J1dHRvblwiKTtcclxuICAgIHRoaXMuc2VhcmNoRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsZWZ0QmFyXCIpO1xyXG4gICAgdGhpcy5kYXRhRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyaWdodEJhclwiKTtcclxuICAgIHRoaXMuY2FudmFzRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtaWRkbGVCYXJcIik7XHJcbiAgICBcclxuICAgIC8vIGxvYWQgbG9jayBpbWFnZSBmb3IgbG9ja2VkIG5vZGVzIGFuZCBjb21wbGV0ZWQgbm9kZXNcclxuICAgIHRoaXMubG9ja0ltYWdlID0gbmV3IEltYWdlKCk7XHJcbiAgICB0aGlzLmxvY2tJbWFnZS5zcmMgPSBcImNvbnRlbnQvdWkvTG9jay5wbmdcIjtcclxuICAgIHRoaXMuY2hlY2tJbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG4gICAgdGhpcy5jaGVja0ltYWdlLnNyYyA9IFwiY29udGVudC91aS9DaGVjay5wbmdcIjtcclxuICAgIFxyXG4gICAgLy9jcmVhdGUgcGFpbnRlciBvYmplY3QgdG8gaGVscCBkcmF3IHN0dWZmXHJcbiAgICB0aGlzLnBhaW50ZXIgPSBuZXcgRHJhd0xpYigpO1xyXG4gICAgXHJcbiAgICB0aGlzLm5vZGVzID0gW107XHJcbiAgICB0aGlzLmFjdGl2ZU5vZGVzID0gW107XHJcbiAgICBcclxuICAgIC8vcG9wdWxhdGUgdGhlIGFycmF5XHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgcEpTT05EYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGRhdGEgPSBwSlNPTkRhdGFbaV07XHJcbiAgICAgICAgLy9lbnN1cmVzIHRoYXQgdGhlIGNodW5rIGNvbnRhaW5zIGEgbGlua1xyXG4gICAgICAgIGlmKGRhdGEudGFncy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgaWYoZGVidWdNb2RlKSBjb25zb2xlLmxvZyhcIlJlcG8gbm90IHRhZ2dlZDogXCIgKyBkYXRhLm5hbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKGRhdGEuaW1hZ2UgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBpZihkZWJ1Z01vZGUpIGNvbnNvbGUubG9nKFwiUmVwbyB5YW1sIG91dCBvZiBkYXRlOiBcIiArIGRhdGEubmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgbm9kZSA9IG5ldyBUdXRvcmlhbE5vZGUoZGF0YSk7XHJcbiAgICAgICAgICAgIHRoaXMubm9kZXMucHVzaChub2RlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIGxvb3AgdGhyb3VnaCBub2RlcyBhbmQgY29ubmVjdCB0aGVtIHRvZ2V0aGVyLlxyXG4gICAgdGhpcy5ub2Rlcy5mb3JFYWNoKChub2RlKT0+e1xyXG4gICAgICAgIG5vZGUuZGF0YS5jb25uZWN0aW9ucy5mb3JFYWNoKChjb25uZWN0aW9uKT0+e1xyXG4gICAgICAgICAgICB0aGlzLm5vZGVzLmZvckVhY2goKG90aGVyTm9kZSk9PntcclxuICAgICAgICAgICAgICAgIGlmKG90aGVyTm9kZS5kYXRhLnNlcmllcyA9PT0gY29ubmVjdGlvbi5zZXJpZXMgJiYgb3RoZXJOb2RlLmRhdGEudGl0bGUgPT09IGNvbm5lY3Rpb24udGl0bGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBub2RlLnByZXZpb3VzTm9kZXMucHVzaChvdGhlck5vZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIG90aGVyTm9kZS5uZXh0Tm9kZXMucHVzaChub2RlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgXHJcbiAgICB0aGlzLnRyYW5zaXRpb25UaW1lID0gMDtcclxuICAgIHRoaXMuRm9jdXNOb2RlKHRoaXMubm9kZXNbMF0pO1xyXG4gICAgXHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIHggKHNlYXJjaCkge1xyXG4gICAgICAgIGlmKHNlYXJjaC5vcGVuID09IHRydWUpIHtcclxuICAgICAgICAgICAgc2VhcmNoLnRyYW5zaXRpb25PbiA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2VhcmNoLnRyYW5zaXRpb25PbiA9IHRydWU7XHJcbiAgICAgICAgICAgIHNlYXJjaC5vcGVuID0gdHJ1ZTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZWFyY2h0ZXh0ZmllbGRcIikuc2VsZWN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICB0aGlzLnNlYXJjaFBhbmVsQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB4LmJpbmQodGhpcy5zZWFyY2hQYW5lbEJ1dHRvbiwgdGhpcy5zZWFyY2hQYW5lbCkpO1xyXG59O1xyXG5cclxuXHJcblxyXG5cclxuR3JhcGgucHJvdG90eXBlLkZvY3VzTm9kZSA9IGZ1bmN0aW9uKGNlbnRlck5vZGUpIHtcclxuICAgIHRoaXMuZm9jdXNlZE5vZGUgPSBjZW50ZXJOb2RlO1xyXG4gICAgXHJcbiAgICB2YXIgbmV3Tm9kZXMgPSBbXTtcclxuICAgIFxyXG4gICAgLy9nZXQgbm9kZXMgdG8gZGVwdGggaW4gYm90aCBkaXJlY3Rpb25zLCBhbmQgYWRkIHRoZW0gdG8gdGhlIG5ldyBub2RlcyBhcnJheVxyXG4gICAgdmFyIHByZXZpb3VzTm9kZXMgPSB0aGlzLmZvY3VzZWROb2RlLmdldFByZXZpb3VzKGV4cGFuZCk7XHJcbiAgICBuZXdOb2RlcyA9IG5ld05vZGVzLmNvbmNhdChwcmV2aW91c05vZGVzKTtcclxuICAgIFxyXG4gICAgdmFyIG5leHROb2RlcyA9IHRoaXMuZm9jdXNlZE5vZGUuZ2V0TmV4dChleHBhbmQpO1xyXG4gICAgbmV3Tm9kZXMgPSBuZXdOb2Rlcy5jb25jYXQobmV4dE5vZGVzKTtcclxuICAgIFxyXG4gICAgXHJcbiAgICAvL2ZpbmQgcmVkdW5kYW5jaWVzIGZyb20gdGhlIG5ld05vZGVzLCBhbmQgbWFrZSBhIG5ldyBhcnJheSB3aXRob3V0IHRob3NlIHJlZHVuZGFuY2llcy5cclxuICAgIHZhciB0ZW1wID0gW107XHJcbiAgICBuZXdOb2Rlcy5mb3JFYWNoKChub2RlVG9DaGVjayk9PiB7XHJcbiAgICAgICAgaWYodGVtcC5ldmVyeSgoYWxyZWFkeUFkZGVkTm9kZSk9PntcclxuICAgICAgICAgICAgcmV0dXJuIG5vZGVUb0NoZWNrICE9IGFscmVhZHlBZGRlZE5vZGU7XHJcbiAgICAgICAgfSkpIHtcclxuICAgICAgICAgICAgdGVtcC5wdXNoKG5vZGVUb0NoZWNrKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIG5ld05vZGVzID0gdGVtcDtcclxuICAgIFxyXG4gICAgXHJcbiAgICBcclxuICAgIC8vIGNoZWNrIGlmIGFueSBvZiB0aGUgbm9kZXMgd2VyZSBwcmV2aW91c2x5IG9uIHNjcmVlblxyXG4gICAgLy8gKHRoaXMgaXMgdXNlZCB0byBkZXRlcm1pbmUgd2hlcmUgdGhleSBzaG91bGQgYXBwZWFyIGR1cmluZyB0aGUgdHJhbnNpdGlvbiBhbmltYXRpb24pXHJcbiAgICB0aGlzLmFjdGl2ZU5vZGVzLmZvckVhY2goKG5vZGUpPT57XHJcbiAgICAgICAgbm9kZS53YXNQcmV2aW91c2x5T25TY3JlZW4gPSBuZXdOb2Rlcy5zb21lKChuZXdOb2RlKT0+e1xyXG4gICAgICAgICAgICByZXR1cm4gbm9kZSA9PSBuZXdOb2RlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIHRoaXMuYWN0aXZlTm9kZXMgPSBuZXdOb2RlcztcclxuICAgIFxyXG4gICAgLy9jbGVhciB0aGVpciBwYXJlbnQgZGF0YSBmb3IgbmV3IG5vZGVcclxuICAgIHRoaXMuYWN0aXZlTm9kZXMuZm9yRWFjaCgobm9kZSk9PntcclxuICAgICAgICBub2RlLmN1cnJlbnRMYXllckRlcHRoID0gMDtcclxuICAgICAgICBub2RlLnBhcmVudCA9IG51bGw7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgLy8gU3RhcnQgYW5pbWF0aW9uLlxyXG4gICAgdGhpcy50cmFuc2l0aW9uVGltZSA9IDE7XHJcbiAgICAvLyBGaWd1cmUgb3V0IHdoZXJlIGV2ZXJ5dGhpbmcgbmVlZHMgdG8gYmUuXHJcbiAgICB0aGlzLmZvY3VzZWROb2RlLmNhbGN1bGF0ZU5vZGVUcmVlKGV4cGFuZCwgbnVsbCwgMCk7XHJcbiAgICB0aGlzLmZvY3VzZWROb2RlLnNldFRyYW5zaXRpb24oZXhwYW5kLCBudWxsLCAwLCBuZXcgUG9pbnQoMCwgMCkpO1xyXG59O1xyXG5cclxuR3JhcGgucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKG1vdXNlU3RhdGUsIGNhbnZhc1N0YXRlLCB0aW1lKSB7XHJcbiAgICBcclxuICAgIC8vIHVwZGF0ZSB0cmFuc2l0aW9uIHRpbWUgaWYgaXQgbmVlZHMgdG8gYmUgdXBkYXRlZC5cclxuICAgIGlmKHRoaXMudHJhbnNpdGlvblRpbWUgPiAwKSB7XHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uVGltZSAtPSB0aW1lLmRlbHRhVGltZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uVGltZSA9IDA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIEZpbmQgaWYgdGhlIG1vdXNlIGlzIG92ZXIgYW55IG5vZGVzLlxyXG4gICAgdmFyIG1vdXNlT3Zlck5vZGUgPSBudWxsO1xyXG4gICAgdGhpcy5hY3RpdmVOb2Rlcy5mb3JFYWNoKChub2RlKT0+e1xyXG4gICAgICAgIHZhciBpc01haW4gPSAobm9kZSA9PSB0aGlzLmZvY3VzZWROb2RlKTtcclxuICAgICAgICBub2RlLnVwZGF0ZShtb3VzZVN0YXRlLCB0aW1lLCB0aGlzLnRyYW5zaXRpb25UaW1lLCBpc01haW4pO1xyXG4gICAgICAgIGlmKG5vZGUubW91c2VPdmVyKSB7XHJcbiAgICAgICAgICAgIG1vdXNlT3Zlck5vZGUgPSBub2RlO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICBcclxuICAgIC8vIElmIHVzZXIgY2xpY2tzXHJcbiAgICBpZihtb3VzZVN0YXRlLm1vdXNlRG93biAmJiAhbW91c2VTdGF0ZS5sYXN0TW91c2VEb3duKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gZm9jdXMgbm9kZSBpZiBjbGlja2VkXHJcbiAgICAgICAgaWYobW91c2VPdmVyTm9kZSkge1xyXG4gICAgICAgICAgICB0aGlzLkZvY3VzTm9kZShtb3VzZU92ZXJOb2RlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gc2hvdyBkZXRhaWxzIGZvciBub2RlIGlmIGJ1dHRvbiBjbGlja2VkXHJcbiAgICAgICAgaWYodGhpcy5mb2N1c2VkTm9kZS5kZXRhaWxzQnV0dG9uLm1vdXNlT3Zlcikge1xyXG4gICAgICAgICAgICBpZih0aGlzLmRldGFpbHNQYW5lbC5ub2RlID09IG51bGwpICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRldGFpbHNQYW5lbC5lbmFibGUodGhpcy5mb2N1c2VkTm9kZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZvY3VzZWROb2RlLmRldGFpbHNCdXR0b24udGV4dCA9IFwiTGVzc1wiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXRhaWxzUGFuZWwuZGlzYWJsZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5mb2N1c2VkTm9kZS5kZXRhaWxzQnV0dG9uLnRleHQgPSBcIk1vcmVcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyB1c2VyIGNsaWNrcyBvbiBjb21wbGV0aW9uIGJ1dHRvblxyXG4gICAgICAgIGlmKHRoaXMuZm9jdXNlZE5vZGUuY29tcGxldGlvbkJ1dHRvbi5tb3VzZU92ZXIpIHtcclxuICAgICAgICAgICAgaWYodGhpcy5mb2N1c2VkTm9kZS5zdGF0ZSA9PSBUdXRvcmlhbFN0YXRlLlVubG9ja2VkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZvY3VzZWROb2RlLmNoYW5nZVN0YXRlKFR1dG9yaWFsU3RhdGUuQ29tcGxldGVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLmZvY3VzZWROb2RlLnN0YXRlID09IFR1dG9yaWFsU3RhdGUuQ29tcGxldGVkKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiByZXNldHRpbmcsIGFzayBmb3IgY29uZmlybWF0aW9uLlxyXG4gICAgICAgICAgICAgICAgaWYgKGNvbmZpcm0oXCJUaGlzIHdpbGwgcmVzZXQgeW91ciBwcm9ncmVzcyBvbiBhbGwgdHV0b3JpYWxzIGFmdGVyIHRoaXMgb25lLiBBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZG8gdGhpcz9cIikpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZvY3VzZWROb2RlLmNoYW5nZVN0YXRlKFR1dG9yaWFsU3RhdGUuVW5sb2NrZWQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyBVcGRhdGUgdGhlIHNlYXJjaCBwYW5lbCBpZiBpdCdzIG9wZW4uXHJcbiAgICBpZih0aGlzLnNlYXJjaFBhbmVsLm9wZW4gPT0gdHJ1ZSkge1xyXG4gICAgICAgIHRoaXMuc2VhcmNoUGFuZWwudXBkYXRlKGNhbnZhc1N0YXRlLCB0aW1lKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gVXBkYXRlIHRoZSBkZXRhaWxzIHBhbmVsIGlmIGl0J3Mgb3Blbi5cclxuICAgIGlmKHRoaXMuZGV0YWlsc1BhbmVsLm5vZGUgIT0gbnVsbCkge1xyXG4gICAgICAgIHRoaXMuZGV0YWlsc1BhbmVsLnVwZGF0ZShjYW52YXNTdGF0ZSwgdGltZSwgdGhpcy5mb2N1c2VkTm9kZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIFxyXG4gICAgLy8gVHJhbnNpdGlvbiB0aGUgc2lkZSBiYXJzIG9uIGFuZCBvZmYgc21vb3RobHlcclxuICAgIHZhciB0MSA9ICgxIC0gTWF0aC5jb3ModGhpcy5zZWFyY2hQYW5lbC50cmFuc2l0aW9uVGltZSAqIE1hdGguUEkpKS8yO1xyXG4gICAgdmFyIHQyID0gKDEgLSBNYXRoLmNvcyh0aGlzLmRldGFpbHNQYW5lbC50cmFuc2l0aW9uVGltZSAqIE1hdGguUEkpKS8yO1xyXG4gICAgXHJcbiAgICAvLyBDaGFuZ2Ugc3R5bGluZyB0byBjaGFuZ2Ugc2l6ZSBvZiBkaXZzXHJcbiAgICB0aGlzLnNlYXJjaERpdi5zdHlsZS53aWR0aCA9IDMwICogdDEgKyBcInZ3XCI7XHJcbiAgICB0aGlzLmRhdGFEaXYuc3R5bGUud2lkdGggPSAzMCAqIHQyICsgXCJ2d1wiO1xyXG4gICAgdGhpcy5jYW52YXNEaXYuc3R5bGUud2lkdGggPSAxMDAgLSAzMCAqICh0MSArIHQyKSArIFwidndcIjsgICAgXHJcbiAgICBcclxuICAgIHRoaXMuc2VhcmNoUGFuZWxCdXR0b24uc3R5bGUubGVmdCA9IFwiY2FsYyhcIiArIDMwICogdDEgKyBcInZ3ICsgMTJweClcIjtcclxuICAgIFxyXG4gICAgXHJcbiAgICB0aGlzLnNlYXJjaERpdi5zdHlsZS5kaXNwbGF5ID0gKHQxID09IDApID8gXCJub25lXCIgOiBcImJsb2NrXCI7XHJcbiAgICB0aGlzLmRhdGFEaXYuc3R5bGUuZGlzcGxheSA9ICh0MiA9PSAwKSA/IFwibm9uZVwiIDogXCJibG9ja1wiO1xyXG4gICAgXHJcbiAgICBjYW52YXNTdGF0ZS51cGRhdGUoKTtcclxufTtcclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcbkdyYXBoLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY2FudmFzU3RhdGUpIHtcclxuICAgIGNhbnZhc1N0YXRlLmN0eC5zYXZlKCk7XHJcbiAgICBcclxuICAgIC8vdHJhbnNsYXRlIHRvIHRoZSBjZW50ZXIgb2YgdGhlIHNjcmVlblxyXG4gICAgY2FudmFzU3RhdGUuY3R4LnRyYW5zbGF0ZShjYW52YXNTdGF0ZS5jZW50ZXIueCwgY2FudmFzU3RhdGUuY2VudGVyLnkpO1xyXG4gICAgLy9jb25zb2xlLmxvZyhjYW52YXNTdGF0ZS5jZW50ZXIpO1xyXG4gICAgLy9jb25zb2xlLmxvZyhjYW52YXNTdGF0ZSk7XHJcbiAgICAvL2RyYXcgbm9kZXNcclxuICAgIHRoaXMuZm9jdXNlZE5vZGUuZHJhdyhjYW52YXNTdGF0ZSwgdGhpcy5wYWludGVyLCB0aGlzLCBudWxsLCAwLCBleHBhbmQpO1xyXG4gICAgXHJcbiAgICBjYW52YXNTdGF0ZS5jdHgucmVzdG9yZSgpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHcmFwaDsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIFBhcnNlciA9IHJlcXVpcmUoJy4uL2dyYXBoUGhhc2UvUGFyc2VyLmpzJyk7XHJcbnZhciBHcmFwaCA9IHJlcXVpcmUoJy4vR3JhcGguanMnKTtcclxuXHJcbnZhciBncmFwaExvYWRlZDtcclxuXHJcbnZhciBtb3VzZVRhcmdldDtcclxudmFyIGdyYXBoO1xyXG5cclxuZnVuY3Rpb24gR3JhcGhQaGFzZShwVGFyZ2V0VVJMKXtcclxuICAgIC8vaW5pdGlhbGl6ZSBiYXNlIHZhbHVlc1xyXG4gICAgZ3JhcGhMb2FkZWQgPSBmYWxzZTtcclxuICAgIG1vdXNlVGFyZ2V0ID0gMDtcclxuICAgIFxyXG4gICAgXHJcbiAgICAvL3JlcXVlc3QgZ3JhcGggZGF0YSBhbmQgd2FpdCB0byBiZWdpbiBwYXJzaW5nXHJcbiAgICBQYXJzZXIocFRhcmdldFVSTCwgZnVuY3Rpb24ocEpTT05FbGVtZW50cyl7XHJcbiAgICAgICAgZ3JhcGggPSBuZXcgR3JhcGgocEpTT05FbGVtZW50cyk7XHJcbiAgICAgICAgZ3JhcGhMb2FkZWQgPSB0cnVlO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbkdyYXBoUGhhc2UucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKG1vdXNlU3RhdGUsIGNhbnZhc1N0YXRlLCB0aW1lKSB7XHJcbiAgICBpZihncmFwaExvYWRlZCkge1xyXG4gICAgICAgIGdyYXBoLnVwZGF0ZShtb3VzZVN0YXRlLCBjYW52YXNTdGF0ZSwgdGltZSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbkdyYXBoUGhhc2UucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjYW52YXNTdGF0ZSkge1xyXG4gICAgaWYoZ3JhcGhMb2FkZWQpIHtcclxuICAgICAgICBncmFwaC5kcmF3KGNhbnZhc1N0YXRlKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIC8vaWYgd2UgaGF2ZW50IGxvYWRlZCB0aGUgZGF0YSwgZGlzcGxheSBsb2FkaW5nLCBhbmQgd2FpdFxyXG4gICAgICAgIGNhbnZhc1N0YXRlLmN0eC5zYXZlKCk7XHJcbiAgICAgICAgY2FudmFzU3RhdGUuY3R4LmZvbnQgPSBcIjQwcHggQXJpYWxcIjtcclxuICAgICAgICBjYW52YXNTdGF0ZS5jdHguZmlsbFN0eWxlID0gXCIjZmZmXCI7XHJcbiAgICAgICAgY2FudmFzU3RhdGUuY3R4LnRleHRCYXNlbGluZSA9IFwibWlkZGxlXCI7XHJcbiAgICAgICAgY2FudmFzU3RhdGUuY3R4LnRleHRBbGlnbiA9IFwiY2VudGVyXCI7XHJcbiAgICAgICAgY2FudmFzU3RhdGUuY3R4LmZpbGxUZXh0KFwiTG9hZGluZy4uLlwiLCBjYW52YXNTdGF0ZS5jZW50ZXIueCwgY2FudmFzU3RhdGUuY2VudGVyLnkpO1xyXG4gICAgICAgIGNhbnZhc1N0YXRlLmN0eC5yZXN0b3JlKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdyYXBoUGhhc2U7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vUG9pbnQuanMnKTtcclxudmFyIEJ1dHRvbiA9IHJlcXVpcmUoXCIuLi8uLi9jb250YWluZXJzL0J1dHRvbi5qc1wiKTtcclxudmFyIFR1dG9yaWFsTm9kZSA9IHJlcXVpcmUoJy4vVHV0b3JpYWxOb2RlLmpzJyk7XHJcblxyXG52YXIgbGFiZWxDb3JuZXJTaXplID0gNjtcclxuXHJcbnZhciB0aXRsZUZvbnRTaXplID0gMTI7XHJcbnZhciB0aXRsZUZvbnQgPSB0aXRsZUZvbnRTaXplK1wicHggQXJpYWxcIjtcclxuXHJcbnZhciBkZXNjcmlwdG9yRm9udFNpemUgPSAxMjtcclxudmFyIGRlc2NyaXB0b3JGb250ID0gZGVzY3JpcHRvckZvbnRTaXplK1wicHggQXJpYWxcIjtcclxuXHJcbnZhciBsaW5lQnJlYWsgPSA2O1xyXG5cclxuLy9jcmVhdGUgYSBsYWJlbCB0byBwYWlyIHdpdGggYSBub2RlXHJcbmZ1bmN0aW9uIE5vZGVMYWJlbChwVHV0b3JpYWxOb2RlKSB7XHJcbiAgICB0aGlzLm5vZGUgPSBwVHV0b3JpYWxOb2RlO1xyXG4gICAgXHJcbiAgICB0aGlzLnNlcmllcyA9IHRoaXMubm9kZS5kYXRhLnNlcmllcztcclxuICAgIHRoaXMudGl0bGUgPSB0aGlzLm5vZGUuZGF0YS50aXRsZTtcclxuICAgIHRoaXMuZGVzY3JpcHRpb24gPSB0aGlzLm5vZGUuZGF0YS5kZXNjcmlwdGlvbjtcclxuICAgIHRoaXMuZGVzY3JpcHRpb25MaW5lcyA9IG51bGw7XHJcbiAgICBcclxuICAgIHRoaXMucG9zaXRpb24gPSBuZXcgUG9pbnQoXHJcbiAgICAgICAgdGhpcy5ub2RlLnBvc2l0aW9uLngsXHJcbiAgICAgICAgdGhpcy5ub2RlLnBvc2l0aW9uLnkgLSB0aGlzLm5vZGUuc2l6ZSAtIDEwKTtcclxuICAgIFxyXG4gICAgdGhpcy5kaXNwbGF5RnVsbERhdGEgPSBmYWxzZTtcclxufTtcclxuXHJcbk5vZGVMYWJlbC5wcm90b3R5cGUuY2FsY3VsYXRlVGV4dEZpdCA9IGZ1bmN0aW9uKGN0eCwgcFBhaW50ZXIpIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHguZm9udCA9IHRpdGxlRm9udDtcclxuICAgIHZhciBzZXJpZXNTaXplID0gY3R4Lm1lYXN1cmVUZXh0KHRoaXMuc2VyaWVzKTtcclxuICAgIHZhciB0aXRsZVNpemUgPSBjdHgubWVhc3VyZVRleHQodGhpcy50aXRsZSk7XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG5cclxuICAgIHRoaXMuc2l6ZSA9IG5ldyBQb2ludChNYXRoLm1heChzZXJpZXNTaXplLndpZHRoLCB0aXRsZVNpemUud2lkdGgpLCB0aXRsZUZvbnRTaXplICogMik7XHJcbiAgICBcclxuICAgIFxyXG5cclxuICAgIGlmKHRoaXMuZGlzcGxheUZ1bGxEYXRhKSB7XHJcbiAgICAgICAgdGhpcy5zaXplLnggPSBNYXRoLm1heCgyNDAsIE1hdGgubWF4KHNlcmllc1NpemUud2lkdGgsIHRpdGxlU2l6ZS53aWR0aCkpO1xyXG4gICAgICAgIHRoaXMuZGVzY3JpcHRpb25MaW5lcyA9IHBQYWludGVyLnRleHRUb0xpbmVzKGN0eCwgdGhpcy5kZXNjcmlwdGlvbiwgZGVzY3JpcHRvckZvbnQsIHRoaXMuc2l6ZS54KTtcclxuICAgICAgICB0aGlzLnNpemUueSArPSBsaW5lQnJlYWsgKyB0aGlzLmRlc2NyaXB0aW9uTGluZXMubGVuZ3RoICogZGVzY3JpcHRvckZvbnRTaXplO1xyXG4gICAgfVxyXG59O1xyXG5cclxuXHJcblxyXG5Ob2RlTGFiZWwucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChwTW91c2VTdGF0ZSwgdGltZSwgZGlzcGxheUJyaWVmKSB7XHJcbiAgICBcclxuICAgIFxyXG4gICAgLy9kaXJlY3RseSBhYm92ZSBub2RlXHJcbiAgICB0aGlzLmRlc2lyZWRQb3NpdGlvbiA9IG5ldyBQb2ludChcclxuICAgICAgICB0aGlzLm5vZGUucG9zaXRpb24ueCxcclxuICAgICAgICB0aGlzLm5vZGUucG9zaXRpb24ueSAtIHRoaXMubm9kZS5zaXplIC0gMTIgLSBsYWJlbENvcm5lclNpemUpO1xyXG4gICAgXHJcbiAgICBpZih0aGlzLmRlc2lyZWRQb3NpdGlvbi54ICE9IHRoaXMucG9zaXRpb24ueCB8fCB0aGlzLmRlc2lyZWRQb3NpdGlvbi55ICE9IHRoaXMucG9zaXRpb24ueSkge1xyXG4gICAgICAgIC8vbW92ZSB0b3dhcmRzIGRlc2lyZWRQb3NpdGlvblxyXG4gICAgICAgIHZhciBkaWYgPSBuZXcgUG9pbnQoXHJcbiAgICAgICAgICAgIHRoaXMuZGVzaXJlZFBvc2l0aW9uLnggLSB0aGlzLnBvc2l0aW9uLngsXHJcbiAgICAgICAgICAgIHRoaXMuZGVzaXJlZFBvc2l0aW9uLnkgLSB0aGlzLnBvc2l0aW9uLnkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBzcGVlZFNjYWxhciA9IE1hdGguc3FydChkaWYueCAqIGRpZi54ICsgZGlmLnkgKiBkaWYueSkgKiB0aW1lLmRlbHRhVGltZTtcclxuXHJcbiAgICAgICAgdmFyIHZlbG9jaXR5ID0gbmV3IFBvaW50KGRpZi54ICogc3BlZWRTY2FsYXIsIGRpZi55ICogc3BlZWRTY2FsYXIpO1xyXG4gICAgICAgIGlmKHZlbG9jaXR5LnggKiB2ZWxvY2l0eS54IDwgZGlmLnggKiBkaWYueCkge1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnggKz0gdmVsb2NpdHkueDtcclxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi55ICs9IHZlbG9jaXR5Lnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnggPSB0aGlzLmRlc2lyZWRQb3NpdGlvbi54O1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnkgPSB0aGlzLmRlc2lyZWRQb3NpdGlvbi55O1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgXHJcbiAgICAvL2lmIHRoaXMgaXMgdGhlIHByaW1hcnkgbm9kZSwgZGlzcGxheSBkZXNjcmlwdGlvblxyXG4gICAgaWYoZGlzcGxheUJyaWVmKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYodGhpcy5kaXNwbGF5RnVsbERhdGEgPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgdGhpcy5zaXplID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheUZ1bGxEYXRhID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICh0aGlzLmRpc3BsYXlGdWxsRGF0YSA9PSB0cnVlKSB7XHJcbiAgICAgICAgdGhpcy5idXR0b25DbGlja2VkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zaXplID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5kaXNwbGF5RnVsbERhdGEgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIFxyXG59XHJcblxyXG5Ob2RlTGFiZWwucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihwQ2FudmFzU3RhdGUsIHBQYWludGVyKSB7XHJcbiAgICBcclxuICAgIGlmKCF0aGlzLnNpemUpIHtcclxuICAgICAgICB0aGlzLmNhbGN1bGF0ZVRleHRGaXQocENhbnZhc1N0YXRlLmN0eCwgcFBhaW50ZXIpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvL2RyYXcgbGluZSBmcm9tIG5vZGUgdG8gbGFiZWxcclxuICAgIHBDYW52YXNTdGF0ZS5jdHguc2F2ZSgpO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5zdHJva2VTdHlsZSA9IFwiI2ZmZlwiO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5saW5lV2lkdGggPSAyO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5iZWdpblBhdGgoKTtcclxuICAgIFxyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5tb3ZlVG8oXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi54LFxyXG4gICAgICAgIHRoaXMucG9zaXRpb24ueSk7XHJcbiAgICBcclxuICAgIHBDYW52YXNTdGF0ZS5jdHgubGluZVRvKFxyXG4gICAgICAgIHRoaXMubm9kZS5wb3NpdGlvbi54LFxyXG4gICAgICAgIHRoaXMubm9kZS5wb3NpdGlvbi55IC0gdGhpcy5ub2RlLnNpemUpO1xyXG4gICAgXHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LmNsb3NlUGF0aCgpO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5zdHJva2UoKTtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHgucmVzdG9yZSgpO1xyXG4gICAgXHJcbiAgICAvL2RyYXcgbGFiZWxcclxuICAgIHBQYWludGVyLnJvdW5kZWRSZWN0KFxyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHgsXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi54IC0gKHRoaXMuc2l6ZS54IC8gMiksXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi55IC0gdGhpcy5zaXplLnksXHJcbiAgICAgICAgdGhpcy5zaXplLngsXHJcbiAgICAgICAgdGhpcy5zaXplLnksXHJcbiAgICAgICAgbGFiZWxDb3JuZXJTaXplLFxyXG4gICAgICAgIHRydWUsIHRoaXMubm9kZS5jb2xvcixcclxuICAgICAgICB0cnVlLCBcIiNmZmZcIiwgMik7XHJcbiAgICBcclxuICAgIFxyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5zYXZlKCk7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LmZpbGxTdHlsZSA9IFwiI2ZmZlwiO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5mb250ID0gdGl0bGVGb250O1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC50ZXh0QmFzZWxpbmUgPSBcInRvcFwiO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5maWxsVGV4dChcclxuICAgICAgICB0aGlzLnNlcmllcyxcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLngsXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi55IC0gdGhpcy5zaXplLnkpO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5maWxsVGV4dChcclxuICAgICAgICB0aGlzLnRpdGxlLFxyXG4gICAgICAgIHRoaXMucG9zaXRpb24ueCxcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnkgLSB0aGlzLnNpemUueSArIHRpdGxlRm9udFNpemUpO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5yZXN0b3JlKCk7XHJcbiAgICBcclxuICAgIFxyXG4gICAgaWYodGhpcy5kaXNwbGF5RnVsbERhdGEpIHtcclxuICAgICAgICBcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LnNhdmUoKTtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LmZpbGxTdHlsZSA9IFwiI2ZmZlwiO1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHguZm9udCA9IGRlc2NyaXB0b3JGb250O1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHgudGV4dEJhc2VsaW5lID0gXCJ0b3BcIjtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LnRleHRBbGlnbiA9IFwibGVmdFwiO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmRlc2NyaXB0aW9uTGluZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5maWxsVGV4dChcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVzY3JpcHRpb25MaW5lc1tpXSxcclxuICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueCAtIHRoaXMuc2l6ZS54IC8gMixcclxuICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueSAtIHRoaXMuc2l6ZS55ICsgdGl0bGVGb250U2l6ZSAqIDIgKyBsaW5lQnJlYWsgKyBpICogZGVzY3JpcHRvckZvbnRTaXplKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5yZXN0b3JlKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzICA9IE5vZGVMYWJlbDsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbi8vcGFyYW1ldGVyIGlzIGEgcG9pbnQgdGhhdCBkZW5vdGVzIHN0YXJ0aW5nIHBvc2l0aW9uXHJcbmZ1bmN0aW9uIFBhcnNlcihwVGFyZ2V0VVJMLCBjYWxsYmFjayl7XHJcbiAgICB2YXIgSlNPTk9iamVjdDtcclxuICAgIHZhciBsZXNzb25BcnJheSA9IFtdO1xyXG4gICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgSlNPTk9iamVjdCA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCk7XHJcblxyXG4gICAgICAgIC8vcGFzcyBsZXNzb24gZGF0YSBiYWNrXHJcbiAgICAgICAgY2FsbGJhY2soSlNPTk9iamVjdCk7XHJcbiAgICB9XHJcblxyXG4gICAgeGhyLm9wZW4oJ0dFVCcsIHBUYXJnZXRVUkwsIHRydWUpO1xyXG4gICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoXCJJZi1Nb2RpZmllZC1TaW5jZVwiLCBcIlNhdCwgMSBKYW4gMjAxMCAwMDowMDowMCBHTTBUXCIpO1xyXG4gICAgeGhyLnNlbmQoKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQYXJzZXI7IiwiXCJ1c2Ugc3RyaWN0XCJcclxuXHJcbmZ1bmN0aW9uIFNlYXJjaFBhbmVsKGdyYXBoKSB7XHJcbiAgICB0aGlzLmdyYXBoID0gZ3JhcGg7XHJcbiAgICB0aGlzLm9wZW4gPSBmYWxzZTtcclxuICAgIHRoaXMudHJhbnNpdGlvbk9uID0gZmFsc2U7XHJcbiAgICB0aGlzLnRyYW5zaXRpb25UaW1lID0gMDtcclxuICAgIHRoaXMub3B0aW9uc0RpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGVmdEJhclwiKTtcclxuICAgIHRoaXMuc2VhcmNoQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZWFyY2hidXR0b25cIik7XHJcbiAgICBcclxuICAgIFxyXG4gICAgdGhpcy5zZWFyY2hCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uICh0aGF0KSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gQ29sbGVjdCBhbGwgaW5mb3JtYXRpb24gZm9yIHRoZSBxdWVyeVxyXG4gICAgICAgIHZhciBxdWVyeSA9IFtdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIGdldCB0ZXh0IGlucHV0IGlmIHRoZXJlIGlzIGFueVxyXG4gICAgICAgIHZhciBwYXJhbTEgPSB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwiVGV4dFwiLFxyXG4gICAgICAgICAgICB2YWx1ZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZWFyY2h0ZXh0ZmllbGRcIikudmFsdWVcclxuICAgICAgICB9O1xyXG4gICAgICAgIGlmKHBhcmFtMS52YWx1ZSAhPSBcIlwiKSB7XHJcbiAgICAgICAgICAgIHF1ZXJ5LnB1c2gocGFyYW0xKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gZ2V0IGxhbmd1YWdlIGlucHV0IGlmIHRoZXJlIGlzIGFueVxyXG4gICAgICAgIHZhciBwYXJhbTIgPSB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwiTGFuZ3VhZ2VcIixcclxuICAgICAgICAgICAgdmFsdWU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2VhcmNobGFuZ3VhZ2VmaWVsZFwiKS52YWx1ZVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYocGFyYW0yLnZhbHVlICE9IFwiQW55XCIpIHtcclxuICAgICAgICAgICAgcXVlcnkucHVzaChwYXJhbTIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyBnZXQgdGFncyBpbnB1dCBpZiB0aGVyZSBpcyBhbnlcclxuICAgICAgICB2YXIgcGFyYW0zID0ge1xyXG4gICAgICAgICAgICB0eXBlOiBcIlRhZ1wiLFxyXG4gICAgICAgICAgICB2YWx1ZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZWFyY2h0YWdmaWVsZFwiKS52YWx1ZVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYocGFyYW0zLnZhbHVlICE9IFwiQW55XCIpIHtcclxuICAgICAgICAgICAgcXVlcnkucHVzaChwYXJhbTMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICAvL3BhcnNlIGRhdGEgdG8gZmluZCBtYXRjaGluZyByZXN1bHRzXHJcbiAgICAgICAgdmFyIHNlYXJjaFJlc3VsdHMgPSB0aGF0LnNlYXJjaChxdWVyeSwgdGhhdC5ncmFwaC5ub2Rlcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9kaXNwbGF5IHJlc3VsdHNcclxuICAgICAgICB2YXIgbGlzdEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlYXJjaHJlc3VsdHNcIik7XHJcbiAgICAgICAgaWYoc2VhcmNoUmVzdWx0cy5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICBsaXN0RWxlbWVudC5pbm5lckhUTUwgPSBcIk5vIE1hdGNoaW5nIFJlc3VsdHMgRm91bmQuXCI7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdEVsZW1lbnQuaW5uZXJIVE1MID0gXCJcIjtcclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgc2VhcmNoUmVzdWx0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAvL2NyZWF0ZSBsaXN0IHRhZ1xyXG4gICAgICAgICAgICB2YXIgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7XHJcbiAgICAgICAgICAgIC8vc2V0IHRpdGxlIGFzIHRleHRcclxuICAgICAgICAgICAgbGkuaW5uZXJIVE1MID0gc2VhcmNoUmVzdWx0c1tpXS5kYXRhLnRpdGxlO1xyXG4gICAgICAgICAgICAvL2FkZCBldmVudCB0byBmb2N1cyB0aGUgbm9kZSBpZiBpdHMgY2xpY2tlZFxyXG4gICAgICAgICAgICBsaS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24odGhhdCwgbm9kZSkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5ncmFwaC5Gb2N1c05vZGUobm9kZSk7XHJcbiAgICAgICAgICAgIH0uYmluZChsaSwgdGhhdCwgc2VhcmNoUmVzdWx0c1tpXSkpO1xyXG4gICAgICAgICAgICAvL2FkZCB0aGUgdGFnIHRvIHRoZSBwYWdlXHJcbiAgICAgICAgICAgIGxpc3RFbGVtZW50LmFwcGVuZENoaWxkKGxpKTtcclxuICAgICAgICB9XHJcbiAgICB9LmJpbmQodGhpcy5zZWFyY2hCdXR0b24sIHRoaXMpKTtcclxufTtcclxuXHJcblxyXG5cclxuLy8gVGhpcyBzZWFyY2ggc3VwcG9ydHMgbXVsdGlwbGUgdGFncyBvZiBlYWNoIHR5cGUsIGJ1dCB0aGUgYWN0dWFsIHNlYXJjaCBkb2Vzbid0IHVzZSB0aGF0IGZ1bmN0aW9uYWxpdHkuXHJcbi8vIFNlYXJjaGVzIGJ5IG5hcnJvd2luZyBkb3duIHJlc3VsdHMuIEFueXRoaW5nIHRoYXQgZG9lc24ndCBtYXRjaCBhbGwgMyBjcml0ZXJpYSBmYWlscyB0aGUgdGVzdC5cclxuU2VhcmNoUGFuZWwucHJvdG90eXBlLnNlYXJjaCA9IGZ1bmN0aW9uKHF1ZXJ5LCBub2Rlcykge1xyXG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcclxuICAgIFxyXG4gICAgXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgbm9kZSA9IG5vZGVzW2ldLmRhdGE7XHJcbiAgICAgICAgdmFyIG1hdGNoID0gdHJ1ZTtcclxuICAgICAgICBmb3IodmFyIGogPSAwOyBqIDwgcXVlcnkubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgLy8gVGV4dCBzZWFyY2ggY29tcGFyZXMgYWdhaW5zdCBhbnkgdGV4dCBpbiB0aGUgZGVtb1xyXG4gICAgICAgICAgICAvLyBJZiBpdCBkb2VzbnQgZmluZCB0aGUgc3RyaW5nIGFueXdoZXJlIGl0IGZhaWxzIHRoZSBzZWFyY2ggaW1tZWRpYXRlbHlcclxuICAgICAgICAgICAgaWYocXVlcnlbal0udHlwZSA9PT0gXCJUZXh0XCIpIHtcclxuICAgICAgICAgICAgICAgIGlmKG5vZGUudGl0bGUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHF1ZXJ5W2pdLnZhbHVlLnRvTG93ZXJDYXNlKCkpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKG5vZGUuc2VyaWVzLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihxdWVyeVtqXS52YWx1ZS50b0xvd2VyQ2FzZSgpKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYobm9kZS5kZXNjcmlwdGlvbi50b0xvd2VyQ2FzZSgpLmluZGV4T2YocXVlcnlbal0udmFsdWUudG9Mb3dlckNhc2UoKSkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7IC8vIG5vIG1hdGNoLiBkb24ndCBjb21wYXJlIGFueXRoaW5nIGVsc2UgZm9yIHRoaXMgcmVwby5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBsYW5ndWFnZSBtdXN0IG1hdGNoIHNlbGVjdGVkIGxhbmd1YWdlXHJcbiAgICAgICAgICAgIGVsc2UgaWYocXVlcnlbal0udHlwZSA9PT0gXCJMYW5ndWFnZVwiKSB7XHJcbiAgICAgICAgICAgICAgICBpZihub2RlLmxhbmd1YWdlICE9PSBxdWVyeVtqXS52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1hdGNoID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gdGFnIG11c3QgbWF0Y2ggc2VsZWN0ZWQgdGFnXHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRhZ01hdGNoID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBmb3IodmFyIGsgPSAwOyBrIDwgbm9kZS50YWdzLmxlbmd0aDsgaysrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYobm9kZS50YWdzW2tdID09IHF1ZXJ5W2pdLnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ01hdGNoID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZih0YWdNYXRjaCA9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1hdGNoID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy9pZiB3ZSBwYXNzZWQgYWxsIHRoYXQgY3JhcCwgd2UgaGF2ZSBhIG1hdGNoIVxyXG4gICAgICAgIGlmKG1hdGNoID09PSB0cnVlKSB7IFxyXG4gICAgICAgICAgICByZXN1bHRzLnB1c2gobm9kZXNbaV0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcmV0dXJuIHJlc3VsdHM7XHJcbn07XHJcblxyXG5cclxuU2VhcmNoUGFuZWwucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGNhbnZhc1N0YXRlLCB0aW1lKSB7XHJcbiAgICBcclxuICAgIC8vdHJhbnNpdGlvbiBvblxyXG4gICAgaWYodGhpcy50cmFuc2l0aW9uT24pIHtcclxuICAgICAgICBpZih0aGlzLnRyYW5zaXRpb25UaW1lIDwgMSkge1xyXG4gICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25UaW1lICs9IHRpbWUuZGVsdGFUaW1lICogMztcclxuICAgICAgICAgICAgaWYodGhpcy50cmFuc2l0aW9uVGltZSA+PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAvL2RvbmUgdHJhbnNpdGlvbmluZ1xyXG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9uVGltZSA9IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvL3RyYW5zaXRpb24gb2ZmXHJcbiAgICBlbHNlIHtcclxuICAgICAgICBpZih0aGlzLnRyYW5zaXRpb25UaW1lID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25UaW1lIC09IHRpbWUuZGVsdGFUaW1lICogMztcclxuICAgICAgICAgICAgaWYodGhpcy50cmFuc2l0aW9uVGltZSA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAvL2RvbmUgdHJhbnNpdGlvbmluZ1xyXG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9uVGltZSA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9wZW4gPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTZWFyY2hQYW5lbDsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9Qb2ludC5qcycpO1xyXG52YXIgTm9kZUxhYmVsID0gcmVxdWlyZSgnLi9Ob2RlTGFiZWwuanMnKTtcclxudmFyIEJ1dHRvbiA9IHJlcXVpcmUoJy4uLy4uL2NvbnRhaW5lcnMvQnV0dG9uLmpzJyk7XHJcblxyXG52YXIgaG9yaXpvbnRhbFNwYWNpbmcgPSAxODA7XHJcbnZhciBiYXNlU2l6ZSA9IDI0O1xyXG52YXIgb3BlbmluZ1R1dG9yaWFsTmFtZSA9IFwiQmFzaWMtT3BlbkdMLXdpdGgtR0xGVy1EcmF3aW5nLWEtVHJpYW5nbGVcIjtcclxuXHJcbnZhciBUdXRvcmlhbFN0YXRlID0ge1xyXG4gICAgTG9ja2VkOiAwLFxyXG4gICAgVW5sb2NrZWQ6IDEsXHJcbiAgICBDb21wbGV0ZWQ6IDJcclxufTtcclxuXHJcbnZhciBUdXRvcmlhbFRhZ3MgPSB7XHJcbiAgICBcIkFJXCI6IFwiIzgwNFwiLFxyXG4gICAgXCJBdWRpb1wiOiBcIiMwNDhcIixcclxuICAgIFwiQ29tcHV0ZXIgU2NpZW5jZVwiOiBcIiMxMTFcIixcclxuICAgIFwiQ29yZVwiOiBcIiMzMzNcIixcclxuICAgIFwiR3JhcGhpY3NcIjogXCIjYzBjXCIsXHJcbiAgICBcIklucHV0XCI6IFwiIzg4MFwiLFxyXG4gICAgXCJNYXRoXCI6IFwiIzQ4NFwiLFxyXG4gICAgXCJOZXR3b3JraW5nXCI6IFwiI2M2MFwiLFxyXG4gICAgXCJPcHRpbWl6YXRpb25cIjogXCIjMjgyXCIsXHJcbiAgICBcIlBoeXNpY3NcIjogXCIjMDQ4XCIsXHJcbiAgICBcIlNjcmlwdGluZ1wiOiBcIiMwODhcIixcclxuICAgIFwiU29mdHdhcmVFbmdpbmVlcmluZ1wiOiBcIiM4NDRcIlxyXG59O1xyXG5cclxuXHJcbi8vbWFrZSBhIG5vZGUgd2l0aCBzb21lIGRhdGFcclxuZnVuY3Rpb24gVHV0b3JpYWxOb2RlKEpTT05DaHVuaykge1xyXG4gICAgdGhpcy5kYXRhID0gSlNPTkNodW5rO1xyXG4gICAgdGhpcy5wcmltYXJ5VGFnID0gdGhpcy5kYXRhLnRhZ3NbMF07XHJcbiAgICB0aGlzLmNvbG9yID0gVHV0b3JpYWxUYWdzW3RoaXMucHJpbWFyeVRhZ107XHJcbiAgICBcclxuICAgIFxyXG4gICAgdGhpcy5tb3VzZU92ZXIgPSBmYWxzZTtcclxuICAgIFxyXG4gICAgXHJcbiAgICB0aGlzLnBvc2l0aW9uID0gbmV3IFBvaW50KDAsIDApO1xyXG4gICAgdGhpcy5wcmV2aW91c1Bvc2l0aW9uID0gbmV3IFBvaW50KDAsIDApO1xyXG4gICAgdGhpcy5uZXh0UG9zaXRpb24gPSBuZXcgUG9pbnQoMCwgMCk7XHJcbiAgICBcclxuICAgIHRoaXMuc2l6ZSA9IDI0O1xyXG4gICAgdGhpcy5sYWJlbCA9IG5ldyBOb2RlTGFiZWwodGhpcyk7XHJcbiAgICAgICAgXHJcbiAgICB0aGlzLm5leHROb2RlcyA9IFtdO1xyXG4gICAgdGhpcy5wcmV2aW91c05vZGVzID0gW107XHJcbiAgICBcclxuICAgIC8vIENyZWF0ZSBzdWIgYnV0dG9ucy5cclxuICAgIHRoaXMuZGV0YWlsc0J1dHRvbiA9IG5ldyBCdXR0b24obmV3IFBvaW50KDAsIDApLCBuZXcgUG9pbnQoMTIwLCAyNCksIFwiTW9yZVwiLCB0aGlzLmNvbG9yKTtcclxuICAgIHRoaXMuY29tcGxldGlvbkJ1dHRvbiA9IG5ldyBCdXR0b24obmV3IFBvaW50KDAsIDApLCBuZXcgUG9pbnQoMTIwLCAyNCksIFwiTWFyayBVbmNvbXBsZXRlXCIsIHRoaXMuY29sb3IpO1xyXG4gICAgXHJcbiAgICBcclxuICAgIC8vIFNldCB1cCB0aGUgc3RhdHVzIG9mIHRoZSBub2RlIHRvIG1hdGNoIHRoYXQgc2F2ZWQgaW4gYnJvd3NlciBtZW1vcnkuXHJcbiAgICB0aGlzLnN0YXRlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5kYXRhLm5hbWUpO1xyXG4gICAgaWYodGhpcy5zdGF0ZSA9PSBudWxsIHx8IHRoaXMuc3RhdGUgPT0gVHV0b3JpYWxTdGF0ZS5Mb2NrZWQpIHtcclxuICAgICAgICB0aGlzLmNoYW5nZVN0YXRlKFR1dG9yaWFsU3RhdGUuTG9ja2VkKTtcclxuICAgICAgICBpZih0aGlzLmRhdGEubmFtZSA9PSBvcGVuaW5nVHV0b3JpYWxOYW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlU3RhdGUoVHV0b3JpYWxTdGF0ZS5VbmxvY2tlZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZih0aGlzLnN0YXRlID09IFR1dG9yaWFsU3RhdGUuQ29tcGxldGVkKSB7XHJcbiAgICAgICAgdGhpcy5jb21wbGV0aW9uQnV0dG9uLnRleHQgPSBcIk1hcmsgVW5vbXBsZXRlXCI7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLmNvbXBsZXRpb25CdXR0b24udGV4dCA9IFwiTWFyayBDb21wbGV0ZVwiO1xyXG4gICAgfVxyXG4gICAgXHJcbn07XHJcblxyXG4vLyBDaGFuZ2VzIHRoZSBzdGF0ZSBvZiB0aGlzIG5vZGVcclxuVHV0b3JpYWxOb2RlLnByb3RvdHlwZS5jaGFuZ2VTdGF0ZSA9IGZ1bmN0aW9uKHR1dFN0YXRlKSB7XHJcbiAgICBpZih0aGlzLnN0YXRlICE9IHR1dFN0YXRlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSB0dXRTdGF0ZTtcclxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLmRhdGEubmFtZSwgdGhpcy5zdGF0ZSk7XHJcbiAgICAgICAgaWYodGhpcy5zdGF0ZSA9PSBUdXRvcmlhbFN0YXRlLkNvbXBsZXRlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbXBsZXRpb25CdXR0b24udGV4dCA9IFwiTWFyayBVbmNvbXBsZXRlXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmNvbXBsZXRpb25CdXR0b24udGV4dCA9IFwiTWFyayBDb21wbGV0ZVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvL2NvbnNvbGUubG9nKFwiVXBkYXRlZCBcIiArIHRoaXMuZGF0YS5uYW1lICsgXCIgdG8gXCIgKyB0dXRTdGF0ZSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gYWxzbyB1cGRhdGUgdGhlIHN0YXRlIG9mIGFueSBsYXRlciBub2RlcyB0byByZWZsZWN0IHRoZSBjaGFuZ2VzLlxyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLm5leHROb2Rlcy5sZW5ndGg7IGkrKylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubmV4dE5vZGVzW2ldLnVwZGF0ZVN0YXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5UdXRvcmlhbE5vZGUucHJvdG90eXBlLnVwZGF0ZVN0YXRlID0gZnVuY3Rpb24oKVxyXG57XHJcbiAgICAvLyBMb2NrIGlmIGFueSBwcmV2aW91cyBhcmUgdW5jb21wbGV0ZWRcclxuICAgIHZhciBsb2NrID0gdGhpcy5wcmV2aW91c05vZGVzLnNvbWUoKG5vZGUpPT57XHJcbiAgICAgICAgcmV0dXJuIChub2RlLnN0YXRlICE9IFR1dG9yaWFsU3RhdGUuQ29tcGxldGVkKTtcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICBpZihsb2NrKSB7XHJcbiAgICAgICAgdGhpcy5jaGFuZ2VTdGF0ZShUdXRvcmlhbFN0YXRlLkxvY2tlZCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuY2hhbmdlU3RhdGUoVHV0b3JpYWxTdGF0ZS5VbmxvY2tlZCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vcmVjdXJzaXZlIGZ1bmN0aW9uIHRvIGdldCBwcmV2aW91cyBub2Rlc1xyXG5UdXRvcmlhbE5vZGUucHJvdG90eXBlLmdldFByZXZpb3VzID0gZnVuY3Rpb24oZGVwdGgpIHtcclxuICAgIHZhciByZXN1bHQgPSBbdGhpc107XHJcbiAgICBpZihkZXB0aCA+IDApIHtcclxuICAgICAgICB0aGlzLnByZXZpb3VzTm9kZXMuZm9yRWFjaCgobm9kZSk9PntcclxuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdChub2RlLmdldFByZXZpb3VzKGRlcHRoLTEpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn07XHJcblxyXG5cclxuXHJcbi8vcmVjdXJzaXZlIGZ1bmN0aW9uIHRvIGdldCBuZXh0IG5vZGVzXHJcblR1dG9yaWFsTm9kZS5wcm90b3R5cGUuZ2V0TmV4dCA9IGZ1bmN0aW9uKGRlcHRoKSB7XHJcbiAgICB2YXIgcmVzdWx0ID0gW3RoaXNdO1xyXG4gICAgaWYoZGVwdGggPiAwKSB7XHJcbiAgICAgICAgdGhpcy5uZXh0Tm9kZXMuZm9yRWFjaCgobm9kZSk9PntcclxuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdChub2RlLmdldE5leHQoZGVwdGgtMSkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufTtcclxuXHJcblxyXG4vLyBVcGRhdGVzIGFsbCBub2RlcyBzdGFydGluZyB3aXRoIG9uZSwgYW5kIGV4dGVuZGluZyBvdXR3YXJkLlxyXG4vLyBkaXJlY3Rpb24gaXMgdGhlIHNpZGUgb2YgdGhlIHBhcmVudCB0aGlzIG5vZGUgZXhpc3RzIG9uICgtMSwgMCwgMSkgMCBpcyBib3RoLlxyXG4vLyBsYXllciBkZXB0aCBpcyBob3cgbWFueSBsYXllcnMgdG8gcmVuZGVyIG91dFxyXG5UdXRvcmlhbE5vZGUucHJvdG90eXBlLnJlY3Vyc2l2ZVVwZGF0ZSA9IGZ1bmN0aW9uKGRpcmVjdGlvbiwgZGVwdGgpIHtcclxuICAgIGlmKGRlcHRoID4gMCkge1xyXG4gICAgICAgIC8vIGxlZnQgb3IgbWlkZGxlXHJcbiAgICAgICAgaWYoZGlyZWN0aW9uIDwgMSkge1xyXG4gICAgICAgICAgICB0aGlzLnByZXZpb3VzTm9kZXMuZm9yRWFjaCgobm9kZSk9PntcclxuICAgICAgICAgICAgICAgIG5vZGUucmVjdXJzaXZlVXBkYXRlKC0xLCBkZXB0aCAtIDEpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gcmlnaHQgb3IgbWlkZGxlXHJcbiAgICAgICAgaWYoZGlyZWN0aW9uID4gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5uZXh0Tm9kZXMuZm9yRWFjaCgobm9kZSk9PntcclxuICAgICAgICAgICAgICAgIG5vZGUucmVjdXJzaXZlVXBkYXRlKDEsIGRlcHRoIC0gMSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8vdXBkYXRlcyBhIG5vZGVcclxuLy90cmFuc2l0aW9uIHRpbWUgaXMgMS0wLCB3aXRoIDAgYmVpbmcgdGhlIGZpbmFsIGxvY2F0aW9uXHJcblR1dG9yaWFsTm9kZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24obW91c2VTdGF0ZSwgdGltZSwgdHJhbnNpdGlvblRpbWUsIGlzRm9jdXNlZCkge1xyXG4gICAgXHJcbiAgICAvL21vdmUgdGhlIG5vZGVcclxuICAgIGlmKHRoaXMucG9zaXRpb24gIT0gdGhpcy5uZXh0UG9zaXRpb24pIHtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnggPSAodGhpcy5wcmV2aW91c1Bvc2l0aW9uLnggKiB0cmFuc2l0aW9uVGltZSkgKyAodGhpcy5uZXh0UG9zaXRpb24ueCAqICgxIC0gdHJhbnNpdGlvblRpbWUpKTtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnkgPSAodGhpcy5wcmV2aW91c1Bvc2l0aW9uLnkgKiB0cmFuc2l0aW9uVGltZSkgKyAodGhpcy5uZXh0UG9zaXRpb24ueSAqICgxIC0gdHJhbnNpdGlvblRpbWUpKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYoaXNGb2N1c2VkKSB7XHJcbiAgICAgICAgdGhpcy5zaXplID0gMzY7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICAvL3Rlc3QgaWYgbW91c2UgaXMgaW5zaWRlIGNpcmNsZVxyXG4gICAgICAgIHZhciBkeCA9IG1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbi54IC0gdGhpcy5wb3NpdGlvbi54O1xyXG4gICAgICAgIHZhciBkeSA9IG1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbi55IC0gdGhpcy5wb3NpdGlvbi55O1xyXG4gICAgICAgIGlmKChkeCAqIGR4KSArIChkeSAqIGR5KSA8IHRoaXMuc2l6ZSAqIHRoaXMuc2l6ZSkge1xyXG4gICAgICAgICAgICB0aGlzLnNpemUgPSAzMDtcclxuICAgICAgICAgICAgdGhpcy5tb3VzZU92ZXIgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zaXplID0gMjQ7XHJcbiAgICAgICAgICAgIHRoaXMubW91c2VPdmVyID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBcclxuICAgIFxyXG4gICAgdGhpcy5sYWJlbC51cGRhdGUobW91c2VTdGF0ZSwgdGltZSwgaXNGb2N1c2VkKTtcclxuICAgIFxyXG4gICAgaWYoaXNGb2N1c2VkKSB7XHJcbiAgICAgICAgdGhpcy5kZXRhaWxzQnV0dG9uLnBvc2l0aW9uLnggPSB0aGlzLnBvc2l0aW9uLnggLSB0aGlzLmRldGFpbHNCdXR0b24uc2l6ZS54IC8gMiAtIDM7XHJcbiAgICAgICAgdGhpcy5kZXRhaWxzQnV0dG9uLnBvc2l0aW9uLnkgPSB0aGlzLnBvc2l0aW9uLnkgKyB0aGlzLnNpemUgKyAxMjtcclxuICAgICAgICB0aGlzLmRldGFpbHNCdXR0b24udXBkYXRlKG1vdXNlU3RhdGUpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY29tcGxldGlvbkJ1dHRvbi5wb3NpdGlvbi54ID0gdGhpcy5wb3NpdGlvbi54IC0gdGhpcy5jb21wbGV0aW9uQnV0dG9uLnNpemUueCAvIDIgLSAzO1xyXG4gICAgICAgIHRoaXMuY29tcGxldGlvbkJ1dHRvbi5wb3NpdGlvbi55ID0gdGhpcy5wb3NpdGlvbi55ICsgdGhpcy5zaXplICsgNDg7XHJcbiAgICAgICAgdGhpcy5jb21wbGV0aW9uQnV0dG9uLnVwZGF0ZShtb3VzZVN0YXRlKTtcclxuICAgIH1cclxufTtcclxuXHJcblxyXG5UdXRvcmlhbE5vZGUucHJvdG90eXBlLmNhbGN1bGF0ZU5vZGVUcmVlID0gZnVuY3Rpb24obGF5ZXJEZXB0aCwgcGFyZW50LCBkaXJlY3Rpb24pIHtcclxuICAgIFxyXG4gICAgLy8gSWYgdGhlIG5vZGUgYWxyZWFkeSBleGlzdHMgaW4gdGhlIGdyYXBoIGluIGEgYmV0dGVyIHBsYWNlIHRoYW4gdGhpcyBvbmUsIGRvbnQgdXNlIGl0XHJcbiAgICBpZih0aGlzLmN1cnJlbnRMYXllckRlcHRoID4gbGF5ZXJEZXB0aCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgdGhpcy5jdXJyZW50TGF5ZXJEZXB0aCA9IGxheWVyRGVwdGg7XHJcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcclxuICAgIFxyXG4gICAgaWYobGF5ZXJEZXB0aCA+IDApIHtcclxuICAgICAgICAvLyBsZWZ0IG9yIG1pZGRsZVxyXG4gICAgICAgIGlmKGRpcmVjdGlvbiA8IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5wcmV2aW91c05vZGVzLmZvckVhY2goKG5vZGUpPT57XHJcbiAgICAgICAgICAgICAgICBub2RlLmNhbGN1bGF0ZU5vZGVUcmVlKGxheWVyRGVwdGggLSAxLCB0aGlzLCAtMSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyByaWdodCBvciBtaWRkbGVcclxuICAgICAgICBpZihkaXJlY3Rpb24gPiAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLm5leHROb2Rlcy5mb3JFYWNoKChub2RlKT0+e1xyXG4gICAgICAgICAgICAgICAgbm9kZS5jYWxjdWxhdGVOb2RlVHJlZShsYXllckRlcHRoIC0gMSwgdGhpcywgMSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcblR1dG9yaWFsTm9kZS5wcm90b3R5cGUuc2V0VHJhbnNpdGlvbiA9IGZ1bmN0aW9uKGxheWVyRGVwdGgsIHBhcmVudCwgZGlyZWN0aW9uLCB0YXJnZXRQb3NpdGlvbikge1xyXG4gICAgXHJcbiAgICBpZighdGhpcy53YXNQcmV2aW91c2x5T25TY3JlZW4gJiYgcGFyZW50ICE9IG51bGwpIHtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gbmV3IFBvaW50KHRhcmdldFBvc2l0aW9uLngsIHRhcmdldFBvc2l0aW9uLnkpO1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24ueCAqPSAxLjU7XHJcbiAgICB9XHJcbiAgICB0aGlzLnByZXZpb3VzUG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uO1xyXG4gICAgdGhpcy5uZXh0UG9zaXRpb24gPSB0YXJnZXRQb3NpdGlvbjtcclxuICAgIFxyXG4gICAgLy9maWd1cmUgb3V0IHNpemUgb2YgY2hpbGRyZW4gdG8gc3BhY2UgdGhlbSBvdXQgYXBwcm9wcmlhdGVseVxyXG4gICAgaWYobGF5ZXJEZXB0aCA+IDApIHtcclxuICAgICAgICB2YXIgeFBvc2l0aW9uO1xyXG4gICAgICAgIHZhciB5UG9zaXRpb247XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9sZWZ0IG9yIG1pZGRsZVxyXG4gICAgICAgIGlmKGRpcmVjdGlvbiA8IDEpIHtcclxuICAgICAgICAgICAgdmFyIHRvdGFsTGVmdEhlaWdodCA9IHRoaXMuZ2V0UHJldmlvdXNIZWlnaHQobGF5ZXJEZXB0aCk7XHJcbiAgICAgICAgICAgIHhQb3NpdGlvbiA9IHRhcmdldFBvc2l0aW9uLnggLSBob3Jpem9udGFsU3BhY2luZztcclxuICAgICAgICAgICAgaWYoZGlyZWN0aW9uID09IDApIHhQb3NpdGlvbiAtPSA2MDsgLy8gZmlyc3Qgc3BhY2UgaXMgbGFyZ2VyIHRoYW4gdGhlIG90aGVycy5cclxuICAgICAgICAgICAgeVBvc2l0aW9uID0gdGFyZ2V0UG9zaXRpb24ueSAtICh0b3RhbExlZnRIZWlnaHQgLyAyKTsgICAvLyBjZW50ZXIgbm9kZSB2ZXJ0aWNhbGx5XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLnByZXZpb3VzTm9kZXMuZm9yRWFjaCgobm9kZSk9PntcclxuICAgICAgICAgICAgICAgIGlmKG5vZGUucGFyZW50ID09IHRoaXMpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcGxhY2VtZW50ID0gbmV3IFBvaW50KHhQb3NpdGlvbiwgeVBvc2l0aW9uICsgbm9kZS5jdXJyZW50SGVpZ2h0IC8gMik7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5zZXRUcmFuc2l0aW9uKGxheWVyRGVwdGggLSAxLCB0aGlzLCAtMSwgcGxhY2VtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICB5UG9zaXRpb24gKz0gbm9kZS5jdXJyZW50SGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9yaWdodCBvciBtaWRkbGVcclxuICAgICAgICBpZihkaXJlY3Rpb24gPiAtMSkge1xyXG4gICAgICAgICAgICB2YXIgdG90YWxSaWdodEhlaWdodCA9IHRoaXMuZ2V0TmV4dEhlaWdodChsYXllckRlcHRoKTtcclxuICAgICAgICAgICAgeFBvc2l0aW9uID0gdGFyZ2V0UG9zaXRpb24ueCArIGhvcml6b250YWxTcGFjaW5nO1xyXG4gICAgICAgICAgICBpZihkaXJlY3Rpb24gPT0gMCkgeFBvc2l0aW9uICs9IDYwOyAvLyBmaXJzdCBzcGFjZSBpcyBsYXJnZXIgdGhhbiB0aGUgb3RoZXJzLlxyXG4gICAgICAgICAgICB5UG9zaXRpb24gPSB0YXJnZXRQb3NpdGlvbi55IC0gKHRvdGFsUmlnaHRIZWlnaHQgLyAyKTsgIC8vIGNlbnRlciBub2RlIHZlcnRpY2FsbHkuXHJcblxyXG4gICAgICAgICAgICB0aGlzLm5leHROb2Rlcy5mb3JFYWNoKChub2RlKT0+e1xyXG4gICAgICAgICAgICAgICAgaWYobm9kZS5wYXJlbnQgPT0gdGhpcykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwbGFjZW1lbnQgPSBuZXcgUG9pbnQoeFBvc2l0aW9uLCB5UG9zaXRpb24gKyBub2RlLmN1cnJlbnRIZWlnaHQgLyAyKTtcclxuICAgICAgICAgICAgICAgICAgICBub2RlLnNldFRyYW5zaXRpb24obGF5ZXJEZXB0aCAtIDEsIHRoaXMsIDEsIHBsYWNlbWVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgeVBvc2l0aW9uICs9IG5vZGUuY3VycmVudEhlaWdodDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuVHV0b3JpYWxOb2RlLnByb3RvdHlwZS5nZXRQcmV2aW91c0hlaWdodCA9IGZ1bmN0aW9uKGxheWVyRGVwdGgpIHtcclxuICAgIHRoaXMuY3VycmVudEhlaWdodCA9IDA7XHJcbiAgICBpZihsYXllckRlcHRoID4gMCAmJiB0aGlzLnByZXZpb3VzTm9kZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIHRoaXMucHJldmlvdXNOb2Rlcy5mb3JFYWNoKChub2RlKT0+e1xyXG4gICAgICAgICAgICBpZihub2RlLnBhcmVudCA9PSB0aGlzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRIZWlnaHQgKz0gbm9kZS5nZXRQcmV2aW91c0hlaWdodChsYXllckRlcHRoIC0gMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLmN1cnJlbnRIZWlnaHQgPT0gMCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudEhlaWdodCA9IGJhc2VTaXplICogNTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcmV0dXJuIHRoaXMuY3VycmVudEhlaWdodDtcclxufTtcclxuXHJcblR1dG9yaWFsTm9kZS5wcm90b3R5cGUuZ2V0TmV4dEhlaWdodCA9IGZ1bmN0aW9uKGxheWVyRGVwdGgpIHtcclxuICAgIHRoaXMuY3VycmVudEhlaWdodCA9IDA7XHJcbiAgICBpZihsYXllckRlcHRoID4gMCAmJiB0aGlzLm5leHROb2Rlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgdGhpcy5uZXh0Tm9kZXMuZm9yRWFjaCgobm9kZSk9PntcclxuICAgICAgICAgICAgaWYobm9kZS5wYXJlbnQgPT0gdGhpcykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50SGVpZ2h0ICs9IG5vZGUuZ2V0TmV4dEhlaWdodChsYXllckRlcHRoIC0gMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLmN1cnJlbnRIZWlnaHQgPT0gMCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudEhlaWdodCA9IGJhc2VTaXplICogNTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcmV0dXJuIHRoaXMuY3VycmVudEhlaWdodDtcclxufTtcclxuXHJcblxyXG5UdXRvcmlhbE5vZGUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihwQ2FudmFzU3RhdGUsIHBQYWludGVyLCBncmFwaCwgcGFyZW50Q2FsbGVyLCBkaXJlY3Rpb24sIGxheWVyRGVwdGgpIHtcclxuICAgIC8vZHJhdyBsaW5lIHRvIHBhcmVudCBpZiBwb3NzaWJsZVxyXG4gICAgaWYocGFyZW50Q2FsbGVyICYmIHBhcmVudENhbGxlciA9PSB0aGlzLnBhcmVudCkge1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHguc2F2ZSgpO1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHgubGluZVdpZHRoID0gMjtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LnN0cm9rZVN0eWxlID0gXCIjZmZmXCI7XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICBcclxuICAgICAgICAvL3ZhciBiZXR3ZWVuID0gbmV3IFBvaW50KHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55KTtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4Lm1vdmVUbyh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSk7XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5saW5lVG8ocGFyZW50Q2FsbGVyLnBvc2l0aW9uLngsIHBhcmVudENhbGxlci5wb3NpdGlvbi55KTtcclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LmNsb3NlUGF0aCgpO1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHguc3Ryb2tlKCk7XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5yZXN0b3JlKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIGRyYXcgY2hpbGQgbm9kZXNcclxuICAgIGlmKGxheWVyRGVwdGggPiAwKXtcclxuICAgICAgICAvLyBsZWZ0IGFuZCBtaWRkbGVcclxuICAgICAgICBpZihkaXJlY3Rpb24gPCAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMucHJldmlvdXNOb2Rlcy5mb3JFYWNoKChub2RlKT0+e1xyXG4gICAgICAgICAgICAgICAgbm9kZS5kcmF3KHBDYW52YXNTdGF0ZSwgcFBhaW50ZXIsIGdyYXBoLCB0aGlzLCAtMSwgbGF5ZXJEZXB0aCAtIDEpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gcmlnaHQgYW5kIG1pZGRsZVxyXG4gICAgICAgIGlmKGRpcmVjdGlvbiA+IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMubmV4dE5vZGVzLmZvckVhY2goKG5vZGUpPT57XHJcbiAgICAgICAgICAgICAgICBub2RlLmRyYXcocENhbnZhc1N0YXRlLCBwUGFpbnRlciwgZ3JhcGgsIHRoaXMsIDEsIGxheWVyRGVwdGggLSAxKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyBkcmF3IGNpcmNsZVxyXG4gICAgcFBhaW50ZXIuY2lyY2xlKHBDYW52YXNTdGF0ZS5jdHgsIHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55LCB0aGlzLnNpemUsIHRydWUsIHRoaXMuY29sb3IsIHRydWUsIFwiI2ZmZlwiLCAyKTtcclxuICAgIFxyXG4gICAgLy8gZHJhdyBhIGNoZWNrbWFya1xyXG4gICAgaWYodGhpcy5zdGF0ZSA9PSBUdXRvcmlhbFN0YXRlLkNvbXBsZXRlZCkge1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHguZHJhd0ltYWdlKGdyYXBoLmNoZWNrSW1hZ2UsIHRoaXMucG9zaXRpb24ueCAtIDMyLCB0aGlzLnBvc2l0aW9uLnkgLSAzMik7XHJcbiAgICB9XHJcbiAgICAvLyBkcmF3IGEgbG9ja1xyXG4gICAgaWYodGhpcy5zdGF0ZSA9PSBUdXRvcmlhbFN0YXRlLkxvY2tlZCkge1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHguZHJhd0ltYWdlKGdyYXBoLmxvY2tJbWFnZSwgdGhpcy5wb3NpdGlvbi54IC0gMzIsIHRoaXMucG9zaXRpb24ueSAtIDMyKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gZHJhdyB0aGUgbGFiZWxcclxuICAgIHRoaXMubGFiZWwuZHJhdyhwQ2FudmFzU3RhdGUsIHBQYWludGVyKTtcclxuICAgIGlmKGRpcmVjdGlvbiA9PSAwKSB7XHJcbiAgICAgICAgdGhpcy5kZXRhaWxzQnV0dG9uLmRyYXcocENhbnZhc1N0YXRlLCBwUGFpbnRlcik7XHJcbiAgICAgICAgaWYodGhpcy5zdGF0ZSAhPSBUdXRvcmlhbFN0YXRlLkxvY2tlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbXBsZXRpb25CdXR0b24uZHJhdyhwQ2FudmFzU3RhdGUsIHBQYWludGVyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVHV0b3JpYWxOb2RlOyJdfQ==
