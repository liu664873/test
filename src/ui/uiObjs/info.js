import Phaser from "phaser";  
import GameManager from "../../GameManager";
import { GAME_DATA } from "../../configs/Config";
/**  
 * 信息类  
 * 用于显示游戏对象（GameObject）的名称、坐标信息  
 */  
export default class Info extends Phaser.GameObjects.Container {  
  
    /**  
     * 构造函数  
     * @param {GameObject} obj - 游戏对象，包含名称、网格坐标等信息  
     * @param {number} [distanceX=obj.map.tileWidth/2] - X轴上的偏移距离，默认为地图瓦片宽度的一半  
     * @param {number} [distanceY=obj.map.tileHeight] - Y轴上的偏移距离，默认为地图瓦片的高度  
     */  
    constructor(obj, distanceX, distanceY){  
        super(obj.scene); // 调用父类Container的构造函数，传入场景对象  
        this.scene.add.existing(this); // 将当前容器添加到场景中，但不重新创建它  
  
        // 存储传入的游戏对象  
        this.obj = obj;  

        // 添加背景图片到容器中  
        this.bg = new Phaser.GameObjects.Image(this.scene, 0, 0, "textBg").setScale(3, 3.5)
        this.add(this.bg);  
  
        // 添加显示内容的文本到容器中，默认为游戏对象名称  
        this.context = new Phaser.GameObjects.Text(this.scene, -120, -40, `${obj.name}`, {fontSize: 33, color: "#ffffff", strokeThickness: 1})
        this.add(this.context);  
  
        // 创建并添加显示游戏对象坐标的文本到容器中  
        this.xyText = new Phaser.GameObjects.Text(this.scene, -120, -5, `x:${obj.gridX} y:${obj.gridY}`, {fontSize: 33, color: "#ffffff", strokeThickness: 1});  
        this.add(this.xyText);  
  
        // 设置容器的深度  
        this.depth = 100;  
  
        // 初始时隐藏信息  
        this.setVisible(false);  
  
        // 设置X轴和Y轴上的偏移距离，如果传入了distanceX和distanceY则使用传入的值，否则使用默认值  
        this.distanceX = typeof distanceX === "number" ? distanceX : 0;  
        this.distanceY = typeof distanceY === "number" ? distanceY : -this.obj.map.tileHeight;  
  
        // 添加事件监听  
        this.addOnEvents();  
    }  
      
    /**  
     * 对传入的道具obj添加监听事件  
     * 当鼠标移动到obj上时，显示信息；移出obj时，隐藏信息  
     */  
    addOnEvents(){  
        // 当鼠标指针悬停在obj上时触发  
        this.obj.on("pointerover", () => {  
            // 如果正在运行某个链式操作或不应该显示信息，则直接返回  
            this.update();
            this.setVisible(true);  
        });  
  
        // 当鼠标指针移出obj时触发  
        this.obj.on("pointerout", () => {  
            // 隐藏信息  
            this.setVisible(false);  
        });  

        //鼠标点击时
        this.obj.on("pointerdown", () => {  
            const manager = this.scene.game.manager;
            if(manager?.mode === GameManager.MODE_PYTHON){
                manager.editor.insert(this.context.text);
            }
        });  
    }  

    getContext(){
        return this.context;
    }

    setContext(context){
        this.context.setText(context)
    }

    update(){
        // 设置容器的位置，使其相对于obj的中心显示  
        this.setPosition(this.obj.x + this.scale*this.distanceX, this.obj.y + this.scale*this.distanceY);  
  
        // 更新文本内容以显示当前坐标  
        this.xyText.setText(`x:${this.obj.gridX} y:${this.obj.gridY}`);  
    }
  
}