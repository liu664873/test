/**
 * 表示一个动作数据的类。
 */
export default class ActionData {
    static TYPE_STEP = "step";
    static TYPE_TURN = "turn";
    
    /**
     * @param {Object} config - 配置对象，包含动作数据的所有参数。
     * @param {DynamicObj} config.target - 动作的目标对象。
     * @param {number|string} config.type - 动作类型（数字常量或字符串，"step" 或 "turn"）。
     * @param {string} config.direction - 动作方向("east...")或转向方向("left,right")。
     * @param {number|Phaser.Math.Vector2} config.from - 起始位置或方向。
     * @param {number|Phaser.Math.Vector2} config.to - 目标位置或方向。
     * @param {boolean} [config.canMove=false] - 是否可以移动。
     * @param {number} [config.duration=1000] - 动作持续时间（毫秒）。
     */
       constructor(config) {
        // 使用解构赋值从配置对象中提取参数
        const { target, type, direction, from, to, canMove = false, duration = 1000 } = config;
 
        this.target = target;
        this.targets = [target]; // 将来可能扩展到多个目标
        this.type = type; 
        this.direction = direction;
        this.from = from;
        this.to = to;
        this.canMove = canMove;
        this.duration = duration;
        this.props = {}; // targets属性的属性变化值
        this.onStart = null; // 动作开始时的回调函数
        this.onComplete = null; // 动作完成时的回调函数
        this.init();
    }

    init() {
        if (this.type === ActionData.TYPE_STEP) {
            this.initStepAction();
        } else if (this.type === ActionData.TYPE_TURN) {
            this.initTurnAction();
        }
    }
 
    initStepAction() {
        const fromPos = this.target.getPosition(this.from.x, this.from.y);
        const toPos = this.target.getPosition(this.to.x, this.to.y);
 
        this.props = {
            x: { value: `+=${toPos.x - fromPos.x}` },
            y: { value: `+=${toPos.y - fromPos.y}` },
            gridX: this.to.x,
            gridY: this.to.y,
        };
    }
 
    initTurnAction() {
        this.props = { z: 1 };
    }
 
    /**
     * 设置targets的最终变化属性值.
     *
     * @param {string} key - 属性名。
     * @param {*} value - 属性值。
     */
    setProp(key, value) {
        this.props[key] = value;
    }

    /**
     * 获取动作属性。
     *
     * @param {string} key - 属性名。
     * @returns {*} - 属性值。
     */
    getProp(key) {
        return this.props[key];
    }

    // ...
}