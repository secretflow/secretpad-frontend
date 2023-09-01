import { Switch, InputNumber, Input, Select, Form } from 'antd';

import type { AtomicConfigNode } from '../component-config-protocol';
import styles from '../index.less';
import { typeListMap, getValueBound } from '../utils';

import type { RenderProp } from './config-render-protocol';

export const DefaultSwitch: React.FC<RenderProp<boolean>> = (config) => {
  const { node, onChange, defaultVal, translation } = config;

  return (
    <Form.Item
      label={
        <div className={styles.configItemLabel}>
          {translation[node.name] || node.name}
        </div>
      }
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
      labelCol={{ span: 20 }}
      colon={false}
      wrapperCol={{ span: 4 }}
      valuePropName="checked"
      messageVariables={{ label: translation[node.name] || node.name }}
    >
      <Switch onChange={(checked: boolean) => onChange(checked)} />
    </Form.Item>
  );
};

export const DefaultInputNumber: React.FC<RenderProp<number>> = (config) => {
  const { node, onChange, value, defaultVal, translation } = config;
  const { minVal, maxVal } = getValueBound(node);
  return (
    <Form.Item
      label={
        <div className={styles.configItemLabel}>
          {translation[node.name] || node.name}
        </div>
      }
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
      <InputNumber
        value={value}
        max={maxVal}
        min={minVal}
        onChange={(val) => {
          onChange(val);
        }}
      />
    </Form.Item>
  );
};

export const DefaultInput: React.FC<RenderProp<string>> = (config) => {
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
      <Input
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
    </Form.Item>
  );
};

export const DefaultSelect: React.FC<RenderProp<string>> = (config) => {
  const { node, onChange, value, defaultVal, translation } = config;
  const { allowed_values: allowedValues, type } = node;

  if (!allowedValues) return <></>;

  const options = allowedValues[typeListMap[type]]?.map(
    (i: string | number | boolean) => ({
      value: i,
      label: i,
    }),
  );

  return (
    <Form.Item
      label={
        <div className={styles.configItemLabel}>
          {translation[node.name] || node.name}
        </div>
      }
      name={
        node.prefixes && node.prefixes.length > 0
          ? node.prefixes.join('/') + '/' + node.name
          : node.name
      }
      tooltip={translation[node.docString] || node.docString}
      rules={[
        {
          required: (node as AtomicConfigNode).isRequired,
        },
      ]}
      initialValue={defaultVal}
      colon={false}
      messageVariables={{ label: translation[node.name] || node.name }}
    >
      <Select
        value={value}
        options={options}
        onChange={(val) => {
          onChange(val);
        }}
      />
    </Form.Item>
  );
};
