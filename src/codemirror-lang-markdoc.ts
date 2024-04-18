import { LanguageSupport } from "@codemirror/language";
import { markdocLinterExtension } from "./markdoc-linter-extension";
import type { Config } from "@markdoc/markdoc";
import { html } from "@codemirror/lang-html";
import { closePercentBrace, liquid } from "@codemirror/lang-liquid";
import {
  liquidCompletionSource as patch__liquidCompletionSource,
  type LiquidCompletionConfig,
} from "./liquid-completion-patch";

/**
 * markcode CodeMirror Language Support extends from liquid which remove unused programming keyword (eg. if else loop)
 * @example
 * ```js
 *  new CodeMirror({
 *    lang: [
 *      markdoc(config)
 *    ]
 * })
 * ```
 *
 * ## limitation
 * can not use `{% if %}` `{% else /%}` `{% /if %}` because liquid syntax id endwhite `{% endif %}`
 */
export const markdoc = ({
  markdoc: markdocConfig = {},
  completion: liquidCompletion = {},
}: { markdoc?: Config; completion?: LiquidCompletionConfig } = {}) => {
  let base = html();
  let liqu = liquid({ base });
  let lang = liqu.language;
  return new LanguageSupport(lang, [
    lang.data.of({
      autocomplete: patch__liquidCompletionSource({
        tags: [
          ...(liquidCompletion.tags ?? []),
          ...Object.keys(markdocConfig.tags ?? {}).map((s) => ({ label: s })),
        ],
        variables: [
          ...(liquidCompletion.variables ?? []),
          ...Object.keys(markdocConfig.variables ?? {}).map((s) => ({
            label: s,
          })),
        ],
        filters: liquidCompletion.filters, // no filter in markdoc
        properties: liquidCompletion.properties,
      }),
    }),
    base.language.data.of({ closeBrackets: { brackets: ["{"] } }),
    closePercentBrace,
    markdocLinterExtension(markdocConfig),
  ]);
};
