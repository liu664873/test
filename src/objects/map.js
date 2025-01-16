import Generator from "./Generator"
import { TileOffset } from "../configs/MapConfig"
import TileObj from "./base/TileObj"
import { GAME_DATA } from "../configs/Config"

/**
 * 维护地图的类
 */
export default class Map {

    constructor(scene, key, x = 0, y = 0, depth = 0) {

        this.scene = scene
        this.tilemap = scene.make.tilemap({ key: key })
        this.x = x
        this. y = y
        this.depth = depth
        this.scale = 1
        this.width = this.tilemap.width
        this.height = this.tilemap.height
        this.tileWidth = this.tilemap.tileWidth
        this.tileHeight = this.tilemap.tileHeight
        this.tileProMap = {}
        this.gridLayer = null
        this.layerList = []
        this.propList = []
        this.energyList = []
        this.flyerList = []
        this.player = null;
        this.ship = null;
        this.flyer = null;
        this.layerData = {}
        this.objList = []
        
        this.initMap()

    }

    initMap(){
        this.initTilesets();
        this.initLayerData();
        this.initLayers();
        this.initPhysics();
    }

    /**
     * 添加瓦片集
     */
    initTilesets() {
        this.tilemap.tilesets.forEach(tileset => {
            console.log(tileset)
            this.tilemap.addTilesetImage(tileset.name, tileset.name)
            const firstgid = tileset.firstgid;
            for (let key in tileset.tileProperties) {
                this.tileProMap[firstgid + parseInt(key)] = tileset.tileProperties[key]   //需要将key转换成数字
            }
        })
}

    /**
     * 初始化图层
     */
    initLayers() {

        this.tilemap.layers.forEach(layerData => {
            const { name, x, y, data } = layerData;
            const layerPro = this.parseLayerName(name);
            const [depthModifier, layerType] = layerPro;

            if (!depthModifier || !layerType) return; // 如果解析结果不完整，则跳过

            let offsetX, offsetY;
            if (layerType === "grid") {
                offsetX = x + TileOffset.grid.offset.x;
                offsetY = y + TileOffset.grid.offset.y;
            } else if (layerType === "plot" || layerType === "floor") {
                offsetX = x + TileOffset.images.offset.x;
                offsetY = y + TileOffset.images.offset.y;
            } else {
                offsetX = x;
                offsetY = y;
            }

            const layer = this.tilemap.createLayer(name, layerType === "obj" || layerType === "aircraft"? null : this.tilemap.tilesets, this.x + offsetX, this.y + offsetY);
            layer.offsetX = offsetX;
            layer.offsetY = offsetY;
            layer.setDepth(this.depth + depthModifier);

            if (layerType === "grid") {
                this.gridLayer = layer;
            }

            this.layerList.push(layer);

            if (layerType === "obj" || layerType === "aircraft") {
                this.processObjectLayer(layer, layerData, layerPro);
            }
        });
    }

    initLayerData(){
        this.tilemap.layers.forEach(layerData => {
            const layerPro = this.parseLayerName(layerData.name)
            console.log(layerData)
            if(!this.layerData[layerPro[0]]) this.layerData[layerPro[0]] = {}
            const data = []
            layerData.data.forEach((tiles, i) => {
                data[i] = []
                tiles.forEach((tile, j) => {
                    data[i][j] = tile.index
                })
            })
            this.layerData[layerPro[0]][layerPro[1]] = data
        })
    }

    initPhysics() {
        const manager = this.scene.game.manager;
     
        this.scene.physics.add.overlap(
            this.player,
            this.energyList,
            (player, energy) => {
                energy.destroy();
                manager.collectEnergyNum++;
                this.scene.progressBar.update(manager.collectEnergyNum / manager.energyCount);
                this.layerData[energy.layerIndex].obj[energy.gridY][energy.gridX] = -1;
     
                // 检查是否所有能量都已收集
                if (manager.collectEnergyNum === manager.energyCount) {
                    manager.levelStatus = GAME_DATA.LEVEL_STATUS_PASSED;
                    manager.isEnd = true;
                }
            },
            (player, energy) => {
                const dx = Math.abs(player.gridX - energy.gridX);
                const dy = Math.abs(player.gridY - energy.gridY);
                return player.layerIndex === energy.layerIndex && dx < 0.3 && dy < 0.3;
            }
        );
    }

      /**
     * 关闭显示网格
     */
      closeGrid() {
        if (this.gridLayer != null) this.gridLayer.setVisible(false)
    }

    /**
     * 处理对象图层
     * @param {Phaser.Tilemaps.TilemapLayer} layer - Phaser的图层对象
     * @param {any} layerData - 图层数据
     */
    processObjectLayer(layer, layerData) {
        const layerPro = this.parseLayerName(layerData.name);
        const [depthModifier, layerType] = layerPro;
        for (const row of layerData.data) {
            for (const tile of row) {
                const tilePro = this.tileProMap[tile.index];
                if (!tilePro) continue;

                const obj = Generator.generateObj(this, layer, tilePro, tile.x, tile.y);
                if (obj) {
                    this.layerData[depthModifier][layerType][tile.y][tile.x] = obj;
                    this.objList.push(obj);
                    if (tilePro.type === "obj") {
                        if (tilePro.tag === "energy") {
                            this.propList.push(obj)
                            const index = this.energyList.push(obj) - 1;
                            if (obj.info) obj.info.setContext(`energy[${index}]`);
                        } else if ("player" === tilePro.tag) this.player = obj
                    } else if (tilePro.type === "aircraft") {
                        if("ship" === tilePro.name) this.ship = obj
                        if("flyer" === tilePro.name) {
                            this.flyer = obj
                            console.log("这是flyer",this.flyer)
                            this.flyerList.push(obj)
                        }
                    }
                }
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
            console.log("class:Map method: setDepth, depth参数不是合法数字！")
        this.depth = depth
    }

    /**
     * 放大和缩小
     */
    setScale(scale) {
        this.scale = scale
        this.layerList.forEach(layer => {
            layer.setScale(scale)
            layer.setPosition(this.x  + scale * layer.offsetX, this.y + scale * layer.offsetY)
        });
        this.objList.forEach(obj => {
            obj.setScale(scale)
        })
    }

    /**
     * 设置地图坐标
     */
    setPosition(x, y) {
        this.x = x
        this.y = y
        this.layerList.forEach(layer => {
            layer.setPosition(this.x + layer.scaleX*layer.offsetX, this.y + layer.scaleY*layer.offsetY)
        })
        this.objList.forEach(obj => {
            obj.setGridPosition(obj.gridX, obj.gridY)
        });
    }

    /**  
     * 更新地图数据，标记位置变化。  
     * @param {Phaser.Math.Vector2} from - 当前位置。  
     * @param {Phaser.Math.Vector2} to - 新位置。   
     * @param {TileObj} 对象
     */  
    updateLocationData(from, to, tileObj) {  
        this.layerData[tileObj.layerIndex][tileObj.tilePro.type][from.y][from.x] = -1; // 更新地图数据，标记tileObj的原位置为空  
        this.layerData[tileObj.layerIndex][tileObj.tilePro.type][to.y][to.x] = tileObj; // 更新地图数据，标记新位置为tileObj
    } 

    overBorder(gridX, gridY) {
        return gridX < 0 || gridX > this.mapWidth || gridY < 0 || gridY > this.mapHeight;
    }
     
    getTileProByIndex(index) {
        return this.tileProMap[index];
    }
     
    getTilePro(gridX, gridY, layerIndex, type) {
        const index = this.getTileIndex(gridX, gridY, layerIndex, type);
        return index !== null ? this.getTileProByIndex(index) : null;
    }
     
    getTileIndex(gridX, gridY, layerIndex, type) {
        if (this.overBorder(gridX, gridY)) return -1;
        const layer = this.layerData[layerIndex][type];
        const tile = layer ? layer[gridY][gridX] : undefined;
        return typeof tile === "number" ? tile : tile instanceof TileObj ? tile.index : -1;
    }
     
    // 从对象层中获取瓦片对象
    getTileObj(gridX, gridY, layerIndex, layerType) {
        if (this.overBorder(gridX, gridY)) return null;
        const objLayer = this.layerData[layerIndex]?.[layerType];
        if (!objLayer) return null;
        const obj = objLayer[gridY]?.[gridX];
        return obj instanceof TileObj ? obj : null;
    }

    parseLayerName(layerName){
        const regex = /^(\d+)_([A-Za-z]+)$/;
        const match = layerName.match(regex)
        if(match) return [parseInt(match[1], 10),match[2]];
        return [null, null];
    }

}