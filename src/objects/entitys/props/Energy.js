import Prop from "../../base/Prop"
import { GAME_DATA } from "../../../configs/Config"

/**
 * 实体类energy
 * 游戏道具
 */
export default class Energy extends Prop {
    constructor(map, layer, name, gridX = 0, gridY = 0) {
        super(map, layer, name,  gridX, gridY)
        this.depth = this.depth + 0.1;
        this.playAnim(GAME_DATA.ANIM_KEY_IDLE)
    }

    createProxy() {
        const handler = {
            get(target, prop, receiver) {
                // 如果访问的属性是 x 则返回gridX 或 y返回gridY。
                if (prop === 'x') return target.gridX;
                else if(prop === 'y') return target.gridY;
            },

        };
        return new Proxy(this, handler);
    }
}