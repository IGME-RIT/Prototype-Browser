"use strict";
var Point = require('../point.js');
var DrawLib = require('../drawLib.js');
var Utilities = require('../utilities.js');

var utility;
var painter;

var mapLoaded;
var primaryImage;
var activeLocation;

var mouseState;
var mouseTarget;



function mapPhase(pMapName, pMapStep, pActiveLocation){
    mapLoaded = false;
    mouseTarget = 0;
    
    activeLocation = pActiveLocation;
    
    painter = new DrawLib();
    utility = new Utilities();
    
    var tempImage = new Image();
    tempImage.src = "../../../assets/maps/" + pMapName + ".jpg";
    if(tempImage.complete){
        mapPhase.prototype.loadAction(tempImage);
    }
    else{
        tempImage.addEventListener('load', p.loadAction(tempImage));
        tempImage.addEventListener('error', errorAction);
    }
}

mapPhase.prototype.loadAction = function(pTempImage){
    this.image = pTempImage;
    
    mapLoaded = true;
}
function errorAction(){
    //alert("There was an error loading an image. Whoops");
}

//passing context, canvas, delta time, center point, usable height, mouse state
mapPhase.prototype.update = function(ctx, canvas, dt, center, activeHeight, pMouseState){
    mouseState = pMouseState;
    if(mapLoaded){
        p.act(canvas);
        //context, center point, usable height
        p.draw(ctx, center, activeHeight);
    }
}

mapPhase.prototype.act = function(canvas){
    this.width = canvas.offsetWidth;
    this.height = this.width * .5625;
    
    document.querySelector('#debugLine').innerHTML = "mousePosition: x = " + mouseState.relativePosition.x + ", y = " + mouseState.relativePosition.y + 
    "<br>Current Clicked = " + mouseState.mouseDown + 
    "<br>Last Clicked = " + mouseState.lastMouseDown + 
    "<br>MouseTarget = " + mouseTarget + 
    "<br>Over Canvas = " + mouseState.mouseIn;
}

mapPhase.prototype.draw = function(ctx, center, activeHeight){
    ctx.save();
    //centerize all drawing 
    ctx.translate(center.x, center.y);
    //draw background
    ctx.drawImage(this.image, -1 * (this.width)/2, -1 * (this.height)/2, this.width, this.height)
    //draw actors
    
    ctx.restore();
}


module.exports = mapPhase;