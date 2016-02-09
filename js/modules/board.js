"use strict";
//parameter is a point that denotes starting position
function board(startPosition, lessonNodes){
    this.position = startPosition;

    this.boundLeft = 0;
    this.boundRight = 0;
    this.boundTop = 0;
    this.boundBottom = 0;

    this.zoomFactor = 1;


    this.lessonNodeArray = lessonNodes;
}

board.drawLib = undefined;

//helper
function calculateBounds(){
    if(this.lessonNodeArray.length > 0){
        this.boundLeft = this.lessonNodeArray[0].position.x;
        this.boundRight = this.lessonNodeArray[0].position.x;
        this.boundTop = this.lessonNodeArray[0].position.y;
        this.boundBottom = this.lessonNodeArray[0].position.y;
        for(var i = 1; i < this.lessonNodeArray.length; i++){
            if(this.boundLeft > this.lessonNodeArray[i].position.x){
                this.boundLeft = this.lessonNodeArray[i].position.x;
            }
            else if(this.boundRight < this.lessonNodeArray[i].position.x){
                this.boundRight > this.lessonNodeArray[i].position.x;
            }
            if(this.boundTop > this.lessonNodeArray[i].position.y){
                this.boundTop = this.lessonNodeArray[i].position.y;
            }
            else if(this.boundBottom < this.lessonNodeArray[i].position.y){
                this.boundBottom = this.lessonNodeArray[i].position.y;
            }
        }
    }
}


//prototype
var p = board.prototype;

p.move = function(pX, pY){
    this.position.x += pX;
    this.position.y += pY;
};


p.zoom = function(ctx, center, delta){
    /*
    if(delta > 0){
        this.zoomFactor -= .1;
        if(this.zoomFactor < .5){
            this.zoomFactor = .5;
        }
    }
    else{
        this.zoomFactor += .1;
        if(this.zoomFactor > 1.5){
            this.zoomFactor = 1.5;
        }
    }
    */
    //nudge this in the direction of the mouse
    //this.move((center.x - mousePosition.x)/10, (center.y - mousePosition.y)/10);
    //ctx.translate(center.x, center.y);
    //ctx.scale(this.zoomFactor, this.zoomFactor);
    //ctx.translate(-center.x, -center.y);
};

p.draw = function(ctx, center, activeWidth, activeHeight){
    ctx.save();
    //translate to the center of the screen
    ctx.translate(center.x - this.position.x, center.y - this.position.y);
    for(var i = 0; i < this.lessonNodeArray.length; i++){
        this.lessonNodeArray[i].draw(ctx, this.zoomFactor);
    }
    ctx.restore();
};

module.exports = board;

//this is an object named Board and this is its javascript
//var Board = require('./objects/board.js');
//var b = new Board();
    