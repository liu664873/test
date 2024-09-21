import editor from "./codeEditor/editor";

export default class Manager {

    constructor(){}

    // analysisPythonCode(code) {
    //     // 清除注释部分
    //     code = code.replace(/#.*/g, "");

    //     if(code.match("'") || code.match('"')){
    //         return "：关卡无需使用字符串，请尝试其他解答方式吧。"
    //     }

    //     let lines = code.split('\n');

    //     for (let i=0; i<lines.length; i++){
    //         let line = lines[i];
    //         if(line.match(/ or /g) && line.match(/ or /g).length > 4){
    //             return ": 为了提高代码可读性，在ICode编辑器中，同一行最多使用4个条件判断语句。";
    //         }

    //         if(line.match(/\(/g) && line.match(/\(/g).length > 4){
    //             return ": 为了提高代码可读性，在ICode编辑器中，在同一行最多使用4个括号（）。";
    //         }

    //         if(line.match(/,/g) && line.match(/,/g).length > 4){
    //             return ": 为了提高代码可读性，在ICode编辑器中，同一行最多使用4个逗号（,）。";
    //         }

    //         if(line.match(/\[/g) && line.match(/\[/g).length > 4){
    //             return ": 为了提高代码可读性，在ICode编辑器中，在同一行使用最多使用4个方括号[]。";
    //         }


    //         // 检测冒号部分
    //         line = line .replace(/ /g, "")      // 干掉空格后再处理
    //                     .replace(/\t/g, "")      // 干掉空格后再处理
    //                     .replace(/:,/g, "")     // 允许 :,
    //                     .replace(/:\],/g, "")   // 允许 :]
    //                     .replace(/:\d/g, "");   // 允许 :数字
    //         if(line.match(/def.*:\S/)){
    //             return ": 为了提高代码可读性，在ICode编辑器中，定义函数时，后续的语句需要从新的一行开始。";
    //         }

    //         if(line.match(/for.*:\S/) || line.match(/while.*:\S/)){
    //             return ": 为了提高代码可读性，在ICode编辑器中，定义循环时，建议后续的语句需要从新的一行开始。";
    //         }

    //         if(line.match(/if.*:\S/)){
    //             return ": 为了提高代码可读性，在ICode编辑器中，使用条件判断时，后续的语句需要从新的一行开始。";
    //         }
    //     }

    //     return ""; // 无错误返回正常
    //     // return "Error Message";
    // }

    analysisPythonCode(codes){
        let result = ""
        for(let i = 0; i < codes.length; i++){
            let lineNumber = codes[i][0]
            let line = codes[i][1]

            if(line.match("'") || line.match('"')){
                return `第${lineNumber}行出错：关卡无需使用字符串，请尝试其他解答方式吧。`
            }

            if(line.match(/ or /g) && line.match(/ or /g).length > 4){
                return `第${lineNumber}行出错: 为了提高代码可读性，在编辑器中，同一行最多使用4个条件判断语句。`;
            }

            if(line.match(/\(/g) && line.match(/\(/g).length > 4){
                return `第${lineNumber}行出错: 为了提高代码可读性，在编辑器中，在同一行最多使用4个括号（）。`;
            }

            if(line.match(/,/g) && line.match(/,/g).length > 4){
                return `第${lineNumber}行出错: 为了提高代码可读性，在编辑器中，同一行最多使用4个逗号（,）。`;
            }

            if(line.match(/\[/g) && line.match(/\[/g).length > 4){
                return `第${lineNumber}行出错: 为了提高代码可读性，在编辑器中，在同一行使用最多使用4个方括号[]。`;
            }


            // 检测冒号部分
            line = line .replace(/ /g, "")      // 干掉空格后再处理
                        .replace(/\t/g, "")      // 干掉空格后再处理
                        .replace(/:,/g, "")     // 允许 :,
                        .replace(/:\],/g, "")   // 允许 :]
                        .replace(/:\d/g, "");   // 允许 :数字
            if(line.match(/def.*:\S/)){
                return `第${lineNumber}行出错: 为了提高代码可读性，在编辑器中，定义函数时，后续的语句需要从新的一行开始。`;
            }

            if(line.match(/for.*:\S/) || line.match(/while.*:\S/)){
                return `第${lineNumber}行出错: 为了提高代码可读性，在编辑器中，定义循环时，建议后续的语句需要从新的一行开始。`;
            }

            if(line.match(/if.*:\S/)){
                return `第${lineNumber}行出错: 为了提高代码可读性，在编辑器中，使用条件判断时，后续的语句需要从新的一行开始。`;
            }
            
        }
        return result
    }

    showPopup(popupText) {  
        var popup = document.getElementById('popup');  
        popup.style.display = 'flex';  
        if(popupText) document.getElementById('popupText').textContent = popupText
    }  
    
    cancelPopup(callback) {  
        var popup = document.getElementById('popup');  
        popup.style.display = 'none';  
        if(callback && typeof callback === 'function'){
            callback()
        }
    }  
    
    confirmPopup(callback) {  
        var popup = document.getElementById('popup');  
        popup.style.display = 'none';  
        if(callback && typeof callback === 'function'){
            callback()
        }
    }
}