import Phaser from "phaser";

export default class Icon extends Phaser.GameObjects.Image {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        this.scene.add.existing(this);
        this.setInteractive();
        this.isActive = false; // 指示图标是否被激活
    }

    addOnClickOneEvent(callback){
        if (typeof callback !== 'function') return ;
    
        this.on("pointerdown", () => { callback();});
    }

    /**
     * 添加点击事件监听器。
     * @param {Function} activateCallback - 图标激活时的回调函数。
     * @param {Function} deactivateCallback - 图标取消激活时的回调函数（可选）。
     */
    addOnClickTwoEvent(activateCallback, deactivateCallback) {
        if (typeof activateCallback !== 'function' && typeof deactivateCallback !== 'function') return;
    
        this.on("pointerdown", () => {
            this.isActive = !this.isActive;
            this.setTint(this.isActive ? 0xff0000 : 0xffffff);

            if (this.isActive) {
                if (activateCallback) activateCallback();
            } else {
                if (deactivateCallback) deactivateCallback();
            }
        });
    }
}