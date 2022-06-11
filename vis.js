class VIS{
    constructor(NN = null, X = null, Y = null, specs = {layerSep : 100, nodeSep : 30, nodeRad : 5, }){
        this.layerSep = specs.layerSep | 100;
        this.nodeSep = specs.nodeSep | 30;
        this.nodeRad = specs.nodeRad | 5;
        this.layers = 0;
        this.maxNodesPerLayer = 0;
        this.nn = NN;
        this.vis = document.createElement("canvas");
        if(isFinite(X) && isFinite(Y)){
            this.vis.style.position = "absolute";
            this.vis.style.top = Y;
            this.vis.style.left = X;
        }
        this.ctx = this.vis.getContext("2d");
        this.intervalCallerId = 0;
        this.template = [];
        this.paddingX = 10;
        this.paddingY = 10;
    }
    init(NN){
        if(NN)this.nn = NN;
        document.getElementsByTagName("body")[0].appendChild(this.vis);
        this.layers = this.nn.layers;
        this.maxNodesPerLayer = 2;
        for(let i=0;i<this.layers;i++){
            let a = [];
            this.maxNodesPerLayer = Math.max(this.maxNodesPerLayer, this.nn.nodes[i]);
            for(let j=0;j<this.nn.nodes[i];j++){
                a.push([i*this.layerSep+this.paddingX,j*this.nodeSep+this.paddingY]);
            }
            this.template.push(a);
        }
        this.vis.width = (this.layers - 1) * this.layerSep + 2*this.paddingX;
        this.vis.height = (this.maxNodesPerLayer - 1) * this.nodeSep + 2*this.paddingY;
        this.ctx.clearRect(0,0,this.vis.width,this.vis.height);
        this.ctx.fillStyle = this.background;
        this.ctx.fillRect(0,0,this.vis.width,this.vis.height);
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.update();
    }
    autoUpdate(timeStep=100){
        this.intervalCallerId = setInterval(()=>{
            this.update();
        },timeStep);
        return this.intervalCallerId;
    }
    stopAutoUpdate(){
        if(this.intervalCallerId)
            clearInterval(this.intervalCallerId);
        this.intervalCallerId = 0;
    }
    update(){
        this.ctx.clearRect(0,0,this.vis.width,this.vis.height);
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0,0,this.vis.width,this.vis.height);
        if(this.template.length==0){
            console.log("Initialise the visualiser first -- `VIS.init()`");
            this.stopAutoUpdate();
            return;
        }
        try{
            let t,l1,l2;
            let x = 0, y = 1;
            for(let i=0;i<this.layers - 1;i++){
                t=i+1;
                l1 = this.template[i].length;
                l2 = this.template[t].length;
                let values = this.nn.weights[i].toArray();
                for(let j=0;j<l1;j++){
                    for(let k=0;k<l2;k++){
                        this.drawEdge(this.template[i][j][x], this.template[i][j][y], 
                            this.template[t][k][x], this.template[t][k][y], values[j * l2 + k]+1);
                    }
                }
            }
            for(let i=0;i<this.layers;i++){
                let v = this.nn.values[i%this.layers].toArray();
                for(let j=0;j<this.template[i].length;j++){
                    this.drawNode(this.template[i][j][0],this.template[i][j][1],this.nodeRad,v[j]);
                }
            }
        }
        catch(e){
            console.error(e);
            this.stopAutoUpdate();
        }
    }
    drawNode(x,y,rad,val,value_max=1){
        let ctx= this.ctx;
        // console.log(val);
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.arc(x,y,rad,0,2*Math.PI);
        ctx.stroke();
        if(val>value_max||isNaN(val))ctx.fillStyle = "white";
        else 
        ctx.fillStyle = "rgb(" + 255 * (val/value_max) + "," + 0 + "," + 0 +")";
        ctx.fill();
        ctx.closePath();
    }
    drawEdge(fromX,fromY,toX,toY,value,value_max=2){
        let ctx = this.ctx;
        if(value>value_max||isNaN(value))ctx.strokeStyle = "white";
        // console.log("rgb(" + 255 * (value/value_max) + "," + 100 + "," + 255 * ((value_max-value)/value_max)+")");
        else
        ctx.strokeStyle = "rgb(" + 255 * (value/value_max) + "," + 100 + "," + 255 * ((value_max-value)/value_max)+")";
        ctx.beginPath();
        ctx.moveTo(fromX,fromY);
        ctx.lineTo(toX,toY);
        ctx.stroke();
        ctx.closePath();
    }
}