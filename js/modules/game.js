"use strict";
//imported objects
var BoardPhase = require('./phases/boardPhase/BoardPhase.js');
var DrawLib = require('./libraries/Drawlib.js');
var Utilities = require('./libraries/Utilities.js');

var activePhase;
var painter;
var utility;

var mouseState;
var previousMouseState;

function Game(){    
    painter = new DrawLib();
    utility = new Utilities();
    
    //instantiate a phase, phases have universal function calls and callable variables
    activePhase = new BoardPhase("https://atlas-backend.herokuapp.com/repos");
    
    //give mouseState a value from the start so it doesn't pass undefined to previous
    mouseState = 0;
}

//passing context, canvas, delta time, center point, usable height, mouse state
Game.prototype.update = function(ctx, canvas, dt, center, activeHeight, pMouseState, canvasState){
    previousMouseState = mouseState;
    mouseState = pMouseState;
    
    //game class specific draw calls
    this.draw(canvasState);
    
    //update key variables in the active phase
    activePhase.update(ctx, canvas, dt, center, activeHeight, pMouseState, canvasState);
}

Game.prototype.draw = function(canvasState){
    //draw board
    canvasState.ctx.save();
    painter.clear(canvasState.ctx, 0, 0, canvasState.activeWidth, canvasState.totalHeight);
    painter.rect(canvasState.ctx, 0, 0, canvasState.activeWidth, canvasState.totalHeight, "white");
    painter.line(canvasState.ctx, canvasState.activeWidth/2, canvasState.center.y - canvasState.activeHeight/2, canvasState.activeWidth/2, canvasState.totalHeight, 2, "lightgray");
    painter.line(canvasState.ctx, 0, canvasState.center.y, canvasState.activeWidth, canvasState.center.y, 2, "lightGray");
    canvasState.ctx.restore();
}

module.exports = Game;