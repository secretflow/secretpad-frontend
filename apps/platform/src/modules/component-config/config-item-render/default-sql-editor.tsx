import { Form } from 'antd';
import * as monaco from 'monaco-editor';
import type { FC } from 'react';
import { useEffect, useRef } from 'react';

import styles from '../index.less';

import type { RenderProp } from './config-render-protocol';

interface SQLEditorProps {
  value: string;
  onChange: (val: string) => void;
}

const SQLEditor: FC<SQLEditorProps> = (props) => {
  const { value = '', onChange } = props;
  const editorRef = useRef<HTMLDivElement>(null);
  const editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleValueChange = () => {
    editor?.current?.onDidChangeModelContent(() => {
      const editedValue = editor?.current?.getValue();
      if (editedValue && editedValue !== value) {
        onChange(editedValue);
      }
    });
  };

  const initEditor = () => {
    if (editorRef?.current) {
      const monacoEditor = monaco.editor.create(editorRef?.current, {
        value,
        language: 'sql',
        automaticLayout: true,
        minimap: { enabled: false },
        readOnly: false,
        folding: true,
        wordWrap: 'on',
        lineDecorationsWidth: 0,
        lineNumbersMinChars: 2,
      });

      editor.current = monacoEditor;
      handleValueChange();
    }
  };

  const disposeEditor = () => {
    if (editor?.current) {
      editor.current.dispose();
      editor.current = null;
    }
  };

  useEffect(() => {
    initEditor();

    return () => {
      disposeEditor();
    };
  }, []);

  useEffect(() => {
    if (editor?.current) {
      const model = editor.current.getModel();
      if (model) {
        editor.current.pushUndoStop();
        model.pushEditOperations(
          [],
          [
            {
              range: model.getFullModelRange(),
              text: value,
            },
          ],
          () => null,
        );
        editor.current.pushUndoStop();
      }
    }
  }, [value]);

  return <div ref={editorRef} style={{ height: '320px' }} />;
};

export const DefaultSQLEditor: React.FC<RenderProp<string>> = (config) => {
  const { onChange, value, defaultVal, node, translation } = config;

  let name = translation[node.name] || node.name;
  const { prefixes } = node;
  if (prefixes && prefixes[0] === 'input') {
    if (prefixes[1]) name = `${translation[prefixes[1]] || prefixes[1]} ${name}`;
  }

  return (
    <Form.Item
      label={<div className={styles.configItemLabel}>{name}</div>}
      name={
        node.prefixes && node.prefixes.length > 0
          ? node.prefixes.join('/') + '/' + node.name
          : node.name
      }
      tooltip={translation[node.docString] || node.docString}
      rules={[
        {
          required: node.isRequired,
        },
      ]}
      initialValue={defaultVal}
      colon={false}
      messageVariables={{ label: translation[node.name] || node.name }}
    >
      <SQLEditor value={value} onChange={onChange} />
    </Form.Item>
  );
};
