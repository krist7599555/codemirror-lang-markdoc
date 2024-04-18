/**
 * Originalcode from {@see https://github.com/markdoc/docs/blob/main/components/codemirror/markdoc.js}
 * Which is fork of {@see https://github.com/HlidacStatu/codemirror-mode-liquid/blob/master/liquid.js}
 */

import type { StringStream, StreamParser } from "@codemirror/language";
import { html } from "@codemirror/legacy-modes/mode/xml";

interface HtmlState {
  tokenize: Function;
  state: Function;
  indented: number;
  tagName: null;
  tagStart: null;
  context: null;
}
interface MarkdocState {
  states: string[];
  indent: number;
  quoteKind: any;
  htmlState: HtmlState;
}

const htmlMode = html as StreamParser<HtmlState>;

function last<T>(array: T[]): T {
  return array.at(-1)!;
}

function tokenUntil(
  stream: StringStream,
  state: MarkdocState,
  untilRegExp: RegExp
) {
  if (stream.sol()) {
    let indent = 0;
    for (; indent < state.indent; indent++) {
      if (!stream.eat(/\s/)) break;
    }
    if (indent) return null;
  }
  let oldString = stream.string;
  let match = untilRegExp.exec(oldString.substr(stream.pos));
  if (match) {
    stream.string = oldString.substr(0, stream.pos + match.index);
  }

  //npmdoc.github.io/node-npmdoc-codemirror/build/apidoc.html#apidoc.element.codemirror.StringStream.prototype.hideFirstChars
  function hideFirstChars(stream: any, n: number, inner: Function) {
    stream.lineStart += n;
    try {
      return inner();
    } finally {
      stream.lineStart -= n;
    }
  }
  let result = hideFirstChars(stream, state.indent, function () {
    return htmlMode.token(stream, state.htmlState);
  });
  stream.string = oldString;
  return result;
}

const config = {
  indentUnit: 2,
};

/** Markdoc - CodeMirror V5 (legacy) Language Mode
 * which is compatable with v6 adapter
 * @example
 * ```js
 * import { StreamLanguage } from '@codemirror/language';
 * new CodeMirror({
 *    extensions: [
 *      StreamLanguage.define(markdocLegacy)
 *    ]
 * })
 * ```
 */
export const markdoc: StreamParser<MarkdocState> = {
  startState() {
    return {
      states: [],
      indent: 0,
      quoteKind: null,
      htmlState: htmlMode.startState!(0),
    };
  },

  token(stream, state) {
    let match: RegExpMatchArray | null | boolean;
    switch (last(state.states)) {
      case undefined:
        if (stream.match(/^{%-?\s*comment\s*-?%}/)) {
          state.indent += config.indentUnit;
          state.states.push("comment");
          return "comment";
        } else if (stream.match(/^{%-?\s*raw\s*-?%}/)) {
          state.indent += config.indentUnit;
          state.states.push("raw");
          return "keyword";
        } else if (stream.match(/^{{/)) {
          state.states.push("object");
          return "keyword";
        } else if ((match = stream.match(/^{%-?\s*(\w*)/))) {
          if (!match || typeof match == "boolean") return;
          if (match[1] == "endcase") state.indent -= 2 * config.indentUnit;
          else if (/^end/.test(match[1])) state.indent -= config.indentUnit;
          else if (match[1] == "case") state.indent += 2 * config.indentUnit;
          else if (/^(if|unless|for|tablerow)$/.test(match[1]))
            state.indent += config.indentUnit;
          state.states.push("tag");
          return "keyword";
        }
        return tokenUntil(stream, state, /{{|{%/);

      case "object":
      case "tag": {
        match = stream.match(/^['"]/);
        if (match && typeof match != "boolean") {
          state.states.push("string");
          state.quoteKind = match[0];
          return "string";
        } else if (
          stream.match(last(state.states) == "object" ? /^}}/ : /^%}/)
        ) {
          state.states.pop();
        } else {
          stream.next();
        }
        return "keyword";
      }

      case "comment":
        if (stream.match(/^.*?{%-?\s*\/comment\s*-?%}/)) {
          state.indent -= config.indentUnit;
          state.states.pop();
        } else {
          stream.skipToEnd();
        }
        return "comment";

      case "raw":
        if (stream.match(/^{%-?\s*endraw\s*-?%}/)) {
          state.indent -= config.indentUnit;
          state.states.pop();
          return "keyword";
        }
        return tokenUntil(stream, state, /{%-?\s*endraw\s*-?%}/);

      case "string":
        match = stream.match(/^.*?(["']|\\[\s\S])/);
        if (!match) {
          stream.skipToEnd();
        } else if (typeof match == "boolean") {
        } else if (match[1] == state.quoteKind) {
          state.quoteKind = null;
          state.states.pop();
        }
        return "string";
    }
  },

  indent: function (state, textAfter, line) {
    let indent = state.indent,
      top = last(state.states);
    if (top == "comment" && /^{%-?\s*endcomment\s*-?%}/.test(textAfter))
      indent -= config.indentUnit;
    else if (top == "raw" && /^{%-?\s*endraw\s*-?%}/.test(textAfter))
      indent -= config.indentUnit;
    else if (top == undefined && /^{%-?\s*endcase/.test(textAfter))
      indent -= 2 * config.indentUnit;
    else if (top == undefined && /^{%-?\s*(when|end|els)/.test(textAfter))
      indent -= config.indentUnit;
    return indent + htmlMode.indent!(state.htmlState, textAfter, line)!;
  },
};
