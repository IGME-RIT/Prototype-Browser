"use strict";
var Point = require('../point.js');
var DrawLib = require('../drawLib.js');
var Utilities = require('../utilities.js');

var utility;
var painter;

var sceneLoaded;
var primaryImage;

var mouseState;
var mouseTarget;


function scenePhase(pSceneName, pSceneStep){
    sceneLoaded = false;
    mouseTarget = 0;
    
    painter = new DrawLib();
    utility = new Utilities();
    
    var tempImage = new Image();
    tempImage.src = "../../../assets/scenes/" + pSceneName + ".jpg";
    if(tempImage.complete){
        p.loadAction(tempImage);
    }
    else{
        tempImage.addEventListener('load', p.loadAction(tempImage));
        tempImage.addEventListener('error', errorAction);
    }
}

var p = scenePhase.prototype;

p.loadAction = function(pTempImage){
    this.image = pTempImage;
    
    sceneLoaded = true;
}
function errorAction(){
    //alert("There was an error loading an image. Whoops");
}

//passing context, canvas, delta time, center point, usable height, mouse state
p.update = function(ctx, canvas, dt, center, activeHeight, pMouseState){
    mouseState = pMouseState;
    if(sceneLoaded){
        p.act(canvas);
        //context, center point, usable height
        p.draw(ctx, center, activeHeight);
    }
}

p.act = function(canvas){
    this.width = canvas.offsetWidth;
    this.height = this.width * .5625;
    
    document.querySelector('#debugLine').innerHTML = "mousePosition: x = " + mouseState.relativePosition.x + ", y = " + mouseState.relativePosition.y + 
    "<br>Current Clicked = " + mouseState.mouseDown + 
    "<br>Last Clicked = " + mouseState.lastMouseDown + 
    "<br>MouseTarget = " + mouseTarget + 
    "<br>Over Canvas = " + mouseState.mouseIn;
}

p.draw = function(ctx, center, activeHeight){
    ctx.save();
    //centerize all drawing 
    ctx.translate(center.x, center.y);
    //draw background
    ctx.drawImage(this.image, -1 * (this.width)/2, -1 * (this.height)/2, this.width, this.height)
    //draw actors
    
    ctx.restore();
}


module.exports = scenePhase;