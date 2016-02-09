function game(){
}

var p = game.prototype;

p.update = function(){
    //update stuff
    p.act();
    //draw stuff
    p.draw();
}

p.act = function(){
    console.log("ACT");
}

p.draw = function(){
    console.log("DRAW");
}

module.exports = game;