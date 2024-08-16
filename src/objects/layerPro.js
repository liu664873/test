import Phaser from "phaser"



/**
 * 图层属性
 * type为图层类型，如建筑图层build，道具图层prop等等
 * depth为图层深度，depth是以map为基准，不是以scenen
 */
export default class LayerPro {
    type    //类型
    depth   //深度
    constructor(params) {
        if(Array.isArray(params)) {
            params.forEach(e => {
                if(e.name == "type") this.type = e.value
                else if(e.name == "depth") this.depth = e.value
            });
        }
    }
    
    getType(){ return this.type }

    getDepth() { return this.depth }
}