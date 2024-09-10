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
window.game = game

import "./codeEditor/editor"
