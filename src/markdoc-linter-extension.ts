import { linter, type Diagnostic } from "@codemirror/lint";
import Markdoc, { type Config as MarkdocConfig } from "@markdoc/markdoc";

type LintConfig = NonNullable<Parameters<typeof linter>[1]>;

/** Show Markdoc Error in CodeMirror tooltip
 * @example
 * ```js
 * import { StreamLanguage } from '@codemirror/language';
 * import { markdocLegacy } from './markdoc-legacy';
 * new CodeMirror({
 *    extensions: [
 *      StreamLanguage.define(markdocLegacy),
 *      markdocLinter(markdocConfig)
 *    ]
 * })
 * ```
 */
export const markdocLinterExtension = (
  markdocConfig: MarkdocConfig,
  lintConfig: LintConfig = {}
) =>
  linter(
    (view) => {
      const doc = view.state.doc;
      const docPos = (line: number, char: number = 0) => {
        try {
          return doc.line(line + 1).from + char;
        } catch (err) {
          return doc.line(line).to + char;
        }
      };

      const ast = Markdoc.parse(doc.toString());
      const errors = Markdoc.validate(ast, markdocConfig);
      return errors.map((err): Diagnostic => {
        const { start, end } = err.location ?? {
          start: { line: 0 },
          end: { line: 1 },
        };
        return {
          from: docPos(start.line, start.character),
          to: docPos(end.line, end.character),
          // prettier-ignore
          severity: 
            err.error.level === 'critical' ? 'error' as const :
            err.error.level === 'debug' ? 'hint' as const :
            err.error.level,
          message: err.error.message,
          actions: [],
        };
      });
    },
    {
      tooltipFilter(diagnostics, state) {
        return diagnostics.map((i) => i);
      },
      ...lintConfig,
    }
  );
