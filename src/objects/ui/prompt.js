import Phaser from "phaser"

export default class Prompt extends Phaser.GameObjects.Container {
    constructor(scene, x, y, depth, info, children){
        super(scene, x, y)
        this.scene.add.existing(this)
        this.bg = new Phaser.GameObjects.Image(scene, 0, 0, "textBg").setDepth(0).setScale(8)
        this.info = new Phaser.GameObjects.Text(scene, -300, -100, info, {color: '#ffb700', fontSize: 40}).setDepth(1)
        this.add([this.bg, this.info])

        if(children) this.addChildren(children)
        this.setDepth(depth)
    }
    addChildren(children){
        this.add(children)
    }
}