import Phaser from "phaser"
import Game from "./scenes/game"
import Loader from "./scenes/loader"
import Transform from "./scenes/transform"

import Test from "./scenes/test"

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    parent: "game",
    scale:{
        mode: Phaser.Scale.FIT
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: {
                y: 0
            }
        }
    },
    scene: [Loader, Game, Transform, Test]
}

var game = new Phaser.Game(config); 

import Editor from "./codeEditor/editor"

window.onload = function () {  
    var code = {
        click: false,
        context: null,
    }
    game.registry.set("code", code) 
  
    document.getElementById('codeButton').addEventListener('click', function() {  
        // 这里不能直接控制Phaser游戏，但你可以通过全局变量、事件或Phaser的API来影响游戏  
        // 例如，你可以发送一个自定义事件给Phaser游戏，并在游戏内部监听这个事件 
        // var code = {
        //     click: true,
        //     context : document.getElementById('codeContext').value 
        // }
        code.click = true
        code.context = Editor.state.doc.toString(); 
         game.registry.set("code", code) 
        console.log(code.context)
    });  
};