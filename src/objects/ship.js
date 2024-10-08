import Phaser from "phaser"
import ItemInfo from "./itemInfo"
import Object from "./object"
import { GAME_DATA } from "../configs/mapConfig"

const EAST = GAME_DATA.DIECTION_EAST
const SOUTH = GAME_DATA.DIECTION_SOUTH
const WEST = GAME_DATA.DIECTION_WEST
const NORTH = GAME_DATA.DIECTION_NORTH


export default class Ship extends Object{
    constructor(map, name, gridX, gridY, depth, direction=EAST){
        super(map, "images", gridX, gridY, depth, 7)
  
        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)
        this.setDepth(depth)
        // this.setScale(0.9)
        this.setOrigin(0, 0.7)
        this.setInteractive()
        this.name = name

        this.direction = direction

        this.directionImage = {
            east : 16,
            south: 17,
            west: 18,
            north: 7
        }
        
        this.setFrame(this.directionImage[this.direction])

        this.driver = null  //驾驶者，实际就是代表是否载人
        this.moveSpace = map.moveSpace

        this.logicX = this.gridX
        this.logicY = this.gridY

        this.info = new ItemInfo(this)
        this.addAnimations()

        this.moveSpace[gridY][gridX] = 1

        map.shipList.push(this)

    }
    
    /**
     * 添加玩家动画
     */
    addAnimations() {
        this.anims.create({
            key: EAST,
            frames: this.anims.generateFrameNumbers("images", { frames: [16]}),
            repeat: -1,
            frameRate: 8
        })
        this.anims.create({
            key: SOUTH,
            frames: this.anims.generateFrameNumbers("images", { frames: [17] }),
            repeat: -1,
            frameRate: 8
        })
        this.anims.create({
            key: WEST,
            frames: this.anims.generateFrameNumbers("images", { frames: [18] }),
            repeat: -1,
            frameRate: 8
        })
        this.anims.create({
            key: NORTH,
            frames: this.anims.generateFrameNumbers("images", { frames: [7] }),
            repeat: -1,
            frameRate: 8
        })
        this.anims.create({
            key: "northToEast",
            frames: this.anims.generateFrameNumbers("images", { frames: [7, 16] }),
            duration: 1000,
        })
        this.anims.create({
            key: "eastToSouth",
            frames: this.anims.generateFrameNumbers("images", { frames: [16, 17] }),
            duration: 1000
        })
        this.anims.create({
            key: "southToWest",
            frames: this.anims.generateFrameNumbers("images", { frames: [17, 18] }),
            duration: 1000
        })
        this.anims.create({
            key:"westToNorth",
            frames: this.anims.generateFrameNumbers("images", { frames: [18, 7] }),
            duration: 1000
        })
        this.anims.create({
            key: "eastToNorth",
            frames: this.anims.generateFrameNumbers("images", { frames: [16, 7] }),
            duration: 1000
        })
        this.anims.create({
            key: "southToEast",
            frames: this.anims.generateFrameNumbers("images", { frames: [17, 16] }),
            duration: 1000
        })
        this.anims.create({
            key: "westToSouth",
            frames: this.anims.generateFrameNumbers("images", { frames: [18, 17] }),
            duration: 1000
        })
        this.anims.create({
            key: "northToWest",
            frames: this.anims.generateFrameNumbers("images", { frames: [7, 18] }),
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
            targets: config.driver ? [this, config.driver] : this,
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
                this.anims.stop(config.direction)
                if(config.lineNumber){
                    window.editor.removeHighlight(config.lineNumber)
                }
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
                this.setFrame(this.directionImage[config.direction])
                if(config.lineNumber){
                    window.editor.removeHighlight(config.lineNumber)
                }
            },
        }
        return tween
    }

    canMove(direction){
        let logicX = this.logicX
        let logicY = this.logicY
        if (WEST === direction) logicX -= 1
        else if (EAST === direction) logicX += 1
        else if (NORTH === direction) logicY -= 1
        else if (SOUTH === direction) logicY += 1

        const isOver = logicX < 0 || logicX >= this.map.width ||
            logicY < 0 || logicY >= this.map.height
        return !isOver && this.moveSpace[logicY][logicX] == -1
    }

    checkDriver(){
        this.map.playerList.forEach(player => {
            if(player.logicX === this.logicX && player.logicY === this.logicY){
                this.driver = player
            }
        });
    }

    
    /**
     * 调用这个函数
     * @param {*} step 
     * @returns 
     */
    step(step) {
        this.checkDriver()

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
                driver: this.driver,
                type: "move",
                direction: this.direction,
                from: from,
                to: to,
                isCanMove: isCanMove,
            }

            if(window.code_running) data.lineNumber =  window.gameAndEditor_data.get('runningCodeLine')

            if(this.driver) {
                this.driver.logicX = this.logicX
                this.driver.logicY = this.logicY
            }
           
            this.moveSpace[from.y][from.x] = -1
            this.moveSpace[to.y][to.x] = 1
            this.map.moveData.push(data)

            if(!isCanMove) return  
        }

    }

    turnLeft() {
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