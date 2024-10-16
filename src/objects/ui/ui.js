import Phaser from "phaser"
import Button from "./button"
import ProgressBar from "./progressBar"
import IconButton from "./iconButton"
import Prompt from "./prompt"

/**
 * ui类
 * 封装了常用的ui组件
 */
export default class UI {
    static button(scene, x, y,  depth, info, callback){
        const button = new Button(scene, x, y, depth, info, callback)
        return button
    }
    static progressBar(scene, x, y){
        return new ProgressBar(scene, x, y)
    }
    static iconButton(scene, x, y, texture){
        const iconButton = new IconButton(scene, x, y, texture)
        return iconButton
    }
    static prompt(scene, x, y, depth, info, children){
        const  prompt = new Prompt(scene, x, y, depth, info, children)
        return prompt
    }
    static popUp(scene, x, y, depth, info, callback1, callback2){
        const popUp = UI.prompt(scene, x, y, depth, info).setScrollFactor(0)
        const cancellBtn = UI.button(scene, -200, 150, 10, "取消", function(){
            popUp.destroy()
            callback1()
        }).setScrollFactor(0)
        const sureBtn = UI.button(scene, 200, 150, 10, "确定", function(){
            popUp.destroy()
            callback2()
        }).setScrollFactor(0)
        cancellBtn.bg.setScrollFactor(0)
        sureBtn.bg.setScrollFactor(0)
        popUp.add([cancellBtn, sureBtn])
        return popUp
    }
}