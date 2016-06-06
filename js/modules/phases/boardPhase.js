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
    
    //populate the array
    for(var i = 0; i < pJSONElements.length; i++){
        tempLessonNodeArray.push(new LessonNode(new Point(0, 0), pJSONElements[i]));
    }
    
    //set start points to processed as well as placeholder placements
    for(var i = 0; i < tempLessonNodeArray.length; i++){
        tempLessonNodeArray[i].processed = false;
        if(tempLessonNodeArray[i].data.connections.length === 0){
            tempLessonNodeArray[i].placement = 0;
            tempLessonNodeArray[i].processed = true;
        }
        else{
            tempLessonNodeArray[i].placement = -1;
        }
    }
    
    //set live connections to each node that can be easily referenced
    for(var i = 0; i < tempLessonNodeArray.length; i++){
        tempLessonNodeArray[i].liveConnections = [];
        for(var j = 0; j < tempLessonNodeArray[i].data.connections.length; j++){
            for(var k = 0; k < tempLessonNodeArray.length; k++){
                if(tempLessonNodeArray[i].data.connections[j] === tempLessonNodeArray[k].data.name){
                    tempLessonNodeArray[i].liveConnections[j] = tempLessonNodeArray[k];
                    break; 
                }
            }
        }
    }
    
    //determine placement of each node based on connections
    var completenessFlag = false;
    while(completenessFlag === false){
        completenessFlag = true;
        for(var i = 0; i < tempLessonNodeArray.length; i++){
            if(tempLessonNodeArray[i].processed === false){
                for(var k = 0; k < tempLessonNodeArray[i].liveConnections.length; k++){
                    var tempMarker = tempLessonNodeArray[i].liveConnections[k].placement;
                    if(tempLessonNodeArray[i].liveConnections[k].placement !== -1){
                        tempLessonNodeArray[i].placement = tempLessonNodeArray[i].liveConnections[k].placement + 1;
                    }
                    else{
                        completenessFlag = false;
                    }
                }
            }    
        }
    }
    
    
    //assign point values that place nodes in proper positions
    var greatestWidth = 0;
    for(var i = 0; i < tempLessonNodeArray.length; i++){
        if(tempLessonNodeArray[i].placement > greatestWidth){
            greatestWidth = tempLessonNodeArray[i].placement;
        }
    }
    
    //create and populate 2d array
    var nodeArray = [];
    for(var i = 0; i < greatestWidth + 1; i++){
        var subArray = [];
        for(var j = 0; j < tempLessonNodeArray.length; j++){
            if(tempLessonNodeArray[j].placement === i){
                subArray.push(tempLessonNodeArray[j]);
            }
        }
        nodeArray[i] = subArray;
    }
    
    //assign positions based on placement in the 2d array
    for(var i = 0; i < nodeArray.length; i++){
        var subArray = nodeArray[i];
        for(var j = 0; j < subArray.length; j++){
            //assign position values
            nodeArray[i][j].position = new Point(i * 280, j * 280);
        }
    }
    
    
    //configure connections
    
    
    activeBoard = new Board(new Point(0,0), nodeArray);
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
    for(var i = 0; i < activeBoard.nodeArray.length; i++){
        var subArray = activeBoard.nodeArray[i];
        for(var j = 0; j < subArray.length; j++){
            var targetLessonNode = activeBoard.nodeArray[i][j];
            utility.mouseIntersect(mouseState, targetLessonNode, activeBoard.position, targetLessonNode.scaleFactor);
            if(targetLessonNode.mouseOver == true){
                mouseTarget = targetLessonNode;
                break;
            }
            else{
                mouseTarget = 0;
            } 
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