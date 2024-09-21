import HttpService from '../service/HttpService'; //引入axios配置
import store from '../store';
import Cookies from 'js-cookie';
import crypto from './crypto';
import Logger from "../utils/Logger";
import md5 from "js-md5";
import Qs from 'qs';
import ServiceURL from "../service/ServerURL";

/**
 * 负责和游戏交互的类， 也是主管理类
 */
export default class AdventureManager {
    constructor(x, y, maxLevel, passAll, currentLevelId, blPython, xml_text, timer) {
            this.x = x;
            this.level = y;
            this.maxLevel = maxLevel;
            this.passAll = passAll;
            this.currentLevelId = currentLevelId;
            this.blPython = blPython;
            this.xml_text = xml_text;
            this.gameInitCall = null;
            this.timer = null;
        }
        // 初始化
    static init(_onlineClass) {
        //浏览器类型及版本
        let browser = this.getBrowserAgent();
        let browserVersion = this.getBrowserVersion(browser)
        Logger.log("当前的浏览器版本是=", browserVersion)
        if (browserVersion == 'exitBrowser') {
            store.state.browserVersionShow = true;
            return;
        }
        if (browserVersion[0] == 'chrome' && browserVersion[1] < 65) {
            store.state.browserVersionShow = true;
            return;
        }
        if (browserVersion[0] == 'safari' && browserVersion[1] < 12) {
            store.state.browserVersionShow = true;
            return;
        }
        if (browserVersion[0] == 'firefox' && browserVersion[1] < 65) {
            store.state.browserVersionShow = true;
            return;
        }
        // 设置语言

        store.state.lang = this.getLanguage();

        this.maxLevel = this.getQueryStringLevel("highLevel");
 
        store.state.chooseMode = this.getQueryVariable("mode");
        store.state.gameId = this.getQueryVariable("game");
        store.state.userType = this.getQueryVariable("userType");
        Logger.log("gameId", store.state.gameId)
        if (store.state.lang == 'ar' || store.state.lang == 'he') store.state.dirLang = 'rtl'
        else store.state.dirLang = 'ltr'
            // 初始化ace编辑器
        this.editor = ace.edit("code-area");
        // 设置主题
        this.editor.setTheme("ace/theme/twilight");
        // 设置语言为python
        this.editor.session.setMode("ace/mode/python");
        // 允许自动换行
        this.editor.session.setUseWrapMode(true);

        this.editor.setFontSize('18px');
        // 暴露给window
        window.editor = this.editor;
        // 初始化
        this.boxIde = $('#boxIde');
        this.boxide_lefts = $('#boxide_lefts');
        this.regionCenterUL = $("#regionCenterUL");
        this.itemStepLength = 135;
        this.onlineClass = _onlineClass;
        return this;
    }

    static getOnlineClass() {
            return this.onlineClass;
        }
        //浏览器类型
    static getBrowserAgent() {
            let agent = navigator.userAgent.toLowerCase();
            let regStr_ff = /firefox\/[\d.]+/gi,
                regStr_chrome = /chrome\/[\d.]+/gi,
                regStr_saf = /version\/[\d.]+/gi;
            Logger.log(agent)
            if (agent.indexOf("firefox") > 0) return agent.match(regStr_ff);
            else if (agent.indexOf("chrome") > 0) return agent.match(regStr_chrome);
            else if (agent.indexOf("safari") > 0 && agent.indexOf("chrome") < 0) return agent.match(regStr_saf);
            else return 'exitBrowser'
        }
        // 浏览器版本
    static getBrowserVersion(browser) {
            if (browser == 'exitBrowser') return 'exitBrowser'
            return [(browser + "").replace(/[0-9./]/ig, ""), parseInt((browser + "").replace(/[^0-9.]/ig, ""))]; //根据正则将所有非数字全部去掉，剩下版本 
        }
        // 获得地址栏字段值
    static getQueryString(name) {
        if (window.location.search.indexOf("ISRHome") >= 0) {
            return "en";
        }
        if (Cookies.get("language") == null || Cookies.get("language") == "") {
            return "en";
        }
        return Cookies.get("language") || "en";
    }

    // 获得语言
    static getLanguage() {
        let language = this.getQueryVariable("language");
        return language ||
            Cookies.get("language") ||
            sessionStorage.getItem("language") ||
            localStorage.getItem("language") ||
            (navigator.language == 'zh-CN' ? 'zh' : "") ||
            "en";
    }

    // 设置语言
    static setLanguage(lang) {
            let domain = window.location.hostname;
            domain = domain.substring(domain.indexOf('.'));

            Cookies.set("language", lang, {
                domain: domain,
                path: "/",
                expires: 7,
            });

            sessionStorage.setItem("language", lang);
            localStorage.setItem("language", lang);
        }
        // 获得地址栏字段值
    static getQueryStringLevel(name) {
            let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            let r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]);
            return null;
        }
        // 获得地址栏字段值
    static getQueryVariable(variable) {
            var query = window.location.href.substring(1);
            if (!query.split("?")[1]) return '';
            var vars = query.split("?")[1].split('&');
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                if (pair[0] == variable) {
                    return pair[1];
                }
            }
            return ''
        }
        // 高阶还是低阶
    static getLevel() {
            return this.level
        }
        // 游戏模式 code 或 blockly
    static getChooseMode() {
            if (store.state.chooseMode == '0') {
                return 'blockly'
            }
            return 'code'
        }
        // 设置初始化语言
    static setLang(callback) {
            // store.state.checkLangShow = true;
            // this.gameInitCall = callback;
        }
        // 语言回调给游戏
    static tellGameInit(value) {
            // this.gameInitCall(value)
            // window.location.reload();
        }
        // 发送给游戏消息
    static sendToGame(method, params) {
        if (window.bridge && window.bridge.sendToGame) {
            window.bridge.sendToGame({ method: method, params: params });
        }
    }

    static refreshActionList() {
        this.regionCenterUL.css('left', '10px');
        store.state.funArr = store.state.allArr.filter(this.filterArr.bind(this));
        if (store.state.funArr.length <= 0) {
            return;
        }
        let regionCenterULWidth = this.regionCenterUL.width();
        store.state.funShowCount = Math.min(store.state.funArr.length, Math.floor(regionCenterULWidth / this.itemStepLength));

        if (store.state.funIndex + store.state.funShowCount > store.state.funArr.length) {
            store.state.funIndex = Math.max(0, store.state.funArr.length - store.state.funShowCount);
        }
        store.state.funVisibleArr = store.state.funArr.slice(store.state.funIndex, store.state.funIndex + store.state.funShowCount);

        // 如果列表未显示满，则纠正列表的位置，使其居中
        if (store.state.funShowCount < store.state.funArr.length) {
            let left = parseInt(this.regionCenterUL.css('left'));
            let offset = (regionCenterULWidth - store.state.funShowCount * this.itemStepLength) / 2;
            this.regionCenterUL.css('left', (left + offset) + 'px');
        }
    }

    static filterArr(data) {
        if (this.annieList == null) {
            return;
        }
        for (const value of this.annieList) {
            if (data.id == value) {
                return data;
            }
        }
    }

    // 游戏画布获得焦点
    static toFront_focusOnCanvas() {
        $('#GameCanvas').focus();
    }

    static toFront_onGameLoadSuccess(res) {
        store.state.maskBox = false;
        store.state.isLoading = false;
    }

    static toFront_refreshFrontEnd(res) {
            // 重置数据
            store.state.funShowCount = 0;
            store.state.funIndex = 0;
            store.state.funArr = [];
            store.state.funVisibleArr = [];
            // elementName更新
            this.annieList = res.elementName;
            // 刷新动作列表
            this.refreshActionList();
            //title更新

            let curLevel = window.bridge.getCurrentLevelData().levelid;
            let totalLevel = window.bridge.getTotalLevel();
            store.state.curLevelText = `${curLevel} / ${totalLevel}`;

            let stageInfo = window.bridge.getStageDataByID(store.state.stageId);

            store.state.minLine = stageInfo.MinLine;
            store.state.minStep = stageInfo.MinStep;
            store.state.mapId = stageInfo.rawLevel; 

            //code更新
            if (!res.keepCode) {
                this.toFront_importCode(res.writableCodeTxt);
            }
            if (store.state.chooseMode == '1') {
                this.editor.resize(true);
            }
            // 光标移到代码最后
            window.editor.focus();
            let session = editor.getSession();
            let sessionLentgh = session.getLine(count).length;
            let count = session.getLength();
            editor.selection.setRange({
                start: { row: count, column: sessionLentgh },
                end: { row: count, column: sessionLentgh }
            });
        }

    static setWorkspaceDeletable(trueOrfalse) {
        if(store.state.Workspace && store.state.Workspace.getAllBlocks) {
            store.state.Workspace.getAllBlocks().forEach(b => b.setDeletable(trueOrfalse));
        }
    }

        // 获取blockly代码
    static getWorkspaceCode() {
        // Python
        if (store.state.chooseMode == '1') {
            return this.editor.getSession().getValue();
        }

        // Blockly
        const reg = new RegExp("( id=\")(.*?)\"", "gi");
        
        let xml = Blockly.Xml.workspaceToDom(store.state.Workspace);
        store.state.xml_text = Blockly.Xml.domToText(xml).replace(reg, "");

        let blocklyJson = Blockly.serialization.workspaces.save(store.state.Workspace);

        store.state.blockly_json = JSON.stringify(blocklyJson);
        store.state.blPython = Blockly.Python.workspaceToCode(store.state.Workspace)

        // return store.state.xml_text;
        return store.state.blockly_json;
    }


    // 获取blockly中JavaScript代码 或 python代码
    static toFront_getCode() {
        if (store.state.blPython != null && store.state.blPython != "") {
            return store.state.blPython
        }
        if (store.state.chooseMode == '1') {
            Logger.log("获取的是python代码", this.editor.getSession().getValue())
            return this.editor.getSession().getValue();
        }
        Logger.log("获取blockly中Python代码", store.state.blPython)

        return Blockly.Python.workspaceToCode(store.state.Workspace);
    }
    static getCodeData(value) {
            store.state.blPython = value;
        }
    
    // 2023-06-20 Vic
    // 检查代码是否合法
    static analysisPythonCode(code) {
        // 清除注释部分
        code = code.replace(/#.*/g, "");

        if(code.match("'") || code.match('"')){
            return "：ICode关卡无需使用字符串，请尝试其他解答方式吧。"
        }

        let lines = code.split('\n');

        for (let i=0; i<lines.length; i++){
            let line = lines[i];
            if(line.match(/ or /g) && line.match(/ or /g).length > 4){
                return ": 为了提高代码可读性，在ICode编辑器中，同一行最多使用4个条件判断语句。";
            }

            if(line.match(/\(/g) && line.match(/\(/g).length > 4){
                return ": 为了提高代码可读性，在ICode编辑器中，在同一行最多使用4个括号（）。";
            }

            if(line.match(/,/g) && line.match(/,/g).length > 4){
                return ": 为了提高代码可读性，在ICode编辑器中，同一行最多使用4个逗号（,）。";
            }

            if(line.match(/\[/g) && line.match(/\[/g).length > 4){
                return ": 为了提高代码可读性，在ICode编辑器中，在同一行使用最多使用4个方括号[]。";
            }


            // 检测冒号部分
            line = line .replace(/ /g, "")      // 干掉空格后再处理
                        .replace(/\t/g, "")      // 干掉空格后再处理
                        .replace(/:,/g, "")     // 允许 :,
                        .replace(/:\],/g, "")   // 允许 :]
                        .replace(/:\d/g, "");   // 允许 :数字
            if(line.match(/def.*:\S/)){
                return ": 为了提高代码可读性，在ICode编辑器中，定义函数时，后续的语句需要从新的一行开始。";
            }

            if(line.match(/for.*:\S/) || line.match(/while.*:\S/)){
                return ": 为了提高代码可读性，在ICode编辑器中，定义循环时，建议后续的语句需要从新的一行开始。";
            }

            if(line.match(/if.*:\S/)){
                return ": 为了提高代码可读性，在ICode编辑器中，使用条件判断时，后续的语句需要从新的一行开始。";
            }
        }

        return ""; // 无错误返回正常
        // return "Error Message";
    }

    // 导入代码
    static toFront_importCode(codeTxt) {
        Logger.log("toFront_importCode", codeTxt);

        if (store.state.chooseMode == '1') {
            window.editor.setValue(codeTxt);
            window.editor.clearSelection();
            return;
        }

        if (codeTxt == "") {
            store.state.Workspace.clear();
            return;
        }

        // 如果是JSON格式
        try {
            let state = JSON.parse(codeTxt);
            Blockly.serialization.workspaces.load(state, store.state.Workspace);
            return;
        } catch (error) {
            store.state.Workspace.clear();
        }
        // const codeTxt = Blockly.serialization.workspaces.save(store.state.Workspace);
        // Blockly.serialization.workspaces.load(codeTxt, store.state.Workspace);
        
        try {
            const parser = new DOMParser();
            const xml = parser.parseFromString(codeTxt, "application/xml").firstChild;

            Blockly.Xml.domToWorkspace(xml, store.state.Workspace);
        } catch (error) {
            store.state.Workspace.clear();
        }

    }
        // 更新标题
    static toFront_refreshTitle(res) {
        let curLevel = window.bridge.getCurrentLevelData().levelid;
        let totalLevel = window.bridge.getTotalLevel();
        let maxHighlevel = store.state.maxHighlevel;
        store.state.curLevelText = `${curLevel} / ${maxHighlevel}`;
    }

    // 屏幕的缩放比例
    static changeRatio() {
        var ratio = 0;
        var screen = window.screen;
        var ua = navigator.userAgent.toLowerCase();
        if (window.devicePixelRatio !== undefined) ratio = window.devicePixelRatio;
        else if (~ua.indexOf('msie')) {
            if (screen.deviceXDPI && screen.logicalXDPI) ratio = screen.deviceXDPI / screen.logicalXDPI;
        } else if (window.outerWidth !== undefined && window.innerWidth !== undefined) {
            ratio = window.outerWidth / window.innerWidth;
        }
        if (ratio) ratio = Math.round(ratio * 100);
        return ratio;
    }
    static toFront_showPopboardWin(res) {
        store.state.qrCodeUrl = process.env.IX_IURL + "?" + ("a=" + store.state.selectedPoint + "&b=" + res.curSteps + "&c=" + res.curLine + "&d=" + res.star + "&e=" + res.configLine + "&f=" + res.configSteps + "&h=" + store.state.chooseMode + "&userId=" + Cookies.get("USERID"))
        if (store.state.lang == 'zh') store.state.qrCodeShow = true
        else store.state.qrCodeShow = false;
        Logger.log("我过关啦！！！！！！", store.state.qrCodeUrl)

        store.state.maskBox = true;
        store.state.adoptDialog = true;
        store.state.adoptTitle = res.title;
        store.state.adoptText = res.txt;
        store.state.customeType = null;

        let screenHeight = document.body.clientHeight;
        let zoomRatio = this.changeRatio();
        Logger.log("clientHeight高度为：：：：：：：：：：：：", screenHeight)
        setTimeout(() => {
                if ((zoomRatio == '150' && screenHeight < 800) || (zoomRatio == '125' && screenHeight < 800) || screenHeight < 800) {
                    $('.newPass').css({ 'transform': 'scale(.7)' })
                }
            }, 0)
            // 新弹窗内容
        store.state.configLine = res.configLine;
        store.state.configSteps = res.configSteps;
        store.state.curLine = res.curLine;
        store.state.curSteps = res.curSteps;
        store.state.star = res.star;
        if (res.star === 3) {
            this.getOnlineClass().setConfigImg();
        }
        // 赢了就要关闭重置弹窗
        if (store.state.failDialog && store.state._resetCodeOpened) {
            store.state.failDialog = false;
            store.state._resetCodeOpened = false;
        }
    }

    static toFront_showPopboardFail(res) {
        store.state.skipShow = true;
        store.state.maskBox = true;
        AdventureManager.isCN() ? store.state.failDialogChina = true : store.state.failDialog = true;
        // store.state.failDialog = true;
        store.state.failTitle = res.title;
        store.state.failText = res.txt;
        store.state.customeType = null;
        store.state.codeShow = false;
        // 失败过多的话, 就要弹出求助框了
        let failTimesCurrentLevel = localStorage.getItem('failTimesCurrentLevel');
        if (typeof failTimesCurrentLevel !== 'number' && typeof failTimesCurrentLevel !== 'string') {
            failTimesCurrentLevel = 0;
            // Logger.log('failTimesCurrentLevel = 0');
        }
        failTimesCurrentLevel = Math.floor(failTimesCurrentLevel);
        failTimesCurrentLevel++;
        // Logger.log(this._lastLevelId, failTimesCurrentLevel);
        if (failTimesCurrentLevel >= 3) {
            failTimesCurrentLevel = 0;
            store.state.codeIndexDialog = AdventureManager.isCN(); // 出现提示框(目前只有中文才有求助)
        }
        localStorage.setItem('failTimesCurrentLevel', failTimesCurrentLevel);
    }
    static isCN() {
        return AdventureManager.getLanguage() == 'zh';
    }
    static toFront_showResetCodeDialog(res) {
        Logger.log(res)
        store.state.maskBox = true;
        AdventureManager.isCN() ? store.state.failDialogChina = true : store.state.failDialog = true;
        store.state.failTitle = res.title;
        store.state.failText = res.txt;
        store.state.customeType = 'ResetCode';
        store.state._resetCodeOpened = true;
    }

    static toFront_showExitGameDialog(res) {
        store.state.maskBox = true;
        AdventureManager.isCN() ? store.state.exitGameMode = true : store.state.failDialog = true
        store.state.failTitle = res.title;
        store.state.failText = res.txt;
        store.state.customeType = 'ExitGame';
    }

    static toFront_adaptGameFrameSize(res) {
        this.sendToGame('adaptGameFrameSize', {
            width: this.boxide_lefts.width(),
            height: this.boxide_lefts.height(),
        });
        this.refreshActionList();
    }

    static toFront_showWelcomeDialog(res) {
        // store.state.maskBox = true;
        // store.state.welcomeDialog = true;
    }

    // 完美通关 res
    static toFront_showPassAllDialog() {
        let alllevels = window.bridge.getTotalLevel(1);
        if ((store.state.chooseMode == '0' && this.passAll != alllevels) || (store.state.chooseMode == '1' && this.passAll != alllevels)) {
            if (store.state.lang == 'zh') store.state.qrCodeShow2 = true
            else store.state.qrCodeShow2 = false;
            store.state.getQRcode = process.env.IX_IURL + "/clearance?all=1&userId=" + Cookies.get("USERID") + "&h=" + store.state.chooseMode
            Logger.log(store.state.getQRcode)
            store.state.passAllLevelShow = true;
            let zoomRatio = this.changeRatio();
            let screenHeight = document.body.clientHeight;
            if ((zoomRatio == '150' && screenHeight < 800) || (zoomRatio == '125' && screenHeight < 800)) {
                $('.passAll').css({ 'transform': 'translate(-50%,-50%) scale(.7)' })
            }
            this.checkPonit(store.state.selectedPoint);
            let gameId = window.bridge.getCurrentGameId();
            if (gameId == "202101" || gameId == "202102" || gameId == "202103" || gameId == "202104") {
                store.state.pathAllImage = "3";
            } else {
                store.state.pathAllImage = store.state.chooseMode;
            }
            Logger.log("所有关卡都通过了？", store.state.passAllLevelShow)
            return;
        }
        HttpService(ServiceURL.GET_ALL_STARS, {
            method: 'post',
            data: Qs.stringify({ mode: store.state.chooseMode })
        }).then(response => {
            const data = response.data;
            if (data.code == '0') {
                store.state.allStar = data.data
            }
        });

        store.state.adoptChinaDialog = true;
        store.state.maskBox = true;
        store.state.customeType = 'PassAllLevel';
    }

    static toFront_showCodeIndexDialog(res) {
        store.state.maskBox = true;
        store.state.codeIndexDialog = true;
    }

    // 进入关卡时
    static toFront_onEnterStage(levelId) {
            // 谷歌统计
            if (typeof gtag === 'function') {
                gtag('config', 'GA_TRACKING_ID', { 'page_path': `/${levelId}` });
            }

            // 如果时新的关卡，清空本关卡失败次数
            if (this._lastLevelId !== levelId) {
                localStorage.removeItem('failTimesCurrentLevel');
            }

            this._lastLevelId = levelId;
        }
        // 
    static showLevelbg(data, arr, index) {
            data.forEach((e, i) => {
                let index = e.level.split(',')[0];
                arr.push(index)
            })
            Logger.log("python知识点的关卡详情", arr)
            if (store.state.checkpointData.currentCheckPointer) this.x = store.state.checkpointData.currentCheckPointer
            for (var i in arr) {
                if ((store.state.selectedPoint + 1) == arr[i] && (store.state.selectedPoint + 1) >= this.x) {
                    this.showExplainDialog(arr[i], index)
                }
            }
        }
        // 选关关卡
    static checkPonit(n, x = '1') {
            let ids = this.getStageIds(n);
            store.state.blPython = ''
            store.state.xml_text = ''
            store.state.blockly_json = '';

            HttpService(ServiceURL.GET_CHECK_POINTER, {
                method: 'post',
                data: Qs.stringify({ currentPointer: n, mode: store.state.chooseMode, stageIds: ids, gameId: store.state.gameId })
            }).then(response => {
                const res = response.data;
                if (x == '1') {
                    this.showDIalogMsg();
                }
                if (res.code == '83' || res.code == '87') {
                    store.state.selectedPoint = n;
                    store.state.stageId = parseInt(res.data.stageId);
                    store.state.levelId = parseInt(res.data.levelId);

                    if (store.state.chooseMode == '0') {
                        store.state.blocklyText = window.bridge.getLevelTipsInfo(res.data.stageId)
                    }
                    Logger.log("获取blockly注释说明：：：：：：", store.state.blocklyText)
                    this.currentLevelId = res.data.levelId;
                    Logger.log(">>>>>>>>>>>>>>>>>>>>>>LLLLLLLLLLLLL::::", parseInt(res.data.stageId), res.data)
                    window.bridge.go(n, parseInt(res.data.stageId), res.data);
                    this.getImg();
                    // store.state.highCheckShow = currentStageIsMax()
                    if (this.passAll == this.currentLevelId) store.state.highCheckShow = true
                    store.state.checkpointShow = false;
                    if (store.state.chooseMode == '0') store.state.Workspace.scrollCenter()
                } else if (res.code == '49') {
                    this.monthlyLogOut()
                } else if (res.code != 0) {
                    window.alert("Data Error:" + res.code);
                    window.history.back();
                }
            }).catch({})
        }
        // 登出 跳转到登录界面
    static logOut() {
            store.state.sessionShow = true;
        }
        // 登出 月赛过期了
    static monthlyLogOut() {
            store.state.monthlyGameShow = true;
            store.state.sessionShow = true;
        }
        // 弹窗自动提示
    static showDIalogMsg() {
            let levelArr = [],
                levelArr1 = [],
                dataList1 = window.bridge.getStoryIntroList(0),
                dataList = window.bridge.getCourseList(0);
            this.showLevelbg(dataList, levelArr, '1')
            this.showLevelbg(dataList1, levelArr1, '2')
        }
        // 获取GAME_CREATE_URL
    static getGameCreateUrl() {
            return process.env.GAME_CREATE_URL
        }
        // 获取CDNURL
    static getCDNURL() {
            return process.env.CDN_STATIC_URL
        }
        // 获取菜单信息
    static getMenuInfo() {
        HttpService(ServiceURL.GET_PLAYER_CHECK_POINTER, {
            method: 'post',
            data: Qs.stringify({ mode: store.state.chooseMode, gameId: store.state.gameId })
        }).then(response => {
            const res = response.data;
            if (res.code == '0') {
                store.state.checkpointData = res.data;
                store.state.checkpointShow = true;
                store.state.menuFlag = false
            } else if (res.code == '5') {
                this.logOut();
                store.state.menuFlag = false
            } else if (res.code == '49') {
                this.monthlyLogOut()
            } else if (res.code == '98') {
                this.logOut(); // 登出
            } else {
                store.state.menuFlag = false
            }
        }).catch(err => {
            Logger.error(err);
        });
    }
    static getStageIds(n) {
            let stageids = window.bridge.getStageData(n);
            if (stageids == null) {
                Logger.log("stageids is null", n);
            }
            let ids = stageids.levelIds.split(",");
            return ids;
        }
        // 获取用户信息
    static getGameInfo(type, callback) {
            let n = null;
            if (store.state.currentIndex && type != 1001) return;
            if (type == 1001 || store.state.isLastLevel) {
                if (store.state.isLastLevel) n = store.state.selectedPoint
                else n = store.state.selectedPoint + 1;
                let ids = this.getStageIds(n);
                HttpService(ServiceURL.GET_CHECK_POINTER, {
                    method: 'post',
                    data: Qs.stringify({
                        currentPointer: n,
                        mode: store.state.chooseMode,
                        stageIds: ids,
                        gameId: store.state.gameId
                    })
                }).then(res => {
                    const data = res.data;
                    this.showDIalogMsg()
                    if (data.code == '83' || data.code == '87') {
                        this.currentLevelId = res.data.data.levelId;
                        let levelId = res.data.data.levelId;
                        let stageId = parseInt(res.data.data.stageId);

                        store.state.stageId = parseInt(res.data.stageId);
                        store.state.levelId = parseInt(res.data.levelId);

                        window.bridge.go(levelId, stageId, data.data);
                        store.state.selectedPoint = data.data.levelId;
                        if (store.state.chooseMode == '0') store.state.Workspace.scrollCenter()
                        if (store.state.chooseMode == '0') {
                            store.state.blocklyText = window.bridge.getLevelTipsInfo(data.data.stageId)
                        }
                        if (this.passAll == this.currentLevelId) store.state.highCheckShow = true;
                        store.state.codeShow = false;
                        // store.state.highCheckShow = currentStageIsMax()
                        this.getImg();
                    } else if (res.code == '49') {
                        this.monthlyLogOut()
                    } else if (res.code != 0) {
                        window.alert("Data Error:" + res.code);
                        window.history.back();
                    }
                })
                return;
            }
            if (store.state.isLastLevel) return;

            HttpService(ServiceURL.QUERY_USER_INFO, {
                method: 'post',
                data: Qs.stringify({
                    highLevel: this.maxLevel || "1",
                    mode: store.state.chooseMode,
                    gameId: store.state.gameId
                })
            }).then(res => {
                // 向外围发送游戏载入成功的事件(为了关闭游戏外围的蒙版)
                this.toFront_onGameLoadSuccess();
                var res = res.data;
                if (res == null || res.code == 1) {
                    if (callback) {
                        callback(null, 1, 'queryUserGameInfo[1]: Fail!');
                    }
                    return;
                }
                if (res.code == 5) {
                    if (callback) {
                        callback(null, res.code, 'queryUserGameInfo[5]: Login Timeout!');
                        this.logOut(); // 登出
                    }
                    return;
                }
                if (res.code == 95) {
                    let url = process.env.GAME_INDEX_URL
                    window.location.href = url;
                }
                if (res.code == 110) {
                    store.state.sessionShow = true
                    store.state.ipShow = true
                    return;
                }
                if (res.code == 49) {
                    this.monthlyLogOut()
                    return;
                }
                if (res.code == 17) {
                    if (callback) {
                        callback(null, res.code, 'queryUserGameInfo[17]: Parameters not complete!');
                    }
                    return;
                }
                if (res.code == 40002) {
                    if (callback) {
                        callback(null, res.code, 'queryUserGameInfo[40002]: Game not started!');
                    }
                    return;
                }
                if (res.code == 40003) {
                    if (callback) {
                        callback(null, res.code, 'queryUserGameInfo[40003]: Game over!');
                    }
                    return;
                }
                if (res.code == 40004) {
                    if (callback) {
                        callback(null, res.code, 'queryUserGameInfo[40004]: Game not exist!');
                    }
                    return;
                }
                if (res.data == null) {
                    if (callback) {
                        callback(null, 1, 'queryUserGameInfo[1]: Data is empty!');
                    }
                    return;
                }
                if (callback) {
                    // 如果是第一关，显示video
                    // if (res.data.levelId == '1') {
                    //     store.state.videoShow = true;
                    // }
                    store.state.level = res.data.levelProgress; //等级
                    this.passAll = res.data.maxLevel; //当前一共多少关
                    store.state.maxHighlevel = res.data.maxLevel;
                    store.state.isVip = res.data.isVip;
                    // store.state.currentLevel = res.data.currentLevel; //当前关卡
                    store.state.competeType = res.data.competeType;
                    /**
                     * *  0  姓名，组别，比赛名
                     * 1  姓名，组别，倒计时
                     * 2  倒计时
                     * 3  姓名，比赛名
                     * 4  姓名，比赛名，倒计时
                     * 5  比赛名  （编程一小时）
                     */
                    AdventureManager.getCountDown()
                    store.state.userLastName = res.data.userLastName;
                    store.state.edition = res.data.edition; // 0 入门组 1 初级组 3 中级组 2 高级组
                    store.state.userFirstName = res.data.userFirstName;
                    store.state.selectedPoint = store.state.selectedPoint == '' ? res.data.levelId : store.state.selectedPoint;
                    this.getImg();
                    if (!store.state.currentIndex) {
                        this.x = res.data.levelId;
                        let ids = this.getStageIds(store.state.selectedPoint);
                        HttpService(ServiceURL.GET_CHECK_POINTER, {
                            method: 'post',
                            data: Qs.stringify({
                                currentPointer: store.state.selectedPoint,
                                mode: store.state.chooseMode,
                                stageIds: ids,
                                gameId: store.state.gameId
                            })
                        }).then(res => {
                            const data = res.data;
                            store.state.currentIndex = false;
                            if (data.code == '83' || data.code == '87') {
                                this.currentLevelId = res.data.data.levelId;

                                store.state.stageId = parseInt(res.data.stageId);
                                store.state.levelId = parseInt(res.data.levelId);

                                callback(data.data, 0, null);
                                if (store.state.chooseMode == '0') {
                                    store.state.blocklyText = window.bridge.getLevelTipsInfo(data.data.stageId)
                                }
                                if (store.state.chooseMode == '0') {
                                    store.state.Workspace.scrollCenter()
                                }
                                // store.state.highCheckShow = currentStageIsMax()
                                if (this.passAll == this.currentLevelId) {
                                    store.state.highCheckShow = true
                                }
                            } else if (data.code == '83') {
                                store.state.selectedPoint = data.data.levelId;
                            } else if (res.code == '49') {
                                this.monthlyLogOut()
                            } else if (res.code != 0) {
                                window.alert("Data Error:" + res.code);
                                window.history.back();
                            }
                        }).catch(err => {
                            // 向外围发送游戏载入成功的事件(为了关闭游戏外围的蒙版)
                            this.toFront_onGameLoadSuccess();
                        });

                    }
                }
            }).catch(err => {
                // 向外围发送游戏载入成功的事件(为了关闭游戏外围的蒙版)
                this.toFront_onGameLoadSuccess();
            });
        }
    
    // get the game aes key and callback(key)
    static resolveWithAesKey(cryptoStr, callback) {
        HttpService("game/queryGameAesKey", {
            method: 'get',
            params: { gameId: store.state.gameId },
        }).then(res => {
            res = res.data;
            if(res == null || res.code == 1) {
                alert("Can not get the game aes key");
                return;
            }
            let key = res.data;
            if(key && key.length == 16) {
                let decryptString = crypto.decryptWithKey(cryptoStr, key);
                callback(JSON.parse(decryptString));
            }
        })
    }
    
    static queryGameInfo(callback) {
        HttpService("game/queryGameInfo", {
            method: 'get',
            params: {
                gameId: store.state.gameId,
            },
        }).then(res => {
            var res = res.data;
            if (res == null || res.code == 1) {
                return;
            }
            
            if(res.data) {
                let data = res.data;
                store.state.camera = data.camera; // 是否开启摄像头
                // 比赛专用
                if(store.state.gameId > 20000000){
                    store.state.courseTitleTxt = data.gameName;
                }

                if(callback) callback();
            }

        })
    }
        // 获取倒计时
    static getCountDown() {
            if (store.state.competeType == 1 || store.state.competeType == 2 || store.state.competeType == 4) {
                HttpService(ServiceURL.GET_FINAL_COUNT_DOWN, { method: "post", }).then((res) => {
                        const data = res.data;
                        if (data.code == "0") {
                            this.countDown(data.data);

                        }
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        }
        // 决赛倒计时功能
    static countDown(seconds) {
            let startTime = Math.floor(new Date().getTime() / 1000) + seconds;
            this.timer = window.setInterval(() => {
                let secondsLeft = startTime - Math.floor(new Date().getTime() / 1000);
                if (secondsLeft >= 0) {
                    let days = Math.floor(secondsLeft / (3600 * 24));
                    let hours = Math.floor(secondsLeft / 3600 % 24);
                    let minutes = Math.floor(secondsLeft / 60 % 60);
                    let seconds = Math.floor(secondsLeft % 60);

                    let timeText;

                    if (days > 10) {
                        timeText = `${days}d`
                    } else if (days > 0) {
                        timeText = `${days}d ${hours}h`
                    } else if (hours > 0) {
                        timeText = `${hours}h ${minutes}m`
                    } else {
                        if (minutes < 10) minutes = "0" + minutes;
                        if (seconds < 10) seconds = "0" + seconds;
                        timeText = minutes + ":" + seconds;
                    }
                    store.state.timeText = timeText;
                    // if (seconds == 5 * 60) alert("还剩5分钟");
                } else {
                    clearInterval(this.timer);
                    if (store.state.competeType == "0") return;
                    store.state.sessionShow = true;
                    store.state.timeoverShow = true;
                }
            }, 1000);
        }
        // 获取注释图片
    static getImg() {
            if (!window.bridge.getLevelCommentImg(store.state.selectedPoint)) {
                store.state.CommentImgList = false;
                return;
            }
            if (window.bridge.getLevelCommentImg(store.state.selectedPoint)[store.state.lang] == '') {
                store.state.CommentImgList = false;
            } else {
                store.state.CommentImgList = true;
                store.state.imagePath = process.env.GAME_CREATE_URL + "/static/images/comment/" + store.state.lang + "/" + window.bridge.getLevelCommentImg(store.state.selectedPoint)[store.state.lang];
                Logger.log("注释图片", store.state.imagePath)
            }
        }
        // 更新用户信息
    static updateGameInfo(data, callback) {
        data.mode = store.state.chooseMode;
        data.levelId = store.state.selectedPoint;
        data.gameId = store.state.gameId;
        let cryptoData = crypto.encrypt(data)

        if (this.passAll == this.currentLevelId) {
            store.state.isLastLevel = true
        } else {
            store.state.isLastLevel = false;
        }

        if (store.state.isLastLevel) {
            store.state.highCheckShow = true;
        }
        HttpService(ServiceURL.UPDATE_GAME_INFO, {
            method: 'post',
            data: cryptoData,
            headers: { 'Content-Type': 'application/json;charset=UTF-8' }
        }).then(res => {
            var res = res.data;
            clearInterval(this.timer);
            AdventureManager.getCountDown()
            if (res.data) {
                store.state.codeShow = window._code_is_running;
            }
            if (res == null || res.code == 1) {
                if (callback) {
                    callback(null, 1, 'updateGameInfo[1]: Fail!');
                }
                return;
            }
            if (res.code == 5) {
                if (callback) {
                    callback(null, res.code, 'updateGameInfo[5]: Login Timeout!');
                    this.logOut(); // 登出
                }
                return;
            }
            if (res.code == 17) {
                if (callback) {
                    callback(null, res.code, 'updateGameInfo[17]: Parameters not complete!');
                }
                return;
            }
            if (res.code == 51) {
                if (callback) {
                    callback(null, res.code, 'updateGameInfo[51]: User data error!');
                }
                return;
            }
            if (res.code == 20) {
                if (callback) {
                    callback(null, res.code, 'updateGameInfo[20]: User data error!');
                }
                return;
            }
            if (res.code == 49) {
                this.monthlyLogOut()
                return;
            }
            if (res.code == 98) {
                if (callback) {
                    this.logOut(); // 登出
                    // callback(null, res.code, 'updateGameInfo[98]: User data error!');
                }
                return;
            }
            if (res.code == 0 && res.data && res.data.currentLevel != -1) {
                // this.gotoNextLevel(res.data.currentLevel, callback);
                // return;
            }
            if (res.code == 113) {
                callback(null, res.code, null);
                return;
            }
            if (res.code == 133) {
                callback(null, res.code, null);
                return;
            }
            store.state.totalScore = res.data.totalScore; // 当前的总分数
            store.state.isPassAllLevel = res.data.isPassAllLevel;
            if (callback) {
                if (res.data != null) {
                    res.data.isLastLevel = store.state.isLastLevel;
                }
                callback(res.data, res.code, null);
            }
        }).catch(err => {
            Logger.error(err);
        });
    }

    static gotoNextLevel(levelId, callback) {
        let ids = this.getStageIds(levelId);
        HttpService(ServiceURL.GET_CHECK_POINTER, {
            method: 'post',
            data: Qs.stringify({ currentPointer: levelId, mode: store.state.chooseMode, stageIds: ids, gameId: store.state.gameId })
        }).then(response => {
            const res = response.data;
            AdventureManager.showDIalogMsg()
            if (res.code == '83' || res.code == '87') {
                window.bridge.go(levelId, parseInt(res.data.stageId), res.data);
                this.currentLevelId = res.data.levelId;

                store.state.stageId = parseInt(res.data.stageId);
                store.state.levelId = parseInt(res.data.levelId);

                store.state.selectedPoint = store.state.selectedPoint + 1;
                store.state.skipShow = false;
                store.state.ideMask = false;
                store.state.maskBox = false;
                store.state.failDialog = false;
                store.state.failDialogChina = false;
                store.state._resetCodeOpened = false;
                store.state.toBack = false;
                store.state.customeType == null;
                if (store.state.chooseMode == '0') store.state.Workspace.scrollCenter()
                if (this.passAll == this.currentLevelId) store.state.highCheckShow = true;
                store.state.codeShow = false;
                // store.state.highCheckShow = currentStageIsMax();
                if (store.state.highCheckShow) store.state.selectedPoint = res.data.levelId;
                if (store.state.chooseMode == '0') {
                    store.state.blocklyText = window.bridge.getLevelTipsInfo(res.data.stageId)
                }
                AdventureManager.getImg()
                Logger.log('当前是最高关吗', this.passAll, this.currentLevelId, store.state.highCheckShow)
                $("#CanvasFrame").focus();
            } else if (res.code == '49') {
                this.monthlyLogOut()
            } else if (res.code != 0) {
                window.alert("Data Error:" + res.code);
                window.history.back();
            }
        }).catch({})
    }

    // 弹出功能说明弹窗
    static showExplainDialog(levelId, flag = '1') {
            let zoomRatio = this.changeRatio();
            let screenHeight = document.body.clientHeight;
            if ((zoomRatio == '150' && screenHeight < 800) || (zoomRatio == '125' && screenHeight < 800)) {
                $(".explainDialog").css('transform', 'translate(-50%,-50%) scale(.7)')
            }
            // Logger.log("levelId", levelId)
            if (flag == '1') {
                if (!window.bridge.getCourseList(levelId)) return;
                window.bridge.playEffectPy()
                store.state.knowledgeArr = window.bridge.getCourseList(levelId)
                store.state.explainDialog = true;
                store.state.explainDialog1 = true;
                store.state.explainDialog2 = false;
            }
            if (flag == '2') {
                if (!window.bridge.getStoryIntroList(levelId)) return;
                window.bridge.playEffectPy()
                store.state.knowledgeArr = window.bridge.getStoryIntroList(levelId);
                store.state.explainDialog = true;
                store.state.explainDialog1 = false;
                store.state.explainDialog2 = true;
            }

        }
        // 
    static checkAudioShow(type) {
        if (type == '1') store.state.audioShow = true;
        if (type == '0') store.state.audioShow = false;
    }

    static debugEnterGame(params, callback) {
        let loginURL = ServiceURL.USER_LOGIN;

        // 如果是试用账户，直接进入游戏
        if (params["try"] != null) {
            HttpService(ServiceURL.ENTER_GAME, {
                method: 'post',
                data: Qs.stringify({ mode: params["mode"], gameId: params["game"], channel: params["channel"] })
            }).then(response => {
                const data = response.data;
                callback(data.code);
            }).catch(e => {
                callback(-1);
            });
            return;
        }
        // 如果是渠道，需要在URL后面加上渠道
        if (params["eventCode"] != null) {
            loginURL = ServiceURL.USER_CHANNEL_LOGIN + "?eventCode=" + params["eventCode"];
        }
        // 登陆后再进入游戏
        HttpService(ServiceURL.USER_LOGIN, {
            method: 'post',
            data: Qs.stringify({ email: params["user"], password: md5(params["password"]) })
        }).then(response => {
            const data = response.data;
            if (data.code == 0) {
                HttpService(ServiceURL.ENTER_GAME, {
                    method: 'post',
                    data: Qs.stringify({ mode: params["mode"], gameId: params["game"] })
                }).then(response => {
                    const data = response.data;
                    callback(data.code);
                }).catch(e => {
                    callback(-1);
                });
            }
        }).catch(e => {
            callback(-1);
        });
    }

    /**
     * 返回默认的主页，如果没有则返回空
     */
    static getReturnPage() {
        let channel = window.bridge.getCurrentChannel();

        // 专门的域名
        if (channel == "gd") {
            return process.env.GD_HOME_URL;
        }
        if (channel == "wx") {
            return process.env.WX_HOME_URL;
        }
        if (channel == "qs") {
            return process.env.QS_HOME_URL;
        }
        if (channel == "christmas") {
            return process.env.CHRISTMAS_URL;
        }
        if (channel == "ch") {
            return process.env.CH_GD_HOME_URL;
        }
        if (channel == "zx") {
            return process.env.ZX_GD_HOME_URL;
        }
        if (channel == "2021") {
            return process.env.GAME_HOME_2021_URL;
        }
        if (channel == "isr2021_1") {
            return process.env.ISRAEL_HOME_URL;
        }
        if (channel == "szio") {
            return process.env.SZIO_GD_HOME_URL;
        }
        if (channel == "teacher") {
            let teacher_gameId = window.bridge.getCurrentGameId();
            if (teacher_gameId == 9101 || teacher_gameId == 9102 || teacher_gameId == 9103 || teacher_gameId == 9104 || teacher_gameId == 9105)
                return process.env.TEACHER_PAGE;
            return process.env.TEACHER_HOME_URL;
        }
        if (channel == "gdsz") {
            return process.env.GDSZ_HOME_URL;
        }
        if (channel == "idi") {
            return process.env.IDI_HOME_URL;
        } //WXFINAL_HOME_URL
        if (channel == "isr_2021_2") {
            return process.env.ISRAEL_2_HOME_URL;
        }
        if (channel == "kmc") {
            return process.env.KMC_HOME_URL;
        }
        if (channel == "sdhj") {
            return process.env.SDHJ_HOME_URL;
        }
        if (channel == "c_qxxq") {
            return process.env.C_QXXQ_HOME_URL;
        }
        if (channel == "c_nanjing") {
            return process.env.C_NANJING_HOME_URL;
        }
        if (channel == "cyjt") {
            return process.env.CYJT_HOME_URL;
        }

        if (channel == "icode") {
            return process.env.MAIN_HOME_URL;
        }

        return channel ? process.env.CONTEST_HOME_URL + channel + "/userIndex" : null;
    }

    static getHomePage() {
        return this.getReturnPage() || process.env.MAIN_HOME_URL; //
    }

    static getSignPage() {
        // 专门的注册页面
        let channel = window.bridge.getCurrentChannel();
        if (channel == "gd") {
            return process.env.GD_SIGN_URL;
        }
        if (channel == "wx") {
            return process.env.WX_SIGN_URL;
        }
        if (channel == "qs") {
            return process.env.QS_SIGN_URL;
        }

        // 返回默认页面
        return this.getReturnPage() || process.env.MAIN_SIGN_URL;
    }

    static getFinalPage() {

        // 返回默认页面
        return this.getReturnPage() || process.env.GAME_FINAlS_URL;
    }
    static resetDefaulCode(lan) {
        let code = window.bridge.getCurrentLevelDefault(lan);
        AdventureManager.toFront_importCode(code);
    }
    static startCountDown() {
        this.getOnlineClass().startCountDown(); // 开始计时
    }
    static onGameReady() {
        AdventureManager.getOnlineClass().initTxt();
        window.dispatchEvent(new Event('resize')); // fire a resize event to tell cocos to reload
    }
}


// WEBPACK FOOTER //
// ./src/manager/AdventureManager.js