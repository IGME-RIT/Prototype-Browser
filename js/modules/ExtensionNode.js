"use strict";
var DrawLib = require('./drawLib.js');

var painter;
var sourceNode;

//parameter is a point that denotes starting position
function ExtensionNode(pName, pConnectionForward, pSource){
    painter = new DrawLib();
    sourceNode = pSource;
    
    this.data = {};
    //this.data._id = pSource.data._id;
    this.highlighted = false;
    //this.data.name = pName;
    this.connectionForward = [];
    this.connectionForward.push(pConnectionForward);
    this.connectionBackward = [];
    this.connectionBackward.push(pSource);
    this.type = "extension";
}

ExtensionNode.prototype.setStatus = function(pStatus){
    this.status = this.connectionBackward[0].status;
    this.connectionForward[0].setStatus(pStatus)
}

ExtensionNode.prototype.draw = function(pCanvasState){
    pCanvasState.ctx.save();
        if(this.highlighted){
            pCanvasState.ctx.shadowColor = '#0066ff';
            pCanvasState.ctx.shadowBlur = 7;
            if(this.connectionForward[0].type === "extension"){
                this.connectionForward[0].highlighted = true;
            }
        }
    else{
        if(this.connectionForward[0].type === "extension"){
            this.connectionForward[0].highlighted = false;
        }
    }
    
    if(this.connectionBackward[0].status === "2" || this.connectionBackward[0].status === "4"){
        painter.line(pCanvasState.ctx, this.position.x, this.position.y, this.connectionForward[0].position.x, this.connectionForward[0].position.y, 2, "black");
    }
    
    pCanvasState.ctx.restore();
}

module.exports = ExtensionNode;