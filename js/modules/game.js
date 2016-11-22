"use strict";
//imported objects
var GraphPhase = require('./graph/GraphPhase.js');
var DrawLib = require('./tools/Drawlib.js');
var Utilities = require('./tools/Utilities.js');

var activePhase;
var painter;
var utility;

var mouseState

function Game(){    
    painter = new DrawLib();
    utility = new Utilities();
    
    //instantiate the graph
    activePhase = new GraphPhase("https://atlas-backend.herokuapp.com/repos");
    
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