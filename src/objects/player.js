import Phaser from "phaser"
import ItemInfo from "./itemInfo"
import Object from "./object"
import { GAME_DATA } from "../configs/mapConfig"

const EAST = GAME_DATA.DIECTION_EAST
const SOUTH = GAME_DATA.DIECTION_SOUTH
const WEST = GAME_DATA.DIECTION_WEST
const NORTH = GAME_DATA.DIECTION_NORTH


/**
 * 玩家类
 */
export default class Player extends Object {
    constructor(map, name, gridX = 0, gridY = 0, depth = 0, direction=EAST) {

        super(map, "images", gridX, gridY, depth)

        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)
        this.setOrigin(0, 0.7)
        this.setInteractive()

        this.moving = false
        this.moveSpace = map.moveSpace

        this.name = name


        this.direction = direction

        this.directionImage = {
            east : 10,
            south: 12,
            west: 13,
            north: 11
        }
        this.setFrame(this.directionImage[this.direction])

        this.logicX = this.gridX
        this.logicY = this.gridY

        this.info = new ItemInfo(this)

        this.addAnimations()

        map.playerList.push(this)
    }

    /**
     * 添加玩家动画
     */
    addAnimations() {
        this.anims.create({
            key: EAST,
            frames: this.anims.generateFrameNumbers("images", { frames: [10]}),
            repeat: -1,
            frameRate: 8
        })
        this.anims.create({
            key: SOUTH,
            frames: this.anims.generateFrameNumbers("images", { frames: [12] }),
            repeat: -1,
            frameRate: 8
        })
        this.anims.create({
            key: WEST,
            frames: this.anims.generateFrameNumbers("images", { frames: [13] }),
            repeat: -1,
            frameRate: 8
        })
        this.anims.create({
            key: NORTH,
            frames: this.anims.generateFrameNumbers("images", { frames: [11] }),
            repeat: -1,
            frameRate: 8
        })
        this.anims.create({
            key: "northToEast",
            frames: this.anims.generateFrameNumbers("images", { frames: [11, 10] }),
            duration: 1000,
        })
        this.anims.create({
            key: "eastToSouth",
            frames: this.anims.generateFrameNumbers("images", { frames: [10, 12] }),
            duration: 1000
        })
        this.anims.create({
            key: "southToWest",
            frames: this.anims.generateFrameNumbers("images", { frames: [12, 13] }),
            duration: 1000
        })
        this.anims.create({
            key:"westToNorth",
            frames: this.anims.generateFrameNumbers("images", { frames: [13, 11] }),
            duration: 1000
        })
        this.anims.create({
            key: "eastToNorth",
            frames: this.anims.generateFrameNumbers("images", { frames: [10, 11] }),
            duration: 1000
        })
        this.anims.create({
            key: "southToEast",
            frames: this.anims.generateFrameNumbers("images", { frames: [12, 10] }),
            duration: 1000
        })
        this.anims.create({
            key: "westToSouth",
            frames: this.anims.generateFrameNumbers("images", { frames: [13, 12] }),
            duration: 1000
        })
        this.anims.create({
            key: "northToWest",
            frames: this.anims.generateFrameNumbers("images", { frames: [11, 13] }),
            duration: 1000
        })
    }

    /**
     * 获取玩家移动的tween的config，
     * 一般用于做补间动画链
     * @param {*} config 
     * @returns 
     */
    getMoveTween(config) {

        const from = new Phaser.Math.Vector2()
        const to = new Phaser.Math.Vector2()
        this.map.tilemap.tileToWorldXY(config.from.x, config.from.y, from)
        this.map.tilemap.tileToWorldXY(config.to.x, config.to.y, to)

        const tween = {
            targets: this,
            props: {
                x: to.x,
                y: to.y,
                gridX: config.to.x,
                gridY: config.to.y,
            },
            duration: 1000,
            onStart: () => { 
                this.anims.play(config.direction)
                if(config.lineNumber){
                    window.editor.highlightLine(config.lineNumber)
                }   
            }, 
            onComplete: () => {
                if(config.lineNumber){
                    window.editor.removeHighlight(config.lineNumber)
                }
                this.anims.stop(config.direction)
            }
        }
        return tween
    }
    
    getTurnTween(config){
        const tween = {
            targets:this,
            duration: 1000,
            props: {
                z: 1    //巨坑，必须有变化的值，不然不执行tween
            },
            onStart: () => {
               this.anims.play(config.turn)
               if(config.lineNumber){
                    window.editor.highlightLine(config.lineNumber)
                }   
            },
            onComplete: () => {
                if(config.lineNumber){
                    window.editor.removeHighlight(config.lineNumber)
                }
                this.direction = config.direction
                this.setFrame(this.directionImage[config.direction])
            },
        }
        return tween
    }

    /**
     * 
     * @param {*} direction 
     * @returns 
     */
    canMove(direction) {

        let logicX = this.logicX
        let logicY = this.logicY

        if (WEST === direction) logicX -= 1
        else if (EAST === direction) logicX += 1
        else if (NORTH === direction) logicY -= 1
        else if (SOUTH === direction) logicY += 1

        const isOver = logicX < 0 || logicX >= this.map.width ||
            logicY < 0 || logicY >= this.map.height
        return !isOver && this.moveSpace[logicY][logicX] >= 0
    }

    /**
     * 调用这个函数
     * @param {*} step 
     * @returns 
     */
    step(step) {

        for (let i = 0; i < step; i++) {

            let isCanMove = true
            const from = new Phaser.Math.Vector2(this.logicX, this.logicY)
            if (this.direction === NORTH && this.canMove(NORTH)) this.logicY = this.logicY - 1
            else if (this.direction === EAST && this.canMove(EAST)) this.logicX = this.logicX + 1
            else if (this.direction === SOUTH && this.canMove(SOUTH)) this.logicY = this.logicY + 1
            else if (this.direction === WEST && this.canMove(WEST)) this.logicX = this.logicX - 1
            else {
                isCanMove = false
            }

            const to = new Phaser.Math.Vector2(this.logicX, this.logicY)
            
            const data = {
                target: this,
                type: "move",
                direction: this.direction,
                from: from,
                to: to,
                isCanMove: isCanMove,
            }

            if(window.code_running) data.lineNumber =  window.gameAndEditor_data.get('runningCodeLine')

            this.map.moveData.push(data)

            if(!isCanMove) return  
        }

    }

    turnLeft(){
        const data = {
            target: this,
            type: "turn",
        }

        if(window.code_running) data.lineNumber =  window.gameAndEditor_data.get('runningCodeLine')

        if (this.direction === NORTH) {
            data.fromDirection = NORTH
            data.direction = WEST
            data.turn = "northToWest"
        }
        else if (this.direction === EAST) {
            data.fromDirection = EAST
            data.direction = NORTH
            data.turn = "eastToNorth"
        }
        else if (this.direction === SOUTH) {
            data.fromDirection = SOUTH
            data.direction = EAST
            data.turn = "southToEast"
        }
        else if (this.direction === WEST) {
            data.fromDirection = WEST
            data.direction = SOUTH
            data.turn = "westToSouth"
        }
        this.direction = data.direction
        this.map.moveData.push(data)
    }

    turnRight() {

        const data = {
            target: this,
            type: "turn",
        }

        if(window.code_running) data.lineNumber =  window.gameAndEditor_data.get('runningCodeLine')

        if (this.direction === NORTH) {
            data.fromDirection = NORTH
            data.direction = EAST
            data.turn = "northToEast"
        }
        else if (this.direction === EAST) {
            data.fromDirection = EAST
            data.direction = SOUTH
            data.turn = "eastToSouth"
        }
        else if (this.direction === SOUTH) {
            data.fromDirection = SOUTH
            data.direction = WEST
            data.turn = "southToWest"
        }
        else if (this.direction === WEST) {
            data.fromDirection = WEST
            data.direction = NORTH
            data.turn ="westToNorth"
        }
        this.direction = data.direction
        this.map.moveData.push(data)
    }
}