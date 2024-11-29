import DynamicObj from "../../base/DynamicObj";
import TileConfig from "../../../configs/TileConfig";
import ActionData from "../../datas/ActionData";

export default class Player extends DynamicObj {

    /**
     * 构造函数
     * 初始化玩家对象，包括设置初始生命值、驾驶状态和载具等。
     * 
     * @param {Map} map - 游戏地图对象，包含地图信息，可以管理地图数据。
     * @param {Phaser.Tilemaps.TilemapLayer} layer - 游戏图层对象，包含图层图的瓦片数据和图层信息。
     * @param {string} name - tileObj对象名，作为TileConfig的key值来获取数据创建游戏对象。
     * @param {number} gridX - 网格坐标x，表示对象在地图网格中的水平位置，默认为0。
     * @param {number} gridY - 网格坐标y，表示对象在地图网格中的垂直位置，默认为0。
     */
    constructor(map, layer, name, gridX = 0, gridY = 0) {
        super(map, layer, name, gridX, gridY);

        // 设置玩家的初始生命值，从TileConfig配置中获取，如果未配置则默认为100。
        this.health = TileConfig[name]?.health || 100;

        // 初始化驾驶状态为未驾驶。
        this.driving = false;

        // 初始化载具对象为null，表示玩家当前没有驾驶载具。
        this.aircraft = null;

        this.initStatus();

        this.setDepth(this.depth + 0.5)

    }

    /**
     * 重写父类方法，自动调用。
     * 检查玩家当前位置是否有可驾驶的载具。
     */
    initStatus() {
        this.checkStatus();
    }

    /**
     * 重写父类方法，自动调用。
     * 判断玩家是否可以从当前位置移动到指定位置。
     * @param {number} gridX - 目标网格坐标x。
     * @param {number} gridY - 目标网格坐标y。
     * @returns {boolean} - 如果玩家可以移动到指定位置，则返回true；否则返回false。
     */
    canMove(gridX, gridY) {
        // 首先调用父类的canMove方法，如果父类判断不能移动，则直接返回false。
        if (!super.canMove(gridX, gridY)) {
            return false;
        }

        // 获取目标位置下方建筑瓦片属性、下方对象瓦片属性、当前层建筑瓦片属性和当前层对象瓦片属性。
        const lowPlotTilePro = this.map.getTilePro(gridX, gridY, this.layerIndex - 1, "plot");
        const curAircraftTilePro = this.map.getTilePro(gridX, gridY, this.layerIndex, "aircraft");
        const curPlotTilePro = this.map.getTilePro(gridX, gridY, this.layerIndex, "plot");
        const curFloorTilePro = this.map.getTilePro(gridX, gridY, this.layerIndex, "floor");
        const curObjTilePro = this.map.getTilePro(gridX, gridY, this.layerIndex, "obj");

        // 判断目标位置是否允许通过（即是否有carrier属性且没有collide属性）。
        const carry = lowPlotTilePro?.carrier || curAircraftTilePro?.carrier || curFloorTilePro?.carrier;
        const collide = curPlotTilePro?.collide || curObjTilePro?.collide;

        return carry && !collide;
    }

    /**
     * 重写方法,自动调用。
     * 检查玩家当前位置是否有可驾驶的载具。
     * 如果找到可驾驶的载具，则更新玩家的载具对象和驾驶状态。
     */
    checkStatus() {
        // 获取玩家当前位置图层的对象。
        const obj = this.map.getTileObj(this.logicX, this.logicY, this.layerIndex, "aircraft");
        const tilePro = this.map.getTileProByIndex(obj?.index);

        // 如果找到的对象具有canCarry属性，则更新玩家的载具对象和驾驶状态。
        if (tilePro?.canCarry) {
            this.aircraft = obj;
            this.driving = true;
        } else {
            this.aircraft = null;
            this.driving = false;
        }
    }

    /**
     * 重写父类方法，自动调用。
     * 根据传入的动作数据更新玩家的状态，并检查玩家当前位置是否有可驾驶的载具。
     * @param {ActionData} actionData - 动作数据。
     */
    updateLogicData(actionData) {
        super.updateLogicData(actionData);
    }

    /**
     * 创建一个代理对象，该对象将拦截对 Player 实例的某些方法调用和属性访问。
     * 
     * @returns {Proxy} - 返回一个代理对象。
     */
    createProxy() {
        const target = this;
        const proxiedMethods = ['step', 'turnRight', 'turnLeft'];
    
        const handler = {
            get(target, prop, receiver) {
                // 属性访问重定向
                if (prop === 'x') return target.gridX;
                if (prop === 'y') return target.gridY;
    
                // 方法代理
                if (typeof target[prop] === 'function' && proxiedMethods.includes(prop)) {
                    return function (...args) {
                        return Reflect.apply(target[prop], target, args);
                    };
                }
    
                // 默认行为：直接返回目标对象的属性
                return Reflect.get(target, prop, receiver);
            },
    
        };
    
        return new Proxy(target, handler);
    }

}