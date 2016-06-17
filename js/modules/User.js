"use strict";

//parameter is a point that denotes starting position
function User(pData){
    //the cookie is empty, make a new one
    if(pData === ""){
        this.activeNode = "0";
        document.cookie = "activeNode=" + this.activeNode;
    }
    else{
        //cut out the data from the string
        var equalsIndex = pData.indexOf('=');
        this.activeNode = pData.substring(equalsIndex + 1, pData.length);
    }
}

module.exports = User;