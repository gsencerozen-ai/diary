'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { motion } from 'framer-motion';
import { Bold, Italic, List, ListOrdered, Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { memo } from 'react';
import clsx from 'clsx';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export const RichTextEditor = memo(function RichTextEditor({
  content,
  onChange,
  placeholder = 'Günlüğünüzü yazın...',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: 'mb-2',
          },
        },
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: {
            class: 'font-heading font-bold mb-2',
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc list-inside mb-2',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal list-inside mb-2',
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-warm-100 p-3 rounded font-mono text-sm mb-2 overflow-x-auto',
          },
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  if (!editor) {
    return null;
  }

  const toolbarButtons = [
    {
      icon: Bold,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
      label: 'Kalın (Ctrl+B)',
    },
    {
      icon: Italic,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      label: 'İtalik (Ctrl+I)',
    },
    {
      icon: List,
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
      label: 'Madde İşaretli Liste',
    },
    {
      icon: ListOrdered,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
      label: 'Numaralı Liste',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="border border-warm-300 rounded-lg overflow-hidden bg-white"
    >
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-3 border-b border-warm-200 bg-warm-50">
        {toolbarButtons.map((btn, idx) => {
          const Icon = btn.icon;
          return (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={btn.action}
              title={btn.label}
              aria-label={btn.label}
              className={clsx(
                'p-2 rounded transition-colors',
                btn.isActive
                  ? 'bg-terracotta-500 text-white'
                  : 'bg-white text-brown-700 hover:bg-warm-100'
              )}
            >
              <Icon className="h-4 w-4" />
            </motion.button>
          );
        })}

        <div className="flex-1" />

        {/* Undo/Redo */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => editor.chain().focus().undo().run()}
          title="Geri Al"
          aria-label="Geri Al"
          disabled={!editor.can().undo()}
          className="p-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-brown-700 hover:bg-warm-100"
        >
          <Undo2 className="h-4 w-4" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => editor.chain().focus().redo().run()}
          title="İleri Al"
          aria-label="İleri Al"
          disabled={!editor.can().redo()}
          className="p-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-brown-700 hover:bg-warm-100"
        >
          <Redo2 className="h-4 w-4" />
        </motion.button>
      </div>

      {/* Editor Content */}
      <div className="p-4 prose prose-sm max-w-none">
        <EditorContent
          editor={editor}
          className={clsx(
            'min-h-96 focus:outline-none text-brown-900',
            '[&_.ProseMirror]:focus:outline-none',
            '[&_.ProseMirror_p]:mb-2',
            '[&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mb-3',
            '[&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mb-2',
            '[&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-bold [&_.ProseMirror_h3]:mb-2',
            '[&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:list-inside [&_.ProseMirror_ul]:mb-2',
            '[&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:list-inside [&_.ProseMirror_ol]:mb-2',
            '[&_.ProseMirror_li]:mb-1',
            '[&_.ProseMirror_code]:bg-warm-100 [&_.ProseMirror_code]:px-2 [&_.ProseMirror_code]:py-1 [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:font-mono',
            '[&_.ProseMirror_pre]:bg-warm-100 [&_.ProseMirror_pre]:p-3 [&_.ProseMirror_pre]:rounded [&_.ProseMirror_pre]:overflow-x-auto'
          )}
        />
      </div>
    </motion.div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';
