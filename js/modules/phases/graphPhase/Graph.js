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