import { Switch, InputNumber, Input, Select, Form } from 'antd';
import { useState, useEffect } from 'react';

import type { AtomicConfigNode } from '../component-config-protocol';
import styles from '../index.less';
import { typeListMap, getValueBound } from '../utils';

import type { RenderProp } from './config-render-protocol';
import { getComponentByRenderStrategy } from './helper';

export const DefaultSwitch: React.FC<RenderProp<boolean>> = (config) => {
  const { node, onChange, defaultVal, translation, form, componentConfig } = config;
  const { prefixes } = node;

  const item = (
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

  return getComponentByRenderStrategy({
    prefixes,
    componentConfig,
    component: item,
    form,
    type: node.type,
    name: node.name,
  });
};

export const DefaultInputNumber: React.FC<RenderProp<number>> = (config) => {
  const { node, onChange, value, defaultVal, translation, componentConfig, form } =
    config;
  const { type, prefixes } = node;

  const {
    minVal,
    maxVal,
    maxInclusive = false,
    minInclusive = false,
  } = getValueBound(node);

  const item = (
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
          type: 'number',
          required: node.isRequired,
        },
        {
          validator: (_, value) => {
            if (value === null || value === undefined) return Promise.resolve();
            if (minVal !== null && minVal !== undefined) {
              if (minInclusive) {
                if (value < minVal)
                  return Promise.reject(new Error(`取值应该大于等于${minVal}`));
              } else {
                if (value <= minVal)
                  return Promise.reject(new Error(`取值应该大于${minVal}`));
              }
            }

            if (maxVal !== null && maxVal !== undefined) {
              if (maxInclusive) {
                if (value > maxVal) {
                  return Promise.reject(new Error(`取值应该小于等于${maxVal}`));
                }
              } else {
                if (value >= maxVal) {
                  return Promise.reject(new Error(`取值应该小于${maxVal}`));
                }
              }
            }
            return Promise.resolve();
          },
        },
      ]}
      initialValue={defaultVal}
      colon={false}
      messageVariables={{ label: translation[node.name] || node.name }}
    >
      <InputNumber
        value={value}
        onChange={(val) => {
          onChange(val);
        }}
        precision={type === 'AT_INT' ? 0 : undefined}
        min={minVal}
        max={maxVal}
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

export const DefaultInput: React.FC<RenderProp<string>> = (config) => {
  const { onChange, value, defaultVal, node, translation, componentConfig, form } =
    config;

  let name = translation[node.name] || node.name;
  const { prefixes } = node;
  if (prefixes && prefixes[0] === 'input') {
    if (prefixes[1]) name = `${translation[prefixes[1]] || prefixes[1]} ${name}`;
  }

  const item = (
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

  return getComponentByRenderStrategy({
    prefixes,
    componentConfig,
    component: item,
    form,
    type: node.type,
    name: node.name,
  });
};

export const DefaultSelect: React.FC<RenderProp<string>> = (config) => {
  const { node, onChange, value, defaultVal, translation, componentConfig, form } =
    config;
  const {
    allowed_values: allowedValues,
    type,
    list_max_length_inclusive,
    list_min_length_inclusive,
    prefixes,
  } = node;
  let isMultiple = false;
  if (['AT_STRINGS', 'AT_INTS', 'AT_FLOATS', 'AT_BOOLS'].includes(type)) {
    isMultiple = true;

    if (list_max_length_inclusive === 1) isMultiple = false;
  }

  if (!allowedValues) return <></>;

  const [selectOptions, setSelectOptions] = useState<
    {
      value: string | number | boolean;
      label: string | number | boolean;
      disabled?: boolean;
    }[]
  >([]);

  useEffect(() => {
    const options = allowedValues[typeListMap[type]]?.map(
      (i: string | number | boolean) => ({
        value: i,
        label: i,
      }),
    );
    setSelectOptions(options || []);
  }, [allowedValues]);

  const item = (
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
        {
          validator(_, value) {
            if (value) {
              if (Array.isArray(value) && list_min_length_inclusive) {
                return value.length < list_min_length_inclusive
                  ? Promise.reject(`至少选择${list_min_length_inclusive}项`)
                  : Promise.resolve();
              } else if (list_min_length_inclusive) {
                return list_min_length_inclusive <= 1
                  ? Promise.resolve()
                  : Promise.reject(`至少选择${list_min_length_inclusive}项`);
              }
            }

            return Promise.resolve();
          },
        },
      ]}
      initialValue={isMultiple && defaultVal === undefined ? [] : defaultVal}
      colon={false}
      messageVariables={{ label: translation[node.name] || node.name }}
    >
      <Select
        mode={isMultiple ? 'multiple' : undefined}
        options={selectOptions}
        onChange={(val) => {
          onChange(val);
          if (list_max_length_inclusive) {
            setSelectOptions(
              selectOptions.map((item) => {
                return {
                  ...item,
                  disabled:
                    val.length >= list_max_length_inclusive &&
                    !val.includes(item.value),
                };
              }),
            );
          }
        }}
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

export const DefaultUnion: React.FC<RenderProp<string>> = (config) => {
  const { node, translation, form, componentConfig } = config;
  const name = translation[node.name] || node.name;
  const { prefixes, children, selectedName } = node;

  const options = children
    .filter((child) => {
      return child.prefixes[child.prefixes.length - 1] === node.name;
    })
    .map((i) => ({
      label: translation[i.name] || i.name,
      value: i.name,
    }));

  const item = (
    <Form.Item
      name={
        node.prefixes && node.prefixes.length > 0
          ? node.prefixes.join('/') + '/' + node.name
          : node.name
      }
      rules={[
        {
          required: node.isRequired,
        },
      ]}
      label={<div className={styles.configItemLabel}>{name}</div>}
      tooltip={translation[node.docString] || node.docString}
      initialValue={selectedName}
    >
      <Select options={options}></Select>
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

export const DefaultStruct: React.FC<RenderProp<string>> = (config) => {
  const { node, form, componentConfig } = config;
  const { prefixes, name } = node;

  // 在目前的策略中，Struct 节点默认不渲染。
  const item = <div className={styles.configItemStructLabel}>{name}</div>;

  return getComponentByRenderStrategy({
    prefixes,
    componentConfig,
    component: item,
    form,
    type: node.type,
    name,
  });
};

export const DefaultEmpty: React.FC<RenderProp<string>> = (config) => {
  const { node, form, componentConfig } = config;
  const { prefixes, name } = node;

  // 默认不渲染。
  const item = (
    <Form.Item
      style={{ display: 'none' }}
      name={
        node.prefixes && node.prefixes.length > 0
          ? node.prefixes.join('/') + '/' + node.name
          : node.name
      }
    >
      <></>
    </Form.Item>
  );

  return getComponentByRenderStrategy({
    prefixes,
    componentConfig,
    component: item,
    form,
    type: node.type,
    name,
  });
};
