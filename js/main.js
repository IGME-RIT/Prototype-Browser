'use strict';
var app = app || {};

app.main = {
    //debug
    debugLine: undefined,
    
    //variables
    canvas: undefined,
    ctx: undefined,
    app: undefined,
    utilities: undefined,
    drawLib: undefined,
    
    mousePosition: undefined,
    animationID: 0,
	lastTime: 0,
    
    //enumeration
    GAME_STATE: Object.freeze({	
		TITLE: 0,
		GAME: 1
	}),
    
    init : function() {
        this.debugLine = document.querySelector('#debugLine');
        
        this.canvas = document.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1336;
        this.canvas.height = 768;
        this.mousePosition = new app.Point(this.canvas.width/2, this.canvas.height/2);
        this.debugMousePosition();
        
        //denotes gameplay state
        this.game_state = this.GAME_STATE.GAME;
        
        //connecting events
        this.canvas.onmousemove = this.getMousePosition.bind(this);
        
        //start the loop
        this.update();
    },
    
    //loop functions
    update: function() {
        //call the loop
        this.animationID = requestAnimationFrame(this.update.bind(this));
        
        //calculate delta time
        var dt = this.calculateDeltaTime();
        
        //clear the canvas
        this.drawLib.clear(this.ctx,0,0,this.canvas.width,this.canvas.height);
        
        //update
        if(this.game_state == this.GAME_STATE.GAME){
            //draw game screen
            this.drawLib.rect(this.ctx, 0, 0, this.canvas.width, this.canvas.height, "White");
            this.drawLib.rect(this.ctx, this.mousePosition.x - 5, this.mousePosition.y - 5, 10, 10, "RoyalBlue");
        }
        else if(this.game_state == this.GAME_STATE.TITLE){
            //draw title screen
        }
    },
    
    calculateDeltaTime: function(){
		var now;
        var fps;
		now = (+ new Date); 
		fps = 1000 / (now - this.lastTime);
		fps = app.utilities.clamp(fps, 12, 60);
		this.lastTime = now; 
		return 1/fps;
	},
    
    //helper functions
    getMousePosition: function(e){
		this.mousePosition = app.utilities.getMouse(e);
        this.debugMousePosition();
	},
    debugMousePosition: function(e){
        this.debugLine.innerHTML = "mousePosition: " + this.mousePosition.x + ", " + this.mousePosition.y;
    },
};