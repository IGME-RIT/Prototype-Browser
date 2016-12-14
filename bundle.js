(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
//imports
var Game = require('./modules/Game.js');
var Point = require('./modules/containers/Point.js');
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



},{"./modules/Game.js":2,"./modules/containers/CanvasState.js":4,"./modules/containers/MouseState.js":5,"./modules/containers/Point.js":6,"./modules/containers/Time.js":7}],2:[function(require,module,exports){
"use strict";
//imported objects
var Graph = require('./graph/Graph.js');
var DrawLib = require('./tools/Drawlib.js');
var Utilities = require('./tools/Utilities.js');
var Parser = require('./graph/Parser.js');

var graph;
var painter;
var utility;
var mouseState;
var mouseTarget;
var graphLoaded;

function Game(){    
    painter = new DrawLib();
    utility = new Utilities();
    
    graphLoaded = false;
    mouseTarget = 0;
    
    //instantiate the graph
    Parser("https://atlas-backend.herokuapp.com/repos", (pJSONData)=> {
        graph = new Graph(pJSONData);
        graphLoaded = true;
    });
    
    //give mouseState a value from the start so it doesn't pass undefined to previous
    mouseState = 0;
}

//passing context, canvas, delta time, center point, mouse state
Game.prototype.update = function(mouseState, canvasState, time) {
    
    if(graphLoaded) {
        //update key variables in the active phase
        graph.update(mouseState, canvasState, time);
    }
    
    //draw background and then graph
    canvasState.ctx.save();
    painter.rect(canvasState.ctx, 0, 0, canvasState.width, canvasState.height, "#222");
    canvasState.ctx.restore();
    
    
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
    
}

module.exports = Game;
},{"./graph/Graph.js":10,"./graph/Parser.js":12,"./tools/Drawlib.js":15,"./tools/Utilities.js":16}],3:[function(require,module,exports){
"use strict";

var Point = require('./Point.js');

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
},{"./Point.js":6}],4:[function(require,module,exports){
//Contains canvas related variables in a single easy-to-pass object
"use strict";
var Point = require('./Point.js');


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
},{"./Point.js":6}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
"use strict";
function Point(pX, pY){
    this.x = pX;
    this.y = pY;
};

module.exports = Point;
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
},{"./graph/Graph.js":10,"./graph/Parser.js":12,"./tools/Drawlib.js":15,"./tools/Utilities.js":16,"dup":2}],9:[function(require,module,exports){
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
    html += "<a href=" + this.data.link + " target='_blank' ><img src=https://raw.githubusercontent.com/IGME-RIT/" + this.data.name +
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
},{}],10:[function(require,module,exports){
"use strict";
var DrawLib = require('../tools/Drawlib.js');
var SearchPanel = require('./SearchPanel.js');
var DetailsPanel = require('./DetailsPanel.js');
var TutorialNode = require('./TutorialNode.js');
var Point = require('../containers/Point.js');

var graphLoaded;
var mouseTarget;


var graphDepthLimit = 2; // how many values to expand to
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
        else if(data.name == data.series) {
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
        node.fetchState();
    });

    
    
    // Start by focusing the intro node:
    this.transitionTime = 0;
    var first = this.nodes.find((currentNode)=>{
        return currentNode.data.link == "https://github.com/IGME-RIT/Welcome-to-Atlas";
    });
    this.FocusNode(first);


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
    var previousNodes = this.focusedNode.getPrevious(graphDepthLimit);
    newNodes = newNodes.concat(previousNodes);
    
    var nextNodes = this.focusedNode.getNext(graphDepthLimit);
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
    this.focusedNode.calculateNodeTree(graphDepthLimit, null, 0);
    this.focusedNode.setTransition(graphDepthLimit, null, 0, new Point(0, 0));
};

Graph.prototype.update = function(mouseState, canvasState, time) {
    
    // update transition time if it needs to be updated.
    if(this.transitionTime > 0) {
        this.transitionTime -= time.deltaTime;
    } else {
        this.transitionTime = 0;
    }
    
    // Loop over and update active nodes
    var mouseOverNode = null;
    this.activeNodes.forEach((node)=>{
        var isMain = (node == this.focusedNode);
        node.update(mouseState, time, this.transitionTime, isMain);
        
        // Also check if the mouse is over that node.
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
            else if (this.focusedNode.state == TutorialState.Locked) {
                if (confirm("Skip ahead? This won't automatically complete anything previous to this.")) {
                    this.focusedNode.changeState(TutorialState.Completed);
                }
            }
            else if (this.focusedNode.state == TutorialState.Completed) {
                // If resetting, ask for confirmation.
                if (confirm("This will reset any progress past this point. Are you sure you want to do this?")) {
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
    
    //draw nodes
    this.focusedNode.draw(canvasState, this.painter, this, null, 0, graphDepthLimit);

    canvasState.ctx.restore();
};

module.exports = Graph;
},{"../containers/Point.js":6,"../tools/Drawlib.js":15,"./DetailsPanel.js":9,"./SearchPanel.js":13,"./TutorialNode.js":14}],11:[function(require,module,exports){
"use strict";

var Point = require('../containers/Point.js');
var Button = require("../containers/Button.js");
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
},{"../containers/Button.js":3,"../containers/Point.js":6,"./TutorialNode.js":14}],12:[function(require,module,exports){
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
},{}],13:[function(require,module,exports){
"use strict"

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

function SearchPanel(graph) {
    this.graph = graph;
    this.open = false;
    this.transitionOn = false;
    this.transitionTime = 0;
    this.optionsDiv = document.getElementById("leftBar");
    this.searchButton = document.getElementById("searchbutton");
    
    // create a search event to be triggered by clicking the search button
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
        var listElementUnlocked = document.getElementById("searchresultsUnlocked");
        var listElementLocked = document.getElementById("searchresultsLocked");
        var listElementCompleted = document.getElementById("searchresultsCompleted");
        
        listElementUnlocked.innerHTML = "";
        listElementLocked.innerHTML = "";
        listElementCompleted.innerHTML = "";
        
        if(searchResults.length == 0) {
            listElementLocked.innerHTML = "No Matching Results Found.";
            return;
        }
        
        
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
            if(searchResults[i].state == TutorialState.Unlocked) {
                listElementUnlocked.appendChild(li);
            } else if (searchResults[i].state == TutorialState.Locked){
                listElementLocked.appendChild(li);
            } else {
                li.innerHTML += " (complete)";
                listElementCompleted.appendChild(li);
            }
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
},{}],14:[function(require,module,exports){
"use strict";

var Point = require('../containers/Point.js');
var NodeLabel = require('./NodeLabel.js');
var Button = require('../containers/Button.js');

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
    this.completionButton = new Button(new Point(0, 0), new Point(120, 24), "", this.color);
};


// Set up the status of the node to match that saved in browser memory.
TutorialNode.prototype.fetchState = function() {
    
    this.state = localStorage.getItem(this.data.name);
    if(this.state == null || this.state == TutorialState.Locked) {
        this.state = TutorialState.Locked;
        
        // Default to unlocked if there are no previous nodes.
        if(this.previousNodes.length == 0) {
            this.state = TutorialState.Unlocked;
        }
    }
}

// Changes the state of this node
TutorialNode.prototype.changeState = function(tutState) {
    if(this.state == TutorialState.Locked) {
        if(tutState == TutorialState.Unlocked) {
            this.state = tutState;
            localStorage.setItem(this.data.name, this.state);
            // Unlock from a locked position doesn't need to change any other nodes.
        }
        else if(tutState == TutorialState.Completed) {
            this.state = tutState;
            localStorage.setItem(this.data.name, this.state);
            
            // Complete from a locked position needs to attempt to unlock later things.
            this.nextNodes.forEach((child)=>{
                var shouldBeLocked = child.previousNodes.some((prereq)=>{
                    return (prereq.state != TutorialState.Completed);
                });
                if(!shouldBeLocked) {
                    child.changeState(TutorialState.Unlocked);
                }
            });
        }
    }
    else if(this.state == TutorialState.Unlocked) {
        if(tutState == TutorialState.Locked) {
            this.state = tutState;
            localStorage.setItem(this.data.name, this.state);
            // Locked from unlocked position doesn't affect anything
        }
        else if(tutState == TutorialState.Completed) {
            this.state = tutState;
            localStorage.setItem(this.data.name, this.state);
            
            // completed from unlocked should unlock next things.
            this.nextNodes.forEach((child)=>{
                var shouldBeLocked = child.previousNodes.some((prereq)=>{
                    return (prereq.state != TutorialState.Completed);
                });
                if(!shouldBeLocked && child.state == TutorialState.Locked) {
                    child.changeState(TutorialState.Unlocked);
                }
            });
        }
    }
    else if (this.state == TutorialState.Completed) {
        if(tutState == TutorialState.Locked) {
            this.state = tutState;
            localStorage.setItem(this.data.name, this.state);
            
            // locking something that was completed should lock later things.
            this.nextNodes.forEach((child)=>{
                child.changeState(TutorialState.Locked);
            });
        }
        else if(tutState == TutorialState.Unlocked) {
            this.state = tutState;
            localStorage.setItem(this.data.name, this.state);
            // unlocking something that was completed should lock later things.
            this.nextNodes.forEach((child)=>{
                child.changeState(TutorialState.Locked);
            });
            // also if this thing doesn't have it's prereqs met, it should go straight to being locked
            var shouldBeLocked = this.previousNodes.some((prereq)=>{
                return (prereq.state != TutorialState.Completed);
            });
            if(shouldBeLocked) {
                this.state = TutorialState.Locked;
                localStorage.setItem(this.data.name, this.state);
            }
        }
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
    
        if(this.state == TutorialState.Completed) {
            this.completionButton.text = "Mark Uncomplete";
        }
        else {
            this.completionButton.text = "Mark Complete";
        }
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
            xPosition = targetPosition.x - horizontalSpacing;   // calculate the x position for next nodes
            if(direction == 0) xPosition -= 60;                 // based on offset from parent node.
                                                                // first space is larger than the others.
            
            // determine height of this and all child nodes
            var totalLeftHeight = this.getPreviousHeight(layerDepth);
            yPosition = targetPosition.y - (totalLeftHeight / 2);   // center vertically
            
            // Loop over children and set them up as well. (if they are children of this node)
            this.previousNodes.forEach((node)=>{
                if(node.parent == this) {
                    var placement = new Point(xPosition, yPosition + node.currentHeight / 2);
                    node.setTransition(layerDepth - 1, this, -1, placement);
                    yPosition += node.currentHeight;    // Increment y position of node each time to space them out correctly.
                }
            });
        }
        
        //right or middle
        if(direction > -1) {
            xPosition = targetPosition.x + horizontalSpacing;   // calculate the x position for next nodes
            if(direction == 0) xPosition += 60;                 // based on offset from parent node.
                                                                // first space is larger than the others.
            
            // Determine height of this and all child nodes.
            var totalRightHeight = this.getNextHeight(layerDepth);
            yPosition = targetPosition.y - (totalRightHeight / 2);  // center vertically.

            // Loop over children and set them up as well. (if they are children of this node)
            this.nextNodes.forEach((node)=>{
                if(node.parent == this) {
                    var placement = new Point(xPosition, yPosition + node.currentHeight / 2);
                    node.setTransition(layerDepth - 1, this, 1, placement);
                    yPosition += node.currentHeight;    // Increment y position of node each time to space them out correctly.
                }
            });
        }
    }
};

// Calculates the total height of this node and all child nodes to the left recursively
TutorialNode.prototype.getPreviousHeight = function(layerDepth) {
    this.currentHeight = 0;
    if(layerDepth > 0 && this.previousNodes.length > 0) {
        this.previousNodes.forEach((node)=>{
            if(node.parent == this) {
                this.currentHeight += node.getPreviousHeight(layerDepth - 1);
            }
        });
    }
    if(this.currentHeight == 0) {
        this.currentHeight = baseSize * 5;  // end case for single nodes
    }
    
    return this.currentHeight;
};

// Calculates the total height of this node and all child nodes to the right recursively
TutorialNode.prototype.getNextHeight = function(layerDepth) {
    
    // Count up size of all child nodes
    this.currentHeight = 0;
    if(layerDepth > 0 && this.nextNodes.length > 0) {
        this.nextNodes.forEach((node)=>{
            if(node.parent == this) {
                this.currentHeight += node.getNextHeight(layerDepth - 1);
            }
        });
    }
    if(this.currentHeight == 0) {
        this.currentHeight = baseSize * 5;  // end case for single nodes
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
        this.completionButton.draw(pCanvasState, pPainter);
    }
};



module.exports = TutorialNode;
},{"../containers/Button.js":3,"../containers/Point.js":6,"./NodeLabel.js":11}],15:[function(require,module,exports){
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
},{}],16:[function(require,module,exports){
"use strict";
var Point = require('../containers/Point.js');

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
},{"../containers/Point.js":6}]},{},[1,3,4,5,6,7,8,9,10,11,12,13,14,15,16])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9tYWluLmpzIiwianMvbW9kdWxlcy9HYW1lLmpzIiwianMvbW9kdWxlcy9jb250YWluZXJzL0J1dHRvbi5qcyIsImpzL21vZHVsZXMvY29udGFpbmVycy9DYW52YXNTdGF0ZS5qcyIsImpzL21vZHVsZXMvY29udGFpbmVycy9Nb3VzZVN0YXRlLmpzIiwianMvbW9kdWxlcy9jb250YWluZXJzL1BvaW50LmpzIiwianMvbW9kdWxlcy9jb250YWluZXJzL1RpbWUuanMiLCJqcy9tb2R1bGVzL2dyYXBoL0RldGFpbHNQYW5lbC5qcyIsImpzL21vZHVsZXMvZ3JhcGgvR3JhcGguanMiLCJqcy9tb2R1bGVzL2dyYXBoL05vZGVMYWJlbC5qcyIsImpzL21vZHVsZXMvZ3JhcGgvUGFyc2VyLmpzIiwianMvbW9kdWxlcy9ncmFwaC9TZWFyY2hQYW5lbC5qcyIsImpzL21vZHVsZXMvZ3JhcGgvVHV0b3JpYWxOb2RlLmpzIiwianMvbW9kdWxlcy90b29scy9EcmF3bGliLmpzIiwianMvbW9kdWxlcy90b29scy9VdGlsaXRpZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xyXG4vL2ltcG9ydHNcclxudmFyIEdhbWUgPSByZXF1aXJlKCcuL21vZHVsZXMvR2FtZS5qcycpO1xyXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuL21vZHVsZXMvY29udGFpbmVycy9Qb2ludC5qcycpO1xyXG52YXIgVGltZSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9jb250YWluZXJzL1RpbWUuanMnKTtcclxudmFyIE1vdXNlU3RhdGUgPSByZXF1aXJlKCcuL21vZHVsZXMvY29udGFpbmVycy9Nb3VzZVN0YXRlLmpzJyk7XHJcbnZhciBDYW52YXNTdGF0ZSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9jb250YWluZXJzL0NhbnZhc1N0YXRlLmpzJyk7XHJcblxyXG4vL2dhbWUgb2JqZWN0c1xyXG52YXIgZ2FtZTtcclxudmFyIGNhbnZhcztcclxudmFyIGN0eDtcclxudmFyIHRpbWU7XHJcblxyXG4vL3Jlc3BvbnNpdmVuZXNzXHJcbnZhciBoZWFkZXI7XHJcbnZhciBjZW50ZXI7XHJcbnZhciBzY2FsZTtcclxuXHJcbi8vbW91c2UgaGFuZGxpbmdcclxudmFyIG1vdXNlUG9zaXRpb247XHJcbnZhciByZWxhdGl2ZU1vdXNlUG9zaXRpb247XHJcbnZhciBtb3VzZURvd247XHJcbnZhciBtb3VzZUluO1xyXG52YXIgd2hlZWxEZWx0YTtcclxuXHJcbi8vcGFzc2FibGUgc3RhdGVzXHJcbnZhciBtb3VzZVN0YXRlO1xyXG52YXIgY2FudmFzU3RhdGU7XHJcblxyXG4vL2ZpcmVzIHdoZW4gdGhlIHdpbmRvdyBsb2Fkc1xyXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24oZSl7XHJcbiAgICAvL2RlYnVnIGJ1dHRvbiBkZXNpZ25lZCB0byBjbGVhciBwcm9ncmVzcyBkYXRhXHJcbiAgICBcclxuICAgIC8vdmFyaWFibGUgYW5kIGxvb3AgaW5pdGlhbGl6YXRpb25cclxuICAgIGluaXRpYWxpemVWYXJpYWJsZXMoKTtcclxuICAgIGxvb3AoKTtcclxufVxyXG5cclxuLy9pbml0aWFsaXphdGlvbiBmb3IgdmFyaWFibGVzLCBtb3VzZSBldmVudHMsIGFuZCBnYW1lIFwiY2xhc3NcIlxyXG5mdW5jdGlvbiBpbml0aWFsaXplVmFyaWFibGVzKCl7XHJcbiAgICAvL2NhbXZhcyBpbml0aWFsaXphdGlvblxyXG4gICAgY2FudmFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignY2FudmFzJyk7XHJcbiAgICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgIFxyXG4gICAgdGltZSA9IG5ldyBUaW1lKCk7XHJcbiAgICBcclxuICAgIFxyXG4gICAgLy9tb3VzZSB2YXJpYWJsZSBpbml0aWFsaXphdGlvblxyXG4gICAgbW91c2VQb3NpdGlvbiA9IG5ldyBQb2ludCgwLDApO1xyXG4gICAgcmVsYXRpdmVNb3VzZVBvc2l0aW9uID0gbmV3IFBvaW50KDAsMCk7XHJcbiAgICBcclxuICAgIFxyXG4gICAgXHJcbiAgICBcclxuICAgIFxyXG4gICAgLy9ldmVudCBsaXN0ZW5lcnMgZm9yIG1vdXNlIGludGVyYWN0aW9ucyB3aXRoIHRoZSBjYW52YXNcclxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICB2YXIgYm91bmRSZWN0ID0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIG1vdXNlUG9zaXRpb24gPSBuZXcgUG9pbnQoZS5jbGllbnRYIC0gYm91bmRSZWN0LmxlZnQsIGUuY2xpZW50WSAtIGJvdW5kUmVjdC50b3ApO1xyXG4gICAgICAgIHJlbGF0aXZlTW91c2VQb3NpdGlvbiA9IG5ldyBQb2ludChtb3VzZVBvc2l0aW9uLnggLSBjYW52YXMub2Zmc2V0V2lkdGggLyAyLCBtb3VzZVBvc2l0aW9uLnkgLSBjYW52YXMub2Zmc2V0SGVpZ2h0IC8gMik7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgbW91c2VEb3duID0gZmFsc2U7XHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBmdW5jdGlvbihlKXtcclxuICAgICAgICBtb3VzZURvd24gPSB0cnVlO1xyXG4gICAgfSk7XHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgbW91c2VEb3duID0gZmFsc2U7XHJcbiAgICB9KTtcclxuICAgIG1vdXNlSW4gPSBmYWxzZTtcclxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VvdmVyXCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIG1vdXNlSW4gPSB0cnVlO1xyXG4gICAgfSk7XHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3V0XCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIG1vdXNlSW4gPSBmYWxzZTtcclxuICAgICAgICBtb3VzZURvd24gPSBmYWxzZTtcclxuICAgIH0pO1xyXG4gICAgd2hlZWxEZWx0YSA9IDA7XHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNld2hlZWxcIiwgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgd2hlZWxEZWx0YSA9IGUud2hlZWxEZWx0YTtcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICBcclxuICAgIFxyXG4gICAgXHJcbiAgICAvL3N0YXRlIHZhcmlhYmxlIGluaXRpYWxpemF0aW9uXHJcbiAgICBtb3VzZVN0YXRlID0gbmV3IE1vdXNlU3RhdGUobW91c2VQb3NpdGlvbiwgcmVsYXRpdmVNb3VzZVBvc2l0aW9uLCBtb3VzZURvd24sIG1vdXNlSW4sIHdoZWVsRGVsdGEpO1xyXG4gICAgY2FudmFzU3RhdGUgPSBuZXcgQ2FudmFzU3RhdGUoY2FudmFzLCBjdHgpO1xyXG4gICAgXHJcbiAgICAvL2xvY2FsIHN0b3JhZ2UgaGFuZGxpbmcgZm9yIGFjdGl2ZSBub2RlIHJlY29yZCBhbmQgcHJvZ3Jlc3NcclxuICAgIGlmKGxvY2FsU3RvcmFnZS5hY3RpdmVOb2RlID09PSB1bmRlZmluZWQpe1xyXG4gICAgICAgIGxvY2FsU3RvcmFnZS5hY3RpdmVOb2RlID0gMDtcclxuICAgIH1cclxuICAgIGlmKGxvY2FsU3RvcmFnZS5wcm9ncmVzcyA9PT0gdW5kZWZpbmVkKXtcclxuICAgICAgICBsb2NhbFN0b3JhZ2UucHJvZ3Jlc3MgPSBcIlwiO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvL2NyZWF0ZXMgdGhlIGdhbWUgb2JqZWN0IGZyb20gd2hpY2ggbW9zdCBpbnRlcmFjdGlvbiBpcyBtYW5hZ2VkXHJcbiAgICBnYW1lID0gbmV3IEdhbWUoKTtcclxufVxyXG5cclxuLy9maXJlcyBvbmNlIHBlciBmcmFtZVxyXG5mdW5jdGlvbiBsb29wKCkge1xyXG4gICAgLy9iaW5kcyBsb29wIHRvIGZyYW1lc1xyXG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShsb29wLmJpbmQodGhpcykpO1xyXG4gICAgXHJcbiAgICB0aW1lLnVwZGF0ZSguMDE2Nyk7XHJcbiAgICBcclxuICAgIC8vZmVlZCBjdXJyZW50IG1vdXNlIHZhcmlhYmxlcyBiYWNrIGludG8gbW91c2Ugc3RhdGVcclxuICAgIG1vdXNlU3RhdGUudXBkYXRlKG1vdXNlUG9zaXRpb24sIHJlbGF0aXZlTW91c2VQb3NpdGlvbiwgbW91c2VEb3duLCBtb3VzZUluLCB3aGVlbERlbHRhKTtcclxuICAgIC8vcmVzZXR0aW5nIHdoZWVsIGRlbHRhXHJcbiAgICB3aGVlbERlbHRhID0gMDtcclxuICAgIFxyXG4gICAgLy91cGRhdGUgZ2FtZSdzIHZhcmlhYmxlczogcGFzc2luZyBjb250ZXh0LCBjYW52YXMsIHRpbWUsIGNlbnRlciBwb2ludCwgdXNhYmxlIGhlaWdodCwgbW91c2Ugc3RhdGVcclxuICAgIFxyXG4gICAgZ2FtZS51cGRhdGUobW91c2VTdGF0ZSwgY2FudmFzU3RhdGUsIHRpbWUpO1xyXG59O1xyXG5cclxuLy9saXN0ZW5zIGZvciBjaGFuZ2VzIGluIHNpemUgb2Ygd2luZG93IGFuZCBhZGp1c3RzIHZhcmlhYmxlcyBhY2NvcmRpbmdseVxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBmdW5jdGlvbihlKXtcclxuICAgIGNhbnZhc1N0YXRlLnVwZGF0ZSgpO1xyXG59KTtcclxuXHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuLy9pbXBvcnRlZCBvYmplY3RzXHJcbnZhciBHcmFwaCA9IHJlcXVpcmUoJy4vZ3JhcGgvR3JhcGguanMnKTtcclxudmFyIERyYXdMaWIgPSByZXF1aXJlKCcuL3Rvb2xzL0RyYXdsaWIuanMnKTtcclxudmFyIFV0aWxpdGllcyA9IHJlcXVpcmUoJy4vdG9vbHMvVXRpbGl0aWVzLmpzJyk7XHJcbnZhciBQYXJzZXIgPSByZXF1aXJlKCcuL2dyYXBoL1BhcnNlci5qcycpO1xyXG5cclxudmFyIGdyYXBoO1xyXG52YXIgcGFpbnRlcjtcclxudmFyIHV0aWxpdHk7XHJcbnZhciBtb3VzZVN0YXRlO1xyXG52YXIgbW91c2VUYXJnZXQ7XHJcbnZhciBncmFwaExvYWRlZDtcclxuXHJcbmZ1bmN0aW9uIEdhbWUoKXsgICAgXHJcbiAgICBwYWludGVyID0gbmV3IERyYXdMaWIoKTtcclxuICAgIHV0aWxpdHkgPSBuZXcgVXRpbGl0aWVzKCk7XHJcbiAgICBcclxuICAgIGdyYXBoTG9hZGVkID0gZmFsc2U7XHJcbiAgICBtb3VzZVRhcmdldCA9IDA7XHJcbiAgICBcclxuICAgIC8vaW5zdGFudGlhdGUgdGhlIGdyYXBoXHJcbiAgICBQYXJzZXIoXCJodHRwczovL2F0bGFzLWJhY2tlbmQuaGVyb2t1YXBwLmNvbS9yZXBvc1wiLCAocEpTT05EYXRhKT0+IHtcclxuICAgICAgICBncmFwaCA9IG5ldyBHcmFwaChwSlNPTkRhdGEpO1xyXG4gICAgICAgIGdyYXBoTG9hZGVkID0gdHJ1ZTtcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICAvL2dpdmUgbW91c2VTdGF0ZSBhIHZhbHVlIGZyb20gdGhlIHN0YXJ0IHNvIGl0IGRvZXNuJ3QgcGFzcyB1bmRlZmluZWQgdG8gcHJldmlvdXNcclxuICAgIG1vdXNlU3RhdGUgPSAwO1xyXG59XHJcblxyXG4vL3Bhc3NpbmcgY29udGV4dCwgY2FudmFzLCBkZWx0YSB0aW1lLCBjZW50ZXIgcG9pbnQsIG1vdXNlIHN0YXRlXHJcbkdhbWUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKG1vdXNlU3RhdGUsIGNhbnZhc1N0YXRlLCB0aW1lKSB7XHJcbiAgICBcclxuICAgIGlmKGdyYXBoTG9hZGVkKSB7XHJcbiAgICAgICAgLy91cGRhdGUga2V5IHZhcmlhYmxlcyBpbiB0aGUgYWN0aXZlIHBoYXNlXHJcbiAgICAgICAgZ3JhcGgudXBkYXRlKG1vdXNlU3RhdGUsIGNhbnZhc1N0YXRlLCB0aW1lKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy9kcmF3IGJhY2tncm91bmQgYW5kIHRoZW4gZ3JhcGhcclxuICAgIGNhbnZhc1N0YXRlLmN0eC5zYXZlKCk7XHJcbiAgICBwYWludGVyLnJlY3QoY2FudmFzU3RhdGUuY3R4LCAwLCAwLCBjYW52YXNTdGF0ZS53aWR0aCwgY2FudmFzU3RhdGUuaGVpZ2h0LCBcIiMyMjJcIik7XHJcbiAgICBjYW52YXNTdGF0ZS5jdHgucmVzdG9yZSgpO1xyXG4gICAgXHJcbiAgICBcclxuICAgIGlmKGdyYXBoTG9hZGVkKSB7XHJcbiAgICAgICAgZ3JhcGguZHJhdyhjYW52YXNTdGF0ZSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICAvL2lmIHdlIGhhdmVudCBsb2FkZWQgdGhlIGRhdGEsIGRpc3BsYXkgbG9hZGluZywgYW5kIHdhaXRcclxuICAgICAgICBjYW52YXNTdGF0ZS5jdHguc2F2ZSgpO1xyXG4gICAgICAgIGNhbnZhc1N0YXRlLmN0eC5mb250ID0gXCI0MHB4IEFyaWFsXCI7XHJcbiAgICAgICAgY2FudmFzU3RhdGUuY3R4LmZpbGxTdHlsZSA9IFwiI2ZmZlwiO1xyXG4gICAgICAgIGNhbnZhc1N0YXRlLmN0eC50ZXh0QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xyXG4gICAgICAgIGNhbnZhc1N0YXRlLmN0eC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xyXG4gICAgICAgIGNhbnZhc1N0YXRlLmN0eC5maWxsVGV4dChcIkxvYWRpbmcuLi5cIiwgY2FudmFzU3RhdGUuY2VudGVyLngsIGNhbnZhc1N0YXRlLmNlbnRlci55KTtcclxuICAgICAgICBjYW52YXNTdGF0ZS5jdHgucmVzdG9yZSgpO1xyXG4gICAgfVxyXG4gICAgXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4vUG9pbnQuanMnKTtcclxuXHJcbmZ1bmN0aW9uIEJ1dHRvbihwb3NpdGlvbiwgc2l6ZSwgdGV4dCwgY29sb3IpIHtcclxuICAgIHRoaXMucG9zaXRpb24gPSBuZXcgUG9pbnQocG9zaXRpb24ueCwgcG9zaXRpb24ueSk7XHJcbiAgICB0aGlzLnNpemUgPSBuZXcgUG9pbnQoc2l6ZS54LCBzaXplLnkpO1xyXG4gICAgdGhpcy50ZXh0ID0gdGV4dDtcclxuICAgIHRoaXMubW91c2VPdmVyID0gZmFsc2U7XHJcbiAgICB0aGlzLmNvbG9yID0gY29sb3I7XHJcbiAgICB0aGlzLm91dGxpbmVXaWR0aCA9IDE7XHJcbn07XHJcblxyXG4vL3VwZGF0ZXMgYnV0dG9uLCByZXR1cm5zIHRydWUgaWYgY2xpY2tlZFxyXG5CdXR0b24ucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKHBNb3VzZVN0YXRlKSB7XHJcbiAgICBcclxuICAgIHZhciBtID0gcE1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbjtcclxuICAgIGlmKCBtLnggPCB0aGlzLnBvc2l0aW9uLnggfHwgbS54ID4gdGhpcy5wb3NpdGlvbi54ICsgdGhpcy5zaXplLnggfHxcclxuICAgICAgICBtLnkgPCB0aGlzLnBvc2l0aW9uLnkgfHwgbS55ID4gdGhpcy5wb3NpdGlvbi55ICsgdGhpcy5zaXplLnkpIHtcclxuICAgICAgICB0aGlzLm1vdXNlT3ZlciA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5tb3VzZU92ZXIgPSB0cnVlO1xyXG4gICAgICAgIGlmKHBNb3VzZVN0YXRlLm1vdXNlRG93biAmJiAhcE1vdXNlU3RhdGUubGFzdE1vdXNlRG93bikge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5CdXR0b24ucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihwQ2FudmFzU3RhdGUsIHBQYWludGVyKSB7XHJcbiAgICAvL2RyYXcgYmFzZSBidXR0b25cclxuICAgIGlmKHRoaXMubW91c2VPdmVyKSB7XHJcbiAgICAgICAgdGhpcy5vdXRsaW5lV2lkdGggPSAyO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5vdXRsaW5lV2lkdGggPSAxO1xyXG4gICAgfVxyXG4gICAgcFBhaW50ZXIucmVjdChwQ2FudmFzU3RhdGUuY3R4LFxyXG4gICAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnggLSB0aGlzLm91dGxpbmVXaWR0aCxcclxuICAgICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi55IC0gdGhpcy5vdXRsaW5lV2lkdGgsXHJcbiAgICAgICAgICAgICAgICAgIHRoaXMuc2l6ZS54ICsgMiAqIHRoaXMub3V0bGluZVdpZHRoLFxyXG4gICAgICAgICAgICAgICAgICB0aGlzLnNpemUueSArIDIgKiB0aGlzLm91dGxpbmVXaWR0aCwgXCIjZmZmXCIpO1xyXG5cclxuICAgIHBQYWludGVyLnJlY3QocENhbnZhc1N0YXRlLmN0eCwgdGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnksIHRoaXMuc2l6ZS54LCB0aGlzLnNpemUueSwgdGhpcy5jb2xvcik7XHJcbiAgICBcclxuICAgIC8vZHJhdyB0ZXh0IG9mIGJ1dHRvblxyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5zYXZlKCk7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LmZvbnQgPSBcIjE0cHggQXJpYWxcIjtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHguZmlsbFN0eWxlID0gXCIjZmZmXCI7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LnRleHRBbGlnbiA9IFwiY2VudGVyXCI7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LnRleHRCYXNlbGluZSA9IFwibWlkZGxlXCI7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LmZpbGxUZXh0KHRoaXMudGV4dCwgdGhpcy5wb3NpdGlvbi54ICsgdGhpcy5zaXplLnggLyAyLCB0aGlzLnBvc2l0aW9uLnkgKyB0aGlzLnNpemUueSAvIDIpO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5yZXN0b3JlKCk7XHJcbiAgICBcclxuICAgIFxyXG59O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQnV0dG9uOyIsIi8vQ29udGFpbnMgY2FudmFzIHJlbGF0ZWQgdmFyaWFibGVzIGluIGEgc2luZ2xlIGVhc3ktdG8tcGFzcyBvYmplY3RcclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4vUG9pbnQuanMnKTtcclxuXHJcblxyXG5mdW5jdGlvbiBDYW52YXNTdGF0ZShjYW52YXMsIGN0eCkge1xyXG4gICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XHJcbiAgICB0aGlzLmN0eCA9IGN0eDtcclxuICAgIHRoaXMudXBkYXRlKCk7XHJcbn1cclxuXHJcbkNhbnZhc1N0YXRlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMud2lkdGggPSB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMuY2FudmFzLm9mZnNldFdpZHRoO1xyXG4gICAgdGhpcy5oZWlnaHQgPSB0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmNhbnZhcy5vZmZzZXRIZWlnaHQ7XHJcbiAgICB0aGlzLmNlbnRlciA9IG5ldyBQb2ludCh0aGlzLmNhbnZhcy53aWR0aCAvIDIsIHRoaXMuY2FudmFzLmhlaWdodCAvIDIpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENhbnZhc1N0YXRlOyIsIi8va2VlcHMgdHJhY2sgb2YgbW91c2UgcmVsYXRlZCB2YXJpYWJsZXMuXHJcbi8vY2FsY3VsYXRlZCBpbiBtYWluIGFuZCBwYXNzZWQgdG8gZ2FtZVxyXG4vL2NvbnRhaW5zIHVwIHN0YXRlXHJcbi8vcG9zaXRpb25cclxuLy9yZWxhdGl2ZSBwb3NpdGlvblxyXG4vL29uIGNhbnZhc1xyXG5cInVzZSBzdHJpY3RcIjtcclxuZnVuY3Rpb24gTW91c2VTdGF0ZShwUG9zaXRpb24sIHBSZWxhdGl2ZVBvc2l0aW9uLCBwTW91c2VEb3duLCBwTW91c2VJbiwgcFdoZWVsRGVsdGEpe1xyXG4gICAgdGhpcy5wb3NpdGlvbiA9IHBQb3NpdGlvbjtcclxuICAgIHRoaXMucmVsYXRpdmVQb3NpdGlvbiA9IHBSZWxhdGl2ZVBvc2l0aW9uO1xyXG4gICAgdGhpcy5tb3VzZURvd24gPSBwTW91c2VEb3duO1xyXG4gICAgdGhpcy5tb3VzZUluID0gcE1vdXNlSW47XHJcbiAgICB0aGlzLndoZWVsRGVsdGEgPSBwV2hlZWxEZWx0YTtcclxuICAgIFxyXG4gICAgLy90cmFja2luZyBwcmV2aW91cyBtb3VzZSBzdGF0ZXNcclxuICAgIHRoaXMubGFzdFBvc2l0aW9uID0gcFBvc2l0aW9uO1xyXG4gICAgdGhpcy5sYXN0UmVsYXRpdmVQb3NpdGlvbiA9IHBSZWxhdGl2ZVBvc2l0aW9uO1xyXG4gICAgdGhpcy5sYXN0TW91c2VEb3duID0gcE1vdXNlRG93bjtcclxuICAgIHRoaXMubGFzdE1vdXNlSW4gPSBwTW91c2VJbjtcclxuICAgIHRoaXMubGFzdFdoZWVsRGVsdGEgPSBwV2hlZWxEZWx0YVxyXG59XHJcblxyXG5Nb3VzZVN0YXRlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihwUG9zaXRpb24sIHBSZWxhdGl2ZVBvc2l0aW9uLCBwTW91c2VEb3duLCBwTW91c2VJbiwgcFdoZWVsRGVsdGEpe1xyXG4gICAgdGhpcy5sYXN0UG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uO1xyXG4gICAgdGhpcy5sYXN0UmVsYXRpdmVQb3NpdGlvbiA9IHRoaXMucmVsYXRpdmVQb3NpdGlvbjtcclxuICAgIHRoaXMubGFzdE1vdXNlRG93biA9IHRoaXMubW91c2VEb3duO1xyXG4gICAgdGhpcy5sYXN0TW91c2VJbiA9IHRoaXMubW91c2VJbjtcclxuICAgIHRoaXMubGFzdFdoZWVsRGVsdGEgPSB0aGlzLndoZWVsRGVsdGE7XHJcbiAgICBcclxuICAgIFxyXG4gICAgdGhpcy5wb3NpdGlvbiA9IHBQb3NpdGlvbjtcclxuICAgIHRoaXMucmVsYXRpdmVQb3NpdGlvbiA9IHBSZWxhdGl2ZVBvc2l0aW9uO1xyXG4gICAgdGhpcy5tb3VzZURvd24gPSBwTW91c2VEb3duO1xyXG4gICAgdGhpcy5tb3VzZUluID0gcE1vdXNlSW47XHJcbiAgICB0aGlzLndoZWVsRGVsdGEgPSBwV2hlZWxEZWx0YTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNb3VzZVN0YXRlOyIsIlwidXNlIHN0cmljdFwiO1xyXG5mdW5jdGlvbiBQb2ludChwWCwgcFkpe1xyXG4gICAgdGhpcy54ID0gcFg7XHJcbiAgICB0aGlzLnkgPSBwWTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUG9pbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5mdW5jdGlvbiBUaW1lICgpIHtcclxuICAgIHRoaXMudG90YWxUaW1lID0gMDtcclxuICAgIHRoaXMuZGVsdGFUaW1lID0gMDtcclxufTtcclxuXHJcblRpbWUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0KSB7XHJcbiAgICB0aGlzLnRvdGFsVGltZSArPSBkdDtcclxuICAgIHRoaXMuZGVsdGFUaW1lID0gZHQ7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRpbWU7IiwiXCJ1c2Ugc3RyaWN0XCJcclxuXHJcbnZhciBUdXRvcmlhbFRhZ3MgPSB7XHJcbiAgICBcIkFJXCI6IFwiIzgwNFwiLFxyXG4gICAgXCJBdWRpb1wiOiBcIiMwNDhcIixcclxuICAgIFwiQ29tcHV0ZXIgU2NpZW5jZVwiOiBcIiMxMTFcIixcclxuICAgIFwiQ29yZVwiOiBcIiMzMzNcIixcclxuICAgIFwiR3JhcGhpY3NcIjogXCIjYzBjXCIsXHJcbiAgICBcIklucHV0XCI6IFwiIzg4MFwiLFxyXG4gICAgXCJNYXRoXCI6IFwiIzQ4NFwiLFxyXG4gICAgXCJOZXR3b3JraW5nXCI6IFwiI2M2MFwiLFxyXG4gICAgXCJPcHRpbWl6YXRpb25cIjogXCIjMjgyXCIsXHJcbiAgICBcIlBoeXNpY3NcIjogXCIjMDQ4XCIsXHJcbiAgICBcIlNjcmlwdGluZ1wiOiBcIiMwODhcIixcclxuICAgIFwiU29mdHdhcmVFbmdpbmVlcmluZ1wiOiBcIiM4NDRcIlxyXG59O1xyXG5cclxuXHJcbmZ1bmN0aW9uIERldGFpbHNQYW5lbChncmFwaCkge1xyXG4gICAgdGhpcy5ncmFwaCA9IGdyYXBoO1xyXG4gICAgdGhpcy5ub2RlID0gbnVsbDtcclxuICAgIHRoaXMuZGF0YSA9IG51bGw7XHJcbiAgICB0aGlzLnRyYW5zaXRpb25PbiA9IGZhbHNlO1xyXG4gICAgdGhpcy50cmFuc2l0aW9uVGltZSA9IDA7XHJcbiAgICB0aGlzLmRhdGFEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJpZ2h0QmFyXCIpO1xyXG59O1xyXG5cclxuRGV0YWlsc1BhbmVsLnByb3RvdHlwZS5lbmFibGUgPSBmdW5jdGlvbihub2RlKSB7XHJcbiAgICB0aGlzLm5vZGUgPSBub2RlO1xyXG4gICAgdGhpcy5kYXRhID0gbm9kZS5kYXRhO1xyXG4gICAgdGhpcy50cmFuc2l0aW9uT24gPSB0cnVlXHJcbn07XHJcblxyXG5EZXRhaWxzUGFuZWwucHJvdG90eXBlLmRpc2FibGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZGF0YURpdi5pbm5lckhUTUwgPSBcIlwiO1xyXG4gICAgdGhpcy50cmFuc2l0aW9uT24gPSBmYWxzZTtcclxufTtcclxuXHJcbkRldGFpbHNQYW5lbC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oY2FudmFzU3RhdGUsIHRpbWUsIG5vZGUpIHtcclxuICAgIFxyXG4gICAgLy91cGRhdGUgbm9kZSBpZiBpdHMgbm90IHRoZSBzYW1lIGFueW1vcmVcclxuICAgIGlmKHRoaXMubm9kZSAhPSBub2RlKSB7XHJcbiAgICAgICAgdGhpcy5ub2RlID0gbm9kZTtcclxuICAgICAgICB0aGlzLmRhdGEgPSBub2RlLmRhdGE7XHJcbiAgICAgICAgdGhpcy5kYXRhRGl2LmlubmVySFRNTCA9IHRoaXMuR2VuZXJhdGVET00oKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgXHJcbiAgICAvL3RyYW5zaXRpb24gb25cclxuICAgIGlmKHRoaXMudHJhbnNpdGlvbk9uKSB7XHJcbiAgICAgICAgaWYodGhpcy50cmFuc2l0aW9uVGltZSA8IDEpIHtcclxuICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9uVGltZSArPSB0aW1lLmRlbHRhVGltZSAqIDM7XHJcbiAgICAgICAgICAgIGlmKHRoaXMudHJhbnNpdGlvblRpbWUgPj0gMSkge1xyXG4gICAgICAgICAgICAgICAgLy9kb25lIHRyYW5zaXRpb25pbmdcclxuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvblRpbWUgPSAxO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhRGl2LmlubmVySFRNTCA9IHRoaXMuR2VuZXJhdGVET00oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vdHJhbnNpdGlvbiBvZmZcclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGlmKHRoaXMudHJhbnNpdGlvblRpbWUgPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvblRpbWUgLT0gdGltZS5kZWx0YVRpbWUgKiAzO1xyXG4gICAgICAgICAgICBpZih0aGlzLnRyYW5zaXRpb25UaW1lIDw9IDApIHtcclxuICAgICAgICAgICAgICAgIC8vZG9uZSB0cmFuc2l0aW9uaW5nXHJcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25UaW1lID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMubm9kZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGEgPSBudWxsOyBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbkRldGFpbHNQYW5lbC5wcm90b3R5cGUuR2VuZXJhdGVET00gPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBodG1sID0gXCI8aDE+XCIrdGhpcy5kYXRhLnNlcmllcytcIjo8L2gxPjxoMT48YSBocmVmPVwiICsgdGhpcy5kYXRhLmxpbmsgKyBcIj5cIit0aGlzLmRhdGEudGl0bGUrXCI8L2E+PC9oMT5cIjtcclxuICAgIGh0bWwgKz0gXCI8YSBocmVmPVwiICsgdGhpcy5kYXRhLmxpbmsgKyBcIiB0YXJnZXQ9J19ibGFuaycgPjxpbWcgc3JjPWh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9JR01FLVJJVC9cIiArIHRoaXMuZGF0YS5uYW1lICtcclxuICAgICAgICBcIi9tYXN0ZXIvaWdtZV90aHVtYm5haWwucG5nIGFsdD1cIiArIHRoaXMuZGF0YS5saW5rICsgXCI+PC9hPlwiO1xyXG4gICAgXHJcbiAgICBodG1sICs9IFwiPHVsIGlkPSd0YWdzJz5cIjtcclxuICAgIGlmKHRoaXMuZGF0YS50YWdzLmxlbmd0aCAhPSAwKSB7XHJcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMuZGF0YS50YWdzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCI8bGkgc3R5bGU9J2JhY2tncm91bmQtY29sb3I6XCIgKyBUdXRvcmlhbFRhZ3NbdGhpcy5kYXRhLnRhZ3NbaV1dICsgXCInPlwiICsgdGhpcy5kYXRhLnRhZ3NbaV0gKyBcIjwvbGk+XCI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaHRtbCs9IFwiPC91bD5cIlxyXG4gICAgXHJcbiAgICBodG1sICs9IFwiPHA+XCIgKyB0aGlzLmRhdGEuZGVzY3JpcHRpb24gKyBcIjwvcD5cIjtcclxuICAgIC8vY29uc29sZS5sb2codGhpcy5kYXRhKTtcclxuICAgIGlmKHRoaXMuZGF0YS5leHRyYV9yZXNvdXJjZXMubGVuZ3RoICE9IDApIHtcclxuICAgICAgICBodG1sICs9IFwiPGgyPkFkZGl0aW9uYWwgUmVzb3VyY2VzOjwvaDI+XCI7XHJcbiAgICAgICAgaHRtbCArPSBcIjx1bD5cIjtcclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5kYXRhLmV4dHJhX3Jlc291cmNlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBodG1sICs9IFwiPGxpPjxhIGhyZWY9XCIgKyB0aGlzLmRhdGEuZXh0cmFfcmVzb3VyY2VzW2ldLmxpbmsgKyBcIj5cIiArIHRoaXMuZGF0YS5leHRyYV9yZXNvdXJjZXNbaV0udGl0bGUgKyBcIjwvYT48L2xpPlwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBodG1sICs9IFwiPC91bD5cIjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcmV0dXJuIGh0bWw7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IERldGFpbHNQYW5lbDsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIERyYXdMaWIgPSByZXF1aXJlKCcuLi90b29scy9EcmF3bGliLmpzJyk7XHJcbnZhciBTZWFyY2hQYW5lbCA9IHJlcXVpcmUoJy4vU2VhcmNoUGFuZWwuanMnKTtcclxudmFyIERldGFpbHNQYW5lbCA9IHJlcXVpcmUoJy4vRGV0YWlsc1BhbmVsLmpzJyk7XHJcbnZhciBUdXRvcmlhbE5vZGUgPSByZXF1aXJlKCcuL1R1dG9yaWFsTm9kZS5qcycpO1xyXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuLi9jb250YWluZXJzL1BvaW50LmpzJyk7XHJcblxyXG52YXIgZ3JhcGhMb2FkZWQ7XHJcbnZhciBtb3VzZVRhcmdldDtcclxuXHJcblxyXG52YXIgZ3JhcGhEZXB0aExpbWl0ID0gMjsgLy8gaG93IG1hbnkgdmFsdWVzIHRvIGV4cGFuZCB0b1xyXG52YXIgZGVidWdNb2RlID0gZmFsc2U7XHJcblxyXG5cclxudmFyIFR1dG9yaWFsU3RhdGUgPSB7XHJcbiAgICBMb2NrZWQ6IDAsXHJcbiAgICBVbmxvY2tlZDogMSxcclxuICAgIENvbXBsZXRlZDogMlxyXG59O1xyXG5cclxuXHJcbmZ1bmN0aW9uIEdyYXBoKHBKU09ORGF0YSkge1xyXG4gICAgXHJcbiAgICB0aGlzLnNlYXJjaFBhbmVsID0gbmV3IFNlYXJjaFBhbmVsKHRoaXMpO1xyXG4gICAgdGhpcy5kZXRhaWxzUGFuZWwgPSBuZXcgRGV0YWlsc1BhbmVsKHRoaXMpO1xyXG4gICAgdGhpcy5zZWFyY2hQYW5lbEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiT3B0aW9uc0J1dHRvblwiKTtcclxuICAgIHRoaXMuc2VhcmNoRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsZWZ0QmFyXCIpO1xyXG4gICAgdGhpcy5kYXRhRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyaWdodEJhclwiKTtcclxuICAgIHRoaXMuY2FudmFzRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtaWRkbGVCYXJcIik7XHJcblxyXG4gICAgLy8gbG9hZCBsb2NrIGltYWdlIGZvciBsb2NrZWQgbm9kZXMgYW5kIGNvbXBsZXRlZCBub2Rlc1xyXG4gICAgdGhpcy5sb2NrSW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuICAgIHRoaXMubG9ja0ltYWdlLnNyYyA9IFwiY29udGVudC91aS9Mb2NrLnBuZ1wiO1xyXG4gICAgdGhpcy5jaGVja0ltYWdlID0gbmV3IEltYWdlKCk7XHJcbiAgICB0aGlzLmNoZWNrSW1hZ2Uuc3JjID0gXCJjb250ZW50L3VpL0NoZWNrLnBuZ1wiO1xyXG5cclxuICAgIC8vY3JlYXRlIHBhaW50ZXIgb2JqZWN0IHRvIGhlbHAgZHJhdyBzdHVmZlxyXG4gICAgdGhpcy5wYWludGVyID0gbmV3IERyYXdMaWIoKTtcclxuXHJcbiAgICB0aGlzLm5vZGVzID0gW107XHJcbiAgICB0aGlzLmFjdGl2ZU5vZGVzID0gW107XHJcblxyXG4gICAgLy9wb3B1bGF0ZSB0aGUgYXJyYXlcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBwSlNPTkRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgZGF0YSA9IHBKU09ORGF0YVtpXTtcclxuICAgICAgICAvL2Vuc3VyZXMgdGhhdCB0aGUgY2h1bmsgY29udGFpbnMgYSBsaW5rXHJcbiAgICAgICAgaWYoZGF0YS50YWdzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICBpZihkZWJ1Z01vZGUpIGNvbnNvbGUubG9nKFwiUmVwbyBub3QgdGFnZ2VkOiBcIiArIGRhdGEubmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYoZGF0YS5uYW1lID09IGRhdGEuc2VyaWVzKSB7XHJcbiAgICAgICAgICAgIGlmKGRlYnVnTW9kZSkgY29uc29sZS5sb2coXCJSZXBvIHlhbWwgb3V0IG9mIGRhdGU6IFwiICsgZGF0YS5uYW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciBub2RlID0gbmV3IFR1dG9yaWFsTm9kZShkYXRhKTtcclxuICAgICAgICAgICAgdGhpcy5ub2Rlcy5wdXNoKG5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBsb29wIHRocm91Z2ggbm9kZXMgYW5kIGNvbm5lY3QgdGhlbSB0b2dldGhlci5cclxuICAgIHRoaXMubm9kZXMuZm9yRWFjaCgobm9kZSk9PntcclxuICAgICAgICBub2RlLmRhdGEuY29ubmVjdGlvbnMuZm9yRWFjaCgoY29ubmVjdGlvbik9PntcclxuICAgICAgICAgICAgdGhpcy5ub2Rlcy5mb3JFYWNoKChvdGhlck5vZGUpPT57XHJcbiAgICAgICAgICAgICAgICBpZihvdGhlck5vZGUuZGF0YS5zZXJpZXMgPT09IGNvbm5lY3Rpb24uc2VyaWVzICYmIG90aGVyTm9kZS5kYXRhLnRpdGxlID09PSBjb25uZWN0aW9uLnRpdGxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5wcmV2aW91c05vZGVzLnB1c2gob3RoZXJOb2RlKTtcclxuICAgICAgICAgICAgICAgICAgICBvdGhlck5vZGUubmV4dE5vZGVzLnB1c2gobm9kZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG5vZGUuZmV0Y2hTdGF0ZSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgXHJcbiAgICBcclxuICAgIC8vIFN0YXJ0IGJ5IGZvY3VzaW5nIHRoZSBpbnRybyBub2RlOlxyXG4gICAgdGhpcy50cmFuc2l0aW9uVGltZSA9IDA7XHJcbiAgICB2YXIgZmlyc3QgPSB0aGlzLm5vZGVzLmZpbmQoKGN1cnJlbnROb2RlKT0+e1xyXG4gICAgICAgIHJldHVybiBjdXJyZW50Tm9kZS5kYXRhLmxpbmsgPT0gXCJodHRwczovL2dpdGh1Yi5jb20vSUdNRS1SSVQvV2VsY29tZS10by1BdGxhc1wiO1xyXG4gICAgfSk7XHJcbiAgICB0aGlzLkZvY3VzTm9kZShmaXJzdCk7XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIHggKHNlYXJjaCkge1xyXG4gICAgICAgIGlmKHNlYXJjaC5vcGVuID09IHRydWUpIHtcclxuICAgICAgICAgICAgc2VhcmNoLnRyYW5zaXRpb25PbiA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2VhcmNoLnRyYW5zaXRpb25PbiA9IHRydWU7XHJcbiAgICAgICAgICAgIHNlYXJjaC5vcGVuID0gdHJ1ZTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZWFyY2h0ZXh0ZmllbGRcIikuc2VsZWN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2VhcmNoUGFuZWxCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHguYmluZCh0aGlzLnNlYXJjaFBhbmVsQnV0dG9uLCB0aGlzLnNlYXJjaFBhbmVsKSk7XHJcblxyXG59O1xyXG5cclxuXHJcblxyXG5cclxuR3JhcGgucHJvdG90eXBlLkZvY3VzTm9kZSA9IGZ1bmN0aW9uKGNlbnRlck5vZGUpIHtcclxuICAgIHRoaXMuZm9jdXNlZE5vZGUgPSBjZW50ZXJOb2RlO1xyXG4gICAgXHJcbiAgICB2YXIgbmV3Tm9kZXMgPSBbXTtcclxuICAgIFxyXG4gICAgLy9nZXQgbm9kZXMgdG8gZGVwdGggaW4gYm90aCBkaXJlY3Rpb25zLCBhbmQgYWRkIHRoZW0gdG8gdGhlIG5ldyBub2RlcyBhcnJheVxyXG4gICAgdmFyIHByZXZpb3VzTm9kZXMgPSB0aGlzLmZvY3VzZWROb2RlLmdldFByZXZpb3VzKGdyYXBoRGVwdGhMaW1pdCk7XHJcbiAgICBuZXdOb2RlcyA9IG5ld05vZGVzLmNvbmNhdChwcmV2aW91c05vZGVzKTtcclxuICAgIFxyXG4gICAgdmFyIG5leHROb2RlcyA9IHRoaXMuZm9jdXNlZE5vZGUuZ2V0TmV4dChncmFwaERlcHRoTGltaXQpO1xyXG4gICAgbmV3Tm9kZXMgPSBuZXdOb2Rlcy5jb25jYXQobmV4dE5vZGVzKTtcclxuICAgIFxyXG4gICAgXHJcbiAgICAvL2ZpbmQgcmVkdW5kYW5jaWVzIGZyb20gdGhlIG5ld05vZGVzLCBhbmQgbWFrZSBhIG5ldyBhcnJheSB3aXRob3V0IHRob3NlIHJlZHVuZGFuY2llcy5cclxuICAgIHZhciB0ZW1wID0gW107XHJcbiAgICBuZXdOb2Rlcy5mb3JFYWNoKChub2RlVG9DaGVjayk9PiB7XHJcbiAgICAgICAgaWYodGVtcC5ldmVyeSgoYWxyZWFkeUFkZGVkTm9kZSk9PntcclxuICAgICAgICAgICAgcmV0dXJuIG5vZGVUb0NoZWNrICE9IGFscmVhZHlBZGRlZE5vZGU7XHJcbiAgICAgICAgfSkpIHtcclxuICAgICAgICAgICAgdGVtcC5wdXNoKG5vZGVUb0NoZWNrKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIG5ld05vZGVzID0gdGVtcDtcclxuICAgIFxyXG4gICAgXHJcbiAgICBcclxuICAgIC8vIGNoZWNrIGlmIGFueSBvZiB0aGUgbm9kZXMgd2VyZSBwcmV2aW91c2x5IG9uIHNjcmVlblxyXG4gICAgLy8gKHRoaXMgaXMgdXNlZCB0byBkZXRlcm1pbmUgd2hlcmUgdGhleSBzaG91bGQgYXBwZWFyIGR1cmluZyB0aGUgdHJhbnNpdGlvbiBhbmltYXRpb24pXHJcbiAgICB0aGlzLmFjdGl2ZU5vZGVzLmZvckVhY2goKG5vZGUpPT57XHJcbiAgICAgICAgbm9kZS53YXNQcmV2aW91c2x5T25TY3JlZW4gPSBuZXdOb2Rlcy5zb21lKChuZXdOb2RlKT0+e1xyXG4gICAgICAgICAgICByZXR1cm4gbm9kZSA9PSBuZXdOb2RlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIHRoaXMuYWN0aXZlTm9kZXMgPSBuZXdOb2RlcztcclxuICAgIFxyXG4gICAgLy9jbGVhciB0aGVpciBwYXJlbnQgZGF0YSBmb3IgbmV3IG5vZGVcclxuICAgIHRoaXMuYWN0aXZlTm9kZXMuZm9yRWFjaCgobm9kZSk9PntcclxuICAgICAgICBub2RlLmN1cnJlbnRMYXllckRlcHRoID0gMDtcclxuICAgICAgICBub2RlLnBhcmVudCA9IG51bGw7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgLy8gU3RhcnQgYW5pbWF0aW9uLlxyXG4gICAgdGhpcy50cmFuc2l0aW9uVGltZSA9IDE7XHJcbiAgICAvLyBGaWd1cmUgb3V0IHdoZXJlIGV2ZXJ5dGhpbmcgbmVlZHMgdG8gYmUuXHJcbiAgICB0aGlzLmZvY3VzZWROb2RlLmNhbGN1bGF0ZU5vZGVUcmVlKGdyYXBoRGVwdGhMaW1pdCwgbnVsbCwgMCk7XHJcbiAgICB0aGlzLmZvY3VzZWROb2RlLnNldFRyYW5zaXRpb24oZ3JhcGhEZXB0aExpbWl0LCBudWxsLCAwLCBuZXcgUG9pbnQoMCwgMCkpO1xyXG59O1xyXG5cclxuR3JhcGgucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKG1vdXNlU3RhdGUsIGNhbnZhc1N0YXRlLCB0aW1lKSB7XHJcbiAgICBcclxuICAgIC8vIHVwZGF0ZSB0cmFuc2l0aW9uIHRpbWUgaWYgaXQgbmVlZHMgdG8gYmUgdXBkYXRlZC5cclxuICAgIGlmKHRoaXMudHJhbnNpdGlvblRpbWUgPiAwKSB7XHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uVGltZSAtPSB0aW1lLmRlbHRhVGltZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uVGltZSA9IDA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIExvb3Agb3ZlciBhbmQgdXBkYXRlIGFjdGl2ZSBub2Rlc1xyXG4gICAgdmFyIG1vdXNlT3Zlck5vZGUgPSBudWxsO1xyXG4gICAgdGhpcy5hY3RpdmVOb2Rlcy5mb3JFYWNoKChub2RlKT0+e1xyXG4gICAgICAgIHZhciBpc01haW4gPSAobm9kZSA9PSB0aGlzLmZvY3VzZWROb2RlKTtcclxuICAgICAgICBub2RlLnVwZGF0ZShtb3VzZVN0YXRlLCB0aW1lLCB0aGlzLnRyYW5zaXRpb25UaW1lLCBpc01haW4pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIEFsc28gY2hlY2sgaWYgdGhlIG1vdXNlIGlzIG92ZXIgdGhhdCBub2RlLlxyXG4gICAgICAgIGlmKG5vZGUubW91c2VPdmVyKSB7XHJcbiAgICAgICAgICAgIG1vdXNlT3Zlck5vZGUgPSBub2RlO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICBcclxuICAgIC8vIElmIHVzZXIgY2xpY2tzXHJcbiAgICBpZihtb3VzZVN0YXRlLm1vdXNlRG93biAmJiAhbW91c2VTdGF0ZS5sYXN0TW91c2VEb3duKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gZm9jdXMgbm9kZSBpZiBjbGlja2VkXHJcbiAgICAgICAgaWYobW91c2VPdmVyTm9kZSkge1xyXG4gICAgICAgICAgICB0aGlzLkZvY3VzTm9kZShtb3VzZU92ZXJOb2RlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gc2hvdyBkZXRhaWxzIGZvciBub2RlIGlmIGJ1dHRvbiBjbGlja2VkXHJcbiAgICAgICAgaWYodGhpcy5mb2N1c2VkTm9kZS5kZXRhaWxzQnV0dG9uLm1vdXNlT3Zlcikge1xyXG4gICAgICAgICAgICBpZih0aGlzLmRldGFpbHNQYW5lbC5ub2RlID09IG51bGwpICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRldGFpbHNQYW5lbC5lbmFibGUodGhpcy5mb2N1c2VkTm9kZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZvY3VzZWROb2RlLmRldGFpbHNCdXR0b24udGV4dCA9IFwiTGVzc1wiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXRhaWxzUGFuZWwuZGlzYWJsZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5mb2N1c2VkTm9kZS5kZXRhaWxzQnV0dG9uLnRleHQgPSBcIk1vcmVcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyB1c2VyIGNsaWNrcyBvbiBjb21wbGV0aW9uIGJ1dHRvblxyXG4gICAgICAgIGlmKHRoaXMuZm9jdXNlZE5vZGUuY29tcGxldGlvbkJ1dHRvbi5tb3VzZU92ZXIpIHtcclxuICAgICAgICAgICAgaWYodGhpcy5mb2N1c2VkTm9kZS5zdGF0ZSA9PSBUdXRvcmlhbFN0YXRlLlVubG9ja2VkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZvY3VzZWROb2RlLmNoYW5nZVN0YXRlKFR1dG9yaWFsU3RhdGUuQ29tcGxldGVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLmZvY3VzZWROb2RlLnN0YXRlID09IFR1dG9yaWFsU3RhdGUuTG9ja2VkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY29uZmlybShcIlNraXAgYWhlYWQ/IFRoaXMgd29uJ3QgYXV0b21hdGljYWxseSBjb21wbGV0ZSBhbnl0aGluZyBwcmV2aW91cyB0byB0aGlzLlwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZm9jdXNlZE5vZGUuY2hhbmdlU3RhdGUoVHV0b3JpYWxTdGF0ZS5Db21wbGV0ZWQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuZm9jdXNlZE5vZGUuc3RhdGUgPT0gVHV0b3JpYWxTdGF0ZS5Db21wbGV0ZWQpIHtcclxuICAgICAgICAgICAgICAgIC8vIElmIHJlc2V0dGluZywgYXNrIGZvciBjb25maXJtYXRpb24uXHJcbiAgICAgICAgICAgICAgICBpZiAoY29uZmlybShcIlRoaXMgd2lsbCByZXNldCBhbnkgcHJvZ3Jlc3MgcGFzdCB0aGlzIHBvaW50LiBBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZG8gdGhpcz9cIikpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZvY3VzZWROb2RlLmNoYW5nZVN0YXRlKFR1dG9yaWFsU3RhdGUuVW5sb2NrZWQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyBVcGRhdGUgdGhlIHNlYXJjaCBwYW5lbCBpZiBpdCdzIG9wZW4uXHJcbiAgICBpZih0aGlzLnNlYXJjaFBhbmVsLm9wZW4gPT0gdHJ1ZSkge1xyXG4gICAgICAgIHRoaXMuc2VhcmNoUGFuZWwudXBkYXRlKGNhbnZhc1N0YXRlLCB0aW1lKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gVXBkYXRlIHRoZSBkZXRhaWxzIHBhbmVsIGlmIGl0J3Mgb3Blbi5cclxuICAgIGlmKHRoaXMuZGV0YWlsc1BhbmVsLm5vZGUgIT0gbnVsbCkge1xyXG4gICAgICAgIHRoaXMuZGV0YWlsc1BhbmVsLnVwZGF0ZShjYW52YXNTdGF0ZSwgdGltZSwgdGhpcy5mb2N1c2VkTm9kZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIFxyXG4gICAgLy8gVHJhbnNpdGlvbiB0aGUgc2lkZSBiYXJzIG9uIGFuZCBvZmYgc21vb3RobHlcclxuICAgIHZhciB0MSA9ICgxIC0gTWF0aC5jb3ModGhpcy5zZWFyY2hQYW5lbC50cmFuc2l0aW9uVGltZSAqIE1hdGguUEkpKS8yO1xyXG4gICAgdmFyIHQyID0gKDEgLSBNYXRoLmNvcyh0aGlzLmRldGFpbHNQYW5lbC50cmFuc2l0aW9uVGltZSAqIE1hdGguUEkpKS8yO1xyXG4gICAgXHJcbiAgICAvLyBDaGFuZ2Ugc3R5bGluZyB0byBjaGFuZ2Ugc2l6ZSBvZiBkaXZzXHJcbiAgICB0aGlzLnNlYXJjaERpdi5zdHlsZS53aWR0aCA9IDMwICogdDEgKyBcInZ3XCI7XHJcbiAgICB0aGlzLmRhdGFEaXYuc3R5bGUud2lkdGggPSAzMCAqIHQyICsgXCJ2d1wiO1xyXG4gICAgdGhpcy5jYW52YXNEaXYuc3R5bGUud2lkdGggPSAxMDAgLSAzMCAqICh0MSArIHQyKSArIFwidndcIjsgICAgXHJcbiAgICBcclxuICAgIHRoaXMuc2VhcmNoUGFuZWxCdXR0b24uc3R5bGUubGVmdCA9IFwiY2FsYyhcIiArIDMwICogdDEgKyBcInZ3ICsgMTJweClcIjtcclxuICAgIFxyXG4gICAgXHJcbiAgICB0aGlzLnNlYXJjaERpdi5zdHlsZS5kaXNwbGF5ID0gKHQxID09IDApID8gXCJub25lXCIgOiBcImJsb2NrXCI7XHJcbiAgICB0aGlzLmRhdGFEaXYuc3R5bGUuZGlzcGxheSA9ICh0MiA9PSAwKSA/IFwibm9uZVwiIDogXCJibG9ja1wiO1xyXG4gICAgXHJcbiAgICBjYW52YXNTdGF0ZS51cGRhdGUoKTtcclxufTtcclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcbkdyYXBoLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY2FudmFzU3RhdGUpIHtcclxuICAgIFxyXG4gICAgY2FudmFzU3RhdGUuY3R4LnNhdmUoKTtcclxuXHJcbiAgICAvL3RyYW5zbGF0ZSB0byB0aGUgY2VudGVyIG9mIHRoZSBzY3JlZW5cclxuICAgIGNhbnZhc1N0YXRlLmN0eC50cmFuc2xhdGUoY2FudmFzU3RhdGUuY2VudGVyLngsIGNhbnZhc1N0YXRlLmNlbnRlci55KTtcclxuICAgIFxyXG4gICAgLy9kcmF3IG5vZGVzXHJcbiAgICB0aGlzLmZvY3VzZWROb2RlLmRyYXcoY2FudmFzU3RhdGUsIHRoaXMucGFpbnRlciwgdGhpcywgbnVsbCwgMCwgZ3JhcGhEZXB0aExpbWl0KTtcclxuXHJcbiAgICBjYW52YXNTdGF0ZS5jdHgucmVzdG9yZSgpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHcmFwaDsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4uL2NvbnRhaW5lcnMvUG9pbnQuanMnKTtcclxudmFyIEJ1dHRvbiA9IHJlcXVpcmUoXCIuLi9jb250YWluZXJzL0J1dHRvbi5qc1wiKTtcclxudmFyIFR1dG9yaWFsTm9kZSA9IHJlcXVpcmUoJy4vVHV0b3JpYWxOb2RlLmpzJyk7XHJcblxyXG52YXIgbGFiZWxDb3JuZXJTaXplID0gNjtcclxuXHJcbnZhciB0aXRsZUZvbnRTaXplID0gMTI7XHJcbnZhciB0aXRsZUZvbnQgPSB0aXRsZUZvbnRTaXplK1wicHggQXJpYWxcIjtcclxuXHJcbnZhciBkZXNjcmlwdG9yRm9udFNpemUgPSAxMjtcclxudmFyIGRlc2NyaXB0b3JGb250ID0gZGVzY3JpcHRvckZvbnRTaXplK1wicHggQXJpYWxcIjtcclxuXHJcbnZhciBsaW5lQnJlYWsgPSA2O1xyXG5cclxuLy9jcmVhdGUgYSBsYWJlbCB0byBwYWlyIHdpdGggYSBub2RlXHJcbmZ1bmN0aW9uIE5vZGVMYWJlbChwVHV0b3JpYWxOb2RlKSB7XHJcbiAgICB0aGlzLm5vZGUgPSBwVHV0b3JpYWxOb2RlO1xyXG4gICAgXHJcbiAgICB0aGlzLnNlcmllcyA9IHRoaXMubm9kZS5kYXRhLnNlcmllcztcclxuICAgIHRoaXMudGl0bGUgPSB0aGlzLm5vZGUuZGF0YS50aXRsZTtcclxuICAgIHRoaXMuZGVzY3JpcHRpb24gPSB0aGlzLm5vZGUuZGF0YS5kZXNjcmlwdGlvbjtcclxuICAgIHRoaXMuZGVzY3JpcHRpb25MaW5lcyA9IG51bGw7XHJcbiAgICBcclxuICAgIHRoaXMucG9zaXRpb24gPSBuZXcgUG9pbnQoXHJcbiAgICAgICAgdGhpcy5ub2RlLnBvc2l0aW9uLngsXHJcbiAgICAgICAgdGhpcy5ub2RlLnBvc2l0aW9uLnkgLSB0aGlzLm5vZGUuc2l6ZSAtIDEwKTtcclxuICAgIFxyXG4gICAgdGhpcy5kaXNwbGF5RnVsbERhdGEgPSBmYWxzZTtcclxufTtcclxuXHJcbk5vZGVMYWJlbC5wcm90b3R5cGUuY2FsY3VsYXRlVGV4dEZpdCA9IGZ1bmN0aW9uKGN0eCwgcFBhaW50ZXIpIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHguZm9udCA9IHRpdGxlRm9udDtcclxuICAgIHZhciBzZXJpZXNTaXplID0gY3R4Lm1lYXN1cmVUZXh0KHRoaXMuc2VyaWVzKTtcclxuICAgIHZhciB0aXRsZVNpemUgPSBjdHgubWVhc3VyZVRleHQodGhpcy50aXRsZSk7XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG5cclxuICAgIHRoaXMuc2l6ZSA9IG5ldyBQb2ludChNYXRoLm1heChzZXJpZXNTaXplLndpZHRoLCB0aXRsZVNpemUud2lkdGgpLCB0aXRsZUZvbnRTaXplICogMik7XHJcbiAgICBcclxuICAgIFxyXG5cclxuICAgIGlmKHRoaXMuZGlzcGxheUZ1bGxEYXRhKSB7XHJcbiAgICAgICAgdGhpcy5zaXplLnggPSBNYXRoLm1heCgyNDAsIE1hdGgubWF4KHNlcmllc1NpemUud2lkdGgsIHRpdGxlU2l6ZS53aWR0aCkpO1xyXG4gICAgICAgIHRoaXMuZGVzY3JpcHRpb25MaW5lcyA9IHBQYWludGVyLnRleHRUb0xpbmVzKGN0eCwgdGhpcy5kZXNjcmlwdGlvbiwgZGVzY3JpcHRvckZvbnQsIHRoaXMuc2l6ZS54KTtcclxuICAgICAgICB0aGlzLnNpemUueSArPSBsaW5lQnJlYWsgKyB0aGlzLmRlc2NyaXB0aW9uTGluZXMubGVuZ3RoICogZGVzY3JpcHRvckZvbnRTaXplO1xyXG4gICAgfVxyXG59O1xyXG5cclxuXHJcblxyXG5Ob2RlTGFiZWwucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChwTW91c2VTdGF0ZSwgdGltZSwgZGlzcGxheUJyaWVmKSB7XHJcbiAgICBcclxuICAgIFxyXG4gICAgLy9kaXJlY3RseSBhYm92ZSBub2RlXHJcbiAgICB0aGlzLmRlc2lyZWRQb3NpdGlvbiA9IG5ldyBQb2ludChcclxuICAgICAgICB0aGlzLm5vZGUucG9zaXRpb24ueCxcclxuICAgICAgICB0aGlzLm5vZGUucG9zaXRpb24ueSAtIHRoaXMubm9kZS5zaXplIC0gMTIgLSBsYWJlbENvcm5lclNpemUpO1xyXG4gICAgXHJcbiAgICBpZih0aGlzLmRlc2lyZWRQb3NpdGlvbi54ICE9IHRoaXMucG9zaXRpb24ueCB8fCB0aGlzLmRlc2lyZWRQb3NpdGlvbi55ICE9IHRoaXMucG9zaXRpb24ueSkge1xyXG4gICAgICAgIC8vbW92ZSB0b3dhcmRzIGRlc2lyZWRQb3NpdGlvblxyXG4gICAgICAgIHZhciBkaWYgPSBuZXcgUG9pbnQoXHJcbiAgICAgICAgICAgIHRoaXMuZGVzaXJlZFBvc2l0aW9uLnggLSB0aGlzLnBvc2l0aW9uLngsXHJcbiAgICAgICAgICAgIHRoaXMuZGVzaXJlZFBvc2l0aW9uLnkgLSB0aGlzLnBvc2l0aW9uLnkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBzcGVlZFNjYWxhciA9IE1hdGguc3FydChkaWYueCAqIGRpZi54ICsgZGlmLnkgKiBkaWYueSkgKiB0aW1lLmRlbHRhVGltZTtcclxuXHJcbiAgICAgICAgdmFyIHZlbG9jaXR5ID0gbmV3IFBvaW50KGRpZi54ICogc3BlZWRTY2FsYXIsIGRpZi55ICogc3BlZWRTY2FsYXIpO1xyXG4gICAgICAgIGlmKHZlbG9jaXR5LnggKiB2ZWxvY2l0eS54IDwgZGlmLnggKiBkaWYueCkge1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnggKz0gdmVsb2NpdHkueDtcclxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi55ICs9IHZlbG9jaXR5Lnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnggPSB0aGlzLmRlc2lyZWRQb3NpdGlvbi54O1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnkgPSB0aGlzLmRlc2lyZWRQb3NpdGlvbi55O1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgXHJcbiAgICAvL2lmIHRoaXMgaXMgdGhlIHByaW1hcnkgbm9kZSwgZGlzcGxheSBkZXNjcmlwdGlvblxyXG4gICAgaWYoZGlzcGxheUJyaWVmKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYodGhpcy5kaXNwbGF5RnVsbERhdGEgPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgdGhpcy5zaXplID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheUZ1bGxEYXRhID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICh0aGlzLmRpc3BsYXlGdWxsRGF0YSA9PSB0cnVlKSB7XHJcbiAgICAgICAgdGhpcy5idXR0b25DbGlja2VkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zaXplID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5kaXNwbGF5RnVsbERhdGEgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIFxyXG59XHJcblxyXG5Ob2RlTGFiZWwucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihwQ2FudmFzU3RhdGUsIHBQYWludGVyKSB7XHJcbiAgICBcclxuICAgIGlmKCF0aGlzLnNpemUpIHtcclxuICAgICAgICB0aGlzLmNhbGN1bGF0ZVRleHRGaXQocENhbnZhc1N0YXRlLmN0eCwgcFBhaW50ZXIpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvL2RyYXcgbGluZSBmcm9tIG5vZGUgdG8gbGFiZWxcclxuICAgIHBDYW52YXNTdGF0ZS5jdHguc2F2ZSgpO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5zdHJva2VTdHlsZSA9IFwiI2ZmZlwiO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5saW5lV2lkdGggPSAyO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5iZWdpblBhdGgoKTtcclxuICAgIFxyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5tb3ZlVG8oXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi54LFxyXG4gICAgICAgIHRoaXMucG9zaXRpb24ueSk7XHJcbiAgICBcclxuICAgIHBDYW52YXNTdGF0ZS5jdHgubGluZVRvKFxyXG4gICAgICAgIHRoaXMubm9kZS5wb3NpdGlvbi54LFxyXG4gICAgICAgIHRoaXMubm9kZS5wb3NpdGlvbi55IC0gdGhpcy5ub2RlLnNpemUpO1xyXG4gICAgXHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LmNsb3NlUGF0aCgpO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5zdHJva2UoKTtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHgucmVzdG9yZSgpO1xyXG4gICAgXHJcbiAgICAvL2RyYXcgbGFiZWxcclxuICAgIHBQYWludGVyLnJvdW5kZWRSZWN0KFxyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHgsXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi54IC0gKHRoaXMuc2l6ZS54IC8gMiksXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi55IC0gdGhpcy5zaXplLnksXHJcbiAgICAgICAgdGhpcy5zaXplLngsXHJcbiAgICAgICAgdGhpcy5zaXplLnksXHJcbiAgICAgICAgbGFiZWxDb3JuZXJTaXplLFxyXG4gICAgICAgIHRydWUsIHRoaXMubm9kZS5jb2xvcixcclxuICAgICAgICB0cnVlLCBcIiNmZmZcIiwgMik7XHJcbiAgICBcclxuICAgIFxyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5zYXZlKCk7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LmZpbGxTdHlsZSA9IFwiI2ZmZlwiO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5mb250ID0gdGl0bGVGb250O1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC50ZXh0QmFzZWxpbmUgPSBcInRvcFwiO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5maWxsVGV4dChcclxuICAgICAgICB0aGlzLnNlcmllcyxcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLngsXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi55IC0gdGhpcy5zaXplLnkpO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5maWxsVGV4dChcclxuICAgICAgICB0aGlzLnRpdGxlLFxyXG4gICAgICAgIHRoaXMucG9zaXRpb24ueCxcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnkgLSB0aGlzLnNpemUueSArIHRpdGxlRm9udFNpemUpO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5yZXN0b3JlKCk7XHJcbiAgICBcclxuICAgIFxyXG4gICAgaWYodGhpcy5kaXNwbGF5RnVsbERhdGEpIHtcclxuICAgICAgICBcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LnNhdmUoKTtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LmZpbGxTdHlsZSA9IFwiI2ZmZlwiO1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHguZm9udCA9IGRlc2NyaXB0b3JGb250O1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHgudGV4dEJhc2VsaW5lID0gXCJ0b3BcIjtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LnRleHRBbGlnbiA9IFwibGVmdFwiO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmRlc2NyaXB0aW9uTGluZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5maWxsVGV4dChcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVzY3JpcHRpb25MaW5lc1tpXSxcclxuICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueCAtIHRoaXMuc2l6ZS54IC8gMixcclxuICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueSAtIHRoaXMuc2l6ZS55ICsgdGl0bGVGb250U2l6ZSAqIDIgKyBsaW5lQnJlYWsgKyBpICogZGVzY3JpcHRvckZvbnRTaXplKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5yZXN0b3JlKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzICA9IE5vZGVMYWJlbDsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbi8vcGFyYW1ldGVyIGlzIGEgcG9pbnQgdGhhdCBkZW5vdGVzIHN0YXJ0aW5nIHBvc2l0aW9uXHJcbmZ1bmN0aW9uIFBhcnNlcihwVGFyZ2V0VVJMLCBjYWxsYmFjayl7XHJcbiAgICB2YXIgSlNPTk9iamVjdDtcclxuICAgIHZhciBsZXNzb25BcnJheSA9IFtdO1xyXG4gICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgSlNPTk9iamVjdCA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCk7XHJcblxyXG4gICAgICAgIC8vcGFzcyBsZXNzb24gZGF0YSBiYWNrXHJcbiAgICAgICAgY2FsbGJhY2soSlNPTk9iamVjdCk7XHJcbiAgICB9XHJcblxyXG4gICAgeGhyLm9wZW4oJ0dFVCcsIHBUYXJnZXRVUkwsIHRydWUpO1xyXG4gICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoXCJJZi1Nb2RpZmllZC1TaW5jZVwiLCBcIlNhdCwgMSBKYW4gMjAxMCAwMDowMDowMCBHTTBUXCIpO1xyXG4gICAgeGhyLnNlbmQoKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQYXJzZXI7IiwiXCJ1c2Ugc3RyaWN0XCJcclxuXHJcbnZhciBUdXRvcmlhbFN0YXRlID0ge1xyXG4gICAgTG9ja2VkOiAwLFxyXG4gICAgVW5sb2NrZWQ6IDEsXHJcbiAgICBDb21wbGV0ZWQ6IDJcclxufTtcclxuXHJcbnZhciBUdXRvcmlhbFRhZ3MgPSB7XHJcbiAgICBcIkFJXCI6IFwiIzgwNFwiLFxyXG4gICAgXCJBdWRpb1wiOiBcIiMwNDhcIixcclxuICAgIFwiQ29tcHV0ZXIgU2NpZW5jZVwiOiBcIiMxMTFcIixcclxuICAgIFwiQ29yZVwiOiBcIiMzMzNcIixcclxuICAgIFwiR3JhcGhpY3NcIjogXCIjYzBjXCIsXHJcbiAgICBcIklucHV0XCI6IFwiIzg4MFwiLFxyXG4gICAgXCJNYXRoXCI6IFwiIzQ4NFwiLFxyXG4gICAgXCJOZXR3b3JraW5nXCI6IFwiI2M2MFwiLFxyXG4gICAgXCJPcHRpbWl6YXRpb25cIjogXCIjMjgyXCIsXHJcbiAgICBcIlBoeXNpY3NcIjogXCIjMDQ4XCIsXHJcbiAgICBcIlNjcmlwdGluZ1wiOiBcIiMwODhcIixcclxuICAgIFwiU29mdHdhcmVFbmdpbmVlcmluZ1wiOiBcIiM4NDRcIlxyXG59O1xyXG5cclxuZnVuY3Rpb24gU2VhcmNoUGFuZWwoZ3JhcGgpIHtcclxuICAgIHRoaXMuZ3JhcGggPSBncmFwaDtcclxuICAgIHRoaXMub3BlbiA9IGZhbHNlO1xyXG4gICAgdGhpcy50cmFuc2l0aW9uT24gPSBmYWxzZTtcclxuICAgIHRoaXMudHJhbnNpdGlvblRpbWUgPSAwO1xyXG4gICAgdGhpcy5vcHRpb25zRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsZWZ0QmFyXCIpO1xyXG4gICAgdGhpcy5zZWFyY2hCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlYXJjaGJ1dHRvblwiKTtcclxuICAgIFxyXG4gICAgLy8gY3JlYXRlIGEgc2VhcmNoIGV2ZW50IHRvIGJlIHRyaWdnZXJlZCBieSBjbGlja2luZyB0aGUgc2VhcmNoIGJ1dHRvblxyXG4gICAgdGhpcy5zZWFyY2hCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uICh0aGF0KSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gQ29sbGVjdCBhbGwgaW5mb3JtYXRpb24gZm9yIHRoZSBxdWVyeVxyXG4gICAgICAgIHZhciBxdWVyeSA9IFtdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIGdldCB0ZXh0IGlucHV0IGlmIHRoZXJlIGlzIGFueVxyXG4gICAgICAgIHZhciBwYXJhbTEgPSB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwiVGV4dFwiLFxyXG4gICAgICAgICAgICB2YWx1ZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZWFyY2h0ZXh0ZmllbGRcIikudmFsdWVcclxuICAgICAgICB9O1xyXG4gICAgICAgIGlmKHBhcmFtMS52YWx1ZSAhPSBcIlwiKSB7XHJcbiAgICAgICAgICAgIHF1ZXJ5LnB1c2gocGFyYW0xKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gZ2V0IGxhbmd1YWdlIGlucHV0IGlmIHRoZXJlIGlzIGFueVxyXG4gICAgICAgIHZhciBwYXJhbTIgPSB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwiTGFuZ3VhZ2VcIixcclxuICAgICAgICAgICAgdmFsdWU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2VhcmNobGFuZ3VhZ2VmaWVsZFwiKS52YWx1ZVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYocGFyYW0yLnZhbHVlICE9IFwiQW55XCIpIHtcclxuICAgICAgICAgICAgcXVlcnkucHVzaChwYXJhbTIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyBnZXQgdGFncyBpbnB1dCBpZiB0aGVyZSBpcyBhbnlcclxuICAgICAgICB2YXIgcGFyYW0zID0ge1xyXG4gICAgICAgICAgICB0eXBlOiBcIlRhZ1wiLFxyXG4gICAgICAgICAgICB2YWx1ZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZWFyY2h0YWdmaWVsZFwiKS52YWx1ZVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYocGFyYW0zLnZhbHVlICE9IFwiQW55XCIpIHtcclxuICAgICAgICAgICAgcXVlcnkucHVzaChwYXJhbTMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICAvL3BhcnNlIGRhdGEgdG8gZmluZCBtYXRjaGluZyByZXN1bHRzXHJcbiAgICAgICAgdmFyIHNlYXJjaFJlc3VsdHMgPSB0aGF0LnNlYXJjaChxdWVyeSwgdGhhdC5ncmFwaC5ub2Rlcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9kaXNwbGF5IHJlc3VsdHNcclxuICAgICAgICB2YXIgbGlzdEVsZW1lbnRVbmxvY2tlZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2VhcmNocmVzdWx0c1VubG9ja2VkXCIpO1xyXG4gICAgICAgIHZhciBsaXN0RWxlbWVudExvY2tlZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2VhcmNocmVzdWx0c0xvY2tlZFwiKTtcclxuICAgICAgICB2YXIgbGlzdEVsZW1lbnRDb21wbGV0ZWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlYXJjaHJlc3VsdHNDb21wbGV0ZWRcIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdEVsZW1lbnRVbmxvY2tlZC5pbm5lckhUTUwgPSBcIlwiO1xyXG4gICAgICAgIGxpc3RFbGVtZW50TG9ja2VkLmlubmVySFRNTCA9IFwiXCI7XHJcbiAgICAgICAgbGlzdEVsZW1lbnRDb21wbGV0ZWQuaW5uZXJIVE1MID0gXCJcIjtcclxuICAgICAgICBcclxuICAgICAgICBpZihzZWFyY2hSZXN1bHRzLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgIGxpc3RFbGVtZW50TG9ja2VkLmlubmVySFRNTCA9IFwiTm8gTWF0Y2hpbmcgUmVzdWx0cyBGb3VuZC5cIjtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgc2VhcmNoUmVzdWx0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAvL2NyZWF0ZSBsaXN0IHRhZ1xyXG4gICAgICAgICAgICB2YXIgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7XHJcbiAgICAgICAgICAgIC8vc2V0IHRpdGxlIGFzIHRleHRcclxuICAgICAgICAgICAgbGkuaW5uZXJIVE1MID0gc2VhcmNoUmVzdWx0c1tpXS5kYXRhLnRpdGxlO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgLy9hZGQgZXZlbnQgdG8gZm9jdXMgdGhlIG5vZGUgaWYgaXRzIGNsaWNrZWRcclxuICAgICAgICAgICAgbGkuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKHRoYXQsIG5vZGUpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuZ3JhcGguRm9jdXNOb2RlKG5vZGUpO1xyXG4gICAgICAgICAgICB9LmJpbmQobGksIHRoYXQsIHNlYXJjaFJlc3VsdHNbaV0pKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvL2FkZCB0aGUgdGFnIHRvIHRoZSBwYWdlXHJcbiAgICAgICAgICAgIGlmKHNlYXJjaFJlc3VsdHNbaV0uc3RhdGUgPT0gVHV0b3JpYWxTdGF0ZS5VbmxvY2tlZCkge1xyXG4gICAgICAgICAgICAgICAgbGlzdEVsZW1lbnRVbmxvY2tlZC5hcHBlbmRDaGlsZChsaSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc2VhcmNoUmVzdWx0c1tpXS5zdGF0ZSA9PSBUdXRvcmlhbFN0YXRlLkxvY2tlZCl7XHJcbiAgICAgICAgICAgICAgICBsaXN0RWxlbWVudExvY2tlZC5hcHBlbmRDaGlsZChsaSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsaS5pbm5lckhUTUwgKz0gXCIgKGNvbXBsZXRlKVwiO1xyXG4gICAgICAgICAgICAgICAgbGlzdEVsZW1lbnRDb21wbGV0ZWQuYXBwZW5kQ2hpbGQobGkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfS5iaW5kKHRoaXMuc2VhcmNoQnV0dG9uLCB0aGlzKSk7XHJcbn07XHJcblxyXG5cclxuXHJcbi8vIFRoaXMgc2VhcmNoIHN1cHBvcnRzIG11bHRpcGxlIHRhZ3Mgb2YgZWFjaCB0eXBlLCBidXQgdGhlIGFjdHVhbCBzZWFyY2ggZG9lc24ndCB1c2UgdGhhdCBmdW5jdGlvbmFsaXR5LlxyXG4vLyBTZWFyY2hlcyBieSBuYXJyb3dpbmcgZG93biByZXN1bHRzLiBBbnl0aGluZyB0aGF0IGRvZXNuJ3QgbWF0Y2ggYWxsIDMgY3JpdGVyaWEgZmFpbHMgdGhlIHRlc3QuXHJcblNlYXJjaFBhbmVsLnByb3RvdHlwZS5zZWFyY2ggPSBmdW5jdGlvbihxdWVyeSwgbm9kZXMpIHtcclxuICAgIHZhciByZXN1bHRzID0gW107XHJcbiAgICBcclxuICAgIFxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG5vZGUgPSBub2Rlc1tpXS5kYXRhO1xyXG4gICAgICAgIHZhciBtYXRjaCA9IHRydWU7XHJcbiAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IHF1ZXJ5Lmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIC8vIFRleHQgc2VhcmNoIGNvbXBhcmVzIGFnYWluc3QgYW55IHRleHQgaW4gdGhlIGRlbW9cclxuICAgICAgICAgICAgLy8gSWYgaXQgZG9lc250IGZpbmQgdGhlIHN0cmluZyBhbnl3aGVyZSBpdCBmYWlscyB0aGUgc2VhcmNoIGltbWVkaWF0ZWx5XHJcbiAgICAgICAgICAgIGlmKHF1ZXJ5W2pdLnR5cGUgPT09IFwiVGV4dFwiKSB7XHJcbiAgICAgICAgICAgICAgICBpZihub2RlLnRpdGxlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihxdWVyeVtqXS52YWx1ZS50b0xvd2VyQ2FzZSgpKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZihub2RlLnNlcmllcy50b0xvd2VyQ2FzZSgpLmluZGV4T2YocXVlcnlbal0udmFsdWUudG9Mb3dlckNhc2UoKSkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKG5vZGUuZGVzY3JpcHRpb24udG9Mb3dlckNhc2UoKS5pbmRleE9mKHF1ZXJ5W2pdLnZhbHVlLnRvTG93ZXJDYXNlKCkpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2ggPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrOyAvLyBubyBtYXRjaC4gZG9uJ3QgY29tcGFyZSBhbnl0aGluZyBlbHNlIGZvciB0aGlzIHJlcG8uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gbGFuZ3VhZ2UgbXVzdCBtYXRjaCBzZWxlY3RlZCBsYW5ndWFnZVxyXG4gICAgICAgICAgICBlbHNlIGlmKHF1ZXJ5W2pdLnR5cGUgPT09IFwiTGFuZ3VhZ2VcIikge1xyXG4gICAgICAgICAgICAgICAgaWYobm9kZS5sYW5ndWFnZSAhPT0gcXVlcnlbal0udmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXRjaCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIHRhZyBtdXN0IG1hdGNoIHNlbGVjdGVkIHRhZ1xyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHZhciB0YWdNYXRjaCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgZm9yKHZhciBrID0gMDsgayA8IG5vZGUudGFncy5sZW5ndGg7IGsrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKG5vZGUudGFnc1trXSA9PSBxdWVyeVtqXS52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWdNYXRjaCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYodGFnTWF0Y2ggPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXRjaCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vaWYgd2UgcGFzc2VkIGFsbCB0aGF0IGNyYXAsIHdlIGhhdmUgYSBtYXRjaCFcclxuICAgICAgICBpZihtYXRjaCA9PT0gdHJ1ZSkgeyBcclxuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKG5vZGVzW2ldKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJldHVybiByZXN1bHRzO1xyXG59O1xyXG5cclxuXHJcblNlYXJjaFBhbmVsLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihjYW52YXNTdGF0ZSwgdGltZSkge1xyXG4gICAgXHJcbiAgICAvL3RyYW5zaXRpb24gb25cclxuICAgIGlmKHRoaXMudHJhbnNpdGlvbk9uKSB7XHJcbiAgICAgICAgaWYodGhpcy50cmFuc2l0aW9uVGltZSA8IDEpIHtcclxuICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9uVGltZSArPSB0aW1lLmRlbHRhVGltZSAqIDM7XHJcbiAgICAgICAgICAgIGlmKHRoaXMudHJhbnNpdGlvblRpbWUgPj0gMSkge1xyXG4gICAgICAgICAgICAgICAgLy9kb25lIHRyYW5zaXRpb25pbmdcclxuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvblRpbWUgPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy90cmFuc2l0aW9uIG9mZlxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgaWYodGhpcy50cmFuc2l0aW9uVGltZSA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9uVGltZSAtPSB0aW1lLmRlbHRhVGltZSAqIDM7XHJcbiAgICAgICAgICAgIGlmKHRoaXMudHJhbnNpdGlvblRpbWUgPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgLy9kb25lIHRyYW5zaXRpb25pbmdcclxuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvblRpbWUgPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2VhcmNoUGFuZWw7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuLi9jb250YWluZXJzL1BvaW50LmpzJyk7XHJcbnZhciBOb2RlTGFiZWwgPSByZXF1aXJlKCcuL05vZGVMYWJlbC5qcycpO1xyXG52YXIgQnV0dG9uID0gcmVxdWlyZSgnLi4vY29udGFpbmVycy9CdXR0b24uanMnKTtcclxuXHJcbnZhciBob3Jpem9udGFsU3BhY2luZyA9IDE4MDtcclxudmFyIGJhc2VTaXplID0gMjQ7XHJcblxyXG52YXIgVHV0b3JpYWxTdGF0ZSA9IHtcclxuICAgIExvY2tlZDogMCxcclxuICAgIFVubG9ja2VkOiAxLFxyXG4gICAgQ29tcGxldGVkOiAyXHJcbn07XHJcblxyXG52YXIgVHV0b3JpYWxUYWdzID0ge1xyXG4gICAgXCJBSVwiOiBcIiM4MDRcIixcclxuICAgIFwiQXVkaW9cIjogXCIjMDQ4XCIsXHJcbiAgICBcIkNvbXB1dGVyIFNjaWVuY2VcIjogXCIjMTExXCIsXHJcbiAgICBcIkNvcmVcIjogXCIjMzMzXCIsXHJcbiAgICBcIkdyYXBoaWNzXCI6IFwiI2MwY1wiLFxyXG4gICAgXCJJbnB1dFwiOiBcIiM4ODBcIixcclxuICAgIFwiTWF0aFwiOiBcIiM0ODRcIixcclxuICAgIFwiTmV0d29ya2luZ1wiOiBcIiNjNjBcIixcclxuICAgIFwiT3B0aW1pemF0aW9uXCI6IFwiIzI4MlwiLFxyXG4gICAgXCJQaHlzaWNzXCI6IFwiIzA0OFwiLFxyXG4gICAgXCJTY3JpcHRpbmdcIjogXCIjMDg4XCIsXHJcbiAgICBcIlNvZnR3YXJlRW5naW5lZXJpbmdcIjogXCIjODQ0XCJcclxufTtcclxuXHJcblxyXG4vL21ha2UgYSBub2RlIHdpdGggc29tZSBkYXRhXHJcbmZ1bmN0aW9uIFR1dG9yaWFsTm9kZShKU09OQ2h1bmspIHtcclxuICAgIHRoaXMuZGF0YSA9IEpTT05DaHVuaztcclxuICAgIHRoaXMucHJpbWFyeVRhZyA9IHRoaXMuZGF0YS50YWdzWzBdO1xyXG4gICAgdGhpcy5jb2xvciA9IFR1dG9yaWFsVGFnc1t0aGlzLnByaW1hcnlUYWddO1xyXG4gICAgXHJcbiAgICBcclxuICAgIHRoaXMubW91c2VPdmVyID0gZmFsc2U7XHJcbiAgICBcclxuICAgIFxyXG4gICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBQb2ludCgwLCAwKTtcclxuICAgIHRoaXMucHJldmlvdXNQb3NpdGlvbiA9IG5ldyBQb2ludCgwLCAwKTtcclxuICAgIHRoaXMubmV4dFBvc2l0aW9uID0gbmV3IFBvaW50KDAsIDApO1xyXG4gICAgXHJcbiAgICB0aGlzLnNpemUgPSAyNDtcclxuICAgIHRoaXMubGFiZWwgPSBuZXcgTm9kZUxhYmVsKHRoaXMpO1xyXG4gICAgICAgIFxyXG4gICAgdGhpcy5uZXh0Tm9kZXMgPSBbXTtcclxuICAgIHRoaXMucHJldmlvdXNOb2RlcyA9IFtdO1xyXG4gICAgXHJcbiAgICAvLyBDcmVhdGUgc3ViIGJ1dHRvbnMuXHJcbiAgICB0aGlzLmRldGFpbHNCdXR0b24gPSBuZXcgQnV0dG9uKG5ldyBQb2ludCgwLCAwKSwgbmV3IFBvaW50KDEyMCwgMjQpLCBcIk1vcmVcIiwgdGhpcy5jb2xvcik7XHJcbiAgICB0aGlzLmNvbXBsZXRpb25CdXR0b24gPSBuZXcgQnV0dG9uKG5ldyBQb2ludCgwLCAwKSwgbmV3IFBvaW50KDEyMCwgMjQpLCBcIlwiLCB0aGlzLmNvbG9yKTtcclxufTtcclxuXHJcblxyXG4vLyBTZXQgdXAgdGhlIHN0YXR1cyBvZiB0aGUgbm9kZSB0byBtYXRjaCB0aGF0IHNhdmVkIGluIGJyb3dzZXIgbWVtb3J5LlxyXG5UdXRvcmlhbE5vZGUucHJvdG90eXBlLmZldGNoU3RhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIFxyXG4gICAgdGhpcy5zdGF0ZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMuZGF0YS5uYW1lKTtcclxuICAgIGlmKHRoaXMuc3RhdGUgPT0gbnVsbCB8fCB0aGlzLnN0YXRlID09IFR1dG9yaWFsU3RhdGUuTG9ja2VkKSB7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFR1dG9yaWFsU3RhdGUuTG9ja2VkO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIERlZmF1bHQgdG8gdW5sb2NrZWQgaWYgdGhlcmUgYXJlIG5vIHByZXZpb3VzIG5vZGVzLlxyXG4gICAgICAgIGlmKHRoaXMucHJldmlvdXNOb2Rlcy5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gVHV0b3JpYWxTdGF0ZS5VbmxvY2tlZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIENoYW5nZXMgdGhlIHN0YXRlIG9mIHRoaXMgbm9kZVxyXG5UdXRvcmlhbE5vZGUucHJvdG90eXBlLmNoYW5nZVN0YXRlID0gZnVuY3Rpb24odHV0U3RhdGUpIHtcclxuICAgIGlmKHRoaXMuc3RhdGUgPT0gVHV0b3JpYWxTdGF0ZS5Mb2NrZWQpIHtcclxuICAgICAgICBpZih0dXRTdGF0ZSA9PSBUdXRvcmlhbFN0YXRlLlVubG9ja2VkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSB0dXRTdGF0ZTtcclxuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5kYXRhLm5hbWUsIHRoaXMuc3RhdGUpO1xyXG4gICAgICAgICAgICAvLyBVbmxvY2sgZnJvbSBhIGxvY2tlZCBwb3NpdGlvbiBkb2Vzbid0IG5lZWQgdG8gY2hhbmdlIGFueSBvdGhlciBub2Rlcy5cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZih0dXRTdGF0ZSA9PSBUdXRvcmlhbFN0YXRlLkNvbXBsZXRlZCkge1xyXG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gdHV0U3RhdGU7XHJcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuZGF0YS5uYW1lLCB0aGlzLnN0YXRlKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIENvbXBsZXRlIGZyb20gYSBsb2NrZWQgcG9zaXRpb24gbmVlZHMgdG8gYXR0ZW1wdCB0byB1bmxvY2sgbGF0ZXIgdGhpbmdzLlxyXG4gICAgICAgICAgICB0aGlzLm5leHROb2Rlcy5mb3JFYWNoKChjaGlsZCk9PntcclxuICAgICAgICAgICAgICAgIHZhciBzaG91bGRCZUxvY2tlZCA9IGNoaWxkLnByZXZpb3VzTm9kZXMuc29tZSgocHJlcmVxKT0+e1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAocHJlcmVxLnN0YXRlICE9IFR1dG9yaWFsU3RhdGUuQ29tcGxldGVkKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgaWYoIXNob3VsZEJlTG9ja2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQuY2hhbmdlU3RhdGUoVHV0b3JpYWxTdGF0ZS5VbmxvY2tlZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2UgaWYodGhpcy5zdGF0ZSA9PSBUdXRvcmlhbFN0YXRlLlVubG9ja2VkKSB7XHJcbiAgICAgICAgaWYodHV0U3RhdGUgPT0gVHV0b3JpYWxTdGF0ZS5Mb2NrZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IHR1dFN0YXRlO1xyXG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLmRhdGEubmFtZSwgdGhpcy5zdGF0ZSk7XHJcbiAgICAgICAgICAgIC8vIExvY2tlZCBmcm9tIHVubG9ja2VkIHBvc2l0aW9uIGRvZXNuJ3QgYWZmZWN0IGFueXRoaW5nXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYodHV0U3RhdGUgPT0gVHV0b3JpYWxTdGF0ZS5Db21wbGV0ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IHR1dFN0YXRlO1xyXG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLmRhdGEubmFtZSwgdGhpcy5zdGF0ZSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBjb21wbGV0ZWQgZnJvbSB1bmxvY2tlZCBzaG91bGQgdW5sb2NrIG5leHQgdGhpbmdzLlxyXG4gICAgICAgICAgICB0aGlzLm5leHROb2Rlcy5mb3JFYWNoKChjaGlsZCk9PntcclxuICAgICAgICAgICAgICAgIHZhciBzaG91bGRCZUxvY2tlZCA9IGNoaWxkLnByZXZpb3VzTm9kZXMuc29tZSgocHJlcmVxKT0+e1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAocHJlcmVxLnN0YXRlICE9IFR1dG9yaWFsU3RhdGUuQ29tcGxldGVkKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgaWYoIXNob3VsZEJlTG9ja2VkICYmIGNoaWxkLnN0YXRlID09IFR1dG9yaWFsU3RhdGUuTG9ja2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQuY2hhbmdlU3RhdGUoVHV0b3JpYWxTdGF0ZS5VbmxvY2tlZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2UgaWYgKHRoaXMuc3RhdGUgPT0gVHV0b3JpYWxTdGF0ZS5Db21wbGV0ZWQpIHtcclxuICAgICAgICBpZih0dXRTdGF0ZSA9PSBUdXRvcmlhbFN0YXRlLkxvY2tlZCkge1xyXG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gdHV0U3RhdGU7XHJcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuZGF0YS5uYW1lLCB0aGlzLnN0YXRlKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIGxvY2tpbmcgc29tZXRoaW5nIHRoYXQgd2FzIGNvbXBsZXRlZCBzaG91bGQgbG9jayBsYXRlciB0aGluZ3MuXHJcbiAgICAgICAgICAgIHRoaXMubmV4dE5vZGVzLmZvckVhY2goKGNoaWxkKT0+e1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuY2hhbmdlU3RhdGUoVHV0b3JpYWxTdGF0ZS5Mb2NrZWQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZih0dXRTdGF0ZSA9PSBUdXRvcmlhbFN0YXRlLlVubG9ja2VkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSB0dXRTdGF0ZTtcclxuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5kYXRhLm5hbWUsIHRoaXMuc3RhdGUpO1xyXG4gICAgICAgICAgICAvLyB1bmxvY2tpbmcgc29tZXRoaW5nIHRoYXQgd2FzIGNvbXBsZXRlZCBzaG91bGQgbG9jayBsYXRlciB0aGluZ3MuXHJcbiAgICAgICAgICAgIHRoaXMubmV4dE5vZGVzLmZvckVhY2goKGNoaWxkKT0+e1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuY2hhbmdlU3RhdGUoVHV0b3JpYWxTdGF0ZS5Mb2NrZWQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gYWxzbyBpZiB0aGlzIHRoaW5nIGRvZXNuJ3QgaGF2ZSBpdCdzIHByZXJlcXMgbWV0LCBpdCBzaG91bGQgZ28gc3RyYWlnaHQgdG8gYmVpbmcgbG9ja2VkXHJcbiAgICAgICAgICAgIHZhciBzaG91bGRCZUxvY2tlZCA9IHRoaXMucHJldmlvdXNOb2Rlcy5zb21lKChwcmVyZXEpPT57XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKHByZXJlcS5zdGF0ZSAhPSBUdXRvcmlhbFN0YXRlLkNvbXBsZXRlZCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZihzaG91bGRCZUxvY2tlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFR1dG9yaWFsU3RhdGUuTG9ja2VkO1xyXG4gICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5kYXRhLm5hbWUsIHRoaXMuc3RhdGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vL3JlY3Vyc2l2ZSBmdW5jdGlvbiB0byBnZXQgcHJldmlvdXMgbm9kZXNcclxuVHV0b3JpYWxOb2RlLnByb3RvdHlwZS5nZXRQcmV2aW91cyA9IGZ1bmN0aW9uKGRlcHRoKSB7XHJcbiAgICB2YXIgcmVzdWx0ID0gW3RoaXNdO1xyXG4gICAgaWYoZGVwdGggPiAwKSB7XHJcbiAgICAgICAgdGhpcy5wcmV2aW91c05vZGVzLmZvckVhY2goKG5vZGUpPT57XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQobm9kZS5nZXRQcmV2aW91cyhkZXB0aC0xKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59O1xyXG5cclxuXHJcblxyXG4vL3JlY3Vyc2l2ZSBmdW5jdGlvbiB0byBnZXQgbmV4dCBub2Rlc1xyXG5UdXRvcmlhbE5vZGUucHJvdG90eXBlLmdldE5leHQgPSBmdW5jdGlvbihkZXB0aCkge1xyXG4gICAgdmFyIHJlc3VsdCA9IFt0aGlzXTtcclxuICAgIGlmKGRlcHRoID4gMCkge1xyXG4gICAgICAgIHRoaXMubmV4dE5vZGVzLmZvckVhY2goKG5vZGUpPT57XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQobm9kZS5nZXROZXh0KGRlcHRoLTEpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn07XHJcblxyXG5cclxuLy8gVXBkYXRlcyBhbGwgbm9kZXMgc3RhcnRpbmcgd2l0aCBvbmUsIGFuZCBleHRlbmRpbmcgb3V0d2FyZC5cclxuLy8gZGlyZWN0aW9uIGlzIHRoZSBzaWRlIG9mIHRoZSBwYXJlbnQgdGhpcyBub2RlIGV4aXN0cyBvbiAoLTEsIDAsIDEpIDAgaXMgYm90aC5cclxuLy8gbGF5ZXIgZGVwdGggaXMgaG93IG1hbnkgbGF5ZXJzIHRvIHJlbmRlciBvdXRcclxuVHV0b3JpYWxOb2RlLnByb3RvdHlwZS5yZWN1cnNpdmVVcGRhdGUgPSBmdW5jdGlvbihkaXJlY3Rpb24sIGRlcHRoKSB7XHJcbiAgICBpZihkZXB0aCA+IDApIHtcclxuICAgICAgICAvLyBsZWZ0IG9yIG1pZGRsZVxyXG4gICAgICAgIGlmKGRpcmVjdGlvbiA8IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5wcmV2aW91c05vZGVzLmZvckVhY2goKG5vZGUpPT57XHJcbiAgICAgICAgICAgICAgICBub2RlLnJlY3Vyc2l2ZVVwZGF0ZSgtMSwgZGVwdGggLSAxKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHJpZ2h0IG9yIG1pZGRsZVxyXG4gICAgICAgIGlmKGRpcmVjdGlvbiA+IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMubmV4dE5vZGVzLmZvckVhY2goKG5vZGUpPT57XHJcbiAgICAgICAgICAgICAgICBub2RlLnJlY3Vyc2l2ZVVwZGF0ZSgxLCBkZXB0aCAtIDEpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vL3VwZGF0ZXMgYSBub2RlXHJcbi8vdHJhbnNpdGlvbiB0aW1lIGlzIDEtMCwgd2l0aCAwIGJlaW5nIHRoZSBmaW5hbCBsb2NhdGlvblxyXG5UdXRvcmlhbE5vZGUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKG1vdXNlU3RhdGUsIHRpbWUsIHRyYW5zaXRpb25UaW1lLCBpc0ZvY3VzZWQpIHtcclxuICAgIFxyXG4gICAgLy9tb3ZlIHRoZSBub2RlXHJcbiAgICBpZih0aGlzLnBvc2l0aW9uICE9IHRoaXMubmV4dFBvc2l0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi54ID0gKHRoaXMucHJldmlvdXNQb3NpdGlvbi54ICogdHJhbnNpdGlvblRpbWUpICsgKHRoaXMubmV4dFBvc2l0aW9uLnggKiAoMSAtIHRyYW5zaXRpb25UaW1lKSk7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi55ID0gKHRoaXMucHJldmlvdXNQb3NpdGlvbi55ICogdHJhbnNpdGlvblRpbWUpICsgKHRoaXMubmV4dFBvc2l0aW9uLnkgKiAoMSAtIHRyYW5zaXRpb25UaW1lKSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGlmKGlzRm9jdXNlZCkge1xyXG4gICAgICAgIHRoaXMuc2l6ZSA9IDM2O1xyXG4gICAgXHJcbiAgICAgICAgaWYodGhpcy5zdGF0ZSA9PSBUdXRvcmlhbFN0YXRlLkNvbXBsZXRlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbXBsZXRpb25CdXR0b24udGV4dCA9IFwiTWFyayBVbmNvbXBsZXRlXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmNvbXBsZXRpb25CdXR0b24udGV4dCA9IFwiTWFyayBDb21wbGV0ZVwiO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIC8vdGVzdCBpZiBtb3VzZSBpcyBpbnNpZGUgY2lyY2xlXHJcbiAgICAgICAgdmFyIGR4ID0gbW91c2VTdGF0ZS5yZWxhdGl2ZVBvc2l0aW9uLnggLSB0aGlzLnBvc2l0aW9uLng7XHJcbiAgICAgICAgdmFyIGR5ID0gbW91c2VTdGF0ZS5yZWxhdGl2ZVBvc2l0aW9uLnkgLSB0aGlzLnBvc2l0aW9uLnk7XHJcbiAgICAgICAgaWYoKGR4ICogZHgpICsgKGR5ICogZHkpIDwgdGhpcy5zaXplICogdGhpcy5zaXplKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2l6ZSA9IDMwO1xyXG4gICAgICAgICAgICB0aGlzLm1vdXNlT3ZlciA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNpemUgPSAyNDtcclxuICAgICAgICAgICAgdGhpcy5tb3VzZU92ZXIgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIFxyXG4gICAgXHJcbiAgICB0aGlzLmxhYmVsLnVwZGF0ZShtb3VzZVN0YXRlLCB0aW1lLCBpc0ZvY3VzZWQpO1xyXG4gICAgXHJcbiAgICBpZihpc0ZvY3VzZWQpIHtcclxuICAgICAgICB0aGlzLmRldGFpbHNCdXR0b24ucG9zaXRpb24ueCA9IHRoaXMucG9zaXRpb24ueCAtIHRoaXMuZGV0YWlsc0J1dHRvbi5zaXplLnggLyAyIC0gMztcclxuICAgICAgICB0aGlzLmRldGFpbHNCdXR0b24ucG9zaXRpb24ueSA9IHRoaXMucG9zaXRpb24ueSArIHRoaXMuc2l6ZSArIDEyO1xyXG4gICAgICAgIHRoaXMuZGV0YWlsc0J1dHRvbi51cGRhdGUobW91c2VTdGF0ZSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jb21wbGV0aW9uQnV0dG9uLnBvc2l0aW9uLnggPSB0aGlzLnBvc2l0aW9uLnggLSB0aGlzLmNvbXBsZXRpb25CdXR0b24uc2l6ZS54IC8gMiAtIDM7XHJcbiAgICAgICAgdGhpcy5jb21wbGV0aW9uQnV0dG9uLnBvc2l0aW9uLnkgPSB0aGlzLnBvc2l0aW9uLnkgKyB0aGlzLnNpemUgKyA0ODtcclxuICAgICAgICB0aGlzLmNvbXBsZXRpb25CdXR0b24udXBkYXRlKG1vdXNlU3RhdGUpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuXHJcblR1dG9yaWFsTm9kZS5wcm90b3R5cGUuY2FsY3VsYXRlTm9kZVRyZWUgPSBmdW5jdGlvbihsYXllckRlcHRoLCBwYXJlbnQsIGRpcmVjdGlvbikge1xyXG4gICAgXHJcbiAgICAvLyBJZiB0aGUgbm9kZSBhbHJlYWR5IGV4aXN0cyBpbiB0aGUgZ3JhcGggaW4gYSBiZXR0ZXIgcGxhY2UgdGhhbiB0aGlzIG9uZSwgZG9udCB1c2UgaXRcclxuICAgIGlmKHRoaXMuY3VycmVudExheWVyRGVwdGggPiBsYXllckRlcHRoKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB0aGlzLmN1cnJlbnRMYXllckRlcHRoID0gbGF5ZXJEZXB0aDtcclxuICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xyXG4gICAgXHJcbiAgICBpZihsYXllckRlcHRoID4gMCkge1xyXG4gICAgICAgIC8vIGxlZnQgb3IgbWlkZGxlXHJcbiAgICAgICAgaWYoZGlyZWN0aW9uIDwgMSkge1xyXG4gICAgICAgICAgICB0aGlzLnByZXZpb3VzTm9kZXMuZm9yRWFjaCgobm9kZSk9PntcclxuICAgICAgICAgICAgICAgIG5vZGUuY2FsY3VsYXRlTm9kZVRyZWUobGF5ZXJEZXB0aCAtIDEsIHRoaXMsIC0xKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIHJpZ2h0IG9yIG1pZGRsZVxyXG4gICAgICAgIGlmKGRpcmVjdGlvbiA+IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMubmV4dE5vZGVzLmZvckVhY2goKG5vZGUpPT57XHJcbiAgICAgICAgICAgICAgICBub2RlLmNhbGN1bGF0ZU5vZGVUcmVlKGxheWVyRGVwdGggLSAxLCB0aGlzLCAxKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuVHV0b3JpYWxOb2RlLnByb3RvdHlwZS5zZXRUcmFuc2l0aW9uID0gZnVuY3Rpb24obGF5ZXJEZXB0aCwgcGFyZW50LCBkaXJlY3Rpb24sIHRhcmdldFBvc2l0aW9uKSB7XHJcbiAgICBcclxuICAgIGlmKCF0aGlzLndhc1ByZXZpb3VzbHlPblNjcmVlbiAmJiBwYXJlbnQgIT0gbnVsbCkge1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBuZXcgUG9pbnQodGFyZ2V0UG9zaXRpb24ueCwgdGFyZ2V0UG9zaXRpb24ueSk7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi54ICo9IDEuNTtcclxuICAgIH1cclxuICAgIHRoaXMucHJldmlvdXNQb3NpdGlvbiA9IHRoaXMucG9zaXRpb247XHJcbiAgICB0aGlzLm5leHRQb3NpdGlvbiA9IHRhcmdldFBvc2l0aW9uO1xyXG4gICAgXHJcbiAgICAvL2ZpZ3VyZSBvdXQgc2l6ZSBvZiBjaGlsZHJlbiB0byBzcGFjZSB0aGVtIG91dCBhcHByb3ByaWF0ZWx5XHJcbiAgICBpZihsYXllckRlcHRoID4gMCkge1xyXG4gICAgICAgIHZhciB4UG9zaXRpb247XHJcbiAgICAgICAgdmFyIHlQb3NpdGlvbjtcclxuICAgICAgICBcclxuICAgICAgICAvL2xlZnQgb3IgbWlkZGxlXHJcbiAgICAgICAgaWYoZGlyZWN0aW9uIDwgMSkge1xyXG4gICAgICAgICAgICB4UG9zaXRpb24gPSB0YXJnZXRQb3NpdGlvbi54IC0gaG9yaXpvbnRhbFNwYWNpbmc7ICAgLy8gY2FsY3VsYXRlIHRoZSB4IHBvc2l0aW9uIGZvciBuZXh0IG5vZGVzXHJcbiAgICAgICAgICAgIGlmKGRpcmVjdGlvbiA9PSAwKSB4UG9zaXRpb24gLT0gNjA7ICAgICAgICAgICAgICAgICAvLyBiYXNlZCBvbiBvZmZzZXQgZnJvbSBwYXJlbnQgbm9kZS5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZpcnN0IHNwYWNlIGlzIGxhcmdlciB0aGFuIHRoZSBvdGhlcnMuXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBkZXRlcm1pbmUgaGVpZ2h0IG9mIHRoaXMgYW5kIGFsbCBjaGlsZCBub2Rlc1xyXG4gICAgICAgICAgICB2YXIgdG90YWxMZWZ0SGVpZ2h0ID0gdGhpcy5nZXRQcmV2aW91c0hlaWdodChsYXllckRlcHRoKTtcclxuICAgICAgICAgICAgeVBvc2l0aW9uID0gdGFyZ2V0UG9zaXRpb24ueSAtICh0b3RhbExlZnRIZWlnaHQgLyAyKTsgICAvLyBjZW50ZXIgdmVydGljYWxseVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gTG9vcCBvdmVyIGNoaWxkcmVuIGFuZCBzZXQgdGhlbSB1cCBhcyB3ZWxsLiAoaWYgdGhleSBhcmUgY2hpbGRyZW4gb2YgdGhpcyBub2RlKVxyXG4gICAgICAgICAgICB0aGlzLnByZXZpb3VzTm9kZXMuZm9yRWFjaCgobm9kZSk9PntcclxuICAgICAgICAgICAgICAgIGlmKG5vZGUucGFyZW50ID09IHRoaXMpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcGxhY2VtZW50ID0gbmV3IFBvaW50KHhQb3NpdGlvbiwgeVBvc2l0aW9uICsgbm9kZS5jdXJyZW50SGVpZ2h0IC8gMik7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5zZXRUcmFuc2l0aW9uKGxheWVyRGVwdGggLSAxLCB0aGlzLCAtMSwgcGxhY2VtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICB5UG9zaXRpb24gKz0gbm9kZS5jdXJyZW50SGVpZ2h0OyAgICAvLyBJbmNyZW1lbnQgeSBwb3NpdGlvbiBvZiBub2RlIGVhY2ggdGltZSB0byBzcGFjZSB0aGVtIG91dCBjb3JyZWN0bHkuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvL3JpZ2h0IG9yIG1pZGRsZVxyXG4gICAgICAgIGlmKGRpcmVjdGlvbiA+IC0xKSB7XHJcbiAgICAgICAgICAgIHhQb3NpdGlvbiA9IHRhcmdldFBvc2l0aW9uLnggKyBob3Jpem9udGFsU3BhY2luZzsgICAvLyBjYWxjdWxhdGUgdGhlIHggcG9zaXRpb24gZm9yIG5leHQgbm9kZXNcclxuICAgICAgICAgICAgaWYoZGlyZWN0aW9uID09IDApIHhQb3NpdGlvbiArPSA2MDsgICAgICAgICAgICAgICAgIC8vIGJhc2VkIG9uIG9mZnNldCBmcm9tIHBhcmVudCBub2RlLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZmlyc3Qgc3BhY2UgaXMgbGFyZ2VyIHRoYW4gdGhlIG90aGVycy5cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIERldGVybWluZSBoZWlnaHQgb2YgdGhpcyBhbmQgYWxsIGNoaWxkIG5vZGVzLlxyXG4gICAgICAgICAgICB2YXIgdG90YWxSaWdodEhlaWdodCA9IHRoaXMuZ2V0TmV4dEhlaWdodChsYXllckRlcHRoKTtcclxuICAgICAgICAgICAgeVBvc2l0aW9uID0gdGFyZ2V0UG9zaXRpb24ueSAtICh0b3RhbFJpZ2h0SGVpZ2h0IC8gMik7ICAvLyBjZW50ZXIgdmVydGljYWxseS5cclxuXHJcbiAgICAgICAgICAgIC8vIExvb3Agb3ZlciBjaGlsZHJlbiBhbmQgc2V0IHRoZW0gdXAgYXMgd2VsbC4gKGlmIHRoZXkgYXJlIGNoaWxkcmVuIG9mIHRoaXMgbm9kZSlcclxuICAgICAgICAgICAgdGhpcy5uZXh0Tm9kZXMuZm9yRWFjaCgobm9kZSk9PntcclxuICAgICAgICAgICAgICAgIGlmKG5vZGUucGFyZW50ID09IHRoaXMpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcGxhY2VtZW50ID0gbmV3IFBvaW50KHhQb3NpdGlvbiwgeVBvc2l0aW9uICsgbm9kZS5jdXJyZW50SGVpZ2h0IC8gMik7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5zZXRUcmFuc2l0aW9uKGxheWVyRGVwdGggLSAxLCB0aGlzLCAxLCBwbGFjZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHlQb3NpdGlvbiArPSBub2RlLmN1cnJlbnRIZWlnaHQ7ICAgIC8vIEluY3JlbWVudCB5IHBvc2l0aW9uIG9mIG5vZGUgZWFjaCB0aW1lIHRvIHNwYWNlIHRoZW0gb3V0IGNvcnJlY3RseS5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gQ2FsY3VsYXRlcyB0aGUgdG90YWwgaGVpZ2h0IG9mIHRoaXMgbm9kZSBhbmQgYWxsIGNoaWxkIG5vZGVzIHRvIHRoZSBsZWZ0IHJlY3Vyc2l2ZWx5XHJcblR1dG9yaWFsTm9kZS5wcm90b3R5cGUuZ2V0UHJldmlvdXNIZWlnaHQgPSBmdW5jdGlvbihsYXllckRlcHRoKSB7XHJcbiAgICB0aGlzLmN1cnJlbnRIZWlnaHQgPSAwO1xyXG4gICAgaWYobGF5ZXJEZXB0aCA+IDAgJiYgdGhpcy5wcmV2aW91c05vZGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICB0aGlzLnByZXZpb3VzTm9kZXMuZm9yRWFjaCgobm9kZSk9PntcclxuICAgICAgICAgICAgaWYobm9kZS5wYXJlbnQgPT0gdGhpcykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50SGVpZ2h0ICs9IG5vZGUuZ2V0UHJldmlvdXNIZWlnaHQobGF5ZXJEZXB0aCAtIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBpZih0aGlzLmN1cnJlbnRIZWlnaHQgPT0gMCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudEhlaWdodCA9IGJhc2VTaXplICogNTsgIC8vIGVuZCBjYXNlIGZvciBzaW5nbGUgbm9kZXNcclxuICAgIH1cclxuICAgIFxyXG4gICAgcmV0dXJuIHRoaXMuY3VycmVudEhlaWdodDtcclxufTtcclxuXHJcbi8vIENhbGN1bGF0ZXMgdGhlIHRvdGFsIGhlaWdodCBvZiB0aGlzIG5vZGUgYW5kIGFsbCBjaGlsZCBub2RlcyB0byB0aGUgcmlnaHQgcmVjdXJzaXZlbHlcclxuVHV0b3JpYWxOb2RlLnByb3RvdHlwZS5nZXROZXh0SGVpZ2h0ID0gZnVuY3Rpb24obGF5ZXJEZXB0aCkge1xyXG4gICAgXHJcbiAgICAvLyBDb3VudCB1cCBzaXplIG9mIGFsbCBjaGlsZCBub2Rlc1xyXG4gICAgdGhpcy5jdXJyZW50SGVpZ2h0ID0gMDtcclxuICAgIGlmKGxheWVyRGVwdGggPiAwICYmIHRoaXMubmV4dE5vZGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICB0aGlzLm5leHROb2Rlcy5mb3JFYWNoKChub2RlKT0+e1xyXG4gICAgICAgICAgICBpZihub2RlLnBhcmVudCA9PSB0aGlzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRIZWlnaHQgKz0gbm9kZS5nZXROZXh0SGVpZ2h0KGxheWVyRGVwdGggLSAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgaWYodGhpcy5jdXJyZW50SGVpZ2h0ID09IDApIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRIZWlnaHQgPSBiYXNlU2l6ZSAqIDU7ICAvLyBlbmQgY2FzZSBmb3Igc2luZ2xlIG5vZGVzXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJldHVybiB0aGlzLmN1cnJlbnRIZWlnaHQ7XHJcbn07XHJcblxyXG5cclxuVHV0b3JpYWxOb2RlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24ocENhbnZhc1N0YXRlLCBwUGFpbnRlciwgZ3JhcGgsIHBhcmVudENhbGxlciwgZGlyZWN0aW9uLCBsYXllckRlcHRoKSB7XHJcbiAgICAvL2RyYXcgbGluZSB0byBwYXJlbnQgaWYgcG9zc2libGVcclxuICAgIGlmKHBhcmVudENhbGxlciAmJiBwYXJlbnRDYWxsZXIgPT0gdGhpcy5wYXJlbnQpIHtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LnNhdmUoKTtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LmxpbmVXaWR0aCA9IDI7XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5zdHJva2VTdHlsZSA9IFwiI2ZmZlwiO1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy92YXIgYmV0d2VlbiA9IG5ldyBQb2ludCh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSk7XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5tb3ZlVG8odGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnkpO1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHgubGluZVRvKHBhcmVudENhbGxlci5wb3NpdGlvbi54LCBwYXJlbnRDYWxsZXIucG9zaXRpb24ueSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5jbG9zZVBhdGgoKTtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LnN0cm9rZSgpO1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHgucmVzdG9yZSgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyBkcmF3IGNoaWxkIG5vZGVzXHJcbiAgICBpZihsYXllckRlcHRoID4gMCl7XHJcbiAgICAgICAgLy8gbGVmdCBhbmQgbWlkZGxlXHJcbiAgICAgICAgaWYoZGlyZWN0aW9uIDwgMSkge1xyXG4gICAgICAgICAgICB0aGlzLnByZXZpb3VzTm9kZXMuZm9yRWFjaCgobm9kZSk9PntcclxuICAgICAgICAgICAgICAgIG5vZGUuZHJhdyhwQ2FudmFzU3RhdGUsIHBQYWludGVyLCBncmFwaCwgdGhpcywgLTEsIGxheWVyRGVwdGggLSAxKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHJpZ2h0IGFuZCBtaWRkbGVcclxuICAgICAgICBpZihkaXJlY3Rpb24gPiAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLm5leHROb2Rlcy5mb3JFYWNoKChub2RlKT0+e1xyXG4gICAgICAgICAgICAgICAgbm9kZS5kcmF3KHBDYW52YXNTdGF0ZSwgcFBhaW50ZXIsIGdyYXBoLCB0aGlzLCAxLCBsYXllckRlcHRoIC0gMSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gZHJhdyBjaXJjbGVcclxuICAgIHBQYWludGVyLmNpcmNsZShwQ2FudmFzU3RhdGUuY3R4LCB0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSwgdGhpcy5zaXplLCB0cnVlLCB0aGlzLmNvbG9yLCB0cnVlLCBcIiNmZmZcIiwgMik7XHJcbiAgICBcclxuICAgIC8vIGRyYXcgYSBjaGVja21hcmtcclxuICAgIGlmKHRoaXMuc3RhdGUgPT0gVHV0b3JpYWxTdGF0ZS5Db21wbGV0ZWQpIHtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LmRyYXdJbWFnZShncmFwaC5jaGVja0ltYWdlLCB0aGlzLnBvc2l0aW9uLnggLSAzMiwgdGhpcy5wb3NpdGlvbi55IC0gMzIpO1xyXG4gICAgfVxyXG4gICAgLy8gZHJhdyBhIGxvY2tcclxuICAgIGlmKHRoaXMuc3RhdGUgPT0gVHV0b3JpYWxTdGF0ZS5Mb2NrZWQpIHtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LmRyYXdJbWFnZShncmFwaC5sb2NrSW1hZ2UsIHRoaXMucG9zaXRpb24ueCAtIDMyLCB0aGlzLnBvc2l0aW9uLnkgLSAzMik7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIGRyYXcgdGhlIGxhYmVsXHJcbiAgICB0aGlzLmxhYmVsLmRyYXcocENhbnZhc1N0YXRlLCBwUGFpbnRlcik7XHJcbiAgICBpZihkaXJlY3Rpb24gPT0gMCkge1xyXG4gICAgICAgIHRoaXMuZGV0YWlsc0J1dHRvbi5kcmF3KHBDYW52YXNTdGF0ZSwgcFBhaW50ZXIpO1xyXG4gICAgICAgIHRoaXMuY29tcGxldGlvbkJ1dHRvbi5kcmF3KHBDYW52YXNTdGF0ZSwgcFBhaW50ZXIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFR1dG9yaWFsTm9kZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuZnVuY3Rpb24gRHJhd2xpYigpe1xyXG59O1xyXG5cclxuRHJhd2xpYi5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbihjdHgsIHgsIHksIHcsIGgpIHtcclxuICAgIGN0eC5jbGVhclJlY3QoeCwgeSwgdywgaCk7XHJcbn07XHJcblxyXG5EcmF3bGliLnByb3RvdHlwZS5yZWN0ID0gZnVuY3Rpb24oY3R4LCB4LCB5LCB3LCBoLCBjb2wpIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gY29sO1xyXG4gICAgY3R4LmZpbGxSZWN0KHgsIHksIHcsIGgpO1xyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxufTtcclxuXHJcbkRyYXdsaWIucHJvdG90eXBlLnJvdW5kZWRSZWN0ID0gZnVuY3Rpb24oY3R4LCB4LCB5LCB3LCBoLCByYWQsIGZpbGwsIGZpbGxDb2xvciwgb3V0bGluZSwgb3V0bGluZUNvbG9yLCBvdXRsaW5lV2lkdGgpIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHgubW92ZVRvKHgsIHkgLSByYWQpOyAvLzExIG8gY2xvY2tcclxuICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIGN0eC5saW5lVG8oeCArIHcsIHkgLSByYWQpOyAvLzEgbyBjbG9ja1xyXG4gICAgY3R4LmFyY1RvKHggKyB3ICsgcmFkLCB5IC0gcmFkLCB4ICsgdyArIHJhZCwgeSwgcmFkKTsgLy8gMiBvIGNsb2NrXHJcbiAgICBjdHgubGluZVRvKHggKyB3ICsgcmFkLCB5ICsgaCk7IC8vIDQgbyBjbG9ja1xyXG4gICAgY3R4LmFyY1RvKHggKyB3ICsgcmFkLCB5ICsgaCArIHJhZCwgeCArIHcsIHkgKyBoICsgcmFkLCByYWQpIC8vNSBvIGNsb2NrXHJcbiAgICBjdHgubGluZVRvKHgsIHkgKyBoICsgcmFkKTsgLy8gNyBvIGNsb2NrXHJcbiAgICBjdHguYXJjVG8oeCAtIHJhZCwgeSArIGggKyByYWQsIHggLSByYWQsIHkgKyBoLCByYWQpIC8vOCBvIGNsb2NrXHJcbiAgICBjdHgubGluZVRvKHggLSByYWQsIHkpOyAvLyAxMCBvIGNsb2NrXHJcbiAgICBjdHguYXJjVG8oeCAtIHJhZCwgeSAtIHJhZCwgeCwgeSAtcmFkLCByYWQpIC8vMTEgbyBjbG9ja1xyXG4gICAgY3R4LmNsb3NlUGF0aCgpO1xyXG4gICAgaWYoZmlsbCkge1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBmaWxsQ29sb3I7XHJcbiAgICAgICAgY3R4LmZpbGwoKTtcclxuICAgIH1cclxuICAgIGlmKG91dGxpbmUpIHtcclxuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBvdXRsaW5lQ29sb3I7XHJcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IG91dGxpbmVXaWR0aDtcclxuICAgICAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICB9XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG59XHJcblxyXG5EcmF3bGliLnByb3RvdHlwZS5saW5lID0gZnVuY3Rpb24oY3R4LCB4MSwgeTEsIHgyLCB5MiwgdGhpY2tuZXNzLCBjb2xvcikge1xyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIGN0eC5tb3ZlVG8oeDEsIHkxKTtcclxuICAgIGN0eC5saW5lVG8oeDIsIHkyKTtcclxuICAgIGN0eC5saW5lV2lkdGggPSB0aGlja25lc3M7XHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBjb2xvcjtcclxuICAgIGN0eC5zdHJva2UoKTtcclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbn07XHJcblxyXG5EcmF3bGliLnByb3RvdHlwZS5jaXJjbGUgPSBmdW5jdGlvbihjdHgsIHgsIHksIHJhZGl1cywgZmlsbCwgZmlsbENvbG9yLCBvdXRsaW5lLCBvdXRsaW5lQ29sb3IsIG91dGxpbmVXaWR0aCkge1xyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIGN0eC5hcmMoeCx5LCByYWRpdXMsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSk7XHJcbiAgICBjdHguY2xvc2VQYXRoKCk7XHJcbiAgICBpZihmaWxsKSB7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGZpbGxDb2xvcjtcclxuICAgICAgICBjdHguZmlsbCgpO1xyXG4gICAgfVxyXG4gICAgaWYob3V0bGluZSkge1xyXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IG91dGxpbmVDb2xvcjtcclxuICAgICAgICBjdHgubGluZVdpZHRoID0gb3V0bGluZVdpZHRoO1xyXG4gICAgICAgIGN0eC5zdHJva2UoKTtcclxuICAgIH1cclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbn07XHJcblxyXG5EcmF3bGliLnByb3RvdHlwZS50ZXh0VG9MaW5lcyA9IGZ1bmN0aW9uKGN0eCwgdGV4dCwgZm9udCwgd2lkdGgpIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHguZm9udCA9IGZvbnQ7XHJcbiAgICBcclxuICAgIHZhciBsaW5lcyA9IFtdO1xyXG4gICAgXHJcbiAgICB3aGlsZSAodGV4dC5sZW5ndGgpIHtcclxuICAgICAgICB2YXIgaSwgajtcclxuICAgICAgICBmb3IoaSA9IHRleHQubGVuZ3RoOyBjdHgubWVhc3VyZVRleHQodGV4dC5zdWJzdHIoMCwgaSkpLndpZHRoID4gd2lkdGg7IGktLSk7XHJcblxyXG4gICAgICAgIHZhciByZXN1bHQgPSB0ZXh0LnN1YnN0cigwLGkpO1xyXG5cclxuICAgICAgICBpZiAoaSAhPT0gdGV4dC5sZW5ndGgpXHJcbiAgICAgICAgICAgIGZvcih2YXIgaiA9IDA7IHJlc3VsdC5pbmRleE9mKFwiIFwiLCBqKSAhPT0gLTE7IGogPSByZXN1bHQuaW5kZXhPZihcIiBcIiwgaikgKyAxKTtcclxuXHJcbiAgICAgICAgbGluZXMucHVzaChyZXN1bHQuc3Vic3RyKDAsIGogfHwgcmVzdWx0Lmxlbmd0aCkpO1xyXG4gICAgICAgIHdpZHRoID0gTWF0aC5tYXgod2lkdGgsIGN0eC5tZWFzdXJlVGV4dChsaW5lc1tsaW5lcy5sZW5ndGggLSAxXSkud2lkdGgpO1xyXG4gICAgICAgIHRleHQgID0gdGV4dC5zdWJzdHIobGluZXNbbGluZXMubGVuZ3RoIC0gMV0ubGVuZ3RoLCB0ZXh0Lmxlbmd0aCk7XHJcbiAgICB9XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG4gICAgcmV0dXJuIGxpbmVzO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBEcmF3bGliOyIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuLi9jb250YWluZXJzL1BvaW50LmpzJyk7XHJcblxyXG5mdW5jdGlvbiBVdGlsaXRpZXMoKXtcclxufVxyXG5cclxuLy9CT0FSRFBIQVNFIC0gc2V0IGEgc3RhdHVzIHZhbHVlIG9mIGEgbm9kZSBpbiBsb2NhbFN0b3JhZ2UgYmFzZWQgb24gSURcclxuVXRpbGl0aWVzLnByb3RvdHlwZS5zZXRQcm9ncmVzcyA9IGZ1bmN0aW9uKHBPYmplY3Qpe1xyXG4gICAgdmFyIHByb2dyZXNzU3RyaW5nID0gbG9jYWxTdG9yYWdlLnByb2dyZXNzO1xyXG4gICAgXHJcbiAgICB2YXIgdGFyZ2V0T2JqZWN0ID0gcE9iamVjdDtcclxuICAgIC8vbWFrZSBhY2NvbW9kYXRpb25zIGlmIHRoaXMgaXMgYW4gZXh0ZW5zaW9uIG5vZGVcclxuICAgIHZhciBleHRlbnNpb25mbGFnID0gdHJ1ZTtcclxuICAgIHdoaWxlKGV4dGVuc2lvbmZsYWcpe1xyXG4gICAgICAgIGlmKHRhcmdldE9iamVjdC50eXBlID09PSBcImV4dGVuc2lvblwiKXtcclxuICAgICAgICAgICAgdGFyZ2V0T2JqZWN0ID0gdGFyZ2V0T2JqZWN0LmNvbm5lY3Rpb25Gb3J3YXJkWzBdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICBleHRlbnNpb25mbGFnID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICB2YXIgb2JqZWN0SUQgPSB0YXJnZXRPYmplY3QuZGF0YS5faWQ7XHJcbiAgICB2YXIgb2JqZWN0U3RhdHVzID0gdGFyZ2V0T2JqZWN0LnN0YXR1cztcclxuICAgIFxyXG4gICAgLy9zZWFyY2ggdGhlIHByb2dyZXNzU3RyaW5nIGZvciB0aGUgY3VycmVudCBJRFxyXG4gICAgdmFyIGlkSW5kZXggPSBwcm9ncmVzc1N0cmluZy5pbmRleE9mKG9iamVjdElEKTtcclxuICAgIFxyXG4gICAgLy9pZiBpdCdzIG5vdCBhZGQgaXQgdG8gdGhlIGVuZFxyXG4gICAgaWYoaWRJbmRleCA9PT0gLTEpe1xyXG4gICAgICAgIHByb2dyZXNzU3RyaW5nICs9IG9iamVjdElEICsgXCJcIiArIG9iamVjdFN0YXR1cyArIFwiLFwiO1xyXG4gICAgfVxyXG4gICAgLy9vdGhlcndpc2UgbW9kaWZ5IHRoZSBzdGF0dXMgdmFsdWVcclxuICAgIGVsc2V7XHJcbiAgICAgICAgcHJvZ3Jlc3NTdHJpbmcgPSBwcm9ncmVzc1N0cmluZy5zdWJzdHIoMCwgb2JqZWN0SUQubGVuZ3RoICsgaWRJbmRleCkgKyBvYmplY3RTdGF0dXMgKyBwcm9ncmVzc1N0cmluZy5zdWJzdHIob2JqZWN0SUQubGVuZ3RoICsgMSArIGlkSW5kZXgsIHByb2dyZXNzU3RyaW5nLmxlbmd0aCkgKyBcIlwiO1xyXG4gICAgfVxyXG4gICAgbG9jYWxTdG9yYWdlLnByb2dyZXNzID0gcHJvZ3Jlc3NTdHJpbmc7XHJcbn1cclxuXHJcbi8vcmV0dXJucyBtb3VzZSBwb3NpdGlvbiBpbiBsb2NhbCBjb29yZGluYXRlIHN5c3RlbSBvZiBlbGVtZW50XHJcblV0aWxpdGllcy5wcm90b3R5cGUuZ2V0TW91c2UgPSBmdW5jdGlvbihlKXtcclxuICAgIHJldHVybiBuZXcgUG9pbnQoKGUucGFnZVggLSBlLnRhcmdldC5vZmZzZXRMZWZ0KSwgKGUucGFnZVkgLSBlLnRhcmdldC5vZmZzZXRUb3ApKTtcclxufVxyXG5cclxuVXRpbGl0aWVzLnByb3RvdHlwZS5tYXAgPSBmdW5jdGlvbih2YWx1ZSwgbWluMSwgbWF4MSwgbWluMiwgbWF4Mil7XHJcbiAgICByZXR1cm4gbWluMiArIChtYXgyIC0gbWluMikgKiAoKHZhbHVlIC0gbWluMSkgLyAobWF4MSAtIG1pbjEpKTtcclxufVxyXG5cclxuLy9saW1pdHMgdGhlIHVwcGVyIGFuZCBsb3dlciBsaW1pdHMgb2YgdGhlIHBhcmFtZXRlciB2YWx1ZVxyXG5VdGlsaXRpZXMucHJvdG90eXBlLmNsYW1wID0gZnVuY3Rpb24odmFsdWUsIG1pbiwgbWF4KXtcclxuICAgIHJldHVybiBNYXRoLm1heChtaW4sIE1hdGgubWluKG1heCwgdmFsdWUpKTtcclxufVxyXG5cclxuLy9jaGVja3MgbW91c2UgY29sbGlzaW9uIG9uIGNhbnZhc1xyXG5VdGlsaXRpZXMucHJvdG90eXBlLm1vdXNlSW50ZXJzZWN0ID0gZnVuY3Rpb24ocE1vdXNlU3RhdGUsIHBFbGVtZW50LCBwT2Zmc2V0dGVyLCBwU2NhbGUpe1xyXG4gICAgLy9pZiB0aGUgeCBwb3NpdGlvbiBjb2xsaWRlc1xyXG4gICAgaWYocEVsZW1lbnQuc3RhdHVzICE9PSBcIjBcIil7XHJcbiAgICAgICAgaWYocE1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbi54ICsgcE9mZnNldHRlci54ID4gKHBFbGVtZW50LnBvc2l0aW9uLnggLSAocEVsZW1lbnQud2lkdGgpLzIpICYmIHBNb3VzZVN0YXRlLnJlbGF0aXZlUG9zaXRpb24ueCArIHBPZmZzZXR0ZXIueCA8IChwRWxlbWVudC5wb3NpdGlvbi54ICsgKHBFbGVtZW50LndpZHRoKS8yKSl7XHJcbiAgICAgICAgICAgIC8vaWYgdGhlIHkgcG9zaXRpb24gY29sbGlkZXNcclxuICAgICAgICAgICAgaWYocE1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbi55ICsgcE9mZnNldHRlci55ID4gKHBFbGVtZW50LnBvc2l0aW9uLnkgLSAocEVsZW1lbnQuaGVpZ2h0KS8yKSAmJiBwTW91c2VTdGF0ZS5yZWxhdGl2ZVBvc2l0aW9uLnkgKyBwT2Zmc2V0dGVyLnkgPCAocEVsZW1lbnQucG9zaXRpb24ueSArIChwRWxlbWVudC5oZWlnaHQpLzIpKXtcclxuICAgICAgICAgICAgICAgICAgICBwRWxlbWVudC5tb3VzZU92ZXIgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICBwRWxlbWVudC5tb3VzZU92ZXIgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICBwRWxlbWVudC5tb3VzZU92ZXIgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVXRpbGl0aWVzOyJdfQ==
