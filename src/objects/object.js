import Phaser from "phaser"

/**
 * 游戏对象基类
 * 拥有网格坐标、网格宽度等基本信息
 */

export default class Object extends Phaser.GameObjects.Sprite {
    
    /**
     * @param {*} map 游戏地图
     * @param {*} name 对象名
     * @param {*} x 网格坐标x,默认为0
     * @param {*} y 网格坐标y,默认为0
     * @param {*} depth 这里深度相对于map，显示对象在哪一图层级,默认为0
     */
    constructor(map, name, gridX = 0, gridY = 0, depth = 0){

        const vec = new Phaser.Math.Vector2()
        map.tilemap.tileToWorldXY(gridX, gridY, vec)    //将网格坐标转换为世界坐标
        super(map.scene, vec.x, vec.y, name) 

        this.map = map
        this.name = name
        this.gridX = gridX
        this.gridY = gridY
        this.depth = depth
        this.tileWidth = map.tileWidth
        this.tileHeight = map.tileHeight
        this.mapWidth = map.width
        this.mapHeight = map.Height

    }

    getGridX(){
        return this.gridX
    }

    getGridY(){
        return this.gridY
    }

    getGridPosition(){
        return new Phaser.Math.Vector2(this.gridX, this.gridY)
    }

   
    setGridPosition(gridX, gridY){
        if(
            typeof gridX != "number" 
            || typeof gridY != "number"
            || gridX < 0 || gridX >= this.mapWidth
            || gridY < 0 || gridY >= this.mapHeight
        ) {
            console.log("object setGridXY 参数不合法!")
        } else {
            this.gridX = gridX
            this.gridY = gridY
            const vec = new Phaser.Math.Vector2()
            this.map.tilemap.tileToWorldXY(gridX, gridY, vec)
            this.setPosition(vec.x, vec.y)
        }
        return this
    }

    /**
     * 重写setScale方法
     * 用于调整放大和缩小后不合理渲染 
     */
    setScale(x, y){
        super.setScale(x, y)
        
        this.setGridPosition(this.gridX, this.gridY)
        if(this.info) this.info.setScale(x, y)
        return this;
    }
}