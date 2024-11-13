import TileObj from "./TileObj";

/**
 * 道具的基类
 */

export default class Prop extends TileObj{
    constructor(map, layer, name, gridX = 0, gridY = 0){

        super(map, layer, name,  gridX, gridY)

    }
}