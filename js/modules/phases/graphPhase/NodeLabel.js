"use strict";

var Point = require('../../common/Point.js');
var TutorialNode = require('./TutorialNode.js');

var labelCornerSize = 6;
var labelColor = "#f00";
var fontSize = 20;
var font = fontSize+"px Arial";

//create a label to pair with a node
function NodeLabel(pTutorialNode) {
    this.node = pTutorialNode;
    this.enabled = false;
    this.title = this.node.data.title;
    this.labelSize = new Point(0, 0);
};

NodeLabel.prototype.calculateTextFit = function(ctx) {
    ctx.save();
    ctx.font = font;
    var titleSize = ctx.measureText(this.title);
    this.labelSize = new Point(
        titleSize.width + labelCornerSize * 2,
        fontSize + labelCornerSize * 2);
    console.log(titleSize.height);
    ctx.restore();
}

NodeLabel.prototype.draw = function(pCanvasState, pPainter) {
    //if the width of the box is 0, we need to calculate its dimensions
    if (this.labelSize.x == 0) {
        this.calculateTextFit(pCanvasState.ctx);
    }
    
    
    this.xoffset = this.node.position.x;
    this.yoffset = this.node.position.y;
    
    pPainter.roundedRect(pCanvasState.ctx, this.xoffset, this.yoffset, this.labelSize.x, this.labelSize.y, labelCornerSize, 2, true, labelColor, true, "#888");
    
    
    pCanvasState.ctx.save();
    pCanvasState.ctx.fillStyle = "#fff";
    pCanvasState.ctx.font = font;
    pCanvasState.ctx.textBaseline = "top";
    pCanvasState.ctx.fillText(this.title, this.xoffset + labelCornerSize , this.yoffset + labelCornerSize);
    pCanvasState.ctx.restore();
    
};



module.exports  = NodeLabel;