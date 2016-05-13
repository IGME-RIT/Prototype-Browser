"use strict";

//parameter is a point that denotes starting position
function board(startPosition, lessonNodes){
    this.position = startPosition;
    this.lessonNodeArray = lessonNodes;
}

board.prototype.move = function(pX, pY){
    this.position.x += pX;
    this.position.y += pY;
};

//context, center point, usable height
board.prototype.draw = function(ctx, center, activeHeight){
    ctx.save();
    //translate to the center of the screen
    ctx.translate(center.x - this.position.x, center.y - this.position.y);
    for(var i = 0; i < this.lessonNodeArray.length; i++){
        this.lessonNodeArray[i].draw(ctx);
    }
    ctx.restore();
};

module.exports = board;

//this is an object named Board and this is its javascript
//var Board = require('./objects/board.js');
//var b = new Board();
    