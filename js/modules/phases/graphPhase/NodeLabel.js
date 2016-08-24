"use strict";

var Point = require('../../common/Point.js');
var TutorialNode = require('./TutorialNode.js');

var labelCornerSize = 6;
var fontSize = 12;
var font = fontSize+"px Arial";

//create a label to pair with a node
function NodeLabel(pTutorialNode) {
    this.node = pTutorialNode;
    
    this.title = this.node.data.title;
    
    this.position = new Point(
        this.node.position.x,
        this.node.position.y - this.node.size - 10);
};

NodeLabel.prototype.calculateTextFit = function(ctx) {
    ctx.save();
    ctx.font = font;
    var titleSize = ctx.measureText(this.title);
    ctx.restore();
    
    this.size = new Point(
        titleSize.width + labelCornerSize * 2,
        fontSize + labelCornerSize * 2);
};



NodeLabel.prototype.update = function (time) {

    
    //directly above node
    this.desiredPosition = new Point(
        this.node.position.x,
        this.node.position.y - this.node.size - 10);
    
    if(this.desiredPosition.x != this.position.x || this.desiredPosition.y != this.position.y) {
        //move towards desiredPosition
        var dif = new Point(
            this.desiredPosition.x - this.position.x,
            this.desiredPosition.y - this.position.y);
        
        var speedScalar = Math.sqrt(dif.x * dif.x + dif.y * dif.y) * time.deltaTime;

        var velocity = new Point(dif.x * speedScalar, dif.y * speedScalar);
        if(velocity.x * velocity.x < dif.x * dif.x) {
            this.position.x += velocity.x;
            this.position.y += velocity.y;
        }
        else {
            this.position.x = this.desiredPosition.x;
            this.position.y = this.desiredPosition.y;
        }
        
    }
    
}

NodeLabel.prototype.draw = function(pCanvasState, pPainter) {
    
    if(!this.size) {
        this.calculateTextFit(pCanvasState.ctx);
    }
    
    //draw line from node to label
    pCanvasState.ctx.save();
    pCanvasState.ctx.strokeStyle = "#fff";
    pCanvasState.ctx.lineWidth = 2;
    pCanvasState.ctx.beginPath();
    
    pCanvasState.ctx.moveTo(
        this.position.x,
        this.position.y);
    
    pCanvasState.ctx.lineTo(
        this.node.position.x,
        this.node.position.y - this.node.size);
    
    pCanvasState.ctx.closePath();
    pCanvasState.ctx.stroke();
    pCanvasState.ctx.restore();
    
    //draw label
    pPainter.roundedRect(
        pCanvasState.ctx,
        this.position.x - this.size.x / 2,
        this.position.y - this.size.y,
        this.size.x, this.size.y,
        labelCornerSize,
        true, this.node.color,
        true, "#fff", 2);
    
    
    pCanvasState.ctx.save();
    pCanvasState.ctx.fillStyle = "#fff";
    pCanvasState.ctx.font = font;
    pCanvasState.ctx.textBaseline = "top";
    pCanvasState.ctx.fillText(
        this.title,
        this.position.x - this.size.x/2 + labelCornerSize,
        this.position.y - this.size.y + labelCornerSize);
    pCanvasState.ctx.restore();
    
};



module.exports  = NodeLabel;