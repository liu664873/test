import {propConfig} from "../configs/config"
import {playerConfig} from "../configs/config"

export default class Generator {

    static generateMap(){
        
    }

    static generatePlayer(map, name, x, y, depth){
        if(playerConfig[name]) return new playerConfig[name](map, name, x, y, depth)
        else return null
    }

    static generateProp(map, name, x, y, depth){
        if(propConfig[name]) return new propConfig[name](map, name, x, y, depth)
        else return null
    }
}