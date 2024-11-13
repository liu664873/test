import Phaser from "phaser"
import SceneEffect from "../objects/SceneEffect"
import UI from "../ui/ui"

/**
 * 转换场景的类
 * 用于处理上一个场景传来的数据，
 * 并且跳到相应的下一个场景
 * 暂时废弃
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
        console.log("hhh", this.levelData)
        if(this.isHasNextLevel()) {
            SceneEffect.openScene(this, () => {
                this.scene.start(`game`, {levelData: this.levelData})
            })
        } else {
            let info = `已到最后一关，是否\n重新回到第一关？`
                        const width = this.sys.game.config.width
                        const height = this.sys.game.config.height
                        const popUp = UI.popUp(this, width / 2, height / 2, 20, info,
                            () => { 
                                this.levelData.level = this.levelData.levelsNumber
                                SceneEffect.closeScene(this, () => { 
                                    this.scene.start("game", { 
                                        levelData: this.levelData
                                    })})
                            },
                            () => { 
                                this.levelData.level = 1
                                SceneEffect.closeScene(this, () => { 
                                this.scene.start("game", { 
                                    levelData: this.levelData
                                 }) }) })
                    }
    }

    /**
     * 判断是否有下一关
     */
    isHasNextLevel(){
        if(this.levelData.level <= this.levelData.levelsNumber) return true
        return false
    }

}