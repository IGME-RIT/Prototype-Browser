"use strict";

//parameter is a point that denotes starting position
function board(startPosition, lessonNodes){
    this.position = startPosition;
    this.nodeArray = lessonNodes;
    this.lessonNodeConnections = [];
    
    //manage lessonNode stuff here
    
    //set connections here
    //iterate through every lessonNode
    /*for(var i = 0; i < this.lessonNodeArray.length; i++){
        //for every connection
        for(var j = 0; this.lessonNodeArray[i].data.connections.length; j++){
            //check against every lessonNode
            for(var k = 0; this.lessonNodeArray.length; k++){
                //exclude the current lessonNode
                if(i != k){
                    //check for matching name
                    //if(this. this.lessonNodeArray.data.name){
                        
                    //}
                }
            }
        }
    }*/
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
    for(var i = 0; i < this.nodeArray.length; i++){
        var subArray = this.nodeArray[i];
        for(var j = 0; j < subArray.length; j++){
            this.nodeArray[i][j].draw(ctx);
        }
    }
    ctx.restore();
};

module.exports = board;
    