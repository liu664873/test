import DynamicObj from "../../base/DynamicObj"

export default class Flyer extends DynamicObj{
      /**
     * 构造函数
     * 
     * @param {Map} map - 游戏地图对象，包含地图信息，可以管理地图数据。
     * @param {Phaser.Tilemaps.TilemapLayer} layer - 游戏图层对象，包含图层图的瓦片数据和图层信息。
     * @param {string} name - tileObj对象名，作为TileConfig的key值来获取数据创建游戏对象。
     * @param {number} gridX - 网格坐标x，表示对象在地图网格中的水平位置，默认为0。
     * @param {number} gridY - 网格坐标y，表示对象在地图网格中的垂直位置，默认为0。
     */
      constructor(map, layer, name, gridX = 0, gridY = 0) {  
        super(map, layer, name, gridX, gridY);  
        this.direction = null
        this.initStatus();
    }  

    /**
     * 重写父类方法，自动调用。
     * 检查当前位置是否有驾驶者。
     */
    initStatus(){
        this.checkStatus();
    }
  
    /**
     * 重写父类方法，自动调用。
     * 检查该位置是否能移动。
     */
    canMove(gridX, gridY) {  
        // 首先调用父类的 canMove 方法，如果父类判断不能移动，则直接返回 false
        if (!super.canMove(gridX, gridY)) {
            return false;
        }
 
        // 获取目标位置下方建筑瓦片属性、下方对象瓦片属性、当前层建筑瓦片属性和当前层对象瓦片属性。
        const lowPlotTilePro = this.map.getTilePro(gridX, gridY, this.layerIndex - 1, "plot");
        const curFloorTilePro = this.map.getTilePro(gridX, gridY, this.layerIndex, "floor");
        const curObjTilePro = this.map.getTilePro(gridX, gridY, this.layerIndex, "obj");


        const collide = lowPlotTilePro|| curFloorTilePro || curObjTilePro?.collide;

 
        // return !collide && (!this.driver || this.driver.canMove(gridX, gridY)); 
        return !collide;
    } 

    /**
     * 重写父类方法，自动调用。
     * 根据传入的动作数据更新状态。
     * @param {number} gridX - 目标网格坐标x。
     * @param {number} gridY - 目标网格坐标y。
     * @returns {boolean} - 可以移动到指定位置，则返回true；否则返回false。
     */
    updateLogicData(actionData){
        super.updateLogicData(actionData);
        if(this.driver) {
            this.driver.updateLogicData(actionData);
            actionData.targets.push(this.driver);
        }
    }

    /**
     * 重写方法,自动调用。
     * 检查当前位置是否有驾驶员。
     * 如果找到可驾驶员，则更新状态。
     */
    checkStatus(){
        // 获取上层的同样位置的对象 
        const obj = this.map.getTileObj(this.logicX, this.logicY, this.layerIndex, "obj");
        if(!obj) return;
        const tilePro = this.map.getTileProByIndex(obj.index);
        // 检查上层是否有驾驶者 
        if( tilePro.canDrive ) {
            this.driver = obj;
            this.driver.driving = true;
        } else if(this.driver){
            this.driver.driving = false;
            this.driver = null;
        }
    }

    createProxy() {
        const handler = {
            get(target, prop, receiver) {
                // 如果访问的属性是 x 则返回gridX 或 y返回gridY。
                if (prop === 'x') return target.gridX;
                else if(prop === 'y') return target.gridY;

                // 如果访问的是方法，并且是需要被代理的方法之一，则返回该方法。
                if (typeof target[prop] === 'function' &&
                    (prop === 'step' || prop === 'turnRight' || prop === 'turnLeft')) {
                    return function (...args) {
                        return target[prop].apply(target, args);
                    };
                }
            },

        };

        // 创建并返回代理对象。
        return new Proxy(this, handler);
    }

    saveActionData(actionData) {
        // 获取游戏管理器实例  
        const manager = this.scene.game.manager;

        if (manager) {
            manager.addActionData(actionData);
        };
    }
}