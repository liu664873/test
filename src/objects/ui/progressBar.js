import Phaser from "phaser"

export default class ProgressBar extends Phaser.GameObjects.Container{
    constructor(scene, x, y){
        super(scene, x ,y)
        this.scene.add.existing(this)
        this.bgBar = this.scene.add.image(0, 0, "progressBarBg").setOrigin(0)
        this.progressBar = this.scene.add.image(5, 0, "progressBar").setOrigin(0)
        this.width = this.bgBar.width
        this.height = this.bgBar.height
        this.add(this.bgBar)
        this.add(this.progressBar)
        this.progressBar.displayWidth = 0

    }
    updateProgress(progress){
        this.progressBar.displayWidth = progress*this.progressBar.width
    }
}