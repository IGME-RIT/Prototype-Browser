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