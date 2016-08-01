//Contains canvas related variables in a single easy-to-pass object
"use strict";
function CanvasState(ctx, center, activeWidth, activeHeight, scaleFactor){
    this.ctx = ctx;
    this.center = center;
    this.activeWidth = activeWidth;
    this.activeHeight = activeHeight;
    this.scaleFactor = scaleFactor;
    
    this.totalHeight = center.y + activeHeight/2;
}

CanvasState.prototype.update = function(ctx, center, activeWidth, activeHeight, scaleFactor){
    this.ctx = ctx;
    this.center = center;
    this.activeWidth = activeWidth;
    this.activeHeight = activeHeight;
    this.scaleFactor = scaleFactor;
    
    this.totalHeight = center.y + activeHeight/2;
}

module.exports = CanvasState;