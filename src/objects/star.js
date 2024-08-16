import Prop from "./prop"

/**
 * 实体类star
 * 游戏道具
 */
export default class Star extends Prop {
    constructor(map, name, gridX = 0, gridY = 0, depth = 0) {

        super(map, name, gridX, gridY, depth)

        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)
        this.setOrigin(-1, 0.6)
        
    }

}