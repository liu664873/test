import Phaser from "phaser"

/** 
 * 空场景，用来创建游戏时，第一个进入的场景
*/
export default class Loader extends Phaser.Scene {

    constructor() {
        super("blank")
    }
}