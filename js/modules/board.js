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
        //ensures that the chunk contains image data
        if(pJSONData[i].image !== undefined){
            var testread = pJSONData[i].image;
            stagingArray.push(new LessonNode(new Point(0, 0), pJSONData[i]));
        }
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
        var debugText = stagingArray[i].data.name;
        stagingArray[i].connectionForward = [];
        stagingArray[i].connectionBackward = [];
        //compare against every other node
        for(var j = 0; j < stagingArray.length; j++){
            var debugText2 = stagingArray[j].data.name;
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
    var debugCounter = 0;
    while(!completionFlag){
        completionFlag = true;
        //iterate through every node
        for(var i = 0; i < stagingArray.length; i++){
            //go through that node's forward connections
            var debugName = stagingArray[i].data.title;
            for(var j = 0; j < stagingArray[i].connectionForward.length; j++){
                //if that forward node's placement has a value of -1, it has not been assigned a placement value yet
                //also checks to ensure that the current node has a value
                if(stagingArray[i].connectionForward[j].placement === -1 && stagingArray[i].placement !== -1){
                    //does the forward node have multiple backwards connections?
                    if(stagingArray[i].connectionForward[j].connectionBackward.length > 1){
                        //if the forward node has multiple backwards connections yes, ensure that each is fulfilled before assigning values
                        var fulfilledFlag = true;
                        //used to store the highest placement value of backwards connections
                        var highestValue = 0;
                        for(k = 0; k < stagingArray[i].connectionForward[j].connectionBackward.length; k++){
                            //-1 denotes that it has not yet been assigned a placement
                            if(stagingArray[i].connectionForward[j].connectionBackward[k].placement === -1){
                                fulfilledFlag = false;
                                break;
                            }
                            //assigns the highest placement variable in the set of the backwards connections to highest value variable
                            if(stagingArray[i].connectionForward[j].connectionBackward[k].placement > highestValue){
                                highestValue = stagingArray[i].connectionForward[j].connectionBackward[k].placement;
                            }
                        }
                        //if the flag remains true at this point, it is safe to assign a placement value
                        if(fulfilledFlag){
                            //the highest valued placement of backwards connections will be used
                            stagingArray[i].connectionForward[j].placement = highestValue + 1;
                        }
                    }
                    //if the forward node does not have multiple backward connections, everything is clear to assign a value
                    else{
                        //the current node's placement +1 is given
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
        //will leave as a catch so that it will pass instead of crashing if there is a data error
        debugCounter++;
        if(debugCounter > 100000){
            completionFlag = true;
        }
    }
    
    //determine furthest placement
    var furthestPlacement = 0;
    for(var i = 0; i < stagingArray.length; i++){
        if(stagingArray[i].placement > furthestPlacement){
            furthestPlacement = stagingArray[i].placement;
        }
    }
    
    //create and populate 2d array based on staging array data
    var nodeArray = [];
    for(var i = 0; i < furthestPlacement + 1; i++){
        var subArray = [];
        for(var j = 0; j < stagingArray.length; j++){
            if(stagingArray[j].placement === i){
                subArray.push(stagingArray[j]);
            }
        }
        nodeArray[i] = subArray;
    }
    
    //add extensionNodes that will be used for nodes that connect to a node not directly subsequent
    
    //alphabetize the arrays using string sorting array method
    for(var i = 0; i < nodeArray.length; i++){
        nodeArray[i].sort(function compare(a,b) {
            if (a.data.name < b.data.name) { return -1; }
            else if (a.data.name > b.data.name) { return 1; }
            else {return 0;}
        });
    }
    
    //assign pixel point positions based on placement in the 2d array
    for(var i = 0; i < nodeArray.length; i++){
        var subArray = nodeArray[i];
        for(var j = 0; j < subArray.length; j++){
            //assign position values
            nodeArray[i][j].position = new Point(i * 280, j * 280 - (((subArray.length - 1) * 280) / 2));
        }
    }
    
    //sort the array to increase visual efficiency, parse through each subArray
    for(var i = 0; i < nodeArray.length - 1; i++){
        var subArray = nodeArray[i];
        //parse through each element vertically
        for(var j = 0; j < subArray.length; j++){
            //parse through each forward connection
            for(var k = 0; k < subArray[j].connectionForward.length; k++){
                
                //parse through the next array
            }
        }
    }
    
    this.nodeArray = nodeArray;
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