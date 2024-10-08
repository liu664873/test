import Phaser from "phaser"

const tileOffset = {
    images: {
        x: 0,
        y: 250
    },
    grid: {
        x: 0,
        y: 250
    }
}

const layerOffset = {
    x: 0,
    y: -50
}

const GAME_DATA = {
    DIECTION_EAST: "east",
    DIECTION_SOUTH: "south",
    DIECTION_WEST: "west",
    DIECTION_NORTH: "north",

}


export {tileOffset, layerOffset, GAME_DATA }