import Phaser from "phaser"

export default class Button extends Phaser.GameObjects.Container {
    constructor(scene, x, y, depth, info, callback, tx){
        super(scene, x, y)
        this.scene.add.existing(this)
        this.info = info
        this.callback = callback
        this.bg = new Phaser.GameObjects.Image(scene, 0, 0, "button").setScale(0.4)
        this.info = new Phaser.GameObjects.Text(scene, -30, -15, info, {color: 0xffffff, fontSize: 30})
        this.add([this.bg, this.info])
        this.setDepth(depth)
        this.bg.setInteractive()
        this.addEvents()

    }

    addEvents(){
        this.bg.on("pointerdown", () => {
            this.bg.setTint(0xff0000)
            this.info.setColor(0xff0000)
            if(this.callback) this.callback()
        })
        this.bg.on("pointerup", () => {
            // this.bg.setTint(0xffffff)
            this.bg.clearTint()
            this.info.setColor(0xffffff)
        })
    }

    setCallback(callback){
        this.callback = callback
    }
}