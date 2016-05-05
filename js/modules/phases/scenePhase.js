"use strict";
var Point = require('../point.js');
var DrawLib = require('../drawLib.js');
var Utilities = require('../utilities.js');

var utility;
var painter;

var sceneLoaded;

var mouseState;
var mouseTarget;


function scenePhase(pTargetURL){
    sceneLoaded = false;
    mouseTarget = 0;
    
    painter = new DrawLib();
    utility = new Utilities();
}

var p = scenePhase.prototype;

//passing context, canvas, delta time, center point, usable height, mouse state
p.update = function(ctx, canvas, dt, center, activeHeight, pMouseState){
    mouseState = pMouseState;
    if(boardLoaded){
        p.act();
        //context, center point, usable height
        p.draw(ctx, center, activeHeight);
    }
}

p.act = function(){
    //mouse handling for target calculation
    for(var i = 0; i < activeBoard.lessonNodeArray.length; i++){
        var targetLessonNode = activeBoard.lessonNodeArray[i];
        utility.mouseIntersect(mouseState, targetLessonNode, activeBoard.position, targetLessonNode.scaleFactor);
        if(targetLessonNode.mouseOver == true){
            mouseTarget = targetLessonNode;
            break;
        }
        else{
            mouseTarget = 0;
        }
    }
    //mouse handling for board movement
    if(mouseState.mouseDown === true && mouseState.lastMouseDown === true){
        activeBoard.move(mouseState.lastPosition.x - mouseState.position.x, mouseState.lastPosition.y - mouseState.position.y);
    }
    //mouse handling for clicking
    if(mouseState.mouseDown === true && mouseState.lastMouseDown === true){
        activeBoard.move(mouseState.lastPosition.x - mouseState.position.x, mouseState.lastPosition.y - mouseState.position.y);
    }
    
    document.querySelector('#debugLine').innerHTML = "mousePosition: x = " + mouseState.relativePosition.x + ", y = " + mouseState.relativePosition.y + 
    "<br>Current Clicked = " + mouseState.mouseDown + 
    "<br>Last Clicked = " + mouseState.lastMouseDown + 
    "<br>MouseTarget = " + mouseTarget + 
    "<br>Over Canvas = " + mouseState.mouseIn;
}

p.draw = function(ctx, center, activeHeight){
}


module.exports = scenePhase;