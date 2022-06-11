

let layers = 4;
let nodesPerLayer = 4;
let layerSep = 100;
let nodeSep = 30;
let obs;
let nn;


let vis = document.createElement("canvas");
vis.width = (layers+2) * layerSep;
vis.height = (nodesPerLayer + 2) * nodeSep;
let ctx = vis.getContext("2d");
function AIinit(){
    document.getElementsByTagName("body")[0].appendChild(vis);
    ctx.fillStyle = "black";
    ctx.strokeStyle = 'black';
    ctx.fillRect(0,0,vis.width,vis.height);
    obs = Runner.instance_.horizon.obstacles;
    nn = new NeuralNetwork([4,4,4,4]);
    updateVis();
    t=setInterval(()=>{
        nn.step()
        // console.log(nn.values[0]);
        // console.log(nn.values[1]);
        // console.log(nn.values[2]);
    },10);
    // console.log(t);
    // console.log(nn.values[0]);
}





/*
    Runner.instance_.horizon.obstacles = > 
        .xpos
        .ypos
        .width
        .collisionBoxes =>
        [3]
        .x
        .y
        .width
        .height
        
        Make collision box adjustments,
        Central box is adjusted to the size as one box.
        ____        ______        ________
        _|   |-|    _|     |-|    _|       |-|
        | |<->| |   | |<--->| |   | |<----->| |
        | | 1 | |   | |  2  | |   | |   3   | |
        |_|___|_|   |_|_____|_|   |_|_______|_|
        
        this.collisionBoxes[1].width = this.width - this.collisionBoxes[0].width -
        this.collisionBoxes[2].width;
        this.collisionBoxes[2].x = this.width - this.collisionBoxes[2].width;
        
            the three cactus are merged it basically means
        //gap

    Input should be :
    for only the first visible object
        distance : xpos
        height : ypos
        width : width
    speed

    Runner.instance_.currentSpeed    

*/



