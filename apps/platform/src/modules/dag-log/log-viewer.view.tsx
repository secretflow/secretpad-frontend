import * as monaco from 'monaco-editor';
import { useEffect, useRef, useState } from 'react';

import { useModel } from '@/util/valtio-helper';

import { DagLogService, LogTextMap } from './dag-log.service';
import './monaco-log';
import { Space, Tag } from 'antd';

export const LogLabel: React.FC = () => {
  const dagLogService = useModel(DagLogService);
  return (
    <Space style={{ height: 32 }}>
      平台日志
      <Tag color={LogTextMap[dagLogService.logTipContent.status]?.color}>
        {LogTextMap[dagLogService.logTipContent.status]?.text}
      </Tag>
    </Space>
  );
};

export const Log: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const dagLogService = useModel(DagLogService);
  const [logEditor] = useState<LogEditor>(new LogEditor());

  useEffect(() => {
    loadEditor();
    return () => {
      if (logEditor) {
        logEditor.disposeEditor();
      }
    };
  }, []);

  const loadEditor = async () => {
    if (editorRef && editorRef.current) {
      await logEditor.initEditor(editorRef.current, 'aaaa');
    }
  };

  useEffect(() => {
    logEditor?.editor?.setValue(dagLogService.logContent || '');
  }, [logEditor, dagLogService.logContent]);

  return <div ref={editorRef} style={{ height: '100%' }} />;
};

export class LogEditor {
  editor?: monaco.editor.IStandaloneCodeEditor;

  initEditor = async (node: HTMLElement, logs: string) => {
    const editor = monaco.editor.create(node, {
      value: logs,
      language: 'log',
      theme: 'logview',
      automaticLayout: true,
      suggestLineHeight: 18,
      minimap: {
        enabled: false,
      },
      fontSize: 12,
      lineHeight: 18,
      folding: true,
      wordWrap: 'on',
      lineDecorationsWidth: 0,
      lineNumbersMinChars: 4,
      readOnly: true,
      find: {
        seedSearchStringFromSelection: 'never',
        autoFindInSelection: 'never',
        addExtraSpaceOnTop: false,
      },
      contextmenu: false,
      wordBasedSuggestions: false,
      unicodeHighlight: {
        nonBasicASCII: false,
        invisibleCharacters: false,
        ambiguousCharacters: false,
        includeComments: false,
      },
    });

    this.editor = editor;
  };

  disposeEditor = () => {
    if (this.editor) {
      this.editor.dispose();
      this.editor = undefined;
    }
  };
}
