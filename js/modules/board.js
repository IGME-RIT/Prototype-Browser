"use strict";
var DrawLib = require('./drawLib.js');
var LessonNode = require('./lessonNode.js');
var Point = require('./point.js');

var painter;

//parameter is a point that denotes starting position
function board(pStartPosition, pJSONData){
    this.position = pStartPosition;
    
    var tempNodeArray = [];
    
    //populate the array
    for(var i = 0; i < pJSONData.length; i++){
        tempNodeArray.push(new LessonNode(new Point(0, 0), pJSONData[i]));
    }
    
    //set start points to processed as well as placeholder placements
    for(var i = 0; i < tempNodeArray.length; i++){
        tempNodeArray[i].processed = false;
        if(tempNodeArray[i].data.connections.length === 0){
            tempNodeArray[i].placement = 0;
            tempNodeArray[i].processed = true;
        }
        else{
            tempNodeArray[i].placement = -1;
        }
    }
    
    //set live connections to each node that can be easily referenced
    for(var i = 0; i < tempNodeArray.length; i++){
        tempNodeArray[i].liveConnections = [];
        for(var j = 0; j < tempNodeArray[i].data.connections.length; j++){
            for(var k = 0; k < tempNodeArray.length; k++){
                if(tempNodeArray[i].data.connections[j] === tempNodeArray[k].data.name){
                    tempNodeArray[i].liveConnections[j] = tempNodeArray[k];
                    break; 
                }
            }
        }
    }
    
    //determine placement of each node based on connections
    var completenessFlag = false;
    while(completenessFlag === false){
        completenessFlag = true;
        for(var i = 0; i < tempNodeArray.length; i++){
            if(tempNodeArray[i].processed === false){
                for(var k = 0; k < tempNodeArray[i].liveConnections.length; k++){
                    var tempMarker = tempNodeArray[i].liveConnections[k].placement;
                    if(tempNodeArray[i].liveConnections[k].placement !== -1){
                        tempNodeArray[i].placement = tempNodeArray[i].liveConnections[k].placement + 1;
                    }
                    else{
                        completenessFlag = false;
                    }
                }
            }    
        }
    }
    
    
    //assign point values that place nodes in proper positions
    var greatestWidth = 0;
    for(var i = 0; i < tempNodeArray.length; i++){
        if(tempNodeArray[i].placement > greatestWidth){
            greatestWidth = tempNodeArray[i].placement;
        }
    }
    
    //create and populate 2d array
    this.nodeArray = [];
    for(var i = 0; i < greatestWidth + 1; i++){
        var subArray = [];
        for(var j = 0; j < tempNodeArray.length; j++){
            if(tempNodeArray[j].placement === i){
                subArray.push(tempNodeArray[j]);
            }
        }
        this.nodeArray[i] = subArray;
    }
    
    //assign positions based on placement in the 2d array
    for(var i = 0; i < this.nodeArray.length; i++){
        var subArray = this.nodeArray[i];
        for(var j = 0; j < subArray.length; j++){
            //assign position values
            this.nodeArray[i][j].position = new Point(i * 280, j * 280 - (((subArray.length - 1) * 280) / 2));
        }
    }
    
    
    
    painter = new DrawLib();
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
    //draw connections
    for(var i = 0; i < this.nodeArray.length; i++){
        var subArray = this.nodeArray[i];
        for(var j = 0; j < subArray.length; j++){
            for(var k = 0; k < subArray[j].liveConnections.length; k++){
                painter.line(ctx, subArray[j].liveConnections[k].position.x, subArray[j].liveConnections[k].position.y, subArray[j].position.x, subArray[j].position.y, 3, "black");
            }
        }
    }
    
    
    //draw nodes
    for(var i = 0; i < this.nodeArray.length; i++){
        var subArray = this.nodeArray[i];
        for(var j = 0; j < subArray.length; j++){
            this.nodeArray[i][j].draw(ctx);
        }
    }
    ctx.restore();
};

module.exports = board;
    