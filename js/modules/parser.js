"use strict";

//parameter is a point that denotes starting position
function parser(pTargetURL, callback){
    var JSONObject;
        var xhr = new XMLHttpRequest();
        xhr.onload = function(){
            JSONObject = JSON.parse(xhr.responseText);
            callback(JSONObject);
        }

        xhr.open('GET', pTargetURL, true);
        xhr.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2010 00:00:00 GM0T");
        xhr.send();
}

module.exports = parser;