import { playerConfig, propConfig, shipConfig } from "../configs/config"
import Map from "./map"

/**
 * 地图及玩家等生成的类
 */
export default class Generator {

    static generateMap(){
        
    }

    static generatePlayer(map, name, x, y, depth, direction){
        if(playerConfig[name]) return new playerConfig[name](map, name, x, y, depth, direction)
        else return null
    }

    static generateEnergy(map, name, x, y, depth){
        console.log(propConfig[name])
        if(propConfig[name]) return new propConfig[name].type(map, name, x, y, depth)
        else return null
    }

    static generateShip(map, name, x, y, depth, direction){
        if(shipConfig[name]) return new shipConfig[name](map, name, x, y, depth, direction)
        else return null
    }
}