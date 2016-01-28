"use strict";
var app = app || {};

app.point = function(){
    function point(x, y){
        this.x = x;
        this.y = y;
    }
    
    return point;
}();