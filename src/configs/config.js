import Energy from "../objects/Energy"
import Player from "../objects/player"
import Ship from "../objects/ship"

//地图数据加载配置
const propConfig = {

    //蓝宝石
    bule1_crystal: {
        type: Energy,
        imageKey: "images1",
        imgPath: 'assets/images/images1.png',   //暂时没有用
        dfImage: 40,
        anims:[
            {
                key: "idle",
                frames: {start: 40, end: 49},
                repeat: -1,
                frameRate: 8
            }]
    },

    bule2_crystal: {
        type: Energy,
        imageKey: "images1",
        imgPath: 'assets/images/images1.png',
        dfImage: 50,
        anims:[
            {
                key: "idle",
                frames: {start: 50, end: 59},
                repeat: -1,
                frameRate: 8
            }]
    },

    green_crystal: {
        type: Energy,
        imageKey: "images1",
        imgPath: 'assets/images/images1.png',
        dfImage: 60,
        anims:[
            {
                key: "idle",
                frames: {start: 60, end: 69},
                repeat: -1,
                frameRate: 8
            }]
    },

    red_crystal: {
        type: Energy,
        imageKey: "images1",
        imgPath: 'assets/images/images1.png',
        dfImage: 31,
        anims:[
            {
                key: "idle",
                frames: {start: 30, end: 39},
                repeat: -1,
                frameRate: 8
            }]
    },
}


const playerConfig = {
    "player": Player
}

const shipConfig = {
    "ship": Ship
}

export { propConfig, playerConfig, shipConfig };