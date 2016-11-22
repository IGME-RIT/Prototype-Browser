"use strict"

function SearchPanel(graph) {
    this.graph = graph;
    this.open = false;
    this.transitionOn = false;
    this.transitionTime = 0;
    this.optionsDiv = document.getElementById("leftBar");
    this.searchButton = document.getElementById("searchbutton");
    
    
    this.searchButton.addEventListener("click", function (that) {
        
        // Collect all information for the query
        var query = [];
        
        // get text input if there is any
        var param1 = {
            type: "Text",
            value: document.getElementById("searchtextfield").value
        };
        if(param1.value != "") {
            query.push(param1);
        }
        
        // get language input if there is any
        var param2 = {
            type: "Language",
            value: document.getElementById("searchlanguagefield").value
        };
        if(param2.value != "Any") {
            query.push(param2);
        }
        
        // get tags input if there is any
        var param3 = {
            type: "Tag",
            value: document.getElementById("searchtagfield").value
        };
        if(param3.value != "Any") {
            query.push(param3);
        }
        
        
        //parse data to find matching results
        var searchResults = that.search(query, that.graph.nodes);
        
        
        
        //display results
        var listElement = document.getElementById("searchresults");
        if(searchResults.length == 0) {
            listElement.innerHTML = "No Matching Results Found.";
            return;
        }
        
        listElement.innerHTML = "";
        
        
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
            listElement.appendChild(li);
        }
    }.bind(this.searchButton, this));
};



// This search supports multiple tags of each type, but the actual search doesn't use that functionality.
// Searches by narrowing down results. Anything that doesn't match all 3 criteria fails the test.
SearchPanel.prototype.search = function(query, nodes) {
    var results = [];
    
    
    for(var i = 0; i < nodes.length; i++) {
        var node = nodes[i].data;
        var match = true;
        for(var j = 0; j < query.length; j++) {
            // Text search compares against any text in the demo
            // If it doesnt find the string anywhere it fails the search immediately
            if(query[j].type === "Text") {
                if(node.title.toLowerCase().indexOf(query[j].value.toLowerCase()) === -1) {
                    if(node.series.toLowerCase().indexOf(query[j].value.toLowerCase()) === -1) {
                        if(node.description.toLowerCase().indexOf(query[j].value.toLowerCase()) === -1) {
                            match = false;
                            break; // no match. don't compare anything else for this repo.
                        }
                    }
                }
            }
            // language must match selected language
            else if(query[j].type === "Language") {
                if(node.language !== query[j].value) {
                    match = false;
                    break;
                }
            }
            // tag must match selected tag
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