"use strict";
var app = app || {};

app.Point = function(){
    function Point(x, y){
        this.x = x;
        this.y = y;
    }
    
    return Point;
}();