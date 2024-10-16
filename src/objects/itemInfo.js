import Phaser from "phaser"

/**
 * 道具信息类
 */
export default class ItemInfo extends Phaser.GameObjects.Container {
    constructor(item){
        super(item.scene)
        this.scene.add.existing(this)
        this.item = item
        this.add(new Phaser.GameObjects.Image(this.scene, 0, 0, "textBg").setScale(3, 3.5))
        this.add(new Phaser.GameObjects.Text(this.scene, -120, -40, `${item.name}`, {fontSize: 33, color: "#ffffff", strokeThickness: 1}))
        this.text = new Phaser.GameObjects.Text(this.scene, -120, -5,`x:${item.gridX} y:${item.gridY}`,{fontSize: 33, color: "#ffffff", strokeThickness: 1})
        this.add(this.text)
        this.depth = 10
        this.setVisible(false)
        this.addEvents()
    }
    
    /**
     * 对道具item添加监听事件
     * 当鼠标移动到item是，显示信息
     * 移出item时，关闭显示信息
     */
    addEvents(){
        this.item.on("pointerover", () => {
            if(window.runnChain || !this.item.map.shouldShowInfo) return
            const vec = new Phaser.Math.Vector2() 
            this.item.map.tilemap.tileToWorldXY(this.item.gridX, this.item.gridY, vec)
            this.setPosition(vec.x + this.scale*this.item.map.tileWidth/2, vec.y - this.scale*this.item.map.tileHeight)
            this.text.setText(`x:${this.item.gridX} y:${this.item.gridY}`)
            this.setVisible(true)
        })
        this.item.on("pointerout", () => {
            this.setVisible(false)
        })
    }

}