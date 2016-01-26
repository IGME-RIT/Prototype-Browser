"use strict";
var app = app || {};

app.utilities = function(){
	
	// returns mouse position in local coordinate system of element
	function getMouse(e, actualCanvasWidth, actualCanvasHeight){
		//return new app.Point((e.pageX - e.target.offsetLeft) * (app.main.renderWidth / actualCanvasWidth), (e.pageY - e.target.offsetTop) * (app.main.renderHeight / actualCanvasHeight));
        return new app.Point((e.pageX - e.target.offsetLeft), (e.pageY - e.target.offsetTop));
	}
	
	function map(value, min1, max1, min2, max2){
		return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
	}

    function clamp(value, min, max){
        return Math.max(min, Math.min(max, value));
    }
    
	//public interface
	return{
		getMouse : getMouse,
        clamp: clamp,
		map: map
	};
}(); 