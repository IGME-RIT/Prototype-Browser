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
    
    document.getElementById("detailBlinder").onmousedown = function() { document.getElementById("detailLayer").className = "hiddenLayer"; }
    
}

function boardLoadedCallback(pJSONElements){
    var tempLessonNodeArray = [];
    
    var startIncrementer = 0;
    var midIncrementer = 0;
    var endIncrementer = 0;
    //what nodes are start points, what nodes are end points? Parse the list and find the max number of steps
    for(var i = 0; i < pJSONElements.length; i++){
        tempLessonNodeArray.push(new LessonNode(new Point(i * 100, i * 75), pJSONElements[i]));
    }
    
    for(var i = 0; i < tempLessonNodeArray.length; i++){
        if(tempLessonNodeArray[i].data.connections.length === 0){
            tempLessonNodeArray[i].placement = 0;
        }
        else{
            //temp setting the node to the value of an endpoint
            tempLessonNodeArray[i].placement = 2;
            //going through the entire array of lesson nodes again
            for(var k = 0; k < tempLessonNodeArray.length; k++){
                //checking every lessonNode excluding the one being checked against
                if(k != i){
                    //going through every connection in the checking lessonNode
                    for(var j = 0; j < tempLessonNodeArray[k].data.connections.length; j++){
                        //if there is a match, it means that the k node is not an end point, change it back to a midpoint
                        if(tempLessonNodeArray[i].data.name === tempLessonNodeArray[k].data.connections[j]){
                            tempLessonNodeArray[i].placement = 1;
                            break;
                        }
                    }
                }
            }
        }
    }
    
    for(var i = 0; i < tempLessonNodeArray.length; i++){
        if(tempLessonNodeArray[i].placement == 0){
            tempLessonNodeArray[i].position = new Point(0, startIncrementer * 200);
            startIncrementer++;
        }
        else if(tempLessonNodeArray[i].placement == 1){
            tempLessonNodeArray[i].position = new Point(200, midIncrementer * 200);
            midIncrementer++;
        }
        else{
            tempLessonNodeArray[i].position = new Point(400, endIncrementer * 200);
            endIncrementer++;
        }
    }
    
    //configure connections
    
    
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
    if(mouseState.mouseDown === true && mouseState.lastMouseDown === false){
        if(mouseTarget != 0){
            mouseTarget.click();
        }
        
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