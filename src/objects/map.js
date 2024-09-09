import Phaser from "phaser"
import Grid from "./grid"
import LayerPro from "./layerPro"
import Generator from "./generator"

/**
 * 维护地图的类
 */
export default class Map{

    constructor(scene, key, x = 0, y = 0, depth = 0){

        this.scene = scene
        this.tilemap = scene.make.tilemap({key: key})
        this.x = x
        this.y = y
        this.depth = depth
        this.scale = 1
        this.width = this.tilemap.width
        this.height = this.tilemap.height
        this.tileWidth = this.tilemap.tileWidth
        this.tileHeight = this.tilemap.tileHeight
        this.tilesets = this.tilemap.tilesets
        this.tilePros = {}
        this.grid = new Grid(scene, this)
        this.layerListData = this.tilemap.layers            //存储图层二维数组数据
        this.layerList = []
        this.propList = []
        this.playerList = []
        this.shipList = []
        this.moveData = []

        this.moveSpace = new Array(this.height)

        this.initLayers()
        this.initMoveSapce(0, 1)
        this.addOnEvent()
        this.init()
    }

    init(){
        //玩家和道具重叠检测
        this.scene.physics.add.overlap(this.playerList, this.propList, 
            (player, star) => {
                // this.scene.sound.play("star")
                star.destroy()
            },
            (player, star) => {
                return player.gridX === star.gridX && player.gridY === star.gridY
            }
        )
        //船和道具重叠检测
        // this.scene.physics.add.overlap(this.shipList, this.propList,
        //     (ship, star) => {
        //         // this.scene.sound.play("star")
        //         ship.destroy()
        //     },
        //     (ship, star) => {
        //         return ship.gridX === star.gridX && ship.gridY === star.gridY
        //     }
        // )
        // 飞船ship和玩家player重叠检测
        // this.scene.physics.add.overlap(this.shipList, this.playerList,
        //     (ship, player) => {
        //         ship.driver = player
        //     },
        //     (ship, player) => {
        //         const isOverlap = ship.logicX === player.logicX && ship.logicY === player.logicY
        //         if(!isOverlap) ship.driver = null
        //         console.log(ship.logicX, ship.logicY, player.logicX, player.logicY)
        //         return isOverlap
        //     }
        // )
    }

    /**
     * 未做完，有缺陷
     */
    addOnEvent(){
        let dragX, dragY;   
        let dragging = false;  
  
        // 鼠标按下事件  
        this.scene.input.on('pointerdown', (pointer) => {  
            dragging = true;  
            dragX = pointer.x - this.x;  
            dragY = pointer.y - this.y;  
        });  
    
        // 鼠标移动事件  
        this.scene.input.on('pointermove', (pointer) => {  
            if (dragging) {  
                const x = pointer.x - dragX;  
                const y = pointer.y - dragY; 
                this.setPosition(x, y) 
            }  
        });  
    
        // 鼠标释放事件  
        this.scene.input.on('pointerup', () => {  
            dragging = false;  
        });  
    }

    /**
     * 添加瓦片集
     */
    addTilesetImages(){
        this.tilemap.tilesets.forEach(tileset => {
            this.tilemap.addTilesetImage(tileset.name, tileset.name)
            tileset.offset = tileset.tileOffset     //存储图片集偏移量
            const firstgid = tileset.firstgid
            for(let key in tileset.tileProperties){
                this.tilePros[firstgid + parseInt(key)] = tileset.tileProperties[key]   //需要将key转换成数字
            }
        })
    }

    /**
     * 关闭显示网格
     */
    closeGrid(){
        this.grid.setVisible(false)
    }

    /**
     * 创造补间动画链
     */
    createTweenChain(){
        const chain = []
        const start = {
            targets: this.playerList[0],
            onComplete: () => {
                this.scene.cameras.main.startFollow(this.playerList[0])
            }
        }
        chain.push(start)
        for(let i = 0; i < this.moveData.length; i++){
            if(this.moveData[i].type === "turn"){
                const tween = this.moveData[i].target.getTurnTween(this.moveData[i])
                chain.push(tween)
            } else if(this.moveData[i].type === "move"){
                if(!this.moveData[i].isCanMove) {
                    const tween = {
                        targets: this.moveData[i].target,
                        duration: 2000,
                        onComplete: () => {
                            //提示
                            //动画效果
                            this.scene.scene.start("transform", {level: "level1", score: 0})
                        }
                    }
                    chain.push(tween)
                    break
                }
                const tween = this.moveData[i].target.getMoveTween(this.moveData[i])
                chain.push(tween)
            }
        }
        const end = {
            targets: this.playerList[0],
            onComplete: () => {
                this.scene.cameras.main.stopFollow(this.playerList[0])
            }
        }
        chain.push(end)
        this.scene.tweens.chain({ tweens: chain })
    }

    /**
     * 初始化图层
     */
    initLayers(){
        this.addTilesetImages()
        this.tilemap.layers.forEach(layerData => {
            const layerPro = new LayerPro(layerData.properties) //将json数据中图层属性转化成对象
            if(layerPro.getType() === "build"){
                const layer = this.tilemap.createLayer(layerData.name, this.tilemap.tilesets, this.x, this.y)
                layer.setDepth(this.depth + layerPro.getDepth())
                this.layerList.push(layer)
            } else if(layerPro.getType() === "prop"){
                layerData.data.forEach((row) => {
                    row.forEach((tile) => {
                        const tilePro = this.tilePros[tile.index]
                        if(tilePro && tilePro.type === "prop"){
                            const prop = Generator.generateProp(this, tilePro.name, tile.x, tile.y, this.depth + layerPro.getDepth())
                            this.propList.push(prop)
                        }
                    });
                });
            }
        });
    }

    /**
     * 初始化活动空间moveSpace
     * layerIndex1、layerIndex2为物体脚下一层和物体所在的一层
     * 根据两个图层来决定moveSace
     */
    initMoveSapce(layerIndex1 = 0, layerIndex2 = 1){
        const layer1 = this.layerList[layerIndex1] ? this.layerList[layerIndex1].layer.data : undefined
        const layer2 = this.layerList[layerIndex2] ? this.layerList[layerIndex2].layer.data : undefined
        for(let i = 0; i < this.height; i++){
            this.moveSpace[i] = new Array(this.width)
            for(let j = 0; j < this.width; j++){
                this.moveSpace[i][j] = -1
                const tilePro1 = layer1 ? this.tilePros[layer1[i][j].index] : undefined
                const tilePro2 = layer2 ? this.tilePros[layer2[i][j].index] : undefined
                if(tilePro1 && tilePro1.collide
                    && (!tilePro2 ||  !tilePro2.collide) 
                ) this.moveSpace[i][j] = 0
            }
        }
    }

    /**
     * 显示网格
     */
    openGrid(){
        this.grid.setVisible(true)
    }

    /**
     * 设置depth
     * @param {*} depth 
     */
    setDepth(depth = 0){
        if(typeof depth != "number") 
            console.log("./objects/map.js setDepth中depth参数不是合法数字！")
        this.depth = depth
    }

    /**
     * 放大和缩小
     */
    setScale(scale){
        this.scale = scale
        this.layerList.forEach(layer => {
            layer.setScale(scale)
        });
        this.propList.forEach(prop => {
            prop.setScale(scale)
            
        });
        this.playerList.forEach(player => {
            player.setScale(scale)
        });
        this.shipList.forEach(ship => {
            ship.setScale(scale)
        })
        this.tilesets.forEach(tileset => {
            tileset.tileOffset = new Phaser.Math.Vector2(tileset.offset.x*scale, tileset.offset.y*scale)
        });
        this.grid.setScale(scale)
    }

    /**
     * 设置地图坐标
     */
    setPosition(x, y){
        this.x = x
        this.y = y
        this.layerList.forEach(layer => {
            layer.setPosition(this.x, this.y)
        })
        this.propList.forEach(prop => {
            prop.setGridPosition(prop.gridX, prop.gridY)
        });
        this.playerList.forEach(player => {
            player.setGridPosition(player.gridX, player.gridY)
        })
        this.shipList.forEach(ship => {
            ship.setGridPosition(ship.gridX, ship.gridY)
        })
        this.grid.setPosition(this.x, this.y)
    }

}