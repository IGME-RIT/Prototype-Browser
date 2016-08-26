"use strict"


function DetailsPanel(graph) {
    this.graph = graph;
    this.node = null;
    this.data = null;
    this.dataDiv = document.getElementById("rightBar");
    this.canvasDiv = document.getElementById("middleBar");
    this.transitionOn = false;
    this.transitionTime = 0;
};

DetailsPanel.prototype.enable = function(node) {
    this.node = node;
    this.data = node.data;
    this.transitionOn = true
};

DetailsPanel.prototype.disable = function() {
    this.dataDiv.style.content = "";
    this.transitionOn = false;
};

DetailsPanel.prototype.update = function(canvasState, time) {
    //transition on
    if(this.transitionOn) {
        if(this.transitionTime < 1) {
            this.transitionTime += time.deltaTime * 5;
            //console.log("on"+this.transitionTimea);
        }
        //finish
        else {
        
        }
    }
    else {
        //transition off
        if(this.transitionTime > 0) {
            this.transitionTime -= time.deltaTime * 5;
            //console.log("off" + this.transitionTime);
        }
        //completely shut down
        else {
            this.node = null;
            this.data = null;
        }
    }

    this.dataDiv.style.width = 50 * this.transitionTime + "vw";
    this.canvasDiv.style.width = 100 - 50 * this.transitionTime + "vw";    
    canvasState.update();
    
};

module.exports = DetailsPanel;