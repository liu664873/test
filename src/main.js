import Phaser from "phaser";
import Game from "./scenes/game";
import Loader from "./scenes/loader";
import GameManager from "./GameManager";
import CodeEditor from "./codeEditor/editor";

const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 1200,
    parent: "game",
    scale: {
        mode: Phaser.Scale.FIT
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: {
                y: 0
            },
        }
    },
    scene: [Loader, Game]
};

async function loadMapData() {
    try {
        const [gridData, imageData] = await Promise.all([
            fetch('assets/mapData/grid.json').then(response => response.json()),
            fetch('assets/mapData/images.json').then(response => response.json())
        ]);

        const mapDataList = await Promise.all([
            fetch('assets/mapData/contest7.json').then(response => response.json()),
            fetch('assets/mapData/test2.json').then(response => response.json()),
            fetch('assets/mapData/test3.json').then(response => response.json())
        ]);

        const data = {
            tilesetMap: { grid: gridData, images: imageData },
            mapDataList: mapDataList
        };
        return data;
    } catch (error) {
    }
}

const game = new Phaser.Game(config);
const manager = new GameManager(game);
manager.setEditor(new CodeEditor("editor"));

loadMapData().then(data => {
    if (data) {
        console.log(data);
        manager.init(data);
        manager.selectLevel(1);
    } 
}).catch(error => {
});

window.onload = function() {
    brython(); // Assuming this is some external function call, make sure it's defined
    window.manager = manager;
};