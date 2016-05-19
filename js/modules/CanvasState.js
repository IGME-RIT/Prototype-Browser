"use strict";
function CanvasState(ctx, center, activeWidth, activeHeight, scaleFactor){
    this.ctx = ctx;
    this.center = center;
    this.activeWidth = activeWidth;
    this.activeHeight = activeHeight;
    this.scaleFactor = scaleFactor;
}

CanvasState.prototype.update = function(ctx, center, activeWidth, activeHeight, scaleFactor){
    this.ctx = ctx;
    this.center = center;
    this.activeWidth = activeWidth;
    this.activeHeight = activeHeight;
    this.scaleFactor = scaleFactor;
}

module.exports = CanvasState;