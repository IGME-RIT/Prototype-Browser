"use strict";

var Point = require('../../common/Point.js');
var NodeLabel = require('./NodeLabel.js');

var TutorialState = {
    Locked: 0,
    Unlocked: 1,
    Completed: 2
};

//
function TutorialNode(JSONChunk) {
    this.data = JSONChunk;
    this.state = TutorialState.Locked;
    this.enabled = false;
    this.hasFocus = false;
    this.position = new Point(0, 0);
    this.label = new NodeLabel(this);
};

TutorialNode.prototype.draw = function(pCanvasState, pPainter) {
    pPainter.circle(pCanvasState.ctx, this.position.x, this.position.y, 50, "#fff", true, 5);
    this.label.draw(pCanvasState, pPainter);
};



module.exports  = TutorialNode;