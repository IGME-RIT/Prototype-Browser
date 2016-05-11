"use strict";

var imageLoaded;

//parameter is a point that denotes starting position
function lessonNode(startPosition, JSONChunk){
    imageLoaded = false;
    
    this.position = startPosition;
    this.mouseOver = false;
    this.scaleFactor = 1;
    this.type = "lessonNode";
    this.data = JSONChunk;
    //this.width = 100;
    //this.height = 100;
    
    //image loading and resizing
    var tempImage = new Image();
    tempImage.src = JSONChunk.image.icon;
    
    if(tempImage.complete){
        p.loadAction(tempImage);
    }
    else{
        tempImage.addEventListener('load', p.loadAction(tempImage));
        tempImage.addEventListener('error', errorAction);
    }
}

var p = lessonNode.prototype;

p.loadAction = function(pTempImage){
    this.image = pTempImage;
    this.width = pTempImage.naturalWidth;
    this.height = pTempImage.naturalHeight;
    
    var maxDimension = 100;
    
    if(this.width < maxDimension && this.height < maxDimension){
        var x;
        if(this.width > this.height){
            x = maxDimension / this.width;
        }
        else{
            x = maxDimension / this.height;
        }
        this.width = this.width * x;
        this.height = this.height * x;
    }
    if(this.width > maxDimension || this.height > maxDimension){
        var x;
        if(this.width > this.height){
            x = this.width / maxDimension;
        }
        else{
            x = this.height / maxDimension;
        }
        this.width = this.width / x;
        this.height = this.height / x;
    }
    
    imageLoaded = true;
}
function errorAction(){
    //alert("There was an error loading an image. Whoops");
}

lessonNode.drawLib = undefined;



p.draw = function(ctx){
    if(imageLoaded === true){
        //lessonNode.drawLib.circle(ctx, this.position.x, this.position.y, 10, "red");
        //draw the image, shadow if hovered
        ctx.save();
        /*
        if(this.mouseOver){
            ctx.shadowColor = 'dodgerBlue';
            ctx.shadowBlur = 20;
        }
        */
        ctx.drawImage(this.image, this.position.x - (this.width*this.scaleFactor)/2, this.position.y - (this.height*this.scaleFactor)/2, this.width * this.scaleFactor, this.height * this.scaleFactor)

        ctx.restore();
    }
    
};

p.click = function(){
    document.getElementById("detailLayer").className = "visible";
}

module.exports = lessonNode;