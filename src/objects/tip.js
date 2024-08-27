import Phaser from "phaser";

export default class Tip extends Phaser.GameObjects.Container{
    constructor(map){
        super(map.scene)
        this.scene.add.existing(this)
        this.textBg = new Phaser.GameObjects.Image(this.scene,100,100,"textBg")
        this.tipText = new Phaser.GameObjects.Text(this.scene, -70, 0,"确定",{fontSize: 20, color: "#ff0000"})
        this.add(this.textBg)
        this.add(this.tipText)
        this.textBg.setInteractive()
        this.adda()
    }
    adda(){
        this.textBg.on("pointerup",()=>{
            // 淡出当前场景内容
            this.scene.tweens.add({
                targets: this.scene.cameras.main,
                alpha: { from: 1, to: 0 }, // 透明度从1变到0
                duration: 2000, // 持续时间
                onComplete: () => {
                    // 在淡出完成后执行的操作
                    this.scene.cameras.alpha = 1; // 重置透明度
                    // 例如，你可以在这里重置场景的内容
                    this.scene.scene.restart(); // 重启当前场景，模拟场景切换效果
                }
            },this);
        },this)
    }
}