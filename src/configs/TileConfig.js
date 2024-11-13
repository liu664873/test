import { GAME_DATA } from "./Config"

const TileConfig = {

    player: {
        imageKey: "player",
        dfImage: 0,
        health: 100,
        offset: {
            x: 0,
            y: -80
        },
        originScale: 0.4,
        info: {
            showInfo: true,
            offset: {
                x: 0,
                y: -GAME_DATA.TILE_HEIGHT*3/2
            }
        },
        anims:[
            {
                key: GAME_DATA.ANIM_KEY_IDLE_EAST,
                frames: {start: 6, end: 8},
                repeat: -1,
                frameRate: 8,
                yoyo: true
            },
            {
                key: GAME_DATA.ANIM_KEY_IDLE_NORTH,
                frames: {start: 12, end: 14},
                repeat: -1,
                frameRate: 8,
                yoyo: true
            },
            {
                key: GAME_DATA.ANIM_KEY_IDLE_SOUTH,
                frames: {start: 0, end: 2},
                repeat: -1,
                frameRate: 8,
                yoyo: true
            },
            {
                key: GAME_DATA.ANIM_KEY_IDLE_WEST,
                frames: {start: 18, end: 20},
                repeat: -1,
                frameRate: 8,
                yoyo: true
            },
            {
                key: GAME_DATA.ANIM_KEY_STEP_EAST,
                frames: {start: 9, end: 11},
                repeat: -1,
                frameRate: 8,
                yoyo: true
            },
            {
                key: GAME_DATA.ANIM_KEY_STEP_SOUTH,
                frames: {start: 3, end: 5},
                repeat: -1,
                frameRate: 8,
                yoyo:true
            },
            {
                key: GAME_DATA.ANIM_KEY_STEP_WEST,
                frames: {start: 21, end: 23},
                repeat: -1,
                frameRate: 8
            },
            {
                key: GAME_DATA.ANIM_KEY_STEP_NORTH,
                frames: {start: 15, end: 17},
                repeat: -1,
                frameRate: 8,
                yoyo: true
            },
            {
                key: GAME_DATA.ANIM_KEY_TURN_NORTH_EAST,
                frames: {frames: [15, 9]},
                duration: 1000,
            },
            {
                key: GAME_DATA.ANIM_KEY_TURN_EAST_SOUTH,
                frames: {frames: [9, 3]},
                duration: 1000
            },
            {
                key: GAME_DATA.ANIM_KEY_TURN_SOUTH_WEST,
                frames: {frames: [3, 21]},
                duration: 1000
            },
            {
                key: GAME_DATA.ANIM_KEY_TURN_WEST_NORTH,
                frames: {frames: [21, 15]},
                duration: 1000
            },
            {
                key: GAME_DATA.ANIM_KEY_TURN_EAST_NORTH,
                frames: {frames: [9, 15]},
                duration: 1000
            },
            {
                key: GAME_DATA.ANIM_KEY_TURN_SOUTH_EAST,
                frames: {frames: [3, 9]},
                duration: 1000
            },
            {
                key: GAME_DATA.ANIM_KEY_TURN_WEST_SOUTH,
                frames: {frames: [21, 3]},
                duration: 1000
            },
            {
                key: GAME_DATA.ANIM_KEY_TURN_NORTH_WEST,
                frames: {frames: [15, 21]},
                duration: 1000
            }
            
        ]
    },

    ship: {
        imageKey: "ship",
        dfImage: 0,
        health: 100,
        offset: {
            x: 0,
            y: -45
        },
        originScale: 0.5,
        info: {
            showInfo: true,
            offset: {
                x: 0,
                y: -GAME_DATA.TILE_HEIGHT*3/2
            }
        },
        anims:[
            {
                key: GAME_DATA.ANIM_KEY_IDLE_EAST,
                frames: {start: 3, end: 3},
                repeat: -1,
                frameRate: 8,
                yoyo: true
            },
            {
                key: GAME_DATA.ANIM_KEY_IDLE_NORTH,
                frames: {start: 9, end: 9},
                repeat: -1,
                frameRate: 8,
                yoyo: true
            },
            {
                key: GAME_DATA.ANIM_KEY_IDLE_SOUTH,
                frames: {start: 0, end: 0},
                repeat: -1,
                frameRate: 8,
                yoyo: true
            },
            {
                key: GAME_DATA.ANIM_KEY_IDLE_WEST,
                frames: {start: 6, end: 6},
                repeat: -1,
                frameRate: 8,
                yoyo: true
            },
            {
                key: GAME_DATA.ANIM_KEY_STEP_EAST,
                frames: {start: 3, end: 5},
                repeat: -1,
                frameRate: 8,
                yoyo: true
            },
            {
                key: GAME_DATA.ANIM_KEY_STEP_SOUTH,
                frames: {start: 0, end: 2},
                repeat: -1,
                frameRate: 8,
                yoyo:true
            },
            {
                key: GAME_DATA.ANIM_KEY_STEP_WEST,
                frames: {start: 6, end: 8},
                repeat: -1,
                frameRate: 8
            },
            {
                key: GAME_DATA.ANIM_KEY_STEP_NORTH,
                frames: {start: 9, end: 11},
                repeat: -1,
                frameRate: 8,
                yoyo: true
            },
            {
                key: GAME_DATA.ANIM_KEY_TURN_NORTH_EAST,
                frames: {frames: [9, 3]},
                duration: 1000,
            },
            {
                key: GAME_DATA.ANIM_KEY_TURN_EAST_SOUTH,
                frames: {frames: [3, 0]},
                duration: 1000
            },
            {
                key: GAME_DATA.ANIM_KEY_TURN_SOUTH_WEST,
                frames: {frames: [0, 6]},
                duration: 1000
            },
            {
                key: GAME_DATA.ANIM_KEY_TURN_WEST_NORTH,
                frames: {frames: [6, 9]},
                duration: 1000
            },
            {
                key: GAME_DATA.ANIM_KEY_TURN_EAST_NORTH,
                frames: {frames: [9, 15]},
                duration: 1000
            },
            {
                key: GAME_DATA.ANIM_KEY_TURN_SOUTH_EAST,
                frames: {frames: [0, 3]},
                duration: 1000
            },
            {
                key: GAME_DATA.ANIM_KEY_TURN_WEST_SOUTH,
                frames: {frames: [6, 0]},
                duration: 1000
            },
            {
                key: GAME_DATA.ANIM_KEY_TURN_NORTH_WEST,
                frames: {frames: [9, 6]},
                duration: 1000
            }
            
        ]
    },

    //蓝宝石
    bule1_crystal: {
        imageKey: "energy",
        dfImage: 15,
        offset: {
            x: 0,
            y: -30
        },
        info: {
            showInfo: true,
            offset: {
                x: 0,
                y: -GAME_DATA.TILE_HEIGHT
            }
        },
        originScale: 0.4,
        anims:[
            {
                key: GAME_DATA.ANIM_KEY_IDLE,
                frames: {start: 15, end: 17},
                repeat: -1,
                frameRate: 8
            }]
    },

    bule2_crystal: {
        imageKey: "energy",
        dfImage: 6,
        offset: {
            x: 0,
            y: -30
        },
        info: {
            showInfo: true,
            offset: {
                x: 0,
                y: -GAME_DATA.TILE_HEIGHT
            }
        },
        originScale: 0.4,
        anims:[
            {
                key: GAME_DATA.ANIM_KEY_IDLE,
                frames: {start: 6, end: 8},
                repeat: -1,
                frameRate: 8
            }]
    },

    green_crystal: {
        imageKey: "energy",
        dfImage: 3,
        offset: {
            x: 0,
            y: -30
        },
        originScale: 0.4,
        info: {
            showInfo: true,
            offset: {
                x: 0,
                y: -GAME_DATA.TILE_HEIGHT
            }
        },
        anims:[
            {
                key: GAME_DATA.ANIM_KEY_IDLE,
                frames: {start: 3, end: 5},
                repeat: -1,
                frameRate: 8
            }]
    },

    red_crystal: {
        imageKey: "energy",
        dfImage: 9,
        offset: {
            x: 0,
            y: -30
        },
        info: {
            showInfo: true,
            offset: {
                x: 0,
                y: -GAME_DATA.TILE_HEIGHT
            }
        },
        originScale: 0.4,
        anims:[
            {
                key: GAME_DATA.ANIM_KEY_IDLE,
                frames: {start: 9, end: 11},
                repeat: -1,
                duration: 1000
            }]
    },
}

export default TileConfig