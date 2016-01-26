"use strict";
var app = app || {};

app.drawLib = {
	clear : function(ctx, x, y, w, h) {
		ctx.clearRect(x, y, w, h);
	},
	
	rect : function(ctx, x, y, w, h, col) {
		ctx.save();
		ctx.fillStyle = col;
		ctx.fillRect(x, y, w, h);
		ctx.restore();
	},
	
	// a generalized gradient function would be nice
	// write one if you want
	backgroundGradient: function(ctx, width, height){
		ctx.save();
		// Create gradient - top to bottom
		var grad=ctx.createLinearGradient(0,0,0,height);
		grad.addColorStop(0,"#888"); // top
		grad.addColorStop(.85,"blue"); // 85% down
		grad.addColorStop(1,"#ff9999"); // bottom
			
		// change this to fill entire ctx with gradient
		ctx.fillStyle=grad;
		ctx.fillRect(0,0,width,height);
		ctx.restore();
	},
};