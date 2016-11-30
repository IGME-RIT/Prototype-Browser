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
        this.changeState(TutorialState.Locked);
        
        // Default to unlocked if there are no previous nodes.
        if(this.previousNodes.length == 0) {
            this.changeState(TutorialState.Unlocked);
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9tYWluLmpzIiwianMvbW9kdWxlcy9HYW1lLmpzIiwianMvbW9kdWxlcy9jb250YWluZXJzL0J1dHRvbi5qcyIsImpzL21vZHVsZXMvY29udGFpbmVycy9DYW52YXNTdGF0ZS5qcyIsImpzL21vZHVsZXMvY29udGFpbmVycy9Nb3VzZVN0YXRlLmpzIiwianMvbW9kdWxlcy9jb250YWluZXJzL1BvaW50LmpzIiwianMvbW9kdWxlcy9jb250YWluZXJzL1RpbWUuanMiLCJqcy9tb2R1bGVzL2dyYXBoL0RldGFpbHNQYW5lbC5qcyIsImpzL21vZHVsZXMvZ3JhcGgvR3JhcGguanMiLCJqcy9tb2R1bGVzL2dyYXBoL05vZGVMYWJlbC5qcyIsImpzL21vZHVsZXMvZ3JhcGgvUGFyc2VyLmpzIiwianMvbW9kdWxlcy9ncmFwaC9TZWFyY2hQYW5lbC5qcyIsImpzL21vZHVsZXMvZ3JhcGgvVHV0b3JpYWxOb2RlLmpzIiwianMvbW9kdWxlcy90b29scy9EcmF3bGliLmpzIiwianMvbW9kdWxlcy90b29scy9VdGlsaXRpZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xyXG4vL2ltcG9ydHNcclxudmFyIEdhbWUgPSByZXF1aXJlKCcuL21vZHVsZXMvR2FtZS5qcycpO1xyXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuL21vZHVsZXMvY29udGFpbmVycy9Qb2ludC5qcycpO1xyXG52YXIgVGltZSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9jb250YWluZXJzL1RpbWUuanMnKTtcclxudmFyIE1vdXNlU3RhdGUgPSByZXF1aXJlKCcuL21vZHVsZXMvY29udGFpbmVycy9Nb3VzZVN0YXRlLmpzJyk7XHJcbnZhciBDYW52YXNTdGF0ZSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9jb250YWluZXJzL0NhbnZhc1N0YXRlLmpzJyk7XHJcblxyXG4vL2dhbWUgb2JqZWN0c1xyXG52YXIgZ2FtZTtcclxudmFyIGNhbnZhcztcclxudmFyIGN0eDtcclxudmFyIHRpbWU7XHJcblxyXG4vL3Jlc3BvbnNpdmVuZXNzXHJcbnZhciBoZWFkZXI7XHJcbnZhciBjZW50ZXI7XHJcbnZhciBzY2FsZTtcclxuXHJcbi8vbW91c2UgaGFuZGxpbmdcclxudmFyIG1vdXNlUG9zaXRpb247XHJcbnZhciByZWxhdGl2ZU1vdXNlUG9zaXRpb247XHJcbnZhciBtb3VzZURvd247XHJcbnZhciBtb3VzZUluO1xyXG52YXIgd2hlZWxEZWx0YTtcclxuXHJcbi8vcGFzc2FibGUgc3RhdGVzXHJcbnZhciBtb3VzZVN0YXRlO1xyXG52YXIgY2FudmFzU3RhdGU7XHJcblxyXG4vL2ZpcmVzIHdoZW4gdGhlIHdpbmRvdyBsb2Fkc1xyXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24oZSl7XHJcbiAgICAvL2RlYnVnIGJ1dHRvbiBkZXNpZ25lZCB0byBjbGVhciBwcm9ncmVzcyBkYXRhXHJcbiAgICBcclxuICAgIC8vdmFyaWFibGUgYW5kIGxvb3AgaW5pdGlhbGl6YXRpb25cclxuICAgIGluaXRpYWxpemVWYXJpYWJsZXMoKTtcclxuICAgIGxvb3AoKTtcclxufVxyXG5cclxuLy9pbml0aWFsaXphdGlvbiBmb3IgdmFyaWFibGVzLCBtb3VzZSBldmVudHMsIGFuZCBnYW1lIFwiY2xhc3NcIlxyXG5mdW5jdGlvbiBpbml0aWFsaXplVmFyaWFibGVzKCl7XHJcbiAgICAvL2NhbXZhcyBpbml0aWFsaXphdGlvblxyXG4gICAgY2FudmFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignY2FudmFzJyk7XHJcbiAgICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgIFxyXG4gICAgdGltZSA9IG5ldyBUaW1lKCk7XHJcbiAgICBcclxuICAgIFxyXG4gICAgLy9tb3VzZSB2YXJpYWJsZSBpbml0aWFsaXphdGlvblxyXG4gICAgbW91c2VQb3NpdGlvbiA9IG5ldyBQb2ludCgwLDApO1xyXG4gICAgcmVsYXRpdmVNb3VzZVBvc2l0aW9uID0gbmV3IFBvaW50KDAsMCk7XHJcbiAgICBcclxuICAgIFxyXG4gICAgXHJcbiAgICBcclxuICAgIFxyXG4gICAgLy9ldmVudCBsaXN0ZW5lcnMgZm9yIG1vdXNlIGludGVyYWN0aW9ucyB3aXRoIHRoZSBjYW52YXNcclxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICB2YXIgYm91bmRSZWN0ID0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIG1vdXNlUG9zaXRpb24gPSBuZXcgUG9pbnQoZS5jbGllbnRYIC0gYm91bmRSZWN0LmxlZnQsIGUuY2xpZW50WSAtIGJvdW5kUmVjdC50b3ApO1xyXG4gICAgICAgIHJlbGF0aXZlTW91c2VQb3NpdGlvbiA9IG5ldyBQb2ludChtb3VzZVBvc2l0aW9uLnggLSBjYW52YXMub2Zmc2V0V2lkdGggLyAyLCBtb3VzZVBvc2l0aW9uLnkgLSBjYW52YXMub2Zmc2V0SGVpZ2h0IC8gMik7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgbW91c2VEb3duID0gZmFsc2U7XHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBmdW5jdGlvbihlKXtcclxuICAgICAgICBtb3VzZURvd24gPSB0cnVlO1xyXG4gICAgfSk7XHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgbW91c2VEb3duID0gZmFsc2U7XHJcbiAgICB9KTtcclxuICAgIG1vdXNlSW4gPSBmYWxzZTtcclxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VvdmVyXCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIG1vdXNlSW4gPSB0cnVlO1xyXG4gICAgfSk7XHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3V0XCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIG1vdXNlSW4gPSBmYWxzZTtcclxuICAgICAgICBtb3VzZURvd24gPSBmYWxzZTtcclxuICAgIH0pO1xyXG4gICAgd2hlZWxEZWx0YSA9IDA7XHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNld2hlZWxcIiwgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgd2hlZWxEZWx0YSA9IGUud2hlZWxEZWx0YTtcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICBcclxuICAgIFxyXG4gICAgXHJcbiAgICAvL3N0YXRlIHZhcmlhYmxlIGluaXRpYWxpemF0aW9uXHJcbiAgICBtb3VzZVN0YXRlID0gbmV3IE1vdXNlU3RhdGUobW91c2VQb3NpdGlvbiwgcmVsYXRpdmVNb3VzZVBvc2l0aW9uLCBtb3VzZURvd24sIG1vdXNlSW4sIHdoZWVsRGVsdGEpO1xyXG4gICAgY2FudmFzU3RhdGUgPSBuZXcgQ2FudmFzU3RhdGUoY2FudmFzLCBjdHgpO1xyXG4gICAgXHJcbiAgICAvL2xvY2FsIHN0b3JhZ2UgaGFuZGxpbmcgZm9yIGFjdGl2ZSBub2RlIHJlY29yZCBhbmQgcHJvZ3Jlc3NcclxuICAgIGlmKGxvY2FsU3RvcmFnZS5hY3RpdmVOb2RlID09PSB1bmRlZmluZWQpe1xyXG4gICAgICAgIGxvY2FsU3RvcmFnZS5hY3RpdmVOb2RlID0gMDtcclxuICAgIH1cclxuICAgIGlmKGxvY2FsU3RvcmFnZS5wcm9ncmVzcyA9PT0gdW5kZWZpbmVkKXtcclxuICAgICAgICBsb2NhbFN0b3JhZ2UucHJvZ3Jlc3MgPSBcIlwiO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvL2NyZWF0ZXMgdGhlIGdhbWUgb2JqZWN0IGZyb20gd2hpY2ggbW9zdCBpbnRlcmFjdGlvbiBpcyBtYW5hZ2VkXHJcbiAgICBnYW1lID0gbmV3IEdhbWUoKTtcclxufVxyXG5cclxuLy9maXJlcyBvbmNlIHBlciBmcmFtZVxyXG5mdW5jdGlvbiBsb29wKCkge1xyXG4gICAgLy9iaW5kcyBsb29wIHRvIGZyYW1lc1xyXG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShsb29wLmJpbmQodGhpcykpO1xyXG4gICAgXHJcbiAgICB0aW1lLnVwZGF0ZSguMDE2Nyk7XHJcbiAgICBcclxuICAgIC8vZmVlZCBjdXJyZW50IG1vdXNlIHZhcmlhYmxlcyBiYWNrIGludG8gbW91c2Ugc3RhdGVcclxuICAgIG1vdXNlU3RhdGUudXBkYXRlKG1vdXNlUG9zaXRpb24sIHJlbGF0aXZlTW91c2VQb3NpdGlvbiwgbW91c2VEb3duLCBtb3VzZUluLCB3aGVlbERlbHRhKTtcclxuICAgIC8vcmVzZXR0aW5nIHdoZWVsIGRlbHRhXHJcbiAgICB3aGVlbERlbHRhID0gMDtcclxuICAgIFxyXG4gICAgLy91cGRhdGUgZ2FtZSdzIHZhcmlhYmxlczogcGFzc2luZyBjb250ZXh0LCBjYW52YXMsIHRpbWUsIGNlbnRlciBwb2ludCwgdXNhYmxlIGhlaWdodCwgbW91c2Ugc3RhdGVcclxuICAgIFxyXG4gICAgZ2FtZS51cGRhdGUobW91c2VTdGF0ZSwgY2FudmFzU3RhdGUsIHRpbWUpO1xyXG59O1xyXG5cclxuLy9saXN0ZW5zIGZvciBjaGFuZ2VzIGluIHNpemUgb2Ygd2luZG93IGFuZCBhZGp1c3RzIHZhcmlhYmxlcyBhY2NvcmRpbmdseVxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBmdW5jdGlvbihlKXtcclxuICAgIGNhbnZhc1N0YXRlLnVwZGF0ZSgpO1xyXG59KTtcclxuXHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuLy9pbXBvcnRlZCBvYmplY3RzXHJcbnZhciBHcmFwaCA9IHJlcXVpcmUoJy4vZ3JhcGgvR3JhcGguanMnKTtcclxudmFyIERyYXdMaWIgPSByZXF1aXJlKCcuL3Rvb2xzL0RyYXdsaWIuanMnKTtcclxudmFyIFV0aWxpdGllcyA9IHJlcXVpcmUoJy4vdG9vbHMvVXRpbGl0aWVzLmpzJyk7XHJcbnZhciBQYXJzZXIgPSByZXF1aXJlKCcuL2dyYXBoL1BhcnNlci5qcycpO1xyXG5cclxudmFyIGdyYXBoO1xyXG52YXIgcGFpbnRlcjtcclxudmFyIHV0aWxpdHk7XHJcbnZhciBtb3VzZVN0YXRlO1xyXG52YXIgbW91c2VUYXJnZXQ7XHJcbnZhciBncmFwaExvYWRlZDtcclxuXHJcbmZ1bmN0aW9uIEdhbWUoKXsgICAgXHJcbiAgICBwYWludGVyID0gbmV3IERyYXdMaWIoKTtcclxuICAgIHV0aWxpdHkgPSBuZXcgVXRpbGl0aWVzKCk7XHJcbiAgICBcclxuICAgIGdyYXBoTG9hZGVkID0gZmFsc2U7XHJcbiAgICBtb3VzZVRhcmdldCA9IDA7XHJcbiAgICBcclxuICAgIC8vaW5zdGFudGlhdGUgdGhlIGdyYXBoXHJcbiAgICBQYXJzZXIoXCJodHRwczovL2F0bGFzLWJhY2tlbmQuaGVyb2t1YXBwLmNvbS9yZXBvc1wiLCAocEpTT05EYXRhKT0+IHtcclxuICAgICAgICBncmFwaCA9IG5ldyBHcmFwaChwSlNPTkRhdGEpO1xyXG4gICAgICAgIGdyYXBoTG9hZGVkID0gdHJ1ZTtcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICAvL2dpdmUgbW91c2VTdGF0ZSBhIHZhbHVlIGZyb20gdGhlIHN0YXJ0IHNvIGl0IGRvZXNuJ3QgcGFzcyB1bmRlZmluZWQgdG8gcHJldmlvdXNcclxuICAgIG1vdXNlU3RhdGUgPSAwO1xyXG59XHJcblxyXG4vL3Bhc3NpbmcgY29udGV4dCwgY2FudmFzLCBkZWx0YSB0aW1lLCBjZW50ZXIgcG9pbnQsIG1vdXNlIHN0YXRlXHJcbkdhbWUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKG1vdXNlU3RhdGUsIGNhbnZhc1N0YXRlLCB0aW1lKSB7XHJcbiAgICBcclxuICAgIGlmKGdyYXBoTG9hZGVkKSB7XHJcbiAgICAgICAgLy91cGRhdGUga2V5IHZhcmlhYmxlcyBpbiB0aGUgYWN0aXZlIHBoYXNlXHJcbiAgICAgICAgZ3JhcGgudXBkYXRlKG1vdXNlU3RhdGUsIGNhbnZhc1N0YXRlLCB0aW1lKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy9kcmF3IGJhY2tncm91bmQgYW5kIHRoZW4gZ3JhcGhcclxuICAgIGNhbnZhc1N0YXRlLmN0eC5zYXZlKCk7XHJcbiAgICBwYWludGVyLnJlY3QoY2FudmFzU3RhdGUuY3R4LCAwLCAwLCBjYW52YXNTdGF0ZS53aWR0aCwgY2FudmFzU3RhdGUuaGVpZ2h0LCBcIiMyMjJcIik7XHJcbiAgICBjYW52YXNTdGF0ZS5jdHgucmVzdG9yZSgpO1xyXG4gICAgXHJcbiAgICBcclxuICAgIGlmKGdyYXBoTG9hZGVkKSB7XHJcbiAgICAgICAgZ3JhcGguZHJhdyhjYW52YXNTdGF0ZSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICAvL2lmIHdlIGhhdmVudCBsb2FkZWQgdGhlIGRhdGEsIGRpc3BsYXkgbG9hZGluZywgYW5kIHdhaXRcclxuICAgICAgICBjYW52YXNTdGF0ZS5jdHguc2F2ZSgpO1xyXG4gICAgICAgIGNhbnZhc1N0YXRlLmN0eC5mb250ID0gXCI0MHB4IEFyaWFsXCI7XHJcbiAgICAgICAgY2FudmFzU3RhdGUuY3R4LmZpbGxTdHlsZSA9IFwiI2ZmZlwiO1xyXG4gICAgICAgIGNhbnZhc1N0YXRlLmN0eC50ZXh0QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xyXG4gICAgICAgIGNhbnZhc1N0YXRlLmN0eC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xyXG4gICAgICAgIGNhbnZhc1N0YXRlLmN0eC5maWxsVGV4dChcIkxvYWRpbmcuLi5cIiwgY2FudmFzU3RhdGUuY2VudGVyLngsIGNhbnZhc1N0YXRlLmNlbnRlci55KTtcclxuICAgICAgICBjYW52YXNTdGF0ZS5jdHgucmVzdG9yZSgpO1xyXG4gICAgfVxyXG4gICAgXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4vUG9pbnQuanMnKTtcclxuXHJcbmZ1bmN0aW9uIEJ1dHRvbihwb3NpdGlvbiwgc2l6ZSwgdGV4dCwgY29sb3IpIHtcclxuICAgIHRoaXMucG9zaXRpb24gPSBuZXcgUG9pbnQocG9zaXRpb24ueCwgcG9zaXRpb24ueSk7XHJcbiAgICB0aGlzLnNpemUgPSBuZXcgUG9pbnQoc2l6ZS54LCBzaXplLnkpO1xyXG4gICAgdGhpcy50ZXh0ID0gdGV4dDtcclxuICAgIHRoaXMubW91c2VPdmVyID0gZmFsc2U7XHJcbiAgICB0aGlzLmNvbG9yID0gY29sb3I7XHJcbiAgICB0aGlzLm91dGxpbmVXaWR0aCA9IDE7XHJcbn07XHJcblxyXG4vL3VwZGF0ZXMgYnV0dG9uLCByZXR1cm5zIHRydWUgaWYgY2xpY2tlZFxyXG5CdXR0b24ucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKHBNb3VzZVN0YXRlKSB7XHJcbiAgICBcclxuICAgIHZhciBtID0gcE1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbjtcclxuICAgIGlmKCBtLnggPCB0aGlzLnBvc2l0aW9uLnggfHwgbS54ID4gdGhpcy5wb3NpdGlvbi54ICsgdGhpcy5zaXplLnggfHxcclxuICAgICAgICBtLnkgPCB0aGlzLnBvc2l0aW9uLnkgfHwgbS55ID4gdGhpcy5wb3NpdGlvbi55ICsgdGhpcy5zaXplLnkpIHtcclxuICAgICAgICB0aGlzLm1vdXNlT3ZlciA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5tb3VzZU92ZXIgPSB0cnVlO1xyXG4gICAgICAgIGlmKHBNb3VzZVN0YXRlLm1vdXNlRG93biAmJiAhcE1vdXNlU3RhdGUubGFzdE1vdXNlRG93bikge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5CdXR0b24ucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihwQ2FudmFzU3RhdGUsIHBQYWludGVyKSB7XHJcbiAgICAvL2RyYXcgYmFzZSBidXR0b25cclxuICAgIGlmKHRoaXMubW91c2VPdmVyKSB7XHJcbiAgICAgICAgdGhpcy5vdXRsaW5lV2lkdGggPSAyO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5vdXRsaW5lV2lkdGggPSAxO1xyXG4gICAgfVxyXG4gICAgcFBhaW50ZXIucmVjdChwQ2FudmFzU3RhdGUuY3R4LFxyXG4gICAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnggLSB0aGlzLm91dGxpbmVXaWR0aCxcclxuICAgICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi55IC0gdGhpcy5vdXRsaW5lV2lkdGgsXHJcbiAgICAgICAgICAgICAgICAgIHRoaXMuc2l6ZS54ICsgMiAqIHRoaXMub3V0bGluZVdpZHRoLFxyXG4gICAgICAgICAgICAgICAgICB0aGlzLnNpemUueSArIDIgKiB0aGlzLm91dGxpbmVXaWR0aCwgXCIjZmZmXCIpO1xyXG5cclxuICAgIHBQYWludGVyLnJlY3QocENhbnZhc1N0YXRlLmN0eCwgdGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnksIHRoaXMuc2l6ZS54LCB0aGlzLnNpemUueSwgdGhpcy5jb2xvcik7XHJcbiAgICBcclxuICAgIC8vZHJhdyB0ZXh0IG9mIGJ1dHRvblxyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5zYXZlKCk7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LmZvbnQgPSBcIjE0cHggQXJpYWxcIjtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHguZmlsbFN0eWxlID0gXCIjZmZmXCI7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LnRleHRBbGlnbiA9IFwiY2VudGVyXCI7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LnRleHRCYXNlbGluZSA9IFwibWlkZGxlXCI7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LmZpbGxUZXh0KHRoaXMudGV4dCwgdGhpcy5wb3NpdGlvbi54ICsgdGhpcy5zaXplLnggLyAyLCB0aGlzLnBvc2l0aW9uLnkgKyB0aGlzLnNpemUueSAvIDIpO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5yZXN0b3JlKCk7XHJcbiAgICBcclxuICAgIFxyXG59O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQnV0dG9uOyIsIi8vQ29udGFpbnMgY2FudmFzIHJlbGF0ZWQgdmFyaWFibGVzIGluIGEgc2luZ2xlIGVhc3ktdG8tcGFzcyBvYmplY3RcclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4vUG9pbnQuanMnKTtcclxuXHJcblxyXG5mdW5jdGlvbiBDYW52YXNTdGF0ZShjYW52YXMsIGN0eCkge1xyXG4gICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XHJcbiAgICB0aGlzLmN0eCA9IGN0eDtcclxuICAgIHRoaXMudXBkYXRlKCk7XHJcbn1cclxuXHJcbkNhbnZhc1N0YXRlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMud2lkdGggPSB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMuY2FudmFzLm9mZnNldFdpZHRoO1xyXG4gICAgdGhpcy5oZWlnaHQgPSB0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmNhbnZhcy5vZmZzZXRIZWlnaHQ7XHJcbiAgICB0aGlzLmNlbnRlciA9IG5ldyBQb2ludCh0aGlzLmNhbnZhcy53aWR0aCAvIDIsIHRoaXMuY2FudmFzLmhlaWdodCAvIDIpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENhbnZhc1N0YXRlOyIsIi8va2VlcHMgdHJhY2sgb2YgbW91c2UgcmVsYXRlZCB2YXJpYWJsZXMuXHJcbi8vY2FsY3VsYXRlZCBpbiBtYWluIGFuZCBwYXNzZWQgdG8gZ2FtZVxyXG4vL2NvbnRhaW5zIHVwIHN0YXRlXHJcbi8vcG9zaXRpb25cclxuLy9yZWxhdGl2ZSBwb3NpdGlvblxyXG4vL29uIGNhbnZhc1xyXG5cInVzZSBzdHJpY3RcIjtcclxuZnVuY3Rpb24gTW91c2VTdGF0ZShwUG9zaXRpb24sIHBSZWxhdGl2ZVBvc2l0aW9uLCBwTW91c2VEb3duLCBwTW91c2VJbiwgcFdoZWVsRGVsdGEpe1xyXG4gICAgdGhpcy5wb3NpdGlvbiA9IHBQb3NpdGlvbjtcclxuICAgIHRoaXMucmVsYXRpdmVQb3NpdGlvbiA9IHBSZWxhdGl2ZVBvc2l0aW9uO1xyXG4gICAgdGhpcy5tb3VzZURvd24gPSBwTW91c2VEb3duO1xyXG4gICAgdGhpcy5tb3VzZUluID0gcE1vdXNlSW47XHJcbiAgICB0aGlzLndoZWVsRGVsdGEgPSBwV2hlZWxEZWx0YTtcclxuICAgIFxyXG4gICAgLy90cmFja2luZyBwcmV2aW91cyBtb3VzZSBzdGF0ZXNcclxuICAgIHRoaXMubGFzdFBvc2l0aW9uID0gcFBvc2l0aW9uO1xyXG4gICAgdGhpcy5sYXN0UmVsYXRpdmVQb3NpdGlvbiA9IHBSZWxhdGl2ZVBvc2l0aW9uO1xyXG4gICAgdGhpcy5sYXN0TW91c2VEb3duID0gcE1vdXNlRG93bjtcclxuICAgIHRoaXMubGFzdE1vdXNlSW4gPSBwTW91c2VJbjtcclxuICAgIHRoaXMubGFzdFdoZWVsRGVsdGEgPSBwV2hlZWxEZWx0YVxyXG59XHJcblxyXG5Nb3VzZVN0YXRlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihwUG9zaXRpb24sIHBSZWxhdGl2ZVBvc2l0aW9uLCBwTW91c2VEb3duLCBwTW91c2VJbiwgcFdoZWVsRGVsdGEpe1xyXG4gICAgdGhpcy5sYXN0UG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uO1xyXG4gICAgdGhpcy5sYXN0UmVsYXRpdmVQb3NpdGlvbiA9IHRoaXMucmVsYXRpdmVQb3NpdGlvbjtcclxuICAgIHRoaXMubGFzdE1vdXNlRG93biA9IHRoaXMubW91c2VEb3duO1xyXG4gICAgdGhpcy5sYXN0TW91c2VJbiA9IHRoaXMubW91c2VJbjtcclxuICAgIHRoaXMubGFzdFdoZWVsRGVsdGEgPSB0aGlzLndoZWVsRGVsdGE7XHJcbiAgICBcclxuICAgIFxyXG4gICAgdGhpcy5wb3NpdGlvbiA9IHBQb3NpdGlvbjtcclxuICAgIHRoaXMucmVsYXRpdmVQb3NpdGlvbiA9IHBSZWxhdGl2ZVBvc2l0aW9uO1xyXG4gICAgdGhpcy5tb3VzZURvd24gPSBwTW91c2VEb3duO1xyXG4gICAgdGhpcy5tb3VzZUluID0gcE1vdXNlSW47XHJcbiAgICB0aGlzLndoZWVsRGVsdGEgPSBwV2hlZWxEZWx0YTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNb3VzZVN0YXRlOyIsIlwidXNlIHN0cmljdFwiO1xyXG5mdW5jdGlvbiBQb2ludChwWCwgcFkpe1xyXG4gICAgdGhpcy54ID0gcFg7XHJcbiAgICB0aGlzLnkgPSBwWTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUG9pbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5mdW5jdGlvbiBUaW1lICgpIHtcclxuICAgIHRoaXMudG90YWxUaW1lID0gMDtcclxuICAgIHRoaXMuZGVsdGFUaW1lID0gMDtcclxufTtcclxuXHJcblRpbWUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0KSB7XHJcbiAgICB0aGlzLnRvdGFsVGltZSArPSBkdDtcclxuICAgIHRoaXMuZGVsdGFUaW1lID0gZHQ7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRpbWU7IiwiXCJ1c2Ugc3RyaWN0XCJcclxuXHJcbnZhciBUdXRvcmlhbFRhZ3MgPSB7XHJcbiAgICBcIkFJXCI6IFwiIzgwNFwiLFxyXG4gICAgXCJBdWRpb1wiOiBcIiMwNDhcIixcclxuICAgIFwiQ29tcHV0ZXIgU2NpZW5jZVwiOiBcIiMxMTFcIixcclxuICAgIFwiQ29yZVwiOiBcIiMzMzNcIixcclxuICAgIFwiR3JhcGhpY3NcIjogXCIjYzBjXCIsXHJcbiAgICBcIklucHV0XCI6IFwiIzg4MFwiLFxyXG4gICAgXCJNYXRoXCI6IFwiIzQ4NFwiLFxyXG4gICAgXCJOZXR3b3JraW5nXCI6IFwiI2M2MFwiLFxyXG4gICAgXCJPcHRpbWl6YXRpb25cIjogXCIjMjgyXCIsXHJcbiAgICBcIlBoeXNpY3NcIjogXCIjMDQ4XCIsXHJcbiAgICBcIlNjcmlwdGluZ1wiOiBcIiMwODhcIixcclxuICAgIFwiU29mdHdhcmVFbmdpbmVlcmluZ1wiOiBcIiM4NDRcIlxyXG59O1xyXG5cclxuXHJcbmZ1bmN0aW9uIERldGFpbHNQYW5lbChncmFwaCkge1xyXG4gICAgdGhpcy5ncmFwaCA9IGdyYXBoO1xyXG4gICAgdGhpcy5ub2RlID0gbnVsbDtcclxuICAgIHRoaXMuZGF0YSA9IG51bGw7XHJcbiAgICB0aGlzLnRyYW5zaXRpb25PbiA9IGZhbHNlO1xyXG4gICAgdGhpcy50cmFuc2l0aW9uVGltZSA9IDA7XHJcbiAgICB0aGlzLmRhdGFEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJpZ2h0QmFyXCIpO1xyXG59O1xyXG5cclxuRGV0YWlsc1BhbmVsLnByb3RvdHlwZS5lbmFibGUgPSBmdW5jdGlvbihub2RlKSB7XHJcbiAgICB0aGlzLm5vZGUgPSBub2RlO1xyXG4gICAgdGhpcy5kYXRhID0gbm9kZS5kYXRhO1xyXG4gICAgdGhpcy50cmFuc2l0aW9uT24gPSB0cnVlXHJcbn07XHJcblxyXG5EZXRhaWxzUGFuZWwucHJvdG90eXBlLmRpc2FibGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZGF0YURpdi5pbm5lckhUTUwgPSBcIlwiO1xyXG4gICAgdGhpcy50cmFuc2l0aW9uT24gPSBmYWxzZTtcclxufTtcclxuXHJcbkRldGFpbHNQYW5lbC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oY2FudmFzU3RhdGUsIHRpbWUsIG5vZGUpIHtcclxuICAgIFxyXG4gICAgLy91cGRhdGUgbm9kZSBpZiBpdHMgbm90IHRoZSBzYW1lIGFueW1vcmVcclxuICAgIGlmKHRoaXMubm9kZSAhPSBub2RlKSB7XHJcbiAgICAgICAgdGhpcy5ub2RlID0gbm9kZTtcclxuICAgICAgICB0aGlzLmRhdGEgPSBub2RlLmRhdGE7XHJcbiAgICAgICAgdGhpcy5kYXRhRGl2LmlubmVySFRNTCA9IHRoaXMuR2VuZXJhdGVET00oKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgXHJcbiAgICAvL3RyYW5zaXRpb24gb25cclxuICAgIGlmKHRoaXMudHJhbnNpdGlvbk9uKSB7XHJcbiAgICAgICAgaWYodGhpcy50cmFuc2l0aW9uVGltZSA8IDEpIHtcclxuICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9uVGltZSArPSB0aW1lLmRlbHRhVGltZSAqIDM7XHJcbiAgICAgICAgICAgIGlmKHRoaXMudHJhbnNpdGlvblRpbWUgPj0gMSkge1xyXG4gICAgICAgICAgICAgICAgLy9kb25lIHRyYW5zaXRpb25pbmdcclxuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvblRpbWUgPSAxO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhRGl2LmlubmVySFRNTCA9IHRoaXMuR2VuZXJhdGVET00oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vdHJhbnNpdGlvbiBvZmZcclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGlmKHRoaXMudHJhbnNpdGlvblRpbWUgPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvblRpbWUgLT0gdGltZS5kZWx0YVRpbWUgKiAzO1xyXG4gICAgICAgICAgICBpZih0aGlzLnRyYW5zaXRpb25UaW1lIDw9IDApIHtcclxuICAgICAgICAgICAgICAgIC8vZG9uZSB0cmFuc2l0aW9uaW5nXHJcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25UaW1lID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMubm9kZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGEgPSBudWxsOyBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbkRldGFpbHNQYW5lbC5wcm90b3R5cGUuR2VuZXJhdGVET00gPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBodG1sID0gXCI8aDE+XCIrdGhpcy5kYXRhLnNlcmllcytcIjo8L2gxPjxoMT48YSBocmVmPVwiICsgdGhpcy5kYXRhLmxpbmsgKyBcIj5cIit0aGlzLmRhdGEudGl0bGUrXCI8L2E+PC9oMT5cIjtcclxuICAgIGh0bWwgKz0gXCI8YSBocmVmPVwiICsgdGhpcy5kYXRhLmxpbmsgKyBcIj48aW1nIHNyYz1odHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vSUdNRS1SSVQvXCIgKyB0aGlzLmRhdGEubmFtZSArXHJcbiAgICAgICAgXCIvbWFzdGVyL2lnbWVfdGh1bWJuYWlsLnBuZyBhbHQ9XCIgKyB0aGlzLmRhdGEubGluayArIFwiPjwvYT5cIjtcclxuICAgIFxyXG4gICAgaHRtbCArPSBcIjx1bCBpZD0ndGFncyc+XCI7XHJcbiAgICBpZih0aGlzLmRhdGEudGFncy5sZW5ndGggIT0gMCkge1xyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGEudGFncy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBodG1sICs9IFwiPGxpIHN0eWxlPSdiYWNrZ3JvdW5kLWNvbG9yOlwiICsgVHV0b3JpYWxUYWdzW3RoaXMuZGF0YS50YWdzW2ldXSArIFwiJz5cIiArIHRoaXMuZGF0YS50YWdzW2ldICsgXCI8L2xpPlwiO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGh0bWwrPSBcIjwvdWw+XCJcclxuICAgIFxyXG4gICAgaHRtbCArPSBcIjxwPlwiICsgdGhpcy5kYXRhLmRlc2NyaXB0aW9uICsgXCI8L3A+XCI7XHJcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuZGF0YSk7XHJcbiAgICBpZih0aGlzLmRhdGEuZXh0cmFfcmVzb3VyY2VzLmxlbmd0aCAhPSAwKSB7XHJcbiAgICAgICAgaHRtbCArPSBcIjxoMj5BZGRpdGlvbmFsIFJlc291cmNlczo8L2gyPlwiO1xyXG4gICAgICAgIGh0bWwgKz0gXCI8dWw+XCI7XHJcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMuZGF0YS5leHRyYV9yZXNvdXJjZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaHRtbCArPSBcIjxsaT48YSBocmVmPVwiICsgdGhpcy5kYXRhLmV4dHJhX3Jlc291cmNlc1tpXS5saW5rICsgXCI+XCIgKyB0aGlzLmRhdGEuZXh0cmFfcmVzb3VyY2VzW2ldLnRpdGxlICsgXCI8L2E+PC9saT5cIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaHRtbCArPSBcIjwvdWw+XCI7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJldHVybiBodG1sO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBEZXRhaWxzUGFuZWw7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBEcmF3TGliID0gcmVxdWlyZSgnLi4vdG9vbHMvRHJhd2xpYi5qcycpO1xyXG52YXIgU2VhcmNoUGFuZWwgPSByZXF1aXJlKCcuL1NlYXJjaFBhbmVsLmpzJyk7XHJcbnZhciBEZXRhaWxzUGFuZWwgPSByZXF1aXJlKCcuL0RldGFpbHNQYW5lbC5qcycpO1xyXG52YXIgVHV0b3JpYWxOb2RlID0gcmVxdWlyZSgnLi9UdXRvcmlhbE5vZGUuanMnKTtcclxudmFyIFBvaW50ID0gcmVxdWlyZSgnLi4vY29udGFpbmVycy9Qb2ludC5qcycpO1xyXG5cclxudmFyIGdyYXBoTG9hZGVkO1xyXG52YXIgbW91c2VUYXJnZXQ7XHJcblxyXG5cclxudmFyIGdyYXBoRGVwdGhMaW1pdCA9IDI7IC8vIGhvdyBtYW55IHZhbHVlcyB0byBleHBhbmQgdG9cclxudmFyIGRlYnVnTW9kZSA9IGZhbHNlO1xyXG5cclxuXHJcbnZhciBUdXRvcmlhbFN0YXRlID0ge1xyXG4gICAgTG9ja2VkOiAwLFxyXG4gICAgVW5sb2NrZWQ6IDEsXHJcbiAgICBDb21wbGV0ZWQ6IDJcclxufTtcclxuXHJcblxyXG5mdW5jdGlvbiBHcmFwaChwSlNPTkRhdGEpIHtcclxuICAgIFxyXG4gICAgdGhpcy5zZWFyY2hQYW5lbCA9IG5ldyBTZWFyY2hQYW5lbCh0aGlzKTtcclxuICAgIHRoaXMuZGV0YWlsc1BhbmVsID0gbmV3IERldGFpbHNQYW5lbCh0aGlzKTtcclxuICAgIHRoaXMuc2VhcmNoUGFuZWxCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIk9wdGlvbnNCdXR0b25cIik7XHJcbiAgICB0aGlzLnNlYXJjaERpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGVmdEJhclwiKTtcclxuICAgIHRoaXMuZGF0YURpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmlnaHRCYXJcIik7XHJcbiAgICB0aGlzLmNhbnZhc0RpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWlkZGxlQmFyXCIpO1xyXG5cclxuICAgIC8vIGxvYWQgbG9jayBpbWFnZSBmb3IgbG9ja2VkIG5vZGVzIGFuZCBjb21wbGV0ZWQgbm9kZXNcclxuICAgIHRoaXMubG9ja0ltYWdlID0gbmV3IEltYWdlKCk7XHJcbiAgICB0aGlzLmxvY2tJbWFnZS5zcmMgPSBcImNvbnRlbnQvdWkvTG9jay5wbmdcIjtcclxuICAgIHRoaXMuY2hlY2tJbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG4gICAgdGhpcy5jaGVja0ltYWdlLnNyYyA9IFwiY29udGVudC91aS9DaGVjay5wbmdcIjtcclxuXHJcbiAgICAvL2NyZWF0ZSBwYWludGVyIG9iamVjdCB0byBoZWxwIGRyYXcgc3R1ZmZcclxuICAgIHRoaXMucGFpbnRlciA9IG5ldyBEcmF3TGliKCk7XHJcblxyXG4gICAgdGhpcy5ub2RlcyA9IFtdO1xyXG4gICAgdGhpcy5hY3RpdmVOb2RlcyA9IFtdO1xyXG5cclxuICAgIC8vcG9wdWxhdGUgdGhlIGFycmF5XHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgcEpTT05EYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGRhdGEgPSBwSlNPTkRhdGFbaV07XHJcbiAgICAgICAgLy9lbnN1cmVzIHRoYXQgdGhlIGNodW5rIGNvbnRhaW5zIGEgbGlua1xyXG4gICAgICAgIGlmKGRhdGEudGFncy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgaWYoZGVidWdNb2RlKSBjb25zb2xlLmxvZyhcIlJlcG8gbm90IHRhZ2dlZDogXCIgKyBkYXRhLm5hbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKGRhdGEuaW1hZ2UgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBpZihkZWJ1Z01vZGUpIGNvbnNvbGUubG9nKFwiUmVwbyB5YW1sIG91dCBvZiBkYXRlOiBcIiArIGRhdGEubmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgbm9kZSA9IG5ldyBUdXRvcmlhbE5vZGUoZGF0YSk7XHJcbiAgICAgICAgICAgIHRoaXMubm9kZXMucHVzaChub2RlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbG9vcCB0aHJvdWdoIG5vZGVzIGFuZCBjb25uZWN0IHRoZW0gdG9nZXRoZXIuXHJcbiAgICB0aGlzLm5vZGVzLmZvckVhY2goKG5vZGUpPT57XHJcbiAgICAgICAgbm9kZS5kYXRhLmNvbm5lY3Rpb25zLmZvckVhY2goKGNvbm5lY3Rpb24pPT57XHJcbiAgICAgICAgICAgIHRoaXMubm9kZXMuZm9yRWFjaCgob3RoZXJOb2RlKT0+e1xyXG4gICAgICAgICAgICAgICAgaWYob3RoZXJOb2RlLmRhdGEuc2VyaWVzID09PSBjb25uZWN0aW9uLnNlcmllcyAmJiBvdGhlck5vZGUuZGF0YS50aXRsZSA9PT0gY29ubmVjdGlvbi50aXRsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUucHJldmlvdXNOb2Rlcy5wdXNoKG90aGVyTm9kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgb3RoZXJOb2RlLm5leHROb2Rlcy5wdXNoKG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBub2RlLmZldGNoU3RhdGUoKTtcclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICB0aGlzLnRyYW5zaXRpb25UaW1lID0gMDtcclxuICAgIHRoaXMuRm9jdXNOb2RlKHRoaXMubm9kZXNbMF0pO1xyXG5cclxuXHJcbiAgICBmdW5jdGlvbiB4IChzZWFyY2gpIHtcclxuICAgICAgICBpZihzZWFyY2gub3BlbiA9PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHNlYXJjaC50cmFuc2l0aW9uT24gPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNlYXJjaC50cmFuc2l0aW9uT24gPSB0cnVlO1xyXG4gICAgICAgICAgICBzZWFyY2gub3BlbiA9IHRydWU7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2VhcmNodGV4dGZpZWxkXCIpLnNlbGVjdCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnNlYXJjaFBhbmVsQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB4LmJpbmQodGhpcy5zZWFyY2hQYW5lbEJ1dHRvbiwgdGhpcy5zZWFyY2hQYW5lbCkpO1xyXG5cclxufTtcclxuXHJcblxyXG5cclxuXHJcbkdyYXBoLnByb3RvdHlwZS5Gb2N1c05vZGUgPSBmdW5jdGlvbihjZW50ZXJOb2RlKSB7XHJcbiAgICB0aGlzLmZvY3VzZWROb2RlID0gY2VudGVyTm9kZTtcclxuICAgIFxyXG4gICAgdmFyIG5ld05vZGVzID0gW107XHJcbiAgICBcclxuICAgIC8vZ2V0IG5vZGVzIHRvIGRlcHRoIGluIGJvdGggZGlyZWN0aW9ucywgYW5kIGFkZCB0aGVtIHRvIHRoZSBuZXcgbm9kZXMgYXJyYXlcclxuICAgIHZhciBwcmV2aW91c05vZGVzID0gdGhpcy5mb2N1c2VkTm9kZS5nZXRQcmV2aW91cyhncmFwaERlcHRoTGltaXQpO1xyXG4gICAgbmV3Tm9kZXMgPSBuZXdOb2Rlcy5jb25jYXQocHJldmlvdXNOb2Rlcyk7XHJcbiAgICBcclxuICAgIHZhciBuZXh0Tm9kZXMgPSB0aGlzLmZvY3VzZWROb2RlLmdldE5leHQoZ3JhcGhEZXB0aExpbWl0KTtcclxuICAgIG5ld05vZGVzID0gbmV3Tm9kZXMuY29uY2F0KG5leHROb2Rlcyk7XHJcbiAgICBcclxuICAgIFxyXG4gICAgLy9maW5kIHJlZHVuZGFuY2llcyBmcm9tIHRoZSBuZXdOb2RlcywgYW5kIG1ha2UgYSBuZXcgYXJyYXkgd2l0aG91dCB0aG9zZSByZWR1bmRhbmNpZXMuXHJcbiAgICB2YXIgdGVtcCA9IFtdO1xyXG4gICAgbmV3Tm9kZXMuZm9yRWFjaCgobm9kZVRvQ2hlY2spPT4ge1xyXG4gICAgICAgIGlmKHRlbXAuZXZlcnkoKGFscmVhZHlBZGRlZE5vZGUpPT57XHJcbiAgICAgICAgICAgIHJldHVybiBub2RlVG9DaGVjayAhPSBhbHJlYWR5QWRkZWROb2RlO1xyXG4gICAgICAgIH0pKSB7XHJcbiAgICAgICAgICAgIHRlbXAucHVzaChub2RlVG9DaGVjayk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBuZXdOb2RlcyA9IHRlbXA7XHJcbiAgICBcclxuICAgIFxyXG4gICAgXHJcbiAgICAvLyBjaGVjayBpZiBhbnkgb2YgdGhlIG5vZGVzIHdlcmUgcHJldmlvdXNseSBvbiBzY3JlZW5cclxuICAgIC8vICh0aGlzIGlzIHVzZWQgdG8gZGV0ZXJtaW5lIHdoZXJlIHRoZXkgc2hvdWxkIGFwcGVhciBkdXJpbmcgdGhlIHRyYW5zaXRpb24gYW5pbWF0aW9uKVxyXG4gICAgdGhpcy5hY3RpdmVOb2Rlcy5mb3JFYWNoKChub2RlKT0+e1xyXG4gICAgICAgIG5vZGUud2FzUHJldmlvdXNseU9uU2NyZWVuID0gbmV3Tm9kZXMuc29tZSgobmV3Tm9kZSk9PntcclxuICAgICAgICAgICAgcmV0dXJuIG5vZGUgPT0gbmV3Tm9kZTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICB0aGlzLmFjdGl2ZU5vZGVzID0gbmV3Tm9kZXM7XHJcbiAgICBcclxuICAgIC8vY2xlYXIgdGhlaXIgcGFyZW50IGRhdGEgZm9yIG5ldyBub2RlXHJcbiAgICB0aGlzLmFjdGl2ZU5vZGVzLmZvckVhY2goKG5vZGUpPT57XHJcbiAgICAgICAgbm9kZS5jdXJyZW50TGF5ZXJEZXB0aCA9IDA7XHJcbiAgICAgICAgbm9kZS5wYXJlbnQgPSBudWxsO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIC8vIFN0YXJ0IGFuaW1hdGlvbi5cclxuICAgIHRoaXMudHJhbnNpdGlvblRpbWUgPSAxO1xyXG4gICAgLy8gRmlndXJlIG91dCB3aGVyZSBldmVyeXRoaW5nIG5lZWRzIHRvIGJlLlxyXG4gICAgdGhpcy5mb2N1c2VkTm9kZS5jYWxjdWxhdGVOb2RlVHJlZShncmFwaERlcHRoTGltaXQsIG51bGwsIDApO1xyXG4gICAgdGhpcy5mb2N1c2VkTm9kZS5zZXRUcmFuc2l0aW9uKGdyYXBoRGVwdGhMaW1pdCwgbnVsbCwgMCwgbmV3IFBvaW50KDAsIDApKTtcclxufTtcclxuXHJcbkdyYXBoLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihtb3VzZVN0YXRlLCBjYW52YXNTdGF0ZSwgdGltZSkge1xyXG4gICAgXHJcbiAgICAvLyB1cGRhdGUgdHJhbnNpdGlvbiB0aW1lIGlmIGl0IG5lZWRzIHRvIGJlIHVwZGF0ZWQuXHJcbiAgICBpZih0aGlzLnRyYW5zaXRpb25UaW1lID4gMCkge1xyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvblRpbWUgLT0gdGltZS5kZWx0YVRpbWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvblRpbWUgPSAwO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyBMb29wIG92ZXIgYW5kIHVwZGF0ZSBhY3RpdmUgbm9kZXNcclxuICAgIHZhciBtb3VzZU92ZXJOb2RlID0gbnVsbDtcclxuICAgIHRoaXMuYWN0aXZlTm9kZXMuZm9yRWFjaCgobm9kZSk9PntcclxuICAgICAgICB2YXIgaXNNYWluID0gKG5vZGUgPT0gdGhpcy5mb2N1c2VkTm9kZSk7XHJcbiAgICAgICAgbm9kZS51cGRhdGUobW91c2VTdGF0ZSwgdGltZSwgdGhpcy50cmFuc2l0aW9uVGltZSwgaXNNYWluKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBBbHNvIGNoZWNrIGlmIHRoZSBtb3VzZSBpcyBvdmVyIHRoYXQgbm9kZS5cclxuICAgICAgICBpZihub2RlLm1vdXNlT3Zlcikge1xyXG4gICAgICAgICAgICBtb3VzZU92ZXJOb2RlID0gbm9kZTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgXHJcbiAgICAvLyBJZiB1c2VyIGNsaWNrc1xyXG4gICAgaWYobW91c2VTdGF0ZS5tb3VzZURvd24gJiYgIW1vdXNlU3RhdGUubGFzdE1vdXNlRG93bikge1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIGZvY3VzIG5vZGUgaWYgY2xpY2tlZFxyXG4gICAgICAgIGlmKG1vdXNlT3Zlck5vZGUpIHtcclxuICAgICAgICAgICAgdGhpcy5Gb2N1c05vZGUobW91c2VPdmVyTm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIHNob3cgZGV0YWlscyBmb3Igbm9kZSBpZiBidXR0b24gY2xpY2tlZFxyXG4gICAgICAgIGlmKHRoaXMuZm9jdXNlZE5vZGUuZGV0YWlsc0J1dHRvbi5tb3VzZU92ZXIpIHtcclxuICAgICAgICAgICAgaWYodGhpcy5kZXRhaWxzUGFuZWwubm9kZSA9PSBudWxsKSAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXRhaWxzUGFuZWwuZW5hYmxlKHRoaXMuZm9jdXNlZE5vZGUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5mb2N1c2VkTm9kZS5kZXRhaWxzQnV0dG9uLnRleHQgPSBcIkxlc3NcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGV0YWlsc1BhbmVsLmRpc2FibGUoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZm9jdXNlZE5vZGUuZGV0YWlsc0J1dHRvbi50ZXh0ID0gXCJNb3JlXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gdXNlciBjbGlja3Mgb24gY29tcGxldGlvbiBidXR0b25cclxuICAgICAgICBpZih0aGlzLmZvY3VzZWROb2RlLmNvbXBsZXRpb25CdXR0b24ubW91c2VPdmVyKSB7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuZm9jdXNlZE5vZGUuc3RhdGUgPT0gVHV0b3JpYWxTdGF0ZS5VbmxvY2tlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5mb2N1c2VkTm9kZS5jaGFuZ2VTdGF0ZShUdXRvcmlhbFN0YXRlLkNvbXBsZXRlZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5mb2N1c2VkTm9kZS5zdGF0ZSA9PSBUdXRvcmlhbFN0YXRlLkxvY2tlZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvbmZpcm0oXCJTa2lwIGFoZWFkPyBUaGlzIHdvbid0IGF1dG9tYXRpY2FsbHkgY29tcGxldGUgYW55dGhpbmcgcHJldmlvdXMgdG8gdGhpcy5cIikpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZvY3VzZWROb2RlLmNoYW5nZVN0YXRlKFR1dG9yaWFsU3RhdGUuQ29tcGxldGVkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLmZvY3VzZWROb2RlLnN0YXRlID09IFR1dG9yaWFsU3RhdGUuQ29tcGxldGVkKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiByZXNldHRpbmcsIGFzayBmb3IgY29uZmlybWF0aW9uLlxyXG4gICAgICAgICAgICAgICAgaWYgKGNvbmZpcm0oXCJUaGlzIHdpbGwgcmVzZXQgYW55IHByb2dyZXNzIHBhc3QgdGhpcyBwb2ludC4gQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGRvIHRoaXM/XCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mb2N1c2VkTm9kZS5jaGFuZ2VTdGF0ZShUdXRvcmlhbFN0YXRlLlVubG9ja2VkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gVXBkYXRlIHRoZSBzZWFyY2ggcGFuZWwgaWYgaXQncyBvcGVuLlxyXG4gICAgaWYodGhpcy5zZWFyY2hQYW5lbC5vcGVuID09IHRydWUpIHtcclxuICAgICAgICB0aGlzLnNlYXJjaFBhbmVsLnVwZGF0ZShjYW52YXNTdGF0ZSwgdGltZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIFVwZGF0ZSB0aGUgZGV0YWlscyBwYW5lbCBpZiBpdCdzIG9wZW4uXHJcbiAgICBpZih0aGlzLmRldGFpbHNQYW5lbC5ub2RlICE9IG51bGwpIHtcclxuICAgICAgICB0aGlzLmRldGFpbHNQYW5lbC51cGRhdGUoY2FudmFzU3RhdGUsIHRpbWUsIHRoaXMuZm9jdXNlZE5vZGUpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBcclxuICAgIC8vIFRyYW5zaXRpb24gdGhlIHNpZGUgYmFycyBvbiBhbmQgb2ZmIHNtb290aGx5XHJcbiAgICB2YXIgdDEgPSAoMSAtIE1hdGguY29zKHRoaXMuc2VhcmNoUGFuZWwudHJhbnNpdGlvblRpbWUgKiBNYXRoLlBJKSkvMjtcclxuICAgIHZhciB0MiA9ICgxIC0gTWF0aC5jb3ModGhpcy5kZXRhaWxzUGFuZWwudHJhbnNpdGlvblRpbWUgKiBNYXRoLlBJKSkvMjtcclxuICAgIFxyXG4gICAgLy8gQ2hhbmdlIHN0eWxpbmcgdG8gY2hhbmdlIHNpemUgb2YgZGl2c1xyXG4gICAgdGhpcy5zZWFyY2hEaXYuc3R5bGUud2lkdGggPSAzMCAqIHQxICsgXCJ2d1wiO1xyXG4gICAgdGhpcy5kYXRhRGl2LnN0eWxlLndpZHRoID0gMzAgKiB0MiArIFwidndcIjtcclxuICAgIHRoaXMuY2FudmFzRGl2LnN0eWxlLndpZHRoID0gMTAwIC0gMzAgKiAodDEgKyB0MikgKyBcInZ3XCI7ICAgIFxyXG4gICAgXHJcbiAgICB0aGlzLnNlYXJjaFBhbmVsQnV0dG9uLnN0eWxlLmxlZnQgPSBcImNhbGMoXCIgKyAzMCAqIHQxICsgXCJ2dyArIDEycHgpXCI7XHJcbiAgICBcclxuICAgIFxyXG4gICAgdGhpcy5zZWFyY2hEaXYuc3R5bGUuZGlzcGxheSA9ICh0MSA9PSAwKSA/IFwibm9uZVwiIDogXCJibG9ja1wiO1xyXG4gICAgdGhpcy5kYXRhRGl2LnN0eWxlLmRpc3BsYXkgPSAodDIgPT0gMCkgPyBcIm5vbmVcIiA6IFwiYmxvY2tcIjtcclxuICAgIFxyXG4gICAgY2FudmFzU3RhdGUudXBkYXRlKCk7XHJcbn07XHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5HcmFwaC5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNhbnZhc1N0YXRlKSB7XHJcbiAgICBcclxuICAgIGNhbnZhc1N0YXRlLmN0eC5zYXZlKCk7XHJcblxyXG4gICAgLy90cmFuc2xhdGUgdG8gdGhlIGNlbnRlciBvZiB0aGUgc2NyZWVuXHJcbiAgICBjYW52YXNTdGF0ZS5jdHgudHJhbnNsYXRlKGNhbnZhc1N0YXRlLmNlbnRlci54LCBjYW52YXNTdGF0ZS5jZW50ZXIueSk7XHJcbiAgICBcclxuICAgIC8vZHJhdyBub2Rlc1xyXG4gICAgdGhpcy5mb2N1c2VkTm9kZS5kcmF3KGNhbnZhc1N0YXRlLCB0aGlzLnBhaW50ZXIsIHRoaXMsIG51bGwsIDAsIGdyYXBoRGVwdGhMaW1pdCk7XHJcblxyXG4gICAgY2FudmFzU3RhdGUuY3R4LnJlc3RvcmUoKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR3JhcGg7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuLi9jb250YWluZXJzL1BvaW50LmpzJyk7XHJcbnZhciBCdXR0b24gPSByZXF1aXJlKFwiLi4vY29udGFpbmVycy9CdXR0b24uanNcIik7XHJcbnZhciBUdXRvcmlhbE5vZGUgPSByZXF1aXJlKCcuL1R1dG9yaWFsTm9kZS5qcycpO1xyXG5cclxudmFyIGxhYmVsQ29ybmVyU2l6ZSA9IDY7XHJcblxyXG52YXIgdGl0bGVGb250U2l6ZSA9IDEyO1xyXG52YXIgdGl0bGVGb250ID0gdGl0bGVGb250U2l6ZStcInB4IEFyaWFsXCI7XHJcblxyXG52YXIgZGVzY3JpcHRvckZvbnRTaXplID0gMTI7XHJcbnZhciBkZXNjcmlwdG9yRm9udCA9IGRlc2NyaXB0b3JGb250U2l6ZStcInB4IEFyaWFsXCI7XHJcblxyXG52YXIgbGluZUJyZWFrID0gNjtcclxuXHJcbi8vY3JlYXRlIGEgbGFiZWwgdG8gcGFpciB3aXRoIGEgbm9kZVxyXG5mdW5jdGlvbiBOb2RlTGFiZWwocFR1dG9yaWFsTm9kZSkge1xyXG4gICAgdGhpcy5ub2RlID0gcFR1dG9yaWFsTm9kZTtcclxuICAgIFxyXG4gICAgdGhpcy5zZXJpZXMgPSB0aGlzLm5vZGUuZGF0YS5zZXJpZXM7XHJcbiAgICB0aGlzLnRpdGxlID0gdGhpcy5ub2RlLmRhdGEudGl0bGU7XHJcbiAgICB0aGlzLmRlc2NyaXB0aW9uID0gdGhpcy5ub2RlLmRhdGEuZGVzY3JpcHRpb247XHJcbiAgICB0aGlzLmRlc2NyaXB0aW9uTGluZXMgPSBudWxsO1xyXG4gICAgXHJcbiAgICB0aGlzLnBvc2l0aW9uID0gbmV3IFBvaW50KFxyXG4gICAgICAgIHRoaXMubm9kZS5wb3NpdGlvbi54LFxyXG4gICAgICAgIHRoaXMubm9kZS5wb3NpdGlvbi55IC0gdGhpcy5ub2RlLnNpemUgLSAxMCk7XHJcbiAgICBcclxuICAgIHRoaXMuZGlzcGxheUZ1bGxEYXRhID0gZmFsc2U7XHJcbn07XHJcblxyXG5Ob2RlTGFiZWwucHJvdG90eXBlLmNhbGN1bGF0ZVRleHRGaXQgPSBmdW5jdGlvbihjdHgsIHBQYWludGVyKSB7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4LmZvbnQgPSB0aXRsZUZvbnQ7XHJcbiAgICB2YXIgc2VyaWVzU2l6ZSA9IGN0eC5tZWFzdXJlVGV4dCh0aGlzLnNlcmllcyk7XHJcbiAgICB2YXIgdGl0bGVTaXplID0gY3R4Lm1lYXN1cmVUZXh0KHRoaXMudGl0bGUpO1xyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxuXHJcbiAgICB0aGlzLnNpemUgPSBuZXcgUG9pbnQoTWF0aC5tYXgoc2VyaWVzU2l6ZS53aWR0aCwgdGl0bGVTaXplLndpZHRoKSwgdGl0bGVGb250U2l6ZSAqIDIpO1xyXG4gICAgXHJcbiAgICBcclxuXHJcbiAgICBpZih0aGlzLmRpc3BsYXlGdWxsRGF0YSkge1xyXG4gICAgICAgIHRoaXMuc2l6ZS54ID0gTWF0aC5tYXgoMjQwLCBNYXRoLm1heChzZXJpZXNTaXplLndpZHRoLCB0aXRsZVNpemUud2lkdGgpKTtcclxuICAgICAgICB0aGlzLmRlc2NyaXB0aW9uTGluZXMgPSBwUGFpbnRlci50ZXh0VG9MaW5lcyhjdHgsIHRoaXMuZGVzY3JpcHRpb24sIGRlc2NyaXB0b3JGb250LCB0aGlzLnNpemUueCk7XHJcbiAgICAgICAgdGhpcy5zaXplLnkgKz0gbGluZUJyZWFrICsgdGhpcy5kZXNjcmlwdGlvbkxpbmVzLmxlbmd0aCAqIGRlc2NyaXB0b3JGb250U2l6ZTtcclxuICAgIH1cclxufTtcclxuXHJcblxyXG5cclxuTm9kZUxhYmVsLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAocE1vdXNlU3RhdGUsIHRpbWUsIGRpc3BsYXlCcmllZikge1xyXG4gICAgXHJcbiAgICBcclxuICAgIC8vZGlyZWN0bHkgYWJvdmUgbm9kZVxyXG4gICAgdGhpcy5kZXNpcmVkUG9zaXRpb24gPSBuZXcgUG9pbnQoXHJcbiAgICAgICAgdGhpcy5ub2RlLnBvc2l0aW9uLngsXHJcbiAgICAgICAgdGhpcy5ub2RlLnBvc2l0aW9uLnkgLSB0aGlzLm5vZGUuc2l6ZSAtIDEyIC0gbGFiZWxDb3JuZXJTaXplKTtcclxuICAgIFxyXG4gICAgaWYodGhpcy5kZXNpcmVkUG9zaXRpb24ueCAhPSB0aGlzLnBvc2l0aW9uLnggfHwgdGhpcy5kZXNpcmVkUG9zaXRpb24ueSAhPSB0aGlzLnBvc2l0aW9uLnkpIHtcclxuICAgICAgICAvL21vdmUgdG93YXJkcyBkZXNpcmVkUG9zaXRpb25cclxuICAgICAgICB2YXIgZGlmID0gbmV3IFBvaW50KFxyXG4gICAgICAgICAgICB0aGlzLmRlc2lyZWRQb3NpdGlvbi54IC0gdGhpcy5wb3NpdGlvbi54LFxyXG4gICAgICAgICAgICB0aGlzLmRlc2lyZWRQb3NpdGlvbi55IC0gdGhpcy5wb3NpdGlvbi55KTtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgc3BlZWRTY2FsYXIgPSBNYXRoLnNxcnQoZGlmLnggKiBkaWYueCArIGRpZi55ICogZGlmLnkpICogdGltZS5kZWx0YVRpbWU7XHJcblxyXG4gICAgICAgIHZhciB2ZWxvY2l0eSA9IG5ldyBQb2ludChkaWYueCAqIHNwZWVkU2NhbGFyLCBkaWYueSAqIHNwZWVkU2NhbGFyKTtcclxuICAgICAgICBpZih2ZWxvY2l0eS54ICogdmVsb2NpdHkueCA8IGRpZi54ICogZGlmLngpIHtcclxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi54ICs9IHZlbG9jaXR5Lng7XHJcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueSArPSB2ZWxvY2l0eS55O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi54ID0gdGhpcy5kZXNpcmVkUG9zaXRpb24ueDtcclxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi55ID0gdGhpcy5kZXNpcmVkUG9zaXRpb24ueTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIFxyXG4gICAgLy9pZiB0aGlzIGlzIHRoZSBwcmltYXJ5IG5vZGUsIGRpc3BsYXkgZGVzY3JpcHRpb25cclxuICAgIGlmKGRpc3BsYXlCcmllZikge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKHRoaXMuZGlzcGxheUZ1bGxEYXRhID09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2l6ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BsYXlGdWxsRGF0YSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAodGhpcy5kaXNwbGF5RnVsbERhdGEgPT0gdHJ1ZSkge1xyXG4gICAgICAgIHRoaXMuYnV0dG9uQ2xpY2tlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc2l6ZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuZGlzcGxheUZ1bGxEYXRhID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBcclxufVxyXG5cclxuTm9kZUxhYmVsLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24ocENhbnZhc1N0YXRlLCBwUGFpbnRlcikge1xyXG4gICAgXHJcbiAgICBpZighdGhpcy5zaXplKSB7XHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVUZXh0Rml0KHBDYW52YXNTdGF0ZS5jdHgsIHBQYWludGVyKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy9kcmF3IGxpbmUgZnJvbSBub2RlIHRvIGxhYmVsXHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LnNhdmUoKTtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHguc3Ryb2tlU3R5bGUgPSBcIiNmZmZcIjtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHgubGluZVdpZHRoID0gMjtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICBcclxuICAgIHBDYW52YXNTdGF0ZS5jdHgubW92ZVRvKFxyXG4gICAgICAgIHRoaXMucG9zaXRpb24ueCxcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnkpO1xyXG4gICAgXHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LmxpbmVUbyhcclxuICAgICAgICB0aGlzLm5vZGUucG9zaXRpb24ueCxcclxuICAgICAgICB0aGlzLm5vZGUucG9zaXRpb24ueSAtIHRoaXMubm9kZS5zaXplKTtcclxuICAgIFxyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5jbG9zZVBhdGgoKTtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHguc3Ryb2tlKCk7XHJcbiAgICBwQ2FudmFzU3RhdGUuY3R4LnJlc3RvcmUoKTtcclxuICAgIFxyXG4gICAgLy9kcmF3IGxhYmVsXHJcbiAgICBwUGFpbnRlci5yb3VuZGVkUmVjdChcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LFxyXG4gICAgICAgIHRoaXMucG9zaXRpb24ueCAtICh0aGlzLnNpemUueCAvIDIpLFxyXG4gICAgICAgIHRoaXMucG9zaXRpb24ueSAtIHRoaXMuc2l6ZS55LFxyXG4gICAgICAgIHRoaXMuc2l6ZS54LFxyXG4gICAgICAgIHRoaXMuc2l6ZS55LFxyXG4gICAgICAgIGxhYmVsQ29ybmVyU2l6ZSxcclxuICAgICAgICB0cnVlLCB0aGlzLm5vZGUuY29sb3IsXHJcbiAgICAgICAgdHJ1ZSwgXCIjZmZmXCIsIDIpO1xyXG4gICAgXHJcbiAgICBcclxuICAgIHBDYW52YXNTdGF0ZS5jdHguc2F2ZSgpO1xyXG4gICAgcENhbnZhc1N0YXRlLmN0eC5maWxsU3R5bGUgPSBcIiNmZmZcIjtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHguZm9udCA9IHRpdGxlRm9udDtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHgudGV4dEJhc2VsaW5lID0gXCJ0b3BcIjtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHgudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHguZmlsbFRleHQoXHJcbiAgICAgICAgdGhpcy5zZXJpZXMsXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi54LFxyXG4gICAgICAgIHRoaXMucG9zaXRpb24ueSAtIHRoaXMuc2l6ZS55KTtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHguZmlsbFRleHQoXHJcbiAgICAgICAgdGhpcy50aXRsZSxcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLngsXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi55IC0gdGhpcy5zaXplLnkgKyB0aXRsZUZvbnRTaXplKTtcclxuICAgIHBDYW52YXNTdGF0ZS5jdHgucmVzdG9yZSgpO1xyXG4gICAgXHJcbiAgICBcclxuICAgIGlmKHRoaXMuZGlzcGxheUZ1bGxEYXRhKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5zYXZlKCk7XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5maWxsU3R5bGUgPSBcIiNmZmZcIjtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LmZvbnQgPSBkZXNjcmlwdG9yRm9udDtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LnRleHRCYXNlbGluZSA9IFwidG9wXCI7XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC50ZXh0QWxpZ24gPSBcImxlZnRcIjtcclxuICAgICAgICBcclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5kZXNjcmlwdGlvbkxpbmVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHBDYW52YXNTdGF0ZS5jdHguZmlsbFRleHQoXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlc2NyaXB0aW9uTGluZXNbaV0sXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnggLSB0aGlzLnNpemUueCAvIDIsXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnkgLSB0aGlzLnNpemUueSArIHRpdGxlRm9udFNpemUgKiAyICsgbGluZUJyZWFrICsgaSAqIGRlc2NyaXB0b3JGb250U2l6ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHgucmVzdG9yZSgpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyAgPSBOb2RlTGFiZWw7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vL3BhcmFtZXRlciBpcyBhIHBvaW50IHRoYXQgZGVub3RlcyBzdGFydGluZyBwb3NpdGlvblxyXG5mdW5jdGlvbiBQYXJzZXIocFRhcmdldFVSTCwgY2FsbGJhY2spe1xyXG4gICAgdmFyIEpTT05PYmplY3Q7XHJcbiAgICB2YXIgbGVzc29uQXJyYXkgPSBbXTtcclxuICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIEpTT05PYmplY3QgPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpO1xyXG5cclxuICAgICAgICAvL3Bhc3MgbGVzc29uIGRhdGEgYmFja1xyXG4gICAgICAgIGNhbGxiYWNrKEpTT05PYmplY3QpO1xyXG4gICAgfVxyXG5cclxuICAgIHhoci5vcGVuKCdHRVQnLCBwVGFyZ2V0VVJMLCB0cnVlKTtcclxuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKFwiSWYtTW9kaWZpZWQtU2luY2VcIiwgXCJTYXQsIDEgSmFuIDIwMTAgMDA6MDA6MDAgR00wVFwiKTtcclxuICAgIHhoci5zZW5kKCk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGFyc2VyOyIsIlwidXNlIHN0cmljdFwiXHJcblxyXG5mdW5jdGlvbiBTZWFyY2hQYW5lbChncmFwaCkge1xyXG4gICAgdGhpcy5ncmFwaCA9IGdyYXBoO1xyXG4gICAgdGhpcy5vcGVuID0gZmFsc2U7XHJcbiAgICB0aGlzLnRyYW5zaXRpb25PbiA9IGZhbHNlO1xyXG4gICAgdGhpcy50cmFuc2l0aW9uVGltZSA9IDA7XHJcbiAgICB0aGlzLm9wdGlvbnNEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxlZnRCYXJcIik7XHJcbiAgICB0aGlzLnNlYXJjaEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2VhcmNoYnV0dG9uXCIpO1xyXG4gICAgXHJcbiAgICBcclxuICAgIHRoaXMuc2VhcmNoQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAodGhhdCkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIENvbGxlY3QgYWxsIGluZm9ybWF0aW9uIGZvciB0aGUgcXVlcnlcclxuICAgICAgICB2YXIgcXVlcnkgPSBbXTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBnZXQgdGV4dCBpbnB1dCBpZiB0aGVyZSBpcyBhbnlcclxuICAgICAgICB2YXIgcGFyYW0xID0ge1xyXG4gICAgICAgICAgICB0eXBlOiBcIlRleHRcIixcclxuICAgICAgICAgICAgdmFsdWU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2VhcmNodGV4dGZpZWxkXCIpLnZhbHVlXHJcbiAgICAgICAgfTtcclxuICAgICAgICBpZihwYXJhbTEudmFsdWUgIT0gXCJcIikge1xyXG4gICAgICAgICAgICBxdWVyeS5wdXNoKHBhcmFtMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIGdldCBsYW5ndWFnZSBpbnB1dCBpZiB0aGVyZSBpcyBhbnlcclxuICAgICAgICB2YXIgcGFyYW0yID0ge1xyXG4gICAgICAgICAgICB0eXBlOiBcIkxhbmd1YWdlXCIsXHJcbiAgICAgICAgICAgIHZhbHVlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlYXJjaGxhbmd1YWdlZmllbGRcIikudmFsdWVcclxuICAgICAgICB9O1xyXG4gICAgICAgIGlmKHBhcmFtMi52YWx1ZSAhPSBcIkFueVwiKSB7XHJcbiAgICAgICAgICAgIHF1ZXJ5LnB1c2gocGFyYW0yKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gZ2V0IHRhZ3MgaW5wdXQgaWYgdGhlcmUgaXMgYW55XHJcbiAgICAgICAgdmFyIHBhcmFtMyA9IHtcclxuICAgICAgICAgICAgdHlwZTogXCJUYWdcIixcclxuICAgICAgICAgICAgdmFsdWU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2VhcmNodGFnZmllbGRcIikudmFsdWVcclxuICAgICAgICB9O1xyXG4gICAgICAgIGlmKHBhcmFtMy52YWx1ZSAhPSBcIkFueVwiKSB7XHJcbiAgICAgICAgICAgIHF1ZXJ5LnB1c2gocGFyYW0zKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9wYXJzZSBkYXRhIHRvIGZpbmQgbWF0Y2hpbmcgcmVzdWx0c1xyXG4gICAgICAgIHZhciBzZWFyY2hSZXN1bHRzID0gdGhhdC5zZWFyY2gocXVlcnksIHRoYXQuZ3JhcGgubm9kZXMpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vZGlzcGxheSByZXN1bHRzXHJcbiAgICAgICAgdmFyIGxpc3RFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZWFyY2hyZXN1bHRzXCIpO1xyXG4gICAgICAgIGlmKHNlYXJjaFJlc3VsdHMubGVuZ3RoID09IDApIHtcclxuICAgICAgICAgICAgbGlzdEVsZW1lbnQuaW5uZXJIVE1MID0gXCJObyBNYXRjaGluZyBSZXN1bHRzIEZvdW5kLlwiO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxpc3RFbGVtZW50LmlubmVySFRNTCA9IFwiXCI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHNlYXJjaFJlc3VsdHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgLy9jcmVhdGUgbGlzdCB0YWdcclxuICAgICAgICAgICAgdmFyIGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpO1xyXG4gICAgICAgICAgICAvL3NldCB0aXRsZSBhcyB0ZXh0XHJcbiAgICAgICAgICAgIGxpLmlubmVySFRNTCA9IHNlYXJjaFJlc3VsdHNbaV0uZGF0YS50aXRsZTtcclxuICAgICAgICAgICAgLy9hZGQgZXZlbnQgdG8gZm9jdXMgdGhlIG5vZGUgaWYgaXRzIGNsaWNrZWRcclxuICAgICAgICAgICAgbGkuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKHRoYXQsIG5vZGUpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuZ3JhcGguRm9jdXNOb2RlKG5vZGUpO1xyXG4gICAgICAgICAgICB9LmJpbmQobGksIHRoYXQsIHNlYXJjaFJlc3VsdHNbaV0pKTtcclxuICAgICAgICAgICAgLy9hZGQgdGhlIHRhZyB0byB0aGUgcGFnZVxyXG4gICAgICAgICAgICBsaXN0RWxlbWVudC5hcHBlbmRDaGlsZChsaSk7XHJcbiAgICAgICAgfVxyXG4gICAgfS5iaW5kKHRoaXMuc2VhcmNoQnV0dG9uLCB0aGlzKSk7XHJcbn07XHJcblxyXG5cclxuXHJcbi8vIFRoaXMgc2VhcmNoIHN1cHBvcnRzIG11bHRpcGxlIHRhZ3Mgb2YgZWFjaCB0eXBlLCBidXQgdGhlIGFjdHVhbCBzZWFyY2ggZG9lc24ndCB1c2UgdGhhdCBmdW5jdGlvbmFsaXR5LlxyXG4vLyBTZWFyY2hlcyBieSBuYXJyb3dpbmcgZG93biByZXN1bHRzLiBBbnl0aGluZyB0aGF0IGRvZXNuJ3QgbWF0Y2ggYWxsIDMgY3JpdGVyaWEgZmFpbHMgdGhlIHRlc3QuXHJcblNlYXJjaFBhbmVsLnByb3RvdHlwZS5zZWFyY2ggPSBmdW5jdGlvbihxdWVyeSwgbm9kZXMpIHtcclxuICAgIHZhciByZXN1bHRzID0gW107XHJcbiAgICBcclxuICAgIFxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG5vZGUgPSBub2Rlc1tpXS5kYXRhO1xyXG4gICAgICAgIHZhciBtYXRjaCA9IHRydWU7XHJcbiAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IHF1ZXJ5Lmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIC8vIFRleHQgc2VhcmNoIGNvbXBhcmVzIGFnYWluc3QgYW55IHRleHQgaW4gdGhlIGRlbW9cclxuICAgICAgICAgICAgLy8gSWYgaXQgZG9lc250IGZpbmQgdGhlIHN0cmluZyBhbnl3aGVyZSBpdCBmYWlscyB0aGUgc2VhcmNoIGltbWVkaWF0ZWx5XHJcbiAgICAgICAgICAgIGlmKHF1ZXJ5W2pdLnR5cGUgPT09IFwiVGV4dFwiKSB7XHJcbiAgICAgICAgICAgICAgICBpZihub2RlLnRpdGxlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihxdWVyeVtqXS52YWx1ZS50b0xvd2VyQ2FzZSgpKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZihub2RlLnNlcmllcy50b0xvd2VyQ2FzZSgpLmluZGV4T2YocXVlcnlbal0udmFsdWUudG9Mb3dlckNhc2UoKSkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKG5vZGUuZGVzY3JpcHRpb24udG9Mb3dlckNhc2UoKS5pbmRleE9mKHF1ZXJ5W2pdLnZhbHVlLnRvTG93ZXJDYXNlKCkpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2ggPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrOyAvLyBubyBtYXRjaC4gZG9uJ3QgY29tcGFyZSBhbnl0aGluZyBlbHNlIGZvciB0aGlzIHJlcG8uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gbGFuZ3VhZ2UgbXVzdCBtYXRjaCBzZWxlY3RlZCBsYW5ndWFnZVxyXG4gICAgICAgICAgICBlbHNlIGlmKHF1ZXJ5W2pdLnR5cGUgPT09IFwiTGFuZ3VhZ2VcIikge1xyXG4gICAgICAgICAgICAgICAgaWYobm9kZS5sYW5ndWFnZSAhPT0gcXVlcnlbal0udmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXRjaCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIHRhZyBtdXN0IG1hdGNoIHNlbGVjdGVkIHRhZ1xyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHZhciB0YWdNYXRjaCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgZm9yKHZhciBrID0gMDsgayA8IG5vZGUudGFncy5sZW5ndGg7IGsrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKG5vZGUudGFnc1trXSA9PSBxdWVyeVtqXS52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWdNYXRjaCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYodGFnTWF0Y2ggPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXRjaCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vaWYgd2UgcGFzc2VkIGFsbCB0aGF0IGNyYXAsIHdlIGhhdmUgYSBtYXRjaCFcclxuICAgICAgICBpZihtYXRjaCA9PT0gdHJ1ZSkgeyBcclxuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKG5vZGVzW2ldKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJldHVybiByZXN1bHRzO1xyXG59O1xyXG5cclxuXHJcblNlYXJjaFBhbmVsLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihjYW52YXNTdGF0ZSwgdGltZSkge1xyXG4gICAgXHJcbiAgICAvL3RyYW5zaXRpb24gb25cclxuICAgIGlmKHRoaXMudHJhbnNpdGlvbk9uKSB7XHJcbiAgICAgICAgaWYodGhpcy50cmFuc2l0aW9uVGltZSA8IDEpIHtcclxuICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9uVGltZSArPSB0aW1lLmRlbHRhVGltZSAqIDM7XHJcbiAgICAgICAgICAgIGlmKHRoaXMudHJhbnNpdGlvblRpbWUgPj0gMSkge1xyXG4gICAgICAgICAgICAgICAgLy9kb25lIHRyYW5zaXRpb25pbmdcclxuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvblRpbWUgPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy90cmFuc2l0aW9uIG9mZlxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgaWYodGhpcy50cmFuc2l0aW9uVGltZSA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9uVGltZSAtPSB0aW1lLmRlbHRhVGltZSAqIDM7XHJcbiAgICAgICAgICAgIGlmKHRoaXMudHJhbnNpdGlvblRpbWUgPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgLy9kb25lIHRyYW5zaXRpb25pbmdcclxuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvblRpbWUgPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2VhcmNoUGFuZWw7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuLi9jb250YWluZXJzL1BvaW50LmpzJyk7XHJcbnZhciBOb2RlTGFiZWwgPSByZXF1aXJlKCcuL05vZGVMYWJlbC5qcycpO1xyXG52YXIgQnV0dG9uID0gcmVxdWlyZSgnLi4vY29udGFpbmVycy9CdXR0b24uanMnKTtcclxuXHJcbnZhciBob3Jpem9udGFsU3BhY2luZyA9IDE4MDtcclxudmFyIGJhc2VTaXplID0gMjQ7XHJcblxyXG52YXIgVHV0b3JpYWxTdGF0ZSA9IHtcclxuICAgIExvY2tlZDogMCxcclxuICAgIFVubG9ja2VkOiAxLFxyXG4gICAgQ29tcGxldGVkOiAyXHJcbn07XHJcblxyXG52YXIgVHV0b3JpYWxUYWdzID0ge1xyXG4gICAgXCJBSVwiOiBcIiM4MDRcIixcclxuICAgIFwiQXVkaW9cIjogXCIjMDQ4XCIsXHJcbiAgICBcIkNvbXB1dGVyIFNjaWVuY2VcIjogXCIjMTExXCIsXHJcbiAgICBcIkNvcmVcIjogXCIjMzMzXCIsXHJcbiAgICBcIkdyYXBoaWNzXCI6IFwiI2MwY1wiLFxyXG4gICAgXCJJbnB1dFwiOiBcIiM4ODBcIixcclxuICAgIFwiTWF0aFwiOiBcIiM0ODRcIixcclxuICAgIFwiTmV0d29ya2luZ1wiOiBcIiNjNjBcIixcclxuICAgIFwiT3B0aW1pemF0aW9uXCI6IFwiIzI4MlwiLFxyXG4gICAgXCJQaHlzaWNzXCI6IFwiIzA0OFwiLFxyXG4gICAgXCJTY3JpcHRpbmdcIjogXCIjMDg4XCIsXHJcbiAgICBcIlNvZnR3YXJlRW5naW5lZXJpbmdcIjogXCIjODQ0XCJcclxufTtcclxuXHJcblxyXG4vL21ha2UgYSBub2RlIHdpdGggc29tZSBkYXRhXHJcbmZ1bmN0aW9uIFR1dG9yaWFsTm9kZShKU09OQ2h1bmspIHtcclxuICAgIHRoaXMuZGF0YSA9IEpTT05DaHVuaztcclxuICAgIHRoaXMucHJpbWFyeVRhZyA9IHRoaXMuZGF0YS50YWdzWzBdO1xyXG4gICAgdGhpcy5jb2xvciA9IFR1dG9yaWFsVGFnc1t0aGlzLnByaW1hcnlUYWddO1xyXG4gICAgXHJcbiAgICBcclxuICAgIHRoaXMubW91c2VPdmVyID0gZmFsc2U7XHJcbiAgICBcclxuICAgIFxyXG4gICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBQb2ludCgwLCAwKTtcclxuICAgIHRoaXMucHJldmlvdXNQb3NpdGlvbiA9IG5ldyBQb2ludCgwLCAwKTtcclxuICAgIHRoaXMubmV4dFBvc2l0aW9uID0gbmV3IFBvaW50KDAsIDApO1xyXG4gICAgXHJcbiAgICB0aGlzLnNpemUgPSAyNDtcclxuICAgIHRoaXMubGFiZWwgPSBuZXcgTm9kZUxhYmVsKHRoaXMpO1xyXG4gICAgICAgIFxyXG4gICAgdGhpcy5uZXh0Tm9kZXMgPSBbXTtcclxuICAgIHRoaXMucHJldmlvdXNOb2RlcyA9IFtdO1xyXG4gICAgXHJcbiAgICAvLyBDcmVhdGUgc3ViIGJ1dHRvbnMuXHJcbiAgICB0aGlzLmRldGFpbHNCdXR0b24gPSBuZXcgQnV0dG9uKG5ldyBQb2ludCgwLCAwKSwgbmV3IFBvaW50KDEyMCwgMjQpLCBcIk1vcmVcIiwgdGhpcy5jb2xvcik7XHJcbiAgICB0aGlzLmNvbXBsZXRpb25CdXR0b24gPSBuZXcgQnV0dG9uKG5ldyBQb2ludCgwLCAwKSwgbmV3IFBvaW50KDEyMCwgMjQpLCBcIk1hcmsgVW5jb21wbGV0ZVwiLCB0aGlzLmNvbG9yKTtcclxufTtcclxuXHJcblxyXG4vLyBTZXQgdXAgdGhlIHN0YXR1cyBvZiB0aGUgbm9kZSB0byBtYXRjaCB0aGF0IHNhdmVkIGluIGJyb3dzZXIgbWVtb3J5LlxyXG5UdXRvcmlhbE5vZGUucHJvdG90eXBlLmZldGNoU3RhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuc3RhdGUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLmRhdGEubmFtZSk7XHJcbiAgICBpZih0aGlzLnN0YXRlID09IG51bGwgfHwgdGhpcy5zdGF0ZSA9PSBUdXRvcmlhbFN0YXRlLkxvY2tlZCkge1xyXG4gICAgICAgIHRoaXMuY2hhbmdlU3RhdGUoVHV0b3JpYWxTdGF0ZS5Mb2NrZWQpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIERlZmF1bHQgdG8gdW5sb2NrZWQgaWYgdGhlcmUgYXJlIG5vIHByZXZpb3VzIG5vZGVzLlxyXG4gICAgICAgIGlmKHRoaXMucHJldmlvdXNOb2Rlcy5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmNoYW5nZVN0YXRlKFR1dG9yaWFsU3RhdGUuVW5sb2NrZWQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYodGhpcy5zdGF0ZSA9PSBUdXRvcmlhbFN0YXRlLkNvbXBsZXRlZCkge1xyXG4gICAgICAgIHRoaXMuY29tcGxldGlvbkJ1dHRvbi50ZXh0ID0gXCJNYXJrIFVub21wbGV0ZVwiO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5jb21wbGV0aW9uQnV0dG9uLnRleHQgPSBcIk1hcmsgQ29tcGxldGVcIjtcclxuICAgIH1cclxufVxyXG5cclxuLy8gQ2hhbmdlcyB0aGUgc3RhdGUgb2YgdGhpcyBub2RlXHJcblR1dG9yaWFsTm9kZS5wcm90b3R5cGUuY2hhbmdlU3RhdGUgPSBmdW5jdGlvbih0dXRTdGF0ZSkge1xyXG4gICAgaWYodGhpcy5zdGF0ZSA9PSBUdXRvcmlhbFN0YXRlLkxvY2tlZCkge1xyXG4gICAgICAgIGlmKHR1dFN0YXRlID09IFR1dG9yaWFsU3RhdGUuVW5sb2NrZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IHR1dFN0YXRlO1xyXG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLmRhdGEubmFtZSwgdGhpcy5zdGF0ZSk7XHJcbiAgICAgICAgICAgIC8vIFVubG9jayBmcm9tIGEgbG9ja2VkIHBvc2l0aW9uIGRvZXNuJ3QgbmVlZCB0byBjaGFuZ2UgYW55IG90aGVyIG5vZGVzLlxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKHR1dFN0YXRlID09IFR1dG9yaWFsU3RhdGUuQ29tcGxldGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSB0dXRTdGF0ZTtcclxuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5kYXRhLm5hbWUsIHRoaXMuc3RhdGUpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gQ29tcGxldGUgZnJvbSBhIGxvY2tlZCBwb3NpdGlvbiBuZWVkcyB0byBhdHRlbXB0IHRvIHVubG9jayBsYXRlciB0aGluZ3MuXHJcbiAgICAgICAgICAgIHRoaXMubmV4dE5vZGVzLmZvckVhY2goKGNoaWxkKT0+e1xyXG4gICAgICAgICAgICAgICAgdmFyIHNob3VsZEJlTG9ja2VkID0gY2hpbGQucHJldmlvdXNOb2Rlcy5zb21lKChwcmVyZXEpPT57XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChwcmVyZXEuc3RhdGUgIT0gVHV0b3JpYWxTdGF0ZS5Db21wbGV0ZWQpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZighc2hvdWxkQmVMb2NrZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZC5jaGFuZ2VTdGF0ZShUdXRvcmlhbFN0YXRlLlVubG9ja2VkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSBpZih0aGlzLnN0YXRlID09IFR1dG9yaWFsU3RhdGUuVW5sb2NrZWQpIHtcclxuICAgICAgICBpZih0dXRTdGF0ZSA9PSBUdXRvcmlhbFN0YXRlLkxvY2tlZCkge1xyXG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gdHV0U3RhdGU7XHJcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuZGF0YS5uYW1lLCB0aGlzLnN0YXRlKTtcclxuICAgICAgICAgICAgLy8gTG9ja2VkIGZyb20gdW5sb2NrZWQgcG9zaXRpb24gZG9lc24ndCBhZmZlY3QgYW55dGhpbmdcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZih0dXRTdGF0ZSA9PSBUdXRvcmlhbFN0YXRlLkNvbXBsZXRlZCkge1xyXG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gdHV0U3RhdGU7XHJcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuZGF0YS5uYW1lLCB0aGlzLnN0YXRlKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIGNvbXBsZXRlZCBmcm9tIHVubG9ja2VkIHNob3VsZCB1bmxvY2sgbmV4dCB0aGluZ3MuXHJcbiAgICAgICAgICAgIHRoaXMubmV4dE5vZGVzLmZvckVhY2goKGNoaWxkKT0+e1xyXG4gICAgICAgICAgICAgICAgdmFyIHNob3VsZEJlTG9ja2VkID0gY2hpbGQucHJldmlvdXNOb2Rlcy5zb21lKChwcmVyZXEpPT57XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChwcmVyZXEuc3RhdGUgIT0gVHV0b3JpYWxTdGF0ZS5Db21wbGV0ZWQpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZighc2hvdWxkQmVMb2NrZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZC5jaGFuZ2VTdGF0ZShUdXRvcmlhbFN0YXRlLlVubG9ja2VkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAodGhpcy5zdGF0ZSA9PSBUdXRvcmlhbFN0YXRlLkNvbXBsZXRlZCkge1xyXG4gICAgICAgIGlmKHR1dFN0YXRlID09IFR1dG9yaWFsU3RhdGUuTG9ja2VkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSB0dXRTdGF0ZTtcclxuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5kYXRhLm5hbWUsIHRoaXMuc3RhdGUpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gbG9ja2luZyBzb21ldGhpbmcgdGhhdCB3YXMgY29tcGxldGVkIHNob3VsZCBsb2NrIGxhdGVyIHRoaW5ncy5cclxuICAgICAgICAgICAgdGhpcy5uZXh0Tm9kZXMuZm9yRWFjaCgoY2hpbGQpPT57XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5jaGFuZ2VTdGF0ZShUdXRvcmlhbFN0YXRlLkxvY2tlZCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKHR1dFN0YXRlID09IFR1dG9yaWFsU3RhdGUuVW5sb2NrZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IHR1dFN0YXRlO1xyXG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLmRhdGEubmFtZSwgdGhpcy5zdGF0ZSk7XHJcbiAgICAgICAgICAgIC8vIHVubG9ja2luZyBzb21ldGhpbmcgdGhhdCB3YXMgY29tcGxldGVkIHNob3VsZCBsb2NrIGxhdGVyIHRoaW5ncy5cclxuICAgICAgICAgICAgdGhpcy5uZXh0Tm9kZXMuZm9yRWFjaCgoY2hpbGQpPT57XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5jaGFuZ2VTdGF0ZShUdXRvcmlhbFN0YXRlLkxvY2tlZCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvLyBhbHNvIGlmIHRoaXMgdGhpbmcgZG9lc24ndCBoYXZlIGl0J3MgcHJlcmVxcyBtZXQsIGl0IHNob3VsZCBnbyBzdHJhaWdodCB0byBiZWluZyBsb2NrZWRcclxuICAgICAgICAgICAgdmFyIHNob3VsZEJlTG9ja2VkID0gdGhpcy5wcmV2aW91c05vZGVzLnNvbWUoKHByZXJlcSk9PntcclxuICAgICAgICAgICAgICAgIHJldHVybiAocHJlcmVxLnN0YXRlICE9IFR1dG9yaWFsU3RhdGUuQ29tcGxldGVkKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmKHNob3VsZEJlTG9ja2VkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gVHV0b3JpYWxTdGF0ZS5Mb2NrZWQ7XHJcbiAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLmRhdGEubmFtZSwgdGhpcy5zdGF0ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vcmVjdXJzaXZlIGZ1bmN0aW9uIHRvIGdldCBwcmV2aW91cyBub2Rlc1xyXG5UdXRvcmlhbE5vZGUucHJvdG90eXBlLmdldFByZXZpb3VzID0gZnVuY3Rpb24oZGVwdGgpIHtcclxuICAgIHZhciByZXN1bHQgPSBbdGhpc107XHJcbiAgICBpZihkZXB0aCA+IDApIHtcclxuICAgICAgICB0aGlzLnByZXZpb3VzTm9kZXMuZm9yRWFjaCgobm9kZSk9PntcclxuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdChub2RlLmdldFByZXZpb3VzKGRlcHRoLTEpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn07XHJcblxyXG5cclxuXHJcbi8vcmVjdXJzaXZlIGZ1bmN0aW9uIHRvIGdldCBuZXh0IG5vZGVzXHJcblR1dG9yaWFsTm9kZS5wcm90b3R5cGUuZ2V0TmV4dCA9IGZ1bmN0aW9uKGRlcHRoKSB7XHJcbiAgICB2YXIgcmVzdWx0ID0gW3RoaXNdO1xyXG4gICAgaWYoZGVwdGggPiAwKSB7XHJcbiAgICAgICAgdGhpcy5uZXh0Tm9kZXMuZm9yRWFjaCgobm9kZSk9PntcclxuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdChub2RlLmdldE5leHQoZGVwdGgtMSkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufTtcclxuXHJcblxyXG4vLyBVcGRhdGVzIGFsbCBub2RlcyBzdGFydGluZyB3aXRoIG9uZSwgYW5kIGV4dGVuZGluZyBvdXR3YXJkLlxyXG4vLyBkaXJlY3Rpb24gaXMgdGhlIHNpZGUgb2YgdGhlIHBhcmVudCB0aGlzIG5vZGUgZXhpc3RzIG9uICgtMSwgMCwgMSkgMCBpcyBib3RoLlxyXG4vLyBsYXllciBkZXB0aCBpcyBob3cgbWFueSBsYXllcnMgdG8gcmVuZGVyIG91dFxyXG5UdXRvcmlhbE5vZGUucHJvdG90eXBlLnJlY3Vyc2l2ZVVwZGF0ZSA9IGZ1bmN0aW9uKGRpcmVjdGlvbiwgZGVwdGgpIHtcclxuICAgIGlmKGRlcHRoID4gMCkge1xyXG4gICAgICAgIC8vIGxlZnQgb3IgbWlkZGxlXHJcbiAgICAgICAgaWYoZGlyZWN0aW9uIDwgMSkge1xyXG4gICAgICAgICAgICB0aGlzLnByZXZpb3VzTm9kZXMuZm9yRWFjaCgobm9kZSk9PntcclxuICAgICAgICAgICAgICAgIG5vZGUucmVjdXJzaXZlVXBkYXRlKC0xLCBkZXB0aCAtIDEpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gcmlnaHQgb3IgbWlkZGxlXHJcbiAgICAgICAgaWYoZGlyZWN0aW9uID4gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5uZXh0Tm9kZXMuZm9yRWFjaCgobm9kZSk9PntcclxuICAgICAgICAgICAgICAgIG5vZGUucmVjdXJzaXZlVXBkYXRlKDEsIGRlcHRoIC0gMSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8vdXBkYXRlcyBhIG5vZGVcclxuLy90cmFuc2l0aW9uIHRpbWUgaXMgMS0wLCB3aXRoIDAgYmVpbmcgdGhlIGZpbmFsIGxvY2F0aW9uXHJcblR1dG9yaWFsTm9kZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24obW91c2VTdGF0ZSwgdGltZSwgdHJhbnNpdGlvblRpbWUsIGlzRm9jdXNlZCkge1xyXG4gICAgXHJcbiAgICAvL21vdmUgdGhlIG5vZGVcclxuICAgIGlmKHRoaXMucG9zaXRpb24gIT0gdGhpcy5uZXh0UG9zaXRpb24pIHtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnggPSAodGhpcy5wcmV2aW91c1Bvc2l0aW9uLnggKiB0cmFuc2l0aW9uVGltZSkgKyAodGhpcy5uZXh0UG9zaXRpb24ueCAqICgxIC0gdHJhbnNpdGlvblRpbWUpKTtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnkgPSAodGhpcy5wcmV2aW91c1Bvc2l0aW9uLnkgKiB0cmFuc2l0aW9uVGltZSkgKyAodGhpcy5uZXh0UG9zaXRpb24ueSAqICgxIC0gdHJhbnNpdGlvblRpbWUpKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYoaXNGb2N1c2VkKSB7XHJcbiAgICAgICAgdGhpcy5zaXplID0gMzY7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICAvL3Rlc3QgaWYgbW91c2UgaXMgaW5zaWRlIGNpcmNsZVxyXG4gICAgICAgIHZhciBkeCA9IG1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbi54IC0gdGhpcy5wb3NpdGlvbi54O1xyXG4gICAgICAgIHZhciBkeSA9IG1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbi55IC0gdGhpcy5wb3NpdGlvbi55O1xyXG4gICAgICAgIGlmKChkeCAqIGR4KSArIChkeSAqIGR5KSA8IHRoaXMuc2l6ZSAqIHRoaXMuc2l6ZSkge1xyXG4gICAgICAgICAgICB0aGlzLnNpemUgPSAzMDtcclxuICAgICAgICAgICAgdGhpcy5tb3VzZU92ZXIgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zaXplID0gMjQ7XHJcbiAgICAgICAgICAgIHRoaXMubW91c2VPdmVyID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBcclxuICAgIFxyXG4gICAgdGhpcy5sYWJlbC51cGRhdGUobW91c2VTdGF0ZSwgdGltZSwgaXNGb2N1c2VkKTtcclxuICAgIFxyXG4gICAgaWYoaXNGb2N1c2VkKSB7XHJcbiAgICAgICAgdGhpcy5kZXRhaWxzQnV0dG9uLnBvc2l0aW9uLnggPSB0aGlzLnBvc2l0aW9uLnggLSB0aGlzLmRldGFpbHNCdXR0b24uc2l6ZS54IC8gMiAtIDM7XHJcbiAgICAgICAgdGhpcy5kZXRhaWxzQnV0dG9uLnBvc2l0aW9uLnkgPSB0aGlzLnBvc2l0aW9uLnkgKyB0aGlzLnNpemUgKyAxMjtcclxuICAgICAgICB0aGlzLmRldGFpbHNCdXR0b24udXBkYXRlKG1vdXNlU3RhdGUpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY29tcGxldGlvbkJ1dHRvbi5wb3NpdGlvbi54ID0gdGhpcy5wb3NpdGlvbi54IC0gdGhpcy5jb21wbGV0aW9uQnV0dG9uLnNpemUueCAvIDIgLSAzO1xyXG4gICAgICAgIHRoaXMuY29tcGxldGlvbkJ1dHRvbi5wb3NpdGlvbi55ID0gdGhpcy5wb3NpdGlvbi55ICsgdGhpcy5zaXplICsgNDg7XHJcbiAgICAgICAgdGhpcy5jb21wbGV0aW9uQnV0dG9uLnVwZGF0ZShtb3VzZVN0YXRlKTtcclxuICAgIH1cclxufTtcclxuXHJcblxyXG5UdXRvcmlhbE5vZGUucHJvdG90eXBlLmNhbGN1bGF0ZU5vZGVUcmVlID0gZnVuY3Rpb24obGF5ZXJEZXB0aCwgcGFyZW50LCBkaXJlY3Rpb24pIHtcclxuICAgIFxyXG4gICAgLy8gSWYgdGhlIG5vZGUgYWxyZWFkeSBleGlzdHMgaW4gdGhlIGdyYXBoIGluIGEgYmV0dGVyIHBsYWNlIHRoYW4gdGhpcyBvbmUsIGRvbnQgdXNlIGl0XHJcbiAgICBpZih0aGlzLmN1cnJlbnRMYXllckRlcHRoID4gbGF5ZXJEZXB0aCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgdGhpcy5jdXJyZW50TGF5ZXJEZXB0aCA9IGxheWVyRGVwdGg7XHJcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcclxuICAgIFxyXG4gICAgaWYobGF5ZXJEZXB0aCA+IDApIHtcclxuICAgICAgICAvLyBsZWZ0IG9yIG1pZGRsZVxyXG4gICAgICAgIGlmKGRpcmVjdGlvbiA8IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5wcmV2aW91c05vZGVzLmZvckVhY2goKG5vZGUpPT57XHJcbiAgICAgICAgICAgICAgICBub2RlLmNhbGN1bGF0ZU5vZGVUcmVlKGxheWVyRGVwdGggLSAxLCB0aGlzLCAtMSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyByaWdodCBvciBtaWRkbGVcclxuICAgICAgICBpZihkaXJlY3Rpb24gPiAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLm5leHROb2Rlcy5mb3JFYWNoKChub2RlKT0+e1xyXG4gICAgICAgICAgICAgICAgbm9kZS5jYWxjdWxhdGVOb2RlVHJlZShsYXllckRlcHRoIC0gMSwgdGhpcywgMSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcblR1dG9yaWFsTm9kZS5wcm90b3R5cGUuc2V0VHJhbnNpdGlvbiA9IGZ1bmN0aW9uKGxheWVyRGVwdGgsIHBhcmVudCwgZGlyZWN0aW9uLCB0YXJnZXRQb3NpdGlvbikge1xyXG4gICAgXHJcbiAgICBpZighdGhpcy53YXNQcmV2aW91c2x5T25TY3JlZW4gJiYgcGFyZW50ICE9IG51bGwpIHtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gbmV3IFBvaW50KHRhcmdldFBvc2l0aW9uLngsIHRhcmdldFBvc2l0aW9uLnkpO1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24ueCAqPSAxLjU7XHJcbiAgICB9XHJcbiAgICB0aGlzLnByZXZpb3VzUG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uO1xyXG4gICAgdGhpcy5uZXh0UG9zaXRpb24gPSB0YXJnZXRQb3NpdGlvbjtcclxuICAgIFxyXG4gICAgLy9maWd1cmUgb3V0IHNpemUgb2YgY2hpbGRyZW4gdG8gc3BhY2UgdGhlbSBvdXQgYXBwcm9wcmlhdGVseVxyXG4gICAgaWYobGF5ZXJEZXB0aCA+IDApIHtcclxuICAgICAgICB2YXIgeFBvc2l0aW9uO1xyXG4gICAgICAgIHZhciB5UG9zaXRpb247XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9sZWZ0IG9yIG1pZGRsZVxyXG4gICAgICAgIGlmKGRpcmVjdGlvbiA8IDEpIHtcclxuICAgICAgICAgICAgeFBvc2l0aW9uID0gdGFyZ2V0UG9zaXRpb24ueCAtIGhvcml6b250YWxTcGFjaW5nOyAgIC8vIGNhbGN1bGF0ZSB0aGUgeCBwb3NpdGlvbiBmb3IgbmV4dCBub2Rlc1xyXG4gICAgICAgICAgICBpZihkaXJlY3Rpb24gPT0gMCkgeFBvc2l0aW9uIC09IDYwOyAgICAgICAgICAgICAgICAgLy8gYmFzZWQgb24gb2Zmc2V0IGZyb20gcGFyZW50IG5vZGUuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBmaXJzdCBzcGFjZSBpcyBsYXJnZXIgdGhhbiB0aGUgb3RoZXJzLlxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gZGV0ZXJtaW5lIGhlaWdodCBvZiB0aGlzIGFuZCBhbGwgY2hpbGQgbm9kZXNcclxuICAgICAgICAgICAgdmFyIHRvdGFsTGVmdEhlaWdodCA9IHRoaXMuZ2V0UHJldmlvdXNIZWlnaHQobGF5ZXJEZXB0aCk7XHJcbiAgICAgICAgICAgIHlQb3NpdGlvbiA9IHRhcmdldFBvc2l0aW9uLnkgLSAodG90YWxMZWZ0SGVpZ2h0IC8gMik7ICAgLy8gY2VudGVyIHZlcnRpY2FsbHlcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIExvb3Agb3ZlciBjaGlsZHJlbiBhbmQgc2V0IHRoZW0gdXAgYXMgd2VsbC4gKGlmIHRoZXkgYXJlIGNoaWxkcmVuIG9mIHRoaXMgbm9kZSlcclxuICAgICAgICAgICAgdGhpcy5wcmV2aW91c05vZGVzLmZvckVhY2goKG5vZGUpPT57XHJcbiAgICAgICAgICAgICAgICBpZihub2RlLnBhcmVudCA9PSB0aGlzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBsYWNlbWVudCA9IG5ldyBQb2ludCh4UG9zaXRpb24sIHlQb3NpdGlvbiArIG5vZGUuY3VycmVudEhlaWdodCAvIDIpO1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUuc2V0VHJhbnNpdGlvbihsYXllckRlcHRoIC0gMSwgdGhpcywgLTEsIHBsYWNlbWVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgeVBvc2l0aW9uICs9IG5vZGUuY3VycmVudEhlaWdodDsgICAgLy8gSW5jcmVtZW50IHkgcG9zaXRpb24gb2Ygbm9kZSBlYWNoIHRpbWUgdG8gc3BhY2UgdGhlbSBvdXQgY29ycmVjdGx5LlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9yaWdodCBvciBtaWRkbGVcclxuICAgICAgICBpZihkaXJlY3Rpb24gPiAtMSkge1xyXG4gICAgICAgICAgICB4UG9zaXRpb24gPSB0YXJnZXRQb3NpdGlvbi54ICsgaG9yaXpvbnRhbFNwYWNpbmc7ICAgLy8gY2FsY3VsYXRlIHRoZSB4IHBvc2l0aW9uIGZvciBuZXh0IG5vZGVzXHJcbiAgICAgICAgICAgIGlmKGRpcmVjdGlvbiA9PSAwKSB4UG9zaXRpb24gKz0gNjA7ICAgICAgICAgICAgICAgICAvLyBiYXNlZCBvbiBvZmZzZXQgZnJvbSBwYXJlbnQgbm9kZS5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZpcnN0IHNwYWNlIGlzIGxhcmdlciB0aGFuIHRoZSBvdGhlcnMuXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBEZXRlcm1pbmUgaGVpZ2h0IG9mIHRoaXMgYW5kIGFsbCBjaGlsZCBub2Rlcy5cclxuICAgICAgICAgICAgdmFyIHRvdGFsUmlnaHRIZWlnaHQgPSB0aGlzLmdldE5leHRIZWlnaHQobGF5ZXJEZXB0aCk7XHJcbiAgICAgICAgICAgIHlQb3NpdGlvbiA9IHRhcmdldFBvc2l0aW9uLnkgLSAodG90YWxSaWdodEhlaWdodCAvIDIpOyAgLy8gY2VudGVyIHZlcnRpY2FsbHkuXHJcblxyXG4gICAgICAgICAgICAvLyBMb29wIG92ZXIgY2hpbGRyZW4gYW5kIHNldCB0aGVtIHVwIGFzIHdlbGwuIChpZiB0aGV5IGFyZSBjaGlsZHJlbiBvZiB0aGlzIG5vZGUpXHJcbiAgICAgICAgICAgIHRoaXMubmV4dE5vZGVzLmZvckVhY2goKG5vZGUpPT57XHJcbiAgICAgICAgICAgICAgICBpZihub2RlLnBhcmVudCA9PSB0aGlzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBsYWNlbWVudCA9IG5ldyBQb2ludCh4UG9zaXRpb24sIHlQb3NpdGlvbiArIG5vZGUuY3VycmVudEhlaWdodCAvIDIpO1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUuc2V0VHJhbnNpdGlvbihsYXllckRlcHRoIC0gMSwgdGhpcywgMSwgcGxhY2VtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICB5UG9zaXRpb24gKz0gbm9kZS5jdXJyZW50SGVpZ2h0OyAgICAvLyBJbmNyZW1lbnQgeSBwb3NpdGlvbiBvZiBub2RlIGVhY2ggdGltZSB0byBzcGFjZSB0aGVtIG91dCBjb3JyZWN0bHkuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8vIENhbGN1bGF0ZXMgdGhlIHRvdGFsIGhlaWdodCBvZiB0aGlzIG5vZGUgYW5kIGFsbCBjaGlsZCBub2RlcyB0byB0aGUgbGVmdCByZWN1cnNpdmVseVxyXG5UdXRvcmlhbE5vZGUucHJvdG90eXBlLmdldFByZXZpb3VzSGVpZ2h0ID0gZnVuY3Rpb24obGF5ZXJEZXB0aCkge1xyXG4gICAgdGhpcy5jdXJyZW50SGVpZ2h0ID0gMDtcclxuICAgIGlmKGxheWVyRGVwdGggPiAwICYmIHRoaXMucHJldmlvdXNOb2Rlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgdGhpcy5wcmV2aW91c05vZGVzLmZvckVhY2goKG5vZGUpPT57XHJcbiAgICAgICAgICAgIGlmKG5vZGUucGFyZW50ID09IHRoaXMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudEhlaWdodCArPSBub2RlLmdldFByZXZpb3VzSGVpZ2h0KGxheWVyRGVwdGggLSAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgaWYodGhpcy5jdXJyZW50SGVpZ2h0ID09IDApIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRIZWlnaHQgPSBiYXNlU2l6ZSAqIDU7ICAvLyBlbmQgY2FzZSBmb3Igc2luZ2xlIG5vZGVzXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJldHVybiB0aGlzLmN1cnJlbnRIZWlnaHQ7XHJcbn07XHJcblxyXG4vLyBDYWxjdWxhdGVzIHRoZSB0b3RhbCBoZWlnaHQgb2YgdGhpcyBub2RlIGFuZCBhbGwgY2hpbGQgbm9kZXMgdG8gdGhlIHJpZ2h0IHJlY3Vyc2l2ZWx5XHJcblR1dG9yaWFsTm9kZS5wcm90b3R5cGUuZ2V0TmV4dEhlaWdodCA9IGZ1bmN0aW9uKGxheWVyRGVwdGgpIHtcclxuICAgIFxyXG4gICAgLy8gQ291bnQgdXAgc2l6ZSBvZiBhbGwgY2hpbGQgbm9kZXNcclxuICAgIHRoaXMuY3VycmVudEhlaWdodCA9IDA7XHJcbiAgICBpZihsYXllckRlcHRoID4gMCAmJiB0aGlzLm5leHROb2Rlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgdGhpcy5uZXh0Tm9kZXMuZm9yRWFjaCgobm9kZSk9PntcclxuICAgICAgICAgICAgaWYobm9kZS5wYXJlbnQgPT0gdGhpcykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50SGVpZ2h0ICs9IG5vZGUuZ2V0TmV4dEhlaWdodChsYXllckRlcHRoIC0gMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGlmKHRoaXMuY3VycmVudEhlaWdodCA9PSAwKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50SGVpZ2h0ID0gYmFzZVNpemUgKiA1OyAgLy8gZW5kIGNhc2UgZm9yIHNpbmdsZSBub2Rlc1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50SGVpZ2h0O1xyXG59O1xyXG5cclxuXHJcblR1dG9yaWFsTm9kZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKHBDYW52YXNTdGF0ZSwgcFBhaW50ZXIsIGdyYXBoLCBwYXJlbnRDYWxsZXIsIGRpcmVjdGlvbiwgbGF5ZXJEZXB0aCkge1xyXG4gICAgLy9kcmF3IGxpbmUgdG8gcGFyZW50IGlmIHBvc3NpYmxlXHJcbiAgICBpZihwYXJlbnRDYWxsZXIgJiYgcGFyZW50Q2FsbGVyID09IHRoaXMucGFyZW50KSB7XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5zYXZlKCk7XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5saW5lV2lkdGggPSAyO1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHguc3Ryb2tlU3R5bGUgPSBcIiNmZmZcIjtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vdmFyIGJldHdlZW4gPSBuZXcgUG9pbnQodGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnkpO1xyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHgubW92ZVRvKHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55KTtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LmxpbmVUbyhwYXJlbnRDYWxsZXIucG9zaXRpb24ueCwgcGFyZW50Q2FsbGVyLnBvc2l0aW9uLnkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIHBDYW52YXNTdGF0ZS5jdHguY2xvc2VQYXRoKCk7XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5zdHJva2UoKTtcclxuICAgICAgICBwQ2FudmFzU3RhdGUuY3R4LnJlc3RvcmUoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gZHJhdyBjaGlsZCBub2Rlc1xyXG4gICAgaWYobGF5ZXJEZXB0aCA+IDApe1xyXG4gICAgICAgIC8vIGxlZnQgYW5kIG1pZGRsZVxyXG4gICAgICAgIGlmKGRpcmVjdGlvbiA8IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5wcmV2aW91c05vZGVzLmZvckVhY2goKG5vZGUpPT57XHJcbiAgICAgICAgICAgICAgICBub2RlLmRyYXcocENhbnZhc1N0YXRlLCBwUGFpbnRlciwgZ3JhcGgsIHRoaXMsIC0xLCBsYXllckRlcHRoIC0gMSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyByaWdodCBhbmQgbWlkZGxlXHJcbiAgICAgICAgaWYoZGlyZWN0aW9uID4gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5uZXh0Tm9kZXMuZm9yRWFjaCgobm9kZSk9PntcclxuICAgICAgICAgICAgICAgIG5vZGUuZHJhdyhwQ2FudmFzU3RhdGUsIHBQYWludGVyLCBncmFwaCwgdGhpcywgMSwgbGF5ZXJEZXB0aCAtIDEpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIGRyYXcgY2lyY2xlXHJcbiAgICBwUGFpbnRlci5jaXJjbGUocENhbnZhc1N0YXRlLmN0eCwgdGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnksIHRoaXMuc2l6ZSwgdHJ1ZSwgdGhpcy5jb2xvciwgdHJ1ZSwgXCIjZmZmXCIsIDIpO1xyXG4gICAgXHJcbiAgICAvLyBkcmF3IGEgY2hlY2ttYXJrXHJcbiAgICBpZih0aGlzLnN0YXRlID09IFR1dG9yaWFsU3RhdGUuQ29tcGxldGVkKSB7XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5kcmF3SW1hZ2UoZ3JhcGguY2hlY2tJbWFnZSwgdGhpcy5wb3NpdGlvbi54IC0gMzIsIHRoaXMucG9zaXRpb24ueSAtIDMyKTtcclxuICAgIH1cclxuICAgIC8vIGRyYXcgYSBsb2NrXHJcbiAgICBpZih0aGlzLnN0YXRlID09IFR1dG9yaWFsU3RhdGUuTG9ja2VkKSB7XHJcbiAgICAgICAgcENhbnZhc1N0YXRlLmN0eC5kcmF3SW1hZ2UoZ3JhcGgubG9ja0ltYWdlLCB0aGlzLnBvc2l0aW9uLnggLSAzMiwgdGhpcy5wb3NpdGlvbi55IC0gMzIpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyBkcmF3IHRoZSBsYWJlbFxyXG4gICAgdGhpcy5sYWJlbC5kcmF3KHBDYW52YXNTdGF0ZSwgcFBhaW50ZXIpO1xyXG4gICAgaWYoZGlyZWN0aW9uID09IDApIHtcclxuICAgICAgICB0aGlzLmRldGFpbHNCdXR0b24uZHJhdyhwQ2FudmFzU3RhdGUsIHBQYWludGVyKTtcclxuICAgICAgICB0aGlzLmNvbXBsZXRpb25CdXR0b24uZHJhdyhwQ2FudmFzU3RhdGUsIHBQYWludGVyKTtcclxuICAgIH1cclxufTtcclxuXHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUdXRvcmlhbE5vZGU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmZ1bmN0aW9uIERyYXdsaWIoKXtcclxufTtcclxuXHJcbkRyYXdsaWIucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oY3R4LCB4LCB5LCB3LCBoKSB7XHJcbiAgICBjdHguY2xlYXJSZWN0KHgsIHksIHcsIGgpO1xyXG59O1xyXG5cclxuRHJhd2xpYi5wcm90b3R5cGUucmVjdCA9IGZ1bmN0aW9uKGN0eCwgeCwgeSwgdywgaCwgY29sKSB7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IGNvbDtcclxuICAgIGN0eC5maWxsUmVjdCh4LCB5LCB3LCBoKTtcclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbn07XHJcblxyXG5EcmF3bGliLnByb3RvdHlwZS5yb3VuZGVkUmVjdCA9IGZ1bmN0aW9uKGN0eCwgeCwgeSwgdywgaCwgcmFkLCBmaWxsLCBmaWxsQ29sb3IsIG91dGxpbmUsIG91dGxpbmVDb2xvciwgb3V0bGluZVdpZHRoKSB7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4Lm1vdmVUbyh4LCB5IC0gcmFkKTsgLy8xMSBvIGNsb2NrXHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHgubGluZVRvKHggKyB3LCB5IC0gcmFkKTsgLy8xIG8gY2xvY2tcclxuICAgIGN0eC5hcmNUbyh4ICsgdyArIHJhZCwgeSAtIHJhZCwgeCArIHcgKyByYWQsIHksIHJhZCk7IC8vIDIgbyBjbG9ja1xyXG4gICAgY3R4LmxpbmVUbyh4ICsgdyArIHJhZCwgeSArIGgpOyAvLyA0IG8gY2xvY2tcclxuICAgIGN0eC5hcmNUbyh4ICsgdyArIHJhZCwgeSArIGggKyByYWQsIHggKyB3LCB5ICsgaCArIHJhZCwgcmFkKSAvLzUgbyBjbG9ja1xyXG4gICAgY3R4LmxpbmVUbyh4LCB5ICsgaCArIHJhZCk7IC8vIDcgbyBjbG9ja1xyXG4gICAgY3R4LmFyY1RvKHggLSByYWQsIHkgKyBoICsgcmFkLCB4IC0gcmFkLCB5ICsgaCwgcmFkKSAvLzggbyBjbG9ja1xyXG4gICAgY3R4LmxpbmVUbyh4IC0gcmFkLCB5KTsgLy8gMTAgbyBjbG9ja1xyXG4gICAgY3R4LmFyY1RvKHggLSByYWQsIHkgLSByYWQsIHgsIHkgLXJhZCwgcmFkKSAvLzExIG8gY2xvY2tcclxuICAgIGN0eC5jbG9zZVBhdGgoKTtcclxuICAgIGlmKGZpbGwpIHtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gZmlsbENvbG9yO1xyXG4gICAgICAgIGN0eC5maWxsKCk7XHJcbiAgICB9XHJcbiAgICBpZihvdXRsaW5lKSB7XHJcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gb3V0bGluZUNvbG9yO1xyXG4gICAgICAgIGN0eC5saW5lV2lkdGggPSBvdXRsaW5lV2lkdGg7XHJcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgfVxyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxufVxyXG5cclxuRHJhd2xpYi5wcm90b3R5cGUubGluZSA9IGZ1bmN0aW9uKGN0eCwgeDEsIHkxLCB4MiwgeTIsIHRoaWNrbmVzcywgY29sb3IpIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHgubW92ZVRvKHgxLCB5MSk7XHJcbiAgICBjdHgubGluZVRvKHgyLCB5Mik7XHJcbiAgICBjdHgubGluZVdpZHRoID0gdGhpY2tuZXNzO1xyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gY29sb3I7XHJcbiAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG59O1xyXG5cclxuRHJhd2xpYi5wcm90b3R5cGUuY2lyY2xlID0gZnVuY3Rpb24oY3R4LCB4LCB5LCByYWRpdXMsIGZpbGwsIGZpbGxDb2xvciwgb3V0bGluZSwgb3V0bGluZUNvbG9yLCBvdXRsaW5lV2lkdGgpIHtcclxuICAgIGN0eC5zYXZlKCk7XHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHguYXJjKHgseSwgcmFkaXVzLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xyXG4gICAgY3R4LmNsb3NlUGF0aCgpO1xyXG4gICAgaWYoZmlsbCkge1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBmaWxsQ29sb3I7XHJcbiAgICAgICAgY3R4LmZpbGwoKTtcclxuICAgIH1cclxuICAgIGlmKG91dGxpbmUpIHtcclxuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBvdXRsaW5lQ29sb3I7XHJcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IG91dGxpbmVXaWR0aDtcclxuICAgICAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICB9XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG59O1xyXG5cclxuRHJhd2xpYi5wcm90b3R5cGUudGV4dFRvTGluZXMgPSBmdW5jdGlvbihjdHgsIHRleHQsIGZvbnQsIHdpZHRoKSB7XHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4LmZvbnQgPSBmb250O1xyXG4gICAgXHJcbiAgICB2YXIgbGluZXMgPSBbXTtcclxuICAgIFxyXG4gICAgd2hpbGUgKHRleHQubGVuZ3RoKSB7XHJcbiAgICAgICAgdmFyIGksIGo7XHJcbiAgICAgICAgZm9yKGkgPSB0ZXh0Lmxlbmd0aDsgY3R4Lm1lYXN1cmVUZXh0KHRleHQuc3Vic3RyKDAsIGkpKS53aWR0aCA+IHdpZHRoOyBpLS0pO1xyXG5cclxuICAgICAgICB2YXIgcmVzdWx0ID0gdGV4dC5zdWJzdHIoMCxpKTtcclxuXHJcbiAgICAgICAgaWYgKGkgIT09IHRleHQubGVuZ3RoKVxyXG4gICAgICAgICAgICBmb3IodmFyIGogPSAwOyByZXN1bHQuaW5kZXhPZihcIiBcIiwgaikgIT09IC0xOyBqID0gcmVzdWx0LmluZGV4T2YoXCIgXCIsIGopICsgMSk7XHJcblxyXG4gICAgICAgIGxpbmVzLnB1c2gocmVzdWx0LnN1YnN0cigwLCBqIHx8IHJlc3VsdC5sZW5ndGgpKTtcclxuICAgICAgICB3aWR0aCA9IE1hdGgubWF4KHdpZHRoLCBjdHgubWVhc3VyZVRleHQobGluZXNbbGluZXMubGVuZ3RoIC0gMV0pLndpZHRoKTtcclxuICAgICAgICB0ZXh0ICA9IHRleHQuc3Vic3RyKGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdLmxlbmd0aCwgdGV4dC5sZW5ndGgpO1xyXG4gICAgfVxyXG4gICAgY3R4LnJlc3RvcmUoKTtcclxuICAgIHJldHVybiBsaW5lcztcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRHJhd2xpYjsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIFBvaW50ID0gcmVxdWlyZSgnLi4vY29udGFpbmVycy9Qb2ludC5qcycpO1xyXG5cclxuZnVuY3Rpb24gVXRpbGl0aWVzKCl7XHJcbn1cclxuXHJcbi8vQk9BUkRQSEFTRSAtIHNldCBhIHN0YXR1cyB2YWx1ZSBvZiBhIG5vZGUgaW4gbG9jYWxTdG9yYWdlIGJhc2VkIG9uIElEXHJcblV0aWxpdGllcy5wcm90b3R5cGUuc2V0UHJvZ3Jlc3MgPSBmdW5jdGlvbihwT2JqZWN0KXtcclxuICAgIHZhciBwcm9ncmVzc1N0cmluZyA9IGxvY2FsU3RvcmFnZS5wcm9ncmVzcztcclxuICAgIFxyXG4gICAgdmFyIHRhcmdldE9iamVjdCA9IHBPYmplY3Q7XHJcbiAgICAvL21ha2UgYWNjb21vZGF0aW9ucyBpZiB0aGlzIGlzIGFuIGV4dGVuc2lvbiBub2RlXHJcbiAgICB2YXIgZXh0ZW5zaW9uZmxhZyA9IHRydWU7XHJcbiAgICB3aGlsZShleHRlbnNpb25mbGFnKXtcclxuICAgICAgICBpZih0YXJnZXRPYmplY3QudHlwZSA9PT0gXCJleHRlbnNpb25cIil7XHJcbiAgICAgICAgICAgIHRhcmdldE9iamVjdCA9IHRhcmdldE9iamVjdC5jb25uZWN0aW9uRm9yd2FyZFswXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgZXh0ZW5zaW9uZmxhZyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgdmFyIG9iamVjdElEID0gdGFyZ2V0T2JqZWN0LmRhdGEuX2lkO1xyXG4gICAgdmFyIG9iamVjdFN0YXR1cyA9IHRhcmdldE9iamVjdC5zdGF0dXM7XHJcbiAgICBcclxuICAgIC8vc2VhcmNoIHRoZSBwcm9ncmVzc1N0cmluZyBmb3IgdGhlIGN1cnJlbnQgSURcclxuICAgIHZhciBpZEluZGV4ID0gcHJvZ3Jlc3NTdHJpbmcuaW5kZXhPZihvYmplY3RJRCk7XHJcbiAgICBcclxuICAgIC8vaWYgaXQncyBub3QgYWRkIGl0IHRvIHRoZSBlbmRcclxuICAgIGlmKGlkSW5kZXggPT09IC0xKXtcclxuICAgICAgICBwcm9ncmVzc1N0cmluZyArPSBvYmplY3RJRCArIFwiXCIgKyBvYmplY3RTdGF0dXMgKyBcIixcIjtcclxuICAgIH1cclxuICAgIC8vb3RoZXJ3aXNlIG1vZGlmeSB0aGUgc3RhdHVzIHZhbHVlXHJcbiAgICBlbHNle1xyXG4gICAgICAgIHByb2dyZXNzU3RyaW5nID0gcHJvZ3Jlc3NTdHJpbmcuc3Vic3RyKDAsIG9iamVjdElELmxlbmd0aCArIGlkSW5kZXgpICsgb2JqZWN0U3RhdHVzICsgcHJvZ3Jlc3NTdHJpbmcuc3Vic3RyKG9iamVjdElELmxlbmd0aCArIDEgKyBpZEluZGV4LCBwcm9ncmVzc1N0cmluZy5sZW5ndGgpICsgXCJcIjtcclxuICAgIH1cclxuICAgIGxvY2FsU3RvcmFnZS5wcm9ncmVzcyA9IHByb2dyZXNzU3RyaW5nO1xyXG59XHJcblxyXG4vL3JldHVybnMgbW91c2UgcG9zaXRpb24gaW4gbG9jYWwgY29vcmRpbmF0ZSBzeXN0ZW0gb2YgZWxlbWVudFxyXG5VdGlsaXRpZXMucHJvdG90eXBlLmdldE1vdXNlID0gZnVuY3Rpb24oZSl7XHJcbiAgICByZXR1cm4gbmV3IFBvaW50KChlLnBhZ2VYIC0gZS50YXJnZXQub2Zmc2V0TGVmdCksIChlLnBhZ2VZIC0gZS50YXJnZXQub2Zmc2V0VG9wKSk7XHJcbn1cclxuXHJcblV0aWxpdGllcy5wcm90b3R5cGUubWFwID0gZnVuY3Rpb24odmFsdWUsIG1pbjEsIG1heDEsIG1pbjIsIG1heDIpe1xyXG4gICAgcmV0dXJuIG1pbjIgKyAobWF4MiAtIG1pbjIpICogKCh2YWx1ZSAtIG1pbjEpIC8gKG1heDEgLSBtaW4xKSk7XHJcbn1cclxuXHJcbi8vbGltaXRzIHRoZSB1cHBlciBhbmQgbG93ZXIgbGltaXRzIG9mIHRoZSBwYXJhbWV0ZXIgdmFsdWVcclxuVXRpbGl0aWVzLnByb3RvdHlwZS5jbGFtcCA9IGZ1bmN0aW9uKHZhbHVlLCBtaW4sIG1heCl7XHJcbiAgICByZXR1cm4gTWF0aC5tYXgobWluLCBNYXRoLm1pbihtYXgsIHZhbHVlKSk7XHJcbn1cclxuXHJcbi8vY2hlY2tzIG1vdXNlIGNvbGxpc2lvbiBvbiBjYW52YXNcclxuVXRpbGl0aWVzLnByb3RvdHlwZS5tb3VzZUludGVyc2VjdCA9IGZ1bmN0aW9uKHBNb3VzZVN0YXRlLCBwRWxlbWVudCwgcE9mZnNldHRlciwgcFNjYWxlKXtcclxuICAgIC8vaWYgdGhlIHggcG9zaXRpb24gY29sbGlkZXNcclxuICAgIGlmKHBFbGVtZW50LnN0YXR1cyAhPT0gXCIwXCIpe1xyXG4gICAgICAgIGlmKHBNb3VzZVN0YXRlLnJlbGF0aXZlUG9zaXRpb24ueCArIHBPZmZzZXR0ZXIueCA+IChwRWxlbWVudC5wb3NpdGlvbi54IC0gKHBFbGVtZW50LndpZHRoKS8yKSAmJiBwTW91c2VTdGF0ZS5yZWxhdGl2ZVBvc2l0aW9uLnggKyBwT2Zmc2V0dGVyLnggPCAocEVsZW1lbnQucG9zaXRpb24ueCArIChwRWxlbWVudC53aWR0aCkvMikpe1xyXG4gICAgICAgICAgICAvL2lmIHRoZSB5IHBvc2l0aW9uIGNvbGxpZGVzXHJcbiAgICAgICAgICAgIGlmKHBNb3VzZVN0YXRlLnJlbGF0aXZlUG9zaXRpb24ueSArIHBPZmZzZXR0ZXIueSA+IChwRWxlbWVudC5wb3NpdGlvbi55IC0gKHBFbGVtZW50LmhlaWdodCkvMikgJiYgcE1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbi55ICsgcE9mZnNldHRlci55IDwgKHBFbGVtZW50LnBvc2l0aW9uLnkgKyAocEVsZW1lbnQuaGVpZ2h0KS8yKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgcEVsZW1lbnQubW91c2VPdmVyID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgcEVsZW1lbnQubW91c2VPdmVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgcEVsZW1lbnQubW91c2VPdmVyID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFV0aWxpdGllczsiXX0=
