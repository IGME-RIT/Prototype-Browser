"use strict"

var queryData = [];

function updateQueryData() {
    var list = document.getElementById("QueryListData");
    list.innerHTML = "";
    if(queryData.length > 0) {
        for(var i = 0; i < queryData.length; i++) {
            list.innerHTML += "<li>" + queryData[i].type + ": " + queryData[i].value + "</li>";
        }
        document.getElementById("clearquerybutton").style.display = "inline";
    }
    else {
        document.getElementById("clearquerybutton").style.display = "none";
    }
};

document.getElementById("searchtextbutton").onclick = function() {
    var query = {
        type: "Text",
        value: document.getElementById("searchtextfield").value
    };
    if(query.value == "")
        return;
    queryData.push(query);
    updateQueryData();
};


document.getElementById("searchlanguagebutton").onclick = function() {
    var query = {
        type: "Language",
        value: document.getElementById("searchlanguagefield").value
    };
    if(query.value == "Any")
        return;
    queryData.push(query);
    updateQueryData();
};

document.getElementById("searchtagbutton").onclick = function() {
    var query = {
        type: "Tag",
        value: document.getElementById("searchtagfield").value
    };
    if(query.value == "Any")
        return;
    queryData.push(query);
    updateQueryData();
};

document.getElementById("clearquerybutton").onclick = function() {
    queryData = [];
    updateQueryData();
};

document.getElementById("searchbutton").onclick = function() {
    
};


function SearchPanel(graph) {
    this.graph = graph;
    this.open = false;
    this.transitionOn = false;
    this.transitionTime = 0;
    this.optionsDiv = document.getElementById("leftBar");
    
    this.searchButton = document.getElementById("searchbutton");
    
    
    this.searchButton.addEventListener("click", function (that) {
        //parse data to find matching results
        var searchResults = that.search(queryData, that.graph.nodes);
        
        //display results
        var div = document.getElementById("searchresults");
        if(searchResults.length == 0) {
            div.innerHTML = "No Matching Results Found.";
            return;
        }
        
        div.innerHTML = "";
        
        
        for(var i = 0; i < searchResults.length; i++) {
            //create list tag
            var li = document.createElement("li");
            //set title as text
            li.innerHTML = searchResults[i].data.title;
            //add event to focus the node if its clicked
            li.addEventListener("click", function(that, node) {
                that.graph.FocusNode(node);
            }.bind(li, that, searchResults[i]));
            //add the tag to the page
            div.appendChild(li);
        }
    }.bind(this.searchButton, this));
};




SearchPanel.prototype.search = function(query, nodes) {
    var results = [];
    
    
    for(var i = 0; i < nodes.length; i++) {
        var node = nodes[i].data;
        var match = true;
        for(var j = 0; j < query.length; j++) {
            if(query[j].type === "Text") {
                if(node.title.toLowerCase().indexOf(query[j].value.toLowerCase()) === -1) {
                    if(node.series.toLowerCase().indexOf(query[j].value.toLowerCase()) === -1) {
                        if(node.description.toLowerCase().indexOf(query[j].value.toLowerCase()) === -1) {
                            match = false;
                            break;
                        }
                    }
                }
            }
            else if(query[j].type === "Language") {
                if(node.language !== query[j].value) {
                    match = false;
                    break;
                }
            }
            else {
                var tagMatch = false;
                for(var k = 0; k < node.tags.length; k++) {
                    if(node.tags[k] == query[j].value) {
                        tagMatch = true;
                    }
                }
                if(tagMatch == false) {
                    match = false;
                    break;
                }
            }
        }
        //if we passed all that crap, we have a match!
        if(match === true) { 
            results.push(nodes[i]);
        }
    }
    
    return results;
};


SearchPanel.prototype.update = function(canvasState, time) {
    
    //transition on
    if(this.transitionOn) {
        if(this.transitionTime < 1) {
            this.transitionTime += time.deltaTime * 3;
            if(this.transitionTime >= 1) {
                //done transitioning
                this.transitionTime = 1;
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
                this.open = false;
            }
        }
    }
};



module.exports = SearchPanel;