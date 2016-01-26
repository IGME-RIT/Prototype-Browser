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
        //this.debugLine = document.querySelector('#debugLine');
        
        this.canvas = document.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        
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
        this.debugHud(this.ctx, dt);
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
		this.mousePosition = app.utilities.getMouse(e, this.canvas.offsetWidth, this.canvas.offsetHeight);
        this.debugMousePosition();
	},
    debugMousePosition: function(e){
        //this.debugLine.innerHTML = "mousePosition: " + this.mousePosition.x + ", " + this.mousePosition.y;
    },
    debugHud: function(ctx, dt) {
        ctx.save();
        this.fillText(ctx, "dt: " + (dt.toFixed(3)), this.canvas.width - 150, this.canvas.height - 10, "18pt oswald", "Black");
        ctx.restore();
    },
    fillText: function(ctx, string, x, y, css, color) {
		this.ctx.save();
		// https://developer.mozilla.org/en-US/docs/Web/CSS/font
		this.ctx.font = css;
		this.ctx.fillStyle = color;
		this.ctx.fillText(string, x, y);
		this.ctx.restore();
	},
};