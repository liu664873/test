import Phaser from "phaser"
import ItemInfo from "./itemInfo"
import Object from "./object"

const LEFT = "left"
const RIGHT = "right"
const UP = "up"
const DOWN = "down"

export default class Ship extends Object{
    constructor(map, name, gridX, gridY, depth){
        super(map, name, gridX, gridY, depth)
  
        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)
        this.setDepth(1.4)
        this.setScale(0.9)
        this.setOrigin(-0.3, 0.5)
        this.setInteractive()

        this.directionImage = {
            up: 2,
            right: 0,
            down: 1,
            left: 3,
        }
        this.direction = RIGHT
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
            key: LEFT,
            frames: this.anims.generateFrameNumbers("ship", { start: 3, end: 3 }),
            repeat: -1,
            frameRate: 8
        })
        this.anims.create({
            key: RIGHT,
            frames: this.anims.generateFrameNumbers("ship", { start: 0, end: 0}),
            repeat: -1,
            frameRate: 8
        })
        this.anims.create({
            key: UP,
            frames: this.anims.generateFrameNumbers("ship", { start: 2, end: 2 }),
            repeat: -1,
            frameRate: 8
        })
        this.anims.create({
            key: DOWN,
            frames: this.anims.generateFrameNumbers("ship", { start: 1, end: 1 }),
            repeat: -1,
            frameRate: 8
        })
        this.anims.create({
            key: "upToRight",
            frames: this.anims.generateFrameNumbers("ship", { frames: [2, 0] }),
            duration: 1000
        })
        this.anims.create({
            key: "rightToDown",
            frames: this.anims.generateFrameNumbers("ship", { frames: [0, 1] }),
            duration: 1000
        })
        this.anims.create({
            key: "downToLeft",
            frames: this.anims.generateFrameNumbers("ship", { frames: [1, 3] }),
            duration: 1000
        })
        this.anims.create({
            key: "leftToUp",
            frames: this.anims.generateFrameNumbers("ship", { frames: [3, 2] }),
            duration: 1000
        })
        this.anims.create({
            key: "rightToUp",
            frames: this.anims.generateFrameNumbers("ship", { frames: [0, 2] }),
            duration: 1000
        })
        this.anims.create({
            key: "downToRight",
            frames: this.anims.generateFrameNumbers("ship", { frames: [1, 0] }),
            duration: 1000
        })
        this.anims.create({
            key: "leftToDown",
            frames: this.anims.generateFrameNumbers("ship", { frames: [3, 1] }),
            duration: 1000
        })
        this.anims.create({
            key: "upToLeft",
            frames: this.anims.generateFrameNumbers("ship", { frames: [2, 3] }),
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
            props: {
                z: 1    //巨坑，必须有变化的值，不然不执行tween
            },
            onStart: () => {
               this.anims.play(config.turn)
            },
            onComplete: () => {
                this.setFrame(this.directionImage[config.direction])
            },
        }
        return tween
    }

    canMove(direction){
        let logicX = this.logicX
        let logicY = this.logicY
        if(direction === LEFT) logicX -= 1
        else if(direction === RIGHT) logicX += 1
        else if(direction === UP) logicY -= 1
        else if(direction === DOWN) logicY += 1 
        const  isOver = logicX < 0|| logicX >= this.map.width ||
                        logicY < 0 || logicY >= this.map.height
        return !isOver && this.moveSpace[logicY][logicX] === -1
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
            if (this.direction === UP && this.canMove(UP)) this.logicY = this.logicY - 1
            else if (this.direction === RIGHT && this.canMove(RIGHT)) this.logicX = this.logicX + 1
            else if (this.direction === DOWN && this.canMove(DOWN)) this.logicY = this.logicY + 1
            else if (this.direction === LEFT && this.canMove(LEFT)) this.logicX = this.logicX - 1
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
                isCanMove: isCanMove
            }

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
        if (this.direction === UP) {
            data.fromDirection = UP
            data.direction = LEFT
            data.turn = "upToLeft"
        }
        else if (this.direction === RIGHT) {
            data.fromDirection = RIGHT
            data.direction = UP
            data.turn = "rightToUp"
        }
        else if (this.direction === DOWN) {
            data.fromDirection = DOWN
            data.direction = RIGHT
            data.turn = "downToRight"
        }
        else if (this.direction === LEFT) {
            data.fromDirection = LEFT
            data.direction = DOWN
            data.turn = "leftToDown"
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
            data.turn = "upToRight"
        }
        else if (this.direction === RIGHT) {
            data.fromDirection = RIGHT
            data.direction = DOWN
            data.turn = "rightToDown"
        }
        else if (this.direction === DOWN) {
            data.fromDirection = DOWN
            data.direction = LEFT
            data.turn = "downToLeft"
        }
        else if (this.direction === LEFT) {
            data.fromDirection = LEFT
            data.direction = UP
            data.turn = "leftToUp"
        }
        this.direction = data.direction
        this.map.moveData.push(data)
    }
    
}