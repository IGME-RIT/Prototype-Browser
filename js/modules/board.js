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
        //!!!!! consider catching problem data here instead of further down
        stagingArray.push(new LessonNode(new Point(0, 0), pJSONData[i]));
    }
    
    //find and label the start points
    for(var i = 0; i < stagingArray.length; i++){
        //if a node has no connections, it must be a starting node
        if(stagingArray[i].data.connections.length === 0){
            stagingArray[i].placement = 0;
        }
        else{
            stagingArray[i].placement = -1;
        }
    }
    
    //set direct object connections to related nodes for referencing
    //parse entire list
    for(var i = 0; i < stagingArray.length; i++){
        stagingArray[i].connectionForward = [];
        stagingArray[i].connectionBackward = [];
        //compare against every other node
        for(var j = 0; j < stagingArray.length; j++){
            //compare against every connection
            for(var k = 0; k < stagingArray[j].data.connections.length; k++){
                if(stagingArray[j].data.connections[k] === stagingArray[i].data.name){
                    stagingArray[i].connectionForward.push(stagingArray[j]);
                }
            }
            //backwards
            for(var k = 0; k < stagingArray[i].data.connections.length; k++){
                if(stagingArray[j].data.name === stagingArray[i].data.connections[k]){
                    stagingArray[i].connectionBackward.push(stagingArray[j]);
                }
            }
        }
    }
    
    //assign placements to each node based on the connections they make to one another
    var completionFlag = false;
    while(!completionFlag){
        completionFlag = true;
        //for every node
        for(var i = 0; i < stagingArray.length; i++){
            //go through each node's connections
            for(var j = 0; j < stagingArray[i].connectionForward.length; j++){
                //node has not been assigned a placement yet
                if(stagingArray[i].connectionForward[j].placement === -1 && stagingArray[i].placement != -1){
                    //does this node have multiple backwards connections?
                    /*if(stagingArray[i].connectionBackward.length > 1){
                        /If yes, make sure that each backward connection is fulfilled before assigning values
                        var fulfilledFlag = true;
                        for(k = 0; k < stagingArray[i].connectionBackward.length; k++){
                            //-1 denotes that it has not yet been assigned a placement
                            if(stagingArray[i].connectionBackward[k].placement === -1){
                                fulfilledFlag = false;
                                break;
                            }
                        }
                        //as long as the flag remains true, assign value
                        if(fulfilledFlag){
                            stagingArray[i].connectionForward[j].placement = stagingArray[i].placement + 1;
                        }
                    }*/
                    //does the node after this node have multiple backwards connections?
                    if(stagingArray[i].connectionForward[j].connectionBackward.length > 1){
                        //If yes, make sure that each backward connection is fulfilled before assigning values
                        var fulfilledFlag = true;
                        for(k = 0; k < stagingArray[i].connectionForward[j].connectionBackward.length; k++){
                            //-1 denotes that it has not yet been assigned a placement
                            if(stagingArray[i].connectionForward[j].connectionBackward[k].placement === -1){
                                fulfilledFlag = false;
                                break;
                            }
                        }
                        //as long as the flag remains true, assign value
                        if(fulfilledFlag){
                            stagingArray[i].connectionForward[j].placement = stagingArray[i].placement + 1;
                        }
                    }
                    //if there are not multiple backward connections, everything is clear
                    else{
                        stagingArray[i].connectionForward[j].placement = stagingArray[i].placement + 1;
                    }
                }
                //node already has a placement
                else{
                    if(stagingArray[i].placement > stagingArray[i].connectionForward[j].placement){//this is bigger than that, keep this
                        stagingArray[i].connectionForward[j].placement = stagingArray[i].placement + 1;
                    }
                }
            }
            //a node with a placement of -1 has not yet had an assignment
            if(stagingArray[i].placement === -1){
                //this is designed to catch "bad nodes" caused by improperly entered data. Doesn't count "bad" nodes against completion
                if(stagingArray[i].connectionForward.length !== 0 && stagingArray[i].connectionBackward.length !== 0){
                    completionFlag = false;
                }
            }
        }
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
};

var _generateNodeArray = function (pStagingArray, pStartArray) {
    var nodeArrayExport;
    
    for(var i = 0; i < pStartArray.length; i++){
        _connect(pStagingArray[i], nodeArrayExport);
    }
    
    
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
            for(var k = 0; k < subArray[j].connectionForward.length; k++){
                painter.line(ctx, subArray[j].connectionForward[k].position.x, subArray[j].connectionForward[k].position.y, subArray[j].position.x, subArray[j].position.y, 3, "black");
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