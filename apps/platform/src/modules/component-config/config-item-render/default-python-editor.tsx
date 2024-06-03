import { Form } from 'antd';

import { PythonEditor } from '@/components/monaco-editor';

import styles from '../index.less';

import type { RenderProp } from './config-render-protocol';
import { getComponentByRenderStrategy } from './helper';

export const DefaultPythonEditor: React.FC<RenderProp<string>> = (config) => {
  const {
    onChange,
    value,
    node,
    translation,
    defaultVal,
    graphNode,
    form,
    componentConfig,
  } = config;

  let name = translation[node.name] || node.name;
  const { prefixes } = node;
  if (prefixes && prefixes[0] === 'input') {
    if (prefixes[1]) name = `${translation[prefixes[1]] || prefixes[1]} ${name}`;
  }

  const fieldName =
    node.prefixes && node.prefixes.length > 0
      ? node.prefixes.join('/') + '/' + node.name
      : node.name;

  const item = (
    <Form.Item
      label={<div className={styles.configItemLabel}>{name}</div>}
      name={fieldName}
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
      <PythonEditor
        onChange={onChange}
        value={value}
        name={name}
        tooltip={translation[node.docString] || node.docString}
        input={graphNode?.inputs}
        output={componentConfig?.outputs}
      />
    </Form.Item>
  );

  return getComponentByRenderStrategy({
    prefixes,
    componentConfig,
    component: item,
    form,
    type: node.type,
    name: node.name,
  });
};
