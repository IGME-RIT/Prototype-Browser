"use strict";
var Board = require('./Board.js');
var Point = require('../../common/Point.js');
var DrawLib = require('../../libraries/DrawLib.js');
var LessonNode = require('./LessonNode.js');
var Parser = require('./Parser.js');
var Utilities = require('../../libraries/Utilities.js');

var utility;
var painter;
var parser;

var activeBoard;
var boardLoaded;

var mouseTarget;

var nodeArray;


function BoardPhase(pTargetURL){
    //
    boardLoaded = false;
    mouseTarget = 0;
    
    //instantiate libraries
    painter = new DrawLib();
    utility = new Utilities();
    
    //reads data from target URL and connects callback
    parser = new Parser(pTargetURL, boardLoadedCallback);
    
    //insert html
    populateDynamicContent();
}

//sets activeBoard and gives the go ahead for the loop to execute
function boardLoadedCallback(pJSONElements){
    activeBoard = new Board(new Point(0,0), pJSONElements);
    boardLoaded = true;
}

//populate the dynamic content div in index with this phase's specific html
function populateDynamicContent(){
    document.getElementById("dynamicContent").innerHTML = "<div id=\"detailLayer\" class=\"hiddenLayer\"><div id=\"detailBlinder\"></div><div id=\"detailWindow\" class=\"hiddenWindow\"><div id=\"dwBanner\"><img id=\"dwBannerImage\" src=\"\"><div id=\"dwBannerDarker\"></div><p id=\"dwBannerTitle\">Test</p></div><div id=\"dwTags\"></div><div id=\"dwDescription\"><p id=\"dwDescriptionText\">Test</p></div><div id=\"dwResources\"></div><div id=\"dwLauncher\"></div><p id=\"detailX\">x</p></div><div id=\"lockWindow\" class=\"hiddenWindow\"><div id=\"lockDivTop\"><h2 id=\"lockTitle\"></h2><p id=\"lockX\">x</p></div><div id=\"lockDivBottom\"><p id=\"lockList\"></p></div></div></div>";
    
    //assign a click event to the detail blinder element that is used to darken the screen when information is being displayed
    document.getElementById("detailBlinder").onmousedown = function() { document.getElementById("detailLayer").className = "hiddenLayer"; }
}

//passing context, canvas, delta time, center point, usable height, mouse state
BoardPhase.prototype.update = function(mouseState, canvasState){
    if(boardLoaded){
        this.act(mouseState);
        //context, center point, usable height
        this.draw(canvasState);
    }
    else{
        canvasState.ctx.save();
        canvasState.ctx.font = "40px Arial";
        canvasState.ctx.textBaseline = "middle";
        canvasState.ctx.textAlign = "center";
        canvasState.ctx.fillText("Loading...", canvasState.center.x, canvasState.center.y);
        canvasState.ctx.restore();
    }
}

BoardPhase.prototype.act = function(mouseState){
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

BoardPhase.prototype.draw = function(canvasState){
    //draw nodes
    activeBoard.draw(canvasState);
}

module.exports = BoardPhase;