"use strict";
var Point = require('./point.js');

function utilities(){
}

// returns mouse position in local coordinate system of element
utilities.prototype.getMouse = function(e){
    return new Point((e.pageX - e.target.offsetLeft), (e.pageY - e.target.offsetTop));
}

utilities.prototype.map = function(value, min1, max1, min2, max2){
    return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
}

utilities.prototype.clamp = function(value, min, max){
    return Math.max(min, Math.min(max, value));
}

utilities.prototype.mouseIntersect = function(pMouseState, pElement, pOffsetter, pScale){
    //if the x position collides
    if(pElement.status !== 0){
        if(pMouseState.relativePosition.x + pOffsetter.x > (pElement.position.x - (pScale*pElement.width)/2) && pMouseState.relativePosition.x + pOffsetter.x < (pElement.position.x + (pScale*pElement.width)/2)){
            //if the y position collides
            if(pMouseState.relativePosition.y + pOffsetter.y > (pElement.position.y - (pScale*pElement.height)/2) && pMouseState.relativePosition.y + pOffsetter.y < (pElement.position.y + (pScale*pElement.height)/2)){
                    pElement.mouseOver = true;
            }
            else{
                pElement.mouseOver = false;
            }
        }
        else{
            pElement.mouseOver = false;
        }
    }
}

module.exports = utilities;