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
    this.dataDiv.innerHTML = "";
    this.transitionOn = false;
};

DetailsPanel.prototype.update = function(canvasState, time, node) {
    
    //update node if its not the same anymore
    if(this.node != node) {
        this.node = node;
        this.data = node.data;
        this.dataDiv.innerHTML = this.GenerateDOM();
    }
    
    
    //transition on
    if(this.transitionOn) {
        if(this.transitionTime < 1) {
            this.transitionTime += time.deltaTime * 3;
            if(this.transitionTime >= 1) {
                //done transitioning
                this.transitionTime = 1;
                this.dataDiv.innerHTML = this.GenerateDOM();
            }
        }
    }
    //transition off
    else {
        if(this.transitionTime > 0) {
            this.transitionTime -= time.deltaTime * 3;
            if(this.transitionTime <= 0) {
                //done transitioning
                this.transitionTime = 0;
                this.node = null;
                this.data = null; 
            }
        }
    }
    
    
    //update position of windows
    var t = (1 - Math.cos(this.transitionTime * Math.PI))/2;
    this.dataDiv.style.width = 40 * t + "vw";
    this.canvasDiv.style.width = 100 - 40 * t + "vw";    
    canvasState.update();
};

DetailsPanel.prototype.GenerateDOM = function() {
    var html = "<h1><a href=" + this.data.link + ">"+this.data.title+"</a></h1>";
    html += "<a href=" + this.data.link + "><img src=" + this.data.image.icon + "></a>";
    html += "<p>" + this.data.description + "</p>";
    console.log(this.data);
    if(this.data.extra_resources.length != 0) {
        html += "<h2>Additional Resources:<h2>";
        html += "<ul>";
        for(var i = 0; i < this.data.extra_resources.length; i++) {
            html += "<li><a href=" + this.data.extra_resources[i] + ">link</a></li>";
        }
        html += "</ul>";
    }
    
    return html;
};

module.exports = DetailsPanel;