"use strict";
var BoardPhase = require('./phases/boardPhase.js');
var ScenePhase = require('./phases/scenePhase.js');

var Point = require('./point.js');
var DrawLib = require('./drawLib.js');
var LessonNode = require('./lessonNode.js');
var Utilities = require('./utilities.js');

var GAME_PHASE = Object.freeze({LANDING: 0, SELECTION: 1, BOARD: 2});

var painter;
var board;
var utility;
var phaseEnum;
var activePhase;

var mouseState;
var previousMouseState;
var draggingDisabled;
var mouseTarget;
var mouseSustainedDown;

var JSONLoad = false;



function game(){    
    painter = new DrawLib();
    utility = new Utilities();
    phaseEnum = GAME_PHASE.BOARD;
    
    draggingDisabled = false;
    mouseSustainedDown = false;
    
    //activePhase = new BoardPhase("https://atlas-backend.herokuapp.com/repos");
    activePhase = new ScenePhase("testScene05", 0);
}

var p = game.prototype;

//passing context, canvas, delta time, center point, usable height, mouse state
p.update = function(ctx, canvas, dt, center, activeHeight, pMouseState){
    previousMouseState = mouseState;
    mouseState = pMouseState;
    mouseTarget = 0;
    
    
    
    if(typeof previousMouseState === 'undefined'){
        previousMouseState = mouseState;
    }
    
    
    if(activePhase === GAME_PHASE.BOARD){
        //update active board object
    }
    //update stuff
    p.act();
    //draw stuff
    p.draw(ctx, canvas, center, activeHeight);
    
    activePhase.update(ctx, canvas, dt, center, activeHeight, pMouseState);
}

p.act = function(){
    
    
    
}

p.draw = function(ctx, canvas, center, activeHeight){
    //draw board
    ctx.save();
    painter.clear(ctx, 0, 0, canvas.offsetWidth, canvas.offsetHeight);
    painter.rect(ctx, 0, 0, canvas.offsetWidth, canvas.offsetHeight, "white");
    painter.line(ctx, canvas.offsetWidth/2, center.y - activeHeight/2, canvas.offsetWidth/2, canvas.offsetHeight, 2, "lightgray");
    painter.line(ctx, 0, center.y, canvas.offsetWidth, center.y, 2, "lightGray");
    
    //mouseposition
    painter.circle(ctx, mouseState.lastRelativePosition.x + center.x, mouseState.lastRelativePosition.y + center.y, 5,"green", true);
    painter.circle(ctx, mouseState.relativePosition.x + center.x, mouseState.relativePosition.y + center.y, 5,"red", true);
    ctx.restore();
}

module.exports = game;