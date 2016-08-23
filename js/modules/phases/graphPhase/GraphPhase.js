"use strict";
var Point = require('../../common/Point.js');
var DrawLib = require('../../libraries/DrawLib.js');
//var LessonNode = require('./LessonNode.js');
var Parser = require('../boardPhase/Parser.js');
var Utilities = require('../../libraries/Utilities.js');

var utility;
var painter;
var parser;

var graphLoaded;

var mouseTarget;
var graph;

function GraphPhase(pTargetURL){
    //initialize base values
    graphLoaded = false;
    mouseTarget = 0;
    
    //instantiate utility objects
    painter = new DrawLib();
    utility = new Utilities();
    
    //request graph data and wait to begin parsing
    parser = new Parser(pTargetURL, function(){
        graphLoaded = false;
    });
    
    
}

GraphPhase.prototype.update = function(mouseState, canvasState) {
    if(graphLoaded) {
        
        this.draw(canvasState);
    }
    else {
        //if we havent loaded the data, display loading, and wait
        canvasState.ctx.save();
        canvasState.ctx.font = "40px Arial";
        canvasState.ctx.fillStyle = "black";
        canvasState.ctx.textBaseline = "middle";
        canvasState.ctx.textAlign = "center";
        canvasState.ctx.fillText("Loading...", canvasState.center.x, canvasState.center.y);
        canvasState.ctx.restore();
    }
}
GraphPhase.prototype.draw = function(canvasState) {
    
}

module.exports = GraphPhase;