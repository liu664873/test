import ace, { edit } from "ace-builds"
import 'ace-builds/src-min-noconflict/mode-python' //导入语言包
import 'ace-builds/src-min-noconflict/ext-language_tools' //自动补全代码
import 'ace-builds/src-min-noconflict/ext-static_highlight'
import 'ace-builds/src-min-noconflict/ext-beautify'
import 'ace-builds/esm-resolver'

const editor = ace.edit("editor", {
    maxLines: 20,
    minLines: 20,
    fontSize: 10,
    theme: 'ace/theme/chrome',
    mode: 'ace/mode/python',
})

let testContent = `player.turnLeft()
player.turnLeft()
player.step(1)
player.turnRight()
player.step(1)
player.turnLeft()
player.step(1)
ship.turnLeft()
ship.turnLeft()
for i in range(3):
    ship.step(1)
`;

editor.setValue(testContent)
editor.clearSelection()

editor.container.addEventListener('click', (e) => {
    console.log('Clicked at', e.clientX, e.clientY)
    var currsorPostion = editor.getCursorPosition()
    console.log('Cursor position:', currsorPostion.row, currsorPostion.column)
})

editor.setOptions({
    highlightActiveLine: true,
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true
});

editor.highlightLines = new Map()

editor.highlightLine = function (lineNumber, error=false, className = "highlight-line") {
    if(editor.highlightLines.get(lineNumber)) editor.removeHighlight(lineNumber)
    if(error) className='highlight-line-error'
    var range = new ace.Range(lineNumber - 1, 0, lineNumber - 1, 1);
    var markerId = editor.session.addMarker(range, className, "fullLine", true);
    // editor.gotoLine(lineNumber)
    // 可以选择将markerId存储起来以便后续取消高亮  
    editor.highlightLines.set(lineNumber, markerId)
    return markerId;
}

editor.removeHighlight = function (lineNumber) {
    let markerId = editor.highlightLines.get(lineNumber)
    if (markerId) {
        editor.highlightLines.delete(lineNumber)
        editor.session.removeMarker(markerId);
    }
}

editor.session.Marker

export default editor
