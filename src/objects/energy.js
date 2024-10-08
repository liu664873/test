import Prop from "./prop"
import ItemInfo from "./itemInfo"

/**
 * 实体类star
 * 游戏道具
 */
export default class Energy extends Prop {
    constructor(map, name, gridX = 0, gridY = 0, depth = 0) {

        super(map, "images",  gridX, gridY, depth, 6)

        this.setOrigin(0, 0.7)
        this.name = name
        this.info = new ItemInfo(this)
    }

}