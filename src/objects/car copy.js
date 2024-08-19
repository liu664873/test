import Phaser from "phaser"
import ItemInfo from "./itemInfo"

const LEFT = "left"
const RIGHT = "right"
const UP = "up"
const DOWN = "down"
const IDLE = "idle"

export default class Car extends Phaser.GameObjects.Sprite{
    constructor(scene, x, y, name){
        const vec = new Phaser.Math.Vector2()
        scene.map.tileToWorldXY(x, y, vec)
        super(scene, vec.x, vec.y, name)
        this.name = name
        this.gridX = x
        this.gridY = y
        this.grid = this.scene.grid 
        this.player = this.scene.player
        this.data = this.scene.grid.data
        this.active = false
        this.moving = false
        this.data[y][x] = 1
        this.info = new ItemInfo(scene, vec.x + this.scene.grid.gridWidth/2, vec.y - this.scene.grid.gridHeight, this)

        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)
        this.setDepth(1.4)
        this.setScale(1.5)
        this.setOrigin(-0.1, 0.5)
        this.setInteractive()

    }
    addTween(vec){
        this.scene.tweens.add({
            targets: this,
            duration: 300,
            props: {
                x: vec.x,
                y: vec.y
            },
            onStart: () => {
                this.moving = true
            },
            onComplete: () => {
                this.moving = false
            }
        })
    }
    canMove(direction){
        if(this.moving) return false
        let gridX = this.gridX
        let gridY = this.gridY
        if(direction === LEFT) gridX -= 1
        else if(direction === RIGHT) gridX += 1
        else if(direction === UP) gridY -= 1
        else if(direction === DOWN) gridY += 1 
        const  isOver = gridX < 0|| gridX >= this.grid.width ||
                        gridY < 0 || gridY >= this.grid.height
        return !isOver && this.data[gridY][gridX] === -1
    }
    initdepthData(){
        const height = this.data.length
        const width = this.data[0].length
        this.depthData = new Array(height)
        for(let i = 0; i < height; i++){
            this.data[i] = new Array(width)
            for(let j = 0; j < width; j++){
                if(data1[i][j].index < 0) this.data[i][j] = -1
                else if(data2[i][j].index > 1) this.data[i][j] = -2
                else this.data[i][j] = 0
            }
        }
    }
    move(direction){
        this.data[this.gridY][this.gridX] = -1
        if(LEFT === direction) this.gridX -= 1
        else if(RIGHT === direction) this.gridX += 1
        else if(UP === direction) this.gridY -= 1
        else if(DOWN === direction) this.gridY += 1
        const vec = new Phaser.Math.Vector2()
        this.scene.map.tileToWorldXY(this.gridX, this.gridY, vec)
        this.data[this.gridY][this.gridX] = 1
        this.player.gridX = this.gridX
        this.player.gridY = this.gridY
        this.player.addTween(vec, IDLE, 300)
        this.addTween(vec)
    }
}