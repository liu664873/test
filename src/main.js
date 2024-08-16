import Phaser from "phaser"
import Game from "./scenes/game"
import Loader from "./scenes/loader"
import Transform from "./scenes/transform"

import Test from "./scenes/test"

const config = {
    type: Phaser.AUTO,
    width: 2000,
    height: 1000,
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

new Phaser.Game(config)