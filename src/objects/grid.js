import Phaser from "phaser"

/**
 * 一个网格类
 * 利用Graphics呈现地图tilemap的网格
 */
export default class Grid extends Phaser.GameObjects.Graphics{

    constructor(scene, map) {
        super(scene)
        this.scene.add.existing(this)       //必须将画笔添加到scene的渲染类表中
        this.map = map
        this.tilemap = map.tilemap
        this.width = map.tilemap.width
        this.height = map.tilemap.height
        this.tileWidth = map.tilemap.tileWidth
        this.tileHeight = map.tilemap.tileHeight
        this.depth = map.depth + 1.1
        this.style = {      //默认样式，可以通过setLineStyle改变
            width : 2,
            color : 0xff0000,
            alpha : 1
        }
        this.draw()
        this.setVisible(false)
    }
    
    draw(){
        this.clear()
        this.lineStyle(this.style.width, this.style.color, this.style.alpha)
        this.setPosition(this.map.x, this.map.y)

        const startX = new Array(this.width + 1)
        const endX = new Array(this.width + 1)
        const startY = new Array(this.height + 1)
        const endY = new Array(this.height + 1)

        for(let i = 0; i <= this.width; i++){
            const vec = new Phaser.Math.Vector2()
            if(i === 10){
                vec.x = startX[i - 1].x + this.tileWidth/2
                vec.y = startX[i - 1].y + this.tileHeight/2
            } else {
                this.map.tilemap.tileToWorldXY(i, 0, vec)
                vec.x += this.tileWidth/2
                vec.y -= this.tileHeight/2
            }
            startX[i] = vec
        }

        for(let i = 0; i <= this.width; i++){
            const vec = new Phaser.Math.Vector2()
            if(i === 10){
                vec.x = endX[i - 1].x + this.tileWidth/2
                vec.y = endX[i - 1].y + this.tileHeight/2
            } else {
                this.map.tilemap.tileToWorldXY(i, 9, vec)
            }
            endX[i] = vec
        }

        for(let i = 0; i <= this.height; i++){
            const vec = new Phaser.Math.Vector2()
            if(i === 0){
                vec.x = startX[i].x
                vec.y = startX[i].y
            } else {
                this.map.tilemap.tileToWorldXY(0, i - 1, vec)
            }
            startY[i] = vec
        }

        for(let i = 0; i <= this.height; i++){
            const vec = new Phaser.Math.Vector2()
            if(i === 0){
                vec.x = startX[this.width].x
                vec.y = startX[this.width].y
            } else {
                this.map.tilemap.tileToWorldXY(9, i - 1, vec)
                vec.x += this.tileWidth/2
                vec.y += this.tileHeight/2
            }
            endY[i] = vec
        }

        for(let i = 0; i <= this.width; i++){
            this.lineBetween(startX[i].x, startX[i].y, endX[i].x, endX[i].y)
        }
        for(let i = 0; i <= this.height; i++){
            this.lineBetween(startY[i].x, startY[i].y, endY[i].x, endY[i].y)
        }
    }
    
    /**
     * 设置画笔样式
     * 同时检测接受的参数
     * @param {*} width 
     * @param {*} color 
     * @param {*} alpha 
     */
    setLineStyle(width, color, alpha){
        this.style.width = width ? width : 2
        this.style.color = color ? color : 0xff0000
        this.style.alpha = alpha ? alpha : 1
        this.lineStyle(this.style.width, this.style.color, this.style.alpha)
    }
}