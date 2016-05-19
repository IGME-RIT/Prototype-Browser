"use strict";
//imports
var Game = require('./modules/game.js');
var Point = require('./modules/point.js');
var MouseState = require('./modules/MouseState.js');
var CanvasState = require('./modules/CanvasState.js');

//game objects
var game;
var canvas;
var ctx;

//responsiveness
var header;
var activeHeight;
var center;
var scale;

//mouse handling
var mousePosition;
var relativeMousePosition;
var mouseDown;
var mouseIn;

var mouseState;
var canvasState;

//fires when the window loads
window.onload = function(e){
    initializeVariables();
    loop();
}

//initialization, mouse events, and game instantiation
function initializeVariables(){
    canvas = document.querySelector('canvas');
    ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    console.log("Canvas Dimensions: " + canvas.width + ", " + canvas.height);
    
    header = document.querySelector('header');
    activeHeight = canvas.offsetHeight - header.offsetHeight;
    center = new Point(canvas.width/2, activeHeight/2 + header.offsetHeight);
    scale = 1080.0/activeHeight;
    
    mousePosition = new Point(0,0);
    relativeMousePosition = new Point(0,0);
    
    //event listeners for mouse interactions with the canvas
    canvas.addEventListener("mousemove", function(e){
        var boundRect = canvas.getBoundingClientRect();
        mousePosition = new Point(e.clientX - boundRect.left, e.clientY - boundRect.top);
        relativeMousePosition = new Point(mousePosition.x - (canvas.offsetWidth/2.0), mousePosition.y - (header.offsetHeight + activeHeight/2.0));        
    });
    mouseDown = false;
    canvas.addEventListener("mousedown", function(e){
        mouseDown = true;
    });
    canvas.addEventListener("mouseup", function(e){
        mouseDown = false;
    });
    mouseIn = false;
    canvas.addEventListener("mouseover", function(e){
        mouseIn = true;
    });
    canvas.addEventListener("mouseout", function(e){
        mouseIn = false;
        mouseDown = false;
    });
    
    mouseState = new MouseState(mousePosition, relativeMousePosition, mouseDown, mouseIn);
    canvasState = new CanvasState(ctx, center, canvas.offsetWidth, activeHeight, scale);
    
    game = new Game();
}

//fires once per frame
function loop(){
    window.requestAnimationFrame(loop.bind(this));
    
    mouseState.update(mousePosition, relativeMousePosition, mouseDown, mouseIn);
    
    //passing context, canvas, delta time, center point, usable height, mouse state
    game.update(ctx, canvas, 0, center, activeHeight, mouseState);
}

//listens for changes in size of window and adjusts variables accordingly
window.addEventListener("resize", function(e){
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    activeHeight = canvas.height - header.offsetHeight;
    center = new Point(canvas.width / 2, activeHeight / 2 + header.offsetHeight)
    scale = 1080.0/activeHeight;
    canvasState.update(ctx, center, canvas.offsetWidth, activeHeight, scale);
    
    console.log("Canvas Dimensions: " + canvas.width + ", " + canvas.height);
});



