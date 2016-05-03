//keeps track of mouse related variables.
//calculated in main and passed to game
//contains up state
//position
//relative position
//on canvas
"use strict";
function mouseState(pPosition, pRelativePosition, pMouseDown, pMouseIn){
    this.position = pPosition;
    this.relativePosition = pRelativePosition;
    this.mouseDown = pMouseDown;
    this.mouseIn = pMouseIn;
    
    //tracking previous mouse states
    this.lastPosition = pPosition;
    this.lastRelativePosition = pRelativePosition;
    this.lastMouseDown = pMouseDown;
    this.lastMouseIn = pMouseIn;
}

var p = mouseState.prototype;

p.update = function(pPosition, pRelativePosition, pMouseDown, pMouseIn){
    this.lastPosition = this.position;
    this.lastRelativePosition = this.relativePosition;
    this.lastMouseDown = this.mousedown;
    this.lastMouseIn = this.mouseIn;
    
    this.position = pPosition;
    this.relativePosition = pRelativePosition;
    this.mouseDown = pMouseDown;
    this.mouseIn = pMouseIn;
}

module.exports = mouseState;