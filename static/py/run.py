from browser import document as doc, window
import javascript
import sys
import traceback
import re

manager = window.manager

code_head = '''
player = manager.getPlayer()
ship = manager.getShip()
energy = manager.getEnergyList()
flyer = manager.getFlyerList()
'''

# player = manager.player
# ship = manager.ship
# energy = manager.energyList
# flyer = manager.flyerList

code_tail = '''
manager.playActionAnims()
'''

class ProgramStepCountOverflowException(Exception):
    def __init__(self, errorInfo):
        Exception.__init__(self)
        self.errorInfo = errorInfo
    def __str__(self):
        return self.errorInfo

program_step_count = 0
        
def recordOneStep(lineNumber):
    global program_step_count
    program_step_count += 1
    if program_step_count > 5000:
        program_step_count = 0
        manager.editor.errorLine = lineNumber
        raise ProgramStepCountOverflowException('Program step exceed! Dead loop?')

def handleOneStep(lineNumber):
    recordOneStep(lineNumber)
    manager.editor.runLine = lineNumber
 

def getStartSpaceCount(str):
    count = 0
    for w in str:
        if w == ' ':
            count += 1
        else:
            break
    return count

def echo(event):
    error_str = ""
    manager.editor.errorLine = -1
    # 获取编辑器上输入的代码
    code = manager.editor.getValue()

    try: 
    
        old_lines = code.split('\n')

        old_lines = list(map(lambda e: e.replace('\t', '    '), old_lines))

        line_dict = []

        for i in range(len(old_lines)):
                line = old_lines[i]
                
                line_stripped = line.strip()
                
                #过滤掉为空的行数
                if len(line_stripped) <= 0:
                    continue

                #过滤掉注释行
                if (line_stripped[0] == '#'):
                    continue

           
                line_dict.append([i + 1, line])

        #print('line_dict', line_dict)
        analysis_result = manager.editor.analysisPythonCode(line_dict)
        if analysis_result.error != "":
            error_str = analysis_result.error
            manager.editor.errorLine = analysis_result.lineNumber
            raise Exception(analysis_result.error)

        newLines = []

        for i in range(len(line_dict)):
            line = line_dict[i]

            
            # #判断缩进是否正确
            # lineHasColon = line[1].strip()[-1] == ':'
            # if lineHasColon :
            #     if i < len(line_dict) - 1:
            #         if getStartSpaceCount(line[1]) + 4 != getStartSpaceCount(line_dict[i + 1][1]):
            #             manager.editor.errorLine = line_dict[i][0] + 1
            #             raise Exception("缩进错误!")

            spaceCount = getStartSpaceCount(line_dict[i][1])

            newLines.append(' ' * (spaceCount) +
                            'handleOneStep(' + str(line_dict[i][0]) + ')')
            
            newLines.append(line_dict[i][1])

        new_code = '\n'.join(newLines)
        
        code = code_head + new_code + code_tail
        print(new_code)

        exec(code)
    except SyntaxError as exc:

        manager.editor.errorLine = int((exc.lineno-8)/2)+1
        errMessage = manager.editor.session.getLine(manager.editor.errorLine-1)
        
        error_str = 'Error ' + ('[Line ' + str(manager.editor.errorLine) +
                            ']: ') + '\"' + errMessage + '\"' + "有语法错误，请仔细检查!"
        manager.editor.highlightLine(manager.editor.errorLine, True)
        manager.showPrompt("错误",error_str, errorCallback1, errorCallback2)
       
    except Exception as exc:
        print(exc)
        manager.editor.highlightLine(manager.editor.errorLine, True)
        error_str = 'Error ' + ('[Line ' + str(manager.editor.errorLine) +
                            ']: ') + str(exc)
        manager.showPrompt("错误",error_str, errorCallback1, errorCallback2)


    
def stop(event):
    if(manager.inPlayActionAnims):
        manager.pauseActionAnims()
    else :
        manager.resumeActionAnims()
    
def new(event):
    manager.editor.removeAllHighlight()
    manager.showPrompt("重试","是否重置场景", cancel, resetScene) 

def errorCallback1():
    manager.editor.removeHighlight()
def errorCallback2():
    manager.editor.removeHighlight()


def clear():
    manager.showPrompt("重试","是否重置代码", cancel, resetCode) 
def resetScene():
    resetCode()
    manager.selectLevel(manager.currentLevel)
def resetCode():
    manager.editor.setValue('')
def cancel():
    pass

doc["run"].bind("click", echo)
doc["new"].bind("click", new)
doc["stop"].bind("click", stop)
doc["clear"].bind("click", clear)
