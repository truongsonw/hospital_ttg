import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Link as TiptapLink } from '@tiptap/extension-link';
import { Image as TiptapImage } from '@tiptap/extension-image';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Table as TiptapTable } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Youtube as TiptapYoutube } from '@tiptap/extension-youtube';
import { CharacterCount } from '@tiptap/extension-character-count';
import { Placeholder } from '@tiptap/extension-placeholder';
import {
  Bold, Italic, Strikethrough,
  Heading1, Heading2, Heading3, Heading4,
  List, ListOrdered, ListChecks,
  Quote, Code, Code2,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link2Off, ImagePlus,
  Undo2, Redo2,
  RemoveFormatting, Highlighter,
  Minus, Columns, Rows3, Table2, Palette,
  Underline as LucideUnderline,
  Link as LucideLink,
  Subscript as LucideSubscript,
  Superscript as LucideSuperscript,
  Table as LucideTable,
  Video as LucideYoutube,
} from 'lucide-react';

interface Props {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const COLORS = [
  '#000000', '#374151', '#6B7280', '#EF4444', '#F97316',
  '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899',
];

const HIGHLIGHT_COLORS = [
  '#FEF08A', '#BBF7D0', '#BAE6FD', '#DDD6FE', '#FCA5A5', '#FED7AA',
];

export default function TiptapEditor({ value, onChange, placeholder = 'Nhập nội dung...', minHeight = 300 }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      TiptapLink.configure({ openOnClick: false }),
      TiptapImage.configure({ allowBase64: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      TiptapTable.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TiptapYoutube.configure({ width: 640, height: 480 }),
      CharacterCount,
      Placeholder.configure({ placeholder }),
    ],
    content: value ?? '',
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none px-4 py-3',
        style: `min-height: ${minHeight}px`,
      },
    },
  });

  if (!editor) return null;

  // ── Helpers ────────────────────────────────────────────────────────────────

  function btn(active: boolean, title?: string) {
    return {
      type: 'button' as const,
      title,
      className: `p-1.5 rounded hover:bg-muted transition-colors ${active ? 'bg-muted text-primary' : 'text-muted-foreground'}`,
    };
  }

  function addLink() {
    const prev = editor.getAttributes('link').href ?? '';
    const url = window.prompt('URL:', prev);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url, target: '_blank' }).run();
    }
  }

  function addImage() {
    const url = window.prompt('URL hình ảnh:');
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  }

  function addYoutube() {
    const url = window.prompt('YouTube URL:');
    if (!url) return;
    editor.commands.setYoutubeVideo({ src: url });
  }

  function insertTable() {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }

  // ── Divider ────────────────────────────────────────────────────────────────

  const D = () => <div className="w-px h-5 bg-border mx-0.5 self-center shrink-0" />;

  const charCount = editor.storage.characterCount?.characters?.() ?? 0;
  const wordCount = editor.storage.characterCount?.words?.() ?? 0;

  return (
    <div className="rounded-md border border-input bg-background overflow-hidden">
      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-input px-2 py-1.5 bg-muted/30">

        {/* History */}
        <button {...btn(false, 'Undo')} onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 className="size-4" />
        </button>
        <button {...btn(false, 'Redo')} onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 className="size-4" />
        </button>

        <D />

        {/* Text format */}
        <button {...btn(editor.isActive('bold'), 'Bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="size-4" />
        </button>
        <button {...btn(editor.isActive('italic'), 'Italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="size-4" />
        </button>
        <button {...btn(editor.isActive('underline'), 'Underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <LucideUnderline className="size-4" />
        </button>
        <button {...btn(editor.isActive('strike'), 'Strikethrough')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="size-4" />
        </button>
        <button {...btn(editor.isActive('subscript'), 'Subscript')} onClick={() => editor.chain().focus().toggleSubscript().run()}>
          <LucideSubscript className="size-4" />
        </button>
        <button {...btn(editor.isActive('superscript'), 'Superscript')} onClick={() => editor.chain().focus().toggleSuperscript().run()}>
          <LucideSuperscript className="size-4" />
        </button>
        <button {...btn(editor.isActive('code'), 'Inline code')} onClick={() => editor.chain().focus().toggleCode().run()}>
          <Code className="size-4" />
        </button>

        <D />

        {/* Color picker */}
        <div className="relative group">
          <button {...btn(false, 'Màu chữ')} className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground flex items-center gap-0.5">
            <Palette className="size-4" />
            <span
              className="w-2 h-2 rounded-full border border-border"
              style={{ backgroundColor: editor.getAttributes('textStyle').color ?? '#000' }}
            />
          </button>
          <div className="absolute left-0 top-full mt-1 z-50 hidden group-hover:flex flex-col gap-1 bg-popover border border-border rounded-md p-2 shadow-md">
            <p className="text-[10px] text-muted-foreground mb-1">Màu chữ</p>
            <div className="flex gap-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  title={c}
                  onClick={() => editor.chain().focus().setColor(c).run()}
                  className="w-5 h-5 rounded border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetColor().run()}
              className="text-[10px] text-muted-foreground hover:text-foreground mt-1 text-left"
            >
              Xóa màu
            </button>
          </div>
        </div>

        {/* Highlight picker */}
        <div className="relative group">
          <button {...btn(editor.isActive('highlight'), 'Nền màu')} className={`p-1.5 rounded hover:bg-muted transition-colors ${editor.isActive('highlight') ? 'bg-muted text-primary' : 'text-muted-foreground'}`}>
            <Highlighter className="size-4" />
          </button>
          <div className="absolute left-0 top-full mt-1 z-50 hidden group-hover:flex flex-col gap-1 bg-popover border border-border rounded-md p-2 shadow-md">
            <p className="text-[10px] text-muted-foreground mb-1">Màu nền</p>
            <div className="flex gap-1">
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  title={c}
                  onClick={() => editor.chain().focus().toggleHighlight({ color: c }).run()}
                  className="w-5 h-5 rounded border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetHighlight().run()}
              className="text-[10px] text-muted-foreground hover:text-foreground mt-1 text-left"
            >
              Xóa nền
            </button>
          </div>
        </div>

        <D />

        {/* Headings */}
        <button {...btn(editor.isActive('heading', { level: 1 }), 'H1')} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 className="size-4" />
        </button>
        <button {...btn(editor.isActive('heading', { level: 2 }), 'H2')} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="size-4" />
        </button>
        <button {...btn(editor.isActive('heading', { level: 3 }), 'H3')} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="size-4" />
        </button>
        <button {...btn(editor.isActive('heading', { level: 4 }), 'H4')} onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}>
          <Heading4 className="size-4" />
        </button>

        <D />

        {/* Lists */}
        <button {...btn(editor.isActive('bulletList'), 'Danh sách')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="size-4" />
        </button>
        <button {...btn(editor.isActive('orderedList'), 'Danh sách số')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="size-4" />
        </button>
        <button {...btn(editor.isActive('taskList'), 'Danh sách checkbox')} onClick={() => editor.chain().focus().toggleTaskList().run()}>
          <ListChecks className="size-4" />
        </button>
        <button {...btn(editor.isActive('blockquote'), 'Blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="size-4" />
        </button>
        <button {...btn(editor.isActive('codeBlock'), 'Code block')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <Code2 className="size-4" />
        </button>

        <D />

        {/* Alignment */}
        <button {...btn(editor.isActive({ textAlign: 'left' }), 'Căn trái')} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          <AlignLeft className="size-4" />
        </button>
        <button {...btn(editor.isActive({ textAlign: 'center' }), 'Căn giữa')} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          <AlignCenter className="size-4" />
        </button>
        <button {...btn(editor.isActive({ textAlign: 'right' }), 'Căn phải')} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
          <AlignRight className="size-4" />
        </button>
        <button {...btn(editor.isActive({ textAlign: 'justify' }), 'Căn đều')} onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
          <AlignJustify className="size-4" />
        </button>

        <D />

        {/* Link / Image / Youtube / HR */}
        <button {...btn(editor.isActive('link'), 'Chèn link')} onClick={addLink}>
          <LucideLink className="size-4" />
        </button>
        {editor.isActive('link') && (
          <button {...btn(false, 'Xóa link')} onClick={() => editor.chain().focus().unsetLink().run()}>
            <Link2Off className="size-4" />
          </button>
        )}
        <button {...btn(false, 'Chèn hình')} onClick={addImage}>
          <ImagePlus className="size-4" />
        </button>
        <button {...btn(false, 'Chèn YouTube')} onClick={addYoutube}>
          <LucideYoutube className="size-4" />
        </button>
        <button {...btn(false, 'Đường kẻ ngang')} onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="size-4" />
        </button>

        <D />

        {/* Table */}
        <button {...btn(false, 'Chèn bảng')} onClick={insertTable}>
          <LucideTable className="size-4" />
        </button>
        {editor.isActive('table') && (
          <>
            <button {...btn(false, 'Thêm cột phải')} onClick={() => editor.chain().focus().addColumnAfter().run()}>
              <Columns className="size-4" />
            </button>
            <button {...btn(false, 'Thêm hàng dưới')} onClick={() => editor.chain().focus().addRowAfter().run()}>
              <Rows3 className="size-4" />
            </button>
            <button {...btn(false, 'Xóa cột')} onClick={() => editor.chain().focus().deleteColumn().run()}>
              <Columns className="size-4" />
            </button>
            <button {...btn(false, 'Xóa hàng')} onClick={() => editor.chain().focus().deleteRow().run()}>
              <Rows3 className="size-4" />
            </button>
            <button {...btn(false, 'Xóa bảng')} onClick={() => editor.chain().focus().deleteTable().run()}>
              <Table2 className="size-4" />
            </button>
          </>
        )}

        <D />

        {/* Clear */}
        <button {...btn(false, 'Xóa định dạng')} onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
          <RemoveFormatting className="size-4" />
        </button>
      </div>

      {/* ── Editor content ──────────────────────────────────────────────────── */}
      <EditorContent editor={editor} />

      {/* ── Footer: word / char count ────────────────────────────────────────── */}
      <div className="flex justify-end gap-3 px-4 py-1.5 border-t border-input bg-muted/20 text-[11px] text-muted-foreground">
        <span>{wordCount} từ</span>
        <span>{charCount} ký tự</span>
      </div>
    </div>
  );
}
