import Phaser from "phaser"
import Grid from "./grid"
import LayerPro from "./layerPro"
import Generator from "./generator"
import UI from "./ui/ui"
import SceneEffect from "./sceneEffect"
import { layerOffset, tileOffset } from "../configs/mapConfig"

const directionName = {
    east: "东",
    west: "西",
    south: "南",
    north: "北"
}
/**
 * 维护地图的类
 */
export default class Map {

    constructor(scene, key, x = 0, y = 0, depth = 0) {

        this.scene = scene
        this.tilemap = scene.make.tilemap({ key: key })
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
        // this.grid = new Grid(scene, this)
        this.gridLayer = null
        this.layerListData = this.tilemap.layers            //存储图层二维数组数据
        this.layerList = []
        this.propList = []
        this.collectedPropNum = 0 //收集道具的数量
        this.playerList = []
        this.shipList = []
        this.moveData = []
        this.moveSpace = Array.from({ length: this.height }, () =>  
            Array.from({ length: this.width }, () => -1)  
        ); 
        this.activeLayerIndex = 0
        this.initLayers()
        this.initMoveSapce(this.activeLayerIndex - 2, this.activeLayerIndex - 1)

        this.shouldShowInfo = true
      
        this.init()
        window.chainTween = null

    }

    init() {
        //玩家和道具重叠检测
        this.scene.physics.add.overlap(this.playerList, this.propList,
            (player, prop) => {
                this.collectedPropNum++
                console.log("aa",this.collectedPropNum, this.propList.length)
                this.scene.progressBar.updateProgress(this.collectedPropNum / this.propList.length)
                prop.destroy()
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
     * 添加瓦片集
     */
    addTilesetImages() {
        this.tilemap.tilesets.forEach(tileset => {
            this.tilemap.addTilesetImage(tileset.name, tileset.name)
            tileset.offset = tileOffset[tileset.name]    //存储图片集偏移量
            const firstgid = tileset.firstgid
            for (let key in tileset.tileProperties) {
                this.tilePros[firstgid + parseInt(key)] = tileset.tileProperties[key]   //需要将key转换成数字
            }
        })
    }

    /**
     * 关闭显示网格
     */
    closeGrid() {
        // this.grid.setVisible(false)
        if (this.gridLayer != null) this.gridLayer.setVisible(false)
    }

    /**
     * 创造补间动画链
     */
    createTweenChain() {
        if (this.chainTween) return
        const chain = []

        //开始动画，主要设置摄像头跟随
        const start = {
            targets: this.moveData[0].targets,
            onComplete: () => {
                this.scene.cameras.main.startFollow(this.playerList[0])
            }
        }
        chain.push(start)

        let data = null

        for (let i = 0; i < this.moveData.length; i++) {
            if (this.moveData[i].type === "turn") {
                const tween = this.moveData[i].target.getTurnTween(this.moveData[i])
                chain.push(tween)
            } else if (this.moveData[i].type === "move") {
                if (this.moveData[i].isCanMove) {
                    const tween = this.moveData[i].target.getMoveTween(this.moveData[i])
                    chain.push(tween)
                } else {
                    data = this.moveData[i]
                    break
                }
            }
        }

        let end
        if (data) {
            end = {
                targets: data.targets,
                onComplete: () => {
                    this.scene.cameras.main.stopFollow(data.targets)
                    let info = `${data.target.name}在坐标(${data.from.x},${data.from.y})不能向${directionName[data.direction]}移动，\n\n是否重新开始？`
                    const width = this.scene.sys.game.config.width
                    const height = this.scene.sys.game.config.height
                    const popUp = UI.popUp(this.scene, width / 2, height / 2, this.depth + 10, info,
                        () => { }, () => { this.scene.scene.start("transform", { levelData: this.scene.levelData }) }).setScrollFactor(0)
                    window.chainTween = null

                }
            }
        } else {
            data = this.moveData[this.moveData.length - 1]
            end = {
                targets: data.target,
                props: {
                    z: 0.5
                },
                onComplete: () => {
                    if (this.collectedPropNum < this.propList.length) {
                        this.scene.cameras.main.stopFollow(data.targets)
                        let info = `已经收集道具${this.collectedPropNum},还有${this.propList.length - this.collectedPropNum}个未收集,\n\n是否重新开始？`
                        const width = this.scene.sys.game.config.width
                        const height = this.scene.sys.game.config.height
                        const popUp = UI.popUp(this.scene, width / 2, height / 2, this.depth + 10, info,
                            () => { },
                            () => { SceneEffect.closeScene(this.scene, () => { this.scene.scene.start("transform", { levelData: this.scene.levelData }) }) })
                    } else {
                        this.scene.cameras.main.stopFollow(data.targets)
                        let info = `是否进入下一关！`
                        const width = this.scene.sys.game.config.width
                        const height = this.scene.sys.game.config.height
                        this.scene.levelData.level++
                        const popUp = UI.popUp(this.scene, width / 2, height / 2, this.depth + 10, info,
                            () => { },
                            () => { SceneEffect.closeScene(this.scene, () => { this.scene.scene.start("transform", { levelData: this.scene.levelData }) }) })
                    }
                    window.chainTween = null
                    window.runningChain = false
                }
            }
        }

        chain.push(end)
        this.chainTween = this.scene.tweens.chain({ tweens: chain })
        this.chainTween.timeScale = this.scene.cureSpeed
        window.chainTween = this.chainTween
        this.moveData = []
        window.runningChain = true
    }


    /**
     * 初始化图层
     */
    initLayers() {
        this.addTilesetImages()
        this.tilemap.layers.forEach(layerData => {
            const layerPro = new LayerPro(layerData.properties) //将json数据中图层属性转化成对象
            if (layerPro.getType() === "build" || layerPro.getType() === "grid") {
                const layer = this.tilemap.createLayer(layerData.name, this.tilemap.tilesets, this.x, this.y + ((layerPro.getDepth() - 1) * layerOffset.y))
                layer.setDepth(this.depth + layerPro.getDepth())
                if (layerPro.getType() === "grid") this.gridLayer = layer
                else this.layerList.push(layer)
            } else if (layerPro.getType() === "obj") {
                layerData.data.forEach((row) => {
                    row.forEach((tile) => {
                        const tilePro = this.tilePros[tile.index]
                        if (tilePro && tilePro.type === "energy") {
                            const energy = Generator.generateEnergy(this, tilePro.name, tile.x, tile.y, this.depth + layerPro.getDepth())
                            energy && this.propList.push(energy)
                        } else if (tilePro && tilePro.type === "player") {
                            const player = Generator.generatePlayer(this, tilePro.type, tile.x, tile.y, this.depth + layerPro.getDepth() + 0.2, tilePro.direction)
                            this.playerList.push(player)
                            this.activeLayerIndex = layerPro.depth
                        } else if (tilePro && tilePro.type === "ship") {
                            const ship = Generator.generateShip(this, tilePro.type, tile.x, tile.y, this.depth + layerPro.getDepth() + 0.1, tilePro.direction)
                            this.shipList.push(ship)
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
    initMoveSapce(layerIndex1 = 0, layerIndex2 = 1) {
        const layer1 = this.layerList[layerIndex1] ? this.layerList[layerIndex1].layer.data : undefined
        const layer2 = this.layerList[layerIndex2] ? this.layerList[layerIndex2].layer.data : undefined
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                if(this.moveSpace[i][j] != -1) continue 
                const tilePro1 = layer1 ? this.tilePros[layer1[i][j].index] : undefined
                const tilePro2 = layer2 ? this.tilePros[layer2[i][j].index] : undefined
                //决定人是否能走
                if (tilePro1 && tilePro1.collide && tilePro2 && tilePro2.collide) this.moveSpace[i][j] = -2
                else if(!tilePro1 || !tilePro1.collide) this.moveSpace[i][j] = -1
                else this.moveSpace[i][j] = 0
            }
        }
    }

    /**
     * 显示网格
     */
    openGrid() {
        // this.grid.setVisible(true)
        if (this.gridLayer != null) this.gridLayer.setVisible(true)
    }

    /**
     * 设置depth
     * @param {*} depth 
     */
    setDepth(depth = 0) {
        if (typeof depth != "number")
            console.log("./objects/map.js setDepth中depth参数不是合法数字！")
        this.depth = depth
    }

    /**
     * 放大和缩小
     */
    setScale(scale) {
        this.scale = scale
        this.layerList.forEach(layer => {
            layer.setScale(scale)
            layer.setPosition(this.x, this.y + ((layer.depth - this.depth - 1) * layer.scale * layerOffset.y))
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
            tileset.tileOffset = new Phaser.Math.Vector2(tileset.offset.x * scale, tileset.offset.y * scale)
        });
        // this.grid.setScale(scale)
        this.gridLayer.setScale(scale)
        this.gridLayer.setPosition(this.x, this.y + ((this.gridLayer.depth - this.depth - 1) * this.gridLayer.scale * layerOffset.y))
    }

    /**
     * 设置地图坐标
     */
    setPosition(x, y) {
        this.x = x
        this.y = y
        this.layerList.forEach(layer => {
            layer.setPosition(this.x, this.y + ((layer.depth - this.depth - 1) * layer.scale * layerOffset.y))
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
        // this.grid.setPosition(this.x, this.y)
        this.gridLayer.setPosition(this.x, this.y + ((this.gridLayer.depth - this.depth - 1) * this.gridLayer.scale * layerOffset.y))
    }

}