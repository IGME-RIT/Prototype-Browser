"use strict";

//parameter is a point that denotes starting position
function Actor(startPosition){
    this.imageLoaded = false;
    
    this.position = startPosition;
    this.mouseOver = false;
    this.scaleFactor = 1;
    this.type = "lessonNode";
    this.data = JSONChunk;
    
    this.placement = 1;
    
    //image loading and resizing
    var tempImage = new Image();
    
    tempImage.addEventListener('load', _loadAction.bind(this), false);
    tempImage.addEventListener('error', _errorAction.bind(this), false);
    
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
    //alert("There was an error loading an image.");
    this.image = new Image();
    this.image.src = "../assets/ui/missingThumbnail.gif";
    this.width = 100;
    this.height = 100;
    this.imageLoaded = true;
};

Actor.prototype.draw = function(ctx){
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

Actor.prototype.click = function(){
    //set detailWindow values here
    
    document.getElementById("detailLayer").className = "visible";
    
    document.getElementById("dwBannerTitle").innerHTML = this.data.title;
    document.getElementById("dwBannerImage").src = this.data.image.banner;
    
    var tagText = "";
    for(var i = 0; i < this.data.tags.length; i++){
        tagText += "<div class=\"dwTag\">" + this.data.tags[i] + "</div>";
    }
    
    document.getElementById("dwTags").innerHTML = tagText;
    document.getElementById("dwDescriptionText").innerHTML = this.data.description;
    
    document.getElementById("dwAuthor").innerHTML = "<a href=\"https://github.com/" + this.data.author.github + "\" target=\"_blank\">" + this.data.author.name + "</a><div>" + this.data.author.email + "</div>";
};

module.exports = Actor;