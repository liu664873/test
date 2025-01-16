import { GAME_DATA } from "./configs/Config";
import ActionData from "./objects/datas/ActionData";

export default class GameManager {
    // 静态常量
    static STATUS_PASS = GAME_DATA.LEVEL_STATUS_PASSED;
    static STATUS_FAILED_NOTMOVE = GAME_DATA.LEVEL_STATUS_FAILED_NOTMOVE;
    static STATUS_FAILED_NOTTURN = GAME_DATA.LEVEL_STATUS_FAILED_NOTTURN;
    static STATUS_FAILED_ENERGY_NOTENOUGH = GAME_DATA.LEVEL_STATUS_FAILED_ENERGY_NOTENOUGH;

    //游戏模式
    static MODE_PYTHON = 1;
    static MODE_BLOCKLY = 2;

    constructor(game) {
        this.game = game;
        game.manager = this;
    }

    // 初始化游戏管理器
    init(data) {
        const { mapDataList = [], tilesetMap = {} } = data || {};
        this.mapDataList = mapDataList;
        this.tilesetMap = tilesetMap;
        this.resetGameData();

        this.game.scene.start("loader")
    }

    resetGameData() {
        this.levelCount = this.mapDataList.length;
        this.curLevel = this.levelCount > 0 ? 1 : -1;
        this.inGame = false;
        this.resetData();
    }

    // 初始化当前关卡
    initLevel({ scene, player, ship, energyList , flyerList, flyer}) {
        this.scene = scene;
        this.player = player;
        this.ship = ship;
        this.flyerList = flyerList;
        this.energyList = energyList;
        this.flyer = flyer;
        this.energyCount = this.energyList.length;
        this.inGame = true;
    }

    // 重置游戏数据
    resetData() {
        this.inGame = false;
        this.stepCount = 0;
        this.actionList = [];
        this.actionDataList = [];
        this.actionAnims = null;
        this.inPlayActionAnims = false;
        this.levelStatus = GameManager.STATUS_FAILED_ENERGY_NOTENOUGH;
        this.collectEnergyNum = 0;
        this.energyCount = 0;
        this.isEnd = false;
        this.animSpeed = 1;

        this.scene = null;
        this.player = null;
        this.ship = null;
        this.flyerList = [];
        this.energyList = [];
        
    }

    // 添加动作数据
    addActionData(actionData) {
        if (actionData?.TYPE === ActionData.TYPE_STEP) this.stepCount++;
        this.addActionDataHanle(actionData);
        this.actionDataList.push(actionData);
    }


    // 添加动作数据的处理
    addActionDataHanle(actionData) {
        const isPythonMode = this.mode === GameManager.MODE_PYTHON;
        const { onStart, onComplete } = actionData;
        if(isPythonMode) actionData.runLine = this.editor.runLine;
     
        actionData.onStart = () => {
            if (isPythonMode) {
                this.editor.highlightLine(actionData.runLine);
            }
            onStart?.();
        };
     
        actionData.onComplete = () => {
            if (isPythonMode) {
                this.editor.removeAllHighlight();
                if (this.editor.errorLine !== -1) this.editor.highlightLine(actionData.runLine, true);
            }
            onComplete?.();
        };
    }

    // 生成玩家动画
    generatePlayerAnimations() {
        const playerTween = {
            targets: this.player,
            onComplete: () => {
                this.scene.cameras.main.startFollow(this.player);
                this.inPlayActionAnims = true;
            }
        };

        const actionTweens = [];
        for(const actionData of this.actionDataList){
            if(actionData.type === ActionData.TYPE_STEP && !actionData.canMove){
                this.levelStatus = GameManager.STATUS_FAILED_NOTMOVE;
                break;
            }
            if(actionData.target.tilePro.name === "flyer" && actionData.type === ActionData.TYPE_TURN){
                this.levelStatus = GameManager.STATUS_FAILED_NOTTURN;
                break;
            }
            this.resolveActionTargets(actionData);
            actionTweens.push(actionData);
        }

        const finalPlayerTween = {
            targets: this.player,
            duration: 1000,
            props: {
                z: 1
            },
            onComplete: () => {
                this.scene.cameras.main.stopFollow(this.player);
                this.inPlayActionAnims = false;
                this.scene.isEnd = true;
                this.judge();
            }
        };

        return [playerTween, ...actionTweens, finalPlayerTween];
    }

    // 解析动作目标
    resolveActionTargets(actionData) {
        actionData.target = this[actionData.target?.name];
        actionData.targets = (actionData.targets || []).map(obj => this[obj.name]).filter(Boolean);
    }

    // 生成动画
    generateAnims() {
        this.actionAnims = this.scene.tweens.chain({ tweens: this.generatePlayerAnimations() });
        this.actionAnims.timeScale = this.animSpeed;
    }

    // 获取当前关卡数据，并可能修改 tilesets
    getMapData() {
        const mapData = this.mapDataList[this.curLevel - 1];

        if (mapData) {
            mapData.tilesets = mapData.tilesets.map(tileset => {
                if (tileset && tileset.source) {
                    const key = tileset.source.match(/^([^\.]+)/)?.[0] || '';
                    const tilesetMapData = this.tilesetMap[key] || {};
                    const newTileset = { firstgid: tileset.firstgid, ...tilesetMapData };
                    delete newTileset.source;
                    return newTileset;
                }
                return tileset;
            });
        }

        // 返回修改后的 mapData 对象
        return mapData;
    }

    // 判断关卡状态
    judge() {
        const prompts = {
            [GameManager.STATUS_PASS]: { tip: "通关", info: "是否进入下一关？", actions: this.handlePass() },
            [GameManager.STATUS_FAILED_NOTMOVE]: { tip: "重试", info: "此处不能移动！是否重新开始？", actions: this.handleFailure() },
            [GameManager.STATUS_FAILED_ENERGY_NOTENOUGH]: { tip: "重试", info: "能量未收集完！是否重新开始？", actions: this.handleFailure() },
            [GameManager.STATUS_FAILED_NOTTURN]: { tip: "重试", info: "对象不能转向！是否重新开始？", actions: this.handleFailure() },
            default: { tip: "重试", info: "未知错误！是否重新开始？", actions: this.handleFailure() }
        };

        const { tip, info, actions } = prompts[this.levelStatus] ?? prompts.default;
        this.showPrompt(tip, info, ...actions);
    }

    // 处理通关
    handlePass() {
        return [
            () => this.selectLevel(this.curLevel + 1),
            () => this.selectLevel(this.curLevel)
        ];
    }

    // 处理失败
    handleFailure() {
        return [
            () => this.selectLevel(this.curLevel),
            () => this.selectLevel(1)
        ];
    }

    // 播放动作动画
    playActionAnims() {
        if (!this.inGame || this.inPlayActionAnims || this.actionDataList.length === 0) return;
        this.generateAnims();
    }

    clearAnims(){
        this.actionAnims = null;
        this.actionDataList = [];
        this.actionList = [];
        this.stepCount = 0;
    }

    setAnimSpeed(speed){
        if(this.actionAnims) this.actionAnims.timeScale = speed;
        this.animSpeed = speed;
    }
    pauseActionAnims(){
        this.actionAnims.pause();
        this.inPlayActionAnims = false;
    }
    resumeActionAnims(){
        this.actionAnims.resume();
        this.inPlayActionAnims = true;
    }

    // 选择关卡
    selectLevel(level) {
        if (typeof level !== "number" || level < 1 || level > this.levelCount) {
            this.showInvalidLevelPrompt();
            return;
        }
        this.curLevel = level;
        const mapData = this.getMapData();
        this.resetData();
        if(this.scene) this.scene.scene.start("game", { mapData });
        else this.game.scene.start("game", { mapData });
    }

    // 显示无效关卡提示
    showInvalidLevelPrompt() {
        const tip = "关卡选择";
        const info = this.curLevel === this.levelCount ? "已经到最后一关！是否从第一关开始？" : "无效的关卡选择！";
        const actions = [
            () => this.selectLevel(1),
            () => this.selectLevel(this.curLevel)
        ];

        this.showPrompt(tip, info, ...actions);
    }

    // 设置关卡状态
    setLevelStatus(levelStatus) {
        this.levelStatus = levelStatus;
    }

    setEditor(editor) {
        this.editor = editor;
        this.mode = GameManager.MODE_PYTHON;
    }

    setMode(mode){
        this.mode = mode;
    }

    showPrompt(tip, info, call1, call2) {
        const popup = document.getElementById('popup');
        if (!popup) return; // 确保popup元素存在

        popup.style.display = 'flex';

        const tipElement = document.getElementById('tipText');
        if (typeof tip === 'string') {
            tipElement.textContent = tip;
        } else {
            tipElement.textContent = ''; // 或者设置为默认值
        }

        const popupTextElement = document.getElementById('popupText');
        if (typeof info === 'string') {
            popupTextElement.textContent = info;
        } else {
            popupTextElement.textContent = ''; // 或者设置为默认值
        }

        const confirmBtn = document.getElementById('confirm-button');
        const cancelBtn = document.getElementById('cancel-button');

        const hidePopup = () => popup.style.display = 'none';

        const handleConfirm = () => {
            hidePopup();
            if(this.mode === GameManager.MODE_PYTHON && this.editor) this.editor.removeAllHighlight()
            if (typeof call1 === 'function') {
                call2();
            }
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
        };

        const handleCancel = () => {
            hidePopup();
            if(this.mode === GameManager.MODE_PYTHON && this.editor) this.editor.removeAllHighlight()
            if (typeof call2 === 'function') {
                call1();
            }
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
        };

        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);
    }

    getPlayer(){
        return this.player ? this.player.createProxy() : null;
    }

    getShip(){
        return this.ship ? this.ship.createProxy() : null;
    }

    getEnergyList(){
        return this.energyList.map(energy => energy.createProxy());
    }

    getFlyerList(){
        return this.flyer ? this.flyer.createProxy() : null;
    }

}