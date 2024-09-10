import Phaser from "phaser"
import SceneEffect from "../objects/sceneEffect"

/**
 * 转换场景的类
 * 用于处理上一个场景传来的数据，
 * 并且跳到相应的下一个场景
 */
export default class Transform extends Phaser.Scene {

    constructor(){
        super("transform")
    }

    /**
     * 接受上一个场景传来的数据data
     * level为下一关卡
     * score为上一个关卡分数
     */
    init(data){
        this.level = data.level
        this.score = data.score
    }

    create(){
        console.log(this)
        console.log(this.tweens)
        this.time.delayedCall(
            500,
            () => {
                this.toNext()
            }
        )
    }
    
    /**
     * 跳转下一场景
     */
    toNext(){
        const data = {
            level: this.level
        }
        if(this.level) {
            SceneEffect.openScene(this, () => {
                this.scene.start(`game`, data)
            })
        }
    }
}