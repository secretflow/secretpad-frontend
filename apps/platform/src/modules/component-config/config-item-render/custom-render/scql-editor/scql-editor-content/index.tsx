import { Form } from 'antd';

import type { RenderProp } from '@/modules/component-config/config-item-render/config-render-protocol';

import { ScqlEditorCore } from './code-editor';
import styles from './index.less';

const SELECT_REGEX = /SELECT[\s\S]*?(?=;|$)/gi; // 捕获 SELECT 语句直到分号结束

export const AnalyzeSQLEditor: React.FC<RenderProp<string>> = (config) => {
  const {
    form,
    onChange,
    value,
    defaultVal,
    node,
    translation,
    disabled,
    onSaveConfig,
  } = config;
  let name = translation[node.name] || node.name;
  const { prefixes } = node;
  if (prefixes && prefixes[0] === 'input') {
    if (prefixes[1]) name = `${translation[prefixes[1]] || prefixes[1]} ${name}`;
  }

  // 保存配置
  const saveConfig = () => {
    if (form && onSaveConfig) {
      onSaveConfig(form.getFieldsValue());
    }
  };

  return (
    <Form.Item noStyle>
      <Form.Item
        label={<div className={styles.configItemLabel}>{name}</div>}
        name={
          node.prefixes && node.prefixes.length > 0
            ? node.prefixes.join('/') + '/' + node.name
            : node.name
        }
        tooltip={
          node.docString ? translation[node.docString] || node.docString : undefined
        }
        rules={[
          {
            required: node.isRequired,
          },
          {
            validator: (_, codeText: string) => {
              if (!codeText) {
                return Promise.reject(new Error(''));
              }
              const selectStatements = codeText.match(SELECT_REGEX);
              if (!selectStatements) {
                return Promise.reject(new Error('必须有一个 SELECT 语句'));
              }
              if (selectStatements.length > 1) {
                return Promise.reject('每个组件只允许写一个 SELECT 语句');
              }
              return Promise.resolve();
            },
          },
        ]}
        initialValue={defaultVal}
        colon={false}
        messageVariables={{ label: translation[node.name] || node.name }}
      >
        <ScqlEditorCore
          tooltip="select ta.age, avg(tb.income) from alice.tbl as ta join bob.tbl as tb on ta.id=tb.id group by ta.age"
          name="输入SQL"
          value={value}
          onChange={onChange}
          disabled={disabled}
          config={config}
          onSaveConfig={saveConfig}
        />
      </Form.Item>
    </Form.Item>
  );
};
