import { playerConfig, propConfig, shipConfig } from "../configs/config"

export default class Generator {

    static generateMap(){
        
    }

    static generatePlayer(map, name, x, y, depth, direction){
        if(playerConfig[name]) return new playerConfig[name](map, name, x, y, depth, direction)
        else return null
    }

    static generateEnergy(map, name, x, y, depth){
        if(propConfig[name]) return new propConfig[name](map, name, x, y, depth)
        else return null
    }

    static generateShip(map, name, x, y, depth, direction){
        if(shipConfig[name]) return new shipConfig[name](map, name, x, y, depth, direction)
        else return null
    }
}