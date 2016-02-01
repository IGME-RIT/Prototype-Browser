"use strict";
var app = app || {};

app.lessonNode = function(){
    //parameter is a point that denotes starting position
    function lessonNode(startPosition){
        this.position = startPosition;
    }
    
    lessonNode.drawLib = undefined;
    
    var p = lessonNode.prototype;
    
    p.draw = function(ctx, gridOffsetX, gridOffsetY){
        lessonNode.drawLib.circle(ctx, gridOffsetX + this.position.x, gridOffsetY + this.position.y, 10, "red");
    };
    
    return lessonNode;
}();