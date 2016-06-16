"use strict";

//parameter is a point that denotes starting position
function ExtensionNode(pName, pConnectionForward){
    this.data = {};
    this.data.name = pName;
    this.connectionForward = [];
    this.connectionForward.push(pConnectionForward);
}

ExtensionNode.prototype.draw = function(){
    
}

module.exports = ExtensionNode;