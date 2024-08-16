import Object from "./object";
import ItemInfo from "./itemInfo";

/**
 * 道具的基类
 */

export default class Prop extends Object{
    constructor(map, name, gridX = 0, gridY = 0, depth = 0){
        
        super(map, name, gridX, gridY, depth)
        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)

        this.setInteractive()
        this.info = new ItemInfo(this)
    }
}