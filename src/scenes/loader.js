import Phaser from "phaser"

/** 
 * 加载资源的类
 * 游戏开始前启动
*/
export default class Loader extends Phaser.Scene {

    constructor() {
        super("loader")
    }

    preload() {

        this.createBar()

        this.addLoadOnEvent()

        this.loadAudios()
        this.loadImage()
        this.loadSprite()

    }

    create() {
        this.createBar()
    }

    /**
     * 添加监听事件
     */
    addLoadOnEvent() {
        this.load.on("progess", (val) => {
            this.progressBar.clear()
            this.progressBar.fillStyle()
        })
    }

    /**
     * 创建加载资源条
     */
    createBar() {
        this.width = this.sys.game.config.width;
        this.height = this.sys.game.config.height;

        this.bgBar = this.add.graphics({ fillStyle: { color: 0xFFEB3B } })
        this.bgBar.fillRect(this.width / 2 - 400, this.height / 2, 800, 40)

        this.progressBar = this.add.graphics()
    }

    /**
     * 加载音频
     */
    loadAudios() {
    }

    /**
     * 加载图片
     */
    loadImage() {
        this.load.image("amplify", "assets/images/amplify.png")
        this.load.image("button", "assets/images/button.png")
        this.load.image("bg1", "assets/images/bg1.png")
        this.load.image("bg2", "assets/images/bg2.png")
        this.load.image("bg3", "assets/images/bg3.png")
        this.load.image("move", "assets/images/move.png")
        this.load.image("reduce", "assets/images/reduce.png")
        this.load.image("showGrid", "assets/images/showGrid.png")
        this.load.image("textBg", "assets/images/textBg.png")
        this.load.image("speedX1", "assets/images/speedX1.png")
        this.load.image("speedX2", "assets/images/speedX2.png")
        this.load.image("speedX3", "assets/images/speedX3.png")
        this.load.image("skip", "assets/images/skip.png")
        this.load.image("confirm", "assets/images/confirm.png")
        this.load.image("tipBg", "assets/images/tipBg.png")
    }

    /**
     * 加载地图数据
     */
    loadMapData() {
        
    }

    /**
     * 加载精灵图
     */
    loadSprite() {
        this.load.spritesheet("player", "assets/images/player.png", { frameWidth: 354, frameHeight: 649 })
        this.load.spritesheet("progressBar", "assets/images/progressBar.png", { frameWidth: 180, frameHeight: 36 })
        this.load.spritesheet("ship", "assets/images/ship.png", { frameWidth: 406, frameHeight: 372 })
        this.load.spritesheet("images", "assets/images/images.png", { frameWidth: 178, frameHeight: 350 })
        this.load.spritesheet("energy", "assets/images/energy.png", { frameWidth: 680, frameHeight: 300 })
        this.load.spritesheet("grid", 'assets/images/grid.png', { frameWidth: 182, frameHeight: 350 })
    }


}