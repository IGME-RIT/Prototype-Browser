//keeps track of mouse related variables.
//calculated in main and passed to game
//contains up state
//position
//relative position
//on canvas
"use strict";
function mouseState(pPosition, pRelativePosition, pMousedown){
    this.position = pPosition;
    this.relativePosition = pRelativePosition;
    this.mouseDown = pMousedown;
}

var p = mouseState.prototype;

module.exports = mouseState;