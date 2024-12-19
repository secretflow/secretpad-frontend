import {
  FullscreenOutlined,
  FullscreenExitOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useFullscreen } from 'ahooks';
import { Button, Flex, message, Space, Tooltip } from 'antd';
import classNames from 'classnames';
import * as Monaco from 'monaco-editor';
import { language as sqlLanguage } from 'monaco-editor/esm/vs/basic-languages/sql/sql';
import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import { format } from 'sql-formatter';

import formatIcon from '@/assets/format.svg';
import redoIcon from '@/assets/redo.svg';
import undoIcon from '@/assets/undo.svg';
import type { RenderProp } from '@/modules/component-config/config-item-render/config-render-protocol';
import { OutputFeatureContent } from '@/modules/component-config/config-item-render/custom-render/upstream-feature-render/output-feature-show';

import styles from './index.less';

interface SqlEditorProps {
  value: string;
  onChange: (val: string) => void;
  config: RenderProp<string>;
  onSaveConfig: () => void;
  disabled?: boolean;
  name?: string;
  tooltip?: string;
}

export const ScqlEditorCore: FC<SqlEditorProps> = (props) => {
  const {
    value = '',
    onChange,
    disabled = false,
    name,
    tooltip,
    config,
    onSaveConfig,
  } = props;
  const editorRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef(null);
  const monacoSuggestion = useRef<any>(null);
  const [isFullscreen, { enterFullscreen, exitFullscreen }] =
    useFullscreen(fullscreenRef);
  const editor = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleValueChange = () => {
    editor?.current?.onDidChangeModelContent(() => {
      const editedValue = editor?.current?.getValue();
      onChange(editedValue || '');
    });
  };

  useEffect(() => {
    if (editor.current?.getValue() !== value) {
      editor.current?.setValue(value || '');
    }
  }, [value]);

  const initEditor = () => {
    if (editorRef?.current) {
      const monacoEditor = Monaco.editor.create(editorRef?.current, {
        language: 'sql',
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
        quickSuggestions: true,
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
        'sql',
        {
          provideCompletionItems() {
            const suggestions: any[] = [];
            sqlLanguage.keywords.forEach((item: any) => {
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

  const formatCode = () => {
    if (editor && editor?.current) {
      const model = editor.current.getModel();
      if (!model) return;
      const selection = editor.current.getSelection();
      const hasSelection = selection && !selection.isEmpty();

      const selectCodeText = hasSelection
        ? model.getValueInRange(selection)
        : model.getValue();

      const formatRange = hasSelection ? selection : model.getFullModelRange();

      const formatSqlText = format(selectCodeText, {
        language: 'mysql',
      });

      editor.current.executeEdits('', [
        {
          range: formatRange,
          text: formatSqlText,
        },
      ]);
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
            取消全屏
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
            <Flex>
              <Button
                type="link"
                icon={<img src={undoIcon} style={{ width: 14 }} />}
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
                icon={<img src={redoIcon} style={{ width: 14 }} />}
              >
                重做
              </Button>

              <Button
                type="link"
                size="small"
                onClick={formatCode}
                className={styles.toolButton}
                icon={<img src={formatIcon} style={{ width: 14 }} />}
              >
                格式化
              </Button>
            </Flex>
            {!isFullscreen && (
              <Button
                icon={<FullscreenOutlined />}
                type="link"
                size="small"
                onClick={handleFullScreen}
                className={classNames(styles.toolButton, {
                  [styles.isNotFullScreenBtnClick]: !isFullscreen,
                })}
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
            <div className={styles.titleText}>输入</div>
            <OutputFeatureContent
              sheets={config?.form?.getFieldsValue('column_config')?.column_config}
              isFullScreen={isFullscreen}
            />
          </div>
        )}
      </div>

      {isFullscreen && (
        <div className={styles.footer}>
          <Space size="middle">
            <Button
              type="primary"
              size="small"
              onClick={() => {
                config?.form &&
                  config?.form.validateFields().then(
                    async () => {
                      onSaveConfig();
                    },
                    (error) => {
                      message.config({
                        getContainer: () => {
                          return document.getElementById(
                            'scriptIdInput',
                          ) as HTMLElement;
                        },
                      });
                      const msg = error?.errorFields?.[0]?.errors?.[0] || '';
                      message.warning(msg);
                    },
                  );
              }}
            >
              保存并退出
            </Button>
            <Button size="small">保存配置</Button>
          </Space>
        </div>
      )}
    </div>
  );
};
