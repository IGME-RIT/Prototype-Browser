"use strict";

//parameter is a point that denotes starting position
function lessonNode(startPosition, imagePath){
    this.position = startPosition;
    this.width = 100;
    this.height = 100;
    this.mouseOver = false;
    this.scaleFactor = 1;
    this.type = "lessonNode";
    
    //image loading
    var tempImage = new Image();
    try{
        tempImage.src = imagePath;
        this.image = tempImage;
    }
    catch (e) {
        tempImage.src = "images/dog.png";
        this.image = tempImage;
    }
}

lessonNode.drawLib = undefined;

var p = lessonNode.prototype;

p.draw = function(ctx){
    //lessonNode.drawLib.circle(ctx, this.position.x, this.position.y, 10, "red");
    //draw the image, shadow if hovered
    ctx.save();
    if(this.mouseOver){
        //ctx.shadowOffsetX = 10;
        //ctx.shadowOffsetY = 10;
        ctx.shadowColor = 'dodgerBlue';
        ctx.shadowBlur = 20;
    }
    ctx.drawImage(this.image, this.position.x - (this.width*this.scaleFactor)/2, this.position.y - (this.height*this.scaleFactor)/2, this.width * this.scaleFactor, this.height * this.scaleFactor)
    
    ctx.restore();
};

module.exports = lessonNode;