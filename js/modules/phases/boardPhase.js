"use strict";
var Board = require('../board.js');
var Point = require('../point.js');
var DrawLib = require('../drawLib.js');
var LessonNode = require('../lessonNode.js');
var Parser = require('../parser.js');

var painter;
var parser;

var activeBoard;
var boardLoaded;

function boardPhase(pTargetURL){
    boardLoaded = false;
    
    painter = new DrawLib();
    parser = new Parser(pTargetURL, boardLoadedCallback);
    
}

function boardLoadedCallback(pJSONElements){
    var tempLessonNodeArray = [];
    
    for(var i = 0; i < pJSONElements.length; i++){
        tempLessonNodeArray.push(new LessonNode(new Point(i * 100, i * 75), pJSONElements[i].image.icon));
    }
    
    activeBoard = new Board(new Point(0,0), tempLessonNodeArray);
    boardLoaded = true;
}

var p = boardPhase.prototype;

p.update = function(ctx, canvas, dt, center, activeHeight, pMouseState){
    if(boardLoaded){
        p.act();
        p.draw(ctx, center, activeHeight);
    }
}

p.act = function(){
    
}

p.draw = function(ctx, center, activeHeight){
    activeBoard.draw(ctx, center, activeHeight);
}


module.exports = boardPhase;