"use strict";
var Point = require('./point.js');

function utilities(){
}

//set a status value of a node in localStorage based on ID
utilities.prototype.setProgress = function(pID, pStatus){
    var progressString = localStorage.progress;
    //search the progressString for the current ID
    var idIndex = progressString.indexOf(pID);
    
    //if it's not add it to the end
    if(idIndex === -1){
        //if the string is empty don't add a comma
        if(progressString !== ""){
            progressString += ",";
        }
        progressString += pID + "" + pStatus;
    }
    //otherwise modify the status value
    else{
        progressString = progressString.substr(0, pID.length + idIndex) + pStatus + progressString.substr(pID.length + 1 + idIndex, progressString.length) + "";
    }
    localStorage.progress = progressString;
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