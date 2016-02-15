"use strict";
var Board = require('./board.js');
var Point = require('./point.js');
var DrawLib = require('./drawLib.js');
var LessonNode = require('./lessonNode.js');
var Utilities = require('./utilities.js');

var boardArray;
var painter;

var mousePosition;
var relativeMousePosition;
var mouseDown;

function game(){
    painter = new DrawLib();
    
    mouseDown = false;
    
    var testLessonNodeArray = [];
    testLessonNodeArray.push(new LessonNode(new Point(0,0), "images/dog.png"));
    
    boardArray = [];
    boardArray.push(new Board(new Point(0,0), testLessonNodeArray));
    
    
}

var p = game.prototype;

p.update = function(ctx, canvas, dt, center, activeHeight, pMousePosition, pRelativeMousePosition){
    //update stuff
    p.act(pMousePosition, pRelativeMousePosition);
    //draw stuff
    p.draw(ctx, canvas, center, activeHeight);
}

p.act = function(pMousePosition, pRelativeMousePosition){
    mousePosition = pMousePosition;
    relativeMousePosition = pRelativeMousePosition;
    document.querySelector('#debugLine').innerHTML = "mousePosition: x = " + relativeMousePosition.x + ", y = " + relativeMousePosition.y;
}

p.draw = function(ctx, canvas, center, activeHeight){
    //draw board
    ctx.save();
    painter.clear(ctx, 0, 0, canvas.offsetWidth, canvas.offsetHeight);
    painter.rect(ctx, 0, 0, canvas.offsetWidth, canvas.offsetHeight, "white");
    painter.line(ctx, canvas.offsetWidth/2, center.y - activeHeight/2, canvas.offsetWidth/2, canvas.offsetHeight, 2, "lightgray");
    painter.line(ctx, 0, center.y, canvas.offsetWidth, center.y, 2, "lightGray");
    
    //drawing lesson nodes
    boardArray[0].draw(ctx, center, activeHeight);
    
    ctx.restore();
}

module.exports = game;