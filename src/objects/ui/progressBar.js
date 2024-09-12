import Phaser from "phaser"

export default class ProgressBar extends Phaser.GameObjects.Container{
    constructor(scene, x, y, width = 300, height = 30){
        super(scene, x ,y)
        this.scene.add.existing(this)
        this.width = width
        this.height = height
        this.bgBar = new Phaser.GameObjects.Graphics(scene, { x: 0, y: 0, fillStyle: { color: 0x222222 } })
        this.progressBar = new Phaser.GameObjects.Graphics(scene, { x: 0, y: 0, fillStyle: { color: 0x4CAF50 } })
        this.add(this.bgBar)
        this.add(this.progressBar)

        this.bgBar.fillRect(0, 0, this.width, this.height)
        this.progressBar.fillRect(0, 0, 0, this.height)
    }
    updateProgress(progess){
        this.progressBar.fillRect(0, 0, progess*this.width, this.height)
    }
}