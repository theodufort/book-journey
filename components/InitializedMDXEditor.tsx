"use client";
// InitializedMDXEditor.tsx
import type { ForwardedRef } from "react";
import {
  headingsPlugin,
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CreateLink,
  linkDialogPlugin,
  linkPlugin,
  ListsToggle,
  toolbarPlugin,
  UndoRedo,
  listsPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
// Only import this to the next file
export default function InitializedMDXEditor({
  editorRef,
  ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
  return (
    <MDXEditor
      plugins={[
        linkPlugin(),
        linkDialogPlugin(),
        headingsPlugin(),
        listsPlugin(),
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <UndoRedo />
              <BoldItalicUnderlineToggles />
              <BlockTypeSelect />
              <CreateLink />
              <ListsToggle />
            </>
          ),
        }),
      ]}
      {...props}
      ref={editorRef}
    />
  );
}
