"use strict";
var DrawLib = require('./drawLib.js');
var Utilities = require('./utilities.js');

var painter;
var utility;

//parameter is a point that denotes starting position
function lessonNode(startPosition, JSONChunk){    
    this.imageLoaded = false;
    painter = new DrawLib();
    utility = new Utilities();
    
    this.position = startPosition;
    this.mouseOver = false;
    this.highlighted = false;
    this.scaleFactor = 1;
    this.type = "lessonNode";
    this.data = JSONChunk;
    
    this.placement = 1;
    
    //parse JSONChunk for completeness
    
    
    //image loading and resizing
    var tempImage = new Image();
    
    tempImage.addEventListener('load', _loadAction.bind(this), false);
    tempImage.addEventListener('error', _errorAction.bind(this), false);
    
    tempImage.src = JSONChunk.image.icon;
}


var _loadAction = function (e) {
    this.image = e.target;
    this.width = e.target.naturalWidth;
    this.height = e.target.naturalHeight;
    
    var maxDimension = 100;
    
    if(this.width < maxDimension && this.height < maxDimension){
        var x;
        if(this.width > this.height){
            x = maxDimension / this.width;
        }
        else{
            x = maxDimension / this.height;
        }
        this.width = this.width * x;
        this.height = this.height * x;
    }
    if(this.width > maxDimension || this.height > maxDimension){
        var x;
        if(this.width > this.height){
            x = this.width / maxDimension;
        }
        else{
            x = this.height / maxDimension;
        }
        this.width = this.width / x;
        this.height = this.height / x;
    }
    
    this.imageLoaded = true;
};
var _errorAction = function(e){
    //alert("There was an error loading an image.");
    this.image = new Image();
    this.image.src = "../assets/ui/missingThumbnail.gif";
    this.width = 100;
    this.height = 100;
    this.imageLoaded = true;
};



var _handleStatus = function (e) {
    //filter through localStorage
    var progressString = localStorage.progress;
    
    
    console.log("This is the status before change: " + this.status);
    //will never occur when 0
    if(this.status === "1"){
        //change to solved status
        this.status = "2";
        
        //iterate through each forward connection and handle accordingly
        for(var i = 0; i < this.connectionForward.length; i++){
            var confirmedClear = true;
            //iterate through that forward connection's backwards connections and make sure that all are in a cleared state
            for(var j = 0; j < this.connectionForward[i].connectionBackward.length; j++){
                var targetStatus = this.connectionForward[i].connectionBackward[j].status;
                //if even a single backwards connection is hidden, unsolved, or locked, it's not ready to be revealed
                if(targetStatus === "0" || targetStatus === "1" || targetStatus === "3"){
                    confirmedClear = false;
                    break;
                }
            }
            //apply the status
            if(confirmedClear){
                this.connectionForward[i].setStatus("1");
            }
            else{
                this.connectionForward[i].setStatus("3");
            }
            //apply connectionForward data to localStorage
            utility.setProgress(this.connectionForward[i]);
        }
        
        //change button appearance
        var toggleButton = document.querySelector("#completionButton");
        toggleButton.innerHTML = "<div id=\"dwLauncherToggle\"><p>Mark Incomplete</p></div>";
        toggleButton.className = "selected";
    }
    else if(this.status === "2"){
        //change to withdrawn completion status
        this.status = "4";
        
        //change button appearance
        var toggleButton = document.querySelector("#completionButton");
        toggleButton.innerHTML = "<div id=\"dwLauncherToggle\"><p>Mark as Complete</p></div>";
        toggleButton.className = "unselected";
    }
    else if(this.status === "3"){
        
    }
    else if(this.status === "4"){
        //change to solved status
        this.status = "2";
        
        //need to check completion here, loops through forward connections
        for(var i = 0; i < this.connectionForward.length; i++){
            //if status is either hidden or locked, check to change status
            if(this.connectionForward[i].status === 0 || this.connectionForward[i].status === 3){
                var confirmedClear = true;
                //if any backward connections are incomplete, set the confirmedClear flag to show that
                for(var j = 0; j < this.connectionForward[i].connectionBackward.length; j++){
                    var targetStatus = this.connectionForward[i].connectionBackward[j].status;
                    if(targetStatus === "0" || targetStatus === "1" || targetStatus === "3"){
                        confirmedClear = false;
                        break;
                    }
                }
                //apply the status
                if(confirmedClear){
                    this.connectionForward[i].setStatus("1");
                }
                else{
                    this.connectionForward[i].setStatus("3");
                }
                //apply connectionForward data to localStorage
                utility.setProgress(this.connectionForward[i]);
            }
        }
        
        //change button appearance
        var toggleButton = document.querySelector("#completionButton");
        toggleButton.innerHTML = "<div id=\"dwLauncherToggle\"><p>Mark Incomplete</p></div>";
        toggleButton.className = "selected";
    }
    
    utility.setProgress(this);
    
    console.log(localStorage.progress + "\n");
    console.log("This is the status after change: " + this.status);
}

var flagLoaded = false;
var flagImage;
var _drawFlag = function (ctx, position, width, height, scale) {
    if(flagLoaded){
        //draw flag in the upper right
        ctx.drawImage(flagImage, position.x + width/2 - 3*flagImage.naturalWidth/4, position.y - height/2 - flagImage.naturalHeight/4, 30 * scale, 30 * scale)
    }
    else{
        //loadImage
        flagImage = new Image();
        flagImage.src = "../../assets/ui/iconCheck.png";
        flagLoaded = true;
    }
}

lessonNode.prototype.setStatus = function(pStatus){
    //ensure that a lock is being instead of normal unveil if that's what is supposed to be there
    if(pStatus === "1" && this.status === "0"){
        var confirmedClear = true;
        //check backwards connections completion
        for(var i = 0; i < this.connectionBackward.length; i++){
            var targetStatus = this.connectionBackward[i].status;
            if(targetStatus === "0" || targetStatus === "1" || targetStatus === "3"){
                confirmedClear = false;
                break;
            }
        }
        if(confirmedClear){
            this.status = "1";
        }
        else{
            this.status = "3";
        }
    }
    else{
       this.status = pStatus; 
    }
    
}

lessonNode.prototype.draw = function(ctx){
    if(this.imageLoaded){
        
        if(this.status !== "0"){
            ctx.save();
            if(this.highlighted){
                ctx.shadowColor = '#0066ff';
                ctx.shadowBlur = 7;
            }

            //the node is completely solved, draw connection lines
            if(this.status === "2" || this.status === "4"){
                //draw lines as part of the lessonNode
                for(var i = 0; i < this.connectionForward.length; i++){
                    this.connectionForward[i].highlight = true;
                    painter.line(ctx, this.position.x, this.position.y, this.connectionForward[i].position.x, this.connectionForward[i].position.y, 2, "black");
                }
            }
            
            //is this node's image drawn normally?
            if(this.status === "1" || this.status === "2" || this.status === "4"){
                
                
                ctx.drawImage(this.image, this.position.x - (this.width*this.scaleFactor)/2, this.position.y - (this.height*this.scaleFactor)/2, this.width * this.scaleFactor, this.height * this.scaleFactor);
            }
            //draw locked image
            else if(this.status === "3"){
                //!!!!!use painter to draw lock stuff, below is placeholder
                ctx.save();
                ctx.fillStyle = "gray";
                ctx.strokeStyle = "gray";
                ctx.lineWidth = 10;
                ctx.beginPath();
                ctx.arc(this.position.x,this.position.y - 10,20,Math.PI,0);
                ctx.stroke();
                ctx.fillRect(this.position.x - 30, this.position.y - 10, 60*this.scaleFactor, 40 * this.scaleFactor);
                ctx.restore();
                
            }
            
            ctx.font = "20px Arial";
            ctx.textBaseline = "hanging";
            ctx.textAlign = "center";
            ctx.strokeText(this.data.title, this.position.x, this.position.y + 5 + this.height/2);
                
            //draw completion flag
            if(this.status === "2"){
                _drawFlag(ctx, this.position, this.width, this.height, this.scaleFactor);
            }
            
            
            ctx.restore();


            //draw the image, shadow if hovered
            if(this.mouseOver){
                this.highlighted = true;
                if(this.connectionForward[0] !== undefined){
                    if(this.connectionForward[0].type === "extension"){
                        this.connectionForward[0].highlighted = true;
                    }
                }
            }
            else{
                this.highlighted = false;
                if(this.connectionForward[0] !== undefined){
                    if(this.connectionForward[0].type === "extension"){
                        this.connectionForward[0].highlighted = false;
                    }
                }
            }
        }
    }
    
};



//populates the detailWindow based on the sender
lessonNode.prototype.click = function(){
    
    if(this.status === "3"){
        document.getElementById("detailLayer").className = "visible";
        document.getElementById("detailWindow").className = "hiddenWindow";
        document.getElementById("lockWindow").className = "";
        
        document.getElementById("lockText").innerHTML = this.data.title + " will be unlocked when the following are completed: ";
        for(var i = 0; i < this.connectionBackward.length + 100; i++){
            //document.getElementById("lockList").innerHTML += "<p>• " + this.connectionBackward[i].data.title  + "</p>";
            document.getElementById("lockList").innerHTML += "<p>• Test</p>";
        }
    }
    else{
        //set detailWindow values here
        document.getElementById("detailLayer").className = "visible";
        document.getElementById("detailWindow").className = "";
        document.getElementById("lockWindow").className = "hiddenWindow";
        
        document.getElementById("dwBannerTitle").innerHTML = this.data.title;
        document.getElementById("dwBannerImage").src = this.data.image.banner;

        var tagText = "";
        for(var i = 0; i < this.data.tags.length; i++){
            tagText += "<div class=\"dwTag\"><p>" + this.data.tags[i] + "</p></div>";
        }

        document.getElementById("dwTags").innerHTML = tagText;
        document.getElementById("dwDescriptionText").innerHTML = this.data.description;

        var conglomerate = "";
        if(this.data.extra_resources[0] !== null){
            for(var i = 0; i < this.data.extra_resources.length; i++){
                var snippet = this.data.extra_resources[i];
                var headerSnippet = "";
                var footerSnippet = "";
                //removes / from the end since it will be used as an marker for cutting
                if(snippet.substring(snippet.length - 1, snippet.length) === "/"){
                    snippet = snippet.substring(0, snippet.length - 1);
                }
                //remove the http:// or https:// header
                if(snippet.substring(0, 8) === "https://"){
                    snippet = snippet.substring(8, snippet.length);
                }
                if(snippet.substring(0, 7) === "http://"){
                    snippet = snippet.substring(7, snippet.length);
                }
                if(snippet.substring(0, 4) === "www."){
                    snippet = snippet.substring(4, snippet.length);
                }
                //if the snippet contains / parse based on it
                if(snippet.indexOf('/') !== "-1"){
                    var counter = 0;
                    for(var k = 0; k < snippet.length; k++){
                        if(snippet[k] !== "/"){
                            counter++;
                        }
                        else{
                            break;
                        }
                    }
                    headerSnippet += snippet.substring(0, counter);
                    headerSnippet += ":";

                    counter = snippet.length;
                    for(var k = snippet.length - 1; k > 0; k--){
                        if(snippet[k] !== "/"){
                            counter--;
                        }
                        else{
                            break;
                        }
                    }
                    footerSnippet += snippet.substring(counter, snippet.length);
                    var temporarySnippet = "";
                    for(var k = 0; k < footerSnippet.length; k++){
                        if(footerSnippet[k] === '-' || footerSnippet[k] === '_' || footerSnippet[k] === '~'){
                            temporarySnippet += ' ';
                        }
                        else{
                            temporarySnippet += footerSnippet[k];
                        }
                    }
                    footerSnippet = temporarySnippet;
                }

                conglomerate += "<a href=\"" + this.data.extra_resources[i] + "\" target=\"_blank\"><div class=\"dwResource\"><div class=\"dwResourceContent\"><p class=\"dwResourceP1\">";
                conglomerate += headerSnippet;
                conglomerate += "</p><p class=\"dwResourceP2\">" + footerSnippet +"</p></div></div></a>";
            }

        }
        document.getElementById("dwResources").innerHTML = conglomerate;


        var dwLauncherReference = document.getElementById("dwLauncher");
        dwLauncherReference.innerHTML = "<a href=\"" + this.data.link + "\" target=\"_blank\"><div id=\"dwLauncherLaunch\"><p>Open Lesson</p></div></a>";
        if(this.status === "1" || this.status === "4"){
            dwLauncherReference.innerHTML += "<button id=\"completionButton\" class=\"unselected\"><div id=\"dwLauncherToggle\"><p>Mark as Complete</p></div></button>";
        }
        else{
            dwLauncherReference.innerHTML += "<button id=\"completionButton\" class=\"selected\"><div id=\"dwLauncherToggle\"><p>Mark Incomplete</p></div></button>";
        }


        //set cookie data
        localStorage.activeNode = this.data._id;

        //attach click event to button
        var dwCompletionButton = document.querySelector("#completionButton");
        dwCompletionButton.addEventListener('click', _handleStatus.bind(this), false);
    }
};

module.exports = lessonNode;