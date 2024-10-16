import Object from "./object";

/**
 * 拥有动态性的object，有方向，可以移动等等
 * 未完成
 */
export default class DynamicEntity extends Object {
    constructor(map, name, direction = LEFT, gridX = 0, gridY = 0, depth = 0){

        super(map, name, gridX, gridY, depth)

        this.direction = direction

    }

    
}