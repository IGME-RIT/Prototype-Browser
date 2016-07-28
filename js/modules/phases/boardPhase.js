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

var nodeArray;


function BoardPhase(pTargetURL){
    boardLoaded = false;
    mouseTarget = 0;
    
    painter = new DrawLib();
    utility = new Utilities();
    parser = new Parser(pTargetURL, boardLoadedCallback);
    
    populateDynamicContent();
    
    //assign a click event to the detail blinder element that is used to darken the screen when information is being displayed
    document.getElementById("detailBlinder").onmousedown = function() { document.getElementById("detailLayer").className = "hiddenLayer"; }
}

function populateDynamicContent(){
    document.getElementById("dynamicContent").innerHTML = "<div id=\"detailLayer\" class=\"hiddenLayer\"><div id=\"detailBlinder\"></div><div id=\"detailWindow\" class=\"hiddenWindow\"><div id=\"dwBanner\"><img id=\"dwBannerImage\" src=\"\"><div id=\"dwBannerDarker\"></div><p id=\"dwBannerTitle\">Test</p></div><div id=\"dwTags\"></div><div id=\"dwDescription\"><p id=\"dwDescriptionText\">Test</p></div><div id=\"dwResources\"></div><div id=\"dwLauncher\"></div><p id=\"detailX\">x</p></div><div id=\"lockWindow\" class=\"hiddenWindow\"><div id=\"lockDivTop\"><h2 id=\"lockTitle\"></h2><p id=\"lockX\">x</p></div><div id=\"lockDivBottom\"><p id=\"lockList\"></p></div></div></div>";
}

function boardLoadedCallback(pJSONElements){
    activeBoard = new Board(new Point(0,0), pJSONElements);
    boardLoaded = true;
}

//passing context, canvas, delta time, center point, usable height, mouse state
BoardPhase.prototype.update = function(ctx, canvas, dt, center, activeHeight, pMouseState){
    mouseState = pMouseState;
    if(boardLoaded){
        this.act();
        //context, center point, usable height
        this.draw(ctx, center, activeHeight);
    }
    else{
        ctx.save();
        ctx.font = "40px Arial";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillText("Loading...", center.x, center.y);
        ctx.restore();
    }
}

BoardPhase.prototype.act = function(){
    var broken = false;
    //mouse handling for target calculation
    for(var i = 0; i < activeBoard.nodeArray.length; i++){
        
        if(broken){
            broken = false;
            break;
        }
        var subArray = activeBoard.nodeArray[i];
        for(var j = 0; j < subArray.length; j++){
            var targetLessonNode = activeBoard.nodeArray[i][j];
            utility.mouseIntersect(mouseState, targetLessonNode, activeBoard.position, targetLessonNode.scaleFactor);
            if(targetLessonNode.mouseOver === true){
                mouseTarget = targetLessonNode;
                broken = true;
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
    "   Last Clicked = " + mouseState.lastMouseDown + 
    "<br>MouseTarget = " + mouseTarget;
}

BoardPhase.prototype.draw = function(ctx, center, activeHeight){
    //draw nodes
    activeBoard.draw(ctx, center, activeHeight);
}

module.exports = BoardPhase;