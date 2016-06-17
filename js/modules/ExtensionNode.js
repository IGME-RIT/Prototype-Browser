"use strict";
var DrawLib = require('./drawLib.js');

var painter;

//parameter is a point that denotes starting position
function ExtensionNode(pName, pConnectionForward){
    painter = new DrawLib();
    
    this.data = {};
    this.highlighted = false;
    this.data.name = pName;
    this.connectionForward = [];
    this.connectionForward.push(pConnectionForward);
    this.type = "extension";
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
        for(var i = 0; i < this.connectionForward.length; i++){
            painter.line(ctx, this.position.x, this.position.y, this.connectionForward[i].position.x, this.connectionForward[i].position.y, 2, "black");
        }
    ctx.restore();
}

module.exports = ExtensionNode;