import Prop from "./prop"
import ItemInfo from "./itemInfo"
import { propConfig } from "../configs/config"

/**
 * 实体类star
 * 游戏道具
 */
export default class Energy extends Prop {
    constructor(map, name, gridX = 0, gridY = 0, depth = 0) {
        if(!propConfig[name]) return null

        super(map, propConfig[name].imageKey,  gridX, gridY, depth, propConfig[name].dfImage)

        this.setOrigin(0, 0.65)
        this.name = name
        this.info = new ItemInfo(this)
        this.addAnims()
        // if(this.anims.get("idle")) this.anims.play("idle")
    }

    addAnims(){
       propConfig[this.name].anims.forEach(anim => {
        const config = { ...anim }
        if(config.frames) config.frames = this.anims.generateFrameNumbers(this.name, config.frames),
        this.anims.create({ config })
       });
    }

}