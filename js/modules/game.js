var Board = require('./board.js');

function game(){
}

var p = game.prototype;

p.update = function(ctx, canvas, dt, center, activeHeight){
    //update stuff
    p.act();
    //draw stuff
    p.draw(ctx, canvas);
}

p.act = function(){
    console.log("ACT");
}

p.draw = function(ctx, canvas){
    console.log(canvas.offsetHeight);
    //draw board
    ctx.save();
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    ctx.restore();
    //draw lesson nodes
}

module.exports = game;