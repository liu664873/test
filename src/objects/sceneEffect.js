
export default class SceneEffect {
    static closeScene(_this, callback){
        const width = _this.sys.game.config.width
        const height = _this.sys.game.config.height
        const rect = _this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0).setAlpha(0)
        // 淡出当前场景内容
        _this.tweens.add({
            targets: rect,
            alpha: 1, // 透明度从1变到0
            duration: 1000, // 持续时间
            onComplete: () => {
                callback()
                // rect.destory()
            }
        });
    }
    static openScene(_this, callback){
        const width = _this.sys.game.config.width
        const height = _this.sys.game.config.height
        const rect = _this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0)
        // 淡出当前场景内容
        _this.tweens.add({
            targets: rect,
            alpha: 0, // 透明度从1变到0
            duration: 1000, // 持续时间
            onComplete: () => {
                callback()
                // rect.destory()
            }
        });
    }
}