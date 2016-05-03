//keeps track of mouse related variables.
//calculated in main and passed to game
//contains up state
//position
//relative position
//on canvas
"use strict";
function mouseState(pPosition, pRelativePosition, pMousedown, pMouseIn){
    this.position = pPosition;
    this.relativePosition = pRelativePosition;
    this.mouseDown = pMousedown;
    this.mouseIn = pMouseIn;
    
    //tracking previous mouse states
    this.lastPosition = pPosition;
    this.lastRelativePosition = pRelativePosition;
    this.lastMouseDown = pMousedown;
    this.lastMouseIn = pMouseIn;
}

var p = mouseState.prototype;

module.exports = mouseState;