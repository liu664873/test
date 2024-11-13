import Phaser from "phaser";  
import TileConfig from "../../configs/TileConfig";
import UI from "../../ui/ui";
  
/**  
 * 游戏对象基类  
 * 继承自Phaser的Container类，用于创建和管理游戏场景中的对象。  
 * 该类包含网格坐标、网格尺寸等基本信息，便于在网格地图上进行对象定位和管理。  
 */  
export default class TileObj extends Phaser.GameObjects.Container {  
      
    /**  
     * 构造函数  
     * @param {Map} map - 游戏地图对象，包含地图信息，可以管理地图数据。  
     * @param {Phaser.Tilemaps.TilemapLayer} layer - 游戏图层对象，包含图层图的瓦片数据和图层信息
     * @param {string} name - tileObj对象名，作为TileConfig的key值来获取数据创建游戏对象。  
     * @param {number} gridX - 网格坐标x，表示对象在地图网格中的水平位置，默认为0。  
     * @param {number} gridY - 网格坐标y，表示对象在地图网格中的垂直位置，默认为0。
     */  
    constructor(map, layer, name, gridX = 0, gridY = 0){  

        super(map.scene);
 
        // 创建一个二维向量，用于存储转换后的世界坐标。
        const vec = new Phaser.Math.Vector2();
        // 将网格坐标转换为世界坐标，即场景中的实际坐标。
        layer.tileToWorldXY(gridX, gridY, vec);
 
        // 设置对象的初始位置和场景。
        this.setPosition(vec.x + map.scale * map.tileWidth / 2, vec.y);
 
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
 
        // 保存地图和对象的基本信息。
        this.map = map;
        this.layer = layer;
        this.name = name;
        this.gridX = gridX;
        this.gridY = gridY;
        this.depth = layer.depth;
        this.tileWidth = map.tileWidth;
        this.tileHeight = map.tileHeight;
        this.mapWidth = map.width;
        this.mapHeight = map.height;
        this.index = layer.getTileAt(gridX, gridY).index;
        this.layerIndex = layer.depth - map.depth;
        this.showInfo = TileConfig[name]?.info?.showInfo ?? false;
 
        this.offsetX = this.tileWidth / 2; // 保存偏移量默认值，用于位置计算
        this.offsetY = 0;
 
        // 创建一个精灵对象，作为游戏对象的主体视觉表示。
        const config = TileConfig[name] ?? {};
        this.baseObject = new Phaser.GameObjects.Sprite(
            this.scene,
            config.offset?.x ?? 0,
            config.offset?.y ?? 0,
            config.imageKey ?? '',
            config.dfImage ?? 0
        );
        this.originScale = config.originScale ?? 1; // 原始缩放比例
        this.baseObject.setScale(this.originScale);
        this.add(this.baseObject);

        this.initAnims();
 
        this.setInteractive(
            new Phaser.Geom.Circle(0, -20, 40),
            Phaser.Geom.Circle.Contains
        );
 
        this.info = this.showInfo && UI.info(this, config.info?.offset?.x ?? 0, config.info?.offset?.y ?? 0);
    }  

    getGridX(){ return this.gridX; }  

    getGridY(){ return this.gridY;  }  
  
    getOffsetX(){ return this.offsetX; }  

    getGridY(){ return this.offsetY; }  
    
    getGridPosition(){ return new Phaser.Math.Vector2(this.gridX, this.gridY); }  

    getOffset(){ return new Phaser.Math.Vector2(this.offsetX, this.offsetY); }  

    setOffset(offsetX, offsetY){ this.offsetX = offsetX; this.offsetY = offsetY; }

    initAnims() {  
        const tileConfig = TileConfig[this.name];  
        if (tileConfig.anims) {  
            tileConfig.anims.forEach((anim) => {  
                const config = { ...anim };  
                if (typeof config.frames === "object") {  
                    config.frames = this.baseObject.anims.generateFrameNumbers(  
                        tileConfig.imageKey,
                        config.frames  
                    );  
                }  
                this.baseObject.anims.create(config);  
            });  
        }  
    }  

    getPosition(gridX, gridY){
        const vec = new Phaser.Math.Vector2();  
        this.layer.tileToWorldXY(gridX, gridY, vec);   
        vec.x = vec.x + this.scale*this.offsetX*this.originScale;
        vec.y = vec.y  + this.scale*this.offsetY*this.originScale;
        return vec
    }

    playAnim(animKey){
        if (!animKey || !this.baseObject.anims.exists(animKey)) return; // 如果动画不存在，则返回
        console.log(`key：${animKey}动画存在！`)
        this.baseObject.anims.play(animKey);
    }

    stopAnim(animKey){
        if ( !animKey|| this.baseObject.anims.exists(animKey)) return; // 如果动画不存在，则返回
        this.baseObject.anims.stop(animKey);
    }
  
    setGridPosition(gridX, gridY){  
        // 检查传入的网格坐标是否合法。  
        if(  
            typeof gridX !== "number" || typeof gridY !== "number" ||  
            gridX < 0 || gridX >= this.mapWidth ||  
            gridY < 0 || gridY >= this.mapHeight  
        ) {  
            console.log("object setGridXY 参数不合法!");  
        } else {  
            // 更新网格坐标。  
            this.gridX = gridX;  
            this.gridY = gridY;  
            // 将新的网格坐标转换为世界坐标。  
            const vec = new Phaser.Math.Vector2();  
            this.layer.tileToWorldXY(gridX, gridY, vec);  
            // 更新对象在世界坐标中的位置。   
            this.setPosition(vec.x + this.scale*this.offsetX, vec.y  + this.scale*this.offsetY)
            this.info && this.info.update()
        }  
        return this; 
    }  
  
    /**  
     * 重写setScale方法，用于调整对象的缩放比例。  
     * 如果之前设置了原始缩放比例（originScale），则会基于该比例进行缩放。  
     */  
    setScale(x, y){  

        // 调用父类的setScale方法，应用缩放比例。  
        super.setScale(x, y);  
          
        // 由于缩放可能改变了对象的位置，因此重新设置网格位置以确保对象在正确的位置。   
        // 确保对象在缩放后仍然占据原来的网格空间。  
        this.setGridPosition(this.gridX, this.gridY);  

        //如果obj的信息展示存在，则同步设置scale
        this.info && this.info.setScale(x, y)
  
        return this;  
    }  
}