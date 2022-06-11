
let className = '.interstitial-wrapper';


let players = [];
let playerCount = 100;
let vi;

let bestNN = [];
let bestScore = 0;
var count =0;
var game = null;
var looking = false;


function AIinit(){
    game = new Runner(className)
    vi = new VIS(null , 0, 0);
    addPlayers(playerCount, game.trex);
    train();
}

function train(){
    count = 0;
    startInactivePlayers();
}
var change=0;
function redo(){
    game.restart();
    players.sort((a,b)=>{
        return b.score - a.score;
    });
    console.log(players.slice().map(x => x.score));
    console.log("done " + "[ "+players[0].score+" ]");
    let k = 21;
    for(let i=0;i<5;i++){
        for(let j=0;j<5;j++){
            if(j==i) continue;
            if(i>=playerCount || j>=playerCount || k>=playerCount) continue;
            players[k++].nn = cross_over(players[i].nn,players[j].nn);
            // if(k>=playerCount) break;
            // players[k++].nn = cross_over2(players[i].nn,players[j].nn);
        }
    }
    while(k<playerCount){
        players[k++].nn = new NeuralNetwork([7, 2]);
    }
    startInactivePlayers();
}

function cross_over2(NN1, NN2){
    let nn = NN1.copy();
    nn.merge(NN2,0.5);
    nn.mutate(function(x){
        var r=Math.random();
        if(r<0.1)
            return x+Math.random()*0.1;
        else if(r<0.2)
            return x-Math.random()*0.1;
        else return x;
    })
    return nn;
}



function addPlayers(num, trex){
    players.push(new Player(trex[0], vi));
    for(let i=1;i<num;i++){
        players.push(new Player(trex[i]));
    }
}

function startInactivePlayers(){
    players.forEach(player => {
        if(!player.playing){
            player.start();
        }
    });
}

function Player(trex, vi, NN){
    this.tRex = trex;
    this.vi = null;
    this.nn = null;
    this.score =0;
    if(NN) this.nn = NN;
    else this.nn = new NeuralNetwork([7, 2]);
    if(vi){
        this.vi = vi;
    }
}
let f=true;
Player.prototype = {
    start : function(){
        if(this.vi){
            this.vi.init(this.nn);
        }
        // this.game.onKeyDown({keyCode : 32});
        this.play();
    },
    play : function(){
        let obs = game.horizon.obstacles;
        if(this.tRex.status!="CRASHED"){
            var inputs = [0, 0, 0, 0, 0, 0, 0];
            if(obs[0]) {
                inputs[0] = (obs[0].xPos+obs[0].width/2)/(game.dimensions.WIDTH+150);
                inputs[1] = obs[0].yPos/game.dimensions.HEIGHT;
                inputs[2] = obs[0].width/100;
                inputs[3] = obs[0].type == 'PTERODACTYL' && obs[0].HEIGHT > 100;
                inputs[4] = game.currentSpeed/game.config.MAX_SPEED;
                inputs[5] = this.tRex.yPos/game.dimensions.HEIGHT;
                inputs[6] = obs[1]?1/obs[0].gap:0;
            }
            // console.log(inputs);
                // let x = (obs[0].xPos)/(game.dimensions.WIDTH+100) + obs[0].width;
                // let v = (game.currentSpeed)/16;
                // let inputs = []
                // inputs.push(obs[0].xPos/(game.dimensions.WIDTH+150));
                // inputs.push(obs[0].width/60);
                // inputs.push(game.currentSpeed/16);
                // inputs.push(this.tRex.yPos/game.dimensions.HEIGHT);
                // inputs.push(obs[1]?(obs[1].xPos-obs[0].xPos)/game.dimensions.WIDTH:1);
                // let t = 0;
                // if(obs.length>1)t = obs[1].width;
                // out = this.nn.query([1-(obs[0].xPos)/(game.dimensions.WIDTH+150),(obs[0].yPos)/game.dimensions.HEIGHT,(obs[0].width)/60 , t/60])  ;//,(game.currentSpeed-6)/10])
                // out = this.nn.query([x/v/100,(obs[0].yPos)/game.dimensions.HEIGHT]);
                // x/v is not dependent on system state.. not just on "when to jump".. so unusable.
                // x is usable
            let out = this.nn.query(inputs);
            if(out[1]>out[0]){
                if (!this.tRex.jumping && !this.tRex.ducking) {
                    this.tRex.speedDrop = false;
                    this.tRex.setDuck(false);
                    this.tRex.startJump(game.currentSpeed);
                    this.tRex.endJump();
                }
            }
            else {
                if (this.tRex.jumping) {
                    // Speed drop, activated only when jump key is not pressed.
                        this.tRex.setSpeedDrop();
                } else if (!this.tRex.jumping && !this.tRex.ducking) {
                    // Duck.
                    this.tRex.setDuck(true);
                    this.tRex.speedDrop = false;
                    // setTimeout(()=>{
                    //     this.tRex.setDuck(false);
                    // },500);
                }
            }
            if(looking) {
                this.vi = vi;
                this.vi.init(this.nn);
                looking = false;
            }
            if(this.vi)
                this.vi.update();
            setTimeout(()=>{this.play()}, game.msPerFrame);
        } else {
            if(this.vi) looking=true;
            // game.canvasCtx.clearRect(0,0,game.dimensions.WIDTH,game.dimensions.HEIGHT);
            this.done();
        }
    },
    done : function() {
        let d = Math.round(this.tRex.distanceRan * 0.025)
        this.score = d;
        // console.log(d);
        if(d>bestScore){
            // console.log(d , players.indexOf(this));
            // bestNN.push(this.nn.copy());
            // if(bestNN.length>3)bestNN.shift();
            bestScore = d;
        }
        count++;
        console.log("dead");
        if(count == playerCount){
            count=0;
            redo();
        }
    },
    clone : function(NN , lr = 0.1) {
        this.nn = NN.copy();
        this.nn.mutate((val,i,j)=>{return val + lr*(Math.random()-.5)*2*(1-sigmoid(bestScore)/100);});
    }
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

function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }