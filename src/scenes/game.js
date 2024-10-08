import Phaser from "phaser"
import Map from "../objects/map"
import Generator from "../objects/generator"
import SceneEffect from "../objects/sceneEffect"
import UI from "../objects/ui/ui"

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
        this.width = this.sys.game.config.width
        this.height = this.sys.game.config.height

        this.add.image(0, 0, 'bg').setScale(4).setOrigin(0).setScrollFactor(0)

        this.score = 0
        this.cureSpeed = 1
        this.map = new Map(this, this.level, 950, 100)
        this.map.closeGrid()
        this.map.setScale(0.6)
        this.map.setPosition(700, 300)
        this.showGrid = this.add.sprite(50, 50, "showGrid").setScale(0.5).setInteractive().setScrollFactor(0)
        this.amplify = this.add.sprite(150, 50, "amplify").setScale(1).setInteractive().setScrollFactor(0)
        this.reduce = this.add.sprite(250, 50, "reduce").setScale(1).setInteractive().setScrollFactor(0)
        this.move = this.add.sprite(350, 50, "move").setScale(0.5).setInteractive().setScrollFactor(0)
        this.speed = this.add.sprite(50,100,`speedX${this.cureSpeed}`).setInteractive().setScrollFactor(0)
        this.progressBar = UI.progressBar(this, 450, 50).setScrollFactor(0)
        this.addOnEvent()
        this.registry.set("player", this.map.playerList[0])
        this.registry.set("ship", this.map.shipList[0])
        this.registry.set("mapd", this.map)
    
    }

    /**
     * 每一帧都执行
     */
    update(){
        // const code = this.registry.get("code")
        // if(code && code.click){
        //     this.map.moveData = []
        //     // eval(code.context)
        //     if(this.map.moveData.length > 0) this.map.createTweenChain()
        //     console.log(code, this.map.moveData)
        //     code.click = false
        //     code.context = null
        // }
    }

    addOnEvent(){
        let dragX, dragY;   
        let dragging = false;  
        let gameWidth = this.sys.game.config.width
        let gameHeight = this.sys.game.config.height

        this.move.on("pointerup", (pointer) => {
            dragging = !dragging  
            if(dragging){
                this.move.setTint(0xff0000)
            } else {
                this.move.clearTint()
            }
        })
  
        // 鼠标按下事件  
        this.input.on('pointerdown', (pointer) => {  
            if(dragging){
                dragX = pointer.x - this.map.x;  
                dragY = pointer.y - this.map.y;  
            }
        });  
    
        // 鼠标移动事件  
        this.input.on('pointermove', (pointer) => {  
            if (dragging && this.input.activePointer.isDown) {  
                let x = pointer.x - dragX;  
                let y = pointer.y - dragY; 
                //将x，y束缚在游戏界面内，不要超界
                x = Phaser.Math.Clamp(x, 0, gameWidth)
                y = Phaser.Math.Clamp(y, 0, gameHeight)
                this.map.setPosition(x, y) 
            }  
        });  
        
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
        this.speed.on("pointerdown",()=>{
            // 重新计算 speed 的值
            this.cureSpeed = this.cureSpeed === 4 ? 1 : this.cureSpeed * 2;
    
            // 创建新的 sprite 
            this.speed.setTexture(`speedX${this.cureSpeed}`)
        
            if(this.map.chainTween)this.map.chainTween.timeScale = this.cureSpeed
        })
    }
}