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
            UP: 7,
            RIGHT: 4,
            DOWN: 1,
            LEFT: 10,
        }

        this.info = new ItemInfo(this)

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
            frameRate: 8
        })
        this.anims.create({
            key: "rightToDown",
            frames: this.anims.generateFrameNumbers("player", { frames: [4, 1] }),
            frameRate: 8
        })
        this.anims.create({
            key: "downToLeft",
            frames: this.anims.generateFrameNumbers("player", { frames: [1, 10] }),
            frameRate: 8
        })
        this.anims.create({
            key: "leftToUp",
            frames: this.anims.generateFrameNumbers("player", { frames: [10, 7] }),
            dframeRate: 8
        })
        this.anims.create({
            key: "rightToUp",
            frames: this.anims.generateFrameNumbers("player", { frames: [4, 7] }),
            frameRate: 8
        })
        this.anims.create({
            key: "downToRight",
            frames: this.anims.generateFrameNumbers("player", { frames: [1, 4] }),
            frameRate: 8
        })
        this.anims.create({
            key: "leftToDown",
            frames: this.anims.generateFrameNumbers("player", { frames: [10, 1] }),
            frameRate: 8
        })
        this.anims.create({
            key: "upToLeft",
            frames: this.anims.generateFrameNumbers("player", { frames: [7, 10] }),
            frameRate: 8
        })
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

    getMoveTween(from, to) {
        this.map.tilemap.tileToWorldXY(from.x, from.y, from)
        this.map.tilemap.tileToWorldXY(to.x, to.y, to)
        const tween = {
            targets: this,
            props: {
                x: to.x,
                y: to.y
            },
            duration: 1000,
            onStart: () => {
                this.anims.play(this.direction)
            },
            onComplete: () => {
                this.anims.stop(this.direction)
            }
        }
        return tween
    }
    
    getTurnTween(turn){
        const tween = {
            targets:this,
            duration: 1000,
            onStart: () => {
                this.anims.play(turn)
            },
            onComplete: () => {
                if (this.direction === UP) this.setFrame(7)
                else if (this.direction === RIGHT) this.setFrame(4)
                else if (this.direction === DOWN) this.setFrame(1)
                else if (this.direction === LEFT) this.setFrame(10)
            },
        }
        return tween
    }

    step(val) {
        const tweens = []

        for (let i = 0; i < val; i++) {
            const from = new Phaser.Math.Vector2(this.gridX, this.gridY)
            if (this.direction === UP && this.canMove(UP)) this.gridY = this.gridY - 1
            else if (this.direction === RIGHT && this.canMove(RIGHT)) this.gridX = this.gridX + 1
            else if (this.direction === DOWN && this.canMove(DOWN)) this.gridY = this.gridY + 1
            else if (this.direction === LEFT && this.canMove(LEFT)) this.gridX = this.gridX - 1

            const to = new Phaser.Math.Vector2(this.gridX, this.gridY)
            tweens.push(this.getMoveTween(from, to))
        }
        return tweens
    }

    turnLeft() {
        let turnTween
        if (this.direction === UP) {
            this.direction = LEFT
            turnTween = this.getTurnTween("upToLeft")
        }
        else if (this.direction === RIGHT) {
            this.direction = UP
            turnTween = this.getTurnTween("rightToUp")
        }
        else if (this.direction === DOWN) {
            this.direction = RIGHT
            turnTween = this.getTurnTween("downToRight")
        }
        else if (this.direction === LEFT) {
            this.direction = DOWN
            turnTween = this.getTurnTween("leftToDown")
        }
        return turnTween
    }

    turnRight() {
        let turnTween
        if (this.direction === UP) {
            this.direction = RIGHT
            turnTween = this.getTurnTween("upToRight")
        }
        else if (this.direction === RIGHT) {
            this.direction = DOWN
            turnTween = this.getTurnTween("rightToDown")
        }
        else if (this.direction === DOWN) {
            this.direction = LEFT
            turnTween = this.getTurnTween("downToLeft")
        }
        else if (this.direction === LEFT) {
            this.direction = UP
            turnTween = this.getTurnTween("leftToUp")
        }
        return turnTween
    }
}