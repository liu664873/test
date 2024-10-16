import editor from "./codeEditor/editor";

export default class Manager {

    constructor(game, editor = null){
        this.game = game
        if(editor){
            this.editor = editor
        }
    }
    
    analysisPythonCode(codes){
        for(let i = 0; i < codes.length; i++){
            let lineNumber = codes[i][0]
            let line = codes[i][1]

            if(line.match("'") || line.match('"')){
                return {error: `关卡无需使用字符串，请尝试其他解答方式吧。`, lineNumber: lineNumber}
            }

            if(line.match(/ or /g) && line.match(/ or /g).length > 4){
                return {error: `为了提高代码可读性，在编辑器中，同一行最多使用4个条件判断语句。`, lineNumber: lineNumber};
            }

            if(line.match(/\(/g) && line.match(/\(/g).length > 4){
                return {error: `为了提高代码可读性，在编辑器中，在同一行最多使用4个括号（）。`, lineNumber: lineNumber};
            }

            if(line.match(/,/g) && line.match(/,/g).length > 4){
                return {error:`为了提高代码可读性，在编辑器中，同一行最多使用4个逗号（,）。`, lineNumber: lineNumber};
            }

            if(line.match(/\[/g) && line.match(/\[/g).length > 4){
                return {error:`为了提高代码可读性，在编辑器中，在同一行使用最多使用4个方括号[]。`, lineNumber: lineNumber};
            }


            // 检测冒号部分
            line = line .replace(/ /g, "")      // 干掉空格后再处理
                        .replace(/\t/g, "")      // 干掉空格后再处理
                        .replace(/:,/g, "")     // 允许 :,
                        .replace(/:\],/g, "")   // 允许 :]
                        .replace(/:\d/g, "");   // 允许 :数字
            if(line.match(/def.*:\S/)){
                return {error:`为了提高代码可读性，在编辑器中，定义函数时，后续的语句需要从新的一行开始。`, lineNumber: lineNumber};
            }

            if(line.match(/for.*:\S/) || line.match(/while.*:\S/)){
                return {error:`为了提高代码可读性，在编辑器中，定义循环时，建议后续的语句需要从新的一行开始。`, lineNumber: lineNumber};
            }

            if(line.match(/if.*:\S/)){
                return {error:`为了提高代码可读性，在编辑器中，使用条件判断时，后续的语句需要从新的一行开始。`, lineNumber: lineNumber};
            }

        }
        return {error: "", lineNumber: -1}
    }

    highlightLine(lineNumber, error){
        this.editor.highlightLine(lineNumber, error)
    }

    removeHighlight(lineNumber){
        this.editor.removeHighlight(lineNumber)
    }

    showError(tipText,error, lineNumber){
        this.showPopup(tipText,error, () => {this.editor.removeHighlight(lineNumber)}, () => {this.editor.removeHighlight(lineNumber)})
    }

    showPopup(tipText,popupText, call1, call2) {  
        var popup = document.getElementById('popup');  
        popup.style.display = 'flex';  
        if(tipText) document.getElementById('tipText').textContent = tipText
        if(popupText) document.getElementById('popupText').textContent = popupText
        var confirmBtn = document.getElementById('confirm-button')
        var cancelBtn = document.getElementById('cancel-button')
        
        confirmBtn.onclick =   () => {
            popup.style.display = 'none';  
            if (call1 && typeof call1 == 'function') {
                call1()
            }
            confirmBtn.click = null
        }
        cancelBtn.onclick =   () => {
            popup.style.display = 'none';  
            if (call2 && typeof call2 == 'function') {
                call2()
            }
            cancelBtn.click = null
        }

    }

    /**
     * 清除编辑器代码全部高亮
     */
    // removeAllHighlight(){
    //     for (let value of this.editor.highlightLine.values()) {  
             
    //       }  
    // }
    // cancelPopup(callback) {  
    //     var popup = document.getElementById('popup');  
    //     popup.style.display = 'none';  
    //     if(callback && typeof callback === 'function'){
    //         callback()
    //     }
    // }  
    
    // confirmPopup(callback) {  
    //     var popup = document.getElementById('popup');  
    //     popup.style.display = 'none';  
    //     if(callback && typeof callback === 'function'){
    //         callback()
    //     }
    // }
}