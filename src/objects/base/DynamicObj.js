import { GAME_DATA } from "../../configs/Config";
import ActionData from "../datas/ActionData";
import TileObj from "./TileObj";

/**  
 * 拥有动态性的 TileObj，具有方向，可以移动等特性。  
 */
export default class DynamicObj extends TileObj {
    // 定义方向常量,动画 
    static DIRECTIONS = {
        NORTH: GAME_DATA.DIRECTION_NORTH,
        EAST: GAME_DATA.DIRECTION_EAST,
        SOUTH: GAME_DATA.DIRECTION_SOUTH,
        WEST: GAME_DATA.DIRECTION_WEST,
    };

    static ANIM_IDLE = {
        [DynamicObj.DIRECTIONS.NORTH]: GAME_DATA.ANIM_KEY_IDLE_NORTH,
        [DynamicObj.DIRECTIONS.EAST]: GAME_DATA.ANIM_KEY_IDLE_EAST,
        [DynamicObj.DIRECTIONS.SOUTH]: GAME_DATA.ANIM_KEY_IDLE_SOUTH,
        [DynamicObj.DIRECTIONS.WEST]: GAME_DATA.ANIM_KEY_IDLE_WEST
    }

    // 映射方向到坐标变化  
    static DIRECTION_DELTA = {
        [DynamicObj.DIRECTIONS.NORTH]: { x: 0, y: -1, animKey: GAME_DATA.ANIM_KEY_STEP_NORTH },
        [DynamicObj.DIRECTIONS.EAST]: { x: 1, y: 0, animKey: GAME_DATA.ANIM_KEY_STEP_EAST },
        [DynamicObj.DIRECTIONS.SOUTH]: { x: 0, y: 1, animKey: GAME_DATA.ANIM_KEY_STEP_SOUTH },
        [DynamicObj.DIRECTIONS.WEST]: { x: -1, y: 0, animKey: GAME_DATA.ANIM_KEY_STEP_WEST },
    };

    // 定义方向转换映射表  
    static TURN_MAPS = {
        LEFT: { // 左转方向映射  
            [DynamicObj.DIRECTIONS.NORTH]: { direction: DynamicObj.DIRECTIONS.WEST, animKey: GAME_DATA.ANIM_KEY_TURN_NORTH_WEST },
            [DynamicObj.DIRECTIONS.EAST]: { direction: DynamicObj.DIRECTIONS.NORTH, animKey: GAME_DATA.ANIM_KEY_TURN_EAST_NORTH },
            [DynamicObj.DIRECTIONS.SOUTH]: { direction: DynamicObj.DIRECTIONS.EAST, animKey: GAME_DATA.ANIM_KEY_TURN_SOUTH_EAST },
            [DynamicObj.DIRECTIONS.WEST]: { direction: DynamicObj.DIRECTIONS.SOUTH, animKey: GAME_DATA.ANIM_KEY_TURN_WEST_SOUTH }
        },
        RIGHT: { // 右转方向映射  
            [DynamicObj.DIRECTIONS.NORTH]: { direction: DynamicObj.DIRECTIONS.EAST, animKey: GAME_DATA.ANIM_KEY_TURN_NORTH_EAST },
            [DynamicObj.DIRECTIONS.EAST]: { direction: DynamicObj.DIRECTIONS.SOUTH, animKey: GAME_DATA.ANIM_KEY_TURN_EAST_SOUTH },
            [DynamicObj.DIRECTIONS.SOUTH]: { direction: DynamicObj.DIRECTIONS.WEST, animKey: GAME_DATA.ANIM_KEY_TURN_SOUTH_WEST },
            [DynamicObj.DIRECTIONS.WEST]: { direction: DynamicObj.DIRECTIONS.NORTH, animKey: GAME_DATA.ANIM_KEY_TURN_WEST_NORTH }
        },
    };

    /**  
     * 构造函数  
     * @param {Map} map - 游戏地图对象，包含地图信息，可以管理地图数据。  
     * @param {Phaser.Tilemaps.TilemapLayer} layer - 游戏图层对象，包含图层图的瓦片数据和图层信息
     * @param {string} name - tileObj对象名，作为TileConfig的key值来获取数据创建游戏对象。  
     * @param {number} gridX - 网格坐标x，表示对象在地图网格中的水平位置，默认为0。  
     * @param {number} gridY - 网格坐标y，表示对象在地图网格中的垂直位置，默认为0。
     */   
    constructor(map, layer, name, gridX, gridY) {
        super(map, layer, name, gridX, gridY);

        // 初始化方向
        this.direction = this.map.tileProMap[this.index].direction;
        // 逻辑坐标  
        this.logicX = gridX;
        this.logicY = gridY;
        this.logicDirection = this.direction;
        this.playAnim(DynamicObj.ANIM_IDLE[this.direction]);
    }

    /**
     * 初始化状态数据
     */
    checkStatus(){}

    /**
     * 给actionData添加动画播放
     * @param {ActionData} actionData 
     */
    addAnims(actionData){
        if(actionData.type === ActionData.TYPE_STEP){
            actionData.onStart = () => {
                actionData.target.stopAnim(DynamicObj.ANIM_IDLE[actionData.target.direction]);
                actionData.target.playAnim(DynamicObj.DIRECTION_DELTA[actionData.direction].animKey);
            };
     
            actionData.onComplete = () => {
                actionData.target.playAnim(DynamicObj.ANIM_IDLE[actionData.target.direction]);
                actionData.target.stopAnim(DynamicObj.DIRECTION_DELTA[actionData.direction].animKey);
            };
        } else if(actionData.type === ActionData.TYPE_TURN){
            actionData.onStart = () => {
                actionData.target.direction = actionData.from;
                actionData.target.stopAnim(DynamicObj.ANIM_IDLE[actionData.target.direction]);
                actionData.target.playAnim(DynamicObj.TURN_MAPS[actionData.direction][actionData.from].animKey);
            };
     
            actionData.onComplete = () => {
                actionData.target.direction = actionData.to;
                actionData.target.playAnim(DynamicObj.ANIM_IDLE[actionData.target.direction]);
                actionData.target.stopAnim(DynamicObj.TURN_MAPS[actionData.direction][actionData.from].animKey);
            };
        }
    }
    
    /**  
      * 判断是否可以移动到指定位置（需要在子类中实现）。  
      * @param {number} gridX - 目标X坐标。  
      * @param {number} gridY - 目标Y坐标。  
      * @returns {boolean} - 如果可以移动到指定位置，则返回true；否则返回false。  
      */
    canMove(gridX, gridY) {
        return !this.map.overBorder(gridX, gridY);
    }

    /**  
     * 根据当前方向移动到下一个位置。  
     * @returns {DynamicObj} - 返回当前对象实例，便于链式调用。  
     */
    oneStep() {
        this.checkStatus();
        const from = new Phaser.Math.Vector2(this.logicX, this.logicY); // 当前位置  
        const delta = DynamicObj.DIRECTION_DELTA[this.logicDirection]; // 根据方向获取坐标变化  
        const to = new Phaser.Math.Vector2(this.logicX + delta.x, this.logicY + delta.y); // 新位置  

        const canMove = this.canMove(to.x, to.y); // 判断是否可以移动  
        const actionData = new ActionData({
            target: this,
            type: ActionData.TYPE_STEP,
            direction: this.logicDirection,
            from: from,
            to: to,
            canMove: canMove,
        });

        if (canMove) this.updateLogicData(actionData);
        this.saveActionData(actionData); 

        return this;
    }

    /**  
     * 转向指定方向。  
     * @param {string} direction - 方向（"LEFT" 或 "RIGHT"）。默认为"LEFT"。  
     * @returns {DynamicObj} - 返回当前对象实例，便于链式调用。  
     */
    turn(direction = "LEFT") {
        const from = this.logicDirection; // 当前方向  
        const to = DynamicObj.TURN_MAPS[direction][from].direction; // 根据转向获取新方向  

        const actionData = new ActionData({
            target: this,
            type: ActionData.TYPE_TURN,
            direction: direction,
            from: from,
            to: to,
        });

        this.updateLogicData(actionData);
        this.saveActionData(actionData);

        return this;
    }

    /**  
     * 更新逻辑数据。 
     * @param {ActionData} actionData - 动作数据。  
     */
    updateLogicData(actionData) {
        if(actionData.type === ActionData.TYPE_STEP){
            this.logicX = actionData.to.x;
            this.logicY = actionData.to.y;
            this.map.updateLocationData(actionData.from, actionData.to, this);
        } else if(actionData.type === ActionData.TYPE_TURN && actionData.target.name === this.name){
            this.logicDirection = actionData.to;
        }
    }

    /**  
     * 保存动作数据到游戏管理器中。  
     * @param {ActionData} actionData - 包含动作信息的动作数据。  
     */
    saveActionData(actionData) {
        // 获取游戏管理器实例  
        const manager = this.scene.game.manager;

        if (manager) {
            this.addAnims(actionData);
            manager.addActionData(actionData);
        };
    }

    /**  
     * 根据步数移动对象，如果步数为负，则先右转两次（即180度），然后正向移动。  
     * @param {number} stepCount - 移动的步数，可以为负数。  
     * @returns {DynamicObj} - 返回当前对象实例，便于链式调用。  
     */
    step(stepCount) {
        if (stepCount < 0) {
            this.turnRight();
            this.turnRight();
            stepCount = -stepCount;
        }
        for (let i = 0; i < stepCount; i++) {
            this.oneStep();
        }
        return this;
    }

    /**  
     * 左转90度。  
     * @returns {DynamicObj} - 返回当前对象实例，便于链式调用。  
     */
    turnLeft() {
        this.turn("LEFT");
        return this;
    }

    /**  
     * 右转90度。  
     * @returns {DynamicObj} - 返回当前对象实例，便于链式调用。  
     */
    turnRight() {
        this.turn("RIGHT");
        return this;
    }
}