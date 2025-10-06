import { useState } from "react";
import { SketchPicker } from "react-color";
import { Editor } from "@tiptap/react";

export const MenuBar: React.FC<{ editor: Editor }> = ({ editor }) => {
  //   const { editor } = useCurrentEditor();
  const [showHeadingDropdown, setShowHeadingDropdown] = useState(false);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [isTextColor, toggleTextColor] = useState(false);
  const [isBackground, toggleBackground] = useState(false);
  const [color, setColor] = useState("#FF5733");
  const [newColor, setHighlight] = useState("#FF5733");

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  const addImage = () => {
    const url = window.prompt("URL");

    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const upload = (file: File) => {
    if (editor && file) {
      const reader = new FileReader();

      reader.onload = () => {
        const base64Image = reader.result;
        editor
          .chain()
          .focus()
          .setImage({ src: String(base64Image) })
          .run();
      };

      reader.readAsDataURL(file);
    }
  };

  const setImageWidth = () => {
    const width = window.prompt("Enter width (e.g., 300px):");
    if (width && editor) {
      editor.chain().focus().updateAttributes("image", { width }).run();
    }
  };

  const setImageAlignment = (alignment: string) => {
    if (editor) {
      editor.chain().focus().updateAttributes("image", { alignment }).run();
    }
  };

  const addEquation = () => {
    const equation = window.prompt(
      "Enter LaTeX equation. NB: x = \frac{-b pm sqrt{b^2 - 4ac}}{2a}"
    );
    if (equation && editor) {
      editor
        .chain()
        .focus()
        .insertContent(
          `<span data-type="math" data-content="${equation}"></span>`
        )
        .run();
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center space-x-4 border border-[var(--border-color)] p-2 rounded-lg shadow-md tiptap-toolbar bg-[var(--border-background)]">
      <div className="tiptap_tools">
        <button
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
        >
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
              editor.isActive("bold") && "active"
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
              editor.isActive("italic") && "active"
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
              editor.isActive("strike") && "active"
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
              editor.isActive("underline") && "active"
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
        {/* <select
    onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
  >
    <option value="12px">12px</option>
    <option value="14px">14px</option>
    <option value="16px">16px</option>
    <option value="18px">18px</option>
    <option value="20px">20px</option>
  </select> */}
      </div>

      <div className="tiptap_tools">
        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          disabled={!editor.can().chain().focus().setTextAlign("left").run()}
          className={`px-1  `}
        >
          <i
            className={`bi bi-text-left text-lg ${
              editor.isActive("left") && "active"
            }`}
          ></i>
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          disabled={!editor.can().chain().focus().setTextAlign("center").run()}
          className={`px-1  `}
        >
          <i
            className={`bi bi-text-center text-lg ${
              editor.isActive("center") && "active"
            }`}
          ></i>
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          disabled={!editor.can().chain().focus().setTextAlign("right").run()}
          className={`px-1  `}
        >
          <i
            className={`bi bi-text-right text-lg ${
              editor.isActive("right") && "active"
            }`}
          ></i>
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          disabled={!editor.can().chain().focus().setTextAlign("justify").run()}
          className={`px-1  `}
        >
          <i
            className={`bi bi-justify text-lg ${
              editor.isActive("justify") && "active"
            }`}
          ></i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1 `}
        >
          <i
            className={`bi bi-list-task text-lg ${
              editor.isActive("bulletList") && "active"
            }`}
          ></i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1 `}
        >
          <i
            className={`bi bi-list-ol text-lg ${
              editor.isActive("bulletList") && "active"
            }`}
          ></i>
        </button>
      </div>

      <div className="relative mb-2">
        <button
          onClick={() => setShowHeadingDropdown(!showHeadingDropdown)}
          className="px-3 py-1 tip-title hover:active"
        >
          Headings
        </button>
        {showHeadingDropdown && (
          <div className="absolute z-10 mt-1 tip-drop  rounded shadow-lg">
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <button
                key={level}
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 })
                    .run()
                }
                className={`block w-full px-4 py-2 text-left hover:bg-slate-600 ${
                  editor.isActive("heading", {
                    level: level as 1 | 2 | 3 | 4 | 5 | 6,
                  })
                    ? "active text-white"
                    : ""
                }`}
              >
                H{level}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="tiptap_tools">
        <button
          className="p-1"
          onClick={() => {
            const inputElement = document.getElementById("imageUpload");
            if (inputElement) {
              (inputElement as HTMLInputElement).click();
            }
          }}
        >
          <i className="bi bi-cloud-arrow-up"></i>
          <input
            id="imageUpload"
            type="file"
            className="input-file file file-input"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(event) => {
              const files = event.target.files;
              if (files && files[0]) {
                const file = files[0];
                upload(file);
              }
            }}
          />
        </button>
        <button className="p-1" onClick={addImage}>
          <i className="bi bi-image"></i>
        </button>

        <button className="p-1" onClick={setImageWidth}>
          {" "}
          <i className="bi bi-aspect-ratio"></i>
        </button>
        <button className="p-1" onClick={() => setImageAlignment("left")}>
          <i className="bi bi-image"></i>
          <i className="bi bi-blockquote-right"></i>
        </button>
        <button className="p-1" onClick={() => setImageAlignment("center")}>
          <i className="bi bi-justify"></i>
        </button>

        <button className="p-1" onClick={() => setImageAlignment("right")}>
          <i className="bi bi-blockquote-left"></i>
          <i className="bi bi-image"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          disabled={!editor.can().chain().focus().toggleBlockquote().run()}
          className={`px-1  `}
        >
          <i
            className={`bi bi-quote text-lg ${
              editor.isActive("blockquote") && "active"
            }`}
          ></i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          disabled={!editor.can().chain().focus().toggleCodeBlock().run()}
          className={`px-1  `}
        >
          <i
            className={`bi bi-code text-lg ${
              editor.isActive("codeBlock") && "active"
            }`}
          ></i>
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          disabled={!editor.can().chain().focus().setHorizontalRule().run()}
          className={`px-1  `}
        >
          <i
            className={`bi bi-dash-lg text-lg ${
              editor.isActive("codeBlock") && "active"
            }`}
          ></i>
        </button>

        <button
          onClick={() => {
            const url = prompt("Enter URL:");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          disabled={!editor.can().chain().focus().setLink({ href: "" }).run()}
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

      <button onClick={addEquation}>
        <i className="bi bi-calculator"></i>
      </button>

      <div className="color-picker relative">
        <button onClick={() => toggleTextColor((prevState) => !prevState)}>
          <i className={`bi bi-palette text-lg `}></i>
        </button>
        {isTextColor && (
          <SketchPicker
            className="absolute right-0 top-7 z-10"
            color={color}
            onChangeComplete={(newColor) => {
              setColor(newColor.hex);
              editor.chain().focus().setColor(newColor.hex).run(); // Set text color
            }}
          />
        )}
      </div>

      <div className="color-picker relative">
        <button onClick={() => toggleBackground((prevState) => !prevState)}>
          <i className={`bi bi-brush text-lg `}></i>
        </button>
        {isBackground && (
          <SketchPicker
            className="absolute right-0 top-7 z-10"
            color={newColor}
            onChangeComplete={(newColor) => {
              setHighlight(newColor.hex);
              editor
                .chain()
                .focus()
                .setHighlight({ color: newColor.hex })
                .run();
            }}
          />
        )}
      </div>

      <div className="control-group relative">
        <button
          className="p-1"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          <i className={`bi bi-table text-lg`}></i>
        </button>

        {/* Dropdown Toggle Button */}
        <button className="p-1 ml-2" onClick={toggleDropdown}>
          <i className="bi bi-three-dots-vertical text-lg"></i>
        </button>

        {/* Dropdown */}
        {isDropdownVisible && (
          <div className="absolute tip-tb flex-col top-full right-0 mt-2 w-64 max-h-64 overflow-auto shadow-lg border rounded-md p-2 z-10">
            <button
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              disabled={!editor.can().addColumnBefore()}
            >
              Add column before
            </button>
            <button
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              disabled={!editor.can().addColumnAfter()}
            >
              Add column after
            </button>
            <button
              onClick={() => editor.chain().focus().deleteColumn().run()}
              disabled={!editor.can().deleteColumn()}
            >
              Delete column
            </button>
            <button
              onClick={() => editor.chain().focus().addRowBefore().run()}
              disabled={!editor.can().addRowBefore()}
            >
              Add row before
            </button>
            <button
              onClick={() => editor.chain().focus().addRowAfter().run()}
              disabled={!editor.can().addRowAfter()}
            >
              Add row after
            </button>
            <button
              onClick={() => editor.chain().focus().deleteRow().run()}
              disabled={!editor.can().deleteRow()}
            >
              Delete row
            </button>
            <button
              onClick={() => editor.chain().focus().deleteTable().run()}
              disabled={!editor.can().deleteTable()}
            >
              Delete table
            </button>
            <button
              onClick={() => editor.chain().focus().mergeCells().run()}
              disabled={!editor.can().mergeCells()}
            >
              Merge cells
            </button>
            <button
              onClick={() => editor.chain().focus().splitCell().run()}
              disabled={!editor.can().splitCell()}
            >
              Split cell
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
              disabled={!editor.can().toggleHeaderColumn()}
            >
              ToggleHeaderColumn
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeaderRow().run()}
              disabled={!editor.can().toggleHeaderRow()}
            >
              Toggle header row
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeaderCell().run()}
              disabled={!editor.can().toggleHeaderCell()}
            >
              Toggle header cell
            </button>
            <button
              onClick={() => editor.chain().focus().mergeOrSplit().run()}
              disabled={!editor.can().mergeOrSplit()}
            >
              Merge or split
            </button>
            <button
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .setCellAttribute("backgroundColor", "#FAF594")
                  .run()
              }
              disabled={
                !editor.can().setCellAttribute("backgroundColor", "#FAF594")
              }
            >
              Set cell attribute
            </button>
            <button
              onClick={() => editor.chain().focus().fixTables().run()}
              disabled={!editor.can().fixTables()}
            >
              Fix tables
            </button>
            <button
              onClick={() => editor.chain().focus().goToNextCell().run()}
              disabled={!editor.can().goToNextCell()}
            >
              Go to next cell
            </button>
            <button
              onClick={() => editor.chain().focus().goToPreviousCell().run()}
              disabled={!editor.can().goToPreviousCell()}
            >
              Go to previous cell
            </button>
            {/* Add the rest of the buttons in a similar manner */}
          </div>
        )}
      </div>
    </div>
  );
};
