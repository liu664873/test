import Phaser from "phaser"

/** 
 * 加载资源的类
 * 游戏开始前启动
*/
export default class Loader extends Phaser.Scene {

    constructor(){
        super("loader")
    }

    preload(){
        this.createBar()

        this.addLoadOnEvent()

        this.loadAudios()
        this.loadImage()
        this.loadMapData()
        this.loadSprite()

    }

     create(){
        // this.scene.start("transform", {level: "level1", score: 0})
        this.scene.start("transform", {
            levelData: {
                level: 4,
                world: "seabed",
                score: 0,
                levelsNumber: 6
            }})
     }

    /**
     * 添加监听事件
     */
    addLoadOnEvent(){
        this.load.on("progess", (val) => {
            this.progressBar.clear()
            this.progressBar.fillStyle()
        })
    }

    /**
     * 创建加载资源条
     */
    createBar(){
        this.width = this.sys.game.config.width
        this.height = this.sys.game.config.height
   
       this.bgBar = this.add.graphics({fillStyle: {color: 0xFFEB3B}}) 
       this.bgBar.fillRect(this.width/2 - 400, this.height/2, 800, 40)
       
       this.progressBar = this.add.graphics()
    }

    /**
     * 加载音频
     */
    loadAudios(){
        this.load.audio("star", "assets/audios/audios.mp3")
    }

    /**
     * 加载图片
     */
    loadImage(){
        this.load.image("amplify", "assets/images/amplify.png")
        this.load.image("button", "assets/images/button.png")
        this.load.image("bg", "assets/images/bg.png")
        this.load.image("floor1", "assets/images/floor1.png")
        this.load.image("floor2", "assets/images/floor2.png")
        this.load.image("floor3", "assets/images/floor3.png")
        this.load.image("move", "assets/images/move.png")
        this.load.image("reduce", "assets/images/reduce.png")
        this.load.image("showGrid", "assets/images/showGrid.png")
        this.load.image("star", "assets/images/star.png")
        this.load.image("textBg", "assets/images/textBg.png")
        this.load.image("speedX1","assets/images/speedX1.png")
        this.load.image("speedX2","assets/images/speedX2.png")
        this.load.image("speedX4","assets/images/speedX4.png")
        // this.load.image("images", "assets/images/images.png")
    }

    /**
     * 加载地图数据
     */
    loadMapData(){
        // this.load.tilemapTiledJSON("seabed1", "assets/mapData/level1.json")
    }

    /**
     * 加载精灵图
     */
    loadSprite(){
        this.load.spritesheet("player", "assets/images/player.png", {frameWidth: 48, frameHeight: 48})
        this.load.spritesheet("ship", "assets/images/ship.png", {frameWidth: 80, frameHeight: 60})
        this.load.spritesheet("images", "assets/images/images.png", {frameWidth: 178, frameHeight: 350})
        this.load.spritesheet("grid", 'assets/images/grid.png', {frameWidth: 182, frameHeight: 350})
    }
}