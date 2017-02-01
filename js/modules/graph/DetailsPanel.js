"use strict"

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


function DetailsPanel(graph) {
    this.graph = graph;
    this.node = null;
    this.data = null;
    this.transitionOn = false;
    this.transitionTime = 0;
    this.enabled = false;
    this.dataDiv = document.getElementById("rightBar");
};

DetailsPanel.prototype.enable = function(node) {
    this.node = node;
    this.data = node.data;
    this.transitionOn = true;
    this.enabled = true;
};

DetailsPanel.prototype.disable = function() {
    this.dataDiv.innerHTML = "";
    this.transitionOn = false;
    this.enabled = false;
};

DetailsPanel.prototype.update = function(canvasState, time, node) {

    //update node if its not the same anymore
    if(this.node != node) {
        this.node = node;
        this.data = node.data;
        //this.dataDiv.innerHTML = this.GenerateDOM();
        $(this.dataDiv).html(this.GenerateDOM());
    }


    //transition on
    if(this.transitionOn) {
        if(this.transitionTime < 1) {
            this.transitionTime += time.deltaTime * 3;
            if(this.transitionTime >= 1) {
                //done transitioning
                this.transitionTime = 1;
                //this.dataDiv.innerHTML = this.GenerateDOM();
                $(this.dataDiv).html(this.GenerateDOM());
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
};

DetailsPanel.prototype.GenerateDOM = function() {
    var $elements = [];

    // h1 with series title
    $elements.push("<h1>" + this.data.series + "</h1>");

    // h1 with tutorial title and link
    $elements.push("<h1>");
      $elements.push("<a href=\"" + this.data.link + "\">");
        $elements.push(this.data.title);
      $elements.push("</a>");
    $elements.push("</h1>");

    // image thumbnail with link
    $elements.push("<a href=\"" + this.data.link + "\" target='_blank'>");
      $elements.push("<img src=\"https://raw.githubusercontent.com/IGME-RIT/" + this.data.name + "/master/igme_thumbnail.png\" title=\"" + this.data.link + "\" />");
    $elements.push("</a>");

    // ul of tags
    if (this.data.tags.length > 0) {
      $elements.push("<ul id=\"tags\">");
      $(this.data.tags).each( function(i,e) {
        $elements.push("<li style=\"background-color: " + TutorialTags[e] + "\">");
          $elements.push(e);
        $elements.push("</li>");
      });
      $elements.push("</ul>");
    }

    // p with description
    $elements.push("<p>" + this.data.description + "</p>");

    // extra resources, if applicable
    if (this.data.extra_resources.length > 0) {
      $elements.push("<h2>Additional Resources:</h2>");
      $elements.push("<ul>");
      $(this.data.extra_resources).each(function(i,e){
        $elements.push("<li>");
          $elements.push("<a href=\"" + e.link + "\">");
            $elements.push(e.title);
          $elements.push("</a>");
        $elements.push("</li>");
      });
      $elements.push("</ul>");
    }

    //output
    //console.log($elements.join(""));
    return $elements.join("");

    /*
    var html = "<h1>"+this.data.series+":</h1><h1><a href=" + this.data.link + ">"+this.data.title+"</a></h1>";
    html += "<a href=" + this.data.link + " target='_blank' ><img src=https://raw.githubusercontent.com/IGME-RIT/" + this.data.name +
        "/master/igme_thumbnail.png alt=" + this.data.link + "></a>";

    html += "<ul id='tags'>";
    if(this.data.tags.length != 0) {
        for(var i = 0; i < this.data.tags.length; i++) {
            html += "<li style='background-color:" + TutorialTags[this.data.tags[i]] + "'>" + this.data.tags[i] + "</li>";
        }
    }
    html+= "</ul>"

    html += "<p>" + this.data.description + "</p>";
    //console.log(this.data);
    if(this.data.extra_resources.length != 0) {
        html += "<h2>Additional Resources:</h2>";
        html += "<ul>";
        for(var i = 0; i < this.data.extra_resources.length; i++) {
            html += "<li><a href=" + this.data.extra_resources[i].link + ">" + this.data.extra_resources[i].title + "</a></li>";
        }
        html += "</ul>";
    }

    return html;
    */
};

module.exports = DetailsPanel;
