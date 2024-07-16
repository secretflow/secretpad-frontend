import { InputNumber, Input, Select, Form } from 'antd';
import { useState, useEffect } from 'react';

import type { AtomicConfigNode } from '../component-config-protocol';
import styles from '../index.less';
import { typeListMap, getValueBound } from '../utils';

import type { RenderProp } from './config-render-protocol';
import { getComponentByRenderStrategy } from './helper';

const BooleanSelect = ({
  // 强制保持受控逻辑
  value = false,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) => (
  <Select
    value={value}
    onChange={onChange}
    options={[
      {
        label: '是',
        value: true,
      },
      {
        label: '否',
        value: false,
      },
    ]}
  />
);

export const DefaultSwitch: React.FC<RenderProp<boolean>> = (config) => {
  const { node, translation, onChange, form, componentConfig, attrConfig } = config;
  const { prefixes } = node;

  const isNoWrap = !!attrConfig?.style?.noWrap;

  const fieldName =
    node.prefixes && node.prefixes.length > 0
      ? node.prefixes.join('/') + '/' + node.name
      : node.name;

  const value = Form.useWatch(fieldName, form);

  const item = (
    <Form.Item
      label={
        <div className={styles.configItemLabel}>
          {translation[node.name] || node.name}
        </div>
      }
      labelCol={isNoWrap ? { span: 12 } : undefined}
      name={fieldName}
      tooltip={translation[node.docString] || node.docString}
      rules={[
        {
          required: node.isRequired,
        },
      ]}
      colon={false}
      messageVariables={{ label: translation[node.name] || node.name }}
    >
      <BooleanSelect value={value} onChange={onChange} />
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
  const {
    node,
    onChange,
    value,
    defaultVal,
    translation,
    componentConfig,
    form,
    attrConfig,
  } = config;
  const { type, prefixes } = node;

  const {
    minVal,
    maxVal,
    maxInclusive = false,
    minInclusive = false,
  } = getValueBound(node);

  const isNoWrap = !!attrConfig?.style?.noWrap;
  const item = (
    <Form.Item
      label={
        <div className={styles.configItemLabel}>
          {translation[node.name] || node.name}
        </div>
      }
      labelCol={isNoWrap ? { span: 12 } : undefined}
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
            let errorText = '取值应该';
            if (value === null || value === undefined) return Promise.resolve();
            if (minVal !== null && minVal !== undefined) {
              if (minInclusive) {
                errorText += `大于等于${minVal}`;
              } else {
                errorText +=
                  (errorText.replace('取值应该', '') ? `且` : '') + `大于${minVal}`;
              }
            }

            if (maxVal !== null && maxVal !== undefined) {
              if (maxInclusive) {
                errorText +=
                  (errorText.replace('取值应该', '') ? `且` : '') + `小于等于${maxVal}`;
              } else {
                errorText +=
                  (errorText.replace('取值应该', '') ? `且` : '') + `小于${maxVal}`;
              }
            }

            if (minVal !== null && minVal !== undefined) {
              if (minInclusive) {
                if (value < minVal) {
                  return Promise.reject(new Error(errorText));
                }
              } else {
                if (value <= minVal) {
                  return Promise.reject(new Error(errorText));
                }
              }
            }

            if (maxVal !== null && maxVal !== undefined) {
              if (maxInclusive) {
                if (value > maxVal) {
                  return Promise.reject(new Error(errorText));
                }
              } else {
                if (value >= maxVal) {
                  return Promise.reject(new Error(errorText));
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
  const {
    onChange,
    value,
    defaultVal,
    node,
    translation,
    componentConfig,
    form,
    attrConfig,
  } = config;

  let name = translation[node.name] || node.name;
  const { prefixes } = node;
  if (prefixes && prefixes[0] === 'input') {
    if (prefixes[1]) name = `${translation[prefixes[1]] || prefixes[1]} ${name}`;
  }

  const isNoWrap = !!attrConfig?.style?.noWrap;
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
      labelCol={isNoWrap ? { span: 12 } : undefined}
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
  const {
    node,
    onChange,
    value,
    defaultVal,
    translation,
    componentConfig,
    form,
    attrConfig,
  } = config;
  const {
    allowed_values: allowedValues,
    type,
    list_max_length_inclusive,
    list_min_length_inclusive,
    prefixes,
  } = node;
  let isMultiple = false;

  const isNoWrap = !!attrConfig?.style?.noWrap;
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
      labelCol={isNoWrap ? { span: 12 } : undefined}
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
  const { node, translation, form, componentConfig, attrConfig } = config;
  const name = translation[node.name] || node.name;
  const { prefixes, children, selectedName } = node;
  const isNoWrap = !!attrConfig?.style?.noWrap;
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
      labelCol={isNoWrap ? { span: 12 } : undefined}
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
  const { node, form, componentConfig, translation } = config;
  const { prefixes, name } = node;

  const item = (
    <div className={styles.configItemStructLabel}>{translation[name] || name}</div>
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
