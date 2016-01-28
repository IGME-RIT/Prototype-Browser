"use strict";
var app = app || {};

app.board = function(){
    //parameter is a point that denotes starting position
    function board(startPosition){
        this.position = startPosition;
        
        this.boundLeft = 0;
        this.boundRight = 0;
        this.boundTop = 0;
        this.boundBottom = 0
        this.debugGridSpacing = 50;
        this.testingArray = [];
        
        this.testingArray.push(new app.point(0, 0));
        this.testingArray.push(new app.point(50, -50));
        this.testingArray.push(new app.point(40, -70));
    }
    
    board.drawLib = undefined;
    
    var p = board.prototype;
    
    p.move = function(pX, pY){
        this.position.x = pX;
        this.position.y = pY;
    };
    
    p.draw = function(ctx, center, activeWidth, activeHeight){
        var gridOffsetX = center.x - this.position.x;
        var gridOffsetY = center.y - this.position.y;
        
        
        //ctx.translte to the offsets?
        
        for(var i = 0; i < this.testingArray.length; i++){
            board.drawLib.circle(ctx, gridOffsetX + this.testingArray[i].x, gridOffsetY + this.testingArray[i].y, 10, "Red");
        }
    };
    
    return board;
}();