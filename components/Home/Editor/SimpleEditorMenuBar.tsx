import { Editor } from '@tiptap/react'

export const SimpleEditorMenuBar: React.FC<{ editor: Editor }> = ({
  editor,
}) => {
  if (!editor) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center border-b border-[var(--primary)] px-1 pt-1 simple_toolbar bg-[var(--border-background)]">
      <button onClick={() => editor.chain().focus().toggleSuperscript().run()}>
        <i className="bi bi-superscript"></i>
      </button>
      <button onClick={() => editor.chain().focus().toggleSubscript().run()}>
        <i className="bi bi-subscript"></i>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`px-1  `}
      >
        <i
          className={`bi bi-type-bold text-lg ${
            editor.isActive('bold') && 'active'
          }`}
        ></i>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`px-1  `}
      >
        <i
          className={`bi bi-type-italic text-lg ${
            editor.isActive('italic') && 'active'
          }`}
        ></i>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`px-1  `}
      >
        <i
          className={`bi bi-type-strikethrough text-lg ${
            editor.isActive('strike') && 'active'
          }`}
        ></i>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        className={`px-1  `}
      >
        <i
          className={`bi bi-type-underline text-lg ${
            editor.isActive('underline') && 'active'
          }`}
        ></i>
      </button>
      <button
        className={`px-1  `}
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
      >
        <i className={`bi bi-eraser text-lg `}></i>
      </button>
      <button
        className={`px-1  `}
        onClick={() => editor.chain().focus().clearNodes().run()}
      >
        <i className={`bi bi-eraser-fill text-lg `}></i>
      </button>

      <button
        onClick={() => {
          const url = prompt('Enter URL:')
          if (url) {
            editor.chain().focus().setLink({ href: url }).run()
          }
        }}
        disabled={!editor.can().chain().focus().setLink({ href: '' }).run()}
        className="px-1"
      >
        <i className="bi bi-link text-lg"></i>
      </button>

      <button
        onClick={() => editor.chain().focus().unsetLink().run()}
        disabled={!editor.can().chain().focus().unsetLink().run()}
        className="px-1"
      >
        <i className="bi bi-link-45deg text-lg"></i>
      </button>

      <button
        className={`px-1  `}
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
      >
        <i className={`bi bi-arrow-counterclockwise text-lg `}></i>
      </button>
      <button
        className={`px-1  `}
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
      >
        <i className={`bi bi-arrow-clockwise text-lg `}></i>
      </button>
    </div>
  )
}
