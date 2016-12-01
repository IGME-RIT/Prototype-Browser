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
        node.fetchState();
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
    this.completionButton = new Button(new Point(0, 0), new Point(120, 24), "Mark Uncomplete", this.color);
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
    
    if(this.state == TutorialState.Completed) {
        this.completionButton.text = "Mark Unomplete";
    }
    else {
        this.completionButton.text = "Mark Complete";
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
                if(!shouldBeLocked) {
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9tYWluLmpzIiwianMvbW9kdWxlcy9HYW1lLmpzIiwianMvbW9kdWxlcy9jb250YWluZXJzL0J1dHRvbi5qcyIsImpzL21vZHVsZXMvY29udGFpbmVycy9DYW52YXNTdGF0ZS5qcyIsImpzL21vZHVsZXMvY29udGFpbmVycy9Nb3VzZVN0YXRlLmpzIiwianMvbW9kdWxlcy9jb250YWluZXJzL1BvaW50LmpzIiwianMvbW9kdWxlcy9jb250YWluZXJzL1RpbWUuanMiLCJqcy9tb2R1bGVzL2dyYXBoL0RldGFpbHNQYW5lbC5qcyIsImpzL21vZHVsZXMvZ3JhcGgvR3JhcGguanMiLCJqcy9tb2R1bGVzL2dyYXBoL05vZGVMYWJlbC5qcyIsImpzL21vZHVsZXMvZ3JhcGgvUGFyc2VyLmpzIiwianMvbW9kdWxlcy9ncmFwaC9TZWFyY2hQYW5lbC5qcyIsImpzL21vZHVsZXMvZ3JhcGgvVHV0b3JpYWxOb2RlLmpzIiwianMvbW9kdWxlcy90b29scy9EcmF3bGliLmpzIiwianMvbW9kdWxlcy90b29scy9VdGlsaXRpZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vaW1wb3J0c1xyXG52YXIgR2FtZSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9HYW1lLmpzJyk7XHJcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4vbW9kdWxlcy9jb250YWluZXJzL1BvaW50LmpzJyk7XHJcbnZhciBUaW1lID0gcmVxdWlyZSgnLi9tb2R1bGVzL2NvbnRhaW5lcnMvVGltZS5qcycpO1xyXG52YXIgTW91c2VTdGF0ZSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9jb250YWluZXJzL01vdXNlU3RhdGUuanMnKTtcclxudmFyIENhbnZhc1N0YXRlID0gcmVxdWlyZSgnLi9tb2R1bGVzL2NvbnRhaW5lcnMvQ2FudmFzU3RhdGUuanMnKTtcclxuXHJcbi8vZ2FtZSBvYmplY3RzXHJcbnZhciBnYW1lO1xyXG52YXIgY2FudmFzO1xyXG52YXIgY3R4O1xyXG52YXIgdGltZTtcclxuXHJcbi8vcmVzcG9uc2l2ZW5lc3NcclxudmFyIGhlYWRlcjtcclxudmFyIGNlbnRlcjtcclxudmFyIHNjYWxlO1xyXG5cclxuLy9tb3VzZSBoYW5kbGluZ1xyXG52YXIgbW91c2VQb3NpdGlvbjtcclxudmFyIHJlbGF0aXZlTW91c2VQb3NpdGlvbjtcclxudmFyIG1vdXNlRG93bjtcclxudmFyIG1vdXNlSW47XHJcbnZhciB3aGVlbERlbHRhO1xyXG5cclxuLy9wYXNzYWJsZSBzdGF0ZXNcclxudmFyIG1vdXNlU3RhdGU7XHJcbnZhciBjYW52YXNTdGF0ZTtcclxuXHJcbi8vZmlyZXMgd2hlbiB0aGUgd2luZG93IGxvYWRzXHJcbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbihlKXtcclxuICAgIC8vZGVidWcgYnV0dG9uIGRlc2lnbmVkIHRvIGNsZWFyIHByb2dyZXNzIGRhdGFcclxuICAgIFxyXG4gICAgLy92YXJpYWJsZSBhbmQgbG9vcCBpbml0aWFsaXphdGlvblxyXG4gICAgaW5pdGlhbGl6ZVZhcmlhYmxlcygpO1xyXG4gICAgbG9vcCgpO1xyXG59XHJcblxyXG4vL2luaXRpYWxpemF0aW9uIGZvciB2YXJpYWJsZXMsIG1vdXNlIGV2ZW50cywgYW5kIGdhbWUgXCJjbGFzc1wiXHJcbmZ1bmN0aW9uIGluaXRpYWxpemVWYXJpYWJsZXMoKXtcclxuICAgIC8vY2FtdmFzIGluaXRpYWxpemF0aW9uXHJcbiAgICBjYW52YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdjYW52YXMnKTtcclxuICAgIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgXHJcbiAgICB0aW1lID0gbmV3IFRpbWUoKTtcclxuICAgIFxyXG4gICAgXHJcbiAgICAvL21vdXNlIHZhcmlhYmxlIGluaXRpYWxpemF0aW9uXHJcbiAgICBtb3VzZVBvc2l0aW9uID0gbmV3IFBvaW50KDAsMCk7XHJcbiAgICByZWxhdGl2ZU1vdXNlUG9zaXRpb24gPSBuZXcgUG9pbnQoMCwwKTtcclxuICAgIFxyXG4gICAgXHJcbiAgICBcclxuICAgIFxyXG4gICAgXHJcbiAgICAvL2V2ZW50IGxpc3RlbmVycyBmb3IgbW91c2UgaW50ZXJhY3Rpb25zIHdpdGggdGhlIGNhbnZhc1xyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIHZhciBib3VuZFJlY3QgPSBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgbW91c2VQb3NpdGlvbiA9IG5ldyBQb2ludChlLmNsaWVudFggLSBib3VuZFJlY3QubGVmdCwgZS5jbGllbnRZIC0gYm91bmRSZWN0LnRvcCk7XHJcbiAgICAgICAgcmVsYXRpdmVNb3VzZVBvc2l0aW9uID0gbmV3IFBvaW50KG1vdXNlUG9zaXRpb24ueCAtIGNhbnZhcy5vZmZzZXRXaWR0aCAvIDIsIG1vdXNlUG9zaXRpb24ueSAtIGNhbnZhcy5vZmZzZXRIZWlnaHQgLyAyKTtcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICBtb3VzZURvd24gPSBmYWxzZTtcclxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIG1vdXNlRG93biA9IHRydWU7XHJcbiAgICB9KTtcclxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBmdW5jdGlvbihlKXtcclxuICAgICAgICBtb3VzZURvd24gPSBmYWxzZTtcclxuICAgIH0pO1xyXG4gICAgbW91c2VJbiA9IGZhbHNlO1xyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW92ZXJcIiwgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgbW91c2VJbiA9IHRydWU7XHJcbiAgICB9KTtcclxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VvdXRcIiwgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgbW91c2VJbiA9IGZhbHNlO1xyXG4gICAgICAgIG1vdXNlRG93biA9IGZhbHNlO1xyXG4gICAgfSk7XHJcbiAgICB3aGVlbERlbHRhID0gMDtcclxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V3aGVlbFwiLCBmdW5jdGlvbihlKXtcclxuICAgICAgICB3aGVlbERlbHRhID0gZS53aGVlbERlbHRhO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIFxyXG4gICAgXHJcbiAgICBcclxuICAgIC8vc3RhdGUgdmFyaWFibGUgaW5pdGlhbGl6YXRpb25cclxuICAgIG1vdXNlU3RhdGUgPSBuZXcgTW91c2VTdGF0ZShtb3VzZVBvc2l0aW9uLCByZWxhdGl2ZU1vdXNlUG9zaXRpb24sIG1vdXNlRG93biwgbW91c2VJbiwgd2hlZWxEZWx0YSk7XHJcbiAgICBjYW52YXNTdGF0ZSA9IG5ldyBDYW52YXNTdGF0ZShjYW52YXMsIGN0eCk7XHJcbiAgICBcclxuICAgIC8vbG9jYWwgc3RvcmFnZSBoYW5kbGluZyBmb3IgYWN0aXZlIG5vZGUgcmVjb3JkIGFuZCBwcm9ncmVzc1xyXG4gICAgaWYobG9jYWxTdG9yYWdlLmFjdGl2ZU5vZGUgPT09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgbG9jYWxTdG9yYWdlLmFjdGl2ZU5vZGUgPSAwO1xyXG4gICAgfVxyXG4gICAgaWYobG9jYWxTdG9yYWdlLnByb2dyZXNzID09PSB1bmRlZmluZWQpe1xyXG4gICAgICAgIGxvY2FsU3RvcmFnZS5wcm9ncmVzcyA9IFwiXCI7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vY3JlYXRlcyB0aGUgZ2FtZSBvYmplY3QgZnJvbSB3aGljaCBtb3N0IGludGVyYWN0aW9uIGlzIG1hbmFnZWRcclxuICAgIGdhbWUgPSBuZXcgR2FtZSgpO1xyXG59XHJcblxyXG4vL2ZpcmVzIG9uY2UgcGVyIGZyYW1lXHJcbmZ1bmN0aW9uIGxvb3AoKSB7XHJcbiAgICAvL2JpbmRzIGxvb3AgdG8gZnJhbWVzXHJcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGxvb3AuYmluZCh0aGlzKSk7XHJcbiAgICBcclxuICAgIHRpbWUudXBkYXRlKC4wMTY3KTtcclxuICAgIFxyXG4gICAgLy9mZWVkIGN1cnJlbnQgbW91c2UgdmFyaWFibGVzIGJhY2sgaW50byBtb3VzZSBzdGF0ZVxyXG4gICAgbW91c2VTdGF0ZS51cGRhdGUobW91c2VQb3NpdGlvbiwgcmVsYXRpdmVNb3VzZVBvc2l0aW9uLCBtb3VzZURvd24sIG1vdXNlSW4sIHdoZWVsRGVsdGEpO1xyXG4gICAgLy9yZXNldHRpbmcgd2hlZWwgZGVsdGFcclxuICAgIHdoZWVsRGVsdGEgPSAwO1xyXG4gICAgXHJcbiAgICAvL3VwZGF0ZSBnYW1lJ3MgdmFyaWFibGVzOiBwYXNzaW5nIGNvbnRleHQsIGNhbnZhcywgdGltZSwgY2VudGVyIHBvaW50LCB1c2FibGUgaGVpZ2h0LCBtb3VzZSBzdGF0ZVxyXG4gICAgXHJcbiAgICBnYW1lLnVwZGF0ZShtb3VzZVN0YXRlLCBjYW52YXNTdGF0ZSwgdGltZSk7XHJcbn07XHJcblxyXG4vL2xpc3RlbnMgZm9yIGNoYW5nZXMgaW4gc2l6ZSBvZiB3aW5kb3cgYW5kIGFkanVzdHMgdmFyaWFibGVzIGFjY29yZGluZ2x5XHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgY2FudmFzU3RhdGUudXBkYXRlKCk7XHJcbn0pO1xyXG5cclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG4vL2ltcG9ydGVkIG9iamVjdHNcclxudmFyIEdyYXBoID0gcmVxdWlyZSgnLi9ncmFwaC9HcmFwaC5qcycpO1xyXG52YXIgRHJhd0xpYiA9IHJlcXVpcmUoJy4vdG9vbHMvRHJhd2xpYi5qcycpO1xyXG52YXIgVXRpbGl0aWVzID0gcmVxdWlyZSgnLi90b29scy9VdGlsaXRpZXMuanMnKTtcclxudmFyIFBhcnNlciA9IHJlcXVpcmUoJy4vZ3JhcGgvUGFyc2VyLmpzJyk7XHJcblxyXG52YXIgZ3JhcGg7XHJcbnZhciBwYWludGVyO1xyXG52YXIgdXRpbGl0eTtcclxudmFyIG1vdXNlU3RhdGU7XHJcbnZhciBtb3VzZVRhcmdldDtcclxudmFyIGdyYXBoTG9hZGVkO1xyXG5cclxuZnVuY3Rpb24gR2FtZSgpeyAgICBcclxuICAgIHBhaW50ZXIgPSBuZXcgRHJhd0xpYigpO1xyXG4gICAgdXRpbGl0eSA9IG5ldyBVdGlsaXRpZXMoKTtcclxuICAgIFxyXG4gICAgZ3JhcGhMb2FkZWQgPSBmYWxzZTtcclxuICAgIG1vdXNlVGFyZ2V0ID0gMDtcclxuICAgIFxyXG4gICAgLy9pbnN0YW50aWF0ZSB0aGUgZ3JhcGhcclxuICAgIFBhcnNlcihcImh0dHBzOi8vYXRsYXMtYmFja2VuZC5oZXJva3VhcHAuY29tL3JlcG9zXCIsIChwSlNPTkRhdGEpPT4ge1xyXG4gICAgICAgIGdyYXBoID0gbmV3IEdyYXBoKHBKU09ORGF0YSk7XHJcbiAgICAgICAgZ3JhcGhMb2FkZWQgPSB0cnVlO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIC8vZ2l2ZSBtb3VzZVN0YXRlIGEgdmFsdWUgZnJvbSB0aGUgc3RhcnQgc28gaXQgZG9lc24ndCBwYXNzIHVuZGVmaW5lZCB0byBwcmV2aW91c1xyXG4gICAgbW91c2VTdGF0ZSA9IDA7XHJcbn1cclxuXHJcbi8vcGFzc2luZyBjb250ZXh0LCBjYW52YXMsIGRlbHRhIHRpbWUsIGNlbnRlciBwb2ludCwgbW91c2Ugc3RhdGVcclxuR2FtZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24obW91c2VTdGF0ZSwgY2FudmFzU3RhdGUsIHRpbWUpIHtcclxuICAgIFxyXG4gICAgaWYoZ3JhcGhMb2FkZWQpIHtcclxuICAgICAgICAvL3VwZGF0ZSBrZXkgdmFyaWFibGVzIGluIHRoZSBhY3RpdmUgcGhhc2VcclxuICAgICAgICBncmFwaC51cGRhdGUobW91c2VTdGF0ZSwgY2FudmFzU3RhdGUsIHRpbWUpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvL2RyYXcgYmFja2dyb3VuZCBhbmQgdGhlbiBncmFwaFxyXG4gICAgY2FudmFzU3RhdGUuY3R4LnNhdmUoKTtcclxuICAgIHBhaW50ZXIucmVjdChjYW52YXNTdGF0ZS5jdHgsIDAsIDAsIGNhbnZhc1N0YXRlLndpZHRoLCBjYW52YXNTdGF0ZS5oZWlnaHQsIFwiIzIyMlwiKTtcclxuICAgIGNhbnZhc1N0YXRlLmN0eC5yZXN0b3JlKCk7XHJcbiAgICBcclxuICAgIFxyXG4gICAgaWYoZ3JhcGhMb2FkZWQpIHtcclxuICAgICAgICBncmFwaC5kcmF3KGNhbnZhc1N0YXRlKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIC8vaWYgd2UgaGF2ZW50IGxvYWRlZCB0aGUgZGF0YSwgZGlzcGxheSBsb2FkaW5nLCBhbmQgd2FpdFxyXG4gICAgICAgIGNhbnZhc1N0YXRlLmN0eC5zYXZlKCk7XHJcbiAgICAgICAgY2FudmFzU3RhdGUuY3R4LmZvbnQgPSBcIjQwcHggQXJpYWxcIjtcclxuICAgICAgICBjYW52YXNTdGF0ZS5jdHguZmlsbFN0eWxlID0gXCIjZmZmXCI7XHJcbiAgICAgICAgY2FudmFzU3RhdGUuY3R4LnRleHRCYXNlbGluZSA9IFwibWlkZGxlXCI7XHJcbiAgICAgICAgY2FudmFzU3RhdGUuY3R4LnRleHRBbGlnbiA9IFwiY2VudGVyXCI7XHJcbiAgICAgICAgY2FudmFzU3RhdGUuY3R4LmZpbGxUZXh0KFwiTG9hZGluZy4uLlwiLCBjYW52YXNTdGF0ZS5jZW50ZXIueCwgY2FudmFzU3RhdGUuY2VudGVyLnkpO1xyXG4gICAgICAgIGNhbnZhc1N0YXRlLmN0eC5yZXN0b3JlKCk7XHJcbiAgICB9XHJcbiAgICBcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHYW1lOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIFBvaW50ID0gcmVxdWlyZSgnLi9Qb2ludC5qcycpO1xyXG5cclxuZnVuY3Rpb24gQnV0dG9uKHBvc2l0aW9uLCBzaXplLCB0ZXh0LCBjb2xvcikge1xyXG4gICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBQb2ludChwb3NpdGlvbi54LCBwb3NpdGlvbi55KTtcclxuICAgIHRoaXMuc2l6ZSA9IG5ldyBQb2ludChzaXplLngsIHNpemUueSk7XHJcbiAgICB0aGlzLnRleHQgPSB0ZXh0O1xyXG4gICAgdGhpcy5tb3VzZU92ZXIgPSBmYWxzZTtcclxuICAgIHRoaXMuY29sb3IgPSBjb2xvcjtcclxuICAgIHRoaXMub3V0bGluZVdpZHRoID0gMTtcclxufTtcclxuXHJcbi8vdXBkYXRlcyBidXR0b24sIHJldHVybnMgdHJ1ZSBpZiBjbGlja2VkXHJcbkJ1dHRvbi5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24ocE1vdXNlU3RhdGUpIHtcclxuICAgIFxyXG4gICAgdmFyIG0gPSBwTW91c2VTdGF0ZS5yZWxhdGl2ZVBvc2l0aW9uO1xyXG4gICAgaWYoIG0ueCA8IHRoaXMucG9zaXRpb24ueCB8fCBtLnggPiB0aGlzLnBvc2l0aW9uLnggKyB0aGlzLnNpemUueCB8fFxyXG4gICAgICAgIG0ueSA8IHRoaXMucG9zaXRpb24ueSB8fCBtLnkgPiB0aGlzLnBvc2l0aW9uLnkgKyB0aGlzLnNpemUueSkge1xyXG4gICAgICAgIHRoaXMubW91c2VPdmVyID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLm1vdXNlT3ZlciA9IHRydWU7XHJcbiAgICAgICAgaWYocE1vdXNlU3RhdGUubW91c2VEb3duICYmICFwTW91c2VTdGF0ZS5sYXN0TW91c2VEb3duKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcbkJ1dHRvbi5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKHBDYW52YXNTdGF0ZSwgcFBhaW50ZXIpIHtcclxuICAgIC8vZHJhdyBiYXNlIGJ1dHRvblxyXG4gICAgaWYodGhpcy5tb3VzZU92ZXIpIHtcclxuICAgICAgICB0aGlzLm91dGxpbmVXaWR0aCA9IDI7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLm91dGxpbmVXaWR0aCA9IDE7XHJcbiAgICB9XHJcbiAgICBwUGFpbnRlci5yZWN0KHBDYW52YXNTdGF0ZS5jdHgsXHJcbiAgICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueCAtIHRoaXMub3V0bGluZVdpZHRoLFxyXG4gICAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnkgLSB0aGlzLm91dGxpbmVXaWR0aCxcclxuICAgICAgICAgICAgICAgICAgdGhpcy5zaXplLnggKyAyICogdGhpcy5vdXRsaW5lV2lkdGgsXHJcbiAgICAgICAgICAgICAgICAgIHRoaXMuc2l6ZS55ICsgMiAqIHRoaXMub3V0bGluZVdpZHRoLCBcIiNmZmZcIik7XHJcblxyXG4gICAgcFBhaW50ZXIucmVjdChwQ2FudmFzU3RhdGUuY3R4LCB0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSwgdGhpcy5zaXplLngsIHRoaXMuc2l6ZS55LCB0aGlzLmNvbG9yKTtcclxuICAgIFxyXG4gICAgLy9kcmF3IHRleHQgb2YgYnV0dG9uXHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LnNhdmUoKTtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHguZm9udCA9IFwiMTRweCBBcmlhbFwiO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5maWxsU3R5bGUgPSBcIiNmZmZcIjtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHgudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHgudGV4dEJhc2VsaW5lID0gXCJtaWRkbGVcIjtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHguZmlsbFRleHQodGhpcy50ZXh0LCB0aGlzLnBvc2l0aW9uLnggKyB0aGlzLnNpemUueCAvIDIsIHRoaXMucG9zaXRpb24ueSArIHRoaXMuc2l6ZS55IC8gMik7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LnJlc3RvcmUoKTtcclxuICAgIFxyXG4gICAgXHJcbn07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCdXR0b247IiwiLy9Db250YWlucyBjYW52YXMgcmVsYXRlZCB2YXJpYWJsZXMgaW4gYSBzaW5nbGUgZWFzeS10by1wYXNzIG9iamVjdFxyXG5cInVzZSBzdHJpY3RcIjtcclxudmFyIFBvaW50ID0gcmVxdWlyZSgnLi9Qb2ludC5qcycpO1xyXG5cclxuXHJcbmZ1bmN0aW9uIENhbnZhc1N0YXRlKGNhbnZhcywgY3R4KSB7XHJcbiAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcclxuICAgIHRoaXMuY3R4ID0gY3R4O1xyXG4gICAgdGhpcy51cGRhdGUoKTtcclxufVxyXG5cclxuQ2FudmFzU3RhdGUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy53aWR0aCA9IHRoaXMuY2FudmFzLndpZHRoID0gdGhpcy5jYW52YXMub2Zmc2V0V2lkdGg7XHJcbiAgICB0aGlzLmhlaWdodCA9IHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuY2FudmFzLm9mZnNldEhlaWdodDtcclxuICAgIHRoaXMuY2VudGVyID0gbmV3IFBvaW50KHRoaXMuY2FudmFzLndpZHRoIC8gMiwgdGhpcy5jYW52YXMuaGVpZ2h0IC8gMik7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2FudmFzU3RhdGU7IiwiLy9rZWVwcyB0cmFjayBvZiBtb3VzZSByZWxhdGVkIHZhcmlhYmxlcy5cclxuLy9jYWxjdWxhdGVkIGluIG1haW4gYW5kIHBhc3NlZCB0byBnYW1lXHJcbi8vY29udGFpbnMgdXAgc3RhdGVcclxuLy9wb3NpdGlvblxyXG4vL3JlbGF0aXZlIHBvc2l0aW9uXHJcbi8vb24gY2FudmFzXHJcblwidXNlIHN0cmljdFwiO1xyXG5mdW5jdGlvbiBNb3VzZVN0YXRlKHBQb3NpdGlvbiwgcFJlbGF0aXZlUG9zaXRpb24sIHBNb3VzZURvd24sIHBNb3VzZUluLCBwV2hlZWxEZWx0YSl7XHJcbiAgICB0aGlzLnBvc2l0aW9uID0gcFBvc2l0aW9uO1xyXG4gICAgdGhpcy5yZWxhdGl2ZVBvc2l0aW9uID0gcFJlbGF0aXZlUG9zaXRpb247XHJcbiAgICB0aGlzLm1vdXNlRG93biA9IHBNb3VzZURvd247XHJcbiAgICB0aGlzLm1vdXNlSW4gPSBwTW91c2VJbjtcclxuICAgIHRoaXMud2hlZWxEZWx0YSA9IHBXaGVlbERlbHRhO1xyXG4gICAgXHJcbiAgICAvL3RyYWNraW5nIHByZXZpb3VzIG1vdXNlIHN0YXRlc1xyXG4gICAgdGhpcy5sYXN0UG9zaXRpb24gPSBwUG9zaXRpb247XHJcbiAgICB0aGlzLmxhc3RSZWxhdGl2ZVBvc2l0aW9uID0gcFJlbGF0aXZlUG9zaXRpb247XHJcbiAgICB0aGlzLmxhc3RNb3VzZURvd24gPSBwTW91c2VEb3duO1xyXG4gICAgdGhpcy5sYXN0TW91c2VJbiA9IHBNb3VzZUluO1xyXG4gICAgdGhpcy5sYXN0V2hlZWxEZWx0YSA9IHBXaGVlbERlbHRhXHJcbn1cclxuXHJcbk1vdXNlU3RhdGUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKHBQb3NpdGlvbiwgcFJlbGF0aXZlUG9zaXRpb24sIHBNb3VzZURvd24sIHBNb3VzZUluLCBwV2hlZWxEZWx0YSl7XHJcbiAgICB0aGlzLmxhc3RQb3NpdGlvbiA9IHRoaXMucG9zaXRpb247XHJcbiAgICB0aGlzLmxhc3RSZWxhdGl2ZVBvc2l0aW9uID0gdGhpcy5yZWxhdGl2ZVBvc2l0aW9uO1xyXG4gICAgdGhpcy5sYXN0TW91c2VEb3duID0gdGhpcy5tb3VzZURvd247XHJcbiAgICB0aGlzLmxhc3RNb3VzZUluID0gdGhpcy5tb3VzZUluO1xyXG4gICAgdGhpcy5sYXN0V2hlZWxEZWx0YSA9IHRoaXMud2hlZWxEZWx0YTtcclxuICAgIFxyXG4gICAgXHJcbiAgICB0aGlzLnBvc2l0aW9uID0gcFBvc2l0aW9uO1xyXG4gICAgdGhpcy5yZWxhdGl2ZVBvc2l0aW9uID0gcFJlbGF0aXZlUG9zaXRpb247XHJcbiAgICB0aGlzLm1vdXNlRG93biA9IHBNb3VzZURvd247XHJcbiAgICB0aGlzLm1vdXNlSW4gPSBwTW91c2VJbjtcclxuICAgIHRoaXMud2hlZWxEZWx0YSA9IHBXaGVlbERlbHRhO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1vdXNlU3RhdGU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmZ1bmN0aW9uIFBvaW50KHBYLCBwWSl7XHJcbiAgICB0aGlzLnggPSBwWDtcclxuICAgIHRoaXMueSA9IHBZO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQb2ludDsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmZ1bmN0aW9uIFRpbWUgKCkge1xyXG4gICAgdGhpcy50b3RhbFRpbWUgPSAwO1xyXG4gICAgdGhpcy5kZWx0YVRpbWUgPSAwO1xyXG59O1xyXG5cclxuVGltZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQpIHtcclxuICAgIHRoaXMudG90YWxUaW1lICs9IGR0O1xyXG4gICAgdGhpcy5kZWx0YVRpbWUgPSBkdDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGltZTsiLCJcInVzZSBzdHJpY3RcIlxyXG5cclxudmFyIFR1dG9yaWFsVGFncyA9IHtcclxuICAgIFwiQUlcIjogXCIjODA0XCIsXHJcbiAgICBcIkF1ZGlvXCI6IFwiIzA0OFwiLFxyXG4gICAgXCJDb21wdXRlciBTY2llbmNlXCI6IFwiIzExMVwiLFxyXG4gICAgXCJDb3JlXCI6IFwiIzMzM1wiLFxyXG4gICAgXCJHcmFwaGljc1wiOiBcIiNjMGNcIixcclxuICAgIFwiSW5wdXRcIjogXCIjODgwXCIsXHJcbiAgICBcIk1hdGhcIjogXCIjNDg0XCIsXHJcbiAgICBcIk5ldHdvcmtpbmdcIjogXCIjYzYwXCIsXHJcbiAgICBcIk9wdGltaXphdGlvblwiOiBcIiMyODJcIixcclxuICAgIFwiUGh5c2ljc1wiOiBcIiMwNDhcIixcclxuICAgIFwiU2NyaXB0aW5nXCI6IFwiIzA4OFwiLFxyXG4gICAgXCJTb2Z0d2FyZUVuZ2luZWVyaW5nXCI6IFwiIzg0NFwiXHJcbn07XHJcblxyXG5cclxuZnVuY3Rpb24gRGV0YWlsc1BhbmVsKGdyYXBoKSB7XHJcbiAgICB0aGlzLmdyYXBoID0gZ3JhcGg7XHJcbiAgICB0aGlzLm5vZGUgPSBudWxsO1xyXG4gICAgdGhpcy5kYXRhID0gbnVsbDtcclxuICAgIHRoaXMudHJhbnNpdGlvbk9uID0gZmFsc2U7XHJcbiAgICB0aGlzLnRyYW5zaXRpb25UaW1lID0gMDtcclxuICAgIHRoaXMuZGF0YURpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmlnaHRCYXJcIik7XHJcbn07XHJcblxyXG5EZXRhaWxzUGFuZWwucHJvdG90eXBlLmVuYWJsZSA9IGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgIHRoaXMubm9kZSA9IG5vZGU7XHJcbiAgICB0aGlzLmRhdGEgPSBub2RlLmRhdGE7XHJcbiAgICB0aGlzLnRyYW5zaXRpb25PbiA9IHRydWVcclxufTtcclxuXHJcbkRldGFpbHNQYW5lbC5wcm90b3R5cGUuZGlzYWJsZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5kYXRhRGl2LmlubmVySFRNTCA9IFwiXCI7XHJcbiAgICB0aGlzLnRyYW5zaXRpb25PbiA9IGZhbHNlO1xyXG59O1xyXG5cclxuRGV0YWlsc1BhbmVsLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihjYW52YXNTdGF0ZSwgdGltZSwgbm9kZSkge1xyXG4gICAgXHJcbiAgICAvL3VwZGF0ZSBub2RlIGlmIGl0cyBub3QgdGhlIHNhbWUgYW55bW9yZVxyXG4gICAgaWYodGhpcy5ub2RlICE9IG5vZGUpIHtcclxuICAgICAgICB0aGlzLm5vZGUgPSBub2RlO1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IG5vZGUuZGF0YTtcclxuICAgICAgICB0aGlzLmRhdGFEaXYuaW5uZXJIVE1MID0gdGhpcy5HZW5lcmF0ZURPTSgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBcclxuICAgIC8vdHJhbnNpdGlvbiBvblxyXG4gICAgaWYodGhpcy50cmFuc2l0aW9uT24pIHtcclxuICAgICAgICBpZih0aGlzLnRyYW5zaXRpb25UaW1lIDwgMSkge1xyXG4gICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25UaW1lICs9IHRpbWUuZGVsdGFUaW1lICogMztcclxuICAgICAgICAgICAgaWYodGhpcy50cmFuc2l0aW9uVGltZSA+PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAvL2RvbmUgdHJhbnNpdGlvbmluZ1xyXG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9uVGltZSA9IDE7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFEaXYuaW5uZXJIVE1MID0gdGhpcy5HZW5lcmF0ZURPTSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy90cmFuc2l0aW9uIG9mZlxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgaWYodGhpcy50cmFuc2l0aW9uVGltZSA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9uVGltZSAtPSB0aW1lLmRlbHRhVGltZSAqIDM7XHJcbiAgICAgICAgICAgIGlmKHRoaXMudHJhbnNpdGlvblRpbWUgPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgLy9kb25lIHRyYW5zaXRpb25pbmdcclxuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvblRpbWUgPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YSA9IG51bGw7IFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuRGV0YWlsc1BhbmVsLnByb3RvdHlwZS5HZW5lcmF0ZURPTSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGh0bWwgPSBcIjxoMT5cIit0aGlzLmRhdGEuc2VyaWVzK1wiOjwvaDE+PGgxPjxhIGhyZWY9XCIgKyB0aGlzLmRhdGEubGluayArIFwiPlwiK3RoaXMuZGF0YS50aXRsZStcIjwvYT48L2gxPlwiO1xyXG4gICAgaHRtbCArPSBcIjxhIGhyZWY9XCIgKyB0aGlzLmRhdGEubGluayArIFwiPjxpbWcgc3JjPWh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9JR01FLVJJVC9cIiArIHRoaXMuZGF0YS5uYW1lICtcclxuICAgICAgICBcIi9tYXN0ZXIvaWdtZV90aHVtYm5haWwucG5nIGFsdD1cIiArIHRoaXMuZGF0YS5saW5rICsgXCI+PC9hPlwiO1xyXG4gICAgXHJcbiAgICBodG1sICs9IFwiPHVsIGlkPSd0YWdzJz5cIjtcclxuICAgIGlmKHRoaXMuZGF0YS50YWdzLmxlbmd0aCAhPSAwKSB7XHJcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMuZGF0YS50YWdzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGh0bWwgKz0gXCI8bGkgc3R5bGU9J2JhY2tncm91bmQtY29sb3I6XCIgKyBUdXRvcmlhbFRhZ3NbdGhpcy5kYXRhLnRhZ3NbaV1dICsgXCInPlwiICsgdGhpcy5kYXRhLnRhZ3NbaV0gKyBcIjwvbGk+XCI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaHRtbCs9IFwiPC91bD5cIlxyXG4gICAgXHJcbiAgICBodG1sICs9IFwiPHA+XCIgKyB0aGlzLmRhdGEuZGVzY3JpcHRpb24gKyBcIjwvcD5cIjtcclxuICAgIC8vY29uc29sZS5sb2codGhpcy5kYXRhKTtcclxuICAgIGlmKHRoaXMuZGF0YS5leHRyYV9yZXNvdXJjZXMubGVuZ3RoICE9IDApIHtcclxuICAgICAgICBodG1sICs9IFwiPGgyPkFkZGl0aW9uYWwgUmVzb3VyY2VzOjwvaDI+XCI7XHJcbiAgICAgICAgaHRtbCArPSBcIjx1bD5cIjtcclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5kYXRhLmV4dHJhX3Jlc291cmNlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBodG1sICs9IFwiPGxpPjxhIGhyZWY9XCIgKyB0aGlzLmRhdGEuZXh0cmFfcmVzb3VyY2VzW2ldLmxpbmsgKyBcIj5cIiArIHRoaXMuZGF0YS5leHRyYV9yZXNvdXJjZXNbaV0udGl0bGUgKyBcIjwvYT48L2xpPlwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBodG1sICs9IFwiPC91bD5cIjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcmV0dXJuIGh0bWw7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IERldGFpbHNQYW5lbDsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIERyYXdMaWIgPSByZXF1aXJlKCcuLi90b29scy9EcmF3bGliLmpzJyk7XHJcbnZhciBTZWFyY2hQYW5lbCA9IHJlcXVpcmUoJy4vU2VhcmNoUGFuZWwuanMnKTtcclxudmFyIERldGFpbHNQYW5lbCA9IHJlcXVpcmUoJy4vRGV0YWlsc1BhbmVsLmpzJyk7XHJcbnZhciBUdXRvcmlhbE5vZGUgPSByZXF1aXJlKCcuL1R1dG9yaWFsTm9kZS5qcycpO1xyXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuLi9jb250YWluZXJzL1BvaW50LmpzJyk7XHJcblxyXG52YXIgZ3JhcGhMb2FkZWQ7XHJcbnZhciBtb3VzZVRhcmdldDtcclxuXHJcblxyXG52YXIgZ3JhcGhEZXB0aExpbWl0ID0gMjsgLy8gaG93IG1hbnkgdmFsdWVzIHRvIGV4cGFuZCB0b1xyXG52YXIgZGVidWdNb2RlID0gZmFsc2U7XHJcblxyXG5cclxudmFyIFR1dG9yaWFsU3RhdGUgPSB7XHJcbiAgICBMb2NrZWQ6IDAsXHJcbiAgICBVbmxvY2tlZDogMSxcclxuICAgIENvbXBsZXRlZDogMlxyXG59O1xyXG5cclxuXHJcbmZ1bmN0aW9uIEdyYXBoKHBKU09ORGF0YSkge1xyXG4gICAgXHJcbiAgICB0aGlzLnNlYXJjaFBhbmVsID0gbmV3IFNlYXJjaFBhbmVsKHRoaXMpO1xyXG4gICAgdGhpcy5kZXRhaWxzUGFuZWwgPSBuZXcgRGV0YWlsc1BhbmVsKHRoaXMpO1xyXG4gICAgdGhpcy5zZWFyY2hQYW5lbEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiT3B0aW9uc0J1dHRvblwiKTtcclxuICAgIHRoaXMuc2VhcmNoRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsZWZ0QmFyXCIpO1xyXG4gICAgdGhpcy5kYXRhRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyaWdodEJhclwiKTtcclxuICAgIHRoaXMuY2FudmFzRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtaWRkbGVCYXJcIik7XHJcblxyXG4gICAgLy8gbG9hZCBsb2NrIGltYWdlIGZvciBsb2NrZWQgbm9kZXMgYW5kIGNvbXBsZXRlZCBub2Rlc1xyXG4gICAgdGhpcy5sb2NrSW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuICAgIHRoaXMubG9ja0ltYWdlLnNyYyA9IFwiY29udGVudC91aS9Mb2NrLnBuZ1wiO1xyXG4gICAgdGhpcy5jaGVja0ltYWdlID0gbmV3IEltYWdlKCk7XHJcbiAgICB0aGlzLmNoZWNrSW1hZ2Uuc3JjID0gXCJjb250ZW50L3VpL0NoZWNrLnBuZ1wiO1xyXG5cclxuICAgIC8vY3JlYXRlIHBhaW50ZXIgb2JqZWN0IHRvIGhlbHAgZHJhdyBzdHVmZlxyXG4gICAgdGhpcy5wYWludGVyID0gbmV3IERyYXdMaWIoKTtcclxuXHJcbiAgICB0aGlzLm5vZGVzID0gW107XHJcbiAgICB0aGlzLmFjdGl2ZU5vZGVzID0gW107XHJcblxyXG4gICAgLy9wb3B1bGF0ZSB0aGUgYXJyYXlcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBwSlNPTkRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgZGF0YSA9IHBKU09ORGF0YVtpXTtcclxuICAgICAgICAvL2Vuc3VyZXMgdGhhdCB0aGUgY2h1bmsgY29udGFpbnMgYSBsaW5rXHJcbiAgICAgICAgaWYoZGF0YS50YWdzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICBpZihkZWJ1Z01vZGUpIGNvbnNvbGUubG9nKFwiUmVwbyBub3QgdGFnZ2VkOiBcIiArIGRhdGEubmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYoZGF0YS5pbWFnZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGlmKGRlYnVnTW9kZSkgY29uc29sZS5sb2coXCJSZXBvIHlhbWwgb3V0IG9mIGRhdGU6IFwiICsgZGF0YS5uYW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciBub2RlID0gbmV3IFR1dG9yaWFsTm9kZShkYXRhKTtcclxuICAgICAgICAgICAgdGhpcy5ub2Rlcy5wdXNoKG5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBsb29wIHRocm91Z2ggbm9kZXMgYW5kIGNvbm5lY3QgdGhlbSB0b2dldGhlci5cclxuICAgIHRoaXMubm9kZXMuZm9yRWFjaCgobm9kZSk9PntcclxuICAgICAgICBub2RlLmRhdGEuY29ubmVjdGlvbnMuZm9yRWFjaCgoY29ubmVjdGlvbik9PntcclxuICAgICAgICAgICAgdGhpcy5ub2Rlcy5mb3JFYWNoKChvdGhlck5vZGUpPT57XHJcbiAgICAgICAgICAgICAgICBpZihvdGhlck5vZGUuZGF0YS5zZXJpZXMgPT09IGNvbm5lY3Rpb24uc2VyaWVzICYmIG90aGVyTm9kZS5kYXRhLnRpdGxlID09PSBjb25uZWN0aW9uLnRpdGxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5wcmV2aW91c05vZGVzLnB1c2gob3RoZXJOb2RlKTtcclxuICAgICAgICAgICAgICAgICAgICBvdGhlck5vZGUubmV4dE5vZGVzLnB1c2gobm9kZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG5vZGUuZmV0Y2hTdGF0ZSgpO1xyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIHRoaXMudHJhbnNpdGlvblRpbWUgPSAwO1xyXG4gICAgdGhpcy5Gb2N1c05vZGUodGhpcy5ub2Rlc1swXSk7XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIHggKHNlYXJjaCkge1xyXG4gICAgICAgIGlmKHNlYXJjaC5vcGVuID09IHRydWUpIHtcclxuICAgICAgICAgICAgc2VhcmNoLnRyYW5zaXRpb25PbiA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2VhcmNoLnRyYW5zaXRpb25PbiA9IHRydWU7XHJcbiAgICAgICAgICAgIHNlYXJjaC5vcGVuID0gdHJ1ZTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZWFyY2h0ZXh0ZmllbGRcIikuc2VsZWN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2VhcmNoUGFuZWxCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHguYmluZCh0aGlzLnNlYXJjaFBhbmVsQnV0dG9uLCB0aGlzLnNlYXJjaFBhbmVsKSk7XHJcblxyXG59O1xyXG5cclxuXHJcblxyXG5cclxuR3JhcGgucHJvdG90eXBlLkZvY3VzTm9kZSA9IGZ1bmN0aW9uKGNlbnRlck5vZGUpIHtcclxuICAgIHRoaXMuZm9jdXNlZE5vZGUgPSBjZW50ZXJOb2RlO1xyXG4gICAgXHJcbiAgICB2YXIgbmV3Tm9kZXMgPSBbXTtcclxuICAgIFxyXG4gICAgLy9nZXQgbm9kZXMgdG8gZGVwdGggaW4gYm90aCBkaXJlY3Rpb25zLCBhbmQgYWRkIHRoZW0gdG8gdGhlIG5ldyBub2RlcyBhcnJheVxyXG4gICAgdmFyIHByZXZpb3VzTm9kZXMgPSB0aGlzLmZvY3VzZWROb2RlLmdldFByZXZpb3VzKGdyYXBoRGVwdGhMaW1pdCk7XHJcbiAgICBuZXdOb2RlcyA9IG5ld05vZGVzLmNvbmNhdChwcmV2aW91c05vZGVzKTtcclxuICAgIFxyXG4gICAgdmFyIG5leHROb2RlcyA9IHRoaXMuZm9jdXNlZE5vZGUuZ2V0TmV4dChncmFwaERlcHRoTGltaXQpO1xyXG4gICAgbmV3Tm9kZXMgPSBuZXdOb2Rlcy5jb25jYXQobmV4dE5vZGVzKTtcclxuICAgIFxyXG4gICAgXHJcbiAgICAvL2ZpbmQgcmVkdW5kYW5jaWVzIGZyb20gdGhlIG5ld05vZGVzLCBhbmQgbWFrZSBhIG5ldyBhcnJheSB3aXRob3V0IHRob3NlIHJlZHVuZGFuY2llcy5cclxuICAgIHZhciB0ZW1wID0gW107XHJcbiAgICBuZXdOb2Rlcy5mb3JFYWNoKChub2RlVG9DaGVjayk9PiB7XHJcbiAgICAgICAgaWYodGVtcC5ldmVyeSgoYWxyZWFkeUFkZGVkTm9kZSk9PntcclxuICAgICAgICAgICAgcmV0dXJuIG5vZGVUb0NoZWNrICE9IGFscmVhZHlBZGRlZE5vZGU7XHJcbiAgICAgICAgfSkpIHtcclxuICAgICAgICAgICAgdGVtcC5wdXNoKG5vZGVUb0NoZWNrKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIG5ld05vZGVzID0gdGVtcDtcclxuICAgIFxyXG4gICAgXHJcbiAgICBcclxuICAgIC8vIGNoZWNrIGlmIGFueSBvZiB0aGUgbm9kZXMgd2VyZSBwcmV2aW91c2x5IG9uIHNjcmVlblxyXG4gICAgLy8gKHRoaXMgaXMgdXNlZCB0byBkZXRlcm1pbmUgd2hlcmUgdGhleSBzaG91bGQgYXBwZWFyIGR1cmluZyB0aGUgdHJhbnNpdGlvbiBhbmltYXRpb24pXHJcbiAgICB0aGlzLmFjdGl2ZU5vZGVzLmZvckVhY2goKG5vZGUpPT57XHJcbiAgICAgICAgbm9kZS53YXNQcmV2aW91c2x5T25TY3JlZW4gPSBuZXdOb2Rlcy5zb21lKChuZXdOb2RlKT0+e1xyXG4gICAgICAgICAgICByZXR1cm4gbm9kZSA9PSBuZXdOb2RlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIHRoaXMuYWN0aXZlTm9kZXMgPSBuZXdOb2RlcztcclxuICAgIFxyXG4gICAgLy9jbGVhciB0aGVpciBwYXJlbnQgZGF0YSBmb3IgbmV3IG5vZGVcclxuICAgIHRoaXMuYWN0aXZlTm9kZXMuZm9yRWFjaCgobm9kZSk9PntcclxuICAgICAgICBub2RlLmN1cnJlbnRMYXllckRlcHRoID0gMDtcclxuICAgICAgICBub2RlLnBhcmVudCA9IG51bGw7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgLy8gU3RhcnQgYW5pbWF0aW9uLlxyXG4gICAgdGhpcy50cmFuc2l0aW9uVGltZSA9IDE7XHJcbiAgICAvLyBGaWd1cmUgb3V0IHdoZXJlIGV2ZXJ5dGhpbmcgbmVlZHMgdG8gYmUuXHJcbiAgICB0aGlzLmZvY3VzZWROb2RlLmNhbGN1bGF0ZU5vZGVUcmVlKGdyYXBoRGVwdGhMaW1pdCwgbnVsbCwgMCk7XHJcbiAgICB0aGlzLmZvY3VzZWROb2RlLnNldFRyYW5zaXRpb24oZ3JhcGhEZXB0aExpbWl0LCBudWxsLCAwLCBuZXcgUG9pbnQoMCwgMCkpO1xyXG59O1xyXG5cclxuR3JhcGgucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKG1vdXNlU3RhdGUsIGNhbnZhc1N0YXRlLCB0aW1lKSB7XHJcbiAgICBcclxuICAgIC8vIHVwZGF0ZSB0cmFuc2l0aW9uIHRpbWUgaWYgaXQgbmVlZHMgdG8gYmUgdXBkYXRlZC5cclxuICAgIGlmKHRoaXMudHJhbnNpdGlvblRpbWUgPiAwKSB7XHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uVGltZSAtPSB0aW1lLmRlbHRhVGltZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uVGltZSA9IDA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIExvb3Agb3ZlciBhbmQgdXBkYXRlIGFjdGl2ZSBub2Rlc1xyXG4gICAgdmFyIG1vdXNlT3Zlck5vZGUgPSBudWxsO1xyXG4gICAgdGhpcy5hY3RpdmVOb2Rlcy5mb3JFYWNoKChub2RlKT0+e1xyXG4gICAgICAgIHZhciBpc01haW4gPSAobm9kZSA9PSB0aGlzLmZvY3VzZWROb2RlKTtcclxuICAgICAgICBub2RlLnVwZGF0ZShtb3VzZVN0YXRlLCB0aW1lLCB0aGlzLnRyYW5zaXRpb25UaW1lLCBpc01haW4pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIEFsc28gY2hlY2sgaWYgdGhlIG1vdXNlIGlzIG92ZXIgdGhhdCBub2RlLlxyXG4gICAgICAgIGlmKG5vZGUubW91c2VPdmVyKSB7XHJcbiAgICAgICAgICAgIG1vdXNlT3Zlck5vZGUgPSBub2RlO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICBcclxuICAgIC8vIElmIHVzZXIgY2xpY2tzXHJcbiAgICBpZihtb3VzZVN0YXRlLm1vdXNlRG93biAmJiAhbW91c2VTdGF0ZS5sYXN0TW91c2VEb3duKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gZm9jdXMgbm9kZSBpZiBjbGlja2VkXHJcbiAgICAgICAgaWYobW91c2VPdmVyTm9kZSkge1xyXG4gICAgICAgICAgICB0aGlzLkZvY3VzTm9kZShtb3VzZU92ZXJOb2RlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gc2hvdyBkZXRhaWxzIGZvciBub2RlIGlmIGJ1dHRvbiBjbGlja2VkXHJcbiAgICAgICAgaWYodGhpcy5mb2N1c2VkTm9kZS5kZXRhaWxzQnV0dG9uLm1vdXNlT3Zlcikge1xyXG4gICAgICAgICAgICBpZih0aGlzLmRldGFpbHNQYW5lbC5ub2RlID09IG51bGwpICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRldGFpbHNQYW5lbC5lbmFibGUodGhpcy5mb2N1c2VkTm9kZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZvY3VzZWROb2RlLmRldGFpbHNCdXR0b24udGV4dCA9IFwiTGVzc1wiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXRhaWxzUGFuZWwuZGlzYWJsZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5mb2N1c2VkTm9kZS5kZXRhaWxzQnV0dG9uLnRleHQgPSBcIk1vcmVcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyB1c2VyIGNsaWNrcyBvbiBjb21wbGV0aW9uIGJ1dHRvblxyXG4gICAgICAgIGlmKHRoaXMuZm9jdXNlZE5vZGUuY29tcGxldGlvbkJ1dHRvbi5tb3VzZU92ZXIpIHtcclxuICAgICAgICAgICAgaWYodGhpcy5mb2N1c2VkTm9kZS5zdGF0ZSA9PSBUdXRvcmlhbFN0YXRlLlVubG9ja2VkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZvY3VzZWROb2RlLmNoYW5nZVN0YXRlKFR1dG9yaWFsU3RhdGUuQ29tcGxldGVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLmZvY3VzZWROb2RlLnN0YXRlID09IFR1dG9yaWFsU3RhdGUuTG9ja2VkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY29uZmlybShcIlNraXAgYWhlYWQ/IFRoaXMgd29uJ3QgYXV0b21hdGljYWxseSBjb21wbGV0ZSBhbnl0aGluZyBwcmV2aW91cyB0byB0aGlzLlwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZm9jdXNlZE5vZGUuY2hhbmdlU3RhdGUoVHV0b3JpYWxTdGF0ZS5Db21wbGV0ZWQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuZm9jdXNlZE5vZGUuc3RhdGUgPT0gVHV0b3JpYWxTdGF0ZS5Db21wbGV0ZWQpIHtcclxuICAgICAgICAgICAgICAgIC8vIElmIHJlc2V0dGluZywgYXNrIGZvciBjb25maXJtYXRpb24uXHJcbiAgICAgICAgICAgICAgICBpZiAoY29uZmlybShcIlRoaXMgd2lsbCByZXNldCBhbnkgcHJvZ3Jlc3MgcGFzdCB0aGlzIHBvaW50LiBBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZG8gdGhpcz9cIikpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZvY3VzZWROb2RlLmNoYW5nZVN0YXRlKFR1dG9yaWFsU3RhdGUuVW5sb2NrZWQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyBVcGRhdGUgdGhlIHNlYXJjaCBwYW5lbCBpZiBpdCdzIG9wZW4uXHJcbiAgICBpZih0aGlzLnNlYXJjaFBhbmVsLm9wZW4gPT0gdHJ1ZSkge1xyXG4gICAgICAgIHRoaXMuc2VhcmNoUGFuZWwudXBkYXRlKGNhbnZhc1N0YXRlLCB0aW1lKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gVXBkYXRlIHRoZSBkZXRhaWxzIHBhbmVsIGlmIGl0J3Mgb3Blbi5cclxuICAgIGlmKHRoaXMuZGV0YWlsc1BhbmVsLm5vZGUgIT0gbnVsbCkge1xyXG4gICAgICAgIHRoaXMuZGV0YWlsc1BhbmVsLnVwZGF0ZShjYW52YXNTdGF0ZSwgdGltZSwgdGhpcy5mb2N1c2VkTm9kZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIFxyXG4gICAgLy8gVHJhbnNpdGlvbiB0aGUgc2lkZSBiYXJzIG9uIGFuZCBvZmYgc21vb3RobHlcclxuICAgIHZhciB0MSA9ICgxIC0gTWF0aC5jb3ModGhpcy5zZWFyY2hQYW5lbC50cmFuc2l0aW9uVGltZSAqIE1hdGguUEkpKS8yO1xyXG4gICAgdmFyIHQyID0gKDEgLSBNYXRoLmNvcyh0aGlzLmRldGFpbHNQYW5lbC50cmFuc2l0aW9uVGltZSAqIE1hdGguUEkpKS8yO1xyXG4gICAgXHJcbiAgICAvLyBDaGFuZ2Ugc3R5bGluZyB0byBjaGFuZ2Ugc2l6ZSBvZiBkaXZzXHJcbiAgICB0aGlzLnNlYXJjaERpdi5zdHlsZS53aWR0aCA9IDMwICogdDEgKyBcInZ3XCI7XHJcbiAgICB0aGlzLmRhdGFEaXYuc3R5bGUud2lkdGggPSAzMCAqIHQyICsgXCJ2d1wiO1xyXG4gICAgdGhpcy5jYW52YXNEaXYuc3R5bGUud2lkdGggPSAxMDAgLSAzMCAqICh0MSArIHQyKSArIFwidndcIjsgICAgXHJcbiAgICBcclxuICAgIHRoaXMuc2VhcmNoUGFuZWxCdXR0b24uc3R5bGUubGVmdCA9IFwiY2FsYyhcIiArIDMwICogdDEgKyBcInZ3ICsgMTJweClcIjtcclxuICAgIFxyXG4gICAgXHJcbiAgICB0aGlzLnNlYXJjaERpdi5zdHlsZS5kaXNwbGF5ID0gKHQxID09IDApID8gXCJub25lXCIgOiBcImJsb2NrXCI7XHJcbiAgICB0aGlzLmRhdGFEaXYuc3R5bGUuZGlzcGxheSA9ICh0MiA9PSAwKSA/IFwibm9uZVwiIDogXCJibG9ja1wiO1xyXG4gICAgXHJcbiAgICBjYW52YXNTdGF0ZS51cGRhdGUoKTtcclxufTtcclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcbkdyYXBoLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY2FudmFzU3RhdGUpIHtcclxuICAgIFxyXG4gICAgY2FudmFzU3RhdGUuY3R4LnNhdmUoKTtcclxuXHJcbiAgICAvL3RyYW5zbGF0ZSB0byB0aGUgY2VudGVyIG9mIHRoZSBzY3JlZW5cclxuICAgIGNhbnZhc1N0YXRlLmN0eC50cmFuc2xhdGUoY2FudmFzU3RhdGUuY2VudGVyLngsIGNhbnZhc1N0YXRlLmNlbnRlci55KTtcclxuICAgIFxyXG4gICAgLy9kcmF3IG5vZGVzXHJcbiAgICB0aGlzLmZvY3VzZWROb2RlLmRyYXcoY2FudmFzU3RhdGUsIHRoaXMucGFpbnRlciwgdGhpcywgbnVsbCwgMCwgZ3JhcGhEZXB0aExpbWl0KTtcclxuXHJcbiAgICBjYW52YXNTdGF0ZS5jdHgucmVzdG9yZSgpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHcmFwaDsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4uL2NvbnRhaW5lcnMvUG9pbnQuanMnKTtcclxudmFyIEJ1dHRvbiA9IHJlcXVpcmUoXCIuLi9jb250YWluZXJzL0J1dHRvbi5qc1wiKTtcclxudmFyIFR1dG9yaWFsTm9kZSA9IHJlcXVpcmUoJy4vVHV0b3JpYWxOb2RlLmpzJyk7XHJcblxyXG52YXIgbGFiZWxDb3JuZXJTaXplID0gNjtcclxuXHJcbnZhciB0aXRsZUZvbnRTaXplID0gMTI7XHJcbnZhciB0aXRsZUZvbnQgPSB0aXRsZUZvbnRTaXplK1wicHggQXJpYWxcIjtcclxuXHJcbnZhciBkZXNjcmlwdG9yRm9udFNpemUgPSAxMjtcclxudmFyIGRlc2NyaXB0b3JGb250ID0gZGVzY3JpcHRvckZvbnRTaXplK1wicHggQXJpYWxcIjtcclxuXHJcbnZhciBsaW5lQnJlYWsgPSA2O1xyXG5cclxuLy9jcmVhdGUgYSBsYWJlbCB0byBwYWlyIHdpdGggYSBub2RlXHJcbmZ1bmN0aW9uIE5vZGVMYWJlbChwVHV0b3JpYWxOb2RlKSB7XHJcbiAgICB0aGlzLm5vZGUgPSBwVHV0b3JpYWxOb2RlO1xyXG4gICAgXHJcbiAgICB0aGlzLnNlcmllcyA9IHRoaXMubm9kZS5kYXRhLnNlcmllcztcclxuICAgIHRoaXMudGl0bGUgPSB0aGlzLm5vZGUuZGF0YS50aXRsZTtcclxuICAgIHRoaXMuZGVzY3JpcHRpb24gPSB0aGlzLm5vZGUuZGF0YS5kZXNjcmlwdGlvbjtcclxuICAgIHRoaXMuZGVzY3JpcHRpb25MaW5lcyA9IG51bGw7XHJcbiAgICBcclxuICAgIHRoaXMucG9zaXRpb24gPSBuZXcgUG9pbnQoXHJcbiAgICAgICAgdGhpcy5ub2RlLnBvc2l0aW9uLngsXHJcbiAgICAgICAgdGhpcy5ub2RlLnBvc2l0aW9uLnkgLSB0aGlzLm5vZGUuc2l6ZSAtIDEwKTtcclxuICAgIFxyXG4gICAgdGhpcy5kaXNwbGF5RnVsbERhdGEgPSBmYWxzZTtcclxufTtcclxuXHJcbk5vZGVMYWJlbC5wcm90b3R5cGUuY2FsY3VsYXRlVGV4dEZpdCA9IGZ1bmN0aW9uKGN0eCwgcFBhaW50ZXIpIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHguZm9udCA9IHRpdGxlRm9udDtcclxuICAgIHZhciBzZXJpZXNTaXplID0gY3R4Lm1lYXN1cmVUZXh0KHRoaXMuc2VyaWVzKTtcclxuICAgIHZhciB0aXRsZVNpemUgPSBjdHgubWVhc3VyZVRleHQodGhpcy50aXRsZSk7XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG5cclxuICAgIHRoaXMuc2l6ZSA9IG5ldyBQb2ludChNYXRoLm1heChzZXJpZXNTaXplLndpZHRoLCB0aXRsZVNpemUud2lkdGgpLCB0aXRsZUZvbnRTaXplICogMik7XHJcbiAgICBcclxuICAgIFxyXG5cclxuICAgIGlmKHRoaXMuZGlzcGxheUZ1bGxEYXRhKSB7XHJcbiAgICAgICAgdGhpcy5zaXplLnggPSBNYXRoLm1heCgyNDAsIE1hdGgubWF4KHNlcmllc1NpemUud2lkdGgsIHRpdGxlU2l6ZS53aWR0aCkpO1xyXG4gICAgICAgIHRoaXMuZGVzY3JpcHRpb25MaW5lcyA9IHBQYWludGVyLnRleHRUb0xpbmVzKGN0eCwgdGhpcy5kZXNjcmlwdGlvbiwgZGVzY3JpcHRvckZvbnQsIHRoaXMuc2l6ZS54KTtcclxuICAgICAgICB0aGlzLnNpemUueSArPSBsaW5lQnJlYWsgKyB0aGlzLmRlc2NyaXB0aW9uTGluZXMubGVuZ3RoICogZGVzY3JpcHRvckZvbnRTaXplO1xyXG4gICAgfVxyXG59O1xyXG5cclxuXHJcblxyXG5Ob2RlTGFiZWwucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChwTW91c2VTdGF0ZSwgdGltZSwgZGlzcGxheUJyaWVmKSB7XHJcbiAgICBcclxuICAgIFxyXG4gICAgLy9kaXJlY3RseSBhYm92ZSBub2RlXHJcbiAgICB0aGlzLmRlc2lyZWRQb3NpdGlvbiA9IG5ldyBQb2ludChcclxuICAgICAgICB0aGlzLm5vZGUucG9zaXRpb24ueCxcclxuICAgICAgICB0aGlzLm5vZGUucG9zaXRpb24ueSAtIHRoaXMubm9kZS5zaXplIC0gMTIgLSBsYWJlbENvcm5lclNpemUpO1xyXG4gICAgXHJcbiAgICBpZih0aGlzLmRlc2lyZWRQb3NpdGlvbi54ICE9IHRoaXMucG9zaXRpb24ueCB8fCB0aGlzLmRlc2lyZWRQb3NpdGlvbi55ICE9IHRoaXMucG9zaXRpb24ueSkge1xyXG4gICAgICAgIC8vbW92ZSB0b3dhcmRzIGRlc2lyZWRQb3NpdGlvblxyXG4gICAgICAgIHZhciBkaWYgPSBuZXcgUG9pbnQoXHJcbiAgICAgICAgICAgIHRoaXMuZGVzaXJlZFBvc2l0aW9uLnggLSB0aGlzLnBvc2l0aW9uLngsXHJcbiAgICAgICAgICAgIHRoaXMuZGVzaXJlZFBvc2l0aW9uLnkgLSB0aGlzLnBvc2l0aW9uLnkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBzcGVlZFNjYWxhciA9IE1hdGguc3FydChkaWYueCAqIGRpZi54ICsgZGlmLnkgKiBkaWYueSkgKiB0aW1lLmRlbHRhVGltZTtcclxuXHJcbiAgICAgICAgdmFyIHZlbG9jaXR5ID0gbmV3IFBvaW50KGRpZi54ICogc3BlZWRTY2FsYXIsIGRpZi55ICogc3BlZWRTY2FsYXIpO1xyXG4gICAgICAgIGlmKHZlbG9jaXR5LnggKiB2ZWxvY2l0eS54IDwgZGlmLnggKiBkaWYueCkge1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnggKz0gdmVsb2NpdHkueDtcclxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi55ICs9IHZlbG9jaXR5Lnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnggPSB0aGlzLmRlc2lyZWRQb3NpdGlvbi54O1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnkgPSB0aGlzLmRlc2lyZWRQb3NpdGlvbi55O1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgXHJcbiAgICAvL2lmIHRoaXMgaXMgdGhlIHByaW1hcnkgbm9kZSwgZGlzcGxheSBkZXNjcmlwdGlvblxyXG4gICAgaWYoZGlzcGxheUJyaWVmKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYodGhpcy5kaXNwbGF5RnVsbERhdGEgPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgdGhpcy5zaXplID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheUZ1bGxEYXRhID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICh0aGlzLmRpc3BsYXlGdWxsRGF0YSA9PSB0cnVlKSB7XHJcbiAgICAgICAgdGhpcy5idXR0b25DbGlja2VkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zaXplID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5kaXNwbGF5RnVsbERhdGEgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIFxyXG59XHJcblxyXG5Ob2RlTGFiZWwucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihwQ2FudmFzU3RhdGUsIHBQYWludGVyKSB7XHJcbiAgICBcclxuICAgIGlmKCF0aGlzLnNpemUpIHtcclxuICAgICAgICB0aGlzLmNhbGN1bGF0ZVRleHRGaXQocENhbnZhc1N0YXRlLmN0eCwgcFBhaW50ZXIpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvL2RyYXcgbGluZSBmcm9tIG5vZGUgdG8gbGFiZWxcclxuICAgIHBDYW52YXNTdGF0ZS5jdHguc2F2ZSgpO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5zdHJva2VTdHlsZSA9IFwiI2ZmZlwiO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5saW5lV2lkdGggPSAyO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5iZWdpblBhdGgoKTtcclxuICAgIFxyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5tb3ZlVG8oXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi54LFxyXG4gICAgICAgIHRoaXMucG9zaXRpb24ueSk7XHJcbiAgICBcclxuICAgIHBDYW52YXNTdGF0ZS5jdHgubGluZVRvKFxyXG4gICAgICAgIHRoaXMubm9kZS5wb3NpdGlvbi54LFxyXG4gICAgICAgIHRoaXMubm9kZS5wb3NpdGlvbi55IC0gdGhpcy5ub2RlLnNpemUpO1xyXG4gICAgXHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LmNsb3NlUGF0aCgpO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5zdHJva2UoKTtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHgucmVzdG9yZSgpO1xyXG4gICAgXHJcbiAgICAvL2RyYXcgbGFiZWxcclxuICAgIHBQYWludGVyLnJvdW5kZWRSZWN0KFxyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHgsXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi54IC0gKHRoaXMuc2l6ZS54IC8gMiksXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi55IC0gdGhpcy5zaXplLnksXHJcbiAgICAgICAgdGhpcy5zaXplLngsXHJcbiAgICAgICAgdGhpcy5zaXplLnksXHJcbiAgICAgICAgbGFiZWxDb3JuZXJTaXplLFxyXG4gICAgICAgIHRydWUsIHRoaXMubm9kZS5jb2xvcixcclxuICAgICAgICB0cnVlLCBcIiNmZmZcIiwgMik7XHJcbiAgICBcclxuICAgIFxyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5zYXZlKCk7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LmZpbGxTdHlsZSA9IFwiI2ZmZlwiO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5mb250ID0gdGl0bGVGb250O1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC50ZXh0QmFzZWxpbmUgPSBcInRvcFwiO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5maWxsVGV4dChcclxuICAgICAgICB0aGlzLnNlcmllcyxcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLngsXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi55IC0gdGhpcy5zaXplLnkpO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5maWxsVGV4dChcclxuICAgICAgICB0aGlzLnRpdGxlLFxyXG4gICAgICAgIHRoaXMucG9zaXRpb24ueCxcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnkgLSB0aGlzLnNpemUueSArIHRpdGxlRm9udFNpemUpO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5yZXN0b3JlKCk7XHJcbiAgICBcclxuICAgIFxyXG4gICAgaWYodGhpcy5kaXNwbGF5RnVsbERhdGEpIHtcclxuICAgICAgICBcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LnNhdmUoKTtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LmZpbGxTdHlsZSA9IFwiI2ZmZlwiO1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHguZm9udCA9IGRlc2NyaXB0b3JGb250O1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHgudGV4dEJhc2VsaW5lID0gXCJ0b3BcIjtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LnRleHRBbGlnbiA9IFwibGVmdFwiO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmRlc2NyaXB0aW9uTGluZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5maWxsVGV4dChcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVzY3JpcHRpb25MaW5lc1tpXSxcclxuICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueCAtIHRoaXMuc2l6ZS54IC8gMixcclxuICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueSAtIHRoaXMuc2l6ZS55ICsgdGl0bGVGb250U2l6ZSAqIDIgKyBsaW5lQnJlYWsgKyBpICogZGVzY3JpcHRvckZvbnRTaXplKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5yZXN0b3JlKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzICA9IE5vZGVMYWJlbDsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbi8vcGFyYW1ldGVyIGlzIGEgcG9pbnQgdGhhdCBkZW5vdGVzIHN0YXJ0aW5nIHBvc2l0aW9uXHJcbmZ1bmN0aW9uIFBhcnNlcihwVGFyZ2V0VVJMLCBjYWxsYmFjayl7XHJcbiAgICB2YXIgSlNPTk9iamVjdDtcclxuICAgIHZhciBsZXNzb25BcnJheSA9IFtdO1xyXG4gICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgSlNPTk9iamVjdCA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCk7XHJcblxyXG4gICAgICAgIC8vcGFzcyBsZXNzb24gZGF0YSBiYWNrXHJcbiAgICAgICAgY2FsbGJhY2soSlNPTk9iamVjdCk7XHJcbiAgICB9XHJcblxyXG4gICAgeGhyLm9wZW4oJ0dFVCcsIHBUYXJnZXRVUkwsIHRydWUpO1xyXG4gICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoXCJJZi1Nb2RpZmllZC1TaW5jZVwiLCBcIlNhdCwgMSBKYW4gMjAxMCAwMDowMDowMCBHTTBUXCIpO1xyXG4gICAgeGhyLnNlbmQoKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQYXJzZXI7IiwiXCJ1c2Ugc3RyaWN0XCJcclxuXHJcbmZ1bmN0aW9uIFNlYXJjaFBhbmVsKGdyYXBoKSB7XHJcbiAgICB0aGlzLmdyYXBoID0gZ3JhcGg7XHJcbiAgICB0aGlzLm9wZW4gPSBmYWxzZTtcclxuICAgIHRoaXMudHJhbnNpdGlvbk9uID0gZmFsc2U7XHJcbiAgICB0aGlzLnRyYW5zaXRpb25UaW1lID0gMDtcclxuICAgIHRoaXMub3B0aW9uc0RpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGVmdEJhclwiKTtcclxuICAgIHRoaXMuc2VhcmNoQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZWFyY2hidXR0b25cIik7XHJcbiAgICBcclxuICAgIFxyXG4gICAgdGhpcy5zZWFyY2hCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uICh0aGF0KSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gQ29sbGVjdCBhbGwgaW5mb3JtYXRpb24gZm9yIHRoZSBxdWVyeVxyXG4gICAgICAgIHZhciBxdWVyeSA9IFtdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIGdldCB0ZXh0IGlucHV0IGlmIHRoZXJlIGlzIGFueVxyXG4gICAgICAgIHZhciBwYXJhbTEgPSB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwiVGV4dFwiLFxyXG4gICAgICAgICAgICB2YWx1ZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZWFyY2h0ZXh0ZmllbGRcIikudmFsdWVcclxuICAgICAgICB9O1xyXG4gICAgICAgIGlmKHBhcmFtMS52YWx1ZSAhPSBcIlwiKSB7XHJcbiAgICAgICAgICAgIHF1ZXJ5LnB1c2gocGFyYW0xKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gZ2V0IGxhbmd1YWdlIGlucHV0IGlmIHRoZXJlIGlzIGFueVxyXG4gICAgICAgIHZhciBwYXJhbTIgPSB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwiTGFuZ3VhZ2VcIixcclxuICAgICAgICAgICAgdmFsdWU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2VhcmNobGFuZ3VhZ2VmaWVsZFwiKS52YWx1ZVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYocGFyYW0yLnZhbHVlICE9IFwiQW55XCIpIHtcclxuICAgICAgICAgICAgcXVlcnkucHVzaChwYXJhbTIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyBnZXQgdGFncyBpbnB1dCBpZiB0aGVyZSBpcyBhbnlcclxuICAgICAgICB2YXIgcGFyYW0zID0ge1xyXG4gICAgICAgICAgICB0eXBlOiBcIlRhZ1wiLFxyXG4gICAgICAgICAgICB2YWx1ZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZWFyY2h0YWdmaWVsZFwiKS52YWx1ZVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYocGFyYW0zLnZhbHVlICE9IFwiQW55XCIpIHtcclxuICAgICAgICAgICAgcXVlcnkucHVzaChwYXJhbTMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICAvL3BhcnNlIGRhdGEgdG8gZmluZCBtYXRjaGluZyByZXN1bHRzXHJcbiAgICAgICAgdmFyIHNlYXJjaFJlc3VsdHMgPSB0aGF0LnNlYXJjaChxdWVyeSwgdGhhdC5ncmFwaC5ub2Rlcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9kaXNwbGF5IHJlc3VsdHNcclxuICAgICAgICB2YXIgbGlzdEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlYXJjaHJlc3VsdHNcIik7XHJcbiAgICAgICAgaWYoc2VhcmNoUmVzdWx0cy5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICBsaXN0RWxlbWVudC5pbm5lckhUTUwgPSBcIk5vIE1hdGNoaW5nIFJlc3VsdHMgRm91bmQuXCI7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGlzdEVsZW1lbnQuaW5uZXJIVE1MID0gXCJcIjtcclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgc2VhcmNoUmVzdWx0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAvL2NyZWF0ZSBsaXN0IHRhZ1xyXG4gICAgICAgICAgICB2YXIgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7XHJcbiAgICAgICAgICAgIC8vc2V0IHRpdGxlIGFzIHRleHRcclxuICAgICAgICAgICAgbGkuaW5uZXJIVE1MID0gc2VhcmNoUmVzdWx0c1tpXS5kYXRhLnRpdGxlO1xyXG4gICAgICAgICAgICAvL2FkZCBldmVudCB0byBmb2N1cyB0aGUgbm9kZSBpZiBpdHMgY2xpY2tlZFxyXG4gICAgICAgICAgICBsaS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24odGhhdCwgbm9kZSkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5ncmFwaC5Gb2N1c05vZGUobm9kZSk7XHJcbiAgICAgICAgICAgIH0uYmluZChsaSwgdGhhdCwgc2VhcmNoUmVzdWx0c1tpXSkpO1xyXG4gICAgICAgICAgICAvL2FkZCB0aGUgdGFnIHRvIHRoZSBwYWdlXHJcbiAgICAgICAgICAgIGxpc3RFbGVtZW50LmFwcGVuZENoaWxkKGxpKTtcclxuICAgICAgICB9XHJcbiAgICB9LmJpbmQodGhpcy5zZWFyY2hCdXR0b24sIHRoaXMpKTtcclxufTtcclxuXHJcblxyXG5cclxuLy8gVGhpcyBzZWFyY2ggc3VwcG9ydHMgbXVsdGlwbGUgdGFncyBvZiBlYWNoIHR5cGUsIGJ1dCB0aGUgYWN0dWFsIHNlYXJjaCBkb2Vzbid0IHVzZSB0aGF0IGZ1bmN0aW9uYWxpdHkuXHJcbi8vIFNlYXJjaGVzIGJ5IG5hcnJvd2luZyBkb3duIHJlc3VsdHMuIEFueXRoaW5nIHRoYXQgZG9lc24ndCBtYXRjaCBhbGwgMyBjcml0ZXJpYSBmYWlscyB0aGUgdGVzdC5cclxuU2VhcmNoUGFuZWwucHJvdG90eXBlLnNlYXJjaCA9IGZ1bmN0aW9uKHF1ZXJ5LCBub2Rlcykge1xyXG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcclxuICAgIFxyXG4gICAgXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgbm9kZSA9IG5vZGVzW2ldLmRhdGE7XHJcbiAgICAgICAgdmFyIG1hdGNoID0gdHJ1ZTtcclxuICAgICAgICBmb3IodmFyIGogPSAwOyBqIDwgcXVlcnkubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgLy8gVGV4dCBzZWFyY2ggY29tcGFyZXMgYWdhaW5zdCBhbnkgdGV4dCBpbiB0aGUgZGVtb1xyXG4gICAgICAgICAgICAvLyBJZiBpdCBkb2VzbnQgZmluZCB0aGUgc3RyaW5nIGFueXdoZXJlIGl0IGZhaWxzIHRoZSBzZWFyY2ggaW1tZWRpYXRlbHlcclxuICAgICAgICAgICAgaWYocXVlcnlbal0udHlwZSA9PT0gXCJUZXh0XCIpIHtcclxuICAgICAgICAgICAgICAgIGlmKG5vZGUudGl0bGUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHF1ZXJ5W2pdLnZhbHVlLnRvTG93ZXJDYXNlKCkpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKG5vZGUuc2VyaWVzLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihxdWVyeVtqXS52YWx1ZS50b0xvd2VyQ2FzZSgpKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYobm9kZS5kZXNjcmlwdGlvbi50b0xvd2VyQ2FzZSgpLmluZGV4T2YocXVlcnlbal0udmFsdWUudG9Mb3dlckNhc2UoKSkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7IC8vIG5vIG1hdGNoLiBkb24ndCBjb21wYXJlIGFueXRoaW5nIGVsc2UgZm9yIHRoaXMgcmVwby5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBsYW5ndWFnZSBtdXN0IG1hdGNoIHNlbGVjdGVkIGxhbmd1YWdlXHJcbiAgICAgICAgICAgIGVsc2UgaWYocXVlcnlbal0udHlwZSA9PT0gXCJMYW5ndWFnZVwiKSB7XHJcbiAgICAgICAgICAgICAgICBpZihub2RlLmxhbmd1YWdlICE9PSBxdWVyeVtqXS52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1hdGNoID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gdGFnIG11c3QgbWF0Y2ggc2VsZWN0ZWQgdGFnXHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRhZ01hdGNoID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBmb3IodmFyIGsgPSAwOyBrIDwgbm9kZS50YWdzLmxlbmd0aDsgaysrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYobm9kZS50YWdzW2tdID09IHF1ZXJ5W2pdLnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ01hdGNoID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZih0YWdNYXRjaCA9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1hdGNoID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy9pZiB3ZSBwYXNzZWQgYWxsIHRoYXQgY3JhcCwgd2UgaGF2ZSBhIG1hdGNoIVxyXG4gICAgICAgIGlmKG1hdGNoID09PSB0cnVlKSB7IFxyXG4gICAgICAgICAgICByZXN1bHRzLnB1c2gobm9kZXNbaV0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcmV0dXJuIHJlc3VsdHM7XHJcbn07XHJcblxyXG5cclxuU2VhcmNoUGFuZWwucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGNhbnZhc1N0YXRlLCB0aW1lKSB7XHJcbiAgICBcclxuICAgIC8vdHJhbnNpdGlvbiBvblxyXG4gICAgaWYodGhpcy50cmFuc2l0aW9uT24pIHtcclxuICAgICAgICBpZih0aGlzLnRyYW5zaXRpb25UaW1lIDwgMSkge1xyXG4gICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25UaW1lICs9IHRpbWUuZGVsdGFUaW1lICogMztcclxuICAgICAgICAgICAgaWYodGhpcy50cmFuc2l0aW9uVGltZSA+PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAvL2RvbmUgdHJhbnNpdGlvbmluZ1xyXG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9uVGltZSA9IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvL3RyYW5zaXRpb24gb2ZmXHJcbiAgICBlbHNlIHtcclxuICAgICAgICBpZih0aGlzLnRyYW5zaXRpb25UaW1lID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25UaW1lIC09IHRpbWUuZGVsdGFUaW1lICogMztcclxuICAgICAgICAgICAgaWYodGhpcy50cmFuc2l0aW9uVGltZSA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAvL2RvbmUgdHJhbnNpdGlvbmluZ1xyXG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9uVGltZSA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9wZW4gPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTZWFyY2hQYW5lbDsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4uL2NvbnRhaW5lcnMvUG9pbnQuanMnKTtcclxudmFyIE5vZGVMYWJlbCA9IHJlcXVpcmUoJy4vTm9kZUxhYmVsLmpzJyk7XHJcbnZhciBCdXR0b24gPSByZXF1aXJlKCcuLi9jb250YWluZXJzL0J1dHRvbi5qcycpO1xyXG5cclxudmFyIGhvcml6b250YWxTcGFjaW5nID0gMTgwO1xyXG52YXIgYmFzZVNpemUgPSAyNDtcclxuXHJcbnZhciBUdXRvcmlhbFN0YXRlID0ge1xyXG4gICAgTG9ja2VkOiAwLFxyXG4gICAgVW5sb2NrZWQ6IDEsXHJcbiAgICBDb21wbGV0ZWQ6IDJcclxufTtcclxuXHJcbnZhciBUdXRvcmlhbFRhZ3MgPSB7XHJcbiAgICBcIkFJXCI6IFwiIzgwNFwiLFxyXG4gICAgXCJBdWRpb1wiOiBcIiMwNDhcIixcclxuICAgIFwiQ29tcHV0ZXIgU2NpZW5jZVwiOiBcIiMxMTFcIixcclxuICAgIFwiQ29yZVwiOiBcIiMzMzNcIixcclxuICAgIFwiR3JhcGhpY3NcIjogXCIjYzBjXCIsXHJcbiAgICBcIklucHV0XCI6IFwiIzg4MFwiLFxyXG4gICAgXCJNYXRoXCI6IFwiIzQ4NFwiLFxyXG4gICAgXCJOZXR3b3JraW5nXCI6IFwiI2M2MFwiLFxyXG4gICAgXCJPcHRpbWl6YXRpb25cIjogXCIjMjgyXCIsXHJcbiAgICBcIlBoeXNpY3NcIjogXCIjMDQ4XCIsXHJcbiAgICBcIlNjcmlwdGluZ1wiOiBcIiMwODhcIixcclxuICAgIFwiU29mdHdhcmVFbmdpbmVlcmluZ1wiOiBcIiM4NDRcIlxyXG59O1xyXG5cclxuXHJcbi8vbWFrZSBhIG5vZGUgd2l0aCBzb21lIGRhdGFcclxuZnVuY3Rpb24gVHV0b3JpYWxOb2RlKEpTT05DaHVuaykge1xyXG4gICAgdGhpcy5kYXRhID0gSlNPTkNodW5rO1xyXG4gICAgdGhpcy5wcmltYXJ5VGFnID0gdGhpcy5kYXRhLnRhZ3NbMF07XHJcbiAgICB0aGlzLmNvbG9yID0gVHV0b3JpYWxUYWdzW3RoaXMucHJpbWFyeVRhZ107XHJcbiAgICBcclxuICAgIFxyXG4gICAgdGhpcy5tb3VzZU92ZXIgPSBmYWxzZTtcclxuICAgIFxyXG4gICAgXHJcbiAgICB0aGlzLnBvc2l0aW9uID0gbmV3IFBvaW50KDAsIDApO1xyXG4gICAgdGhpcy5wcmV2aW91c1Bvc2l0aW9uID0gbmV3IFBvaW50KDAsIDApO1xyXG4gICAgdGhpcy5uZXh0UG9zaXRpb24gPSBuZXcgUG9pbnQoMCwgMCk7XHJcbiAgICBcclxuICAgIHRoaXMuc2l6ZSA9IDI0O1xyXG4gICAgdGhpcy5sYWJlbCA9IG5ldyBOb2RlTGFiZWwodGhpcyk7XHJcbiAgICAgICAgXHJcbiAgICB0aGlzLm5leHROb2RlcyA9IFtdO1xyXG4gICAgdGhpcy5wcmV2aW91c05vZGVzID0gW107XHJcbiAgICBcclxuICAgIC8vIENyZWF0ZSBzdWIgYnV0dG9ucy5cclxuICAgIHRoaXMuZGV0YWlsc0J1dHRvbiA9IG5ldyBCdXR0b24obmV3IFBvaW50KDAsIDApLCBuZXcgUG9pbnQoMTIwLCAyNCksIFwiTW9yZVwiLCB0aGlzLmNvbG9yKTtcclxuICAgIHRoaXMuY29tcGxldGlvbkJ1dHRvbiA9IG5ldyBCdXR0b24obmV3IFBvaW50KDAsIDApLCBuZXcgUG9pbnQoMTIwLCAyNCksIFwiTWFyayBVbmNvbXBsZXRlXCIsIHRoaXMuY29sb3IpO1xyXG59O1xyXG5cclxuXHJcbi8vIFNldCB1cCB0aGUgc3RhdHVzIG9mIHRoZSBub2RlIHRvIG1hdGNoIHRoYXQgc2F2ZWQgaW4gYnJvd3NlciBtZW1vcnkuXHJcblR1dG9yaWFsTm9kZS5wcm90b3R5cGUuZmV0Y2hTdGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgXHJcbiAgICB0aGlzLnN0YXRlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5kYXRhLm5hbWUpO1xyXG4gICAgaWYodGhpcy5zdGF0ZSA9PSBudWxsIHx8IHRoaXMuc3RhdGUgPT0gVHV0b3JpYWxTdGF0ZS5Mb2NrZWQpIHtcclxuICAgICAgICB0aGlzLnN0YXRlID0gVHV0b3JpYWxTdGF0ZS5Mb2NrZWQ7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gRGVmYXVsdCB0byB1bmxvY2tlZCBpZiB0aGVyZSBhcmUgbm8gcHJldmlvdXMgbm9kZXMuXHJcbiAgICAgICAgaWYodGhpcy5wcmV2aW91c05vZGVzLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBUdXRvcmlhbFN0YXRlLlVubG9ja2VkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYodGhpcy5zdGF0ZSA9PSBUdXRvcmlhbFN0YXRlLkNvbXBsZXRlZCkge1xyXG4gICAgICAgIHRoaXMuY29tcGxldGlvbkJ1dHRvbi50ZXh0ID0gXCJNYXJrIFVub21wbGV0ZVwiO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5jb21wbGV0aW9uQnV0dG9uLnRleHQgPSBcIk1hcmsgQ29tcGxldGVcIjtcclxuICAgIH1cclxufVxyXG5cclxuLy8gQ2hhbmdlcyB0aGUgc3RhdGUgb2YgdGhpcyBub2RlXHJcblR1dG9yaWFsTm9kZS5wcm90b3R5cGUuY2hhbmdlU3RhdGUgPSBmdW5jdGlvbih0dXRTdGF0ZSkge1xyXG4gICAgaWYodGhpcy5zdGF0ZSA9PSBUdXRvcmlhbFN0YXRlLkxvY2tlZCkge1xyXG4gICAgICAgIGlmKHR1dFN0YXRlID09IFR1dG9yaWFsU3RhdGUuVW5sb2NrZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IHR1dFN0YXRlO1xyXG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLmRhdGEubmFtZSwgdGhpcy5zdGF0ZSk7XHJcbiAgICAgICAgICAgIC8vIFVubG9jayBmcm9tIGEgbG9ja2VkIHBvc2l0aW9uIGRvZXNuJ3QgbmVlZCB0byBjaGFuZ2UgYW55IG90aGVyIG5vZGVzLlxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKHR1dFN0YXRlID09IFR1dG9yaWFsU3RhdGUuQ29tcGxldGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSB0dXRTdGF0ZTtcclxuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5kYXRhLm5hbWUsIHRoaXMuc3RhdGUpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gQ29tcGxldGUgZnJvbSBhIGxvY2tlZCBwb3NpdGlvbiBuZWVkcyB0byBhdHRlbXB0IHRvIHVubG9jayBsYXRlciB0aGluZ3MuXHJcbiAgICAgICAgICAgIHRoaXMubmV4dE5vZGVzLmZvckVhY2goKGNoaWxkKT0+e1xyXG4gICAgICAgICAgICAgICAgdmFyIHNob3VsZEJlTG9ja2VkID0gY2hpbGQucHJldmlvdXNOb2Rlcy5zb21lKChwcmVyZXEpPT57XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChwcmVyZXEuc3RhdGUgIT0gVHV0b3JpYWxTdGF0ZS5Db21wbGV0ZWQpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZighc2hvdWxkQmVMb2NrZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZC5jaGFuZ2VTdGF0ZShUdXRvcmlhbFN0YXRlLlVubG9ja2VkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSBpZih0aGlzLnN0YXRlID09IFR1dG9yaWFsU3RhdGUuVW5sb2NrZWQpIHtcclxuICAgICAgICBpZih0dXRTdGF0ZSA9PSBUdXRvcmlhbFN0YXRlLkxvY2tlZCkge1xyXG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gdHV0U3RhdGU7XHJcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuZGF0YS5uYW1lLCB0aGlzLnN0YXRlKTtcclxuICAgICAgICAgICAgLy8gTG9ja2VkIGZyb20gdW5sb2NrZWQgcG9zaXRpb24gZG9lc24ndCBhZmZlY3QgYW55dGhpbmdcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZih0dXRTdGF0ZSA9PSBUdXRvcmlhbFN0YXRlLkNvbXBsZXRlZCkge1xyXG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gdHV0U3RhdGU7XHJcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuZGF0YS5uYW1lLCB0aGlzLnN0YXRlKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIGNvbXBsZXRlZCBmcm9tIHVubG9ja2VkIHNob3VsZCB1bmxvY2sgbmV4dCB0aGluZ3MuXHJcbiAgICAgICAgICAgIHRoaXMubmV4dE5vZGVzLmZvckVhY2goKGNoaWxkKT0+e1xyXG4gICAgICAgICAgICAgICAgdmFyIHNob3VsZEJlTG9ja2VkID0gY2hpbGQucHJldmlvdXNOb2Rlcy5zb21lKChwcmVyZXEpPT57XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChwcmVyZXEuc3RhdGUgIT0gVHV0b3JpYWxTdGF0ZS5Db21wbGV0ZWQpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZighc2hvdWxkQmVMb2NrZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZC5jaGFuZ2VTdGF0ZShUdXRvcmlhbFN0YXRlLlVubG9ja2VkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAodGhpcy5zdGF0ZSA9PSBUdXRvcmlhbFN0YXRlLkNvbXBsZXRlZCkge1xyXG4gICAgICAgIGlmKHR1dFN0YXRlID09IFR1dG9yaWFsU3RhdGUuTG9ja2VkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSB0dXRTdGF0ZTtcclxuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5kYXRhLm5hbWUsIHRoaXMuc3RhdGUpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gbG9ja2luZyBzb21ldGhpbmcgdGhhdCB3YXMgY29tcGxldGVkIHNob3VsZCBsb2NrIGxhdGVyIHRoaW5ncy5cclxuICAgICAgICAgICAgdGhpcy5uZXh0Tm9kZXMuZm9yRWFjaCgoY2hpbGQpPT57XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5jaGFuZ2VTdGF0ZShUdXRvcmlhbFN0YXRlLkxvY2tlZCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKHR1dFN0YXRlID09IFR1dG9yaWFsU3RhdGUuVW5sb2NrZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IHR1dFN0YXRlO1xyXG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLmRhdGEubmFtZSwgdGhpcy5zdGF0ZSk7XHJcbiAgICAgICAgICAgIC8vIHVubG9ja2luZyBzb21ldGhpbmcgdGhhdCB3YXMgY29tcGxldGVkIHNob3VsZCBsb2NrIGxhdGVyIHRoaW5ncy5cclxuICAgICAgICAgICAgdGhpcy5uZXh0Tm9kZXMuZm9yRWFjaCgoY2hpbGQpPT57XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5jaGFuZ2VTdGF0ZShUdXRvcmlhbFN0YXRlLkxvY2tlZCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvLyBhbHNvIGlmIHRoaXMgdGhpbmcgZG9lc24ndCBoYXZlIGl0J3MgcHJlcmVxcyBtZXQsIGl0IHNob3VsZCBnbyBzdHJhaWdodCB0byBiZWluZyBsb2NrZWRcclxuICAgICAgICAgICAgdmFyIHNob3VsZEJlTG9ja2VkID0gdGhpcy5wcmV2aW91c05vZGVzLnNvbWUoKHByZXJlcSk9PntcclxuICAgICAgICAgICAgICAgIHJldHVybiAocHJlcmVxLnN0YXRlICE9IFR1dG9yaWFsU3RhdGUuQ29tcGxldGVkKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmKHNob3VsZEJlTG9ja2VkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gVHV0b3JpYWxTdGF0ZS5Mb2NrZWQ7XHJcbiAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLmRhdGEubmFtZSwgdGhpcy5zdGF0ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vcmVjdXJzaXZlIGZ1bmN0aW9uIHRvIGdldCBwcmV2aW91cyBub2Rlc1xyXG5UdXRvcmlhbE5vZGUucHJvdG90eXBlLmdldFByZXZpb3VzID0gZnVuY3Rpb24oZGVwdGgpIHtcclxuICAgIHZhciByZXN1bHQgPSBbdGhpc107XHJcbiAgICBpZihkZXB0aCA+IDApIHtcclxuICAgICAgICB0aGlzLnByZXZpb3VzTm9kZXMuZm9yRWFjaCgobm9kZSk9PntcclxuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdChub2RlLmdldFByZXZpb3VzKGRlcHRoLTEpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn07XHJcblxyXG5cclxuXHJcbi8vcmVjdXJzaXZlIGZ1bmN0aW9uIHRvIGdldCBuZXh0IG5vZGVzXHJcblR1dG9yaWFsTm9kZS5wcm90b3R5cGUuZ2V0TmV4dCA9IGZ1bmN0aW9uKGRlcHRoKSB7XHJcbiAgICB2YXIgcmVzdWx0ID0gW3RoaXNdO1xyXG4gICAgaWYoZGVwdGggPiAwKSB7XHJcbiAgICAgICAgdGhpcy5uZXh0Tm9kZXMuZm9yRWFjaCgobm9kZSk9PntcclxuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdChub2RlLmdldE5leHQoZGVwdGgtMSkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufTtcclxuXHJcblxyXG4vLyBVcGRhdGVzIGFsbCBub2RlcyBzdGFydGluZyB3aXRoIG9uZSwgYW5kIGV4dGVuZGluZyBvdXR3YXJkLlxyXG4vLyBkaXJlY3Rpb24gaXMgdGhlIHNpZGUgb2YgdGhlIHBhcmVudCB0aGlzIG5vZGUgZXhpc3RzIG9uICgtMSwgMCwgMSkgMCBpcyBib3RoLlxyXG4vLyBsYXllciBkZXB0aCBpcyBob3cgbWFueSBsYXllcnMgdG8gcmVuZGVyIG91dFxyXG5UdXRvcmlhbE5vZGUucHJvdG90eXBlLnJlY3Vyc2l2ZVVwZGF0ZSA9IGZ1bmN0aW9uKGRpcmVjdGlvbiwgZGVwdGgpIHtcclxuICAgIGlmKGRlcHRoID4gMCkge1xyXG4gICAgICAgIC8vIGxlZnQgb3IgbWlkZGxlXHJcbiAgICAgICAgaWYoZGlyZWN0aW9uIDwgMSkge1xyXG4gICAgICAgICAgICB0aGlzLnByZXZpb3VzTm9kZXMuZm9yRWFjaCgobm9kZSk9PntcclxuICAgICAgICAgICAgICAgIG5vZGUucmVjdXJzaXZlVXBkYXRlKC0xLCBkZXB0aCAtIDEpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gcmlnaHQgb3IgbWlkZGxlXHJcbiAgICAgICAgaWYoZGlyZWN0aW9uID4gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5uZXh0Tm9kZXMuZm9yRWFjaCgobm9kZSk9PntcclxuICAgICAgICAgICAgICAgIG5vZGUucmVjdXJzaXZlVXBkYXRlKDEsIGRlcHRoIC0gMSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8vdXBkYXRlcyBhIG5vZGVcclxuLy90cmFuc2l0aW9uIHRpbWUgaXMgMS0wLCB3aXRoIDAgYmVpbmcgdGhlIGZpbmFsIGxvY2F0aW9uXHJcblR1dG9yaWFsTm9kZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24obW91c2VTdGF0ZSwgdGltZSwgdHJhbnNpdGlvblRpbWUsIGlzRm9jdXNlZCkge1xyXG4gICAgXHJcbiAgICAvL21vdmUgdGhlIG5vZGVcclxuICAgIGlmKHRoaXMucG9zaXRpb24gIT0gdGhpcy5uZXh0UG9zaXRpb24pIHtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnggPSAodGhpcy5wcmV2aW91c1Bvc2l0aW9uLnggKiB0cmFuc2l0aW9uVGltZSkgKyAodGhpcy5uZXh0UG9zaXRpb24ueCAqICgxIC0gdHJhbnNpdGlvblRpbWUpKTtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnkgPSAodGhpcy5wcmV2aW91c1Bvc2l0aW9uLnkgKiB0cmFuc2l0aW9uVGltZSkgKyAodGhpcy5uZXh0UG9zaXRpb24ueSAqICgxIC0gdHJhbnNpdGlvblRpbWUpKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYoaXNGb2N1c2VkKSB7XHJcbiAgICAgICAgdGhpcy5zaXplID0gMzY7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICAvL3Rlc3QgaWYgbW91c2UgaXMgaW5zaWRlIGNpcmNsZVxyXG4gICAgICAgIHZhciBkeCA9IG1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbi54IC0gdGhpcy5wb3NpdGlvbi54O1xyXG4gICAgICAgIHZhciBkeSA9IG1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbi55IC0gdGhpcy5wb3NpdGlvbi55O1xyXG4gICAgICAgIGlmKChkeCAqIGR4KSArIChkeSAqIGR5KSA8IHRoaXMuc2l6ZSAqIHRoaXMuc2l6ZSkge1xyXG4gICAgICAgICAgICB0aGlzLnNpemUgPSAzMDtcclxuICAgICAgICAgICAgdGhpcy5tb3VzZU92ZXIgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zaXplID0gMjQ7XHJcbiAgICAgICAgICAgIHRoaXMubW91c2VPdmVyID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBcclxuICAgIFxyXG4gICAgdGhpcy5sYWJlbC51cGRhdGUobW91c2VTdGF0ZSwgdGltZSwgaXNGb2N1c2VkKTtcclxuICAgIFxyXG4gICAgaWYoaXNGb2N1c2VkKSB7XHJcbiAgICAgICAgdGhpcy5kZXRhaWxzQnV0dG9uLnBvc2l0aW9uLnggPSB0aGlzLnBvc2l0aW9uLnggLSB0aGlzLmRldGFpbHNCdXR0b24uc2l6ZS54IC8gMiAtIDM7XHJcbiAgICAgICAgdGhpcy5kZXRhaWxzQnV0dG9uLnBvc2l0aW9uLnkgPSB0aGlzLnBvc2l0aW9uLnkgKyB0aGlzLnNpemUgKyAxMjtcclxuICAgICAgICB0aGlzLmRldGFpbHNCdXR0b24udXBkYXRlKG1vdXNlU3RhdGUpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY29tcGxldGlvbkJ1dHRvbi5wb3NpdGlvbi54ID0gdGhpcy5wb3NpdGlvbi54IC0gdGhpcy5jb21wbGV0aW9uQnV0dG9uLnNpemUueCAvIDIgLSAzO1xyXG4gICAgICAgIHRoaXMuY29tcGxldGlvbkJ1dHRvbi5wb3NpdGlvbi55ID0gdGhpcy5wb3NpdGlvbi55ICsgdGhpcy5zaXplICsgNDg7XHJcbiAgICAgICAgdGhpcy5jb21wbGV0aW9uQnV0dG9uLnVwZGF0ZShtb3VzZVN0YXRlKTtcclxuICAgIH1cclxufTtcclxuXHJcblxyXG5UdXRvcmlhbE5vZGUucHJvdG90eXBlLmNhbGN1bGF0ZU5vZGVUcmVlID0gZnVuY3Rpb24obGF5ZXJEZXB0aCwgcGFyZW50LCBkaXJlY3Rpb24pIHtcclxuICAgIFxyXG4gICAgLy8gSWYgdGhlIG5vZGUgYWxyZWFkeSBleGlzdHMgaW4gdGhlIGdyYXBoIGluIGEgYmV0dGVyIHBsYWNlIHRoYW4gdGhpcyBvbmUsIGRvbnQgdXNlIGl0XHJcbiAgICBpZih0aGlzLmN1cnJlbnRMYXllckRlcHRoID4gbGF5ZXJEZXB0aCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgdGhpcy5jdXJyZW50TGF5ZXJEZXB0aCA9IGxheWVyRGVwdGg7XHJcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcclxuICAgIFxyXG4gICAgaWYobGF5ZXJEZXB0aCA+IDApIHtcclxuICAgICAgICAvLyBsZWZ0IG9yIG1pZGRsZVxyXG4gICAgICAgIGlmKGRpcmVjdGlvbiA8IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5wcmV2aW91c05vZGVzLmZvckVhY2goKG5vZGUpPT57XHJcbiAgICAgICAgICAgICAgICBub2RlLmNhbGN1bGF0ZU5vZGVUcmVlKGxheWVyRGVwdGggLSAxLCB0aGlzLCAtMSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyByaWdodCBvciBtaWRkbGVcclxuICAgICAgICBpZihkaXJlY3Rpb24gPiAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLm5leHROb2Rlcy5mb3JFYWNoKChub2RlKT0+e1xyXG4gICAgICAgICAgICAgICAgbm9kZS5jYWxjdWxhdGVOb2RlVHJlZShsYXllckRlcHRoIC0gMSwgdGhpcywgMSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcblR1dG9yaWFsTm9kZS5wcm90b3R5cGUuc2V0VHJhbnNpdGlvbiA9IGZ1bmN0aW9uKGxheWVyRGVwdGgsIHBhcmVudCwgZGlyZWN0aW9uLCB0YXJnZXRQb3NpdGlvbikge1xyXG4gICAgXHJcbiAgICBpZighdGhpcy53YXNQcmV2aW91c2x5T25TY3JlZW4gJiYgcGFyZW50ICE9IG51bGwpIHtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gbmV3IFBvaW50KHRhcmdldFBvc2l0aW9uLngsIHRhcmdldFBvc2l0aW9uLnkpO1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24ueCAqPSAxLjU7XHJcbiAgICB9XHJcbiAgICB0aGlzLnByZXZpb3VzUG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uO1xyXG4gICAgdGhpcy5uZXh0UG9zaXRpb24gPSB0YXJnZXRQb3NpdGlvbjtcclxuICAgIFxyXG4gICAgLy9maWd1cmUgb3V0IHNpemUgb2YgY2hpbGRyZW4gdG8gc3BhY2UgdGhlbSBvdXQgYXBwcm9wcmlhdGVseVxyXG4gICAgaWYobGF5ZXJEZXB0aCA+IDApIHtcclxuICAgICAgICB2YXIgeFBvc2l0aW9uO1xyXG4gICAgICAgIHZhciB5UG9zaXRpb247XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9sZWZ0IG9yIG1pZGRsZVxyXG4gICAgICAgIGlmKGRpcmVjdGlvbiA8IDEpIHtcclxuICAgICAgICAgICAgeFBvc2l0aW9uID0gdGFyZ2V0UG9zaXRpb24ueCAtIGhvcml6b250YWxTcGFjaW5nOyAgIC8vIGNhbGN1bGF0ZSB0aGUgeCBwb3NpdGlvbiBmb3IgbmV4dCBub2Rlc1xyXG4gICAgICAgICAgICBpZihkaXJlY3Rpb24gPT0gMCkgeFBvc2l0aW9uIC09IDYwOyAgICAgICAgICAgICAgICAgLy8gYmFzZWQgb24gb2Zmc2V0IGZyb20gcGFyZW50IG5vZGUuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBmaXJzdCBzcGFjZSBpcyBsYXJnZXIgdGhhbiB0aGUgb3RoZXJzLlxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gZGV0ZXJtaW5lIGhlaWdodCBvZiB0aGlzIGFuZCBhbGwgY2hpbGQgbm9kZXNcclxuICAgICAgICAgICAgdmFyIHRvdGFsTGVmdEhlaWdodCA9IHRoaXMuZ2V0UHJldmlvdXNIZWlnaHQobGF5ZXJEZXB0aCk7XHJcbiAgICAgICAgICAgIHlQb3NpdGlvbiA9IHRhcmdldFBvc2l0aW9uLnkgLSAodG90YWxMZWZ0SGVpZ2h0IC8gMik7ICAgLy8gY2VudGVyIHZlcnRpY2FsbHlcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIExvb3Agb3ZlciBjaGlsZHJlbiBhbmQgc2V0IHRoZW0gdXAgYXMgd2VsbC4gKGlmIHRoZXkgYXJlIGNoaWxkcmVuIG9mIHRoaXMgbm9kZSlcclxuICAgICAgICAgICAgdGhpcy5wcmV2aW91c05vZGVzLmZvckVhY2goKG5vZGUpPT57XHJcbiAgICAgICAgICAgICAgICBpZihub2RlLnBhcmVudCA9PSB0aGlzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBsYWNlbWVudCA9IG5ldyBQb2ludCh4UG9zaXRpb24sIHlQb3NpdGlvbiArIG5vZGUuY3VycmVudEhlaWdodCAvIDIpO1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUuc2V0VHJhbnNpdGlvbihsYXllckRlcHRoIC0gMSwgdGhpcywgLTEsIHBsYWNlbWVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgeVBvc2l0aW9uICs9IG5vZGUuY3VycmVudEhlaWdodDsgICAgLy8gSW5jcmVtZW50IHkgcG9zaXRpb24gb2Ygbm9kZSBlYWNoIHRpbWUgdG8gc3BhY2UgdGhlbSBvdXQgY29ycmVjdGx5LlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9yaWdodCBvciBtaWRkbGVcclxuICAgICAgICBpZihkaXJlY3Rpb24gPiAtMSkge1xyXG4gICAgICAgICAgICB4UG9zaXRpb24gPSB0YXJnZXRQb3NpdGlvbi54ICsgaG9yaXpvbnRhbFNwYWNpbmc7ICAgLy8gY2FsY3VsYXRlIHRoZSB4IHBvc2l0aW9uIGZvciBuZXh0IG5vZGVzXHJcbiAgICAgICAgICAgIGlmKGRpcmVjdGlvbiA9PSAwKSB4UG9zaXRpb24gKz0gNjA7ICAgICAgICAgICAgICAgICAvLyBiYXNlZCBvbiBvZmZzZXQgZnJvbSBwYXJlbnQgbm9kZS5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZpcnN0IHNwYWNlIGlzIGxhcmdlciB0aGFuIHRoZSBvdGhlcnMuXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBEZXRlcm1pbmUgaGVpZ2h0IG9mIHRoaXMgYW5kIGFsbCBjaGlsZCBub2Rlcy5cclxuICAgICAgICAgICAgdmFyIHRvdGFsUmlnaHRIZWlnaHQgPSB0aGlzLmdldE5leHRIZWlnaHQobGF5ZXJEZXB0aCk7XHJcbiAgICAgICAgICAgIHlQb3NpdGlvbiA9IHRhcmdldFBvc2l0aW9uLnkgLSAodG90YWxSaWdodEhlaWdodCAvIDIpOyAgLy8gY2VudGVyIHZlcnRpY2FsbHkuXHJcblxyXG4gICAgICAgICAgICAvLyBMb29wIG92ZXIgY2hpbGRyZW4gYW5kIHNldCB0aGVtIHVwIGFzIHdlbGwuIChpZiB0aGV5IGFyZSBjaGlsZHJlbiBvZiB0aGlzIG5vZGUpXHJcbiAgICAgICAgICAgIHRoaXMubmV4dE5vZGVzLmZvckVhY2goKG5vZGUpPT57XHJcbiAgICAgICAgICAgICAgICBpZihub2RlLnBhcmVudCA9PSB0aGlzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBsYWNlbWVudCA9IG5ldyBQb2ludCh4UG9zaXRpb24sIHlQb3NpdGlvbiArIG5vZGUuY3VycmVudEhlaWdodCAvIDIpO1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUuc2V0VHJhbnNpdGlvbihsYXllckRlcHRoIC0gMSwgdGhpcywgMSwgcGxhY2VtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICB5UG9zaXRpb24gKz0gbm9kZS5jdXJyZW50SGVpZ2h0OyAgICAvLyBJbmNyZW1lbnQgeSBwb3NpdGlvbiBvZiBub2RlIGVhY2ggdGltZSB0byBzcGFjZSB0aGVtIG91dCBjb3JyZWN0bHkuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8vIENhbGN1bGF0ZXMgdGhlIHRvdGFsIGhlaWdodCBvZiB0aGlzIG5vZGUgYW5kIGFsbCBjaGlsZCBub2RlcyB0byB0aGUgbGVmdCByZWN1cnNpdmVseVxyXG5UdXRvcmlhbE5vZGUucHJvdG90eXBlLmdldFByZXZpb3VzSGVpZ2h0ID0gZnVuY3Rpb24obGF5ZXJEZXB0aCkge1xyXG4gICAgdGhpcy5jdXJyZW50SGVpZ2h0ID0gMDtcclxuICAgIGlmKGxheWVyRGVwdGggPiAwICYmIHRoaXMucHJldmlvdXNOb2Rlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgdGhpcy5wcmV2aW91c05vZGVzLmZvckVhY2goKG5vZGUpPT57XHJcbiAgICAgICAgICAgIGlmKG5vZGUucGFyZW50ID09IHRoaXMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudEhlaWdodCArPSBub2RlLmdldFByZXZpb3VzSGVpZ2h0KGxheWVyRGVwdGggLSAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgaWYodGhpcy5jdXJyZW50SGVpZ2h0ID09IDApIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRIZWlnaHQgPSBiYXNlU2l6ZSAqIDU7ICAvLyBlbmQgY2FzZSBmb3Igc2luZ2xlIG5vZGVzXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJldHVybiB0aGlzLmN1cnJlbnRIZWlnaHQ7XHJcbn07XHJcblxyXG4vLyBDYWxjdWxhdGVzIHRoZSB0b3RhbCBoZWlnaHQgb2YgdGhpcyBub2RlIGFuZCBhbGwgY2hpbGQgbm9kZXMgdG8gdGhlIHJpZ2h0IHJlY3Vyc2l2ZWx5XHJcblR1dG9yaWFsTm9kZS5wcm90b3R5cGUuZ2V0TmV4dEhlaWdodCA9IGZ1bmN0aW9uKGxheWVyRGVwdGgpIHtcclxuICAgIFxyXG4gICAgLy8gQ291bnQgdXAgc2l6ZSBvZiBhbGwgY2hpbGQgbm9kZXNcclxuICAgIHRoaXMuY3VycmVudEhlaWdodCA9IDA7XHJcbiAgICBpZihsYXllckRlcHRoID4gMCAmJiB0aGlzLm5leHROb2Rlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgdGhpcy5uZXh0Tm9kZXMuZm9yRWFjaCgobm9kZSk9PntcclxuICAgICAgICAgICAgaWYobm9kZS5wYXJlbnQgPT0gdGhpcykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50SGVpZ2h0ICs9IG5vZGUuZ2V0TmV4dEhlaWdodChsYXllckRlcHRoIC0gMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGlmKHRoaXMuY3VycmVudEhlaWdodCA9PSAwKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50SGVpZ2h0ID0gYmFzZVNpemUgKiA1OyAgLy8gZW5kIGNhc2UgZm9yIHNpbmdsZSBub2Rlc1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50SGVpZ2h0O1xyXG59O1xyXG5cclxuXHJcblR1dG9yaWFsTm9kZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKHBDYW52YXNTdGF0ZSwgcFBhaW50ZXIsIGdyYXBoLCBwYXJlbnRDYWxsZXIsIGRpcmVjdGlvbiwgbGF5ZXJEZXB0aCkge1xyXG4gICAgLy9kcmF3IGxpbmUgdG8gcGFyZW50IGlmIHBvc3NpYmxlXHJcbiAgICBpZihwYXJlbnRDYWxsZXIgJiYgcGFyZW50Q2FsbGVyID09IHRoaXMucGFyZW50KSB7XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5zYXZlKCk7XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5saW5lV2lkdGggPSAyO1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHguc3Ryb2tlU3R5bGUgPSBcIiNmZmZcIjtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vdmFyIGJldHdlZW4gPSBuZXcgUG9pbnQodGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnkpO1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHgubW92ZVRvKHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55KTtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LmxpbmVUbyhwYXJlbnRDYWxsZXIucG9zaXRpb24ueCwgcGFyZW50Q2FsbGVyLnBvc2l0aW9uLnkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHguY2xvc2VQYXRoKCk7XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5zdHJva2UoKTtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LnJlc3RvcmUoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gZHJhdyBjaGlsZCBub2Rlc1xyXG4gICAgaWYobGF5ZXJEZXB0aCA+IDApe1xyXG4gICAgICAgIC8vIGxlZnQgYW5kIG1pZGRsZVxyXG4gICAgICAgIGlmKGRpcmVjdGlvbiA8IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5wcmV2aW91c05vZGVzLmZvckVhY2goKG5vZGUpPT57XHJcbiAgICAgICAgICAgICAgICBub2RlLmRyYXcocENhbnZhc1N0YXRlLCBwUGFpbnRlciwgZ3JhcGgsIHRoaXMsIC0xLCBsYXllckRlcHRoIC0gMSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyByaWdodCBhbmQgbWlkZGxlXHJcbiAgICAgICAgaWYoZGlyZWN0aW9uID4gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5uZXh0Tm9kZXMuZm9yRWFjaCgobm9kZSk9PntcclxuICAgICAgICAgICAgICAgIG5vZGUuZHJhdyhwQ2FudmFzU3RhdGUsIHBQYWludGVyLCBncmFwaCwgdGhpcywgMSwgbGF5ZXJEZXB0aCAtIDEpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIGRyYXcgY2lyY2xlXHJcbiAgICBwUGFpbnRlci5jaXJjbGUocENhbnZhc1N0YXRlLmN0eCwgdGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnksIHRoaXMuc2l6ZSwgdHJ1ZSwgdGhpcy5jb2xvciwgdHJ1ZSwgXCIjZmZmXCIsIDIpO1xyXG4gICAgXHJcbiAgICAvLyBkcmF3IGEgY2hlY2ttYXJrXHJcbiAgICBpZih0aGlzLnN0YXRlID09IFR1dG9yaWFsU3RhdGUuQ29tcGxldGVkKSB7XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5kcmF3SW1hZ2UoZ3JhcGguY2hlY2tJbWFnZSwgdGhpcy5wb3NpdGlvbi54IC0gMzIsIHRoaXMucG9zaXRpb24ueSAtIDMyKTtcclxuICAgIH1cclxuICAgIC8vIGRyYXcgYSBsb2NrXHJcbiAgICBpZih0aGlzLnN0YXRlID09IFR1dG9yaWFsU3RhdGUuTG9ja2VkKSB7XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5kcmF3SW1hZ2UoZ3JhcGgubG9ja0ltYWdlLCB0aGlzLnBvc2l0aW9uLnggLSAzMiwgdGhpcy5wb3NpdGlvbi55IC0gMzIpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyBkcmF3IHRoZSBsYWJlbFxyXG4gICAgdGhpcy5sYWJlbC5kcmF3KHBDYW52YXNTdGF0ZSwgcFBhaW50ZXIpO1xyXG4gICAgaWYoZGlyZWN0aW9uID09IDApIHtcclxuICAgICAgICB0aGlzLmRldGFpbHNCdXR0b24uZHJhdyhwQ2FudmFzU3RhdGUsIHBQYWludGVyKTtcclxuICAgICAgICB0aGlzLmNvbXBsZXRpb25CdXR0b24uZHJhdyhwQ2FudmFzU3RhdGUsIHBQYWludGVyKTtcclxuICAgIH1cclxufTtcclxuXHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUdXRvcmlhbE5vZGU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmZ1bmN0aW9uIERyYXdsaWIoKXtcclxufTtcclxuXHJcbkRyYXdsaWIucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oY3R4LCB4LCB5LCB3LCBoKSB7XHJcbiAgICBjdHguY2xlYXJSZWN0KHgsIHksIHcsIGgpO1xyXG59O1xyXG5cclxuRHJhd2xpYi5wcm90b3R5cGUucmVjdCA9IGZ1bmN0aW9uKGN0eCwgeCwgeSwgdywgaCwgY29sKSB7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IGNvbDtcclxuICAgIGN0eC5maWxsUmVjdCh4LCB5LCB3LCBoKTtcclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbn07XHJcblxyXG5EcmF3bGliLnByb3RvdHlwZS5yb3VuZGVkUmVjdCA9IGZ1bmN0aW9uKGN0eCwgeCwgeSwgdywgaCwgcmFkLCBmaWxsLCBmaWxsQ29sb3IsIG91dGxpbmUsIG91dGxpbmVDb2xvciwgb3V0bGluZVdpZHRoKSB7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4Lm1vdmVUbyh4LCB5IC0gcmFkKTsgLy8xMSBvIGNsb2NrXHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHgubGluZVRvKHggKyB3LCB5IC0gcmFkKTsgLy8xIG8gY2xvY2tcclxuICAgIGN0eC5hcmNUbyh4ICsgdyArIHJhZCwgeSAtIHJhZCwgeCArIHcgKyByYWQsIHksIHJhZCk7IC8vIDIgbyBjbG9ja1xyXG4gICAgY3R4LmxpbmVUbyh4ICsgdyArIHJhZCwgeSArIGgpOyAvLyA0IG8gY2xvY2tcclxuICAgIGN0eC5hcmNUbyh4ICsgdyArIHJhZCwgeSArIGggKyByYWQsIHggKyB3LCB5ICsgaCArIHJhZCwgcmFkKSAvLzUgbyBjbG9ja1xyXG4gICAgY3R4LmxpbmVUbyh4LCB5ICsgaCArIHJhZCk7IC8vIDcgbyBjbG9ja1xyXG4gICAgY3R4LmFyY1RvKHggLSByYWQsIHkgKyBoICsgcmFkLCB4IC0gcmFkLCB5ICsgaCwgcmFkKSAvLzggbyBjbG9ja1xyXG4gICAgY3R4LmxpbmVUbyh4IC0gcmFkLCB5KTsgLy8gMTAgbyBjbG9ja1xyXG4gICAgY3R4LmFyY1RvKHggLSByYWQsIHkgLSByYWQsIHgsIHkgLXJhZCwgcmFkKSAvLzExIG8gY2xvY2tcclxuICAgIGN0eC5jbG9zZVBhdGgoKTtcclxuICAgIGlmKGZpbGwpIHtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gZmlsbENvbG9yO1xyXG4gICAgICAgIGN0eC5maWxsKCk7XHJcbiAgICB9XHJcbiAgICBpZihvdXRsaW5lKSB7XHJcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gb3V0bGluZUNvbG9yO1xyXG4gICAgICAgIGN0eC5saW5lV2lkdGggPSBvdXRsaW5lV2lkdGg7XHJcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgfVxyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxufVxyXG5cclxuRHJhd2xpYi5wcm90b3R5cGUubGluZSA9IGZ1bmN0aW9uKGN0eCwgeDEsIHkxLCB4MiwgeTIsIHRoaWNrbmVzcywgY29sb3IpIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHgubW92ZVRvKHgxLCB5MSk7XHJcbiAgICBjdHgubGluZVRvKHgyLCB5Mik7XHJcbiAgICBjdHgubGluZVdpZHRoID0gdGhpY2tuZXNzO1xyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gY29sb3I7XHJcbiAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG59O1xyXG5cclxuRHJhd2xpYi5wcm90b3R5cGUuY2lyY2xlID0gZnVuY3Rpb24oY3R4LCB4LCB5LCByYWRpdXMsIGZpbGwsIGZpbGxDb2xvciwgb3V0bGluZSwgb3V0bGluZUNvbG9yLCBvdXRsaW5lV2lkdGgpIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHguYXJjKHgseSwgcmFkaXVzLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xyXG4gICAgY3R4LmNsb3NlUGF0aCgpO1xyXG4gICAgaWYoZmlsbCkge1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBmaWxsQ29sb3I7XHJcbiAgICAgICAgY3R4LmZpbGwoKTtcclxuICAgIH1cclxuICAgIGlmKG91dGxpbmUpIHtcclxuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBvdXRsaW5lQ29sb3I7XHJcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IG91dGxpbmVXaWR0aDtcclxuICAgICAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICB9XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG59O1xyXG5cclxuRHJhd2xpYi5wcm90b3R5cGUudGV4dFRvTGluZXMgPSBmdW5jdGlvbihjdHgsIHRleHQsIGZvbnQsIHdpZHRoKSB7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4LmZvbnQgPSBmb250O1xyXG4gICAgXHJcbiAgICB2YXIgbGluZXMgPSBbXTtcclxuICAgIFxyXG4gICAgd2hpbGUgKHRleHQubGVuZ3RoKSB7XHJcbiAgICAgICAgdmFyIGksIGo7XHJcbiAgICAgICAgZm9yKGkgPSB0ZXh0Lmxlbmd0aDsgY3R4Lm1lYXN1cmVUZXh0KHRleHQuc3Vic3RyKDAsIGkpKS53aWR0aCA+IHdpZHRoOyBpLS0pO1xyXG5cclxuICAgICAgICB2YXIgcmVzdWx0ID0gdGV4dC5zdWJzdHIoMCxpKTtcclxuXHJcbiAgICAgICAgaWYgKGkgIT09IHRleHQubGVuZ3RoKVxyXG4gICAgICAgICAgICBmb3IodmFyIGogPSAwOyByZXN1bHQuaW5kZXhPZihcIiBcIiwgaikgIT09IC0xOyBqID0gcmVzdWx0LmluZGV4T2YoXCIgXCIsIGopICsgMSk7XHJcblxyXG4gICAgICAgIGxpbmVzLnB1c2gocmVzdWx0LnN1YnN0cigwLCBqIHx8IHJlc3VsdC5sZW5ndGgpKTtcclxuICAgICAgICB3aWR0aCA9IE1hdGgubWF4KHdpZHRoLCBjdHgubWVhc3VyZVRleHQobGluZXNbbGluZXMubGVuZ3RoIC0gMV0pLndpZHRoKTtcclxuICAgICAgICB0ZXh0ICA9IHRleHQuc3Vic3RyKGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdLmxlbmd0aCwgdGV4dC5sZW5ndGgpO1xyXG4gICAgfVxyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxuICAgIHJldHVybiBsaW5lcztcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRHJhd2xpYjsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIFBvaW50ID0gcmVxdWlyZSgnLi4vY29udGFpbmVycy9Qb2ludC5qcycpO1xyXG5cclxuZnVuY3Rpb24gVXRpbGl0aWVzKCl7XHJcbn1cclxuXHJcbi8vQk9BUkRQSEFTRSAtIHNldCBhIHN0YXR1cyB2YWx1ZSBvZiBhIG5vZGUgaW4gbG9jYWxTdG9yYWdlIGJhc2VkIG9uIElEXHJcblV0aWxpdGllcy5wcm90b3R5cGUuc2V0UHJvZ3Jlc3MgPSBmdW5jdGlvbihwT2JqZWN0KXtcclxuICAgIHZhciBwcm9ncmVzc1N0cmluZyA9IGxvY2FsU3RvcmFnZS5wcm9ncmVzcztcclxuICAgIFxyXG4gICAgdmFyIHRhcmdldE9iamVjdCA9IHBPYmplY3Q7XHJcbiAgICAvL21ha2UgYWNjb21vZGF0aW9ucyBpZiB0aGlzIGlzIGFuIGV4dGVuc2lvbiBub2RlXHJcbiAgICB2YXIgZXh0ZW5zaW9uZmxhZyA9IHRydWU7XHJcbiAgICB3aGlsZShleHRlbnNpb25mbGFnKXtcclxuICAgICAgICBpZih0YXJnZXRPYmplY3QudHlwZSA9PT0gXCJleHRlbnNpb25cIil7XHJcbiAgICAgICAgICAgIHRhcmdldE9iamVjdCA9IHRhcmdldE9iamVjdC5jb25uZWN0aW9uRm9yd2FyZFswXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgZXh0ZW5zaW9uZmxhZyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgdmFyIG9iamVjdElEID0gdGFyZ2V0T2JqZWN0LmRhdGEuX2lkO1xyXG4gICAgdmFyIG9iamVjdFN0YXR1cyA9IHRhcmdldE9iamVjdC5zdGF0dXM7XHJcbiAgICBcclxuICAgIC8vc2VhcmNoIHRoZSBwcm9ncmVzc1N0cmluZyBmb3IgdGhlIGN1cnJlbnQgSURcclxuICAgIHZhciBpZEluZGV4ID0gcHJvZ3Jlc3NTdHJpbmcuaW5kZXhPZihvYmplY3RJRCk7XHJcbiAgICBcclxuICAgIC8vaWYgaXQncyBub3QgYWRkIGl0IHRvIHRoZSBlbmRcclxuICAgIGlmKGlkSW5kZXggPT09IC0xKXtcclxuICAgICAgICBwcm9ncmVzc1N0cmluZyArPSBvYmplY3RJRCArIFwiXCIgKyBvYmplY3RTdGF0dXMgKyBcIixcIjtcclxuICAgIH1cclxuICAgIC8vb3RoZXJ3aXNlIG1vZGlmeSB0aGUgc3RhdHVzIHZhbHVlXHJcbiAgICBlbHNle1xyXG4gICAgICAgIHByb2dyZXNzU3RyaW5nID0gcHJvZ3Jlc3NTdHJpbmcuc3Vic3RyKDAsIG9iamVjdElELmxlbmd0aCArIGlkSW5kZXgpICsgb2JqZWN0U3RhdHVzICsgcHJvZ3Jlc3NTdHJpbmcuc3Vic3RyKG9iamVjdElELmxlbmd0aCArIDEgKyBpZEluZGV4LCBwcm9ncmVzc1N0cmluZy5sZW5ndGgpICsgXCJcIjtcclxuICAgIH1cclxuICAgIGxvY2FsU3RvcmFnZS5wcm9ncmVzcyA9IHByb2dyZXNzU3RyaW5nO1xyXG59XHJcblxyXG4vL3JldHVybnMgbW91c2UgcG9zaXRpb24gaW4gbG9jYWwgY29vcmRpbmF0ZSBzeXN0ZW0gb2YgZWxlbWVudFxyXG5VdGlsaXRpZXMucHJvdG90eXBlLmdldE1vdXNlID0gZnVuY3Rpb24oZSl7XHJcbiAgICByZXR1cm4gbmV3IFBvaW50KChlLnBhZ2VYIC0gZS50YXJnZXQub2Zmc2V0TGVmdCksIChlLnBhZ2VZIC0gZS50YXJnZXQub2Zmc2V0VG9wKSk7XHJcbn1cclxuXHJcblV0aWxpdGllcy5wcm90b3R5cGUubWFwID0gZnVuY3Rpb24odmFsdWUsIG1pbjEsIG1heDEsIG1pbjIsIG1heDIpe1xyXG4gICAgcmV0dXJuIG1pbjIgKyAobWF4MiAtIG1pbjIpICogKCh2YWx1ZSAtIG1pbjEpIC8gKG1heDEgLSBtaW4xKSk7XHJcbn1cclxuXHJcbi8vbGltaXRzIHRoZSB1cHBlciBhbmQgbG93ZXIgbGltaXRzIG9mIHRoZSBwYXJhbWV0ZXIgdmFsdWVcclxuVXRpbGl0aWVzLnByb3RvdHlwZS5jbGFtcCA9IGZ1bmN0aW9uKHZhbHVlLCBtaW4sIG1heCl7XHJcbiAgICByZXR1cm4gTWF0aC5tYXgobWluLCBNYXRoLm1pbihtYXgsIHZhbHVlKSk7XHJcbn1cclxuXHJcbi8vY2hlY2tzIG1vdXNlIGNvbGxpc2lvbiBvbiBjYW52YXNcclxuVXRpbGl0aWVzLnByb3RvdHlwZS5tb3VzZUludGVyc2VjdCA9IGZ1bmN0aW9uKHBNb3VzZVN0YXRlLCBwRWxlbWVudCwgcE9mZnNldHRlciwgcFNjYWxlKXtcclxuICAgIC8vaWYgdGhlIHggcG9zaXRpb24gY29sbGlkZXNcclxuICAgIGlmKHBFbGVtZW50LnN0YXR1cyAhPT0gXCIwXCIpe1xyXG4gICAgICAgIGlmKHBNb3VzZVN0YXRlLnJlbGF0aXZlUG9zaXRpb24ueCArIHBPZmZzZXR0ZXIueCA+IChwRWxlbWVudC5wb3NpdGlvbi54IC0gKHBFbGVtZW50LndpZHRoKS8yKSAmJiBwTW91c2VTdGF0ZS5yZWxhdGl2ZVBvc2l0aW9uLnggKyBwT2Zmc2V0dGVyLnggPCAocEVsZW1lbnQucG9zaXRpb24ueCArIChwRWxlbWVudC53aWR0aCkvMikpe1xyXG4gICAgICAgICAgICAvL2lmIHRoZSB5IHBvc2l0aW9uIGNvbGxpZGVzXHJcbiAgICAgICAgICAgIGlmKHBNb3VzZVN0YXRlLnJlbGF0aXZlUG9zaXRpb24ueSArIHBPZmZzZXR0ZXIueSA+IChwRWxlbWVudC5wb3NpdGlvbi55IC0gKHBFbGVtZW50LmhlaWdodCkvMikgJiYgcE1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbi55ICsgcE9mZnNldHRlci55IDwgKHBFbGVtZW50LnBvc2l0aW9uLnkgKyAocEVsZW1lbnQuaGVpZ2h0KS8yKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgcEVsZW1lbnQubW91c2VPdmVyID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgcEVsZW1lbnQubW91c2VPdmVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgcEVsZW1lbnQubW91c2VPdmVyID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFV0aWxpdGllczsiXX0=
