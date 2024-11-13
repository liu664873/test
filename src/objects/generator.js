import ObjConfig from "../configs/ObjConfig"

/**
 * 地图及玩家等生成的类
 */
export default class Generator {

    static generateObj(map, layer, tilePro, x, y){
        if(ObjConfig[tilePro.name]) return new ObjConfig[tilePro.name](map, layer, tilePro.name, x, y);
        else return null
    }
}