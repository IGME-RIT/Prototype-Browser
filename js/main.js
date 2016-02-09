"use strict";
//imports
var Game = require('./modules/game.js');

//variables
var game;
var canvas;
var ctx;
/*app.IMAGES = {
    testImage: "images/dog.png"
 };*/

window.onload = function(e){
    initializeCanvas();
    game = new Game();
    
    loop();
	/*app.main.app = app;
    
	app.main.utilities = app.utilities;
	app.main.drawLib = app.drawLib;
    app.main.dataObject = new app.dataObject();
    app.board.drawLib = app.drawLib;
    app.lessonNode.drawLib = app.drawLib;
    app.boardButton.drawLib = app.drawLib;
    
	app.queue = new createjs.LoadQueue(false);
	app.queue.on("complete", function(){
		app.main.init();
	});
    app.queue.loadManifest([
        {id: "exampleImage", src:"images/dog.jpg"},
	]);
    
    
    window.addEventListener("resize",function(e){
        app.main.canvas.width = app.main.canvas.offsetWidth;
        app.main.canvas.height = app.main.canvas.offsetHeight;
        app.main.activeHeight = app.main.canvas.height - app.main.header.offsetHeight;
        app.main.center = new app.point(app.main.canvas.width / 2, app.main.activeHeight / 2 + app.main.header.offsetHeight)
	});*/
}

function initializeCanvas(){
    canvas = document.querySelector('canvas');
    ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    console.log("Canvas Dimensions: " + canvas.width + ", " + canvas.height);
}

function loop(){
    //window.requestAnimationFrame(loop());
    game.update();
}

window.addEventListener("resize", function(e){
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    console.log("Canvas Dimensions: " + canvas.width + ", " + canvas.height);
});