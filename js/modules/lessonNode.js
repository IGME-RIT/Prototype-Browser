"use strict";

//parameter is a point that denotes starting position
function lessonNode(startPosition, JSONChunk){
    this.imageLoaded = false;
    
    this.position = startPosition;
    this.mouseOver = false;
    this.scaleFactor = 1;
    this.type = "lessonNode";
    this.data = JSONChunk;
    
    //image loading and resizing
    var tempImage = new Image();
    
    tempImage.addEventListener('load', _loadAction.bind(this), false);
    tempImage.addEventListener('error', _errorAction);
    
    tempImage.src = JSONChunk.image.icon;
}


var _loadAction = function (e) {
    this.image = e.target;
    this.width = e.target.naturalWidth;
    this.height = e.target.naturalHeight;
    
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
    
    this.imageLoaded = true;
};
var _errorAction = function(e){
    alert("There was an error loading an image.");
};

lessonNode.prototype.draw = function(ctx){
    if(this.imageLoaded){
        //draw the image, shadow if hovered
        ctx.save();
        if(this.mouseOver){
            ctx.shadowColor = 'dodgerBlue';
            ctx.shadowBlur = 20;
        }
        ctx.drawImage(this.image, this.position.x - (this.width*this.scaleFactor)/2, this.position.y - (this.height*this.scaleFactor)/2, this.width * this.scaleFactor, this.height * this.scaleFactor)

        ctx.restore();
    }
    
};

lessonNode.prototype.click = function(){
    //set detailWindow values here
    
    document.getElementById("detailLayer").className = "visible";
    
    document.getElementById("dwBannerTitle").innerHTML = this.data.title;
    document.getElementById("dwDescriptionText").innerHTML = this.data.description;
};

module.exports = lessonNode;