"use strict";
var Board = require('../board.js');
var Point = require('../point.js');
var DrawLib = require('../drawLib.js');
var LessonNode = require('../lessonNode.js');
var Parser = require('../parser.js');
var Utilities = require('../utilities.js');

var utility;
var painter;
var parser;

var activeBoard;
var boardLoaded;

var mouseState;
var mouseTarget;


function boardPhase(pTargetURL){
    boardLoaded = false;
    mouseTarget = 0;
    
    painter = new DrawLib();
    utility = new Utilities();
    parser = new Parser(pTargetURL, boardLoadedCallback);
    
}

function boardLoadedCallback(pJSONElements){
    var tempLessonNodeArray = [];
    
    for(var i = 0; i < pJSONElements.length; i++){
        tempLessonNodeArray.push(new LessonNode(new Point(i * 100, i * 75), pJSONElements[i]));
    }
    
    activeBoard = new Board(new Point(0,0), tempLessonNodeArray);
    boardLoaded = true;
}

var p = boardPhase.prototype;

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
        
    }
    
    document.querySelector('#debugLine').innerHTML = "mousePosition: x = " + mouseState.relativePosition.x + ", y = " + mouseState.relativePosition.y + 
    "<br>Current Clicked = " + mouseState.mouseDown + 
    "<br>Last Clicked = " + mouseState.lastMouseDown + 
    "<br>MouseTarget = " + mouseTarget + 
    "<br>Over Canvas = " + mouseState.mouseIn;
}

p.draw = function(ctx, center, activeHeight){
    activeBoard.draw(ctx, center, activeHeight);
}


module.exports = boardPhase;