"use strict";

var Point = require('../containers/Point.js');
var NodeLabel = require('./NodeLabel.js');
var Button = require('../containers/Button.js');

var horizontalSpacing = 180;
var baseSize = 24;

var TutorialState = {
    Locked: 0,
    Unlocked: 1,
    Completed: 2
};

var TutorialTags = {
    "AI": "#804",
    "Audio": "#048",
    "Computer Science": "#111",
    "Core": "#333",
    "Graphics": "#c0c",
    "Input": "#880",
    "Math": "#484",
    "Networking": "#c60",
    "Optimization": "#282",
    "Physics": "#048",
    "Scripting": "#088",
    "SoftwareEngineering": "#844"
};


//make a node with some data
function TutorialNode(JSONChunk) {
    this.data = JSONChunk;
    this.primaryTag = this.data.tags[0];
    this.color = TutorialTags[this.primaryTag];
    
    
    this.mouseOver = false;
    
    
    this.position = new Point(0, 0);
    this.previousPosition = new Point(0, 0);
    this.nextPosition = new Point(0, 0);
    
    this.size = 24;
    this.label = new NodeLabel(this);
        
    this.nextNodes = [];
    this.previousNodes = [];
    
    // Create sub buttons.
    this.detailsButton = new Button(new Point(0, 0), new Point(120, 24), "More", this.color);
    this.completionButton = new Button(new Point(0, 0), new Point(120, 24), "Mark Uncomplete", this.color);
};


// Set up the status of the node to match that saved in browser memory.
TutorialNode.prototype.fetchState = function() {
    this.state = localStorage.getItem(this.data.name);
    if(this.state == null || this.state == TutorialState.Locked) {
        this.changeState(TutorialState.Locked);
        
        // Default to unlocked if there are no previous nodes.
        if(this.previousNodes.length == 0) {
            this.changeState(TutorialState.Unlocked);
        }
    }
    
    if(this.state == TutorialState.Completed) {
        this.completionButton.text = "Mark Unomplete";
    }
    else {
        this.completionButton.text = "Mark Complete";
    }
}

// Changes the state of this node
TutorialNode.prototype.changeState = function(tutState) {
    if(this.state == TutorialState.Locked) {
        if(tutState == TutorialState.Unlocked) {
            this.state = tutState;
            localStorage.setItem(this.data.name, this.state);
            // Unlock from a locked position doesn't need to change any other nodes.
        }
        else if(tutState == TutorialState.Completed) {
            this.state = tutState;
            localStorage.setItem(this.data.name, this.state);
            
            // Complete from a locked position needs to attempt to unlock later things.
            this.nextNodes.forEach((child)=>{
                var shouldBeLocked = child.previousNodes.some((prereq)=>{
                    return (prereq.state != TutorialState.Completed);
                });
                if(!shouldBeLocked) {
                    child.changeState(TutorialState.Unlocked);
                }
            });
        }
    }
    else if(this.state == TutorialState.Unlocked) {
        if(tutState == TutorialState.Locked) {
            this.state = tutState;
            localStorage.setItem(this.data.name, this.state);
            // Locked from unlocked position doesn't affect anything
        }
        else if(tutState == TutorialState.Completed) {
            this.state = tutState;
            localStorage.setItem(this.data.name, this.state);
            
            // completed from unlocked should unlock next things.
            this.nextNodes.forEach((child)=>{
                var shouldBeLocked = child.previousNodes.some((prereq)=>{
                    return (prereq.state != TutorialState.Completed);
                });
                if(!shouldBeLocked) {
                    child.changeState(TutorialState.Unlocked);
                }
            });
        }
    }
    else if (this.state == TutorialState.Completed) {
        if(tutState == TutorialState.Locked) {
            this.state = tutState;
            localStorage.setItem(this.data.name, this.state);
            
            // locking something that was completed should lock later things.
            this.nextNodes.forEach((child)=>{
                child.changeState(TutorialState.Locked);
            });
        }
        else if(tutState == TutorialState.Unlocked) {
            this.state = tutState;
            localStorage.setItem(this.data.name, this.state);
            // unlocking something that was completed should lock later things.
            this.nextNodes.forEach((child)=>{
                child.changeState(TutorialState.Locked);
            });
            // also if this thing doesn't have it's prereqs met, it should go straight to being locked
            var shouldBeLocked = this.previousNodes.some((prereq)=>{
                return (prereq.state != TutorialState.Completed);
            });
            if(shouldBeLocked) {
                this.state = TutorialState.Locked;
                localStorage.setItem(this.data.name, this.state);
            }
        }
    }
}

//recursive function to get previous nodes
TutorialNode.prototype.getPrevious = function(depth) {
    var result = [this];
    if(depth > 0) {
        this.previousNodes.forEach((node)=>{
            result = result.concat(node.getPrevious(depth-1));
        });
    }
    return result;
};



//recursive function to get next nodes
TutorialNode.prototype.getNext = function(depth) {
    var result = [this];
    if(depth > 0) {
        this.nextNodes.forEach((node)=>{
            result = result.concat(node.getNext(depth-1));
        });
    }
    return result;
};


// Updates all nodes starting with one, and extending outward.
// direction is the side of the parent this node exists on (-1, 0, 1) 0 is both.
// layer depth is how many layers to render out
TutorialNode.prototype.recursiveUpdate = function(direction, depth) {
    if(depth > 0) {
        // left or middle
        if(direction < 1) {
            this.previousNodes.forEach((node)=>{
                node.recursiveUpdate(-1, depth - 1);
            });
        }
        // right or middle
        if(direction > -1) {
            this.nextNodes.forEach((node)=>{
                node.recursiveUpdate(1, depth - 1);
            });
        }
    }
};

//updates a node
//transition time is 1-0, with 0 being the final location
TutorialNode.prototype.update = function(mouseState, time, transitionTime, isFocused) {
    
    //move the node
    if(this.position != this.nextPosition) {
        this.position.x = (this.previousPosition.x * transitionTime) + (this.nextPosition.x * (1 - transitionTime));
        this.position.y = (this.previousPosition.y * transitionTime) + (this.nextPosition.y * (1 - transitionTime));
    }
    
    if(isFocused) {
        this.size = 36;
    }
    else {
        //test if mouse is inside circle
        var dx = mouseState.relativePosition.x - this.position.x;
        var dy = mouseState.relativePosition.y - this.position.y;
        if((dx * dx) + (dy * dy) < this.size * this.size) {
            this.size = 30;
            this.mouseOver = true;
        }
        else {
            this.size = 24;
            this.mouseOver = false;
        }
    }
    
    
    
    this.label.update(mouseState, time, isFocused);
    
    if(isFocused) {
        this.detailsButton.position.x = this.position.x - this.detailsButton.size.x / 2 - 3;
        this.detailsButton.position.y = this.position.y + this.size + 12;
        this.detailsButton.update(mouseState);
        
        this.completionButton.position.x = this.position.x - this.completionButton.size.x / 2 - 3;
        this.completionButton.position.y = this.position.y + this.size + 48;
        this.completionButton.update(mouseState);
    }
};


TutorialNode.prototype.calculateNodeTree = function(layerDepth, parent, direction) {
    
    // If the node already exists in the graph in a better place than this one, dont use it
    if(this.currentLayerDepth > layerDepth) {
        return;
    }
    
    this.currentLayerDepth = layerDepth;
    this.parent = parent;
    
    if(layerDepth > 0) {
        // left or middle
        if(direction < 1) {
            this.previousNodes.forEach((node)=>{
                node.calculateNodeTree(layerDepth - 1, this, -1);
            });
        }
        
        // right or middle
        if(direction > -1) {
            this.nextNodes.forEach((node)=>{
                node.calculateNodeTree(layerDepth - 1, this, 1);
            });
        }
    }
};

TutorialNode.prototype.setTransition = function(layerDepth, parent, direction, targetPosition) {
    
    if(!this.wasPreviouslyOnScreen && parent != null) {
        this.position = new Point(targetPosition.x, targetPosition.y);
        this.position.x *= 1.5;
    }
    this.previousPosition = this.position;
    this.nextPosition = targetPosition;
    
    //figure out size of children to space them out appropriately
    if(layerDepth > 0) {
        var xPosition;
        var yPosition;
        
        //left or middle
        if(direction < 1) {
            xPosition = targetPosition.x - horizontalSpacing;   // calculate the x position for next nodes
            if(direction == 0) xPosition -= 60;                 // based on offset from parent node.
                                                                // first space is larger than the others.
            
            // determine height of this and all child nodes
            var totalLeftHeight = this.getPreviousHeight(layerDepth);
            yPosition = targetPosition.y - (totalLeftHeight / 2);   // center vertically
            
            // Loop over children and set them up as well. (if they are children of this node)
            this.previousNodes.forEach((node)=>{
                if(node.parent == this) {
                    var placement = new Point(xPosition, yPosition + node.currentHeight / 2);
                    node.setTransition(layerDepth - 1, this, -1, placement);
                    yPosition += node.currentHeight;    // Increment y position of node each time to space them out correctly.
                }
            });
        }
        
        //right or middle
        if(direction > -1) {
            xPosition = targetPosition.x + horizontalSpacing;   // calculate the x position for next nodes
            if(direction == 0) xPosition += 60;                 // based on offset from parent node.
                                                                // first space is larger than the others.
            
            // Determine height of this and all child nodes.
            var totalRightHeight = this.getNextHeight(layerDepth);
            yPosition = targetPosition.y - (totalRightHeight / 2);  // center vertically.

            // Loop over children and set them up as well. (if they are children of this node)
            this.nextNodes.forEach((node)=>{
                if(node.parent == this) {
                    var placement = new Point(xPosition, yPosition + node.currentHeight / 2);
                    node.setTransition(layerDepth - 1, this, 1, placement);
                    yPosition += node.currentHeight;    // Increment y position of node each time to space them out correctly.
                }
            });
        }
    }
};

// Calculates the total height of this node and all child nodes to the left recursively
TutorialNode.prototype.getPreviousHeight = function(layerDepth) {
    this.currentHeight = 0;
    if(layerDepth > 0 && this.previousNodes.length > 0) {
        this.previousNodes.forEach((node)=>{
            if(node.parent == this) {
                this.currentHeight += node.getPreviousHeight(layerDepth - 1);
            }
        });
    }
    if(this.currentHeight == 0) {
        this.currentHeight = baseSize * 5;  // end case for single nodes
    }
    
    return this.currentHeight;
};

// Calculates the total height of this node and all child nodes to the right recursively
TutorialNode.prototype.getNextHeight = function(layerDepth) {
    
    // Count up size of all child nodes
    this.currentHeight = 0;
    if(layerDepth > 0 && this.nextNodes.length > 0) {
        this.nextNodes.forEach((node)=>{
            if(node.parent == this) {
                this.currentHeight += node.getNextHeight(layerDepth - 1);
            }
        });
    }
    if(this.currentHeight == 0) {
        this.currentHeight = baseSize * 5;  // end case for single nodes
    }
    
    return this.currentHeight;
};


TutorialNode.prototype.draw = function(pCanvasState, pPainter, graph, parentCaller, direction, layerDepth) {
    //draw line to parent if possible
    if(parentCaller && parentCaller == this.parent) {
        pCanvasState.ctx.save();
        pCanvasState.ctx.lineWidth = 2;
        pCanvasState.ctx.strokeStyle = "#fff";
        pCanvasState.ctx.beginPath();
        
        //var between = new Point(this.position.x, this.position.y);
        pCanvasState.ctx.moveTo(this.position.x, this.position.y);
        pCanvasState.ctx.lineTo(parentCaller.position.x, parentCaller.position.y);
        
        
        pCanvasState.ctx.closePath();
        pCanvasState.ctx.stroke();
        pCanvasState.ctx.restore();
    }
    
    // draw child nodes
    if(layerDepth > 0){
        // left and middle
        if(direction < 1) {
            this.previousNodes.forEach((node)=>{
                node.draw(pCanvasState, pPainter, graph, this, -1, layerDepth - 1);
            });
        }
        // right and middle
        if(direction > -1) {
            this.nextNodes.forEach((node)=>{
                node.draw(pCanvasState, pPainter, graph, this, 1, layerDepth - 1);
            });
        }
    }
    
    // draw circle
    pPainter.circle(pCanvasState.ctx, this.position.x, this.position.y, this.size, true, this.color, true, "#fff", 2);
    
    // draw a checkmark
    if(this.state == TutorialState.Completed) {
        pCanvasState.ctx.drawImage(graph.checkImage, this.position.x - 32, this.position.y - 32);
    }
    // draw a lock
    if(this.state == TutorialState.Locked) {
        pCanvasState.ctx.drawImage(graph.lockImage, this.position.x - 32, this.position.y - 32);
    }
    
    // draw the label
    this.label.draw(pCanvasState, pPainter);
    if(direction == 0) {
        this.detailsButton.draw(pCanvasState, pPainter);
        this.completionButton.draw(pCanvasState, pPainter);
    }
};



module.exports = TutorialNode;