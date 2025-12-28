'use client';

import { useEffect } from 'react';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import StarterKit from '@tiptap/starter-kit';
import { EditorContent, useEditor } from '@tiptap/react';
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Undo,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  onUploadImage?: (file: File) => Promise<{ url: string; alt?: string }>;
}

const ToolbarButton = ({
  active,
  disabled,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    disabled={disabled}
    onClick={onClick}
    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
      disabled
        ? 'cursor-not-allowed opacity-50'
        : active
          ? 'border-primary/40 bg-primary/10 text-primary'
          : 'border-border bg-surface text-muted hover:text-foreground hover:border-foreground/40'
    }`}
  >
    {children}
  </button>
);

export function RichTextEditor({ value, onChange, placeholder, onUploadImage }: RichTextEditorProps) {
  const editor = useEditor({
    // TipTap warns when SSR/hydration is detected in Next.js.
    // This prevents mismatches by waiting until client hydration to render.
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Write something…',
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class:
          'blog-prose focus:outline-none min-h-[280px] px-4 py-3 text-foreground',
      },
    },
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
  });

  // keep editor in sync if parent resets value
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [value, editor]);

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Enter URL', previousUrl ?? '');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const insertImageByUrl = () => {
    if (!editor) return;
    const url = window.prompt('Enter image URL');
    if (!url) return;
    const alt = window.prompt('Alt text (optional)') ?? undefined;
    editor.chain().focus().setImage({ src: url, alt }).run();
  };

  const uploadAndInsertImage = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file || !editor) return;
    if (!onUploadImage) {
      insertImageByUrl();
      return;
    }
    const uploaded = await onUploadImage(file);
    editor.chain().focus().setImage({ src: uploaded.url, alt: uploaded.alt }).run();
  };

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-sm">
      <div className="flex flex-wrap gap-2 border-b border-border p-3">
        <ToolbarButton
          label="Bold"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          disabled={!editor?.can().chain().focus().toggleBold().run()}
          active={editor?.isActive('bold')}
        >
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          disabled={!editor?.can().chain().focus().toggleItalic().run()}
          active={editor?.isActive('italic')}
        >
          <Italic size={14} />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 2"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor?.isActive('heading', { level: 2 })}
        >
          <Heading2 size={14} />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 3"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor?.isActive('heading', { level: 3 })}
        >
          <Heading3 size={14} />
        </ToolbarButton>
        <ToolbarButton
          label="Bullet list"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          active={editor?.isActive('bulletList')}
        >
          <List size={14} />
        </ToolbarButton>
        <ToolbarButton
          label="Ordered list"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          active={editor?.isActive('orderedList')}
        >
          <ListOrdered size={14} />
        </ToolbarButton>
        <ToolbarButton
          label="Blockquote"
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          active={editor?.isActive('blockquote')}
        >
          <Quote size={14} />
        </ToolbarButton>
        <ToolbarButton label="Link" onClick={setLink} active={editor?.isActive('link')}>
          <Link2 size={14} />
        </ToolbarButton>

        <input
          id="rte-image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            uploadAndInsertImage(e.target.files);
            e.target.value = '';
          }}
        />
        <ToolbarButton
          label={onUploadImage ? 'Upload image' : 'Insert image'}
          onClick={() => document.getElementById('rte-image-upload')?.click() || insertImageByUrl()}
        >
          <ImageIcon size={14} />
        </ToolbarButton>

        <ToolbarButton
          label="Strike"
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          active={editor?.isActive('strike')}
        >
          <Strikethrough size={14} />
        </ToolbarButton>

        <ToolbarButton
          label="Code"
          onClick={() => editor?.chain().focus().toggleCode().run()}
          active={editor?.isActive('code')}
        >
          <Code size={14} />
        </ToolbarButton>

        <ToolbarButton
          label="Undo"
          onClick={() => editor?.chain().focus().undo().run()}
          disabled={!editor?.can().chain().focus().undo().run()}
        >
          <Undo size={14} />
        </ToolbarButton>

        <ToolbarButton
          label="Redo"
          onClick={() => editor?.chain().focus().redo().run()}
          disabled={!editor?.can().chain().focus().redo().run()}
        >
          <Redo size={14} />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}

export default RichTextEditor;


