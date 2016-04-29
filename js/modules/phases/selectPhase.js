"use strict";

function selectPhase(){
    loaded = false;
    
    painter = new DrawLib();
    
    loadBoard(pTargetURL);
}


var p = selectPhase.prototype;

p.update = function(){
    if(loaded){
        p.act();
        p.draw();
    }
}

p.act = function(){
    
}

p.draw = function(){
    
}


module.exports = selectPhase;