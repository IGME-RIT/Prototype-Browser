"use strict";
var DrawLib = require('../../libraries/Drawlib.js');
var TutorialNode = require('./TutorialNode.js');
var Point = require('../../common/Point.js');


var painter;

var nodeArray;

function Graph(pJSONData) {
    painter = new DrawLib();
    
    
    var stagingArray = [];
    
    //populate the array
    for(var i = 0; i < pJSONData.length; i++){
        //ensures that the chunk contains image data
        if(pJSONData[i].image !== undefined){
            var testread = pJSONData[i].image;
            stagingArray.push(new TutorialNode(pJSONData[i]));
        }
    }
    
    this.nodeArray = stagingArray;
    /*
    //find and label the start points
    for(var i = 0; i < stagingArray.length; i++){
        //if a node has no connections, it must be a starting node
        if(stagingArray[i].data.connections.length === 0){
            stagingArray[i].placement = 0;
        }
        else{
            stagingArray[i].placement = -1;
        }
    }*/
    
    
    /*
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
    }*/
    
};

Graph.prototype.draw = function(canvasState) {
    canvasState.ctx.save();
    //translate to the center of the screen
    canvasState.ctx.translate(canvasState.center.x, canvasState.center.y);
    //draw nodes
    //for(var i = 0; i < this.nodeArray.length; i++){
       // var subArray = this.nodeArray[i];
        //for(var j = 0; j < subArray.length; j++){
            this.nodeArray[0].draw(canvasState, painter);
        //}
    //}
    canvasState.ctx.restore();
    //console.log("nodes drawn: "+this.nodeArray.length);
    
};

module.exports = Graph;