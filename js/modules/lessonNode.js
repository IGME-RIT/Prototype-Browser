"use strict";
var Button = require('./button.js');

var position;
var width;
var height;
var button;
var image;

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
}

lessonNode.drawLib = undefined;

var p = lessonNode.prototype;

p.draw = function(ctx, scaleFactor){
    //lessonNode.drawLib.circle(ctx, this.position.x, this.position.y, 10, "red");
    //draw the image, shadow if hovered
    ctx.save();
    ctx.drawImage(image, position.x, position.y, width, height)
    
    if(button.hovered){
        
    }
    ctx.restore();
};

module.exports = lessonNode;