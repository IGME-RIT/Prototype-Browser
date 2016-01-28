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
    
    line : function(ctx, x1, y1, x2, y2, thickness, color) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = thickness;
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.restore();
    },
    
    circle : function(ctx, x, y, radius, color){
        ctx.save();
        ctx.beginPath();
        ctx.arc(x,y, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = color;
        ctx.fill();
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