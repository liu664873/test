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
        this.map.openGrid()
        this.player = Generator.generatePlayer(this.map, "player", 3, 2, 2)
        this.map.setScale(0.75)
        this.map.setPosition(300, 300)
        this.showGrid = this.add.sprite(1500, 50, "showGrid").setScale(0.75).setInteractive()
        this.amplify = this.add.sprite(1600, 50, "amplify").setScale(0.75).setInteractive()
        this.reduce = this.add.sprite(1700, 50, "reduce").setScale(0.75).setInteractive()
        this.addOnEvent()
        // this.tweens.chain().add(this.player.step(2))
        
        // this.cameras.main.startFollow(this.player)
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