import Phaser from "phaser"
import Button from "./button"
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
    static prompt(scene, x, y, depth, info, children){
        const  prompt = new Prompt(scene, x, y, depth, info, children)
        return prompt
    }
    static popUp(scene, x, y, depth, info, callback1, callback2){
        const popUp = UI.prompt(scene, x, y, depth, info)
        const cancellBtn = UI.button(scene, -100, 120, 10, "取消", function(){
            popUp.destroy()
            callback1()
        })
        const sureBtn = UI.button(scene, 100, 120, 10, "确定", function(){
            popUp.destroy()
            callback2()
        })
        popUp.add([cancellBtn, sureBtn])
        return popUp
    }
}