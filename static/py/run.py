from browser import document as doc, window
import javascript
import sys
import traceback
import re

code_head = '''

game = window.game
player = game.registry.get("player")
ship = game.registry.get("ship")
mapd = game.registry.get("mapd")

'''

code_tail = '''
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
        
def recordOneStep():
    global program_step_count
    program_step_count += 1
    if program_step_count > 5000:
        program_step_count = 0
        raise ProgramStepCountOverflowException('Program step exceed! Dead loop?')

def handleOneStep(lineNumber):
    recordOneStep()
    window.gameAndEditor_data.set('runningCodeLine', lineNumber)

def getStartSpaceCount(str):
    count = 0
    for w in str:
        if w == ' ':
            count += 1
        else:
            break
    return count

def new(event):
        window.game.scene.start("transform",{'level':'level2'})


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
                    raise Exception(":One line of code cannot exceed 80 characters")
                    
                line_dict.append([i + 1, line])

        #print('line_dict', line_dict)
        analysis_result = window.manager.analysisPythonCode(line_dict)
        if len(analysis_result) > 0:
            error_str = analysis_result
            raise Exception(analysis_result)

        newLines = []

        for i in range(len(line_dict)):

            spaceCount = getStartSpaceCount(line_dict[i][1])

            newLines.append(' ' * (spaceCount) +
                            'handleOneStep(' + str(line_dict[i][0]) + ')')
            
            newLines.append(line_dict[i][1])

        new_code = '\n'.join(newLines)
        
        code = code_head + new_code + code_tail
        print(code)

        exec(code)
    
    except Exception as exc:
        print("出错了！！")
        window.manager.showPopup(str(exc))

doc["new"].bind("click",new)  
doc["run"].bind("click", echo)
#doc["stop"].bind("click", stop)
#doc["refresh"].bind("click", refresh)
