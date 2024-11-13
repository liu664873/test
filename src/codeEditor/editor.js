import ace, { edit } from "ace-builds";
import 'ace-builds/src-min-noconflict/mode-python';
import 'ace-builds/src-min-noconflict/ext-language_tools';
import 'ace-builds/src-min-noconflict/ext-static_highlight';
import 'ace-builds/src-min-noconflict/ext-beautify';
import 'ace-builds/esm-resolver';

class CodeEditor {
  constructor(containerId) {
    this.editor = ace.edit(containerId, {
      maxLines: 20,
      minLines: 20,
      fontSize: 10,
      theme: 'ace/theme/chrome',
      mode: 'ace/mode/python',
    });

    this.editor.setOptions({
      highlightActiveLine: true,
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: true,
    });

    this.runLine = -1;
    this.errorLine = -1;
    this.highlightedLines = new Map();
    this.codeLines = [];
    this.code = "";

    this.addCustomCompleter();
  }

  addCustomCompleter() {
    const myCustomCompleter = {
      getCompletions: (editor, session, pos, prefix, callback) => {
        const completions = [
          { name: 'turnLeft', value: 'turnLeft()', meta: 'function' },
          { name: 'turnRight', value: 'turnRight()', meta: 'function' },
          { name: 'step', value: 'step()', meta: 'function' },
          { name: 'player', value: 'player', meta: 'object' },
          { name: 'ship', value: 'ship', meta: 'object' },
        ];
        callback(null, completions);
      }
    };
    this.editor.completers.push(myCustomCompleter);
  }

  getValue(){return this.editor.getValue()}

  highlightLine(lineNumber, isError = false) {
    const className = isError ? 'highlight-line-error' : 'highlight-line';
    if (this.highlightedLines.has(lineNumber)) {
      this.removeHighlight(lineNumber);
    }
    const range = new ace.Range(lineNumber - 1, 0, lineNumber - 1, 1);
    const markerId = this.editor.session.addMarker(range, className, "fullLine", true);
    this.highlightedLines.set(lineNumber, markerId);
    this.editor.gotoLine(lineNumber);
  }

  insert(value){this.editor.insert(value);}

  removeHighlight(lineNumber) {
    const markerId = this.highlightedLines.get(lineNumber);
    if (markerId) {
      this.highlightedLines.delete(lineNumber);
      this.editor.session.removeMarker(markerId);
    }
  }

  removeAllHighlight() {
    for (const markerId of this.highlightedLines.values()) {
      this.editor.session.removeMarker(markerId);
    }
    this.highlightedLines.clear();
  }

  resetData() {
    this.runLine = -1;
    this.errorLine = -1;
    this.removeAllHighlights();
    this.codeLines = [];
    this.code = "";
  }

  analysisPythonCode(codes) {
    if(codes.length <= 0){
        return {error:`代码不能为空`, lineNumber: -1};
    }
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
        if(line.length>80){
            return {error:`字数不能超过80个字符`, lineNumber: lineNumber};
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
}

export default CodeEditor;