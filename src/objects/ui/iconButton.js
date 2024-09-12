import Phaser from "phaser"

export default class IconButton extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture){
        super(scene, x, y, texture)
        this.scene.add.existing(this)
        this.setInteractive()
    }

    addOnEvents(event, callback){
        this.on("pointerdown", () => {
            this.setTint(0xff0000)
            if(event === "pointerdown") this.callback()
        })
        this.on("pointerup", () => {
            this.bg.clearTint()
            if(event === "pointerup") this.callback()
        })
    }

    setCallback(callback){
        this.callback = callback
    }
}