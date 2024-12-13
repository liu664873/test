import Phaser from "phaser";
import Map from "../objects/map";
import UI from "../ui/ui";
import Prompt from "../ui/uiObjs/prompt";

/**
 * 游戏场景的类
 */
export default class Game extends Phaser.Scene {
    constructor() {
        super("game");
    }

    /**
     * 接受上一个场景的数据
     */
    init(data) {
        this.mapData = data.mapData;
    }

    preload() {
        this.cache.tilemap.remove("map");
        this.load.image("bg", "assets/images/bg.png");
        this.load.tilemapTiledJSON("map", this.mapData);
    }

    create() {
        const { width, height } = this.cameras.main;

        this.add.image(0, 0, 'bg1').setOrigin(0).setScrollFactor(0);


        this.map = new Map(this, "map", width/2, height/6);
        this.map.setScale(8/Math.max(this.map.width, this.map.height))
        this.dragging = false;

        this.map.closeGrid();

        // 分离图标处理逻辑到单独的方法
        this.createIcons();

        // 初始化游戏管理器数据
        const data = {
            scene: this,
            player: this.map.player,
            ship: this.map.ship,
            energyList: this.map.energyList,
            flyerList: this.map.flyerList
        };
        this.game.manager.initLevel(data);
        // 添加事件监听器
        this.addOnEvent();
    }

    /**
     * 创建游戏图标
     */
    createIcons() {
        const manager = this.game.manager;
        this.showGrid = UI.icon(this, 60, 40, "showGrid").setScale(0.2).setInteractive().setScrollFactor(0).setDepth(100);
        this.showGrid.addOnClickTwoEvent(
            () => { this.map.openGrid();},
            () => { this.map.closeGrid();},
        )

        this.move = UI.icon(this, 180, 40, "move").setScale(0.2).setInteractive().setScrollFactor(0).setDepth(100);
        this.move.addOnClickTwoEvent(
            () => {this.dragging = true},
            () => {this.dragging = false},
        )
        
        this.amplify = UI.icon(this, 300, 50, "amplify").setScale(0.3).setInteractive().setScrollFactor(0).setDepth(100);
        this.amplify.addOnClickOneEvent(
            () => { 
                if(manager?.inPlayActionAnims) return;
                if(this.map.scale < 2) this.map.setScale(this.map.scale + 0.2);
            },
        )

        this.reduce = UI.icon(this, 420, 50, "reduce").setScale(0.3).setInteractive().setScrollFactor(0).setDepth(100);
        this.reduce.addOnClickOneEvent(
            () => { 
                if(manager?.inPlayActionAnims) return;
                if(this.map.scale > 0.4) this.map.setScale(this.map.scale - 0.2);
            },
        )
        this.speed = UI.icon(this, 540, 50, "speedX1").setInteractive().setScale(0.3).setScrollFactor(0).setDepth(100);
        this.time.timeScale = 10;
        this.speed.addOnClickOneEvent(
            () => {
                this.game.manager.setAnimSpeed((this.game.manager.animSpeed % 3) + 1);
                this.speed.setTexture(`speedX${this.game.manager.animSpeed}`);
            }
        )


        this.progressBar = UI.progressBar(this, 660, 40).setScrollFactor(0).setScale(1.5).setDepth(100);
    }

    /**
     * 添加游戏事件监听器
     */
    addOnEvent() {
        let dragX, dragY;
        const manager = this.game.manager;

        const { width, height } = this.sys.game.config;

        this.input.on('pointerdown', (pointer) => {
            if(manager?.inPlayActionAnims) return;
            if (this.dragging) {
                dragX = pointer.x - this.map.x;
                dragY = pointer.y - this.map.y;
            }
        });

        this.input.on('pointermove', (pointer) => {
            if(manager?.inPlayActionAnims) return;
            if (this.dragging && this.input.activePointer.isDown) {
                let x = pointer.x - dragX;
                let y = pointer.y - dragY;
                x = Phaser.Math.Clamp(x, 0, width);
                y = Phaser.Math.Clamp(y, 0, height);
                this.map.setPosition(x, y);
            }
        });
    }
}