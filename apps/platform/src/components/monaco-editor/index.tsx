import {
  FullscreenOutlined,
  FullscreenExitOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useFullscreen } from 'ahooks';
import { Button, Space, Tooltip } from 'antd';
import classNames from 'classnames';
import * as Monaco from 'monaco-editor';
import { language as pythonLanguage } from 'monaco-editor/esm/vs/basic-languages/python/python.js';
import type { FC } from 'react';
import { useEffect, useRef } from 'react';

import redoIcon from '@/assets/redo.svg';
import undoIcon from '@/assets/undo.svg';

import styles from './index.less';

// import type { RenderProp } from './config-render-protocol';

interface PythonEditorProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  name?: string;
  tooltip?: string;
}

// const outputTypeSuggestions = [
//   {
//     label: 'fedTable',
//     insertText: 'fedTable_',
//     detail: '联合表',
//   },
//   {
//     label: 'model',
//     insertText: 'model_',
//     detail: '模型',
//   },
//   {
//     label: 'rule',
//     insertText: 'rule_',
//     detail: '规则',
//   },
// ];

export const PythonEditor: FC<PythonEditorProps> = (props) => {
  const { value = '', onChange, disabled = false, name, tooltip } = props;
  const editorRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef(null);
  const monacoSuggestion = useRef<any>(null);
  const [isFullscreen, { enterFullscreen, exitFullscreen }] =
    useFullscreen(fullscreenRef);
  const editor = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

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
      const monacoEditor = Monaco.editor.create(editorRef?.current, {
        language: 'python',
        value,
        readOnly: disabled,
        contextmenu: false,
        suggestLineHeight: 24,
        formatOnPaste: true,
        automaticLayout: true,
        minimap: { enabled: false },
        lineHeight: 20,
        folding: true,
        wordWrap: 'on',
        lineDecorationsWidth: 0,
        lineNumbersMinChars: 1,
        suggestSelection: 'first',
        wordBasedSuggestions: false,
        suggest: { snippetsPreventQuickSuggestions: false },
        autoClosingQuotes: 'always',
        autoDetectHighContrast: false,
        quickSuggestions: false,
        hover: {
          enabled: false,
        },
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
    if (monacoSuggestion?.current) {
      monacoSuggestion.current.dispose();
      monacoSuggestion.current = null;
    }
  };

  useEffect(() => {
    if (editor.current) {
      editor.current?.updateOptions({
        quickSuggestions: isFullscreen,
        contextmenu: isFullscreen,
      });
    }
    if (isFullscreen) {
      monacoSuggestion.current = Monaco.languages.registerCompletionItemProvider(
        'python',
        {
          provideCompletionItems(
            model: any,
            position: { lineNumber: number; column: number },
          ) {
            const suggestions = [];
            pythonLanguage.keywords.forEach((item) => {
              suggestions.push({
                label: item,
                kind: Monaco.languages.CompletionItemKind.Keyword,
                insertText: item,
              });
            });
            return {
              suggestions: suggestions,
            };
          },
          // triggerCharacters: ['.'],
        },
      );
    } else {
      if (monacoSuggestion.current) {
        monacoSuggestion.current?.dispose();
      }
    }
  }, [isFullscreen]);

  useEffect(() => {
    initEditor();

    return () => {
      disposeEditor();
    };
  }, []);

  const undo = () => {
    if (editor && editor?.current) {
      editor.current.trigger('', 'undo', '');
    }
  };

  const redo = () => {
    if (editor && editor?.current) {
      editor.current.trigger('', 'redo', '');
    }
  };

  const handleFullScreen = () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  return (
    <div
      ref={fullscreenRef}
      className={classNames(styles.editor, {
        [styles.editorHasTipTransform]: !isFullscreen,
      })}
    >
      {isFullscreen && (
        <div className={styles.title}>
          <div className={styles.titleText} id="scriptIdInput">
            <Space>
              <div className={styles.titleInput}>{name}</div>
              {tooltip && (
                <Tooltip
                  placement={'bottomLeft'}
                  title={tooltip}
                  getPopupContainer={() =>
                    document.getElementById('scriptIdInput') as HTMLDivElement
                  }
                >
                  <QuestionCircleOutlined />
                </Tooltip>
              )}
            </Space>
          </div>
          <Button
            type="link"
            size="small"
            icon={<FullscreenExitOutlined />}
            onClick={handleFullScreen}
            className={styles.toolButton}
          >
            取消全屏{' '}
          </Button>
        </div>
      )}

      <div className={styles.content}>
        <div
          className={classNames(
            { [styles.fullscreenWorkspace]: isFullscreen },
            { [styles.normalWorkspace]: !isFullscreen },
          )}
        >
          <div className={styles.toolbar}>
            <Space>
              <Button
                type="link"
                icon={<img src={undoIcon as any} style={{ width: 14 }} />}
                size="small"
                onClick={undo}
                className={styles.toolButton}
              >
                撤销
              </Button>

              <Button
                type="link"
                size="small"
                onClick={redo}
                className={styles.toolButton}
                icon={<img src={redoIcon as any} style={{ width: 14 }} />}
              >
                重做
              </Button>
            </Space>
            {!isFullscreen && (
              <Button
                icon={<FullscreenOutlined />}
                type="link"
                size="small"
                onClick={handleFullScreen}
                className={styles.toolButton}
              >
                全屏
              </Button>
            )}
          </div>
          <div
            ref={editorRef}
            className={classNames(styles.code, {
              [styles.fullscreenCode]: isFullscreen,
            })}
          />
        </div>

        {isFullscreen && (
          <div className={styles.rightConfig}>
            <div className={styles.titleText}>输入输出</div>
          </div>
        )}
      </div>

      {isFullscreen && (
        <div className={styles.footer}>
          <Space size="middle">
            <Button type="primary" size="small">
              保存并退出
            </Button>
            <Button size="small">保存配置</Button>
          </Space>
        </div>
      )}
    </div>
  );
};
