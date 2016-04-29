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
    parser = new Parser(pTargetURL);
    
}

function boardLoadedCallback(pJSONElements){
    var tempLessonNodeArray;
    
    for(var i = 0; i < pJSONElements.length; i++){
        tempLessonNodeArray.push(new LessonNode(new Point(i * 100, i * 75), JSONObject[i].image.icon));
    }
    
    activeBoard = new Board(new Point(0,0), tempLessonNodeArray);
    loaded = true;
    
}

var p = boardPhase.prototype;

p.update = function(){
    if(loaded){
        p.act();
        p.draw();
    }
}

p.act = function(){
    
}

p.draw = function(){
    
}


module.exports = boardPhase;