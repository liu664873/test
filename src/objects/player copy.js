import Phaser from "phaser"
import ItemInfo from "./itemInfo"

const LEFT = "left"
const RIGHT = "right"
const UP = "up"
const DOWN = "down"
const IDLE = "idle"

export default class Player extends Phaser.GameObjects.Sprite{
    constructor(scene, name, x, y, depth) {
        const vec = new Phaser.Math.Vector2()
        scene.map.tileToWorldXY(x, y, vec)
        super(scene, vec.x, vec.y, name) 
        this.gridX = x
        this.gridY = y
        this.name = name
        this.depth = depth
        this.grid = this.scene.grid
        this.data = this.scene.grid.data
        this.moving = false
        this.info = new ItemInfo(scene, vec.x + this.scene.grid.gridWidth/2, vec.y - this.scene.grid.gridHeight, this)

        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)
        this.setOrigin(-1.2, 0.8)
        this.setDepth(1.5)
        this.setInteractive()

        this.addAnimation()
    }
    addAnimation(){
        this.anims.create({
            key: LEFT,
            frames: this.anims.generateFrameNumbers("player", {start: 0, end: 3}),
            frameRate: 8,
            repeat: -1,
        })
        this.anims.create({
            key: RIGHT,
            frames: this.anims.generateFrameNumbers("player", {start: 5, end: 8}),
            frameRate: 8,
            repeat: -1,
        })
        this.anims.create({
            key: UP,
            frames: this.anims.generateFrameNumbers("player", {start: 5, end: 8}),
            frameRate: 8,
            repeat: -1,
        })
        this.anims.create({
            key: DOWN,
            frames: this.anims.generateFrameNumbers("player", {start: 0, end: 3}),
            frameRate: 8,
            repeat: -1,
        })
        this.anims.create({
            key: IDLE,
            frames: this.anims.generateFrameNumbers("player", {start: 4, end: 4}),
            frameRate: 8,
            repeat: -1,
        })
    }
    
    move(direction){
        if(LEFT === direction) this.gridX -= 1
        else if(RIGHT === direction) this.gridX += 1
        else if(UP === direction) this.gridY -= 1
        else if(DOWN === direction) this.gridY += 1
        const vec = new Phaser.Math.Vector2()
        this.scene.map.tileToWorldXY(this.gridX, this.gridY, vec)
        this.addTween(vec, direction)
    }
    addTween(vec, direction, time = 500){
        this.scene.tweens.add({
            targets: this,
            duration: time,
            props: {
                x: vec.x,
                y: vec.y
            },
            onStart: () => {
                this.moving = true,
                this.anims.play(direction)
            },
            onComplete: () => {
                this.moving = false
                this.anims.stop(direction)
            }
        })
    }
}