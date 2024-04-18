# codemirror-lang-markdoc

implement is extends from `liquid` and remove some functionality

[github](https://github.com/krist7599555/codemirror-lang-markdoc)

## V6

```typescript
import { EditorView } from "@codemirror/view";
import { markdoc } from "codemirror-lang-markdoc";

new EditorView({
  extensions: [
    markdoc({
      markdoc: {}, // Markdoc Config
      completion: {},
    }),
  ],
});
```

## V6 Legacy V5

```typescript
import { EditorView } from "@codemirror/view";
import { markdoc } from "codemirror-lang-markdoc/v5";
import { StreamLanguage } from "@codemirror/language";

new EditorView({
  extensions: [
    StreamLanguage.define(
      markdoc({
        markdoc: {}, // Markdoc Config
        completion: {},
      })
    ),
  ],
});
```
