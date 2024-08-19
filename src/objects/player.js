import Phaser from "phaser"
import ItemInfo from "./itemInfo"
import Object from "./object"

const LEFT = "left"
const RIGHT = "right"
const UP = "up"
const DOWN = "down"

/**
 * 玩家类
 */
export default class Player extends Object {
    constructor(map, name, gridX = 0, gridY = 0, depth = 0) {

        super(map, name, gridX, gridY, depth)

        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)
        this.setOrigin(-1.1, 0.8)
        this.setInteractive()

        this.moving = false
        this.moveSpace = map.moveSpace

        this.direction = DOWN

        this.directionImage = {
            up: 7,
            right: 4,
            down: 1,
            left: 10,
        }

        this.info = new ItemInfo(this)

        this.addAnimations()

        map.playerList.push(this)
    }

    /**
     * 添加玩家动画
     */
    addAnimations() {
        this.anims.create({
            key: LEFT,
            frames: this.anims.generateFrameNumbers("player", { start: 9, end: 11 }),
            repeat: -1,
            frameRate: 8
        })
        this.anims.create({
            key: RIGHT,
            frames: this.anims.generateFrameNumbers("player", { start: 3, end: 5 }),
            repeat: -1,
            frameRate: 8
        })
        this.anims.create({
            key: UP,
            frames: this.anims.generateFrameNumbers("player", { start: 6, end: 8 }),
            repeat: -1,
            frameRate: 8
        })
        this.anims.create({
            key: DOWN,
            frames: this.anims.generateFrameNumbers("player", { start: 0, end: 2 }),
            repeat: -1,
            frameRate: 8
        })
        this.anims.create({
            key: "upToRight",
            frames: this.anims.generateFrameNumbers("player", { frames: [7, 4] }),
            duration: 1000
        })
        this.anims.create({
            key: "rightToDown",
            frames: this.anims.generateFrameNumbers("player", { frames: [4, 1] }),
            duration: 1000
        })
        this.anims.create({
            key: "downToLeft",
            frames: this.anims.generateFrameNumbers("player", { frames: [1, 10] }),
            duration: 1000
        })
        this.anims.create({
            key: "leftToUp",
            frames: this.anims.generateFrameNumbers("player", { frames: [10, 7] }),
            duration: 1000
        })
        this.anims.create({
            key: "rightToUp",
            frames: this.anims.generateFrameNumbers("player", { frames: [4, 7] }),
            duration: 1000
        })
        this.anims.create({
            key: "downToRight",
            frames: this.anims.generateFrameNumbers("player", { frames: [1, 4] }),
            duration: 1000
        })
        this.anims.create({
            key: "leftToDown",
            frames: this.anims.generateFrameNumbers("player", { frames: [10, 1] }),
            duration: 1000
        })
        this.anims.create({
            key: "upToLeft",
            frames: this.anims.generateFrameNumbers("player", { frames: [7, 10] }),
            duration: 1000
        })
    }

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
                gridY: config.to.y
            },
            duration: 1000,
            onStart: () => {
                this.anims.play(config.direction)
            },
            onComplete: () => {
                this.anims.stop(config.direction)
            }
        }
        return tween
    }
    
    getTurnTween(config){
        const tween = {
            targets:this,
            duration: 1000,
            onStart: () => {
               this.anims.play(config.turn)
            },
            onComplete: () => {
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

        let gridX = this.gridX
        let gridY = this.gridY


        if (LEFT === direction) gridX -= 1
        else if (RIGHT === direction) gridX += 1
        else if (UP === direction) gridY -= 1
        else if (DOWN === direction) gridY += 1

        const isOver = gridX < 0 || gridX >= this.map.width ||
            gridY < 0 || gridY >= this.map.height
        return !isOver && this.moveSpace[gridY][gridX] >= 0
    }


    step(step) {

        for (let i = 0; i < step; i++) {

            let isCanMove = true
            const from = new Phaser.Math.Vector2(this.gridX, this.gridY)
            if (this.direction === UP && this.canMove(UP)) this.gridY = this.gridY - 1
            else if (this.direction === RIGHT && this.canMove(RIGHT)) this.gridX = this.gridX + 1
            else if (this.direction === DOWN && this.canMove(DOWN)) this.gridY = this.gridY + 1
            else if (this.direction === LEFT && this.canMove(LEFT)) this.gridX = this.gridX - 1
            else {
                isCanMove = false
            }

            const to = new Phaser.Math.Vector2(this.gridX, this.gridY)
            
            const data = {
                target: this,
                type: "move",
                direction: this.direction,
                from: from,
                to: to,
                isCanMove: isCanMove
            }
            this.map.moveData.push(data)

            if(!isCanMove) return  
        }

    }

    turnLeft() {
        const data = {
            target: this,
            type: "turn",
        }
        if (this.direction === UP) {
            data.fromDirection = UP
            data.direction = LEFT
        }
        else if (this.direction === RIGHT) {
            data.fromDirection = RIGHT
            data.direction = UP
        }
        else if (this.direction === DOWN) {
            data.fromDirection = DOWN
            data.direction = RIGHT
        }
        else if (this.direction === LEFT) {
            data.fromDirection = LEFT
            data.direction = DOWN
        }
        this.direction = data.direction
        this.map.moveData.push(data)
    }

    turnRight() {
        const data = {
            target: this,
            type: "turn",
        }
        if (this.direction === UP) {
            data.fromDirection = UP
            data.direction = RIGHT
        }
        else if (this.direction === RIGHT) {
            data.fromDirection = RIGHT
            data.direction = DOWN
        }
        else if (this.direction === DOWN) {
            data.fromDirection = DOWN
            data.direction = LEFT
        }
        else if (this.direction === LEFT) {
            data.fromDirection = LEFT
            data.direction = UP
        }
        this.direction = data.direction
        this.map.moveData.push(data)
    }
}