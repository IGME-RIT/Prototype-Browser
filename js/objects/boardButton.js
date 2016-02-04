"use strict";
var app = app || {};

app.boardButton = function(){
    //parameter is a point that denotes starting position
    function boardButton(startPosition, width, height){
        this.position = startPosition;
        this.width = width;
        this.height = height;
        this.clicked = false;
        this.hovered = false;
    }
    boardButton.drawLib = undefined;
    
    var p = boardButton.prototype;
    
    p.draw = function(ctx){
        ctx.save();
        var col;
        if(this.hovered){
            col = "dodgerblue";
        }
        else{
            col = "lightblue";
        }
        //draw rounded container
        boardButton.drawLib.rect(ctx, this.position.x - this.width/2, this.position.y - this.height/2, this.width, this.height, col);
        
        ctx.restore();
    };
    
    return boardButton;
}();