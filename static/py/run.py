from browser import document as doc, window
import javascript
import sys
import traceback
import re

window.code_running = False

code_head = '''

window.code_running = True

game = window.game
player = game.registry.get("player")
ship = game.registry.get("ship")
mapd = game.registry.get("mapd")

'''

code_tail = '''
window.code_running = False
mapd.createTweenChain()
'''

# custom exception
class ProgramStepCountOverflowException(Exception):
    def __init__(self, errorInfo):
        Exception.__init__(self)
        self.errorInfo = errorInfo
    def __str__(self):
        return self.errorInfo

# record program step  
program_step_count = 0
        
def recordOneStep(lineNumber):
    global program_step_count
    program_step_count += 1
    if program_step_count > 5000:
        program_step_count = 0
        window.error_lineNumber = lineNumber
        raise ProgramStepCountOverflowException('Program step exceed! Dead loop?')

def handleOneStep(lineNumber):
    recordOneStep(lineNumber)
    window.gameAndEditor_data.set('runningCodeLine', lineNumber)

def getStartSpaceCount(str):
    count = 0
    for w in str:
        if w == ' ':
            count += 1
        else:
            break
    return count


SKIPS = (
    '.step',
    '.turnLeft',
    '.turnRight',
)
FORBIDDEN_ACT = (
    'eval',
    'exec',
    'complie',
    'isinstance',
    'dict',
    'getattr',
    'input',
    'clearCurrentSteps',
    'browser',
    'Dev["',
    'Spaceship["',
    'Airship["',
    'Item["',
    'Flyer["',
    'Energy["',
    'Airship',
    '__turnBack',
    ';',
)
REC_SKIPS = re.compile('|'.join([re.escape(x) for x in SKIPS]), re.I)
FOR_SKIPS = re.compile('|'.join([re.escape(x) for x in FORBIDDEN_ACT]), re.I)

def echo(event):
    error_str = ""
    window.error_lineNumber = -1
    
    # 获取编辑器上输入的代码
    code = window.editor.getValue()

    try: 
    
        old_lines = code.split('\n')

        old_lines = list(map(lambda e: e.replace('\t', '    '), old_lines))
        
        line_dict = []

        old_lines = list(map(lambda e: e.replace('\t', '    '), old_lines))

        for i in range(len(old_lines)):
                line = old_lines[i]
                
                line_stripped = line.strip()
                
                #过滤掉为空的行数
                if len(line_stripped) <= 0:
                    continue

                #过滤掉注释行
                if (line_stripped[0] == '#'):
                    continue

                if len(line_stripped)>80:
                    window.error_lineNumber = i + 1
                    raise Exception(":One line of code cannot exceed 80 characters")
                    
                line_dict.append([i + 1, line])

        #print('line_dict', line_dict)
        analysis_result = window.manager.analysisPythonCode(line_dict)
        if analysis_result.lineNumber > 0:
            error_str = analysis_result.error
            window.error_lineNumber = analysis_result.lineNumber
            raise Exception(analysis_result.error)

        newLines = []

        for i in range(len(line_dict)):
            line = line_dict[i]
            
            #判断缩进是否正确
            lineHasColon = line[1].strip()[-1] == ':'
            if lineHasColon :
                if i < len(line_dict) - 1:
                    if getStartSpaceCount(line[1]) + 4 != getStartSpaceCount(line_dict[i + 1][1]):
                        window.error_lineNumber = line_dict[i][0] + 1
                        raise Exception("缩进错误!")

            spaceCount = getStartSpaceCount(line_dict[i][1])

            newLines.append(' ' * (spaceCount) +
                            'handleOneStep(' + str(line_dict[i][0]) + ')')
            
            newLines.append(line_dict[i][1])

        new_code = '\n'.join(newLines)
        
        code = code_head + new_code + code_tail
        print(code)

        exec(code)
    
    except Exception as exc:
        if(window.error_lineNumber > 0): 
            window.manager.highlightLine(window.error_lineNumber, True)
            error_str = 'Error ' + ('[Line ' + str(window.error_lineNumber) +
                                ']: ') + str(exc)
        else:
            error_str = 'Error: ' + str(exc) 
        window.manager.showError(error_str, window.error_lineNumber)
        # window.manager.showPopup(error_str, function() {window.manager.removeHighlight(window.error_lineNumber)})
        # tb_str = traceback.format_exc()
        # window.manager.showPopup(str(tb_str))

        # group = re.search(r'File "<string>", line (\d+)', tb_str)
        # # print('dict', window._line_num_dict)
        # if group:
        #     err_line_num = int(group.groups()[0])
        #     # list of: after processing line number -- real line number
        #     line_dict_rev = []
        #     for i in range(len(line_dict)):
        #         line_dict_rev.append([line_dict[i][2], line_dict[i][0]])

        #     # print('line_dict_rev', line_dict_rev)
        #     for i in range(len(line_dict_rev) - 1, -1, -1):
        #         if line_dict_rev[i][0] > err_line_num:
        #             continue
        #         window._err_line_num_ace = line_dict_rev[i][1]
        #         break

        # error_str = 'Error ' + ('[Line ' + str(window._err_line_num_ace) +
        #                         ']: ' if window._err_line_num_ace != None else '') + str(exc)
        # window.py_error_str = str(exc)
        #print(str(exc))

def stop(event):
    game = window.game
    mapd = game.registry.get("mapd")
    if(window.chainTween):
        if(game.isRunning):
            mapd.chainTween.pause()
            game.isRunning = False
        else:
            mapd.chainTween.resume()
            game.isRunning = True
    # else :
    #     raise Exception('No chainTween!')
    #mapd.chainTween.play()
    # window.editor.removeHighlight(mapd.scene.lineNumber)
    #window.editor.removeAllHighlight()
    #game.scene.start("transform",{'level':'level1'})
def new(event):
    game = window.game
    mapd = game.registry.get("mapd")
    if(window.chainTween):
        mapd.chainTween.stop()
        window.editor.removeAllHighlight()
        window.manager.showPopup("是否重置场景",resetScene,cancel) 

def clear(event):
    window.manager.showPopup("是否重置代码",resetCode,cancel) 
def resetScene():
    game = window.game
    game.scene.start("transform",{'levelData':game.registry.get("mapd").scene.levelData})
def resetCode():
    game = window.game
    window.editor.setValue('')
    game.scene.start("transform",{'levelData':game.registry.get("mapd").scene.levelData})
def cancel():
    pass
doc["run"].bind("click", echo)
doc["new"].bind("click", new)
doc["stop"].bind("click", stop)
doc["clear"].bind("click", clear)
#doc["stop"].bind("click", stop)
#doc["refresh"].bind("click", refresh)
