"use strict";
var app = app || {};

app.lessonNode = function(){
    //parameter is a point that denotes starting position
    function lessonNode(startPosition, imagePath){
        this.position = startPosition;
        this.width = 100;
        this.height = 100;
        this.boardButton = new app.boardButton(this.position, this.width,this.height);
        
        //image loading
        var tempImage = new Image();
        try{
            tempImage.src = imagePath;
            this.image = tempImage;
        }
        catch {
            image.src = this.app.Images['exampleImage'];
            this.image = tempImage;
        }
    }
    
    lessonNode.drawLib = undefined;
    
    var p = lessonNode.prototype;
    
    p.draw = function(ctx, scaleFactor){
        //lessonNode.drawLib.circle(ctx, this.position.x, this.position.y, 10, "red");
        this.boardButton.draw(ctx);
    };
    
    return lessonNode;
}();