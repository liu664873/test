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
        this.levelData = data.levelData
    }

    create(){
        this.time.delayedCall(
            200,
            () => {
                this.toNext()
            }
        )
    }
    
    /**
     * 跳转下一场景
     */
    toNext(){
        if(this.isHasNextLevel) {
            SceneEffect.openScene(this, () => {
                this.scene.start(`game`, {levelData: this.levelData})
            })
        } else {
            let info = `已到最后一关，是否重新开始？`
                        const width = this.scene.sys.game.config.width
                        const height = this.scene.sys.game.config.height
                        const popUp = UI.popUp(this.scene, width / 2, height / 2, this.depth + 10, info,
                            () => { 
                                SceneEffect.closeScene(this.scene, () => { 
                                    this.scene.start("transform", { 
                                        levelData: this.levelData
                                    })})
                            },
                            () => { 
                                this.levelData.level = 1
                                SceneEffect.closeScene(this.scene, () => { 
                                this.scene.start("transform", { 
                                    levelData: this.levelData
                                 }) }) })
                    }
    }

    /**
     * 判断是否有下一关
     */
    isHasNextLevel(){
        if(this.level < this.levelsNumber) return true
        return false
    }


}