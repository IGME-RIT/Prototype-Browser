"use strict";

var app = app || {};
 
window.onload = function(e){
	app.main.app = app;
    
	app.main.utilities = app.utilities;
	app.main.drawLib = app.drawLib;
    
	app.queue = new createjs.LoadQueue(false);
	app.queue.on("complete", function(){
		app.main.init();
	});
    app.queue.loadManifest([
        {id: "exampleDog", src:"images/dog.jpg"},
	]);
    
    
    window.addEventListener("resize",function(e){
        //app.main.debugLine.innerHTML = "actual dimensions: x = " + app.main.canvas.offsetWidth + ", y = " + app.main.canvas.offsetHeight;
        app.main.canvas.width = app.main.canvas.offsetWidth;
        app.main.canvas.height = app.main.canvas.offsetHeight;
	});
};