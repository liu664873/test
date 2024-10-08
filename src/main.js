import Phaser from "phaser"
import Game from "./scenes/game"
import Loader from "./scenes/loader"
import Transform from "./scenes/transform"
import editor from "./codeEditor/editor"
import Manager from "./Manager"

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
    scene: [Loader, Game, Transform]
}

window.onload = function() {
    brython()
    window.game = new Phaser.Game(config); 
    window.editor = editor
    window.gameAndEditor_data = new Map()
    window.manager = new Manager(window.game, window.editor)
    window.game.isRunning = true
}
