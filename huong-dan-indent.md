# Hướng dẫn thêm Extension Indent (Tab/Shift-Tab) cho Tiptap

## Giới thiệu
Extension tùy chỉnh cho Tiptap hỗ trợ thụt lề/thụt vào bằng phím **Tab** (indent) và **Shift+Tab** (outdent). Tự động xử lý danh sách và paragraph/heading với margin-left.

## Tính năng
- **Tab**: Thụt vào (tăng indent)
- **Shift+Tab**: Lùi ra (giảm indent) 
- **Backspace** (đầu dòng): Lùi ra
- **Cmd/Ctrl + ]**: Thụt vào
- **Cmd/Ctrl + [**: Lùi ra
- Tự động `sinkListItem`/`liftListItem` trong danh sách

## Cài đặt

### 1. Tạo file `Indent.ts`
```typescript
// src/extensions/Indent.ts
import { Extension } from '@tiptap/core'
import { TextSelection } from 'prosemirror-state'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    indent: {
      indent: () => ReturnType
      outdent: () => ReturnType
    }
  }
}

export const Indent = Extension.create({
  name: 'indent',

  addGlobalAttributes() {
    return [{
      types: ['paragraph', 'heading', 'blockquote'],
      attributes: {
        indent: {
          default: 0,
          renderHTML: attributes => ({
            style: `margin-left: ${attributes.indent * 40}px`
          }),
          parseHTML: element => {
            const style = element.getAttribute('style') || ''
            const match = style.match(/margin-left:\s*(\d+)px/)
            return match ? Math.round(parseInt(match[1]) / 40) : 0
          }
        }
      }
    }]
  },

  addCommands() {
    return {
      indent: () => ({ editor, commands }) => {
        if (editor.isActive('listItem')) {
          return commands.sinkListItem('listItem')
        }
        const currentIndent = editor.getAttributes('paragraph').indent as number
        return commands.setNodeMarkup(editor.state.selection.$anchor.parent.type.name, {
          indent: Math.min(currentIndent + 1, 8)
        })
      },

      outdent: () => ({ editor, commands }) => {
        if (editor.isActive('listItem')) {
          return commands.liftListItem('listItem')
        }
        const currentIndent = editor.getAttributes('paragraph').indent as number
        if (currentIndent > 0) {
          return commands.setNodeMarkup(editor.state.selection.$anchor.parent.type.name, {
            indent: Math.max(currentIndent - 1, 0)
          })
        }
        return false
      }
    }
  },

  addKeyboardShortcuts() {
    return {
      'Tab': () => this.editor.commands.indent(),
      'Shift-Tab': () => this.editor.commands.outdent(),
      'Backspace': () => {
        const { $anchor } = this.editor.state.selection
        if ($anchor.parentOffset === 0 && $anchor.parent.textContent.length > 0) {
          return this.editor.commands.outdent()
        }
        return false
      },
      'Mod-]': () => this.editor.commands.indent(),
      'Mod-[': () => this.editor.commands.outdent()
    }
  }
})
```

### 2. Thêm vào Editor
```typescript
// src/Editor.tsx
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Indent from './extensions/Indent'

const editor = new Editor({
  extensions: [
    StarterKit,
    Indent
  ],
  content: '<p>Nhấn Tab để thụt vào...</p>'
})
```

### 3. CSS hỗ trợ (tùy chọn)
```scss
/* src/styles/editor.scss */
.ProseMirror {
  [style*="margin-left"] {
    transition: margin-left 0.15s ease;
  }
  
  .ProseMirror-selectednode {
    outline: 2px solid #0066ff;
  }
}
```

## Cấu trúc thư mục
```
src/
├── extensions/
│   └── Indent.ts
├── Editor.tsx
└── styles/
    └── editor.scss
```

## Kiểm tra hoạt động
1. Nhấn **Tab** → margin-left tăng 40px
2. **Shift+Tab** → margin-left giảm 40px  
3. Trong danh sách → tự động nest/unnest
4. **Backspace** đầu dòng → outdent

## Troubleshooting

| Vấn đề | Giải pháp |
|--------|-----------|
| Tab không hoạt động | Kiểm tra `addKeyboardShortcuts()` |
| List không nest | Đảm bảo `StarterKit` có `BulletList`, `OrderedList` |
| Margin không hiện | Thêm `!important` vào CSS |
| ParseHTML lỗi | Debug `parseHTML` function |

## Nâng cao
- Thay `40px` bằng `3rem` cho responsive
- Thêm `maxLevel: 8` giới hạn indent
- Tích hợp `data-indent` thay style inline

## Tham khảo
- [Tiptap Keyboard Shortcuts](https://tiptap.dev/docs/editor/core-concepts/keyboard-shortcuts)
- [Indent Extension Issue #1036](https://github.com/ueberdosis/tiptap/issues/1036)
