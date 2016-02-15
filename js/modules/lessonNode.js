"use strict";
var Button = require('./button.js');

var position;
var width;
var height;
var button;
var image;
var scaleFactor;

//parameter is a point that denotes starting position
function lessonNode(startPosition, imagePath){
    position = startPosition;
    width = 100;
    height = 100;
    button = new Button(position, width, height);
    
    //image loading
    var tempImage = new Image();
    try{
        tempImage.src = imagePath;
        image = tempImage;
    }
    catch (e) {
        tempImage.src = "images/dog.png";
        image = tempImage;
    }
    
    scaleFactor = 2;
}

lessonNode.drawLib = undefined;

var p = lessonNode.prototype;

p.draw = function(ctx){
    //lessonNode.drawLib.circle(ctx, this.position.x, this.position.y, 10, "red");
    //draw the image, shadow if hovered
    ctx.save();
    if(button.hovered){
        //ctx.shadowOffsetX = 10;
        //ctx.shadowOffsetY = 10;
        ctx.shadowColor = 'blue';
        ctx.shadowBlur = 30;
    }
    ctx.drawImage(image, position.x - (width*scaleFactor)/2, position.y - (height*scaleFactor)/2, width * scaleFactor, height * scaleFactor)
    
    
    ctx.restore();
};

module.exports = lessonNode;