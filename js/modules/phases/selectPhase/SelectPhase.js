"use strict";

function SelectPhase(pTargetURL){
    //
    boardLoaded = false;
    mouseTarget = 0;
    
    //instantiate libraries
    painter = new DrawLib();
    utility = new Utilities();
    
    //reads data from target URL and connects callback
    parser = new Parser(pTargetURL, boardLoadedCallback);
    
    
    //insert html
    populateDynamicContent();
}

SelectPhase.prototype.act = function(){
    
}

SelectPhase.prototype.draw = function(){
    
}

module.exports = SelectPhase;