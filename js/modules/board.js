"use strict";
var DrawLib = require('./drawLib.js');
var LessonNode = require('./lessonNode.js');
var Point = require('./point.js');

var painter;

//parameter is a point that denotes starting position
function board(pStartPosition, pJSONData){
    this.position = pStartPosition;
    
    var stagingArray = [];
    
    //populate the array
    for(var i = 0; i < pJSONData.length; i++){
        stagingArray.push(new LessonNode(new Point(0, 0), pJSONData[i]));
    }
    
    //create variables that will be used to make the 2d array
    var nodeArray = [];
    var firstSubArray = [];
    
    //find and label the start points and put them into the firstSubArray of the nodeArray
    for(var i = 0; i < stagingArray.length; i++){
        //if a node has no connections, it must be a starting node
        if(stagingArray[i].data.connections.length === 0){
            firstSubArray.push(stagingArray[i]);
            stagingArray[i].start = true;
        }
        else{
            stagingArray[i].start = false;
        }
    }
    nodeArray[0] = firstSubArray;
    
    //set direct object "liveConnections" to the next node for referencing based on their connections
    //parse entire list
    for(var i = 0; i < stagingArray.length; i++){
        stagingArray[i].liveConnections = [];
        //compare against every other node
        for(var j = 0; j < stagingArray.length; j++){
            //compare against every connection
            for(var k = 0; k < stagingArray[j].data.connections.length; k++){
                if(stagingArray[j].data.connections[k] === stagingArray[i].data.name){
                    stagingArray[i].liveConnections.push(stagingArray[j]);
                }
            }
        }
    }
    
    //working from front
    
    
    
    /*
    //determine placement of each node based on connections
    var completenessFlag = false;
    while(completenessFlag === false){
        completenessFlag = true;
        for(var i = 0; i < stagingArray.length; i++){
            if(stagingArray[i].processed === false){
                for(var k = 0; k < stagingArray[i].liveConnections.length; k++){
                    var tempMarker = stagingArray[i].liveConnections[k].placement;
                    if(stagingArray[i].liveConnections[k].placement !== -1){
                        stagingArray[i].placement = stagingArray[i].liveConnections[k].placement + 1;
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
    for(var i = 0; i < stagingArray.length; i++){
        if(stagingArray[i].placement > greatestWidth){
            greatestWidth = stagingArray[i].placement;
        }
    }
    
    //create and populate 2d array
    this.nodeArray = [];
    for(var i = 0; i < greatestWidth + 1; i++){
        var subArray = [];
        for(var j = 0; j < stagingArray.length; j++){
            if(stagingArray[j].placement === i){
                subArray.push(stagingArray[j]);
            }
        }
        this.nodeArray[i] = subArray;
    }*/
    //this.nodeArray = _generateNodeArray(stagingArray);
    
    
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

var _generateNodeArray = function (pInput) {
    var nodeArrayExport;
    
    pTest = [];
    return nodeArrayExport;
};


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
    