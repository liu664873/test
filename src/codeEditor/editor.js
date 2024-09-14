import ace, { edit } from "ace-builds"
import 'ace-builds/src-min-noconflict/mode-python' //导入语言包
import 'ace-builds/src-min-noconflict/ext-language_tools' //自动补全代码
import 'ace-builds/src-min-noconflict/ext-static_highlight'
import 'ace-builds/src-min-noconflict/ext-beautify'
import 'ace-builds/esm-resolver'

var editor = ace.edit("editor", {
    maxLines: 20,
    minLines:20,
    fontSize: 10,
    theme: 'ace/theme/chrome',
    mode: 'ace/mode/python',
})

window.editor = editor

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

editor.gotoLine(4, 0, true)
editor.line

// editor.commands.addCommand({
//     name: 'serach',
//     bindKey: {win: 'Ctrl-F'},
//     exec: function(editor){
//     }
