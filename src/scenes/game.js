import Phaser from "phaser"
import Map from "../objects/map"
import Generator from "../objects/generator"

/**
 * 游戏场景的类
 * 
 */
export default class Game extends Phaser.Scene {

    constructor() {super("game")}

    /**
     * 接受上一个场景的数据
     */
    init(data){
        this.level = data.level
    }

    create(){
        this.map = new Map(this, this.level, 950, 100)
        // this.map.openGrid()
        this.player = Generator.generatePlayer(this.map, "player", 3, 2, 2)
        this.ship = Generator.generateShip(this.map, "ship", 4, 0, 1)
        this.map.setPosition(400, 150)
        this.showGrid = this.add.sprite(50, 50, "showGrid").setScale(0.5).setInteractive()
        this.amplify = this.add.sprite(150, 50, "amplify").setScale(0.5).setInteractive()
        this.reduce = this.add.sprite(250, 50, "reduce").setScale(0.5).setInteractive()
        this.addOnEvent()

        // this.player.turnRight()
        // this.player.turnRight()
        // this.player.step(1)
        // this.player.turnRight()
        // this.player.step(1)
        // this.player.turnLeft()
        // this.player.step(1)
        // this.ship.turnRight()
        // this.ship.turnRight()
        // this.ship.step(2)

        // this.map.createTweenChain()
        // this.cameras.main.startFollow(this.player)
        // this.cameras.main.stopFollow(this.player)
    }

    /**
     * 每一帧都执行
     */
    update(){
        const code = this.registry.get("code")
        if(code.click){
            this.map.moveData = []
            eval(code.context)
            if(this.map.moveData.length > 0) this.map.createTweenChain()
            console.log(code, this.map.moveData)
            code.click = false
            code.context = null
        }
    }

    addOnEvent(){
        this.showGrid.on("pointerdown", () => {
            if(this.map.grid.visible) this.map.closeGrid()
            else this.map.openGrid()
        })
        this.amplify.on("pointerdown", () => {this.amplify.clicked = true})
        this.amplify.on("pointerup", () => {
            if(this.amplify.clicked){
                if(this.map.scale < 2) this.map.setScale(this.map.scale + 0.2)
                else this.map.setScale(this.map.scale)
                this.amplify.clicked = false
            }
        })
        this.reduce.on("pointerdown", () => {this.reduce.clicked = true})
        this.reduce.on("pointerup", () => {
            if(this.reduce.clicked){
                if(this.map.scale > 0.4) this.map.setScale(this.map.scale - 0.2)
                else this.map.setScale(this.map.scale)
                this.reduce.clicked = false
            }
        })
    }
}