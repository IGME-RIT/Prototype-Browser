"use strict";
function CanvasState(ctx, center, activeHeight, scaleFactor){
    this.ctx = ctx;
    this.relativePosition = pRelativePosition;
    this.mouseDown = pMouseDown;
    this.mouseIn = pMouseIn;
    
}

CanvasState.prototype.update = function(pPosition, pRelativePosition, pMouseDown, pMouseIn){
    this.lastPosition = this.position;
    this.lastRelativePosition = this.relativePosition;
    this.lastMouseDown = this.mouseDown;
    this.lastMouseIn = this.mouseIn;
    
    this.position = pPosition;
    this.relativePosition = pRelativePosition;
    this.mouseDown = pMouseDown;
    this.mouseIn = pMouseIn;
}

module.exports = CanvasState;