import Phaser from "phaser"
import Button from "./Button";

const POPUP_WIDTH = 300;
const POPUP_HEIGHT = 200;

export default class Prompt extends Phaser.GameObjects.Container {
    constructor(scene, tig, content, callback1, callback2){
        super(scene)
        this.scene.add.existing(this)

        const { width, height } = this.scene.sys.game.config;
        this.setPosition(width/2, height/2)
        this.setDepth(100)
        this.setSize(POPUP_WIDTH, POPUP_HEIGHT)
        
        this.bg = new Phaser.GameObjects.Image(scene, 0, 0, "tigBg").setOrigin(0)
        this.add(this.bg)
        this.tig = scene.add.text(10, 10, tig, { fontSize: '24px', fill: '#000' });
        this.add(this.tig)
        this.info = scene.add.text(10, 40, content, {
            fontSize: '16px',
            fill: '#000',
            wordWrapWidth: POPUP_WIDTH - 20 // 减去一些边距以防止文本紧贴边缘
        });
        this.add(this.info)
        this.btn1 = new Button(scene, 300, 300, "取消", callback1)
        this.btn2 = new Button(scene, 300, 300, "确定", callback2)
        this.add(this.btn1)
        this.add(this.btn2)
    }
}