import { Ace } from "ace-builds";

import {EditorView, keymap} from "@codemirror/view"
import {defaultKeymap} from "@codemirror/commands"
import { EditorState } from "@codemirror/state"
import { language } from "@codemirror/language"
import { basicSetup } from "codemirror"
import {javascript} from "@codemirror/lang-javascript"

let editor = new EditorView({
  extensions: [basicSetup, javascript()],
  parent: document.getElementById("codeContext"),
})

export default editor