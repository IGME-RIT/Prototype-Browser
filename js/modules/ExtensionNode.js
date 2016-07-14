"use strict";
var DrawLib = require('./drawLib.js');

var painter;
var sourceNode;

//parameter is a point that denotes starting position
function ExtensionNode(pName, pConnectionForward, pSource){
    painter = new DrawLib();
    sourceNode = pSource;
    
    this.data = {};
    this.highlighted = false;
    this.data.name = pName;
    this.connectionForward = [];
    this.connectionForward.push(pConnectionForward);
    this.type = "extension";
}

ExtensionNode.prototype.setStatus = function(pStatus){
    this.status = pStatus;
    this.connectionForward[0].setStatus(this.status)
}

ExtensionNode.prototype.draw = function(ctx){
    ctx.save();
        if(this.highlighted){
            ctx.shadowColor = '#0066ff';
            ctx.shadowBlur = 7;
            if(this.connectionForward[0].type === "extension"){
                this.connectionForward[0].highlighted = true;
            }
        }
    else{
        if(this.connectionForward[0].type === "extension"){
            this.connectionForward[0].highlighted = false;
        }
    }
        //draw lines as part of the lessonNode
        //for(var i = 0; i < this.connectionForward.length; i++){
    if(sourceNode.status === 2){
        painter.line(ctx, this.position.x, this.position.y, this.connectionForward[0].position.x, this.connectionForward[0].position.y, 2, "black");
    }
            
        //}
    ctx.restore();
}

module.exports = ExtensionNode;