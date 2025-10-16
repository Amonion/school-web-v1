import React from 'react'
import CustomTextStyle from '@/src/types/TextStyle'
import FontSize from '@/src/types/FontSize'
import { useEffect, useRef } from 'react'
import { MathNode } from '@/src/types/Equation'
import { Color } from '@tiptap/extension-color'
import ListItem from '@tiptap/extension-list-item'
import TextStyle from '@tiptap/extension-text-style'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import Highlight from '@tiptap/extension-highlight'
import Dropcursor from '@tiptap/extension-dropcursor'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import { SimpleEditorMenuBar } from './SimpleEditorMenuBar'

const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-background-color'),
        renderHTML: (attributes) => {
          return {
            'data-background-color': attributes.backgroundColor,
            style: `background-color: ${attributes.backgroundColor}`,
          }
        },
      },
    }
  },
})

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
        parseHTML: (element) => element.getAttribute('src'), // Ensure 'src' is extracted correctly
        renderHTML: (attributes) => {
          return {
            src: attributes.src, // Make sure this is correctly set when updating
          }
        },
      },
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute('width'),
        renderHTML: (attributes) => {
          if (!attributes.width) return {}
          return { width: attributes.width }
        },
      },
      height: {
        default: null,
        parseHTML: (element) => element.getAttribute('height'),
        renderHTML: (attributes) => {
          if (!attributes.height) return {}
          return { height: attributes.height }
        },
      },
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute('style'),
        renderHTML: (attributes) => {
          if (!attributes.style) return {}
          return { style: attributes.style }
        },
      },
    }
  },
})

const AlignableImage = ResizableImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      alignment: {
        default: 'center',
        parseHTML: (element) => element.style.float || 'center',
        renderHTML: (attributes) => {
          return { style: `float: ${attributes.alignment};` }
        },
      },
    }
  },
})

const extensions = [
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },
  }),
  Table.configure({
    resizable: true,
  }),
  FontSize,
  TableRow,
  TableHeader,
  CustomTableCell,
  CustomTextStyle,
  Link.configure({
    openOnClick: true,
    HTMLAttributes: {
      rel: 'noopener noreferrer',
      target: '_blank',
    },
  }),
  Superscript,
  Subscript,
  Placeholder.configure({
    placeholder: 'Write something …',
  }),
  Image,
  AlignableImage,
  Dropcursor,
  Underline,
  TextAlign.configure({ types: ['paragraph', 'heading'] }),
  Highlight.configure({ multicolor: true }),
  MathNode,
]

interface MyEditorProps {
  value: string
  onChange: (
    value: string,
    delta: unknown,
    source: string,
    editor: unknown
  ) => void
}

interface MyEditorProps {
  value: string
  onChange: (
    value: string,
    delta: unknown,
    source: string,
    editor: unknown
  ) => void
}

const PostEditor: React.FC<MyEditorProps> = ({ value, onChange }) => {
  const editorContainerRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: extensions,
    immediatelyRender: false,
    content: value || '',
    onUpdate: ({ editor }) => {
      const content = editor.getHTML().replace(/\n/g, '<br><br>')
      onChange(content, { ops: [] }, 'user', editor)
    },
  })

  useEffect(() => {
    if (editor && editorContainerRef.current) {
      editorContainerRef.current.appendChild(editor.view.dom)
    }
  }, [editor])

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value || '')
      editor.view.updateState(editor.view.state)
    }
  }, [value, editor])

  return (
    <div className="mb-3 simple_post">
      {editor && <SimpleEditorMenuBar editor={editor} />}
      <div ref={editorContainerRef} id="editor" />
    </div>
  )
}

export default PostEditor
